/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-issues.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { computed, makeObservable } from "mobx";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { NodeStore } from "../+nodes/store";
import { boundMethod, cssNames, prevDefault } from "../../utils";
import type { ItemObject } from "../../../common/item.store";
import { Spinner } from "../spinner";
import type { ActiveTheme } from "../../themes/active.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active.injectable";
import type { ToggleDetails } from "../kube-object/details/toggle.injectable";
import type { PageParam } from "../../navigation/page-param";
import kubeSelectedUrlParamInjectable from "../kube-object/details/selected.injectable";
import toggleDetailsInjectable from "../kube-object/details/toggle.injectable";
import type { KubeEventStore } from "../+events/store";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import kubeEventStoreInjectable from "../+events/store.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";

export interface ClusterIssuesProps {
  className?: string;
}

interface IWarning extends ItemObject {
  kind: string;
  message: string;
  selfLink: string;
  age: string | number;
  timeDiffFromNow: number;
}

enum sortBy {
  type = "type",
  object = "object",
  age = "age",
}

interface Dependencies {
  activeTheme: ActiveTheme;
  kubeSelectedUrlParam: PageParam<string>;
  toggleDetails: ToggleDetails;
  kubeEventStore: KubeEventStore;
  apiManager: ApiManager;
  nodeStore: NodeStore;
}

@observer
class NonInjectedClusterIssues extends React.Component<ClusterIssuesProps & Dependencies> {
  constructor(props: ClusterIssuesProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get warnings() {
    const { nodeStore, kubeEventStore } = this.props;
    const warnings: IWarning[] = [];

    // Node bad conditions
    nodeStore.items.forEach(node => {
      const { kind, selfLink, getId, getName, getAge, getTimeDiffFromNow } = node;

      node.getWarningConditions().forEach(({ message }) => {
        warnings.push({
          age: getAge(),
          getId,
          getName,
          timeDiffFromNow: getTimeDiffFromNow(),
          kind,
          message,
          selfLink,
        });
      });
    });

    // Warning events for Workloads
    kubeEventStore.getWarnings().forEach(error => {
      const { message, involvedObject, getAge, getTimeDiffFromNow } = error;
      const { uid, name, kind } = involvedObject;

      warnings.push({
        getId: () => uid,
        getName: () => name,
        timeDiffFromNow: getTimeDiffFromNow(),
        age: getAge(),
        message,
        kind,
        selfLink: this.props.apiManager.lookupApiLink(involvedObject, error),
      });
    });

    return warnings;
  }

  @boundMethod
  getTableRow(uid: string) {
    const { kubeSelectedUrlParam, toggleDetails } = this.props;
    const { warnings } = this;
    const warning = warnings.find(warn => warn.getId() == uid);
    const { getId, getName, message, kind, selfLink, age } = warning;

    return (
      <TableRow
        key={getId()}
        sortItem={warning}
        selected={selfLink === kubeSelectedUrlParam.get()}
        onClick={prevDefault(() => toggleDetails(selfLink))}
      >
        <TableCell className={styles.message}>
          {message}
        </TableCell>
        <TableCell className={styles.object}>
          {getName()}
        </TableCell>
        <TableCell className="kind">
          {kind}
        </TableCell>
        <TableCell className="age">
          {age}
        </TableCell>
      </TableRow>
    );
  }

  renderContent() {
    const { warnings } = this;

    if (!this.props.kubeEventStore.isLoaded) {
      return (
        <Spinner center/>
      );
    }

    if (!warnings.length) {
      return (
        <div className={cssNames(styles.noIssues, "flex column box grow gaps align-center justify-center")}>
          <Icon className={styles.Icon} material="check" big sticker/>
          <p className={styles.title}>No issues found</p>
          <p>Everything is fine in the Cluster</p>
        </div>
      );
    }

    return (
      <>
        <SubHeader className={styles.SubHeader}>
          <Icon material="error_outline"/>{" "}
          <>Warnings: {warnings.length}</>
        </SubHeader>
        <Table
          tableId="cluster_issues"
          items={warnings}
          virtual
          selectable
          sortable={{
            [sortBy.type]: (warning: IWarning) => warning.kind,
            [sortBy.object]: (warning: IWarning) => warning.getName(),
            [sortBy.age]: (warning: IWarning) => warning.timeDiffFromNow,
          }}
          sortByDefault={{ sortBy: sortBy.object, orderBy: "asc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className={cssNames("box grow", this.props.activeTheme.value.type)}
        >
          <TableHead nowrap>
            <TableCell className="message">Message</TableCell>
            <TableCell className="object" sortBy={sortBy.object}>Object</TableCell>
            <TableCell className="kind" sortBy={sortBy.type}>Type</TableCell>
            <TableCell className="timestamp" sortBy={sortBy.age}>Age</TableCell>
          </TableHead>
        </Table>
      </>
    );
  }

  render() {
    return (
      <div className={cssNames(styles.ClusterIssues, "flex column", this.props.className)}>
        {this.renderContent()}
      </div>
    );
  }
}

export const ClusterIssues = withInjectables<Dependencies, ClusterIssuesProps>(NonInjectedClusterIssues, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    toggleDetails: di.inject(toggleDetailsInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
    apiManager: di.inject(apiManagerInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
  }),
});
