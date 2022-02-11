/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import https from "https";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import { describeIf } from "../../test-utils/utils";
import injectMacOsRootCertificateAuthoritiesInjectable from "../system-certificate-authority/macos-root.injectable";
import { DSTRootCAX3 } from "../system-certificate-authority/system-ca";
import injectWindowsRootCertificateAuthoritiesInjectable from "../system-certificate-authority/windows-root.injectable";

describe("inject CA", () => {
  // for reset https.globalAgent.options.ca after testing
  let _ca: string | Buffer | (string | Buffer)[];
  let di: DiContainer;

  beforeEach(() => {
    _ca = https.globalAgent.options.ca;
    https.globalAgent.options.ca = undefined;
    di = getDiForUnitTesting();
  });

  afterEach(() => {
    https.globalAgent.options.ca = _ca;
  });

  describeIf(process.platform === "darwin")("macOS", () => {
    /**
     * The test to ensure using getMacRootCA + injectCAs injects CAs in the same way as using
     * the auto injection (require('mac-ca'))
     */
    it("should inject the same ca as mac-ca", async () => {
      const inject = di.inject(injectMacOsRootCertificateAuthoritiesInjectable);

      await inject();

      const injected = https.globalAgent.options.ca as (string | Buffer)[];

      https.globalAgent.options.ca = undefined;

      await import("mac-ca");
      const injectedByMacCA = https.globalAgent.options.ca as (string | Buffer)[];

      expect(new Set(injected)).toEqual(new Set(injectedByMacCA));
    });

    it("shouldn't included the expired DST Root CA X3 on Mac", async () => {
      const inject = di.inject(injectMacOsRootCertificateAuthoritiesInjectable);

      await inject();
      const injected = https.globalAgent.options.ca;

      expect(injected.includes(DSTRootCAX3)).toBeFalsy();
    });
  });

  describeIf(process.platform === "win32")("windows", () => {
    /**
     * The test to ensure using win-ca/api injects CAs in the same way as using
     * the auto injection (require('win-ca').inject('+'))
     */
    it("should inject the same ca as winca.inject('+')", async () => {
      const inject = di.inject(injectWindowsRootCertificateAuthoritiesInjectable);

      await inject();

      const injected = https.globalAgent.options.ca as (string | Buffer)[];

      https.globalAgent.options.ca = undefined;

      const winca = await import("win-ca");

      winca.inject("+"); // see: https://github.com/ukoloff/win-ca#caveats
      const injectedByWinCA = https.globalAgent.options.ca as (string | Buffer)[];

      expect(new Set(injected)).toEqual(new Set(injectedByWinCA));
    });

    it("shouldn't included the expired DST Root CA X3 on Windows", async () => {
      const inject = di.inject(injectWindowsRootCertificateAuthoritiesInjectable);

      await inject();

      const injected = https.globalAgent.options.ca as (string | Buffer)[];

      expect(injected.includes(DSTRootCAX3)).toBeFalsy();
    });
  });
});
