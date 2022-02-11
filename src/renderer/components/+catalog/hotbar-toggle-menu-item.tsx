/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import type { ReactNode } from "react";
import React from "react";
import type { CatalogEntity } from "../../../common/catalog/entity";
import activeHotbarInjectable from "../../../common/hotbars/active-hotbar.injectable";
import type { Hotbar } from "../../../common/hotbars/hotbar";

import { MenuItem } from "../menu";

export interface HotbarToggleMenuItemProps {
  entity: CatalogEntity;
  addContent: ReactNode;
  removeContent: ReactNode;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar>;
}

const NonInjectedHotbarToggleMenuItem = observer(({ activeHotbar, entity, addContent, removeContent }: Dependencies & HotbarToggleMenuItemProps) => {
  const hotbar = activeHotbar.get();
  const isInHotbar = hotbar.has(entity);
  const onClick = () => {
    if (isInHotbar) {
      hotbar.remove(entity.getId());
    } else {
      hotbar.add(entity);
    }
  };

  return (
    <MenuItem onClick={onClick}>
      {isInHotbar ? removeContent : addContent}
    </MenuItem>
  );
});

export const HotbarToggleMenuItem = withInjectables<Dependencies, HotbarToggleMenuItemProps>(NonInjectedHotbarToggleMenuItem, {
  getProps: (di, props) => ({
    ...props,
    activeHotbar: di.inject(activeHotbarInjectable),
  }),
});
