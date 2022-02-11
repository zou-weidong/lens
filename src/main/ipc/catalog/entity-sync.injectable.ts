/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestCatalogSyncStreamInjectionToken } from "../../../common/ipc/catalog/sync.token";
import type { StreamSource } from "../impl-stream";
import { implOneWayStream } from "../impl-stream";
import type { CatalogSyncMessage, EntityChangeEvents } from "../../../common/catalog/entity/sync-types";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import getCatalogSyncEmitterInjectable from "../../catalog/sync/emitter.injectable";
import { disposer } from "../../../common/utils";

const catalogSyncStreamChannelsHandleInjectable = implOneWayStream(requestCatalogSyncStreamInjectionToken, async (di) => {
  const getCatalogSyncEmitter = await di.inject(getCatalogSyncEmitterInjectable);

  return () => {
    const emitter: TypedEventEmitter<StreamSource<CatalogSyncMessage>> = new EventEmitter();
    const syncEmitter = getCatalogSyncEmitter();
    const onReady = () => {
      for (const data of syncEmitter.initial()) {
        emitter.emit("data", {
          type: "add",
          data,
        });
      }
    };
    const onSync: EntityChangeEvents = {
      add: (data) => {
        emitter.emit("data", {
          type: "add",
          data,
        });
      },
      delete: (uid) => {
        emitter.emit("data", {
          type: "delete",
          uid,
        });
      },
      update: (uid, data) => {
        emitter.emit("data", {
          type: "update",
          data,
          uid,
        });
      },
    };
    const onClose = disposer();

    emitter.once("ready", onReady);
    onClose.push(() => emitter.off("ready", onReady));

    syncEmitter.emitter.on("add", onSync.add);
    onClose.push(() => syncEmitter.emitter.off("add", onSync.add));

    syncEmitter.emitter.on("delete", onSync.delete);
    onClose.push(() => syncEmitter.emitter.off("delete", onSync.delete));

    syncEmitter.emitter.on("update", onSync.update);
    onClose.push(() => syncEmitter.emitter.off("update", onSync.update));

    emitter.once("close", onClose);

    return emitter;
  };
});

export default catalogSyncStreamChannelsHandleInjectable;
