/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ShellRequestAuthenticator } from "./authenticator";

const shellRequestAuthenticatorInjectable = getInjectable({
  instantiate: () => new ShellRequestAuthenticator(),
  id: "shell-request-authenticator",
});

export default shellRequestAuthenticatorInjectable;
