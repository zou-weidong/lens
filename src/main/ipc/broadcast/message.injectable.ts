/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IpcMain, WebContents } from "electron";
import { BroadcastMessage, broadcastMessageInjectionToken } from "../../../common/ipc/broadcast/message.token";
import ipcLoggerInjectable from "../../../common/ipc/logger.injectable";
import type { LensLogger } from "../../../common/logger";
import { toJS } from "../../../common/utils";
import clusterFramesInjectable, { ClusterFrames } from "../../clusters/frames.injectable";
import getAllWebContentsInjectable, { GetAllWebContents } from "../../window/get-all-web-contents.injectable";
import { implWithOn } from "../impl-channel";
import ipcMainInjectable from "../ipc-main.injectable";

function safeGetViewType(view: WebContents): string {
  try {
    return view.getType();
  } catch {
    return "unknown";
  }
}

interface Dependencies {
  ipcMain: IpcMain;
  getAllWebContents: GetAllWebContents;
  clusterFrames: ClusterFrames;
  logger: LensLogger;
}

const broadcastMessage = ({ ipcMain, getAllWebContents, clusterFrames, logger }: Dependencies): BroadcastMessage => (
  (channel, ...args) => {
    for (const listerner of ipcMain.listeners(channel)) {
      listerner(
        {
          processId: undefined,
          frameId: undefined,
          sender: undefined,
          senderFrame: undefined,
        },
        ...args,
      );
    }

    args = args.map(toJS); // sanitize out observables

    for (const view of getAllWebContents()) {
      if (view.isDestroyed()) {
        continue;
      }

      const viewType = safeGetViewType(view);

      // Send message to views.
      try {
        logger.debug(`broadcasting "${channel}" to ${viewType}=${view.id}`, { args });
        view.send(channel, ...args);
      } catch (error) {
        logger.error(`failed to send IPC message "${channel}" to view "${viewType}=${view.id}"`, { error });
      }

      for (const frameInfo of clusterFrames.values()) {
        logger.debug(`broadcasting "${channel}" to subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { args });

        try {
          view.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
        } catch (error) {
          logger.error(`failed to send IPC message "${channel}" to view "${viewType}=${view.id}"'s subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { error: String(error) });
        }
      }
    }
  }
);

const broadcastMessageInjectable = implWithOn(broadcastMessageInjectionToken, async (di) => (
  broadcastMessage({
    ipcMain: await di.inject(ipcMainInjectable),
    getAllWebContents: await di.inject(getAllWebContentsInjectable),
    clusterFrames: await di.inject(clusterFramesInjectable),
    logger: await di.inject(ipcLoggerInjectable),
  })
));

export default broadcastMessageInjectable;
