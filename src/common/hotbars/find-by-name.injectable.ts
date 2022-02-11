/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Hotbar } from "./hotbar";
import { getInjectable } from "@ogre-tools/injectable";
import hotbarsInjectable from "./hotbars.injectable";
import { iter } from "../utils";

export type FindHotbarByName = (name: string) => Hotbar | undefined;

const findHotbarByNameInjectable = getInjectable({
  instantiate: (di): FindHotbarByName => {
    const hotbars = di.inject(hotbarsInjectable);

    return (name) => iter.find(hotbars.values(), (hotbar) => hotbar.name === name);
  },
  id: "find-hotbar-by-name",
});

export default findHotbarByNameInjectable;

