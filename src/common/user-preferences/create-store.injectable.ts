/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import appEventBusInjectable from "../app-event-bus/app-event-bus.injectable";
import type { BaseStoreParams } from "../base-store";
import directoryForUserDataInjectable from "../paths/user-data.injectable";
import userPreferencesStoreLoggerInjectable from "./logger.injectable";
import type { UserPreferencesStoreModel } from "./store";
import { UserPreferencesStore } from "./store";

const createUserPreferencesStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<UserPreferencesStoreModel>) => (
    new UserPreferencesStore({
      logger: di.inject(userPreferencesStoreLoggerInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
      appEventBus: di.inject(appEventBusInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-user-preferences-store",
});

export default createUserPreferencesStoreInjectable;
