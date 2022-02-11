/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volumes.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { prevDefault } from "../../utils";
import type { PersistentVolumeStore } from "./store";
import type { PersistentVolumeClaimApi, StorageClassApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { VolumesRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import persistentVolumeClaimApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import persistentVolumeStoreInjectable from "./store.injectable";
import storageClassApiInjectable from "../../../common/k8s-api/endpoints/storage-class.api.injectable";

enum columnId {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  claim = "claim",
  status = "status",
  age = "age",
}

export interface PersistentVolumesProps extends RouteComponentProps<VolumesRouteParams> {
}

interface Dependencies {
  showDetails: ShowDetails;
  persistentVolumeStore: PersistentVolumeStore;
  storageClassApi: StorageClassApi;
  persistentVolumeClaimApi: PersistentVolumeClaimApi;
}

const NonInjectedPersistentVolumes = observer(({
  showDetails,
  persistentVolumeStore,
  storageClassApi,
  persistentVolumeClaimApi,
}: Dependencies & PersistentVolumesProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="storage_volumes"
    className="PersistentVolumes"
    store={persistentVolumeStore}
    sortingCallbacks={{
      [columnId.name]: item => item.getName(),
      [columnId.storageClass]: item => item.getStorageClass(),
      [columnId.capacity]: item => item.getCapacity(true),
      [columnId.status]: item => item.getStatus(),
      [columnId.age]: item => item.getTimeDiffFromNow(),
    }}
    searchFilters={[
      item => item.getSearchFields(),
      item => item.getClaimRefName(),
    ]}
    renderHeaderTitle="Persistent Volumes"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Storage Class", className: "storageClass", sortBy: columnId.storageClass, id: columnId.storageClass },
      { title: "Capacity", className: "capacity", sortBy: columnId.capacity, id: columnId.capacity },
      { title: "Claim", className: "claim", id: columnId.claim },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
    ]}
    renderTableContents={volume => {
      const { claimRef, storageClassName } = volume.spec;

      return [
        volume.getName(),
        <KubeObjectStatusIcon key="icon" object={volume} />,
        <a key="link" onClick={prevDefault(() => showDetails(storageClassApi.getUrl({ name: storageClassName })))}>
          {storageClassName}
        </a>,
        volume.getCapacity(),
        claimRef && (
          <a key="claim-link" onClick={prevDefault(() => showDetails(persistentVolumeClaimApi.getUrl(claimRef)))}>
            {claimRef.name}
          </a>
        ),
        volume.getAge(),
        { title: volume.getStatus(), className: volume.getStatus().toLowerCase() },
      ];
    }}
  />
));

export const PersistentVolumes = withInjectables<Dependencies, PersistentVolumesProps>(NonInjectedPersistentVolumes, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    persistentVolumeClaimApi: di.inject(persistentVolumeClaimApiInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    storageClassApi: di.inject(storageClassApiInjectable),
  }),
});
