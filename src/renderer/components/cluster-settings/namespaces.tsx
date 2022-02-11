/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import getClusterByIdInjectable, { GetClusterById } from "../../../common/clusters/get-by-id.injectable";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterAccessibleNamespaces } from "./components/accessible-namespaces";

interface Dependencies {
  getClusterById: GetClusterById;
}

const NonInjectedNamespacesSettings = observer(({
  getClusterById,
  entity,
}: Dependencies & EntitySettingViewProps) => {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterAccessibleNamespaces cluster={cluster} />
    </section>
  );
});

export const NamespacesSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedNamespacesSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});
