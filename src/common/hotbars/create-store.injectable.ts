/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { BaseStoreParams } from "../base-store";
import type { HotbarStoreModel } from "./store";
import { HotbarStore } from "./store";
import hotbarStoreLoggerInjectable from "./logger.injectable";
import directoryForUserDataInjectable from "../paths/user-data.injectable";
import createHotbarInjectable from "./create-hotbar.injectable";

const createHotbarStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<HotbarStoreModel>) => (
    new HotbarStore({
      logger: di.inject(hotbarStoreLoggerInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
      createHotbar: di.inject(createHotbarInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-hotbar-store",
});

export default createHotbarStoreInjectable;
