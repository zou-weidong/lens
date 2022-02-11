/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { IObservableValue } from "mobx";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../../../+namespaces/namespace-select";
import type { DialogProps } from "../../../../dialog";
import { Dialog } from "../../../../dialog";
import { Input } from "../../../../input";
import { SubTitle } from "../../../../layout/sub-title";
import { Wizard, WizardStep } from "../../../../wizard";
import type { RoleStore } from "../../store";
import type { ErrorNotification } from "../../../../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../../../../notifications/error.injectable";
import closeAddRoleDialogInjectable from "./close.injectable";
import addRoleDialogStateInjectable from "./state.injectable";
import type { ShowDetails } from "../../../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../../../kube-object/details/show.injectable";
import roleStoreInjectable from "../../store.injectable";

export interface AddRoleDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  errorNotification: ErrorNotification;
  close: () => void;
  isOpen: IObservableValue<boolean>;
  showDetails: ShowDetails;
  roleStore: RoleStore;
}

@observer
class NonInjectedAddRoleDialog extends React.Component<AddRoleDialogProps & Dependencies> {
  @observable roleName = "";
  @observable namespace = "";

  constructor(props: AddRoleDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  reset = action(() => {
    this.roleName = "";
    this.namespace = "";
  });

  createRole = async () => {
    const { showDetails, close, errorNotification, roleStore } = this.props;

    try {
      showDetails(await roleStore.create({ name: this.roleName, namespace: this.namespace }));
      close();
    } catch (err) {
      errorNotification(err);
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create Role</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleDialog"
        isOpen={this.props.isOpen.get()}
        close={this.props.close}
        onClose={this.reset}
      >
        <Wizard header={header} done={this.props.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.createRole}
          >
            <SubTitle title="Role Name" />
            <Input
              required autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={this.roleName}
              onChange={v => this.roleName = v}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              themeName="light"
              value={this.namespace}
              onChange={({ value }) => this.namespace = value}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddRoleDialog = withInjectables<Dependencies, AddRoleDialogProps>(NonInjectedAddRoleDialog, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    close: di.inject(closeAddRoleDialogInjectable),
    isOpen: di.inject(addRoleDialogStateInjectable),
    showDetails: di.inject(showDetailsInjectable),
    roleStore: di.inject(roleStoreInjectable),
  }),
});
