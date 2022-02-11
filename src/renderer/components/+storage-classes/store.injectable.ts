/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import persistentVolumeStoreInjectable from "../+storage-volumes/store.injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import storageClassApiInjectable from "../../../common/k8s-api/endpoints/storage-class.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { StorageClassStore } from "./store";

const storageClassStoreInjectable = getInjectable({
  id: "storage-class-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(storageClassApiInjectable);

    return new StorageClassStore({
      persistentVolumesStore: di.inject(persistentVolumeStoreInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default storageClassStoreInjectable;
