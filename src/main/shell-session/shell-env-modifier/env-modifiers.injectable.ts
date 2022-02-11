/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { iter } from "../../../common/utils";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";

const shellEnvModifiersInjectable = getInjectable({
  instantiate: (di) => {
    const extensions = di.inject(mainExtensionsInjectable);

    return computed(() => [
      ...iter.filterMap(
        extensions.get(),
        (extension) => extension.terminalShellEnvModifier,
      ),
    ]);
  },
  id: "shell-env-modifiers",
});

export default shellEnvModifiersInjectable;
