/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { RoleBinding, RoleBindingSubject } from "../../../../common/k8s-api/endpoints";
import { prevDefault, boundMethod } from "../../../utils";
import { AddRemoveButtons } from "../../add-remove-buttons";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import type { RoleBindingStore } from "./store";
import { ObservableHashSet } from "../../../../common/utils";
import { hashRoleBindingSubject } from "./hashers";
import type { OpenRoleBindingDialog } from "./dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openRoleBindingDialogInjectable from "./dialog/open.injectable";
import type { OpenConfirmDialog } from "../../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../../confirm-dialog/open.injectable";
import roleBindingStoreInjectable from "./store.injectable";

export interface RoleBindingDetailsProps extends KubeObjectDetailsProps<RoleBinding> {
}

interface Dependencies {
  openRoleBindingDialog: OpenRoleBindingDialog;
  openConfirmDialog: OpenConfirmDialog;
  roleBindingStore: RoleBindingStore;
}

@observer
class NonInjectedRoleBindingDetails extends React.Component<RoleBindingDetailsProps & Dependencies> {
  selectedSubjects = new ObservableHashSet<RoleBindingSubject>([], hashRoleBindingSubject);

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.selectedSubjects.clear();
      }),
    ]);
  }

  @boundMethod
  removeSelectedSubjects() {
    const { object: roleBinding, openConfirmDialog, roleBindingStore } = this.props;
    const { selectedSubjects } = this;

    openConfirmDialog({
      ok: () => roleBindingStore.removeSubjects(roleBinding, selectedSubjects.toJSON()),
      labelOk: `Remove`,
      message: (
        <p>Remove selected bindings for <b>{roleBinding.getName()}</b>?</p>
      ),
    });
  }

  render() {
    const { selectedSubjects } = this;
    const { object: roleBinding } = this.props;

    if (!roleBinding) {
      return null;
    }
    const { roleRef } = roleBinding;
    const subjects = roleBinding.getSubjects();

    return (
      <div className="RoleBindingDetails">
        <KubeObjectMeta object={roleBinding} />

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
          onAdd={() => this.props.openRoleBindingDialog(roleBinding)}
          onRemove={selectedSubjects.size ? this.removeSelectedSubjects : null}
          addTooltip={`Edit bindings of ${roleRef.name}`}
          removeTooltip={`Remove selected bindings from ${roleRef.name}`}
        />
      </div>
    );
  }
}

export const RoleBindingDetails = withInjectables<Dependencies, RoleBindingDetailsProps>(NonInjectedRoleBindingDetails, {
  getProps: (di, props) => ({
    ...props,
    openRoleBindingDialog: di.inject(openRoleBindingDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    roleBindingStore: di.inject(roleBindingStoreInjectable),
  }),
});
