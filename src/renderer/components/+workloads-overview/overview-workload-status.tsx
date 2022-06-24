/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { observer } from "mobx-react";
import type { DatasetTooltipLabel, PieChartData } from "../chart";
import { PieChart } from "../chart";
import { object } from "../../utils";
import type { LensTheme } from "../../themes/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PascalCase } from "type-fest";
import type { IComputedValue } from "mobx";
import activeThemeInjectable from "../../themes/active.injectable";
import type { Workload } from "./workloads/workload-injection-token";

export type LowercaseOrPascalCase<T extends string> = Lowercase<T> | PascalCase<T>;

export type WorkloadStatus = Partial<Record<LowercaseOrPascalCase<keyof typeof statusBackgroundColorMapping>, number>>;

function toLowercase<T extends string>(src: T): Lowercase<T> {
  return src.toLowerCase() as Lowercase<T>;
}

export interface OverviewWorkloadStatusProps {
  workload: Workload;
}

interface Dependencies {
  activeTheme: IComputedValue<LensTheme>;
}

const statusBackgroundColorMapping = {
  "running": "colorOk",
  "scheduled": "colorOk",
  "pending": "colorWarning",
  "suspended": "colorWarning",
  "evicted": "colorError",
  "succeeded": "colorSuccess",
  "failed": "colorError",
  "terminated": "colorTerminated",
  "terminating": "colorTerminated",
  "unknown": "colorVague",
  "complete": "colorSuccess",
} as const;

const NonInjectedOverviewWorkloadStatus = observer((props: OverviewWorkloadStatusProps & Dependencies) => {
  const {
    workload,
    activeTheme,
  } = props;
  const chartData: Required<PieChartData> = {
    labels: [],
    datasets: [],
  };

  const statuses = object.entries(workload.status.get()).filter(([, val]) => val > 0);
  const theme = activeTheme.get();

  if (statuses.length === 0) {
    chartData.datasets.push({
      data: [1],
      backgroundColor: [theme.colors.pieChartDefaultColor],
      label: "Empty",
    });
  } else {
    const data: number[] = [];
    const backgroundColor: string[] = [];
    const tooltipLabels: DatasetTooltipLabel[] = [];

    for (const [status, value] of statuses) {
      data.push(value);
      backgroundColor.push(theme.colors[statusBackgroundColorMapping[toLowercase(status)]]);
      tooltipLabels.push(percent => `${capitalize(status)}: ${percent}`);
      chartData.labels.push(`${capitalize(status)}: ${value}`);
    }

    chartData.datasets.push({
      data,
      backgroundColor,
      label: "Status",
      tooltipLabels,
    });
  }

  return (
    <div className="OverviewWorkloadStatus">
      <div className="flex column align-center box grow">
        <PieChart
          data={chartData}
          options={{
            elements: {
              arc: {
                borderWidth: 0,
              },
            },
          }}
          data-testid={`workload-overview-status-chart-${workload.title.toLowerCase().replace(/\s+/, "-")}`}
        />
      </div>
    </div>
  );
});

export const OverviewWorkloadStatus = withInjectables<Dependencies, OverviewWorkloadStatusProps>(NonInjectedOverviewWorkloadStatus, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
