/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hpa-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { prevDefault } from "../../utils";
import type { IHpaMetric } from "../../../common/k8s-api/endpoints";
import { HorizontalPodAutoscaler, HpaMetricType } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import { Badge } from "../badge";

export interface HpaDetailsProps extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

interface Dependencies {
  showDetails: ShowDetails;
}

const NonInjectedHpaDetails = observer(({
  object: hpa,
  showDetails,
}: Dependencies & HpaDetailsProps) => {
  const renderMetrics = () => {
    const renderName = (metric: IHpaMetric) => {
      switch (metric.type) {
        case HpaMetricType.Resource: {
          const addition = metric.resource.targetAverageUtilization
            ? "(as a percentage of request)"
            : "";

          return <>Resource {metric.resource.name} on Pods {addition}</>;
        }
        case HpaMetricType.Pods:
          return <>{metric.pods.metricName} on Pods</>;

        case HpaMetricType.Object: {
          const { target } = metric.object;
          const { kind, name } = target;

          return (
            <>
              {metric.object.metricName} on <a onClick={prevDefault(() => showDetails(target, hpa))}>{kind}/{name}</a>
            </>
          );
        }
        case HpaMetricType.External:
          return (
            <>
              {metric.external.metricName} on{" "}
              {JSON.stringify(metric.external.selector)}
            </>
          );
      }
    };

    return (
      <Table>
        <TableHead>
          <TableCell className="name">Name</TableCell>
          <TableCell className="metrics">Current / Target</TableCell>
        </TableHead>
        {
          hpa.getMetrics()
            .map((metric, index) => (
              <TableRow key={index}>
                <TableCell className="name">{renderName(metric)}</TableCell>
                <TableCell className="metrics">{hpa.getMetricValues(metric)}</TableCell>
              </TableRow>
            ))
        }
      </Table>
    );
  };

  if (!hpa) {
    return null;
  }

  if (!(hpa instanceof HorizontalPodAutoscaler)) {
    logger.error("[HpaDetails]: passed object that is not an instanceof HorizontalPodAutoscaler", hpa);

    return null;
  }

  const { scaleTargetRef } = hpa.spec;

  return (
    <div className="HpaDetails">
      <KubeObjectMeta object={hpa}/>

      <DrawerItem name="Reference">
        {scaleTargetRef && (
          <a onClick={prevDefault(() => showDetails(scaleTargetRef, hpa))}>
            {scaleTargetRef.kind}/{scaleTargetRef.name}
          </a>
        )}
      </DrawerItem>

      <DrawerItem name="Min Pods">
        {hpa.getMinPods()}
      </DrawerItem>

      <DrawerItem name="Max Pods">
        {hpa.getMaxPods()}
      </DrawerItem>

      <DrawerItem name="Replicas">
        {hpa.getReplicas()}
      </DrawerItem>

      <DrawerItem name="Status" className="status" labelsOnly>
        {hpa.getConditions()
          .map(({ type, tooltip, isReady }) => isReady && (
            <Badge
              key={type}
              label={type}
              tooltip={tooltip}
              className={type.toLowerCase()}
            />
          ))}
      </DrawerItem>

      <DrawerTitle title="Metrics"/>
      <div className="metrics">
        {renderMetrics()}
      </div>
    </div>
  );
});

export const HpaDetails = withInjectables<Dependencies, HpaDetailsProps>(NonInjectedHpaDetails, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
  }),
});
