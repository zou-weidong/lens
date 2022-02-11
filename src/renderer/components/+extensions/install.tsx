/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./install.module.scss";
import React from "react";
import { prevDefault } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import type { InputValidator } from "../input";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { TooltipPosition } from "../tooltip";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { InstallFromSelectFileDialog } from "./install-from-select-file-dialog.injectable";
import installFromSelectFileDialogInjectable from "./install-from-select-file-dialog.injectable";
import { observer } from "mobx-react";

export interface InstallProps {
  installPath: string;
  supportedFormats: string[];
  onChange: (path: string) => void;
  installFromInput: () => void;
}

interface Dependencies {
  installStateStore: ExtensionInstallationStateManager;
  installFromSelectFileDialog: InstallFromSelectFileDialog;
}

const installInputValidators = [
  InputValidators.isUrl,
  InputValidators.isPath,
  InputValidators.isExtensionNameInstall,
];

const installInputValidator: InputValidator = {
  message: "Invalid URL, absolute path, or extension name",
  validate: (value: string) => (
    installInputValidators.some(({ validate }) => validate(value))
  ),
};

const NonInjectedInstall = observer(({
  installPath,
  supportedFormats,
  onChange,
  installFromInput,
  installFromSelectFileDialog,
  installStateStore,
}: Dependencies & InstallProps) => (
  <section className="mt-2">
    <SubTitle
      title={`Name or file path or URL to an extension package (${supportedFormats.join(", ")})`}
    />
    <div className="flex">
      <div className="flex-1">
        <Input
          className="box grow mr-6"
          theme="round-black"
          disabled={installStateStore.anyPreInstallingOrInstalling}
          placeholder={"Name or file path or URL"}
          showErrorsAsTooltip={{ preferredPositions: TooltipPosition.BOTTOM }}
          validators={installPath ? installInputValidator : undefined}
          value={installPath}
          onChange={onChange}
          onSubmit={installFromInput}
          iconRight={
            <Icon
              className={styles.icon}
              material="folder_open"
              onClick={prevDefault(installFromSelectFileDialog)}
              tooltip="Browse"
            />
          }
        />
      </div>
      <div className="flex-initial">
        <Button
          primary
          label="Install"
          className="w-80 h-full"
          disabled={installStateStore.anyPreInstallingOrInstalling}
          waiting={installStateStore.anyPreInstallingOrInstalling}
          onClick={installFromInput}
        />
      </div>
    </div>
    <small className="mt-3">
      <b>Pro-Tip</b>: you can drag-n-drop tarball-file to this area
    </small>
  </section>
));

export const Install = withInjectables<Dependencies, InstallProps>(NonInjectedInstall, {
  getProps: (di, props) => ({
    ...props,
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
    installFromSelectFileDialog: di.inject(installFromSelectFileDialogInjectable),
  }),
});
