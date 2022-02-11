/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import activeEntityInjectable from "./active-entity.injectable";

const activeClusterEntityInjectable = getInjectable({
  instantiate: (di) => {
    const activeEntity = di.inject(activeEntityInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    return  computed(() => getClusterById(activeEntity.get()?.getId()));
  },
  id: "active-cluster-entity",
});

export default activeClusterEntityInjectable;
