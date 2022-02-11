/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import { SidebarCluster } from "../sidebar/cluster";
import { KubernetesCluster } from "../../../../common/catalog/entity/declarations";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import activeEntityInjectable from "../../../catalog/entity/active-entity.injectable";
import { computed } from "mobx";

const clusterEntity = new KubernetesCluster({
  metadata: {
    uid: "test-uid",
    name: "test-cluster",
    source: "local",
    labels: {},
  },
  spec: {
    kubeconfigPath: "",
    kubeconfigContext: "",
  },
  status: {
    phase: "connected",
  },
});

describe("<SidebarCluster/>", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(activeEntityInjectable, () => computed(() => clusterEntity));
  });

  it("renders w/o errors", () => {
    const { container } = render(<SidebarCluster />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders cluster avatar and name", async () => {
    const res = render(<SidebarCluster />);

    expect(await res.findByText("tc")).toBeInTheDocument();

    const v = await res.findAllByText("test-cluster");

    expect(v.length).toBeGreaterThan(0);

    for (const e of v) {
      expect(e).toBeInTheDocument();
    }
  });

  it("renders cluster menu", async () => {
    const res = render(<SidebarCluster />);
    const link = await res.findByTestId("sidebar-cluster-dropdown");

    fireEvent.click(link);
    expect(await res.findByText("Add to Hotbar")).toBeInTheDocument();
  });
});

