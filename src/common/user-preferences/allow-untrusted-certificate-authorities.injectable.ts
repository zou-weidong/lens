/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface AllowUntrustedCertificateAuthorities {
  readonly value: boolean;
  toggle: () => void;
}

const allowUntrustedCertificateAuthoritiesInjectable = getInjectable({
  instantiate: (di): AllowUntrustedCertificateAuthorities => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.allowUntrustedCAs;
      },
      toggle: () => {
        store.allowUntrustedCAs = !store.allowUntrustedCAs;
      },
    };
  },
  id: "allow-untrusted-certificate-authorities",
});

export default allowUntrustedCertificateAuthoritiesInjectable;
