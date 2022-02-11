/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import computedMenuInjectable from "./menu.injectable";

interface Dependencies {
  menu: IComputedValue<Menu>;
}

const initAppMenuUpdater = ({ menu }: Dependencies) => (
  () => (
    autorun(() => Menu.setApplicationMenu(menu.get()), {
      delay: 100,
    })
  )
);

const initAppMenuUpdaterInjectable = getInjectable({
  instantiate: (di) => initAppMenuUpdater({
    menu: di.inject(computedMenuInjectable),
  }),
  id: "init-app-menu-updater",
});

export default initAppMenuUpdaterInjectable;
