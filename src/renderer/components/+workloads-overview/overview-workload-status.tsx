/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-workload-status.scss";

import React, { useRef } from "react";
import capitalize from "lodash/capitalize";
import { observer } from "mobx-react";
import { PieChart } from "../chart";
import { cssVar } from "../../utils";
import type { ChartData } from "chart.js";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ActiveTheme } from "../../themes/active.injectable";
import activeThemeInjectable from "../../themes/active.injectable";

export interface OverviewWorkloadStatusProps {
  status: Record<string, number>;
}

interface Dependencies {
  activeTheme: ActiveTheme;
}

const NonInjectedOverviewWorkloadStatus = observer(({
  activeTheme,
  status,
}: Dependencies & OverviewWorkloadStatusProps) => {
  const elem = useRef<HTMLDivElement>();

  const renderChart = () => {
    if (!elem.current) {
      return null;
    }

    const cssVars = cssVar(elem.current);
    const chartData: Required<ChartData> = {
      labels: [],
      datasets: [],
    };

    const statuses = Object.entries(status).filter(([, val]) => val > 0);

    if (statuses.length === 0) {
      chartData.datasets.push({
        data: [1],
        backgroundColor: [activeTheme.value.colors.pieChartDefaultColor],
        label: "Empty",
      });
    } else {
      const data: number[] = [];
      const backgroundColor: string[] = [];

      for (const [status, value] of statuses) {
        data.push(value);
        backgroundColor.push(cssVars.get(`--workload-status-${status.toLowerCase()}`).toString());
        chartData.labels.push(`${capitalize(status)}: ${value}`);
      }

      chartData.datasets.push({
        data,
        backgroundColor,
        label: "Status",
      });
    }

    return (
      <PieChart
        data={chartData}
        options={{
          elements: {
            arc: {
              borderWidth: 0,
            },
          },
        }}
      />
    );
  };

  return (
    <div className="OverviewWorkloadStatus" ref={elem}>
      <div className="flex column align-center box grow">
        {renderChart()}
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
