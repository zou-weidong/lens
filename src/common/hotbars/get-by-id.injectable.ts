/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Hotbar } from "./hotbar";
import { getInjectable } from "@ogre-tools/injectable";
import hotbarsInjectable from "./hotbars.injectable";

export type GetHotbarById = (id: string) => Hotbar | undefined;

const getHotbarByIdInjectable = getInjectable({
  instantiate: (di): GetHotbarById => {
    const hotbars = di.inject(hotbarsInjectable);

    return (id) => hotbars.get(id);
  },
  id: "get-hotbar-by-id",
});

export default getHotbarByIdInjectable;

