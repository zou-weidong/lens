/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../utils";
import type { SpecificNotifcationCreateArgs, NotificationMessage, NotificationsStore } from "./store";
import { NotificationKind } from "./store";
import notificationsStoreInjectable from "./store.injectable";

export type ErrorNotification = (message: NotificationMessage, customOpts?: SpecificNotifcationCreateArgs) => Disposer;

interface Dependencies {
  store: NotificationsStore;
}

const errorNotification = ({ store }: Dependencies): ErrorNotification => (
  (message, customOpts) => store.add({
    timeout: 10_000,
    ...customOpts ?? {},
    kind: NotificationKind.ERROR,
    message,
  })
);

const errorNotificationInjectable = getInjectable({
  instantiate: (di) => errorNotification({
    store: di.inject(notificationsStoreInjectable),
  }),
  id: "error-notification",
});

export default errorNotificationInjectable;
