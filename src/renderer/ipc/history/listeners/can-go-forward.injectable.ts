/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitCanGoForwardInjectionToken } from "../../../../common/ipc/history/can-go-forward/emit.token";
import topBarStateInjectable from "../../../components/layout/top-bar/state.injectable";
import { implWithOn } from "../../impl-channel";

const canGoForwardListenerInjectable = implWithOn(emitCanGoForwardInjectionToken, async (di) => {
  const state = await di.inject(topBarStateInjectable);

  return (canGoForward) => {
    state.nextEnabled = canGoForward;
  };
});

export default canGoForwardListenerInjectable;
