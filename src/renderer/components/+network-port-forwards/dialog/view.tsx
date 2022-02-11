/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { Component } from "react";
import type { IObservableValue } from "mobx";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import { Input } from "../../input";
import { cssNames } from "../../../utils";
import type { PortForwardStore } from "../../../port-forward/store";
import { Checkbox } from "../../checkbox";
import { withInjectables } from "@ogre-tools/injectable-react";
import logger from "../../../../common/logger";
import portForwardStoreInjectable from "../../../port-forward/store.injectable";
import type { PortForwardDialogState } from "./state.injectable";
import closePortForwardDialogInjectable from "./close.injectable";
import portForwardDialogStateInjectable from "./state.injectable";
import type { OpenPortForward } from "../../../port-forward/open.injectable";
import type { PortForwardingErrorNotification } from "../../../port-forward/error-notification.injectable";
import type { AboutPortForwardingNotification } from "../../../port-forward/about-notification.injectable";
import aboutPortForwardingNotificationInjectable from "../../../port-forward/about-notification.injectable";
import openPortForwardInjectable from "../../../port-forward/open.injectable";
import portForwardingErrorNotificationInjectable from "../../../port-forward/error-notification.injectable";

export interface PortForwardDialogProps extends Omit<DialogProps, "isOpen" | "close" | "onOpen" | "onClose"> {}

interface Dependencies {
  portForwardStore: PortForwardStore;
  state: IObservableValue<PortForwardDialogState | undefined>;
  close: () => void;
  openPortForward: OpenPortForward;
  portForwardingErrorNotification: PortForwardingErrorNotification;
  aboutPortForwardingNotification: AboutPortForwardingNotification;
}

@observer
class NonInjectedPortForwardDialog extends Component<PortForwardDialogProps & Dependencies> {
  @observable currentPort = 0;
  @observable desiredPort = 0;

  constructor(props: PortForwardDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  onOpen = async () => {
    this.currentPort = +this.props.state.get().portForward.forwardPort;
    this.desiredPort = this.currentPort;
  };

  changePort = (value: string) => {
    this.desiredPort = Number(value);
  };

  startPortForward = async () => {
    const dialogState = this.props.state.get();

    if (!dialogState) {
      return;
    }

    let { portForward } = dialogState;
    const { useHttps, openInBrowser } = dialogState;
    const { currentPort, desiredPort } = this;

    try {
      // determine how many port-forwards already exist
      const { length } = this.portForwardStore.getPortForwards();

      portForward.protocol = useHttps ? "https" : "http";

      if (currentPort) {
        const wasRunning = portForward.status === "Active";

        portForward = await this.portForwardStore.modify(portForward, desiredPort);

        if (wasRunning && portForward.status === "Disabled") {
          this.props.portForwardingErrorNotification(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        }
      } else {
        portForward.forwardPort = desiredPort;
        portForward = await this.portForwardStore.add(portForward);

        if (portForward.status === "Disabled") {
          this.props.portForwardingErrorNotification(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        } else {
          // if this is the first port-forward show the about notification
          if (!length) {
            this.props.aboutPortForwardingNotification();
          }
        }
      }

      if (portForward.status === "Active" && openInBrowser) {
        this.props.openPortForward(portForward);
      }
    } catch (error) {
      logger.error(`[PORT-FORWARD-DIALOG]: ${error}`, portForward);
    } finally {
      this.props.close();
    }
  };

  renderContents(state: PortForwardDialogState) {
    return (
      <Wizard
        header={<h5>Port Forwarding for <span>{state.portForward.name}</span></h5>}
        done={close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={this.startPortForward}
          nextLabel={this.currentPort === 0 ? "Start" : "Modify"}
        >
          <div className="flex column gaps align-left">
            <div className="input-container flex align-center">
              <div className="current-port" data-testid="current-port">
              Local port to forward from:
              </div>
              <Input className="portInput"
                type="number"
                min="0"
                max="65535"
                value={this.desiredPort === 0 ? "" : String(this.desiredPort)}
                placeholder={"Random"}
                onChange={this.changePort}
              />
            </div>
            <Checkbox
              data-testid="port-forward-https"
              label="https"
              value={state.useHttps}
              onChange={value => state.useHttps = value}
            />
            <Checkbox
              data-testid="port-forward-open"
              label="Open in Browser"
              value={state.openInBrowser}
              onChange={value => state.openInBrowser = value}
            />
          </div>
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, portForwardStore, state, close, ...dialogProps } = this.props;
    const dialogState = state.get();

    return (
      <Dialog
        {...dialogProps}
        isOpen={Boolean(dialogState)}
        className={cssNames("PortForwardDialog", className)}
        onOpen={this.onOpen}
        close={close}
        onClose={dialogState?.onClose}
      >
        {dialogState && this.renderContents(dialogState)}
      </Dialog>
    );
  }
}

export const PortForwardDialog = withInjectables<Dependencies, PortForwardDialogProps>(NonInjectedPortForwardDialog, {
  getProps: (di, props) => ({
    ...props,
    portForwardStore: di.inject(portForwardStoreInjectable),
    close: di.inject(closePortForwardDialogInjectable),
    state: di.inject(portForwardDialogStateInjectable),
    aboutPortForwardingNotification: di.inject(aboutPortForwardingNotificationInjectable),
    openPortForward: di.inject(openPortForwardInjectable),
    portForwardingErrorNotification: di.inject(portForwardingErrorNotificationInjectable),
  }),
});
