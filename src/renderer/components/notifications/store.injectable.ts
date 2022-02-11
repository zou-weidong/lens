/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NotificationsStore } from "./store";

const notificationsStoreInjectable = getInjectable({
  instantiate: () => new NotificationsStore(),
  id: "notifications-store",
});

export default notificationsStoreInjectable;
