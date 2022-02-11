/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-icon.module.scss";

import React, { useState } from "react";

import type { CatalogEntityContextMenu } from "../../../common/catalog/entity";
import { cssNames } from "../../utils";
import { Menu } from "../menu";
import { observer } from "mobx-react";
import type { AvatarProps } from "../avatar";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import { Tooltip } from "../tooltip";
import { ContextMenu } from "../menu/context";

export interface HotbarIconProps extends AvatarProps {
  uid: string;
  source: string;
  material?: string;
  onMenuOpen?: () => void;
  active?: boolean;
  menuItems: CatalogEntityContextMenu[];
  disabled?: boolean;
  tooltip?: string;
}

export const HotbarIcon = observer(({
  menuItems,
  size = 40,
  tooltip,
  uid,
  title,
  src,
  material,
  active,
  className,
  source,
  disabled,
  onMenuOpen,
  onClick,
  children,
  ...rest
}: HotbarIconProps) => {
  const id = `hotbarIcon-${uid}`;
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={cssNames(styles.HotbarIcon, className, { [styles.contextMenuAvailable]: menuItems.length > 0 })}>
      {tooltip && <Tooltip targetId={id}>{tooltip}</Tooltip>}
      <Avatar
        {...rest}
        id={id}
        title={title}
        colorHash={`${title}-${source}`}
        className={cssNames(styles.avatar, { [styles.active]: active })}
        disabled={disabled}
        size={size}
        src={src}
        onClick={(event) => !disabled && onClick?.(event)}
      >
        {material && <Icon material={material} />}
      </Avatar>
      {children}
      <Menu
        usePortal
        htmlFor={id}
        isOpen={menuOpen}
        toggleEvent="contextmenu"
        position={{ right: true, bottom: true }} // FIXME: position does not work
        open={() => {
          onMenuOpen?.();
          toggleMenu();
        }}
        close={toggleMenu}
      >
        <ContextMenu menuItems={menuItems} />
      </Menu>
    </div>
  );
});
