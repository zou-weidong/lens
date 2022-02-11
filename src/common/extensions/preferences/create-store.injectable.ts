/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { BaseStoreParams } from "../../base-store";
import directoryForUserDataInjectable from "../../paths/user-data.injectable";
import extensionsPreferencesStoreLoggerInjectable from "./logger.injectable";
import type { ExtensionsPreferencesStoreModel } from "./store";
import { ExtensionsPreferencesStore } from "./store";

const createExtensionsPreferencesStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<ExtensionsPreferencesStoreModel>) => (
    new ExtensionsPreferencesStore({
      logger: di.inject(extensionsPreferencesStoreLoggerInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-extensions-preferences-store",
});

export default createExtensionsPreferencesStoreInjectable;
