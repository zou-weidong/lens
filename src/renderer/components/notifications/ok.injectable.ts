/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../utils";
import type { NotificationMessage, NotificationsStore } from "./store";
import { NotificationKind } from "./store";
import notificationsStoreInjectable from "./store.injectable";

export type OkNotification = (message: NotificationMessage) => Disposer;

interface Dependencies {
  store: NotificationsStore;
}

const okNotification = ({ store }: Dependencies): OkNotification => (
  (message) => store.add({
    message,
    kind: NotificationKind.OK,
    timeout: 5_000,
  })
);

const okNotificationInjectable = getInjectable({
  instantiate: (di) => okNotification({
    store: di.inject(notificationsStoreInjectable),
  }),
  id: "ok-notification",
});

export default okNotificationInjectable;
