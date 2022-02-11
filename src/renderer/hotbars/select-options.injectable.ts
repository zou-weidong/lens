/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import hotbarsInjectable from "../../common/hotbars/hotbars.injectable";
import type { SelectOption } from "../components/select";

const hotbarSelectOptionsInjectable = getInjectable({
  instantiate: (di) => {
    const hotbars = di.inject(hotbarsInjectable);

    return computed(() => {
      const res: SelectOption<string>[] = [];
      let i = 0;

      for (const [id, hotbar] of hotbars) {
        i += 1;
        res.push({
          value: id,
          label: `${i}: ${hotbar.name}`,
        });
      }

      return res;
    });
  },
  id: "hotbar-select-options",
});

export default hotbarSelectOptionsInjectable;
