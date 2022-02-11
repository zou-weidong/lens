/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { EditResourceTabStore } from "./store";
import editResourceTabStorageInjectable from "./storage.injectable";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager.injectable";

const editResourceTabStoreInjectable = getInjectable({
  id: "edit-resource-tab-store",

  instantiate: (di) => new EditResourceTabStore({
    apiManager: di.inject(apiManagerInjectable),
  }, {
    storage: di.inject(editResourceTabStorageInjectable),
  }),
});

export default editResourceTabStoreInjectable;
