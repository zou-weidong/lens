/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import { computed } from "mobx";
import computedMenuTemplateInjectable from "./menu-template.injectable";

const computedMenuInjectable = getInjectable({
  instantiate: (di) => {
    const menuTemplate = di.inject(computedMenuTemplateInjectable);

    return computed(() => Menu.buildFromTemplate(menuTemplate.get()));
  },
  id: "computed-menu",
});

export default computedMenuInjectable;
