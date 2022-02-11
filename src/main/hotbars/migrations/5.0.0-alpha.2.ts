/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import * as uuid from "uuid";
import type { MigrationDeclaration } from "../../utils";

interface Pre500Alpha2Hotbar {
  id?: string;
  name: string;
  items: any[];
}

export default {
  version: "5.0.0-alpha.2",
  run(log, store) {
    const rawHotbars = store.get("hotbars");
    const hotbars: Pre500Alpha2Hotbar[] = Array.isArray(rawHotbars) ? rawHotbars : [];

    store.set("hotbars", hotbars.map(({ id = uuid.v4(), ...rest }) => ({
      id,
      ...rest,
    })));
  },
} as MigrationDeclaration;
