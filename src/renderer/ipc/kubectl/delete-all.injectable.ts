/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kubectlDeleteAllInjectionToken } from "../../../common/ipc/kubectl/delete-all.token";
import { implWithInvoke } from "../impl-channel";

const kubectlDeleteAllInjectable = implWithInvoke(kubectlDeleteAllInjectionToken);

export default kubectlDeleteAllInjectable;
