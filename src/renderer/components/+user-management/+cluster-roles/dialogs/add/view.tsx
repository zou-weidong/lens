/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./view.scss";

import type { IObservableValue } from "mobx";
import { observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";

import type { DialogProps } from "../../../../dialog";
import { Dialog } from "../../../../dialog";
import { Input } from "../../../../input";
import { SubTitle } from "../../../../layout/sub-title";
import { Wizard, WizardStep } from "../../../../wizard";
import type { ClusterRoleStore } from "../../store";
import type { ErrorNotification } from "../../../../notifications/error.injectable";
import closeAddClusterRoleDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../../../../notifications/error.injectable";
import addClusterRoleDialogStateInjectable from "./state.injectable";
import type { ShowDetails } from "../../../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../../../kube-object/details/show.injectable";
import clusterRoleStoreInjectable from "../../store.injectable";

export interface AddClusterRoleDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  isOpen: IObservableValue<boolean>;
  errorNotification: ErrorNotification;
  close: () => void;
  showDetails: ShowDetails;
  clusterRoleStore: ClusterRoleStore;
}

@observer
class NonInjectedAddClusterRoleDialog extends React.Component<AddClusterRoleDialogProps & Dependencies> {
  private readonly clusterRoleName = observable.box("");

  reset = () => {
    this.clusterRoleName.set("");
  };

  createRole = async () => {
    const { showDetails, close, errorNotification, clusterRoleStore } = this.props;

    try {
      const clusterRole = await clusterRoleStore.create({
        name: this.clusterRoleName.get(),
      });

      showDetails(clusterRole);
      close();
    } catch (error) {
      errorNotification(error);
    }
  };

  render() {
    const { ...dialogProps } = this.props;

    return (
      <Dialog
        {...dialogProps}
        className="AddClusterRoleDialog"
        isOpen={this.props.isOpen.get()}
        close={this.props.close}
        onClose={this.reset}
      >
        <Wizard
          header={<h5>Create ClusterRole</h5>}
          done={this.props.close}
        >
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.createRole}
          >
            <SubTitle title="ClusterRole Name" />
            <Input
              required
              autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={this.clusterRoleName.get()}
              onChange={v => this.clusterRoleName.set(v)}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddClusterRoleDialog = withInjectables<Dependencies, AddClusterRoleDialogProps>(NonInjectedAddClusterRoleDialog, {
  getProps: (di, props) => ({
    ...props,
    close: di.inject(closeAddClusterRoleDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    isOpen: di.inject(addClusterRoleDialogStateInjectable),
    showDetails: di.inject(showDetailsInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
  }),
});
