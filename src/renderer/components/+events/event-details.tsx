/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./event-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeEvent } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { LocaleDate } from "../locale-date";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import showDetailsInjectable, { type ShowDetails } from "../kube-object/details/show.injectable";
import { prevDefault } from "../../utils";

export interface EventDetailsProps extends KubeObjectDetailsProps<KubeEvent> {
}

interface Dependencies {
  showDetails: ShowDetails;
}

const NonInjectedEventDetails = observer(({
  object: event,
  showDetails,
}: Dependencies & EventDetailsProps) => {
  if (!event) {
    return null;
  }

  if (!(event instanceof KubeEvent)) {
    logger.error("[EventDetails]: passed object that is not an instanceof KubeEvent", event);

    return null;
  }

  const { message, reason, count, type, involvedObject } = event;
  const { kind, name, namespace, fieldPath } = involvedObject;

  return (
    <div className="EventDetails">
      <KubeObjectMeta object={event}/>

      <DrawerItem name="Message">
        {message}
      </DrawerItem>
      <DrawerItem name="Reason">
        {reason}
      </DrawerItem>
      <DrawerItem name="Source">
        {event.getSource()}
      </DrawerItem>
      <DrawerItem name="First seen">
        {event.getFirstSeenTime()} ago (<LocaleDate date={event.firstTimestamp} />)
      </DrawerItem>
      <DrawerItem name="Last seen">
        {event.getLastSeenTime()} ago (<LocaleDate date={event.lastTimestamp} />)
      </DrawerItem>
      <DrawerItem name="Count">
        {count}
      </DrawerItem>
      <DrawerItem name="Type" className="type">
        <span className={kebabCase(type)}>{type}</span>
      </DrawerItem>

      <DrawerTitle title="Involved object"/>
      <Table>
        <TableHead>
          <TableCell>Name</TableCell>
          <TableCell>Namespace</TableCell>
          <TableCell>Kind</TableCell>
          <TableCell>Field Path</TableCell>
        </TableHead>
        <TableRow>
          <TableCell>
            <a onClick={prevDefault(() => showDetails(involvedObject, event))}>
              {name}
            </a>
          </TableCell>
          <TableCell>{namespace}</TableCell>
          <TableCell>{kind}</TableCell>
          <TableCell>{fieldPath}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
});

export const EventDetails = withInjectables<Dependencies, EventDetailsProps>(NonInjectedEventDetails, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
  }),
});
