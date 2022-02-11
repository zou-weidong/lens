/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ForwardedPort } from "../../../port-forward/item";
import { noop } from "../../../utils";
import portForwardDialogStateInjectable from "./state.injectable";

export interface PortForwardDialogOpenOptions {
  openInBrowser: boolean;
  onClose: () => void;
}

export type OpenPortForwardDialog = (portForward: ForwardedPort, options?: PortForwardDialogOpenOptions) => void;

const openPortForwardDialogInjectable = getInjectable({
  instantiate: (di): OpenPortForwardDialog => {
    const state = di.inject(portForwardDialogStateInjectable);

    return (portForward, options = { onClose: noop, openInBrowser: false }) => {
      state.set({
        portForward,
        useHttps: portForward.protocol === "https",
        ...options,
      });
    };
  },
  id: "open-port-forward-dialog",
});

export default openPortForwardDialogInjectable;
