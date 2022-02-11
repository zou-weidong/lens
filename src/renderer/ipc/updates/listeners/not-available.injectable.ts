/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { emitUpdateNotAvailableInjectionToken, UpdateNotAvailable } from "../../../../common/ipc/updates/not-available/emit.token";
import type { ShortInfoNotification } from "../../../components/notifications/short-info.injectable";
import shortInfoNotificationInjectable from "../../../components/notifications/short-info.injectable";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

interface Dependencies {
  shortInfoNotification: ShortInfoNotification;
}

const getListener = ({ shortInfoNotification }: Dependencies): UpdateNotAvailable => (
  () => {
    shortInfoNotification("No update is currently available");
  }
);

const initUpdateNotAvailableListenerInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const listener = getListener({
      shortInfoNotification: di.inject(shortInfoNotificationInjectable),
    });

    return () => emitUpdateNotAvailableInjectionToken.setupListener(ipcRenderer, listener);
  },
  id: "init-update-not-available-listener",
});

export default initUpdateNotAvailableListenerInjectable;
