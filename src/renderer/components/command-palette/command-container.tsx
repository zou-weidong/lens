/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import "./command-container.scss";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { CommandDialog } from "./command-dialog";
import type { ClusterId } from "../../../common/clusters/cluster-types";
import type { CommandOverlay } from "./command-overlay.injectable";
import commandOverlayInjectable from "./command-overlay.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { AddWindowEventListener } from "../../window/event-listener.injectable";
import addWindowEventListenerInjectable from "../../window/event-listener.injectable";
import type { OpenCommandPallet } from "../../../common/ipc/command-pallet/open.injectable";
import openCommandPalletInjectable from "../../../common/ipc/command-pallet/open.injectable";
import type { ListenForOpen } from "../../ipc/command-pallet/listen-for-open.injectable";
import listenForOpenInjectable from "../../ipc/command-pallet/listen-for-open.injectable";
import type { GetMatchedClusterId } from "../../navigation/get-matched-cluster-id.injectable";
import getMatchedClusterIdInjectable from "../../navigation/get-matched-cluster-id.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";

export interface CommandContainerProps {
  clusterId?: ClusterId;
}

interface Dependencies {
  addWindowEventListener: AddWindowEventListener;
  commandOverlay: CommandOverlay;
  openCommandPallet: OpenCommandPallet;
  listenForOpen: ListenForOpen;
  getMatchedClusterId: GetMatchedClusterId;
  isMac: boolean;
}

@observer
class NonInjectedCommandContainer extends React.Component<CommandContainerProps & Dependencies> {
  private escHandler(event: KeyboardEvent) {
    const { commandOverlay } = this.props;

    if (event.key === "Escape") {
      event.stopPropagation();
      commandOverlay.close();
    }
  }

  openDialog = () => this.props.commandOverlay.open(<CommandDialog />);

  handleCommandPalette = () => {
    const clusterId = this.props.getMatchedClusterId();

    if (clusterId) {
      this.props.openCommandPallet(clusterId);
    } else {
      this.openDialog();
    }
  };

  onKeyboardShortcut(action: () => void) {
    return ({ key, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEvent) => {
      const ctrlOrCmd = this.props.isMac ? metaKey && !ctrlKey : !metaKey && ctrlKey;

      if (key === "p" && shiftKey && ctrlOrCmd && !altKey) {
        action();
      }
    };
  }

  componentDidMount() {
    const { clusterId, addWindowEventListener, listenForOpen } = this.props;
    const action = clusterId
      ? this.openDialog
      : this.handleCommandPalette;

    disposeOnUnmount(this, [
      listenForOpen(clusterId, action),
      addWindowEventListener("keydown", this.onKeyboardShortcut(action)),
      addWindowEventListener("keyup", (e) => this.escHandler(e), true),
    ]);
  }

  render() {
    const { commandOverlay } = this.props;

    return (
      <Dialog
        isOpen={commandOverlay.isOpen}
        animated={true}
        close={commandOverlay.close}
        modal={false}
      >
        <div id="command-container">
          {commandOverlay.component}
        </div>
      </Dialog>
    );
  }
}

export const CommandContainer = withInjectables<Dependencies, CommandContainerProps>(NonInjectedCommandContainer, {
  getProps: (di, props) => ({
    ...props,
    addWindowEventListener: di.inject(addWindowEventListenerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    openCommandPallet: di.inject(openCommandPalletInjectable),
    listenForOpen: di.inject(listenForOpenInjectable),
    getMatchedClusterId: di.inject(getMatchedClusterIdInjectable),
    isMac: di.inject(isMacInjectable),
  }),
});
