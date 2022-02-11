/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { KubernetesCluster } from "../../../common/catalog/entity/declarations";
import type { GetClusterById } from "../../../common/clusters/get-by-id.injectable";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterIconSetting } from "./components/icon-settings";
import { ClusterKubeconfig } from "./components/kubeconfig";
import { ClusterNameSetting } from "./components/name-setting";

interface Dependencies {
  getClusterById: GetClusterById;
}

const NonInjectedGeneralSettings = observer(({
  getClusterById,
  entity,
}: Dependencies & EntitySettingViewProps) => {
  const cluster = getClusterById(entity.getId());
  const kubeEntity = entity as KubernetesCluster;

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <div className="flex">
          <div className="flex-grow pr-8">
            <ClusterNameSetting cluster={cluster} entity={kubeEntity} />
          </div>
          <div>
            <ClusterIconSetting cluster={cluster} entity={kubeEntity} />
          </div>
        </div>
      </section>
      <section className="small">
        <ClusterKubeconfig cluster={cluster} />
      </section>
    </section>
  );
});

export const GeneralSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedGeneralSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});
