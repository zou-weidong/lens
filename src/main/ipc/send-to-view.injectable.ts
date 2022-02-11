/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { iter, noop } from "../../common/utils";
import clusterFramesInjectable, { ClusterFrames } from "../clusters/frames.injectable";
import type { WindowManager } from "../window/manager";
import windowManagerInjectable from "../window/manager.injectable";

export type SendToView = (channel: string, args: any[], frameId: number | undefined) => void;

interface Dependencies {
  clusterFrames: ClusterFrames;
  windowManager: WindowManager;
}

const sendToView = ({ clusterFrames, windowManager }: Dependencies): SendToView => (
  (channel, args, frameId) => {
    windowManager.ensureMainWindow()
      .then(window => {
        if (typeof frameId === "number") {
          const frameInfo = iter.find(clusterFrames.values(), frameInfo => frameInfo.frameId === frameId);

          if (!frameInfo) {
            throw new Error(`Cannot send to view with frameId=${frameId}, does not exist`);
          }

          window.webContents.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
        } else {
          window.webContents.send(channel, ...args);
        }
      })
      .catch(noop);
  }
);

const sendToViewInjectable = getInjectable({
  instantiate: (di) => sendToView({
    clusterFrames: di.inject(clusterFramesInjectable),
    windowManager: di.inject(windowManagerInjectable),
  }),
  id: "send-to-view",
});

export default sendToViewInjectable;
