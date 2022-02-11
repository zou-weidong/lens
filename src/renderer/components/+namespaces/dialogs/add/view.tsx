/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import { observable, makeObservable, IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import type { Namespace } from "../../../../../common/k8s-api/endpoints";
import { Input } from "../../../input";
import { systemName } from "../../../input/input_validators";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../../namespace-store/namespace-store.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import closeAddNamespaceDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import isAddNamespaceDialogOpenInjectable from "./is-open.injectable";
import type { NamespaceStore } from "../../namespace-store/namespace.store";

interface Props extends Omit<DialogProps, "isOpen" | "close"> {
  onSuccess?(ns: Namespace): void;
  onError?(error: any): void;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  isOpen: IComputedValue<boolean>;
  close: () => void;
  errorNotification: ErrorNotification;
}

@observer
class NonInjectedAddNamespaceDialog extends React.Component<Props & Dependencies> {
  @observable namespace = "";

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  reset = () => {
    this.namespace = "";
  };

  addNamespace = async () => {
    const { namespace } = this;
    const { onSuccess, onError } = this.props;

    try {
      const created = await this.props.namespaceStore.create({ name: namespace });

      onSuccess?.(created);
      this.props.close();
    } catch (err) {
      this.props.errorNotification(err);
      onError?.(err);
    }
  };

  render() {
    const { isOpen, close, namespaceStore, ...dialogProps } = this.props;

    return (
      <Dialog
        {...dialogProps}
        className="AddNamespaceDialog"
        isOpen={isOpen.get()}
        onOpen={this.reset}
        close={close}
      >
        <Wizard header={<h5>Create Namespace</h5>} done={close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.addNamespace}
          >
            <Input
              required autoFocus
              iconLeft="layers"
              placeholder="Namespace"
              trim
              validators={systemName}
              value={this.namespace}
              onChange={v => this.namespace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddNamespaceDialog = withInjectables<Dependencies, Props>(NonInjectedAddNamespaceDialog, {
  getProps: (di, props) => ({
    ...props,
    namespaceStore: di.inject(namespaceStoreInjectable),
    close: di.inject(closeAddNamespaceDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    isOpen: di.inject(isAddNamespaceDialogOpenInjectable),
  }),
});
