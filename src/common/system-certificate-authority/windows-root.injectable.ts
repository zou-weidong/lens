/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import wincaAPI from "win-ca/api";
import { getInjectable } from "@ogre-tools/injectable";
import { isCertActive } from "./system-ca";

/**
 * Get root CA certificate from Windows system certificate store.
 * Only return non-expred certificates.
 */
const injectWindowsRootCertificateAuthoritiesInjectable = getInjectable({
  id: "inject-windows-root-certificate-authorities",
  instantiate: () => () => {
    return new Promise<void>((resolve) => {
      const CAs: string[] = [];

      wincaAPI({
        format: wincaAPI.der2.pem,
        inject: false,
        ondata: (ca: string) => {
          if (isCertActive(ca)) {
            CAs.push(ca);
          }
        },
        onend: () => {
          wincaAPI.inject("+", CAs);
          resolve();
        },
      });
    });
  },
});

export default injectWindowsRootCertificateAuthoritiesInjectable;
