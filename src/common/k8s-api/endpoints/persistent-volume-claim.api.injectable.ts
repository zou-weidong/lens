/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { PersistentVolumeClaimApi } from "./persistent-volume-claim.api";

const persistentVolumeClaimApiInjectable = getInjectable({
  id: "persistent-volume-claim-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new PersistentVolumeClaimApi();
  },
});

export default persistentVolumeClaimApiInjectable;
