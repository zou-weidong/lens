/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

import type { KubeObjectMenuProps } from "../../kube-object-menu";
import type { ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { MenuItem } from "../../menu";
import { Icon } from "../../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { OpenServiceAccountKubeconfigDialog } from "../../kubeconfig-dialog/open-service-account.injectable";
import openServiceAccountKubeconfigDialogInjectable from "../../kubeconfig-dialog/open-service-account.injectable";

export type ServiceAccountMenuProps = KubeObjectMenuProps<ServiceAccount>;

interface Dependencies {
  openServiceAccountKubeconfigDialog: OpenServiceAccountKubeconfigDialog;
}

const NonInjectedServiceAccountMenu = observer(({
  openServiceAccountKubeconfigDialog,
  object,
  toolbar,
}: Dependencies & ServiceAccountMenuProps) => (
  <MenuItem onClick={() => openServiceAccountKubeconfigDialog(object)}>
    <Icon material="insert_drive_file" tooltip="Kubeconfig File" interactive={toolbar} />
    <span className="title">Kubeconfig</span>
  </MenuItem>
));

export const ServiceAccountMenu = withInjectables<Dependencies, ServiceAccountMenuProps>(NonInjectedServiceAccountMenu, {
  getProps: (di, props) => ({
    ...props,
    openServiceAccountKubeconfigDialog: di.inject(openServiceAccountKubeconfigDialogInjectable),
  }),
});
