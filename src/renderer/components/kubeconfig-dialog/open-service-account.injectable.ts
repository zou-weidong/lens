/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ServiceAccount } from "../../../common/k8s-api/endpoints";
import { getInjectable } from "@ogre-tools/injectable";
import openKubeconfigDialogInjectable from "./open.injectable";
import apiBaseInjectable from "../../k8s-api/api-base.injectable";

export type OpenServiceAccountKubeconfigDialog = (account: ServiceAccount) => void;

const openServiceAccountKubeconfigDialogInjectable = getInjectable({
  instantiate: (di): OpenServiceAccountKubeconfigDialog => {
    const openKubeconfigDialog = di.inject(openKubeconfigDialogInjectable);
    const apiBase = di.inject(apiBaseInjectable);

    return (account) => {
      const accountName = account.getName();
      const namespace = account.getNs();

      openKubeconfigDialog({
        title: `${accountName} kubeconfig`,
        loader: () => apiBase.get(`/kubeconfig/service-account/${namespace}/${accountName}`),
      });
    };
  },
  id: "open-service-account-kubeconfig-dialog",
});

export default openServiceAccountKubeconfigDialogInjectable;

