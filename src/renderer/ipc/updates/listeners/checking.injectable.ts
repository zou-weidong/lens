/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { CheckingForUpdates, emitCheckingForUpdatesInjectionToken } from "../../../../common/ipc/updates/checking/emit.token";
import shortInfoNotificationInjectable, { ShortInfoNotification } from "../../../components/notifications/short-info.injectable";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

interface Dependencies {
  shortInfoNotification: ShortInfoNotification;
}

const getListener = ({ shortInfoNotification }: Dependencies): CheckingForUpdates => (
  () => {
    shortInfoNotification("Checking for updates");
  }
);

const initUpdateCheckingListenerInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const listener = getListener({
      shortInfoNotification: di.inject(shortInfoNotificationInjectable),
    });

    return () => emitCheckingForUpdatesInjectionToken.setupListener(ipcRenderer, listener);
  },
  id: "init-update-checking-listener",
});

export default initUpdateCheckingListenerInjectable;
