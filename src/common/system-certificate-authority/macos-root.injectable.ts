/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../utils/exec-file.injectable";
import pushCertificatesToGlobalAgentInjectable from "./push-global-agent.injectable";
import { isCertActive } from "./system-ca";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet#other_assertions
const certSplitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;

const injectMacOsRootCertificateAuthoritiesInjectable = getInjectable({
  id: "inject-mac-os-root-certificate-authorities",
  instantiate: (di) => async () => {
    const execFile = di.inject(execFileInjectable);
    const pushCertificatesToGlobalAgent = di.inject(pushCertificatesToGlobalAgentInjectable);
    const [allTrusted, allRootTrusted] = await Promise.all([
      execFile("/usr/bin/security", ["find-certificate", "-a", "-p"], { stdoutOnly: true }),
      execFile("/usr/bin/security", ["find-certificate", "-a", "-p", "/System/Library/Keychains/SystemRootCertificates.keychain"], { stdoutOnly: true }),
    ]);
    const trusted = allTrusted.split(certSplitPattern);
    const rootTrusted = allRootTrusted.split(certSplitPattern);

    pushCertificatesToGlobalAgent([...new Set([...trusted, ...rootTrusted])].filter(isCertActive));
  },
});

export default injectMacOsRootCertificateAuthoritiesInjectable;
