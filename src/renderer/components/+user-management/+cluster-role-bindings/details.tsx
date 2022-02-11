/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import type { ClusterRoleBinding, ClusterRoleBindingSubject } from "../../../../common/k8s-api/endpoints";
import { autoBind, ObservableHashSet, prevDefault } from "../../../utils";
import { AddRemoveButtons } from "../../add-remove-buttons";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import type { ClusterRoleBindingStore } from "./store";
import { hashClusterRoleBindingSubject } from "./hashers";
import type { OpenClusterRoleBindingDialog } from "./dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openClusterRoleBindingDialogInjectable from "./dialog/open.injectable";
import type { OpenConfirmDialog } from "../../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../../confirm-dialog/open.injectable";
import clusterRoleBindingStoreInjectable from "./store.injectable";

export interface ClusterRoleBindingDetailsProps extends KubeObjectDetailsProps<ClusterRoleBinding> {
}

interface Dependencies {
  openClusterRoleBindingDialog: OpenClusterRoleBindingDialog;
  openConfirmDialog: OpenConfirmDialog;
  clusterRoleBindingStore: ClusterRoleBindingStore;
}

@observer
class NonInjectedClusterRoleBindingDetails extends React.Component<ClusterRoleBindingDetailsProps & Dependencies> {
  selectedSubjects = new ObservableHashSet<ClusterRoleBindingSubject>([], hashClusterRoleBindingSubject);

  constructor(props: ClusterRoleBindingDetailsProps & Dependencies) {
    super(props);
    autoBind(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.selectedSubjects.clear();
      }),
    ]);
  }

  removeSelectedSubjects() {
    const { object: clusterRoleBinding, openConfirmDialog, clusterRoleBindingStore } = this.props;
    const { selectedSubjects } = this;

    openConfirmDialog({
      ok: () => clusterRoleBindingStore.removeSubjects(clusterRoleBinding, selectedSubjects),
      labelOk: `Remove`,
      message: (
        <p>Remove selected bindings for <b>{clusterRoleBinding.getName()}</b>?</p>
      ),
    });
  }

  render() {
    const { selectedSubjects } = this;
    const { object: clusterRoleBinding } = this.props;

    if (!clusterRoleBinding) {
      return null;
    }
    const { roleRef } = clusterRoleBinding;
    const subjects = clusterRoleBinding.getSubjects();

    return (
      <div className="ClusterRoleBindingDetails">
        <KubeObjectMeta object={clusterRoleBinding} />

        <DrawerTitle title="Reference" />
        <Table>
          <TableHead>
            <TableCell>Kind</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>API Group</TableCell>
          </TableHead>
          <TableRow>
            <TableCell>{roleRef.kind}</TableCell>
            <TableCell>{roleRef.name}</TableCell>
            <TableCell>{roleRef.apiGroup}</TableCell>
          </TableRow>
        </Table>

        <DrawerTitle title="Bindings" />
        {subjects.length > 0 && (
          <Table selectable className="bindings box grow">
            <TableHead>
              <TableCell checkbox />
              <TableCell className="type">Type</TableCell>
              <TableCell className="binding">Name</TableCell>
              <TableCell className="ns">Namespace</TableCell>
            </TableHead>
            {
              subjects.map((subject, i) => {
                const { kind, name, namespace } = subject;
                const isSelected = selectedSubjects.has(subject);

                return (
                  <TableRow
                    key={i}
                    selected={isSelected}
                    onClick={prevDefault(() => this.selectedSubjects.toggle(subject))}
                  >
                    <TableCell checkbox isChecked={isSelected} />
                    <TableCell className="type">{kind}</TableCell>
                    <TableCell className="binding">{name}</TableCell>
                    <TableCell className="ns">{namespace || "-"}</TableCell>
                  </TableRow>
                );
              })
            }
          </Table>
        )}

        <AddRemoveButtons
          onAdd={() => this.props.openClusterRoleBindingDialog(clusterRoleBinding)}
          onRemove={selectedSubjects.size ? this.removeSelectedSubjects : null}
          addTooltip={`Add bindings to ${roleRef.name}`}
          removeTooltip={`Remove selected bindings from ${roleRef.name}`}
        />
      </div>
    );
  }
}

export const ClusterRoleBindingDetails = withInjectables<Dependencies, ClusterRoleBindingDetailsProps>(NonInjectedClusterRoleBindingDetails, {
  getProps: (di, props) => ({
    ...props,
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
  }),
});
