/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { AllowedResources } from "../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../clusters/allowed-resources.injectable";
import { Events } from "../components/+events/events";

export interface WorkloadEventsProps {}

interface Dependencies {
  allowedResources: AllowedResources;
}

const NonInjectedWorkloadEvents = observer(({ allowedResources }: Dependencies & WorkloadEventsProps) => {
  if (!allowedResources.has("events")) {
    return null;
  }

  return (
    <Events
      className="box grow"
      compact
      hideFilters
    />
  );
});

export const WorkloadEvents = withInjectables<Dependencies, WorkloadEventsProps>(NonInjectedWorkloadEvents, {
  getProps: (di, props) => ({
    ...props,
    allowedResources: di.inject(allowedResourcesInjectable),
  }),
});
