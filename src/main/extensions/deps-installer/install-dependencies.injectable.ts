/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExtensionInstaller } from "./dependencies-installer";
import extensionInstallerInjectable from "./dependencies-installer.injectable";

export type InstallDependencies = (packagePath: string, dependencies: Record<string, string>) => Promise<void>;

interface Dependencies {
  installer: ExtensionInstaller;
}

const installDependencies = ({ installer }: Dependencies): InstallDependencies => (
  (packagePath, dependencies) => installer.installDependencies(packagePath, dependencies)
);

const installDependenciesInjectable = getInjectable({
  instantiate: (di) => installDependencies({
    installer: di.inject(extensionInstallerInjectable),
  }),
  id: "install-dependencies",
});

export default installDependenciesInjectable;
