/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { InstallRequestValidated } from "./create-temp-files-and-validate.injectable";
import { Disposer, extractTar, noop } from "../../../../common/utils";
import { extensionDisplayName } from "../../../../extensions/lens-extension";
import { getMessageFromError } from "../get-message-from-error";
import path from "path";
import fse from "fs-extra";
import { IComputedValue, when } from "mobx";
import React from "react";
import type { OkNotification } from "../../notifications/ok.injectable";
import type { ErrorNotification } from "../../notifications/error.injectable";
import type { LensLogger } from "../../../../common/logger";
import getExtensionDestFolderInjectable from "./get-extension-dest-folder.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import extensionsPageLoggerInjectable from "../logger.injectable";
import okNotificationInjectable from "../../notifications/ok.injectable";
import type { ExtensionInstallationStateManager } from "../../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../../common/extensions/installation-state/manager.injectable";
import enabledUserExtensionIdsInjectable from "../../../../common/extensions/enabled-user-extension-ids.injectable";
import type { SetExtensionEnabled } from "../../../../common/extensions/preferences/set-enabled.injectable";
import setExtensionEnabledInjectable from "../../../../common/extensions/preferences/set-enabled.injectable";

export type UnpackExtension = (request: InstallRequestValidated, disposeDownloading?: Disposer) => Promise<void>;

interface Dependencies {
  enabledUserExtensionIds: IComputedValue<Set<string>>;
  getExtensionDestFolder: (name: string) => string;
  installStateStore: ExtensionInstallationStateManager;
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  logger: LensLogger;
  setExtensionEnabled: SetExtensionEnabled;
}

const unpackExtension = ({
  enabledUserExtensionIds,
  getExtensionDestFolder,
  installStateStore,
  okNotification,
  errorNotification,
  setExtensionEnabled,
  logger,
}: Dependencies): UnpackExtension => (
  async (request, disposeDownloading) => {
    const {
      id,
      fileName,
      tempFile,
      manifest: { name, version },
    } = request;

    installStateStore.setInstalling(id);
    disposeDownloading?.();

    const displayName = extensionDisplayName(name, version);
    const extensionFolder = getExtensionDestFolder(name);
    const unpackingTempFolder = path.join(
      path.dirname(tempFile),
      `${path.basename(tempFile)}-unpacked`,
    );

    logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

    try {
      // extract to temp folder first
      await fse.remove(unpackingTempFolder).catch(noop);
      await fse.ensureDir(unpackingTempFolder);
      await extractTar(tempFile, { cwd: unpackingTempFolder });

      // move contents to extensions folder
      const unpackedFiles = await fse.readdir(unpackingTempFolder);
      let unpackedRootFolder = unpackingTempFolder;

      if (unpackedFiles.length === 1) {
        // check if %extension.tgz was packed with single top folder,
        // e.g. "npm pack %ext_name" downloads file with "package" root folder within tarball
        unpackedRootFolder = path.join(unpackingTempFolder, unpackedFiles[0]);
      }

      await fse.ensureDir(extensionFolder);
      await fse.move(unpackedRootFolder, extensionFolder, { overwrite: true });

      // wait for the loader has actually install it
      await when(() => enabledUserExtensionIds.get().has(id));

      // Enable installed extensions by default.
      setExtensionEnabled(id, true);

      okNotification(
        <p>
          Extension <b>{displayName}</b> successfully installed!
        </p>,
      );
    } catch (error) {
      const message = getMessageFromError(error);

      logger.info(`installing ${request.fileName} has failed`, error);
      errorNotification(
        <p>
            Installing extension <b>{displayName}</b> has failed: <em>{message}</em>
        </p>,
      );
    } finally {
      // Remove install state once finished
      installStateStore.clearInstalling(id);

      // clean up
      fse.remove(unpackingTempFolder).catch(noop);
      fse.unlink(tempFile).catch(noop);
    }
  }
);

const unpackExtensionInjectable = getInjectable({
  instantiate: (di) => unpackExtension({
    enabledUserExtensionIds: di.inject(enabledUserExtensionIdsInjectable),
    getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
    setExtensionEnabled: di.inject(setExtensionEnabledInjectable),
  }),
  id :"unpack-extension",
});

export default unpackExtensionInjectable;
