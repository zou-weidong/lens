/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CheckedUninstallExtension } from "./checked-uninstall-extension.injectable";
import checkedUninstallExtensionInjectable from "./checked-uninstall-extension.injectable";
import React from "react";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";
import { extensionDisplayName } from "../../../extensions/lens-extension";
import type { Confirm } from "../confirm-dialog/confirm.injectable";
import confirmInjectable from "../confirm-dialog/confirm.injectable";

export type ConfirmUninstallExtension = (extension: InstalledExtension) => Promise<void>;

interface Dependencies {
  checkedUninstallExtension: CheckedUninstallExtension;
  confirm: Confirm;
}

const confirmUninstallExtension = ({
  checkedUninstallExtension,
  confirm,
}: Dependencies): ConfirmUninstallExtension => (
  async (extension) => {
    const displayName = extensionDisplayName(
      extension.manifest.name,
      extension.manifest.version,
    );
    const confirmed = await confirm({
      message: (
        <p>
          Are you sure you want to uninstall extension <b>{displayName}</b>?
        </p>
      ),
      labelOk: "Yes",
      labelCancel: "No",
    });

    if (confirmed) {
      await checkedUninstallExtension(extension.id);
    }
  }
);

const confirmUninstallExtensionInjectable = getInjectable({
  instantiate: (di) => confirmUninstallExtension({
    checkedUninstallExtension: di.inject(checkedUninstallExtensionInjectable),
    confirm: di.inject(confirmInjectable),
  }),
  id: "confirm-uninstall-extension",
});

export default confirmUninstallExtensionInjectable;
