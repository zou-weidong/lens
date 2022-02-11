/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./extensions.scss";
import type { IComputedValue } from "mobx";
import { makeObservable, observable, reaction, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { DropFileInput } from "../input";
import { Install } from "./install";
import { InstalledExtensions } from "./installed-extensions";
import { Notice } from "./notice";
import { SettingLayout } from "../layout/setting-layout";
import { docsUrl } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import userExtensionsInjectable from "../../../common/extensions/user-extensions.injectable";
import installFromInputInjectable from "./install-from-input.injectable";
import installOnDropInjectable from "./install-on-drop.injectable";
import { supportedExtensionFormats } from "./supported-extension-formats";
import type { InstallOnDrop } from "./install-on-drop.injectable";
import type { InstallFromInput } from "./install-from-input.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";

interface Dependencies {
  userExtensions: IComputedValue<InstalledExtension[]>;
  installFromInput: InstallFromInput;
  installOnDrop: InstallOnDrop;
  installStateStore: ExtensionInstallationStateManager;
}

@observer
class NonInjectedExtensions extends React.Component<Dependencies> {
  @observable installPath = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.userExtensions.get().length, (curSize, prevSize) => {
        if (curSize > prevSize) {
          disposeOnUnmount(this, [
            when(() => !this.props.installStateStore.anyInstalling, () => this.installPath = ""),
          ]);
        }
      }),
    ]);
  }

  render() {
    const userExtensions = this.props.userExtensions.get();

    return (
      <DropFileInput onDropFiles={this.props.installOnDrop}>
        <SettingLayout className="Extensions" contentGaps={false}>
          <section>
            <h1>Extensions</h1>

            <Notice className="mb-14 mt-3">
              <p>
                Add new features via Lens Extensions.{" "}
                Check out <a href={`${docsUrl}/extensions/`} target="_blank" rel="noreferrer">docs</a>{" "}
                and list of <a href="https://github.com/lensapp/lens-extensions/blob/main/README.md" target="_blank" rel="noreferrer">available extensions</a>.
              </p>
            </Notice>

            <Install
              supportedFormats={supportedExtensionFormats}
              onChange={value => (this.installPath = value)}
              installFromInput={() => this.props.installFromInput(this.installPath)}
              installPath={this.installPath}
            />

            {userExtensions.length > 0 && <hr />}

            <InstalledExtensions extensions={userExtensions} />
          </section>
        </SettingLayout>
      </DropFileInput>
    );
  }
}

export const Extensions = withInjectables<Dependencies>(NonInjectedExtensions, {
  getProps: (di) => ({
    userExtensions: di.inject(userExtensionsInjectable),
    installFromInput: di.inject(installFromInputInjectable),
    installOnDrop: di.inject(installOnDropInjectable),
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
  }),
});
