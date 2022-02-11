/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../paths/user-data.injectable";
import type { BaseStoreParams } from "../base-store";
import weblinkStoreLoggerInjectable from "./logger.injectable";
import type { WeblinkStoreModel } from "./store";
import { WeblinkStore } from "./store";

const createWeblinkStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<WeblinkStoreModel>) => (
    new WeblinkStore({
      logger: di.inject(weblinkStoreLoggerInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-weblink-store",
});

export default createWeblinkStoreInjectable;
