/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./kubeconfig-dialog.module.scss";
import React from "react";
import type { IObservableValue } from "mobx";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import { saveFileDialog } from "../../utils";
import { Button } from "../button";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Wizard, WizardStep } from "../wizard";
import { MonacoEditor } from "../monaco-editor";
import { clipboard } from "electron";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { OkNotification } from "../notifications/ok.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeconfigDialogState } from "./state.injectable";
import closeKubeconfigDialogInjectable from "./close.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import okNotificationInjectable from "../notifications/ok.injectable";
import kubeconfigDialogStateInjectable from "./state.injectable";

export interface KubeConfigDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  state: IObservableValue<KubeconfigDialogState | undefined>;
  errorNotification: ErrorNotification;
  okNotification: OkNotification;
  close: () => void;
}

@observer
class NonInjectedKubeConfigDialog extends React.Component<KubeConfigDialogProps & Dependencies> {
  @observable config = ""; // parsed kubeconfig in yaml format

  constructor(props: KubeConfigDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  onOpen = (state: KubeconfigDialogState) => {
    (async () => {
      try {
        const config = await state.loader();

        this.config = yaml.dump(config);
      } catch (error) {
        this.props.errorNotification(error);
        this.props.close();
        this.config = "";
      }
    })();
  };

  copyToClipboard = () => {
    clipboard.writeText(this.config);
    this.props.okNotification("Config copied to clipboard");
  };

  download = () => {
    saveFileDialog("config", this.config, "text/yaml");
  };

  renderContents(state: KubeconfigDialogState) {
    return (
      <Wizard header={<h5>{state.title}</h5>}>
        <WizardStep
          customButtons={(
            <div className="actions flex gaps">
              <Button plain onClick={this.copyToClipboard}>
                <Icon material="assignment"/> Copy to clipboard
              </Button>
              <Button plain onClick={this.download}>
                <Icon material="cloud_download"/> Download file
              </Button>
              <Button plain className="box right" onClick={this.props.close}>
                Close
              </Button>
            </div>
          )}
          prev={this.props.close}
        >
          <MonacoEditor
            readOnly
            className={styles.editor}
            value={this.config}
          />
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const {
      state,
      errorNotification,
      okNotification,
      close,
      ...dialogProps
    } = this.props;
    const dialogState = state.get();
    const isOpen = Boolean(dialogState);

    return (
      <Dialog
        {...dialogProps}
        className={styles.KubeConfigDialog}
        isOpen={isOpen}
        onOpen={() => this.onOpen(dialogState)}
        close={close}
      >
        {dialogState && this.renderContents(dialogState)}
      </Dialog>
    );
  }
}

export const KubeConfigDialog = withInjectables<Dependencies, KubeConfigDialogProps>(NonInjectedKubeConfigDialog, {
  getProps: (di, props) => ({
    ...props,
    close: di.inject(closeKubeconfigDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
    state: di.inject(kubeconfigDialogStateInjectable),
  }),
});
