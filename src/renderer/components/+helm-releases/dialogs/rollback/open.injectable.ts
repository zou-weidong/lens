/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRelease } from "../../../../../common/k8s-api/endpoints";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";

const openHelmReleaseRollbackDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(helmReleaseRollbackDialogStateInjectable);

    return (release: HelmRelease) => {
      state.set(release);
    };
  },
  id: "open-helm-release-rollback-dialog",
});

export default openHelmReleaseRollbackDialogInjectable;
