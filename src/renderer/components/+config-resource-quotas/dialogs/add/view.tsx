/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-quota.scss";

import React from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import { Input } from "../../../input";
import { systemName } from "../../../input/input_validators";
import type { IResourceQuotaValues, ResourceQuotaApi } from "../../../../../common/k8s-api/endpoints";
import { Select } from "../../../select";
import { Icon } from "../../../icon";
import { Button } from "../../../button";
import { NamespaceSelect } from "../../../+namespaces/namespace-select";
import { SubTitle } from "../../../layout/sub-title";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import closeAddQuotaDialogInjectable from "./close.injectable";
import type { AddQuotaDialogState } from "./state.injectable";
import addQuotaDialogStateInjectable from "./state.injectable";
import resourceQuotaApiInjectable from "../../../../../common/k8s-api/endpoints/resource-quota.api.injectable";

export interface AddQuotaDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  errorNotification: ErrorNotification;
  state: AddQuotaDialogState;
  close: () => void;
  resourceQuotaApi: ResourceQuotaApi;
}

function getDefaultQuotas(): IResourceQuotaValues {
  return {
    "limits.cpu": "",
    "limits.memory": "",
    "requests.cpu": "",
    "requests.memory": "",
    "requests.storage": "",
    "persistentvolumeclaims": "",
    "count/pods": "",
    "count/persistentvolumeclaims": "",
    "count/services": "",
    "count/secrets": "",
    "count/configmaps": "",
    "count/replicationcontrollers": "",
    "count/deployments.apps": "",
    "count/replicasets.apps": "",
    "count/statefulsets.apps": "",
    "count/jobs.batch": "",
    "count/cronjobs.batch": "",
    "count/deployments.extensions": "",
  };
}

const defaultNamespace = "default";

@observer
class NonInjectedAddQuotaDialog extends React.Component<AddQuotaDialogProps & Dependencies> {
  @observable quotaName = "";
  @observable quotaSelectValue = "";
  @observable quotaInputValue = "";
  @observable namespace = defaultNamespace;
  @observable quotas = getDefaultQuotas();

  constructor(props: AddQuotaDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get quotaEntries() {
    return Object.entries(this.quotas)
      .filter(([, value]) => !!value.trim());
  }

  @computed get quotaOptions() {
    return Object.keys(this.quotas).map(quota => {
      const isCompute = quota.endsWith(".cpu") || quota.endsWith(".memory");
      const isStorage = quota.endsWith(".storage") || quota === "persistentvolumeclaims";
      const isCount = quota.startsWith("count/");
      const icon = isCompute ? "memory" : isStorage ? "storage" : isCount ? "looks_one" : "";

      return {
        label: icon ? <span className="nobr"><Icon material={icon} /> {quota}</span> : quota,
        value: quota,
      };
    });
  }

  setQuota = () => {
    if (!this.quotaSelectValue) return;
    this.quotas[this.quotaSelectValue] = this.quotaInputValue;
    this.quotaInputValue = "";
  };

  reset = () => {
    this.quotaName = "";
    this.quotaSelectValue = "";
    this.quotaInputValue = "";
    this.namespace = defaultNamespace;
    this.quotas = getDefaultQuotas();
  };

  addQuota = async () => {
    try {
      const { quotaName, namespace } = this;
      const { resourceQuotaApi } = this.props;
      const quotas = this.quotaEntries.reduce<IResourceQuotaValues>((quotas, [name, value]) => {
        quotas[name] = value;

        return quotas;
      }, {});

      await resourceQuotaApi.create({ namespace, name: quotaName }, {
        spec: {
          hard: quotas,
        },
      });
      this.props.close();
    } catch (err) {
      this.props.errorNotification(err);
    }
  };

  onInputQuota = (evt: React.KeyboardEvent) => {
    switch (evt.key) {
      case "Enter":
        this.setQuota();
        evt.preventDefault(); // don't submit form
        break;
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create ResourceQuota</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddQuotaDialog"
        isOpen={this.props.state.isOpen}
        close={this.props.close}
      >
        <Wizard header={header} done={this.props.close}>
          <WizardStep
            contentClass="flex gaps column"
            disabledNext={!this.namespace}
            nextLabel="Create"
            next={this.addQuota}
          >
            <div className="flex gaps">
              <Input
                required autoFocus
                placeholder="ResourceQuota name"
                trim
                validators={systemName}
                value={this.quotaName} onChange={v => this.quotaName = v.toLowerCase()}
                className="box grow"
              />
            </div>

            <SubTitle title="Namespace" />
            <NamespaceSelect
              value={this.namespace}
              placeholder="Namespace"
              themeName="light"
              className="box grow"
              onChange={({ value }) => this.namespace = value}
            />

            <SubTitle title="Values" />
            <div className="flex gaps align-center">
              <Select
                className="quota-select"
                themeName="light"
                placeholder="Select a quota.."
                options={this.quotaOptions}
                value={this.quotaSelectValue}
                onChange={({ value }) => this.quotaSelectValue = value}
              />
              <Input
                maxLength={10}
                placeholder="Value"
                value={this.quotaInputValue}
                onChange={v => this.quotaInputValue = v}
                onKeyDown={this.onInputQuota}
                className="box grow"
              />
              <Button round primary onClick={this.setQuota}>
                <Icon
                  material={this.quotas[this.quotaSelectValue] ? "edit" : "add"}
                  tooltip="Set quota"
                />
              </Button>
            </div>
            <div className="quota-entries">
              {this.quotaEntries.map(([quota, value]) => (
                <div key={quota} className="quota gaps inline align-center">
                  <div className="name">{quota}</div>
                  <div className="value">{value}</div>
                  <Icon material="clear" onClick={() => this.quotas[quota] = ""} />
                </div>
              ))}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddQuotaDialog = withInjectables<Dependencies, AddQuotaDialogProps>(NonInjectedAddQuotaDialog, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    close: di.inject(closeAddQuotaDialogInjectable),
    state: di.inject(addQuotaDialogStateInjectable),
    resourceQuotaApi: di.inject(resourceQuotaApiInjectable),
  }),
});
