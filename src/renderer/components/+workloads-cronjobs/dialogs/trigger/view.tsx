/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { Component } from "react";
import type { IObservableValue } from "mobx";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import type { CronJob, CronJobApi, JobApi } from "../../../../../common/k8s-api/endpoints";
import { cssNames } from "../../../../utils";
import { Input } from "../../../input";
import { systemName, maxLength } from "../../../input/input_validators";
import type { KubeObjectMetadata } from "../../../../../common/k8s-api/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import cronJobTriggerDialogStateInjectable from "./state.injectable";
import closeCronJobTriggerDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import { cronJobApi, jobApi } from "../../../../../extensions/renderer-api/k8s-api";
import cronJobApiInjectable from "../../../../../common/k8s-api/endpoints/cron-job.api.injectable";
import jobApiInjectable from "../../../../../common/k8s-api/endpoints/job.api.injectable";

export interface CronJobTriggerDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  state: IObservableValue<CronJob | undefined>;
  close: () => void;
  errorNotification: ErrorNotification;
  cronJobApi: CronJobApi;
  jobApi: JobApi;
}

@observer
class NonInjectedCronJobTriggerDialog extends Component<CronJobTriggerDialogProps & Dependencies> {
  @observable jobName = "";
  @observable ready = false;

  constructor(props: CronJobTriggerDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  onOpen = action((cronJob: CronJob) => {
    this.jobName = `${cronJob.getName()}-manual-${Math.random().toString(36).slice(2, 7)}`.slice(0, 63);
    this.ready = true;
  });

  onClose = () => {
    this.ready = false;
  };

  trigger = async (cronJob: CronJob) => {
    try {
      const cronjobDefinition = await cronJobApi.get({
        name: cronJob.getName(),
        namespace: cronJob.getNs(),
      });

      await jobApi.create({
        name: this.jobName,
        namespace: cronJob.getNs(),
      }, {
        spec: cronjobDefinition.spec.jobTemplate.spec,
        metadata: {
          ownerReferences: [{
            apiVersion: cronJob.apiVersion,
            blockOwnerDeletion: true,
            controller: true,
            kind: cronJob.kind,
            name: cronJob.metadata.name,
            uid: cronJob.metadata.uid,
          }],
        } as KubeObjectMetadata,
      });

      this.props.close();
    } catch (err) {
      this.props.errorNotification(err);
    }
  };

  renderContents(cronJob: CronJob) {
    return (
      <Wizard
        header={<h5>Trigger CronJob <span>{cronJob.getName()}</span></h5>}
        done={this.props.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.trigger(cronJob)}
          nextLabel="Trigger"
          disabledNext={!this.ready}
        >
          <div className="flex gaps">
              Job name:
          </div>
          <div className="flex gaps">
            <Input
              required autoFocus
              placeholder={this.jobName}
              trim
              validators={[systemName, maxLength]}
              maxLength={63}
              value={this.jobName} onChange={v => this.jobName = v.toLowerCase()}
              className="box grow"
            />
          </div>
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, state, close, errorNotification, ...dialogProps } = this.props;
    const cronJob = state.get();
    const isOpen = Boolean(cronJob);

    return (
      <Dialog
        {...dialogProps}
        isOpen={isOpen}
        className={cssNames("CronJobTriggerDialog", className)}
        onOpen={() => this.onOpen(cronJob)}
        onClose={this.onClose}
        close={close}
      >
        {cronJob && this.renderContents(cronJob)}
      </Dialog>
    );
  }
}

export const CronJobTriggerDialog = withInjectables<Dependencies, CronJobTriggerDialogProps>(NonInjectedCronJobTriggerDialog, {
  getProps: (di, props) => ({
    ...props,
    state: di.inject(cronJobTriggerDialogStateInjectable),
    close: di.inject(closeCronJobTriggerDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    cronJobApi: di.inject(cronJobApiInjectable),
    jobApi: di.inject(jobApiInjectable),
  }),
});
