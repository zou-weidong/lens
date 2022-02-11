/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ClusterRoleBindingDialog } from "../dialog/view";
import type { ClusterRoleStore } from "../../+cluster-roles/store";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import userEvent from "@testing-library/user-event";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import type { OpenClusterRoleBindingDialog } from "../dialog/open.injectable";
import openClusterRoleBindingDialogInjectable from "../dialog/open.injectable";

describe("ClusterRoleBindingDialog tests", () => {
  let render: DiRender;
  let clusterRoleStore: ClusterRoleStore;
  let openClusterRoleBindingDialog: OpenClusterRoleBindingDialog;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    render = renderFor(di);
    clusterRoleStore = di.inject(clusterRoleStoreInjectable);
    openClusterRoleBindingDialog = di.inject(openClusterRoleBindingDialogInjectable);

    clusterRoleStore.items.replace([
      new ClusterRole({
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          name: "foobar",
          resourceVersion: "1",
          uid: "1",
        },
      }),
    ]);
  });

  it("should render without any errors", () => {
    const { container } = render(<ClusterRoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("clusterrole select should be searchable", async () => {
    openClusterRoleBindingDialog();
    const res = render(<ClusterRoleBindingDialog />);

    userEvent.keyboard("a");
    await res.findAllByText("foobar");
  });
});
