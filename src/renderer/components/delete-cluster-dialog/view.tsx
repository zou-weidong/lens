/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./view.module.scss";

import { action, IObservableValue, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import { saveKubeconfig } from "./save-config";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import type { DeleteClusterDialogState } from "./state.injectable";
import type { Context, KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../common/clusters/cluster";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeDeleteClusterDialogInjectable from "./close.injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import type { RemoveFromAllHotbars } from "../../../common/hotbars/remove-from-all.injectable";
import removeFromAllHotbarsInjectable from "../../../common/hotbars/remove-from-all.injectable";
import type { SetClusterDeleting } from "../../../common/ipc/cluster/set-deleting.token";
import type { DeleteCluster } from "../../../common/ipc/cluster/delete.token";
import type { ClearClusterDeleting } from "../../../common/ipc/cluster/clear-deleting.token";
import setClusterDeletingInjectable from "../../ipc/cluster/set-deleting.injectable";
import deleteClusterInjectable from "../../ipc/cluster/delete.injectable";
import clearClusterDeletingInjectable from "../../ipc/cluster/clear-deleting.injectable";

interface Dependencies {
  state: IObservableValue<DeleteClusterDialogState | undefined>;
  close: () => void;
  errorNotification: ErrorNotification;
  removeFromAllHotbars: RemoveFromAllHotbars;
  setClusterDeleting: SetClusterDeleting;
  deleteCluster: DeleteCluster;
  clearClusterDeleting: ClearClusterDeleting;
}

@observer
class NonInjectedDeleteClusterDialog extends React.Component<Dependencies> {
  @observable showContextSwitch = false;
  @observable newCurrentContext = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @action
  onOpen(state: DeleteClusterDialogState) {
    this.newCurrentContext = "";
    this.showContextSwitch = this.isCurrentContext(state);
  }

  removeContext({ cluster, config }: DeleteClusterDialogState) {
    config.contexts = config.contexts.filter(({ name }) => name !== cluster.contextName);
  }

  changeCurrentContext(config: KubeConfig) {
    if (this.newCurrentContext && this.showContextSwitch) {
      config.currentContext = this.newCurrentContext;
    }
  }

  async onDelete(state: DeleteClusterDialogState) {
    const { cluster, config } = state;

    try {
      await this.props.setClusterDeleting(cluster.id);
      this.removeContext(state);
      this.changeCurrentContext(config);
      await saveKubeconfig(config, cluster.kubeConfigPath);
      this.props.removeFromAllHotbars(cluster.id);
      await this.props.deleteCluster(cluster.id);
    } catch(error) {
      this.props.errorNotification(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await this.props.clearClusterDeleting(cluster.id);
      this.props.close();
    }
  }

  disableDelete(contexts: Context[]) {
    const noContextsAvailable = contexts.length == 0;
    const newContextNotSelected = this.newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return this.showContextSwitch && newContextNotSelected;
  }

  isCurrentContext({ cluster, config }: DeleteClusterDialogState) {
    return config.currentContext == cluster.contextName;
  }

  renderCurrentContextSwitch(contexts: Context[]) {
    if (!this.showContextSwitch) {
      return null;
    }

    return (
      <div className="mt-4">
        <Select
          options={contexts.map(context => ({
            label: context.name,
            value: context.name,
          }))}
          value={this.newCurrentContext}
          onChange={({ value }) => this.newCurrentContext = value}
          themeName="light"
          className="ml-[1px] mr-[1px]"
        />
      </div>
    );
  }

  renderDeleteMessage(cluster: Cluster) {
    if (cluster.isInLocalKubeconfig()) {
      return (
        <div>
          Delete the <b>{cluster.getMeta().name}</b> context from Lens&apos;s internal kubeconfig?
        </div>
      );
    }

    return (
      <div>
        Delete the <b>{cluster.getMeta().name}</b> context from <b>{cluster.kubeConfigPath}</b>?
      </div>
    );
  }

  getWarningMessage(state: DeleteClusterDialogState, contexts: Context[]) {
    const { cluster, config } = state;

    if (!contexts.length) {
      return (
        <p data-testid="no-more-contexts-warning">
          This will remove the last context in kubeconfig. There will be no active context.
        </p>
      );
    }

    if (this.isCurrentContext({ cluster, config })) {
      return (
        <p data-testid="current-context-warning">
          This will remove active context in kubeconfig. Use drop down below to&nbsp;select a&nbsp;different one.
        </p>
      );
    }

    if (cluster.isInLocalKubeconfig()) {
      return (
        <p data-testid="internal-kubeconfig-warning">
          Are you sure you want to delete it? It can be re-added through the copy/paste mechanism.
        </p>
      );
    }

    return (
      <p data-testid="kubeconfig-change-warning">The contents of kubeconfig file will be changed!</p>
    );
  }

  renderContents(state: DeleteClusterDialogState) {
    const { cluster, config } = state;
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    return (
      <>
        <div className={styles.dialogContent}>
          {this.renderDeleteMessage(cluster)}
          <div className={styles.warning}>
            <Icon material="warning_amber" className={styles.warningIcon}/>
            {this.getWarningMessage(state, contexts)}
          </div>
          <hr className={styles.hr}/>
          {contexts.length > 0 && (
            <>
              <div className="mt-4">
                <Checkbox
                  data-testid="context-switch"
                  label={(
                    <>
                      <span className="font-semibold">Select current-context</span>{" "}
                      {!this.isCurrentContext(state) && "(optional)"}
                    </>
                  )}
                  value={this.showContextSwitch}
                  onChange={value => this.showContextSwitch = this.isCurrentContext(state) || value}
                />
              </div>
              {this.renderCurrentContextSwitch(contexts)}
            </>
          )}
        </div>
        <div className={styles.dialogButtons}>
          <Button
            onClick={this.props.close}
            plain
            label="Cancel"
          />
          <Button
            onClick={() => this.onDelete(state)}
            autoFocus
            accent
            label="Delete Context"
            disabled={this.disableDelete(contexts)}
          />
        </div>
      </>
    );
  }

  render() {
    const { close, state } = this.props;
    const dialogState = state.get();

    return (
      <Dialog
        className={styles.dialog}
        isOpen={Boolean(dialogState)}
        close={close}
        onOpen={() => this.onOpen(dialogState)}
      >
        {dialogState && this.renderContents(dialogState)}
      </Dialog>
    );
  }
}

export const DeleteClusterDialog = withInjectables<Dependencies>(NonInjectedDeleteClusterDialog, {
  getProps: (di, props) => ({
    ...props,
    close: di.inject(closeDeleteClusterDialogInjectable),
    state: di.inject(deleteClusterDialogStateInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    removeFromAllHotbars: di.inject(removeFromAllHotbarsInjectable),
    setClusterDeleting: di.inject(setClusterDeletingInjectable),
    deleteCluster: di.inject(deleteClusterInjectable),
    clearClusterDeleting: di.inject(clearClusterDeletingInjectable),
  }),
});
