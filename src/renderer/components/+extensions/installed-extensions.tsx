/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./installed-extensions.module.scss";
import React, { useMemo } from "react";
import { Icon } from "../icon";
import { List } from "../list/list";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "../spinner";
import { cssNames } from "../../utils";
import type { Row } from "react-table";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IObservableValue } from "mobx";
import { observable } from "mobx";
import isExtensionDiscoveryLoadedInjectable from "../../extensions/discovery-is-loaded.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";
import type { IsExtensionEnabled } from "../../../common/extensions/preferences/is-enabled.injectable";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";
import isExtensionEnabledInjectable from "../../../common/extensions/preferences/is-enabled.injectable";
import type { SetExtensionEnabled } from "../../../common/extensions/preferences/set-enabled.injectable";
import type { ConfirmUninstallExtension } from "./confirm-uninstall-extension.injectable";
import confirmUninstallExtensionInjectable from "./confirm-uninstall-extension.injectable";
import setExtensionEnabledInjectable from "../../../common/extensions/preferences/set-enabled.injectable";

export interface InstalledExtensionsProps {
  extensions: InstalledExtension[];
}

interface Dependencies {
  extensionInstallationStateStore: ExtensionInstallationStateManager;
  isExtensionDiscoveryLoaded: IObservableValue<boolean>;
  isExtensionEnabled: IsExtensionEnabled;
  setExtensionEnabled: SetExtensionEnabled;
  confirmUninstallExtension: ConfirmUninstallExtension;
}

const NonInjectedInstalledExtensions = observable(({
  extensionInstallationStateStore,
  isExtensionDiscoveryLoaded,
  extensions,
  setExtensionEnabled,
  confirmUninstallExtension,
  isExtensionEnabled,
}: Dependencies & InstalledExtensionsProps) => {
  const getStatus = (extension: InstalledExtension) => {
    if (!extension.isCompatible) {
      return "Incompatible";
    }

    return isExtensionEnabled(extension) ? "Enabled" : "Disabled";
  };
  const filters = [
    (extension: InstalledExtension) => extension.manifest.name,
    (extension: InstalledExtension) => getStatus(extension),
    (extension: InstalledExtension) => extension.manifest.version.raw,
  ];

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "extension",
        width: 200,
        sortType: (rowA: Row, rowB: Row) => { // Custom sorting for extension name
          const nameA = extensions[rowA.index].manifest.name;
          const nameB = extensions[rowB.index].manifest.name;

          if (nameA > nameB) return -1;
          if (nameB > nameA) return 1;

          return 0;
        },
      },
      {
        Header: "Version",
        accessor: "version",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "",
        accessor: "actions",
        disableSortBy: true,
        width: 20,
        className: "actions",
      },
    ], [],
  );

  const data = useMemo(
    () => (
      extensions.map(extension => {
        const { id, isCompatible, manifest } = extension;
        const { name, description, version } = manifest;
        const isUninstalling = extensionInstallationStateStore.isExtensionUninstalling(id);
        const isEnabled = isExtensionEnabled(extension);

        return {
          extension: (
            <div className={"flex items-start"}>
              <div>
                <div className={styles.extensionName}>{name}</div>
                <div className={styles.extensionDescription}>{description}</div>
              </div>
            </div>
          ),
          version,
          status: (
            <div className={cssNames({ [styles.enabled]: isEnabled, [styles.invalid]: !isCompatible })}>
              {getStatus(extension)}
            </div>
          ),
          actions: (
            <MenuActions usePortal toolbar={false}>
              {isCompatible && (
                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => setExtensionEnabled(id, !isEnabled)}
                >
                  <Icon material={isEnabled ? "unpublished" : "check_circle"}/>
                  <span className="title" aria-disabled={isUninstalling}>
                    {isEnabled ? "Disable" : "Enable"}
                  </span>
                </MenuItem>
              )}

              <MenuItem
                disabled={isUninstalling}
                onClick={() => confirmUninstallExtension(extension)}
              >
                <Icon material="delete"/>
                <span className="title" aria-disabled={isUninstalling}>Uninstall</span>
              </MenuItem>
            </MenuActions>
          ),
        };
      })
    ), [extensions, extensionInstallationStateStore.anyUninstalling],
  );

  if (!isExtensionDiscoveryLoaded.get()) {
    return <div><Spinner center /></div>;
  }

  if (extensions.length == 0) {
    return (
      <div className="flex column h-full items-center justify-center">
        <Icon material="extension" className={styles.noItemsIcon}/>
        <h3 className="font-medium text-3xl mt-5 mb-2">
          There are no extensions installed.
        </h3>
        <p>Please use the form above to install or drag tarbar-file here.</p>
      </div>
    );
  }

  return (
    <section data-testid="extensions-table">
      <List
        title={<h2 className={styles.title}>Installed extensions</h2>}
        columns={columns}
        data={data}
        items={extensions}
        filters={filters}
      />
    </section>
  );
});

export const InstalledExtensions = withInjectables<Dependencies, InstalledExtensionsProps>(NonInjectedInstalledExtensions, {
  getProps: (di, props) => ({
    ...props,
    extensionInstallationStateStore: di.inject(extensionInstallationStateManagerInjectable),
    isExtensionDiscoveryLoaded: di.inject(isExtensionDiscoveryLoadedInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    confirmUninstallExtension: di.inject(confirmUninstallExtensionInjectable),
    setExtensionEnabled: di.inject(setExtensionEnabledInjectable),
  }),
});
