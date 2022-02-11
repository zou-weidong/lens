/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { defaultHotbarCells } from "../../common/hotbars/hotbar-types";
import { onTooManyHotbarItemsInjectionToken } from "../../common/hotbars/too-many-items.token";
import errorNotificationInjectable from "../components/notifications/error.injectable";

const onTooManyHotbarItemsInjectable = getInjectable({
  instantiate: (di) => {
    const errorNotification = di.inject(errorNotificationInjectable);

    return () => {
      errorNotification(`Cannot have more than ${defaultHotbarCells} items pinned to a hotbar`);
    };
  },
  injectionToken: onTooManyHotbarItemsInjectionToken,
  id: "on-too-many-hotbar-items",
});

export default onTooManyHotbarItemsInjectable;
