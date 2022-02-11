/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import createUserPreferencesStoreInjectable from "../../common/user-preferences/create-store.injectable";
import { userPreferencesStoreInjectionToken } from "../../common/user-preferences/store-injection-token";
import fileNameMigrationInjectable from "./migrations/file-name-migration.injectable";
import versionedMigrationsInjectable from "./migrations/versioned.injectable";
import setLoginItemSettingsInjectable from "../electron/set-login-item-settings.injectable";

const userPreferencesStoreInjectable = getInjectable({
  setup: async (di) => {
    const fileNameMigration = await di.inject(fileNameMigrationInjectable);

    try {
      await fileNameMigration();
    } catch (error) {
      console.error("In userPreferencesStoreInjectable", error);
    }
  },
  instantiate: (di) => {
    const store = di.inject(createUserPreferencesStoreInjectable, {
      migrations: di.inject(versionedMigrationsInjectable),
    });
    const appEventBus = di.inject(appEventBusInjectable);
    const setLoginItemSettings = di.inject(setLoginItemSettingsInjectable);

    store.load();

    // track telemetry availability
    reaction(() => store.allowTelemetry, allowed => {
      appEventBus.emit({ name: "telemetry", action: allowed ? "enabled" : "disabled" });
    });

    // open at system start-up
    reaction(() => store.openAtLogin, openAtLogin => {
      setLoginItemSettings({
        openAtLogin,
        openAsHidden: true,
        args: ["--hidden"],
      });
    }, {
      fireImmediately: true,
    });

    return store;
  },
  injectionToken: userPreferencesStoreInjectionToken,
  id: "user-preferences-store-injectable",
});

export default userPreferencesStoreInjectable;
