/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { updateAvailableRespondInjectionToken } from "../../../common/ipc/updates/respond.token";
import { implWithSend } from "../impl-channel";

const updateAvailableRespondInjectable = implWithSend(updateAvailableRespondInjectionToken);

export default updateAvailableRespondInjectable;
