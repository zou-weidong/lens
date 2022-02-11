/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { OpenStatefulSetScaleDialog } from "./dialogs/scale/open.injectable";
import openStatefulSetScaleDialogInjectable from "./dialogs/scale/open.injectable";

export type StatefulSetMenuProps = KubeObjectMenuProps<StatefulSet>;

interface Dependencies {
  openStatefulSetScaleDialog: OpenStatefulSetScaleDialog;
}

const NonInjectedStatefulSetMenu = observer(({
  object,
  toolbar,
  openStatefulSetScaleDialog,
}: Dependencies & StatefulSetMenuProps) => (
  <>
    <MenuItem onClick={() => openStatefulSetScaleDialog(object)}>
      <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
      <span className="title">Scale</span>
    </MenuItem>
  </>
));

export const StatefulSetMenu = withInjectables<Dependencies, StatefulSetMenuProps>(NonInjectedStatefulSetMenu, {
  getProps: (di, props) => ({
    ...props,
    openStatefulSetScaleDialog: di.inject(openStatefulSetScaleDialogInjectable),
  }),
});
