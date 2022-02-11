/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isMacInjectable from "../vars/is-mac.injectable";
import isWindowsInjectable from "../vars/is-windows.injectable";
import systemCertificateAuthorityLoggerInjectable from "./logger.injectable";
import injectMacOsRootCertificateAuthoritiesInjectable from "./macos-root.injectable";
import injectWindowsRootCertificateAuthoritiesInjectable from "./windows-root.injectable";

/**
 * Inject CAs found in OS's (Windoes/MacOSX only) root certificate store to https.globalAgent.options.ca
 */
const injectSystemCertificateAuthoritiesInjectable = getInjectable({
  id: "inject-system-certificate-authorities",
  setup: async (di) => {
    const isMac = await di.inject(isMacInjectable);
    const isWindows = await di.inject(isWindowsInjectable);
    const logger = await di.inject(systemCertificateAuthorityLoggerInjectable);

    try {
      if (isMac) {
        const inject = await di.inject(injectMacOsRootCertificateAuthoritiesInjectable);

        await inject();
      } else if (isWindows) {
        const inject = await di.inject(injectWindowsRootCertificateAuthoritiesInjectable);

        await inject();
      }
    } catch (error) {
      logger.warn(`Error injecting root CAs: ${error}`);
    }
  },
  instantiate: () => undefined,
});

export default injectSystemCertificateAuthoritiesInjectable;
