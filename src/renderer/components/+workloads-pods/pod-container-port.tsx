/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-port.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { action, makeObservable, observable, reaction } from "mobx";
import { cssNames } from "../../utils";
import { Button } from "../button";
import type { ForwardedPort } from "../../port-forward/item";
import { Spinner } from "../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/store.injectable";
import type { PortForwardStore } from "../../port-forward/store";
import type { OpenPortForwardDialog } from "../+network-port-forwards/dialog/open.injectable";
import { predictProtocol } from "../../port-forward/utils";
import type { OpenPortForward } from "../../port-forward/open.injectable";
import { Notifications } from "../../../extensions/renderer-api/components";
import type { AboutPortForwardingNotification } from "../../port-forward/about-notification.injectable";
import type { PortForwardingErrorNotification } from "../../port-forward/error-notification.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { LensLogger } from "../../../common/logger";
import podsLoggerInjectable from "./logger.injectable";
import openPortForwardDialogInjectable from "../+network-port-forwards/dialog/open.injectable";
import aboutPortForwardingNotificationInjectable from "../../port-forward/about-notification.injectable";
import portForwardingErrorNotificationInjectable from "../../port-forward/error-notification.injectable";
import openPortForwardInjectable from "../../port-forward/open.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";

export interface PodContainerPortProps {
  pod: Pod;
  port: {
    name?: string;
    containerPort: number;
    protocol: string;
  };
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  openPortForwardDialog: OpenPortForwardDialog;
  openPortForward: OpenPortForward;
  aboutPortForwardingNotification: AboutPortForwardingNotification;
  portForwardingErrorNotification: PortForwardingErrorNotification;
  errorNotification: ErrorNotification;
  logger: LensLogger;
}

@observer
class NonInjectedPodContainerPort extends React.Component<PodContainerPortProps & Dependencies> {
  @observable waiting = false;
  @observable forwardPort = 0;
  @observable isPortForwarded = false;
  @observable isActive = false;

  constructor(props: PodContainerPortProps & Dependencies) {
    super(props);
    makeObservable(this);
    this.checkExistingPortForwarding();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.pod, () => this.checkExistingPortForwarding()),
    ]);
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  @action
  async checkExistingPortForwarding() {
    const { pod, port } = this.props;
    let portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
      forwardPort: this.forwardPort,
    };

    try {
      portForward = await this.portForwardStore.getPortForward(portForward);
    } catch (error) {
      this.isPortForwarded = false;
      this.isActive = false;

      return;
    }

    this.forwardPort = portForward.forwardPort;
    this.isPortForwarded = true;
    this.isActive = portForward.status === "Active";
  }

  @action
  async portForward() {
    const { pod, port } = this.props;
    let portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
      forwardPort: this.forwardPort,
      protocol: predictProtocol(port.name),
      status: "Active",
    };

    this.waiting = true;

    try {
      // determine how many port-forwards already exist
      const { length } = this.portForwardStore.getPortForwards();

      if (!this.isPortForwarded) {
        portForward = await this.portForwardStore.add(portForward);
      } else if (!this.isActive) {
        portForward = await this.portForwardStore.start(portForward);
      }

      if (portForward.status === "Active") {
        this.props.openPortForward(portForward);

        // if this is the first port-forward show the about notification
        if (!length) {
          this.props.aboutPortForwardingNotification();
        }
      } else {
        this.props.portForwardingErrorNotification(`Error occurred starting port-forward, the local port may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
      }
    } catch (error) {
      this.props.logger.error(String(error), portForward);
    } finally {
      this.checkExistingPortForwarding();
      this.waiting = false;
    }
  }

  @action
  async stopPortForward() {
    const { pod, port } = this.props;
    const portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
      forwardPort: this.forwardPort,
    };

    this.waiting = true;

    try {
      await this.portForwardStore.remove(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}.`);
    } finally {
      this.checkExistingPortForwarding();
      this.forwardPort = 0;
      this.waiting = false;
    }
  }

  render() {
    const { pod, port } = this.props;
    const { name, containerPort, protocol } = port;
    const text = `${name ? `${name}: ` : ""}${containerPort}/${protocol}`;

    const portForwardAction = action(async () => {
      if (this.isPortForwarded) {
        await this.stopPortForward();
      } else {
        const portForward: ForwardedPort = {
          kind: "pod",
          name: pod.getName(),
          namespace: pod.getNs(),
          port: port.containerPort,
          forwardPort: this.forwardPort,
          protocol: predictProtocol(port.name),
        };

        this.props.openPortForwardDialog(portForward, { openInBrowser: true, onClose: () => this.checkExistingPortForwarding() });
      }
    });

    return (
      <div className={cssNames("PodContainerPort", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward()}>
          {text}
        </span>
        <Button primary onClick={portForwardAction}> {this.isPortForwarded ? (this.isActive ? "Stop/Remove" : "Remove") : "Forward..."} </Button>
        {this.waiting && (
          <Spinner />
        )}
      </div>
    );
  }
}

export const PodContainerPort = withInjectables<Dependencies, PodContainerPortProps>(NonInjectedPodContainerPort, {
  getProps: (di, props) => ({
    ...props,
    portForwardStore: di.inject(portForwardStoreInjectable),
    logger: di.inject(podsLoggerInjectable),
    aboutPortForwardingNotification: di.inject(aboutPortForwardingNotificationInjectable),
    portForwardingErrorNotification: di.inject(portForwardingErrorNotificationInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    openPortForward: di.inject(openPortForwardInjectable),
    openPortForwardDialog: di.inject(openPortForwardDialogInjectable),
  }),
});
