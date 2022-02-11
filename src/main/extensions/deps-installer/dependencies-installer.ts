/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import AwaitLock from "await-lock";
import fs from "fs-extra";
import path from "path";
import type { LensLogger } from "../../../common/logger";
import { promiseExecFile } from "../../../common/utils";

interface Dependencies {
  readonly directoryForUserDataInjectable: string;
  readonly logger: LensLogger;
}

/**
 * Installs dependencies for extensions
 */
export class ExtensionInstaller {
  private installLock = new AwaitLock();

  constructor(private dependencies: Dependencies) {}

  private readonly npmPath = __non_webpack_require__.resolve("npm/bin/npm-cli");

  /**
   * Write package.json to the file system and execute npm install for it.
   */
  async installDependencies(packagePath: string, dependencies: Record<string, string>): Promise<void>  {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      // Write the package.json which will be installed in .installDependencies()
      await fs.writeFile(path.join(packagePath), JSON.stringify({ dependencies }, null, 2), {
        mode: 0o600,
      });

      this.dependencies.logger.info(`installing dependencies at ${this.dependencies.directoryForUserDataInjectable}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock"]);
      this.dependencies.logger.info(`dependencies installed at ${this.dependencies.directoryForUserDataInjectable}`);
    } finally {
      this.installLock.release();
    }
  }

  /**
   * Install single package using npm
   */
  async installDependency(name: string): Promise<void>  {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      this.dependencies.logger.info(`installing package from ${name} to ${this.dependencies.directoryForUserDataInjectable}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock", "--no-save", name]);
      this.dependencies.logger.info(`package ${name} installed to ${this.dependencies.directoryForUserDataInjectable}`);
    } finally {
      this.installLock.release();
    }
  }

  private async npm(args: string[]): Promise<void> {
    try {
      await promiseExecFile(this.npmPath, args, {
        cwd: this.dependencies.directoryForUserDataInjectable,
        env: {},
        maxBuffer: 16*1024*1024, // 16MB
      });
    } catch (error) {
      if (error.stderr) {
        throw new Error(error.stderr);
      }

      throw error;
    }
  }
}
