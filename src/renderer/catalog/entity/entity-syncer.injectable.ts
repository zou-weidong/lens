/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogSyncMessage, EntityChangeEvents } from "../../../common/catalog/entity/sync-types";
import type { LensLogger } from "../../../common/logger";
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryLoggerInjectable from "../../../common/catalog/entity/registry-logger.injectable";
import type { StreamListeners } from "../../../common/ipc/steam";
import requestCatalogSyncStreamInjectable from "../../ipc/catalog/request-sync-stream.injectable";

interface Dependencies {
  logger: LensLogger;
  requestCatalogSyncStream: (listeners: StreamListeners<CatalogSyncMessage>) => void;
}

const catalogEntitySyncer = ({
  logger,
  requestCatalogSyncStream,
}: Dependencies) => (
  (events: EntityChangeEvents) => {
    requestCatalogSyncStream({
      onClose: () => logger.info("Closing CatalogEntitySyncer"),
      onConnectionError: (error) => logger.error("Failed to connect to catalog entity syncer", error),
      onData: (change) => {
        switch (change.type) {
          case "add":
            return events.add(change.data);
          case "update":
            return events.update(change.uid, change.data);
          case "delete":
            return events.delete(change.uid);
        }
      },
    });
  }
);

const catalogEntitySyncerInjectable = getInjectable({
  instantiate: (di) => catalogEntitySyncer({
    logger: di.inject(catalogEntityRegistryLoggerInjectable),
    requestCatalogSyncStream: di.inject(requestCatalogSyncStreamInjectable),
  }),
  id: "catalog-entity-syncer",
});

export default catalogEntitySyncerInjectable;

