/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { isEqual } from "lodash";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import type { CatalogEntity } from "../../../common/catalog/entity";
import { toJS } from "../../../renderer/utils";
import catalogEntitiesInjectable from "../../../common/catalog/entity/entities.injectable";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import type { RawCatalogEntity, RawCatalogEntityUpdate, EntityChangeEvents } from "../../../common/catalog/entity/sync-types";

interface Dependencies {
  entities: IComputedValue<CatalogEntity[]>;
}

function toRaw(entity: CatalogEntity): RawCatalogEntity {
  return {
    kind: entity.kind,
    apiVersion: entity.apiVersion,
    metadata: toJS(entity.metadata),
    status: toJS(entity.status),
    spec: toJS(entity.spec),
  };
}

function createRawEntityUpdate(prevRaw: RawCatalogEntity, rawEntity: RawCatalogEntity): RawCatalogEntityUpdate | false {
  const metadata = isEqual(prevRaw.metadata, rawEntity.metadata)
    ? {}
    : { metadata: rawEntity.metadata };
  const status = isEqual(prevRaw.status, rawEntity.status)
    ? {}
    : { status: rawEntity.status };
  const spec = isEqual(prevRaw.spec, rawEntity.spec)
    ? {}
    : { spec: rawEntity.spec };
  const res = {
    ...metadata,
    ...status,
    ...spec,
  };

  if (!res.metadata && !res.spec && !res.status) {
    return false;
  }

  return res as RawCatalogEntityUpdate;
}

const getCatalogSyncEmitter = ({ entities }: Dependencies) => () => {
  const rawEntityMap = new Map<string, RawCatalogEntity>();
  const entityChangeEmitter = new EventEmitter() as TypedEventEmitter<EntityChangeEvents>;

  autorun(() => {
    const currentIds = new Set<string>();

    for (const entity of entities.get()) {
      currentIds.add(entity.getId());

      const rawEntity = toRaw(entity);

      if (rawEntityMap.has(rawEntity.metadata.uid)) {
        const prevRaw = rawEntityMap.get(rawEntity.metadata.uid);
        const diff = createRawEntityUpdate(prevRaw, rawEntity);

        if (diff) {
          rawEntityMap.set(rawEntity.metadata.uid, rawEntity);
          entityChangeEmitter.emit("update", rawEntity.metadata.uid, diff);
        }
      } else {
        rawEntityMap.set(rawEntity.metadata.uid, rawEntity);
        entityChangeEmitter.emit("add", rawEntity);
      }
    }

    for (const rawEntityId of rawEntityMap.keys()) {
      if (!currentIds.has(rawEntityId)) {
        rawEntityMap.delete(rawEntityId);
        entityChangeEmitter.emit("delete", rawEntityId);
      }
    }
  });

  return {
    emitter: entityChangeEmitter,
    initial: () => rawEntityMap.values(),
  };
};

const getCatalogSyncEmitterInjectable = getInjectable({
  instantiate: (di) => getCatalogSyncEmitter({
    entities: di.inject(catalogEntitiesInjectable),
  }),
  id: "get-catalog-sync-emitter",
});

export default getCatalogSyncEmitterInjectable;
