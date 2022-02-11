/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { boundMethod, cssNames } from "../../utils";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/store.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import type { PortForwardItem } from "../../port-forward/item";
import type { PortForwardStore } from "../../port-forward/store";
import type { OpenPortForward } from "../../port-forward/open.injectable";
import openPortForwardInjectable from "../../port-forward/open.injectable";
import type { OpenPortForwardDialog } from "./dialog/open.injectable";
import openPortForwardDialogInjectable from "./dialog/open.injectable";

export interface PortForwardMenuProps extends MenuActionsProps {
  portForward: PortForwardItem;
  hideDetails?(): void;
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  openPortForward: OpenPortForward;
  openPortForwardDialog: OpenPortForwardDialog;
  errorNotification: ErrorNotification;
}

class NonInjectedPortForwardMenu extends React.Component<PortForwardMenuProps & Dependencies> {
  @boundMethod
  remove() {
    const { portForward } = this.props;

    try {
      this.portForwardStore.remove(portForward);
    } catch (error) {
      this.props.errorNotification(`Error occurred stopping the port-forward from port ${portForward.forwardPort}. The port-forward may still be active.`);
    }
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  private startPortForwarding = async () => {
    const { portForward } = this.props;

    const pf = await this.portForwardStore.start(portForward);

    if (pf.status === "Disabled") {
      const { name, kind, forwardPort } = portForward;

      this.props.errorNotification(`Error occurred starting port-forward, the local port ${forwardPort} may not be available or the ${kind} ${name} may not be reachable`);
    }
  };

  renderStartStopMenuItem() {
    const { portForward, toolbar } = this.props;

    if (portForward.status === "Active") {
      return (
        <MenuItem onClick={() => this.portForwardStore.stop(portForward)}>
          <Icon material="stop" tooltip="Stop port-forward" interactive={toolbar} />
          <span className="title">Stop</span>
        </MenuItem>
      );
    }

    return (
      <MenuItem onClick={this.startPortForwarding}>
        <Icon material="play_arrow" tooltip="Start port-forward" interactive={toolbar} />
        <span className="title">Start</span>
      </MenuItem>
    );
  }

  renderContent() {
    const { portForward, toolbar } = this.props;

    if (!portForward) return null;

    return (
      <>
        { portForward.status === "Active" &&
          <MenuItem onClick={() => this.props.openPortForward(portForward)}>
            <Icon material="open_in_browser" interactive={toolbar} tooltip="Open in browser" />
            <span className="title">Open</span>
          </MenuItem>
        }
        <MenuItem onClick={() => this.props.openPortForwardDialog(portForward)}>
          <Icon material="edit" tooltip="Change port or protocol" interactive={toolbar} />
          <span className="title">Edit</span>
        </MenuItem>
        {this.renderStartStopMenuItem()}
      </>
    );
  }

  render() {
    const { className, ...menuProps } = this.props;

    return (
      <MenuActions
        {...menuProps}
        className={cssNames("PortForwardMenu", className)}
        removeAction={this.remove}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}

export const PortForwardMenu = withInjectables<Dependencies, PortForwardMenuProps>(NonInjectedPortForwardMenu, {
  getProps: (di, props) => ({
    ...props,
    portForwardStore: di.inject(portForwardStoreInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    openPortForward: di.inject(openPortForwardInjectable),
    openPortForwardDialog: di.inject(openPortForwardDialogInjectable),
  }),
});
