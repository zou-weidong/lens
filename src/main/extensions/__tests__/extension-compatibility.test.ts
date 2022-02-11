/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import appVersionInjectable from "../../../common/vars/app-version.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { IsCompatibleExtension } from "../discovery/is-compatible-extension.injectable";
import isCompatibleExtensionInjectable from "../discovery/is-compatible-extension.injectable";

describe("extension compatibility", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  describe("appSemVer with no prerelease tag", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeAll(() => {
      di.override(appVersionInjectable, () => new SemVer("5.0.3"));
      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it("has no extension comparator", () => {
      const isCompatible = isCompatibleExtension({
        name: "extensionName",
        version: new SemVer("0.0.1"),
        description: "",
        engines: {
          lens: "foo",
        },
      });

      expect(isCompatible).toBe(false);
    });

    it.each([
      {
        comparator: "",
        expected: false,
      },
      {
        comparator: "bad comparator",
        expected: false,
      },
      {
        comparator: "^4.0.0",
        expected: false,
      },
      {
        comparator: "^5.0.0",
        expected: true,
      },
      {
        comparator: "^6.0.0",
        expected: false,
      },
      {
        comparator: "^4.0.0-alpha.1",
        expected: false,
      },
      {
        comparator: "^5.0.0-alpha.1",
        expected: true,
      },
      {
        comparator: "^6.0.0-alpha.1",
        expected: false,
      },
    ])("extension comparator test: %p", ({ comparator, expected }) => {
      const isCompatible = isCompatibleExtension({
        name: "extensionName",
        version: new SemVer("0.0.1"),
        description: "",
        engines: {
          lens: comparator,
        },
      });

      expect(isCompatible).toBe(expected);
    });
  });

  it.each([
    {
      appVersion: "5.0.3-beta.3",
      expected: true,
    },
    {
      appVersion: "5.1.0-latest.123456789",
      expected: true,
    },
    {
      appVersion: "5.1.0-alpha.123456789",
      expected: false,
    },
  ])("with version being %s", ({ appVersion, expected }) => {
    di.override(appVersionInjectable, () => new SemVer(appVersion));

    const isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    const isCompatible = isCompatibleExtension({
      name: "extensionName",
      version: new SemVer("0.0.1"),
      description: "",
      engines: { lens: "^5.1.0" },
    });

    expect(isCompatible).toBe(expected);
  });

  describe("verifying engines.lens comparitors", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeAll(() => {
      di.override(appVersionInjectable, () => new SemVer("5.0.3"));
      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it.each([
      {
        comparator: "",
        expected: false,
      },
      {
        comparator: "bad comparator",
        expected: false,
      },
      {
        comparator: "^4.0.0",
        expected: false,
      },
      {
        comparator: "^5.0.0",
        expected: true,
      },
      {
        comparator: "^6.0.0",
        expected: false,
      },
      {
        comparator: "^4.0.0-alpha.1",
        expected: false,
      },
      {
        comparator: "^5.0.0-alpha.1",
        expected: true,
      },
      {
        comparator: "^6.0.0-alpha.1",
        expected: false,
      },
    ])("extension comparator test: %p", ({ comparator, expected }) => {
      const isCompatible = isCompatibleExtension({
        name: "extensionName",
        version: new SemVer("0.0.1"),
        description: "",
        engines: { lens: comparator },
      });

      expect(isCompatible).toBe(expected);
    });
  });
});
