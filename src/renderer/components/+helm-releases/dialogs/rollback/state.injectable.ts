/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { HelmRelease } from "../../../../../common/k8s-api/endpoints";
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface HelmReleaseRollbackDialogState {
  release: HelmRelease | undefined;
}

const helmReleaseRollbackDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<HelmRelease | undefined>(undefined),
  id: "helm-release-rollback-dialog-state",
});

export default helmReleaseRollbackDialogStateInjectable;

