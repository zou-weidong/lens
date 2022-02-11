/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import type { IObservableValue } from "mobx";
import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import type { ServiceAccountStore } from "../../+service-accounts/store";
import type { ClusterRole, ClusterRoleBindingSubject, ServiceAccount } from "../../../../../common/k8s-api/endpoints";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { EditableList } from "../../../editable-list";
import { Icon } from "../../../icon";
import { SubTitle } from "../../../layout/sub-title";
import type { SelectOption } from "../../../select";
import { Select } from "../../../select";
import { Wizard, WizardStep } from "../../../wizard";
import type { ClusterRoleBindingStore } from "../store";
import type { ClusterRoleStore } from "../../+cluster-roles/store";
import { ObservableHashSet, nFircate } from "../../../../utils";
import { Input } from "../../../input";
import { TooltipPosition } from "../../../tooltip";
import type { ClusterRoleBindingsDialogState } from "./state.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeClusterRoleBindingDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import clusterRoleBindingsDialogStateInjectable from "./state.injectable";
import type { ShowDetails } from "../../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../../kube-object/details/show.injectable";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import serviceAccountStoreInjectable from "../../+service-accounts/store.injectable";
import clusterRoleBindingStoreInjectable from "../store.injectable";

export interface ClusterRoleBindingDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  state: IObservableValue<ClusterRoleBindingsDialogState | undefined>;
  close: () => void;
  errorNotification: ErrorNotification;
  showDetails: ShowDetails;
  serviceAccountStore: ServiceAccountStore;
  clusterRoleBindingStore: ClusterRoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
}

@observer
class NonInjectedClusterRoleBindingDialog extends React.Component<ClusterRoleBindingDialogProps & Dependencies> {
  constructor(props: ClusterRoleBindingDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get dialogState() {
    return this.props.state.get();
  }

  @observable selectedRoleRef: ClusterRole | undefined = undefined;
  @observable bindingName = "";
  selectedAccounts = new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid);
  selectedUsers = observable.set<string>([]);
  selectedGroups = observable.set<string>([]);

  @computed get selectedBindings(): ClusterRoleBindingSubject[] {
    const serviceAccounts = Array.from(this.selectedAccounts, sa => ({
      name: sa.getName(),
      kind: "ServiceAccount" as const,
      namespace: sa.getNs(),
    }));
    const users = Array.from(this.selectedUsers, user => ({
      name: user,
      kind: "User" as const,
    }));
    const groups = Array.from(this.selectedGroups, group => ({
      name: group,
      kind: "Group" as const,
    }));

    return [
      ...serviceAccounts,
      ...users,
      ...groups,
    ];
  }

  @computed get clusterRoleRefoptions(): SelectOption<ClusterRole>[] {
    return this.props.clusterRoleStore.items.map(value => ({
      value,
      label: value.getName(),
    }));
  }

  @computed get serviceAccountOptions(): SelectOption<ServiceAccount>[] {
    return this.props.serviceAccountStore.items.map(account => ({
      value: account,
      label: `${account.getName()} (${account.getNs()})`,
    }));
  }

  @computed get selectedServiceAccountOptions(): SelectOption<ServiceAccount>[] {
    return this.serviceAccountOptions.filter(({ value }) => this.selectedAccounts.has(value));
  }

  onOpen = action(() => {
    const binding = this.dialogState.data;

    if (!binding) {
      return this.reset();
    }

    this.selectedRoleRef = this.props.clusterRoleStore
      .items
      .find(item => item.getName() === binding.roleRef.name);
    this.bindingName = this.dialogState.data.getName();

    const [saSubjects, uSubjects, gSubjects] = nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    this.selectedAccounts.replace(
      this.props.serviceAccountStore.items
        .filter(sa => accountNames.has(sa.getName())),
    );
    this.selectedUsers.replace(uSubjects.map(user => user.name));
    this.selectedGroups.replace(gSubjects.map(group => group.name));
  });

  reset = action(() => {
    this.selectedRoleRef = undefined;
    this.bindingName = "";
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  });

  createBindings = async () => {
    const { selectedRoleRef, selectedBindings, bindingName } = this;
    const { showDetails, close, errorNotification } = this.props;

    try {
      const clusterRoleBinding = this.dialogState.isEditing
        ? await this.props.clusterRoleBindingStore.updateSubjects(this.dialogState.data, selectedBindings)
        : await this.props.clusterRoleBindingStore.create({ name: bindingName }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(clusterRoleBinding);
      close();
    } catch (err) {
      errorNotification(err);
    }
  };

  renderContents() {
    return (
      <>
        <SubTitle title="Cluster Role Reference" />
        <Select
          themeName="light"
          placeholder="Select cluster role ..."
          isDisabled={this.dialogState.isEditing}
          options={this.clusterRoleRefoptions}
          value={this.selectedRoleRef}
          autoFocus={!this.dialogState.isEditing}
          formatOptionLabel={({ value }: SelectOption<ClusterRole>) => (
            <>
              <Icon
                small
                material={value.kind === "Role" ? "person" : "people"}
                tooltip={{
                  preferredPositions: TooltipPosition.LEFT,
                  children: value.kind,
                }}
              />
              {" "}
              {value.getName()}
            </>
          )}
          onChange={({ value }: SelectOption<ClusterRole> ) => {
            if (!this.selectedRoleRef || this.bindingName === this.selectedRoleRef.getName()) {
              this.bindingName = value.getName();
            }

            this.selectedRoleRef = value;
          }}
        />

        <SubTitle title="Binding Name" />
        <Input
          placeholder="Name of ClusterRoleBinding ..."
          disabled={this.dialogState.isEditing}
          value={this.bindingName}
          onChange={val => this.bindingName = val}
        />

        <SubTitle title="Binding targets" />

        <b>Users</b>
        <EditableList
          placeholder="Bind to User Account ..."
          add={(newUser) => this.selectedUsers.add(newUser)}
          items={Array.from(this.selectedUsers)}
          remove={({ oldItem }) => this.selectedUsers.delete(oldItem)}
        />

        <b>Groups</b>
        <EditableList
          placeholder="Bind to User Group ..."
          add={(newGroup) => this.selectedGroups.add(newGroup)}
          items={Array.from(this.selectedGroups)}
          remove={({ oldItem }) => this.selectedGroups.delete(oldItem)}
        />

        <b>Service Accounts</b>
        <Select
          isMulti
          themeName="light"
          placeholder="Select service accounts ..."
          autoConvertOptions={false}
          options={this.serviceAccountOptions}
          value={this.selectedServiceAccountOptions}
          formatOptionLabel={({ value }: SelectOption<ServiceAccount>) => (
            <><Icon small material="account_box" /> {value.getName()} ({value.getNs()})</>
          )}
          onChange={(selected: SelectOption<ServiceAccount>[] | null) => {
            if (selected) {
              this.selectedAccounts.replace(selected.map(opt => opt.value));
            } else {
              this.selectedAccounts.clear();
            }
          }}
          maxMenuHeight={200}
        />
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const [action, nextLabel] = this.dialogState.isEditing
      ? ["Edit", "Update"]
      : ["Add", "Create"];
    const disableNext = !this.selectedRoleRef || !this.selectedBindings.length || !this.bindingName;
    const isOpen = Boolean(this.props.state);

    return (
      <Dialog
        {...dialogProps}
        className="AddClusterRoleBindingDialog"
        isOpen={isOpen}
        close={this.props.close}
        onClose={this.reset}
        onOpen={this.onOpen}
      >
        <Wizard
          header={<h5>{action} ClusterRoleBinding</h5>}
          done={this.props.close}
        >
          <WizardStep
            nextLabel={nextLabel}
            next={this.createBindings}
            disabledNext={disableNext}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const ClusterRoleBindingDialog = withInjectables<Dependencies, ClusterRoleBindingDialogProps>(NonInjectedClusterRoleBindingDialog, {
  getProps: (di, props) => ({
    ...props,
    close: di.inject(closeClusterRoleBindingDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    state: di.inject(clusterRoleBindingsDialogStateInjectable),
    showDetails: di.inject(showDetailsInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
  }),
});
