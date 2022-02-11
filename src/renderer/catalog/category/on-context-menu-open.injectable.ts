/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext, NavigateAction } from "../../../common/catalog/entity";
import navigateActionInjectable from "../../window/navigate-action.injectable";
import type { CatalogCategoryRegistry } from "./registry";
import catalogCategoryRegistryInjectable from "./registry.injectable";

export type OnContextMenuOpen = (entity: CatalogEntity, menuItems: CatalogEntityContextMenu[]) => void;

interface Dependencies {
  categoryRegistry: CatalogCategoryRegistry;
  navigate: NavigateAction;
}

const onContextMenuOpen = ({
  categoryRegistry,
  navigate,
}: Dependencies): OnContextMenuOpen => (
  (entity, menuItems) => {
    const category = categoryRegistry.getCategoryForEntity(entity);
    const ctx: CatalogEntityContextMenuContext = {
      menuItems,
      navigate,
    };

    entity.onContextMenuOpen?.(ctx);
    category?.emit("contextMenuOpen", entity, ctx);
  }
);

const onContextMenuOpenInjectable = getInjectable({
  instantiate: (di) => onContextMenuOpen({
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    navigate: di.inject(navigateActionInjectable),
  }),
  id: "on-context-menu-open",
});

export default onContextMenuOpenInjectable;
