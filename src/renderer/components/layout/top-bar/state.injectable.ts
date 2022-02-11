/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface TopBarState {
  prevEnabled: boolean;
  nextEnabled: boolean;
}

const topBarStateInjectable = getInjectable({
  instantiate: () => observable.object<TopBarState>({
    prevEnabled: false,
    nextEnabled: false,
  }),
  id: "top-bar-state",
});

export default topBarStateInjectable;
