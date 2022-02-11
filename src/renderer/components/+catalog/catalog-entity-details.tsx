/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog-entity-details.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { Icon } from "../icon";
import { CatalogEntityDrawerMenu } from "./catalog-entity-drawer-menu";
import { CatalogEntityDetailRegistry } from "../../../extensions/registries";
import { cssNames } from "../../utils";
import { Avatar } from "../avatar";
import type { CatalogEntity } from "../../../common/catalog/entity";
import type { GetLabelBadges } from "./get-label-badges.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import getLabelBadgesInjectable from "./get-label-badges.injectable";
import isDevelopmentInjectable from "../../../common/vars/is-development.injectable";

export interface CatalogEntityDetailsProps<T extends CatalogEntity> {
  entity: T | undefined;
  hideDetails: () => void;
  onRun: () => void;
}

interface Dependencies {
  getLabelBadges: GetLabelBadges;
  isDevelopment: boolean;
}

const NonInjectedCatalogEntityDetails = observer(({
  getLabelBadges,
  entity,
  hideDetails,
  onRun,
  isDevelopment,
}: Dependencies & CatalogEntityDetailsProps<CatalogEntity>) => {
  const renderContent = (entity: CatalogEntity) => {
    const detailItems = CatalogEntityDetailRegistry.getInstance().getItemsForKind(entity.kind, entity.apiVersion);
    const details = detailItems.map(({ components }, index) => <components.Details entity={entity} key={index} />);
    const showDefaultDetails = detailItems.find((item) => item.priority > 999) === undefined;

    return (
      <>
        {showDefaultDetails && (
          <div className="flex">
            <div className={styles.entityIcon}>
              <Avatar
                title={entity.getName()}
                colorHash={`${entity.getName()}-${entity.getSource()}`}
                size={128}
                src={entity.spec.icon?.src}
                data-testid="detail-panel-hot-bar-icon"
                background={entity.spec.icon?.background}
                onClick={onRun}
                className={styles.avatar}
              >
                {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material}/>}
              </Avatar>
              {entity.isEnabled() && (
                <div className={styles.hint}>
                  Click to open
                </div>
              )}
            </div>
            <div className={cssNames("box grow", styles.metadata)}>
              <DrawerItem name="Name">
                {entity.getName()}
              </DrawerItem>
              <DrawerItem name="Kind">
                {entity.kind}
              </DrawerItem>
              <DrawerItem name="Source">
                {entity.getSource()}
              </DrawerItem>
              <DrawerItem name="Status">
                {entity.status.phase}
              </DrawerItem>
              <DrawerItem name="Labels">
                {getLabelBadges(entity, hideDetails)}
              </DrawerItem>
              {isDevelopment && (
                <DrawerItem name="Id">
                  {entity.getId()}
                </DrawerItem>
              )}
            </div>
          </div>
        )}
        <div className="box grow">
          {details}
        </div>
      </>
    );
  };

  return (
    <Drawer
      className={styles.entityDetails}
      usePortal
      open={Boolean(entity)}
      title={`${entity.kind}: ${entity.getName()}`}
      toolbar={<CatalogEntityDrawerMenu entity={entity} key={entity.getId()} />}
      onClose={hideDetails}
    >
      {entity && renderContent(entity)}
    </Drawer>
  );
});

const InjectedCatalogEntityDetails = withInjectables<Dependencies, CatalogEntityDetailsProps<CatalogEntity>>(NonInjectedCatalogEntityDetails, {
  getProps: (di, props) => ({
    ...props,
    getLabelBadges: di.inject(getLabelBadgesInjectable),
    isDevelopment: di.inject(isDevelopmentInjectable),
  }),
});

export function CatalogEntityDetails<T extends CatalogEntity>(props: CatalogEntityDetailsProps<T>) {
  return <InjectedCatalogEntityDetails {...props} />;
}
