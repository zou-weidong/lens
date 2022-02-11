/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import https from "https";
import { getInjectable } from "@ogre-tools/injectable";

const pushCertificatesToGlobalAgentInjectable = getInjectable({
  id: "push-certificates-to-global-agent",
  instantiate: () => (certificates: string[]) => {
    for (const cert of certificates) {
      if (Array.isArray(https.globalAgent.options.ca) && !https.globalAgent.options.ca.includes(cert)) {
        https.globalAgent.options.ca.push(cert);
      } else {
        https.globalAgent.options.ca = [cert];
      }
    }
  },
  causesSideEffects: true,
});

export default pushCertificatesToGlobalAgentInjectable;
