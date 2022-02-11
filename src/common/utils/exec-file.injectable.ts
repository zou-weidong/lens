/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { execFile, ExecFileOptions } from "child_process";
import { promisify } from "util";

export interface ExecOutput {
  stdout: string;
  stderr: string;
}

export type ExtendedExecFileOptions<StdoutOnly extends boolean> = ExecFileOptions & (
  StdoutOnly extends false
    ? {
      stdoutOnly?: false;
    }
    : {
      stdoutOnly: true;
    }
);

export interface ExecFile {
  (file: string, args: readonly string[], opts?: ExtendedExecFileOptions<false>): Promise<ExecOutput>;
  (file: string, args: readonly string[], opts?: ExtendedExecFileOptions<true>): Promise<string>;
}

const promiseExecFile = promisify(execFile);

const execFileInjectable = getInjectable({
  id: "exec-file",
  instantiate: () => (async (file, args, opts) => {
    const { stdoutOnly = false, ...restOpts } = opts ?? {};

    if (stdoutOnly) {
      const { stdout } = await promiseExecFile(file, args, restOpts);

      return stdout;
    }

    return promiseExecFile(file, args, restOpts);
  }) as ExecFile,
  causesSideEffects: true,
});

export default execFileInjectable;
