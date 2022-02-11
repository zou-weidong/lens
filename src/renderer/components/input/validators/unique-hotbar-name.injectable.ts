/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import findHotbarByNameInjectable from "../../../../common/hotbars/find-by-name.injectable";
import type { InputValidator } from "../input_validators";

const uniqueHotbarNameInjectable = getInjectable({
  instantiate: (di): InputValidator => {
    const findHotbarByName = di.inject(findHotbarByNameInjectable);

    return {
      condition: ({ required }) => required,
      message: () => "Hotbar with this name already exists",
      validate: value => !findHotbarByName(value),
    };
  },
  id: "unique-hotbar-name",
});

export default uniqueHotbarNameInjectable;
