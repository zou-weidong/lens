/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PartialDeep, RequireAtLeastOne } from "type-fest";
import type { SyncMessage } from "../../utils";
import type { CatalogEntityData } from "../entity";

export interface EntityChangeEvents {
  add: (data: RawCatalogEntity) => void;
  update: (uid: string, data: RawCatalogEntityUpdate) => void;
  delete: (uid: string) => void;
}

export interface RawCatalogEntity extends CatalogEntityData {
  kind: string;
  apiVersion: string;
}

export type RawCatalogEntityUpdate = RequireAtLeastOne<PartialDeep<CatalogEntityData>>;

export interface CatalogSyncAddMessage extends SyncMessage<"add"> {
  data: RawCatalogEntity;
}

export interface CatalogSyncUpdateMessage extends SyncMessage<"update"> {
  uid: string;
  data: RawCatalogEntityUpdate;
}

export interface CatalogSyncDeleteMessage  extends SyncMessage<"delete">{
  uid: string;
}

export type CatalogSyncMessage = CatalogSyncAddMessage | CatalogSyncUpdateMessage | CatalogSyncDeleteMessage;
