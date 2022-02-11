/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./storage-class-details.scss";

import React from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { disposeOnUnmount, observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StorageClass } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import type { StorageClassStore } from "./store";
import { VolumeDetailsList } from "../+storage-volumes/volume-details-list";
import type { PersistentVolumeStore } from "../+storage-volumes/store";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import persistentVolumeStoreInjectable from "../+storage-volumes/store.injectable";
import storageClassStoreInjectable from "./store.injectable";


export interface StorageClassDetailsProps extends KubeObjectDetailsProps<StorageClass> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  storageClassStore: StorageClassStore;
  persistentVolumeStore: PersistentVolumeStore;
}

@observer
class NonInjectedStorageClassDetails extends React.Component<StorageClassDetailsProps & Dependencies> {
  componentDidMount() {
    const {
      storageClassStore,
      subscribeStores,
      persistentVolumeStore,
    } = this.props;

    disposeOnUnmount(this, [
      subscribeStores([
        persistentVolumeStore,
        storageClassStore,
      ]),
    ]);
  }

  render() {
    const { object: storageClass, storageClassStore } = this.props;

    if (!storageClass) {
      return null;
    }

    if (!(storageClass instanceof StorageClass)) {
      logger.error("[StorageClassDetails]: passed object that is not an instanceof StorageClass", storageClass);

      return null;
    }

    const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);
    const { provisioner, parameters, mountOptions } = storageClass;

    return (
      <div className="StorageClassDetails">
        <KubeObjectMeta object={storageClass}/>

        {provisioner && (
          <DrawerItem name="Provisioner" labelsOnly>
            <Badge label={provisioner}/>
          </DrawerItem>
        )}
        <DrawerItem name="Volume Binding Mode">
          {storageClass.getVolumeBindingMode()}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {storageClass.getReclaimPolicy()}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}
        {parameters && (
          <>
            <DrawerTitle title="Parameters"/>
            {
              Object.entries(parameters).map(([name, value]) => (
                <DrawerItem key={name + value} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}
        <VolumeDetailsList persistentVolumes={persistentVolumes}/>
      </div>
    );
  }
}

export const StorageClassDetails = withInjectables<Dependencies, StorageClassDetailsProps>(NonInjectedStorageClassDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    storageClassStore: di.inject(storageClassStoreInjectable),
  }),
});

