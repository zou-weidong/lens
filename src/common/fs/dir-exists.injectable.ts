/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lowerFirst } from "lodash/fp";
import type { LensLogger } from "../logger";
import { baseLoggerInjectionToken } from "../logger/base-logger.token";
import type { Stat } from "./stat.injectable";
import statInjectable from "./stat.injectable";
import { userReadableFileType } from "./user-readable-file-type";

/**
 * Validate that `dirPath` currently points to a directory or is a symlink to a directory.
 * If so return `true`; otherwise, return a user readable error message string for displaying.
 * @param dirPath The path to be validated
 */
export type DirExists = (dirPath: string) => Promise<string | true>;

interface Dependencies {
  stat: Stat;
  logger: LensLogger;
}

const dirExists = ({
  stat,
  logger,
}: Dependencies): DirExists => (
  async (dirPath) => {
    try {
      const stats = await stat(dirPath);

      if (stats.isDirectory()) {
        return true;
      }

      return `the provided path is ${userReadableFileType(stats)} and not a directory.`;
    } catch (error) {
      switch (error?.code) {
        case "ENOENT":
          return `the provided path does not exist.`;
        case "EACCES":
          return `search permissions is denied for one of the directories in the prefix of the provided path.`;
        case "ELOOP":
          return `the provided path is a sym-link which points to a chain of sym-links that is too long to resolve. Perhaps it is cyclic.`;
        case "ENAMETOOLONG":
          return `the pathname is too long to be used.`;
        case "ENOTDIR":
          return `a prefix of the provided path is not a directory.`;
        default:
          logger.warn(`unexpected error in validateDirectory for resolved path=${dirPath}`, error);

          return error
            ? lowerFirst(String(error))
            : "of an unknown error, please try again.";
      }
    }
  }
);

const dirExistsInjectable = getInjectable({
  instantiate: (di) => dirExists({
    stat: di.inject(statInjectable),
    logger: di.inject(baseLoggerInjectionToken),
  }),
  id: "dir-exists",
});

export default dirExistsInjectable;
