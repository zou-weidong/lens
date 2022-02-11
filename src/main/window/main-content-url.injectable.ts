/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";

const mainContentUrlInjectable = getInjectable({
  id: "main-content-url",
  instantiate: (di) => {
    const proxyPort = di.inject(lensProxyPortInjectable);

    return computed(() => `http://localhost:${proxyPort.value}`);
  },
});

export default mainContentUrlInjectable;
