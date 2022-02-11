/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MenuItemConstructorOptions } from "electron";
import type { MenuTopId } from "./menu-template.injectable";

export type MenuRegistration = MenuItemConstructorOptions & (
  {
    parentId: MenuTopId;
  } | {
    /**
     * @deprecated only the values of {@link MenuTopId} are supported
     */
    parentId: string;
  }
);
