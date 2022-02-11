/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { CatalogEntity } from "../../../common/catalog/entity";
import catalogEntitiesInjectable from "../../../common/catalog/entity/entities.injectable";
import emitCatalogEntityRunInjectable from "../../../common/ipc/catalog/entity-run/emit.injectable";
import type { CatalogEntityRun } from "../../../common/ipc/catalog/entity-run/emit.token";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { Select } from "../select";

interface Dependencies {
  closeCommandOverlay: () => void;
  entities: IComputedValue<CatalogEntity[]>;
  catalogEntityRun: CatalogEntityRun;
}

const NonInjectedActivateEntityCommand = observer(({ closeCommandOverlay, entities, catalogEntityRun }: Dependencies) => {
  const options = entities.get().map(entity => ({
    label: `${entity.kind}: ${entity.getName()}`,
    value: entity,
  }));

  const onSelect = (entity: CatalogEntity): void => {
    catalogEntityRun(entity.getId());
    closeCommandOverlay();
  };

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onSelect(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Activate entity ..."
    />
  );
});

export const ActivateEntityCommand = withInjectables<Dependencies>(NonInjectedActivateEntityCommand, {
  getProps: di => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    entities: di.inject(catalogEntitiesInjectable),
    catalogEntityRun: di.inject(emitCatalogEntityRunInjectable),
  }),
});
