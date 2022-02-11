/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import userEvent from "@testing-library/user-event";
import React from "react";
import type { ClusterRoleStore } from "../../+cluster-roles/store";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import { RoleBindingDialog } from "../dialog/view";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../../common/paths/user-data.injectable";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import type { OpenRoleBindingDialog } from "../dialog/open.injectable";
import openRoleBindingDialogInjectable from "../dialog/open.injectable";

describe("RoleBindingDialog tests", () => {
  let render: DiRender;
  let clusterRoleStore: ClusterRoleStore;
  let openRoleBindingDialog: OpenRoleBindingDialog;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await di.runSetups();

    render = renderFor(di);
    clusterRoleStore = di.inject(clusterRoleStoreInjectable);
    openRoleBindingDialog = di.inject(openRoleBindingDialogInjectable);

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
    const { container } = render(<RoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("role select should be searchable", async () => {
    openRoleBindingDialog();
    const res = render(<RoleBindingDialog />);

    userEvent.click(await res.findByText("Select role", { exact: false }));

    await res.findAllByText("foobar", {
      exact: false,
    });
  });
});
