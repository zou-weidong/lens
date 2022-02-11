/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { emitInvalidProtocolUrlInjectionToken } from "../../../../common/ipc/protocol-handler/invalid.token";
import errorNotificationInjectable from "../../../components/notifications/error.injectable";
import { implWithOn } from "../../impl-channel";

const routeInvalidInjectable = implWithOn(emitInvalidProtocolUrlInjectionToken, async (di) => {
  const errorNotification = await di.inject(errorNotificationInjectable);

  return (url, error) => {
    errorNotification(
      <>
        <p>
          Failed to route <code>{url}</code>.
        </p>
        <p>
          <b>Error:</b> {error}
        </p>
      </>,
    );
  };
});

export default routeInvalidInjectable;
