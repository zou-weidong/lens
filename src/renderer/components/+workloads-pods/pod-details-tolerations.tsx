/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-tolerations.scss";
import React from "react";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import type { Toleration } from "../../../common/k8s-api/common-types";
import { PodTolerations } from "./pod-tolerations";

export interface WorkloadObject {
  getTolerations(): Toleration[];
}

export interface PodDetailsTolerationsProps {
  workload: WorkloadObject;
}

export function PodDetailsTolerations({ workload }: PodDetailsTolerationsProps) {
  const tolerations = workload.getTolerations();

  return (
    <DrawerItem name="Tolerations" className="PodDetailsTolerations">
      <DrawerParamToggler label={tolerations.length}>
        <PodTolerations tolerations={tolerations} />
      </DrawerParamToggler>
    </DrawerItem>
  );
}
