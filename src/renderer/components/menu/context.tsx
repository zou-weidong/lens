/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { CatalogEntityContextMenu } from "../../../common/catalog/entity";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import { MenuItem } from "./menu";
import { Icon } from "../icon";

export interface ContextMenuProps {
  menuItems: CatalogEntityContextMenu[];
  toolbar?: boolean;
}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
}

const NonInjectedContextMenu = observer(({
  openConfirmDialog,
  menuItems,
  toolbar = false,
}: Dependencies & ContextMenuProps) => {
  const onMenuItemClick = ({ onClick, confirm }: CatalogEntityContextMenu) => (
    () => {
      if (confirm) {
        openConfirmDialog({
          okButtonProps: {
            primary: false,
            accent: true,
          },
          ok: onClick,
          message: confirm.message,
        });
      } else {
        onClick();
      }
    }
  );

  const filterForToolbar = toolbar
    ? ({ icon }: CatalogEntityContextMenu) => icon
    : () => true;
  const renderVisuals = toolbar
    ? ({ icon, title }: CatalogEntityContextMenu) => (
      <Icon
        interactive
        tooltip={title}
        {...Icon.convertProps(icon)}
      />
    )
    : ({ title }: CatalogEntityContextMenu) => title;

  return (
    <>
      {
        menuItems
          .filter(filterForToolbar)
          .map(value => (
            <MenuItem key={value.title} onClick={onMenuItemClick(value)}>
              {renderVisuals(value)}
            </MenuItem>
          ))
      }
    </>
  );
});

export const ContextMenu = withInjectables<Dependencies, ContextMenuProps>(NonInjectedContextMenu, {
  getProps: (di, props) => ({
    ...props,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
