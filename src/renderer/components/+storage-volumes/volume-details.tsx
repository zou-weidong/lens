/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import startCase from "lodash/startCase";
import "./volume-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { PersistentVolumeClaimApi } from "../../../common/k8s-api/endpoints";
import { PersistentVolume } from "../../../common/k8s-api/endpoints";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import { prevDefault } from "../../utils";
import persistentVolumeClaimApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";

export interface PersistentVolumeDetailsProps extends KubeObjectDetailsProps<PersistentVolume> {
}

interface Dependencies {
  showDetails: ShowDetails;
  persistentVolumeClaimApi: PersistentVolumeClaimApi;
}

const NonInjectedPersistentVolumeDetails = observer(({
  object: volume,
  showDetails,
  persistentVolumeClaimApi,
}: Dependencies & PersistentVolumeDetailsProps) => {
  if (!volume) {
    return null;
  }

  if (!(volume instanceof PersistentVolume)) {
    logger.error("[PersistentVolumeDetails]: passed object that is not an instanceof PersistentVolume", volume);

    return null;
  }

  const { accessModes, capacity, persistentVolumeReclaimPolicy, storageClassName, claimRef, flexVolume, mountOptions, nfs } = volume.spec;

  return (
    <div className="PersistentVolumeDetails">
      <KubeObjectMeta object={volume}/>
      <DrawerItem name="Capacity">
        {capacity.storage}
      </DrawerItem>

      {mountOptions && (
        <DrawerItem name="Mount Options">
          {mountOptions.join(", ")}
        </DrawerItem>
      )}

      <DrawerItem name="Access Modes">
        {accessModes.join(", ")}
      </DrawerItem>
      <DrawerItem name="Reclaim Policy">
        {persistentVolumeReclaimPolicy}
      </DrawerItem>
      <DrawerItem name="Storage Class Name">
        {storageClassName}
      </DrawerItem>
      <DrawerItem name="Status" labelsOnly>
        <Badge label={volume.getStatus()}/>
      </DrawerItem>

      {nfs && (
        <>
          <DrawerTitle title="Network File System"/>
          {
            Object.entries(nfs).map(([name, value]) => (
              <DrawerItem key={name} name={startCase(name)}>
                {value}
              </DrawerItem>
            ))
          }
        </>
      )}

      {flexVolume && (
        <>
          <DrawerTitle title="FlexVolume"/>
          <DrawerItem name="Driver">
            {flexVolume.driver}
          </DrawerItem>
          {
            Object.entries(flexVolume.options).map(([name, value]) => (
              <DrawerItem key={name} name={startCase(name)}>
                {value}
              </DrawerItem>
            ))
          }
        </>
      )}

      {claimRef && (
        <>
          <DrawerTitle title="Claim"/>
          <DrawerItem name="Type">
            {claimRef.kind}
          </DrawerItem>
          <DrawerItem name="Name">
            <a onClick={prevDefault(() => showDetails(persistentVolumeClaimApi.getUrl(claimRef)))}>
              {claimRef.name}
            </a>
          </DrawerItem>
          <DrawerItem name="Namespace">
            {claimRef.namespace}
          </DrawerItem>
        </>
      )}
    </div>
  );
});

export const PersistentVolumeDetails = withInjectables<Dependencies, PersistentVolumeDetailsProps>(NonInjectedPersistentVolumeDetails, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    persistentVolumeClaimApi: di.inject(persistentVolumeClaimApiInjectable),
  }),
});
