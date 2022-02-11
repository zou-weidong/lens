/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-metrics.scss";

import React, { createContext, useEffect, useState } from "react";
import { Radio, RadioGroup } from "../radio";
import { useInterval } from "../../hooks";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { cssNames, noop } from "../../utils";
import { Spinner } from "../spinner";
import type { IMetrics } from "../../../common/k8s-api/endpoints";
import type { MetricsTabs } from "../chart/options";

export interface ResourceMetricsProps {
  tabs: MetricsTabs[];
  object?: KubeObject;
  loader?: () => void;
  interval?: number;
  className?: string;
  metrics: Record<string, IMetrics> | undefined;
  children?: React.ReactNode | React.ReactChild | React.ReactChild[];
}

export interface ResourceMetricsValue {
  object: KubeObject;
  tab: MetricsTabs;
  metrics: Record<string, IMetrics> | undefined;
}

export const ResourceMetricsContext = createContext<ResourceMetricsValue>(null);

export function ResourceMetrics({
  object,
  loader = noop,
  interval = 60,
  tabs,
  children,
  className,
  metrics,
}: ResourceMetricsProps) {
  const [tabId, setTabId] = useState(0);

  useEffect(loader, [object]);
  useInterval(loader, interval * 1000);

  return (
    <div className={cssNames("ResourceMetrics flex column", className)}>
      <div className="switchers">
        <RadioGroup
          asButtons
          className="flex box grow gaps"
          value={tabs[tabId]}
          onChange={value => setTabId(tabs.findIndex(tab => tab == value))}
        >
          {tabs.map((tab, index) => (
            <Radio
              key={index}
              className="box grow"
              label={tab}
              value={tab}
            />
          ))}
        </RadioGroup>
      </div>
      <ResourceMetricsContext.Provider value={{ object, tab: tabs[tabId], metrics }}>
        <div className="graph">
          {children}
        </div>
      </ResourceMetricsContext.Provider>
      <div className="loader">
        <Spinner />
      </div>
    </div>
  );
}
