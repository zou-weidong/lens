/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitRouteProtocolInternalInjectionToken } from "../../../../common/ipc/protocol-handler/router-internal.token";
import lensProtocolRouterRendererInjectable from "../../../protocol-handler/router.injectable";
import { implWithOn } from "../../impl-channel";

const routeProtocolInternalInjectable = implWithOn(emitRouteProtocolInternalInjectionToken, async (di) => {
  const router = await di.inject(lensProtocolRouterRendererInjectable);

  return (url, attempt) => router.routeInternal(url, attempt);
});

export default routeProtocolInternalInjectable;
