/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getAppVersionFromProxyServer } from "../../common/utils";
import lensProxyPortInjectable from "./port.injectable";

const getAppVersionFromProxyInjectable = getInjectable({
  instantiate: (di) => {
    const proxyPort = di.inject(lensProxyPortInjectable);

    return () => getAppVersionFromProxyServer(proxyPort.value);
  },
  id: "get-app-version-from-proxy",
});

export default getAppVersionFromProxyInjectable;
