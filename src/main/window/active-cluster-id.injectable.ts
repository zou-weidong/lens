/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ClusterId } from "../../common/clusters/cluster-types";

const activeClusterIdInjectable = getInjectable({
  instantiate: () => observable.box<ClusterId | undefined>(),
  id: "active-cluster-id",
});

export default activeClusterIdInjectable;
