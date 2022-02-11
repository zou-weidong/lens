/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "../../utils";
import type { EndpointStore } from "../+network-endpoints/store";
import { Spinner } from "../spinner";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import endpointStoreInjectable from "../+network-endpoints/store.injectable";

export interface ServiceDetailsEndpointProps {
  endpoint: KubeObject;
}

interface Dependencies {
  showDetails: ShowDetails;
  endpointStore: EndpointStore;
}

const NonInjectedServiceDetailsEndpoint = observer(({
  showDetails,
  endpoint,
  endpointStore,
}: Dependencies & ServiceDetailsEndpointProps) => {
  if (!endpoint) {
    return endpointStore.isLoaded && (
      <div className="PodDetailsList flex justify-center">
        <Spinner/>
      </div>
    );
  }

  return (
    <div className="EndpointList flex column">
      <Table
        selectable
        virtual={false}
        scrollable={false}
        className="box grow"
      >
        <TableHead>
          <TableCell className="name" >Name</TableCell>
          <TableCell className="endpoints">Endpoints</TableCell>
        </TableHead>
        <TableRow
          key={endpoint.getId()}
          nowrap
          onClick={prevDefault(() => showDetails(endpoint, { resetSelected: false }))}
        >
          <TableCell className="name">{endpoint.getName()}</TableCell>
          <TableCell className="endpoints">{ endpoint.toString()}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
});

export const ServiceDetailsEndpoint = withInjectables<Dependencies, ServiceDetailsEndpointProps>(NonInjectedServiceDetailsEndpoint, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    endpointStore: di.inject(endpointStoreInjectable),
  }),
});
