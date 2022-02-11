/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { promiseExecFile } from "../../common/utils/promise-exec";
import type { BaseEncodingOptions } from "fs";
import type { ExecFileOptions } from "child_process";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/di-legacy-globals/setup";
import bundledHelmBinaryPathInjectable from "../../common/vars/bundled-helm-binary.injectable";

/**
 * ExecFile the bundled helm CLI
 * @returns STDOUT
 */
export async function execHelm(args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> {
  try {
    const { stdout } = await promiseExecFile(getLegacyGlobalDiForExtensionApi().inject(bundledHelmBinaryPathInjectable), args, options);

    return stdout;
  } catch (error) {
    throw error?.stderr || error;
  }
}
