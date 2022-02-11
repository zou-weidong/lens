/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Disposer } from "../../utils";
import type { LensExtensionId } from "../manifest";

const installationReactionsInjectable = getInjectable({
  instantiate: () => observable.map<LensExtensionId, Disposer>(),
  id: "installation-reactions",
});

export default installationReactionsInjectable;
