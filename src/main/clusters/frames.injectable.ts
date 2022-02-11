/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observable, ObservableMap } from "mobx";
import { getInjectable } from "@ogre-tools/injectable";

export interface ClusterFrameInfo {
  frameId: number;
  processId: number;
}

export type ClusterFrames = ObservableMap<string, ClusterFrameInfo>;

const clusterFramesInjectable = getInjectable({
  instantiate: (): ClusterFrames => observable.map(),
  id: "cluster-frames",
});

export default clusterFramesInjectable;
