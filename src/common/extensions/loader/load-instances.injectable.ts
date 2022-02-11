/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observe } from "mobx";
import type { LensExtension } from "../../../extensions/lens-extension";
import type { Disposer } from "../../utils";
import installedExtensionsInjectable, { InstalledExtensions } from "../installed.injectable";
import onInstalledExtensionsAddInjectable, { OnInstalledExtensionsAdd } from "./on-install-add.injectable";
import onInstalledExtensionsDeleteInjectable, { OnInstalledExtensionsDelete } from "./on-install-delete.injectable";

export type LoadInstances = (register: RegisterExtension) => void;
/**
 * NOTE: remove this once DI is finished
 */
export type RegisterExtension = (ext: LensExtension) => Promise<Disposer>;

interface Dependencies {
  installedExtensions: InstalledExtensions;
  onInstalledExtensionsAdd: OnInstalledExtensionsAdd;
  onInstalledExtensionsDelete: OnInstalledExtensionsDelete;
}

const loadInstances = ({
  installedExtensions,
  onInstalledExtensionsAdd,
  onInstalledExtensionsDelete,
}: Dependencies): LoadInstances => (
  (register) => {
    observe(installedExtensions, (change) => {
      switch (change.type) {
        case "add":
          onInstalledExtensionsAdd(change.newValue, register);
          break;
        case "delete":
          onInstalledExtensionsDelete(change.oldValue);
          break;
        case "update":
          throw new Error("Directly updating installed extensions is not supported");
      }
    });
  }
);

const loadInstancesInjectable = getInjectable({
  instantiate: (di) => loadInstances({
    installedExtensions: di.inject(installedExtensionsInjectable),
    onInstalledExtensionsAdd: di.inject(onInstalledExtensionsAddInjectable),
    onInstalledExtensionsDelete: di.inject(onInstalledExtensionsDeleteInjectable),
  }),
  id: "load-instances",
});

export default loadInstancesInjectable;
