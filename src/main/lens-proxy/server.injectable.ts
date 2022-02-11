/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import HttpProxyServer from "http-proxy";

const proxyServerInjectable = getInjectable({
  id: "proxy-server",
  instantiate: () => HttpProxyServer.createProxy(),
});

export default proxyServerInjectable;
