/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageFromError } from "../get-message-from-error";
import path from "path";
import React from "react";
import type { WriteFile } from "../../../../common/fs/write-file.injectable";
import type { ErrorNotification } from "../../notifications/error.injectable";
import type { LensLogger } from "../../../../common/logger";
import { getInjectable } from "@ogre-tools/injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import extensionsPageLoggerInjectable from "../logger.injectable";
import extensionsNodeModulesDirectoryInjectable from "../../../../common/paths/node-modules.injectable";
import tmpDirInjectable from "../../../../common/vars/tmp-dir.injectable";
import writeFileInjectable from "../../../../common/fs/write-file.injectable";
import type { ValidatePackage } from "./validate-package.injectable";
import validatePackageInjectable from "./validate-package.injectable";
import type { LensExtensionId, LensExtensionManifest } from "../../../../common/extensions/manifest";
import type { InstallRequest } from "./attempt-install.injectable";

export interface InstallRequestValidated {
  fileName: string;
  data: Buffer;
  id: LensExtensionId;
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

export type CreateTempFilesAndValidate = (req: InstallRequest) => Promise<InstallRequestValidated | null>;

interface Dependencies {
  extensionsNodeModulesDirectory: string;
  tmpDir: string;
  writeFile: WriteFile;
  errorNotification: ErrorNotification;
  logger: LensLogger;
  validatePackage: ValidatePackage;
}

const createTempFilesAndValidate = ({
  extensionsNodeModulesDirectory,
  tmpDir,
  writeFile,
  errorNotification,
  logger,
  validatePackage,
}: Dependencies): CreateTempFilesAndValidate => (
  async ({ fileName, dataP }) => {
    try {
      // validate packages
      const tempFile = path.join(tmpDir, "lens-extensions", fileName);

      const data = await dataP;

      if (!data) {
        return null;
      }

      await writeFile(tempFile, data);
      const manifest = await validatePackage(tempFile);
      const id = path.join(
        extensionsNodeModulesDirectory,
        manifest.name,
        "package.json",
      );

      return {
        fileName,
        data,
        manifest,
        tempFile,
        id,
      };
    } catch (error) {
      logger.info(`installing ${fileName} has failed`, error);
      errorNotification(
        <div className="flex column gaps">
          <p>
            Installing <em>{fileName}</em> has failed, skipping.
          </p>
          <p>
            Reason: <em>{getMessageFromError(error)}</em>
          </p>
        </div>,
      );
    }

    return null;
  }
);

const createTempFilesAndValidateInjectable = getInjectable({
  instantiate: (di) => createTempFilesAndValidate({
    errorNotification: di.inject(errorNotificationInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
    extensionsNodeModulesDirectory: di.inject(extensionsNodeModulesDirectoryInjectable),
    tmpDir: di.inject(tmpDirInjectable),
    writeFile: di.inject(writeFileInjectable),
    validatePackage: di.inject(validatePackageInjectable),
  }),
  id: "create-temp-files-and-validate",
});

export default createTempFilesAndValidateInjectable;
