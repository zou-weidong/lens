/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "../catalog.module.scss";

import React from "react";
import { Avatar } from "../../avatar";
import { Icon } from "../../icon";
import { prevDefault } from "../../../utils";
import type { CatalogEntity } from "../../../../common/catalog/entity";
import type { IComputedValue } from "mobx";
import type { Hotbar } from "../../../../common/hotbars/hotbar";
import { getInjectable } from "@ogre-tools/injectable";
import activeHotbarInjectable from "../../../../common/hotbars/active-hotbar.injectable";

export type RenderEntityName = (entity: CatalogEntity) => React.ReactNode;

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar>;
}

const renderEntityName = ({
  activeHotbar,
}: Dependencies): RenderEntityName => (
  (entity) => {
    const hotbar = activeHotbar.get();
    const isInHotbar = hotbar.has(entity);
    const onClick = prevDefault(
      isInHotbar
        ? () => hotbar.remove(entity.getId())
        : () => hotbar.add(entity),
    );

    return (
      <>
        <Avatar
          title={entity.getName()}
          colorHash={`${entity.getName()}-${entity.getSource()}`}
          src={entity.spec.icon?.src}
          background={entity.spec.icon?.background}
          className={styles.catalogAvatar}
          size={24}
        >
          {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material} small/>}
        </Avatar>
        <span>{entity.getName()}</span>
        <Icon
          small
          className={styles.pinIcon}
          svg={isInHotbar ? "push_off" : "push_pin"}
          tooltip={isInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
          onClick={onClick}
        />
      </>
    );
  }
);

const renderEntityNameInjectable = getInjectable({
  instantiate: (di) => renderEntityName({
    activeHotbar: di.inject(activeHotbarInjectable),
  }),
  id: "render-entity-name",
});

export default renderEntityNameInjectable;

