/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { disposer, ExtendableDisposer } from "../../../../common/utils";
import { Button } from "../../button";
import React from "react";
import { remove as removeDir } from "fs-extra";
import { shell } from "electron";
import type { ErrorNotification } from "../../notifications/error.injectable";
import type { InfoNotification } from "../../notifications/info.injectable";
import type { UnpackExtension } from "./unpack-extension.injectable";
import type { CreateTempFilesAndValidate } from "./create-temp-files-and-validate.injectable";
import type { GetExtensionDestFolder } from "./get-extension-dest-folder.injectable";
import type { CheckedUninstallExtension } from "../checked-uninstall-extension.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import unpackExtensionInjectable from "./unpack-extension.injectable";
import getExtensionDestFolderInjectable from "./get-extension-dest-folder.injectable";
import createTempFilesAndValidateInjectable from "./create-temp-files-and-validate.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import infoNotificationInjectable from "../../notifications/info.injectable";
import checkedUninstallExtensionInjectable from "../checked-uninstall-extension.injectable";
import { ExtensionInstallationState, ExtensionInstallationStateManager } from "../../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../../common/extensions/installation-state/manager.injectable";
import type { GetInstalledExtensionById } from "../../../../common/extensions/get-installed-by-id.injectable";
import getInstalledExtensionByIdInjectable from "../../../../common/extensions/get-installed-by-id.injectable";

export interface InstallRequest {
  fileName: string;
  dataP: Promise<Buffer | null>;
}

export type AttemptInstall = (request: InstallRequest, d?: ExtendableDisposer) => Promise<void>;

interface Dependencies {
  getInstalledExtensionById: GetInstalledExtensionById;
  checkedUninstallExtension: CheckedUninstallExtension;
  unpackExtension: UnpackExtension;
  createTempFilesAndValidate: CreateTempFilesAndValidate;
  getExtensionDestFolder: GetExtensionDestFolder;
  installStateStore: ExtensionInstallationStateManager;
  infoNotification: InfoNotification;
  errorNotification: ErrorNotification;
}

const attemptInstall = ({
  getInstalledExtensionById,
  checkedUninstallExtension,
  unpackExtension,
  createTempFilesAndValidate,
  getExtensionDestFolder,
  installStateStore,
  infoNotification,
  errorNotification,
}: Dependencies): AttemptInstall => (
  async (request, d) => {
    const dispose = disposer(
      installStateStore.startPreInstall(),
      d,
    );

    const validatedRequest = await createTempFilesAndValidate(request);

    if (!validatedRequest) {
      return dispose();
    }

    const { name, version, description } = validatedRequest.manifest;
    const curState = installStateStore.getInstallationState(
      validatedRequest.id,
    );

    if (curState !== ExtensionInstallationState.IDLE) {
      dispose();

      return void errorNotification(
        <div className="flex column gaps">
          <b>Extension Install Collision:</b>
          <p>
            The <em>{name}</em> extension is currently {curState.toLowerCase()}.
          </p>
          <p>Will not proceed with this current install request.</p>
        </div>,
      );
    }

    const extensionFolder = getExtensionDestFolder(name);
    const installedExtension = getInstalledExtensionById(validatedRequest.id);

    if (installedExtension) {
      const { version: oldVersion } = installedExtension.manifest;

      // confirm to uninstall old version before installing new version
      const removeNotification = infoNotification(
        <div className="InstallingExtensionNotification flex gaps align-center">
          <div className="flex column gaps">
            <p>
              Install extension{" "}
              <b>
                {name}@{version}
              </b>
              ?
            </p>
            <p>
              Description: <em>{description}</em>
            </p>
            <div
              className="remove-folder-warning"
              onClick={() => shell.openPath(extensionFolder)}
            >
              <b>Warning:</b> {name}@{oldVersion} will be removed before
              installation.
            </div>
          </div>
          <Button
            autoFocus
            label="Install"
            onClick={async () => {
              removeNotification();

              if (await checkedUninstallExtension(validatedRequest.id)) {
                await unpackExtension(validatedRequest, dispose);
              } else {
                dispose();
              }
            }}
          />
        </div>,
        {
          onClose: dispose,
        },
      );
    } else {
      // clean up old data if still around
      await removeDir(extensionFolder);

      // install extension if not yet exists
      await unpackExtension(validatedRequest, dispose);
    }
  }
);

const attemptInstallInjectable = getInjectable({
  instantiate: (di) => attemptInstall({
    getInstalledExtensionById: di.inject(getInstalledExtensionByIdInjectable),
    checkedUninstallExtension: di.inject(checkedUninstallExtensionInjectable),
    unpackExtension: di.inject(unpackExtensionInjectable),
    createTempFilesAndValidate: di.inject(createTempFilesAndValidateInjectable),
    getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    infoNotification: di.inject(infoNotificationInjectable),
  }),
  id: "attempt-install",
});

export default attemptInstallInjectable;
