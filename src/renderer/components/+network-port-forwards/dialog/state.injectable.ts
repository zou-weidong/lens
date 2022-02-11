/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ForwardedPort } from "../../../port-forward/item";
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface PortForwardDialogState {
  portForward: ForwardedPort;
  openInBrowser: boolean;
  useHttps: boolean;
  onClose: () => void;
}

const portForwardDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<PortForwardDialogState | undefined>(undefined),
  id: "port-forward-dialog-state",
});

export default portForwardDialogStateInjectable;

