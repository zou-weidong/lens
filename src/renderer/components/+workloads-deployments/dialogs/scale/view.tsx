/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { Component } from "react";
import { computed, observable, makeObservable, IObservableValue } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import type { Deployment, DeploymentApi } from "../../../../../common/k8s-api/endpoints";
import { Icon } from "../../../icon";
import { Slider } from "../../../slider";
import { cssNames } from "../../../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import deploymentScaleDialogStateInjectable from "./state.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import closeDeploymentScaleDialogInjectable from "./close.injectable";
import deploymentApiInjectable from "../../../../../common/k8s-api/endpoints/deployment.api.injectable";

export interface DeploymentScaleDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  deploymentApi: DeploymentApi;
  errorNotification: ErrorNotification;
  state: IObservableValue<Deployment | undefined>;
  close: () => void;
}

@observer
class NonInjectedDeploymentScaleDialog extends Component<DeploymentScaleDialogProps & Dependencies> {
  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  constructor(props: DeploymentScaleDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get scaleMax() {
    const { currentReplicas } = this;
    const defaultMax = 50;

    return currentReplicas <= defaultMax
      ? defaultMax * 2
      : currentReplicas * 2;
  }

  onOpen = async (deployment: Deployment) => {
    this.currentReplicas = await this.props.deploymentApi.getReplicas({
      namespace: deployment.getNs(),
      name: deployment.getName(),
    });
    this.desiredReplicas = this.currentReplicas;
    this.ready = true;
  };

  onClose = () => {
    this.ready = false;
  };

  onChange = (evt: React.ChangeEvent, value: number) => {
    this.desiredReplicas = value;
  };

  scale = async (deployment: Deployment) => {
    const { currentReplicas, desiredReplicas } = this;

    try {
      if (currentReplicas !== desiredReplicas) {
        await this.props.deploymentApi.scale({
          name: deployment.getName(),
          namespace: deployment.getNs(),
        }, desiredReplicas);
      }
      this.props.close();
    } catch (err) {
      this.props.errorNotification(err);
    }
  };

  private readonly scaleMin = 0;

  desiredReplicasUp = () => {
    this.desiredReplicas = Math.min(this.scaleMax, this.desiredReplicas + 1);
  };

  desiredReplicasDown = () => {
    this.desiredReplicas = Math.max(this.scaleMin, this.desiredReplicas - 1);
  };

  renderContents(deployment: Deployment) {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;

    return (
      <Wizard
        header={<h5>Scale Deployment <span>{deployment.getName()}</span></h5>}
        done={this.props.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.scale(deployment)}
          nextLabel="Scale"
          disabledNext={!this.ready}
        >
          <div className="current-scale" data-testid="current-scale">
            Current replica scale: {currentReplicas}
          </div>
          <div className="flex gaps align-center">
            <div className="desired-scale" data-testid="desired-scale">
              Desired number of replicas: {desiredReplicas}
            </div>
            <div className="slider-container flex align-center">
              <Slider value={desiredReplicas} max={scaleMax} onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}/>
            </div>
            <div className="plus-minus-container flex gaps">
              <Icon
                material="add_circle_outline"
                onClick={this.desiredReplicasUp}
                data-testid="desired-replicas-up"
              />
              <Icon
                material="remove_circle_outline"
                onClick={this.desiredReplicasDown}
                data-testid="desired-replicas-down"
              />
            </div>
          </div>
          {warning && (
            <div className="warning" data-testid="warning">
              <Icon material="warning"/>
              High number of replicas may cause cluster performance issues
            </div>
          )}
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, close, state, errorNotification, ...dialogProps } = this.props;
    const deployment = state.get();
    const isOpen = Boolean(deployment);

    return (
      <Dialog
        {...dialogProps}
        isOpen={isOpen}
        className={cssNames("DeploymentScaleDialog", className)}
        onOpen={() => this.onOpen(deployment)}
        onClose={this.onClose}
        close={close}
      >
        {deployment && this.renderContents(deployment)}
      </Dialog>
    );
  }
}

export const DeploymentScaleDialog = withInjectables<Dependencies, DeploymentScaleDialogProps>(NonInjectedDeploymentScaleDialog, {
  getProps: (di, props) => ({
    ...props,
    deploymentApi: di.inject(deploymentApiInjectable),
    state: di.inject(deploymentScaleDialogStateInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    close: di.inject(closeDeploymentScaleDialogInjectable),
  }),
});
