/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import getClusterByIdInjectable, { GetClusterById } from "../../../common/clusters/get-by-id.injectable";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterMetricsSetting } from "./components/metrics-setting";
import { ClusterPrometheusSetting } from "./components/prometheus-setting";
import { ShowMetricsSetting } from "./components/show-metrics";

interface Dependencies {
  getClusterById: GetClusterById;
}

const NonInjectedMetricsSettings = observer(({
  getClusterById,
  entity,
}: Dependencies & EntitySettingViewProps) => {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <ClusterPrometheusSetting cluster={cluster} />
      </section>
      <hr />
      <section>
        <ClusterMetricsSetting cluster={cluster} />
        <ShowMetricsSetting cluster={cluster} />
      </section>
    </section>
  );
});

export const MetricsSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedMetricsSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});
