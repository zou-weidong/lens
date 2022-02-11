/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import type { StatefulSet, StatefulSetApi } from "../../../../../common/k8s-api/endpoints";
import React, { Component } from "react";
import { computed, IObservableValue, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import { Icon } from "../../../icon";
import { Slider } from "../../../slider";
import { cssNames } from "../../../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import statefulSetScaleDialogStateInjectable from "./state.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import closeStatefulSetScaleDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import statefulSetApiInjectable from "../../../../../common/k8s-api/endpoints/stateful-set.api.injectable";

export interface StatefulSetScaleDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  statefulSetApi: StatefulSetApi;
  state: IObservableValue<StatefulSet | undefined>;
  close: () => void;
  errorNotification: ErrorNotification;
}

@observer
class NonInjectedStatefulSetScaleDialog extends Component<StatefulSetScaleDialogProps & Dependencies> {
  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  constructor(props: StatefulSetScaleDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  onOpen = async (statefulSet: StatefulSet) => {
    this.currentReplicas = await this.props.statefulSetApi.getReplicas({
      namespace: statefulSet.getNs(),
      name: statefulSet.getName(),
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

  @computed get scaleMax() {
    const { currentReplicas } = this;
    const defaultMax = 50;

    return currentReplicas <= defaultMax
      ? defaultMax * 2
      : currentReplicas * 2;
  }

  scale = async (statefulSet: StatefulSet) => {
    const { currentReplicas, desiredReplicas } = this;

    try {
      if (currentReplicas !== desiredReplicas) {
        await this.props.statefulSetApi.scale({
          name: statefulSet.getName(),
          namespace: statefulSet.getNs(),
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

  renderContents(statefulSet: StatefulSet) {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;

    return (
      <Wizard
        header={<h5>Scale Stateful Set <span>{statefulSet.getName()}</span></h5>}
        done={this.props.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.scale(statefulSet)}
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
            <div className="slider-container flex align-center" data-testid="slider">
              <Slider value={desiredReplicas} max={scaleMax}
                onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}
              />
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
    const { className, close, errorNotification, state, ...dialogProps } = this.props;
    const statefulSet = state.get();
    const isOpen = Boolean(statefulSet);

    return (
      <Dialog
        {...dialogProps}
        isOpen={isOpen}
        className={cssNames("StatefulSetScaleDialog", className)}
        onOpen={() => this.onOpen(statefulSet)}
        onClose={this.onClose}
        close={close}
      >
        {statefulSet && this.renderContents(statefulSet)}
      </Dialog>
    );
  }
}

export const StatefulSetScaleDialog = withInjectables<Dependencies, StatefulSetScaleDialogProps>(NonInjectedStatefulSetScaleDialog, {
  getProps: (di, props) => ({
    ...props,
    state: di.inject(statefulSetScaleDialogStateInjectable),
    statefulSetApi: di.inject(statefulSetApiInjectable),
    close: di.inject(closeStatefulSetScaleDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
  }),
});
