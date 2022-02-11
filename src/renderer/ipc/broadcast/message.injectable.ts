/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { broadcastMessageInjectionToken } from "../../../common/ipc/broadcast/message.token";
import { implWithSend } from "../impl-channel";

const broadcastMessageInjectable = implWithSend(broadcastMessageInjectionToken);

export default broadcastMessageInjectable;
