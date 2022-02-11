/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitCanGoBackInjectionToken } from "../../../../common/ipc/history/can-go-back/emit.token";
import topBarStateInjectable from "../../../components/layout/top-bar/state.injectable";
import { implWithOn } from "../../impl-channel";

const canGoBackListenerInjectable = implWithOn(emitCanGoBackInjectionToken, async (di) => {
  const state = await di.inject(topBarStateInjectable);

  return (canGoBack) => {
    state.prevEnabled = canGoBack;
  };
});

export default canGoBackListenerInjectable;
