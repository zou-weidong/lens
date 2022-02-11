/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Stats, constants } from "fs";
import type stream from "stream";
import type { CreateReadStream } from "../../../../common/fs/create-read-stream.injectable";
import createReadStreamInjectable from "../../../../common/fs/create-read-stream.injectable";
import type { LensLogger } from "../../../../common/logger";
import { bytesToUnits, Disposer, noop } from "../../../../common/utils";
import type { ComputeDiff, RootSource } from "./compute-diff.injectable";
import computeDiffInjectable from "./compute-diff.injectable";
import kubeconfigSyncManagerLoggerInjectable from "./logger.injectable";

export interface DiffChangedConfigArgs {
  filePath: string;
  source: RootSource;
  stats: Stats;
  maxAllowedFileReadSize: number;
}
export type DiffChangedConfig = (args: DiffChangedConfigArgs) => Disposer;

interface Dependencies {
  logger: LensLogger;
  createReadStream: CreateReadStream;
  computeDiff: ComputeDiff;
}

const diffChangedConfig = ({
  logger,
  createReadStream,
  computeDiff,
}: Dependencies): DiffChangedConfig => (
  ({ filePath, source, stats, maxAllowedFileReadSize }: DiffChangedConfigArgs): Disposer =>  {
    logger.debug(`file changed`, { filePath });

    if (stats.size >= maxAllowedFileReadSize) {
      logger.warn(`skipping ${filePath}: size=${bytesToUnits(stats.size)} is larger than maxSize=${bytesToUnits(maxAllowedFileReadSize)}`);
      source.clear();

      return noop;
    }

    // TODO: replace with an AbortController with fs.readFile when we upgrade to Node 16 (after it comes out)
    const fileReader = createReadStream(filePath, {
      mode: constants.O_RDONLY,
    });
    const readStream: stream.Readable = fileReader;
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let fileString = "";
    let closed = false;

    const cleanup = () => {
      closed = true;
      fileReader.close(); // This may not close the stream.

      // Artificially marking end-of-stream, as if the underlying resource had
      // indicated end-of-file by itself, allows the stream to close.
      // This does not cancel pending read operations, and if there is such an
      // operation, the process may still not be able to exit successfully
      // until it finishes.
      fileReader.push(null);
      fileReader.read(0);
      readStream.removeAllListeners();
    };

    readStream
      .on("data", (chunk: Buffer) => {
        try {
          fileString += decoder.decode(chunk, { stream: true });
        } catch (error) {
          logger.warn(`skipping ${filePath}: ${error}`);
          source.clear();
          cleanup();
        }
      })
      .on("close", () => cleanup())
      .on("error", error => {
        cleanup();
        logger.warn(`failed to read file: ${error}`, { filePath });
      })
      .on("end", () => {
        if (!closed) {
          computeDiff(fileString, source, filePath);
        }
      });

    return cleanup;
  }
);

const diffChangedConfigInjectable = getInjectable({
  instantiate: (di) => diffChangedConfig({
    logger: di.inject(kubeconfigSyncManagerLoggerInjectable),
    computeDiff: di.inject(computeDiffInjectable),
    createReadStream: di.inject(createReadStreamInjectable),
  }),
  id: "diff-changed-config",
});

export default diffChangedConfigInjectable;
