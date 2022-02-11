/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import type { ChartDataSets } from "../chart";
import { BarChart } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { withInjectables } from "@ogre-tools/injectable-react";
import { metricTabOptions } from "../chart/options";
import type { ActiveTheme } from "../../themes/active.injectable";
import activeThemeInjectable from "../../themes/active.injectable";

export interface VolumeClaimDiskChartProps {}

interface Dependencies {
  activeTheme: ActiveTheme;
}

const NonInjectedVolumeClaimDiskChart = observer(({ activeTheme }: Dependencies & VolumeClaimDiskChartProps) => {
  const { metrics, object } = useContext(ResourceMetricsContext);
  const { chartCapacityColor } = activeTheme.value.colors;
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const { diskUsage, diskCapacity } = metrics;
  const usage = normalizeMetrics(diskUsage).data.result[0].values;
  const capacity = normalizeMetrics(diskCapacity).data.result[0].values;

  const datasets: ChartDataSets[] = [
    {
      id: `${id}-diskUsage`,
      label: `Usage`,
      tooltip: `Volume disk usage`,
      borderColor: "#ffc63d",
      data: usage.map(([x, y]) => ({ x, y })),
    },
    {
      id: `${id}-diskCapacity`,
      label: `Capacity`,
      tooltip: `Volume disk capacity`,
      borderColor: chartCapacityColor,
      data: capacity.map(([x, y]) => ({ x, y })),
    },
  ];

  return (
    <BarChart
      className="VolumeClaimDiskChart flex box grow column"
      name={`pvc-${object.getName()}-disk`}
      timeLabelStep={10}
      options={metricTabOptions.Memory}
      data={{ datasets }}
    />
  );
});

export const VolumeClaimDiskChart = withInjectables<Dependencies, VolumeClaimDiskChartProps>(NonInjectedVolumeClaimDiskChart, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
