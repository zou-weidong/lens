/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./port-forward-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import type { PortForwardItem } from "../../port-forward/item";
import { Drawer, DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import type { PodApi, ServiceApi } from "../../../common/k8s-api/endpoints";
import { PortForwardMenu } from "./port-forward-menu";
import { portForwardAddress } from "../../port-forward/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { GetDetailsUrl } from "../kube-object/details/get-url.injectable";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import getDetailsUrlInjectable from "../kube-object/details/get-url.injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import podApiInjectable from "../../../common/k8s-api/endpoints/pod.api.injectable";
import serviceApiInjectable from "../../../common/k8s-api/endpoints/service.api.injectable";

export interface PortForwardDetailsProps {
  portForward: PortForwardItem | undefined;
  hideDetails(): void;
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  podApi: PodApi;
  serviceApi: ServiceApi;
}

const NonInjectedPortForwardDetails = observer(({
  portForward,
  hideDetails,
  getDetailsUrl,
  podApi,
  serviceApi,
}: Dependencies & PortForwardDetailsProps) => {
  const apis: Partial<Record<string, KubeApi<KubeObject>>> = {
    "service": serviceApi,
    "pod": podApi,
  };

  const renderResourceName = (portForward: PortForwardItem) => {
    const name = portForward.getName();
    const namespace = portForward.getNs();
    const api = apis[portForward.kind];

    if (!api) {
      return (
        <span>{name}</span>
      );
    }

    return (
      <Link to={getDetailsUrl(api.getUrl({ name, namespace }))}>
        {name}
      </Link>
    );
  };

  return (
    <Drawer
      className="PortForwardDetails"
      usePortal={true}
      open={!!portForward}
      title={portForward && `Port Forward: ${portForwardAddress(portForward)}`}
      onClose={hideDetails}
      toolbar={portForward && (
        <PortForwardMenu
          portForward={portForward}
          toolbar
          hideDetails={hideDetails}
        />
      )}
    >
      {portForward && (
        <div>
          <DrawerItem name="Resource Name">
            {renderResourceName(portForward)}
          </DrawerItem>
          <DrawerItem name="Namespace">
            {portForward.getNs()}
          </DrawerItem>
          <DrawerItem name="Kind">
            {portForward.getKind()}
          </DrawerItem>
          <DrawerItem name="Pod Port">
            {portForward.getPort()}
          </DrawerItem>
          <DrawerItem name="Local Port">
            {portForward.getForwardPort()}
          </DrawerItem>
          <DrawerItem name="Protocol">
            {portForward.getProtocol()}
          </DrawerItem>
          <DrawerItem name="Status">
            <span className={cssNames("status", portForward.getStatus().toLowerCase())}>{portForward.getStatus()}</span>
          </DrawerItem>
        </div>
      )}
    </Drawer>
  );
});

export const PortForwardDetails = withInjectables<Dependencies, PortForwardDetailsProps>(NonInjectedPortForwardDetails, {
  getProps: (di, props) => ({
    ...props,
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    podApi: di.inject(podApiInjectable),
    serviceApi: di.inject(serviceApiInjectable),
  }),
});
