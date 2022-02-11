/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import mockFs from "mock-fs";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";
import type { DiContainer } from "@ogre-tools/injectable";
import type { ClusterStoreModel } from "../clusters/store";
import { defaultTheme } from "../vars";
import type { UserPreferencesStore } from "./store";
import directoryForUserDataInjectable from "../paths/user-data.injectable";
import userPreferencesStoreInjectable from "../../main/user-preferences/store.injectable";
import activeThemeIdInjectable from "./active-theme-id.injectable";

describe("user store tests", () => {
  let store: UserPreferencesStore;
  let mainDi: DiContainer;

  beforeEach(async () => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    mainDi = dis.mainDi;

    mainDi.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await dis.runSetups();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("for an empty config", () => {
    beforeEach(() => {
      mockFs({ "some-directory-for-user-data": { "config.json": "{}", "kube_config": "{}" }});

      store = mainDi.inject(userPreferencesStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows setting and retrieving lastSeenAppVersion", () => {
      store.lastSeenAppVersion = "1.2.3";
      expect(store.lastSeenAppVersion).toBe("1.2.3");
    });

    it("allows setting and getting preferences", () => {
      store.httpsProxy = "abcd://defg";

      expect(store.httpsProxy).toBe("abcd://defg");
      expect(store.colorTheme).toBe(defaultTheme);

      store.colorTheme = "light";
      expect(store.colorTheme).toBe("light");
    });

    it("correctly resets theme to default value", async () => {
      const activeThemeId = mainDi.inject(activeThemeIdInjectable);

      activeThemeId.set("some other theme");
      activeThemeId.reset();
      expect(store.colorTheme).toBe(defaultTheme);
    });
  });

  describe("migrations", () => {
    beforeEach(() => {
      mockFs({
        "some-directory-for-user-data": {
          "config.json": JSON.stringify({
            user: { username: "foobar" },
            preferences: { colorTheme: "light" },
            lastSeenAppVersion: "1.2.3",
          }),
          "lens-cluster-store.json": JSON.stringify({
            clusters: [
              {
                id: "foobar",
                kubeConfigPath: "some-directory-for-user-data/extension_data/foo/bar",
              },
              {
                id: "barfoo",
                kubeConfigPath: "some/other/path",
              },
            ],
          } as ClusterStoreModel),
          "extension_data": {},
        },
        "some": {
          "other": {
            "path": "is file",
          },
        },
      });

      store = mainDi.inject(userPreferencesStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("sets last seen app version to 0.0.0", () => {
      expect(store.lastSeenAppVersion).toBe("0.0.0");
    });

    it.only("skips clusters for adding to kube-sync with files under extension_data/", () => {
      expect(store.syncKubeconfigEntries.has("some-directory-for-user-data/extension_data/foo/bar")).toBe(false);
      expect(store.syncKubeconfigEntries.has("some/other/path")).toBe(true);
    });
  });
});
