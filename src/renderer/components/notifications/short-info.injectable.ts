/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../utils";
import { SpecificNotifcationCreateArgs, NotificationKind, NotificationMessage, NotificationsStore } from "./store";
import notificationsStoreInjectable from "./store.injectable";

export type ShortInfoNotification = (message: NotificationMessage, customOpts?: SpecificNotifcationCreateArgs) => Disposer;

interface Dependencies {
  store: NotificationsStore;
}

const shortInfoNotification = ({ store }: Dependencies): ShortInfoNotification => (
  (message, customOpts) => store.add({
    timeout: 5_000,
    ...customOpts ?? {},
    kind: NotificationKind.INFO,
    message,
  })
);

const shortInfoNotificationInjectable = getInjectable({
  instantiate: (di) => shortInfoNotification({
    store: di.inject(notificationsStoreInjectable),
  }),
  id: "short-info-notification",
});

export default shortInfoNotificationInjectable;
