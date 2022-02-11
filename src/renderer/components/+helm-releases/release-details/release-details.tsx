/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React, { Component } from "react";
import groupBy from "lodash/groupBy";
import type { IComputedValue } from "mobx";
import { computed, makeObservable, observable } from "mobx";
import kebabCase from "lodash/kebabCase";
import type { HelmRelease, IReleaseDetails, IReleaseUpdateDetails, IReleaseUpdatePayload } from "../../../../common/k8s-api/endpoints";
import { HelmReleaseMenu } from "../release-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { cssNames, stopPropagation } from "../../../utils";
import { Observer, observer } from "mobx-react";
import { Spinner } from "../../spinner";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { Button } from "../../button";
import { SubTitle } from "../../layout/sub-title";
import { Checkbox } from "../../checkbox";
import { MonacoEditor } from "../../monaco-editor";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import createUpgradeChartTabInjectable from "../../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import updateReleaseInjectable from "../update-release/update-release.injectable";
import releaseInjectable from "./release.injectable";
import releaseDetailsInjectable from "./release-details.injectable";
import releaseValuesInjectable from "./release-values.injectable";
import type { UserSuppliedValuesAreShown } from "./user-supplied-values-are-shown.injectable";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";
import type { OkNotification } from "../../notifications/ok.injectable";
import type { ErrorNotification } from "../../notifications/error.injectable";
import type { ActiveTheme } from "../../../themes/active.injectable";
import activeThemeInjectable from "../../../themes/active.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import okNotificationInjectable from "../../notifications/ok.injectable";
import type { ShowDetails } from "../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../kube-object/details/show.injectable";

export interface ReleaseDetailsProps {
  hideDetails(): void;
}

interface Dependencies {
  release: IComputedValue<HelmRelease>;
  releaseDetails: IAsyncComputed<IReleaseDetails>;
  releaseValues: IAsyncComputed<string>;
  updateRelease: (name: string, namespace: string, payload: IReleaseUpdatePayload) => Promise<IReleaseUpdateDetails>;
  createUpgradeChartTab: (release: HelmRelease) => void;
  userSuppliedValuesAreShown: UserSuppliedValuesAreShown;
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  activeTheme: ActiveTheme;
  showDetails: ShowDetails;
}

@observer
class NonInjectedReleaseDetails extends Component<ReleaseDetailsProps & Dependencies> {
  @observable saving = false;

  private nonSavedValues: string;

  constructor(props: ReleaseDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get release() {
    return this.props.release.get();
  }

  @computed get details() {
    return this.props.releaseDetails.value.get();
  }

  updateValues = async () => {
    const name = this.release.getName();
    const namespace = this.release.getNs();
    const data = {
      chart: this.release.getChart(),
      repo: await this.release.getRepo(),
      version: this.release.getVersion(),
      values: this.nonSavedValues,
    };

    this.saving = true;

    try {
      await this.props.updateRelease(name, namespace, data);
      this.props.okNotification(<p>Release <b>{name}</b> successfully updated!</p>);
      this.props.releaseValues.invalidate();
    } catch (err) {
      this.props.errorNotification(err);
    }
    this.saving = false;
  };

  upgradeVersion = () => {
    this.props.createUpgradeChartTab(this.release);
    this.props.hideDetails();
  };

  renderValues() {
    return (
      <Observer>
        {() => {
          const { saving } = this;

          const releaseValuesArePending =
            this.props.releaseValues.pending.get();

          this.nonSavedValues = this.props.releaseValues.value.get();

          return (
            <div className="values">
              <DrawerTitle title="Values" />
              <div className="flex column gaps">
                <Checkbox
                  label="User-supplied values only"
                  value={this.props.userSuppliedValuesAreShown.value}
                  onChange={this.props.userSuppliedValuesAreShown.toggle}
                  disabled={releaseValuesArePending}
                />
                <MonacoEditor
                  style={{ minHeight: 300 }}
                  value={this.nonSavedValues}
                  onChange={(text) => (this.nonSavedValues = text)}
                />
                <Button
                  primary
                  label="Save"
                  waiting={saving}
                  disabled={releaseValuesArePending}
                  onClick={this.updateValues}
                />
              </div>
            </div>
          );
        }}
      </Observer>
    );
  }

  renderNotes() {
    if (!this.details.info?.notes) return null;
    const { notes } = this.details.info;

    return (
      <div className="notes">
        {notes}
      </div>
    );
  }

  renderNamespace(namespace: string | undefined) {
    if (namespace) {
      return <TableCell className="namespace">{namespace}</TableCell>;
    }

    return undefined;
  }

  renderResources() {
    const { resources } = this.details;

    if (!resources) {
      return null;
    }

    return (
      <div className="resources">
        {
          Object.entries(groupBy(resources, item => item.kind))
            .map(([kind, items]) => (
              <React.Fragment key={kind}>
                <SubTitle title={kind} />
                <Table scrollable={false}>
                  <TableHead sticky={false}>
                    <TableCell className="name">Name</TableCell>
                    {items[0].getNs() && <TableCell className="namespace">Namespace</TableCell>}
                    <TableCell className="age">Age</TableCell>
                  </TableHead>
                  {items.map(item => (
                    <TableRow key={item.getId()}>
                      <TableCell className="name">
                        <a onClick={() => this.props.showDetails(item.selfLink)}>{item.getName()}</a>
                      </TableCell>
                      {this.renderNamespace(item.getNs())}
                      <TableCell className="age">{item.getAge()}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </React.Fragment>
            ))
        }
      </div>
    );
  }

  renderContent() {
    if (!this.release) return null;

    if (!this.details) {
      return <Spinner center/>;
    }

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{this.release.getChart()}</span>
            <Button
              primary
              label="Upgrade"
              className="box right upgrade"
              onClick={this.upgradeVersion}
            />
          </div>
        </DrawerItem>
        <DrawerItem name="Updated">
          {this.release.getUpdated()} ago ({this.release.updated})
        </DrawerItem>
        <DrawerItem name="Namespace">
          {this.release.getNs()}
        </DrawerItem>
        <DrawerItem name="Version" onClick={stopPropagation}>
          <div className="version flex gaps align-center">
            <span>
              {this.release.getVersion()}
            </span>
          </div>
        </DrawerItem>
        <DrawerItem name="Status" className="status" labelsOnly>
          <Badge
            label={this.release.getStatus()}
            className={kebabCase(this.release.getStatus())}
          />
        </DrawerItem>
        {this.renderValues()}
        <DrawerTitle title="Notes"/>
        {this.renderNotes()}
        <DrawerTitle title="Resources"/>
        {this.renderResources()}
      </div>
    );
  }

  render() {
    const { hideDetails } = this.props;
    const title = this.release ? `Release: ${this.release.getName()}` : "";
    const toolbar = <HelmReleaseMenu release={this.release} toolbar hideDetails={hideDetails}/>;

    return (
      <Drawer
        className={cssNames("ReleaseDetails", this.props.activeTheme.value.type)}
        usePortal={true}
        open={!!this.release}
        title={title}
        onClose={hideDetails}
        toolbar={toolbar}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}

export const ReleaseDetails = withInjectables<Dependencies, ReleaseDetailsProps>(NonInjectedReleaseDetails, {
  getProps: (di, props) => ({
    ...props,
    release: di.inject(releaseInjectable),
    releaseDetails: di.inject(releaseDetailsInjectable),
    releaseValues: di.inject(releaseValuesInjectable),
    userSuppliedValuesAreShown: di.inject(userSuppliedValuesAreShownInjectable),
    updateRelease: di.inject(updateReleaseInjectable),
    createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
    activeTheme: di.inject(activeThemeInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
    showDetails: di.inject(showDetailsInjectable),
  }),
});
