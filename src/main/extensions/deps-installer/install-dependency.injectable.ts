/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExtensionInstaller } from "./dependencies-installer";
import extensionInstallerInjectable from "./dependencies-installer.injectable";

export type InstallDependency = (name: string) => Promise<void>;

interface Dependencies {
  installer: ExtensionInstaller;
}

const installDependency = ({ installer }: Dependencies): InstallDependency => (
  (name) => installer.installDependency(name)
);

const installDependencyInjectable = getInjectable({
  instantiate: (di) => installDependency({
    installer: di.inject(extensionInstallerInjectable),
  }),
  id: "install-dependency",
});

export default installDependencyInjectable;
