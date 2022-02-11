/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { IObservableValue } from "mobx";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Wizard, WizardStep } from "../../../wizard";
import type { HelmRelease, IReleaseRevision } from "../../../../../common/k8s-api/endpoints";
import { getReleaseHistory } from "../../../../../common/k8s-api/endpoints";
import type { SelectOption } from "../../../select";
import { Select } from "../../../select";
import orderBy from "lodash/orderBy";
import { withInjectables } from "@ogre-tools/injectable-react";
import rollbackReleaseInjectable from "../../rollback-release/rollback-release.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";
import closeHelmReleaseRollbackDialogInjectable from "./close.injectable";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";

interface ReleaseRollbackDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

interface Dependencies {
  rollbackRelease: (releaseName: string, namespace: string, revisionNumber: number) => Promise<void>;
  errorNotification: ErrorNotification;
  release: IObservableValue<HelmRelease | undefined>;
  close: () => void;
}

@observer
class NonInjectedReleaseRollbackDialog extends React.Component<ReleaseRollbackDialogProps & Dependencies> {
  @observable isLoading = false;
  @observable revision: IReleaseRevision;
  @observable revisions = observable.array<IReleaseRevision>();

  constructor(props: ReleaseRollbackDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get release(): HelmRelease {
    return this.props.release.get();
  }

  onOpen = async () => {
    this.isLoading = true;
    let releases = await getReleaseHistory(this.release.getName(), this.release.getNs());

    releases = orderBy(releases, "revision", "desc"); // sort
    this.revisions.replace(releases);
    this.revision = this.revisions[0];
    this.isLoading = false;
  };

  rollback = async () => {
    const revisionNumber = this.revision.revision;

    try {
      await this.props.rollbackRelease(this.release.getName(), this.release.getNs(), revisionNumber);
      this.props.close();
    } catch (err) {
      this.props.errorNotification(err);
    }
  };

  renderContent() {
    const { revision, revisions } = this;

    if (!revision) {
      return <p>No revisions to rollback.</p>;
    }

    return (
      <div className="flex gaps align-center">
        <b>Revision</b>
        <Select
          themeName="light"
          value={revision}
          options={revisions}
          formatOptionLabel={({ value }: SelectOption<IReleaseRevision>) => `${value.revision} - ${value.chart}
          - ${value.app_version}, updated: ${new Date(value.updated).toLocaleString()}`}
          onChange={({ value }: SelectOption<IReleaseRevision>) => this.revision = value}
        />
      </div>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const releaseName = this.release ? this.release.getName() : "";
    const header = <h5>Rollback <b>{releaseName}</b></h5>;
    const isOpen = Boolean(this.release);

    return (
      <Dialog
        {...dialogProps}
        className="ReleaseRollbackDialog"
        isOpen={isOpen}
        onOpen={this.onOpen}
        close={this.props.close}
      >
        <Wizard header={header} done={this.props.close}>
          <WizardStep
            scrollable={false}
            nextLabel="Rollback"
            next={this.rollback}
            loading={this.isLoading}
          >
            {this.renderContent()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const ReleaseRollbackDialog = withInjectables<Dependencies, ReleaseRollbackDialogProps>(NonInjectedReleaseRollbackDialog, {
  getProps: (di, props) => ({
    ...props,
    rollbackRelease: di.inject(rollbackReleaseInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    close: di.inject(closeHelmReleaseRollbackDialogInjectable),
    release: di.inject(helmReleaseRollbackDialogStateInjectable),
  }),
});
