/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable, ObservableSet } from "mobx";

/**
 * The set of extensions that do not have an instance for a given "side"
 */
export type NonInstanceExtensionNames = ObservableSet<string>;

const nonInstanceExtensionNamesInjectable = getInjectable({
  instantiate: (): NonInstanceExtensionNames => observable.set(),
  id: "non-instance-extension-names",
});

export default nonInstanceExtensionNamesInjectable;
