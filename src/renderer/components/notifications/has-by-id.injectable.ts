/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import notificationsStoreInjectable from "./store.injectable";

export type HasNotificationById = (id: string) => boolean;

const hasNotificationByIdInjectable = getInjectable({
  instantiate: (di): HasNotificationById => {
    const store = di.inject(notificationsStoreInjectable);

    return (id) => store.hasById(id);
  },
  id: "has-notification-by-id",
});

export default hasNotificationByIdInjectable;
