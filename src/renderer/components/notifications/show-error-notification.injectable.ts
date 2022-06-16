/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { NotificationMessage, CreateNotificationOptions } from "./notifications.store";
import { NotificationStatus } from "./notifications.store";
import notificationsStoreInjectable from "./notifications-store.injectable";
import type { Disposer } from "../../utils";

export type ShowErrorNotification = (message: NotificationMessage, customOpts?: CreateNotificationOptions) => Disposer;

const showErrorNotificationInjectable = getInjectable({
  id: "show-error-notification",

  instantiate: (di): ShowErrorNotification => {
    const store = di.inject(notificationsStoreInjectable);

    return (message, customOpts = {}) => store.add({
      status: NotificationStatus.ERROR,
      timeout: 5000,
      message,
      ...customOpts,
    });
  },
});

export default showErrorNotificationInjectable;
