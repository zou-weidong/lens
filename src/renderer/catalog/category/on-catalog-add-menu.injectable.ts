/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogCategory } from "../../../common/catalog/category";
import type { CatalogEntityAddMenu, CatalogEntityAddMenuContext } from "../../../common/catalog/entity";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";

export type OnCatalogAddMenu = (category: CatalogCategory, menuItems: CatalogEntityAddMenu[]) => void;

interface Dependencies {
  navigate: Navigate;
}

const onCatalogAddMenu = ({
  navigate,
}: Dependencies): OnCatalogAddMenu => (
  (category, menuItems) => {
    const ctx: CatalogEntityAddMenuContext = {
      navigate,
      menuItems,
    };

    category.emit("catalogAddMenu", ctx);
  }
);

const onCatalogAddMenuInjectable = getInjectable({
  instantiate: (di) => onCatalogAddMenu({
    navigate: di.inject(navigateInjectable),
  }),
  id: "on-catalog-add-menu",
});

export default onCatalogAddMenuInjectable;
