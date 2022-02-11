/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import tableModelStorageInjectable from "./storage.injectable";
import { TableModel } from "./table-model";

const tableModelInjectable = getInjectable({
  instantiate: (di) => new TableModel({
    storage: di.inject(tableModelStorageInjectable),
  }),
  id: "table-model",
});

export default tableModelInjectable;
