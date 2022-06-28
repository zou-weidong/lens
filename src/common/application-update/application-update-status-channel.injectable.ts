/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";

export type ApplicationUpdateStatusEventId =
  "checking-for-updates"
  | "no-updates-available"
  | "download-for-update-started"
  | "download-for-update-failed";

export type ApplicationUpdateStatusChannelMessage = {
  eventId: "checking-for-updates" | "no-updates-available" | "download-for-update-failed";
} | {
  eventId: "download-for-update-started";
  version: string;
};

export type ApplicationUpdateStatusChannel = MessageChannel<ApplicationUpdateStatusChannelMessage>;

const applicationUpdateStatusChannelInjectable = getInjectable({
  id: "application-update-status-channel",

  instantiate: (): ApplicationUpdateStatusChannel => ({
    id: "application-update-status-channel",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default applicationUpdateStatusChannelInjectable;
