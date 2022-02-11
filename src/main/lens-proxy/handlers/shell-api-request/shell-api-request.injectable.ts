/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shellApiRequest } from "./shell-api-request";
import openShellSessionInjectable from "../../../shell-session/open.injectable";
import authenticateRequestInjectable from "./authenticate.injectable";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di) => shellApiRequest({
    openShellSession: di.inject(openShellSessionInjectable),
    authenticateRequest: di.inject(authenticateRequestInjectable),
  }),
});

export default shellApiRequestInjectable;
