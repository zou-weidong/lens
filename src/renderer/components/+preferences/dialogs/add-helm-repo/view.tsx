/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { FileFilter } from "electron";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import { Input } from "../../../input";
import { Checkbox } from "../../../checkbox";
import { Button } from "../../../button";
import { systemName, isUrl, isPath } from "../../../input/input_validators";
import { SubTitle } from "../../../layout/sub-title";
import { Icon } from "../../../icon";
import type { HelmRepo } from "../../../../../main/helm/helm-repo-manager";
import { HelmRepoManager } from "../../../../../main/helm/helm-repo-manager";
import type { OkNotification } from "../../../notifications/ok.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import okNotificationInjectable from "../../../notifications/ok.injectable";
import closeAddHelmRepoDialogInjectable from "./close.injectable";
import type { PickPaths } from "../../../path-picker/pick.injectable";
import pickPathsInjectable from "../../../path-picker/pick.injectable";
import type { AddHelmRepoDialogState } from "./state.injectable";

import addHelmRepoDialogStateInjectable from "./state.injectable";
export interface AddHelmRepoDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
  onAddRepo: () => void;
}

interface Dependencies {
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  pickPaths: PickPaths;
  state: AddHelmRepoDialogState;
  close: () => void;
}

enum FileType {
  CaFile = "caFile",
  KeyFile = "keyFile",
  CertFile = "certFile",
}

function getEmptyRepo(): HelmRepo {
  return { name: "", url: "", username: "", password: "", insecureSkipTlsVerify: false, caFile: "", keyFile: "", certFile: "" };
}

const keyExtensions = ["key", "keystore", "jks", "p12", "pfx", "pem"];
const certExtensions = ["crt", "cer", "ca-bundle", "p7b", "p7c", "p7s", "p12", "pfx", "pem"];

@observer
class NonInjectedAddHelmRepoDialog extends React.Component<AddHelmRepoDialogProps & Dependencies> {
  constructor(props: AddHelmRepoDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @observable helmRepo = getEmptyRepo();
  @observable showOptions = false;

  setFilepath(type: FileType, value: string) {
    this.helmRepo[type] = value;
  }

  getFilePath(type: FileType) : string {
    return this.helmRepo[type];
  }

  selectFileDialog(type: FileType, fileFilter: FileFilter) {
    this.props.pickPaths({
      defaultPath: this.getFilePath(type),
      properties: ["openFile", "showHiddenFiles"],
      label: `Select file`,
      buttonLabel: `Use file`,
      filters: [
        fileFilter,
        { name: "Any", extensions: ["*"] },
      ],
      minimumPaths: 1,
      onPick: ([filePath]) => this.setFilepath(type, filePath),
    });
  }

  async addCustomRepo() {
    try {
      await HelmRepoManager.getInstance().addRepo(this.helmRepo);
      this.props.okNotification(<>Helm repository <b>{this.helmRepo.name}</b> has been added</>);
      this.props.onAddRepo();
      this.props.close();
    } catch (err) {
      this.props.errorNotification(<>Adding helm branch <b>{this.helmRepo.name}</b> has failed: {String(err)}</>);
    }
  }

  renderFileInput(placeholder:string, fileType:FileType, fileExtensions:string[]){
    return(
      <div className="flex gaps align-center">
        <Input
          placeholder={placeholder}
          validators={isPath}
          className="box grow"
          value={this.getFilePath(fileType)}
          onChange={v => this.setFilepath(fileType, v)}
        />
        <Icon
          material="folder"
          onClick={() => this.selectFileDialog(fileType, { name: placeholder, extensions: fileExtensions })}
          tooltip="Browse"
        />
      </div>);
  }

  renderOptions() {
    return (
      <>
        <SubTitle title="Security settings" />
        <Checkbox
          label="Skip TLS certificate checks for the repository"
          value={this.helmRepo.insecureSkipTlsVerify}
          onChange={v => this.helmRepo.insecureSkipTlsVerify = v}
        />
        {this.renderFileInput("Key file", FileType.KeyFile, keyExtensions)}
        {this.renderFileInput("Ca file", FileType.CaFile, certExtensions)}
        {this.renderFileInput("Certificate file", FileType.CertFile, certExtensions)}
        <SubTitle title="Chart Repository Credentials" />
        <Input
          placeholder="Username"
          value={this.helmRepo.username} onChange= {v => this.helmRepo.username = v}
        />
        <Input
          type="password"
          placeholder="Password"
          value={this.helmRepo.password} onChange={v => this.helmRepo.password = v}
        />
      </>);
  }

  render() {
    const { state, close, onOpen, ...dialogProps } = this.props;

    return (
      <Dialog
        {...dialogProps}
        className="AddHelmRepoDialog"
        isOpen={state.isOpen}
        close={close}
        onOpen={action(() => {
          onOpen?.();
          this.helmRepo = getEmptyRepo();
          this.showOptions = false;
        })}
      >
        <Wizard
          header={<h5>Add custom Helm Repo</h5>}
          done={close}
        >
          <WizardStep
            contentClass="flow column"
            nextLabel="Add"
            next={() => this.addCustomRepo()}
          >
            <div className="flex column gaps">
              <Input
                autoFocus required
                placeholder="Helm repo name"
                trim
                validators={systemName}
                value={this.helmRepo.name}
                onChange={v => this.helmRepo.name = v}
              />
              <Input
                required
                placeholder="URL"
                validators={isUrl}
                value={this.helmRepo.url}
                onChange={v => this.helmRepo.url = v}
              />
              <Button
                plain
                className="accordion"
                onClick={() => this.showOptions = !this.showOptions}
              >
                More
                <Icon
                  small
                  tooltip="More"
                  material={this.showOptions ? "remove" : "add"}
                />
              </Button>
              {this.showOptions && this.renderOptions()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddHelmRepoDialog = withInjectables<Dependencies, AddHelmRepoDialogProps>(NonInjectedAddHelmRepoDialog, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
    state: di.inject(addHelmRepoDialogStateInjectable),
    pickPaths: di.inject(pickPathsInjectable),
    close: di.inject(closeAddHelmRepoDialogInjectable),
  }),
});
