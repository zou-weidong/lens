/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";

const systemCertificateAuthorityLoggerInjectable = getInjectable({
  id: "system-certificate-authority-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "CERTIFICATE-AUTHORITY",
  }),
});

export default systemCertificateAuthorityLoggerInjectable;
