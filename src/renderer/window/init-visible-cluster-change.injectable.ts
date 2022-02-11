/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import type { VisibleClusterChanged } from "../../common/ipc/window/visible-cluster-changed.token";
import emitVisibleClusterChangedInjectable from "../ipc/window/visible-cluster-changed.injectable";
import type { GetMatchedClusterId } from "../navigation/get-matched-cluster-id.injectable";
import getMatchedClusterIdInjectable from "../navigation/get-matched-cluster-id.injectable";

interface Dependencies {
  emitVisibleClusterChanged: VisibleClusterChanged;
  getMatchedClusterId: GetMatchedClusterId;
}

const initVisibleClusterChanged = ({
  emitVisibleClusterChanged,
  getMatchedClusterId,
}: Dependencies) => (
  () => {
    reaction(
      () => getMatchedClusterId(),
      emitVisibleClusterChanged,
      {
        fireImmediately: true,
      },
    );
  }
);

const initVisibleClusterChangedInjectable = getInjectable({
  instantiate: (di) => initVisibleClusterChanged({
    emitVisibleClusterChanged: di.inject(emitVisibleClusterChangedInjectable),
    getMatchedClusterId: di.inject(getMatchedClusterIdInjectable),
  }),
  id: "init-visible-cluster-changed",
});

export default initVisibleClusterChangedInjectable;
