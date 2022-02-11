/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kubectlApplyAllInjectionToken } from "../../../common/ipc/kubectl/apply-all.token";
import { implWithInvoke } from "../impl-channel";

const kubectlApplyAllInjectable = implWithInvoke(kubectlApplyAllInjectionToken);

export default kubectlApplyAllInjectable;
