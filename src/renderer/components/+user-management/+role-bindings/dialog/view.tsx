/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import type { IObservableValue } from "mobx";
import { computed, observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { NamespaceSelect } from "../../../+namespaces/namespace-select";
import type { ClusterRole, Role, RoleApi, RoleBindingSubject, ServiceAccount } from "../../../../../common/k8s-api/endpoints";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { EditableList } from "../../../editable-list";
import { Icon } from "../../../icon";
import { SubTitle } from "../../../layout/sub-title";
import type { SelectOption } from "../../../select";
import { Select } from "../../../select";
import { Wizard, WizardStep } from "../../../wizard";
import type { RoleBindingStore } from "../store";
import type { ClusterRoleStore } from "../../+cluster-roles/store";
import { Input } from "../../../input";
import { ObservableHashSet, nFircate } from "../../../../utils";
import type { RoleBindingDialogState } from "./state.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import roleBindingDialogStateInjectable from "./state.injectable";
import closeRoleBindingDialogInjectable from "./close.injectable";
import type { ShowDetails } from "../../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../../kube-object/details/show.injectable";
import type { RoleStore } from "../../+roles/store";
import type { ServiceAccountStore } from "../../+service-accounts/store";
import roleApiInjectable from "../../../../../common/k8s-api/endpoints/role.api.injectable";
import roleBindingStoreInjectable from "../store.injectable";
import roleStoreInjectable from "../../+roles/store.injectable";
import serviceAccountStoreInjectable from "../../+service-accounts/store.injectable";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";

export interface RoleBindingDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  state: IObservableValue<RoleBindingDialogState | undefined>;
  errorNotification: ErrorNotification;
  close: () => void;
  showDetails: ShowDetails;
  roleBindingStore: RoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  roleStore: RoleStore;
  roleApi: RoleApi;
}

@observer
class NonInjectedRoleBindingDialog extends React.Component<RoleBindingDialogProps & Dependencies> {
  constructor(props: RoleBindingDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @observable.ref selectedRoleRef: Role | ClusterRole | undefined = undefined;
  @observable bindingName = "";
  @observable bindingNamespace = "";
  selectedAccounts = new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid);
  selectedUsers = observable.set<string>([]);
  selectedGroups = observable.set<string>([]);

  @computed get selectedBindings(): RoleBindingSubject[] {
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

  @computed get roleRefOptions(): SelectOption<Role | ClusterRole>[] {
    const roles = this.props.roleStore.items
      .filter(role => role.getNs() === this.bindingNamespace)
      .map(value => ({ value, label: value.getName() }));
    const clusterRoles = this.props.clusterRoleStore.items
      .map(value => ({ value, label: value.getName() }));

    return [
      ...roles,
      ...clusterRoles,
    ];
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

  onOpen = action((state: RoleBindingDialogState) => {
    const binding = state.data;

    if (!binding) {
      return this.reset();
    }

    this.selectedRoleRef = (binding.roleRef.kind === this.props.roleApi.kind ? this.props.roleStore : this.props.clusterRoleStore)
      .items
      .find(item => item.getName() === binding.roleRef.name);

    this.bindingName = binding.getName();
    this.bindingNamespace = binding.getNs();

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
    this.bindingNamespace = "";
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  });

  async createBindings(state: RoleBindingDialogState) {
    const { selectedRoleRef, bindingNamespace: namespace, selectedBindings } = this;
    const { showDetails, close, errorNotification } = this.props;

    try {
      const roleBinding = this.props.state.get().isEditing
        ? await this.props.roleBindingStore.updateSubjects(state.data, selectedBindings)
        : await this.props.roleBindingStore.create({ name: this.bindingName, namespace }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(roleBinding);
      close();
    } catch (err) {
      errorNotification(err);
    }
  }

  renderContents(state: RoleBindingDialogState) {
    const [action, nextLabel] = state.isEditing ? ["Edit", "Update"] : ["Add", "Create"];
    const disableNext = !this.selectedRoleRef || !this.selectedBindings.length || !this.bindingNamespace || !this.bindingName;

    return (
      <Wizard
        header={<h5>{action} RoleBinding</h5>}
        done={this.props.close}
      >
        <WizardStep
          nextLabel={nextLabel}
          next={() => this.createBindings(state)}
          disabledNext={disableNext}
        >
          <SubTitle title="Namespace" />
          <NamespaceSelect
            themeName="light"
            isDisabled={state.isEditing}
            value={this.bindingNamespace}
            autoFocus={!state.isEditing}
            onChange={({ value }) => this.bindingNamespace = value}
          />

          <SubTitle title="Role Reference" />
          <Select
            themeName="light"
            placeholder="Select role or cluster role ..."
            isDisabled={state.isEditing}
            options={this.roleRefOptions}
            value={this.selectedRoleRef}
            onChange={({ value }) => {
              if (!this.selectedRoleRef || this.bindingName === this.selectedRoleRef.getName()) {
                this.bindingName = value.getName();
              }

              this.selectedRoleRef = value;
            }}
          />

          <SubTitle title="Binding Name" />
          <Input
            disabled={state.isEditing}
            value={this.bindingName}
            onChange={value => this.bindingName = value}
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
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { close, state, errorNotification, ...dialogProps } = this.props;
    const dialogState = state.get();
    const isOpen = Boolean(dialogState);

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleBindingDialog"
        isOpen={isOpen}
        close={close}
        onClose={this.reset}
        onOpen={() => this.onOpen(dialogState)}
      >
        {dialogState && this.renderContents(dialogState)}
      </Dialog>
    );
  }
}

export const RoleBindingDialog = withInjectables<Dependencies, RoleBindingDialogProps>(NonInjectedRoleBindingDialog, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    state: di.inject(roleBindingDialogStateInjectable),
    close: di.inject(closeRoleBindingDialogInjectable),
    showDetails: di.inject(showDetailsInjectable),
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    roleStore: di.inject(roleStoreInjectable),
    roleApi: di.inject(roleApiInjectable),
  }),
});
