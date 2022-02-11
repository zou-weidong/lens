/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-icon.scss";

import React from "react";
import { Icon } from "../icon";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { cssNames } from "../../utils";
import type { KubeEvent } from "../../../common/k8s-api/endpoints";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { KubeEventStore } from "./store";
import kubeEventStoreInjectable from "./store.injectable";

export interface KubeEventIconProps {
  object: KubeObject;
  showWarningsOnly?: boolean;
  filterEvents?: (events: KubeEvent[]) => KubeEvent[];
}

interface Dependencies {
  kubeEventStore: KubeEventStore;
}

const NonInjectedKubeEventIcon = observer(({
  kubeEventStore,
  object,
  showWarningsOnly = true,
  filterEvents,
}: Dependencies & KubeEventIconProps) => {
  const events = kubeEventStore.getEventsByObject(object);
  let warnings = events.filter(evt => evt.isWarning());

  if (filterEvents) warnings = filterEvents(warnings);

  if (!events.length || (showWarningsOnly && !warnings.length)) {
    return null;
  }
  const event = [...warnings, ...events][0]; // get latest event

  return (
    <Icon
      material="warning"
      className={cssNames("KubeEventIcon", { warning: event.isWarning() })}
      tooltip={{
        children: (
          <div className="KubeEventTooltip">
            <div className="msg">{event.message}</div>
            <div className="age">
              <Icon material="access_time"/>
              {event.getAge(undefined, undefined, true)}
            </div>
          </div>
        ),
      }}
    />
  );
});

export const KubeEventIcon = withInjectables<Dependencies, KubeEventIconProps>(NonInjectedKubeEventIcon, {
  getProps: (di, props) => ({
    ...props,
    kubeEventStore: di.inject(kubeEventStoreInjectable),
  }),
});
