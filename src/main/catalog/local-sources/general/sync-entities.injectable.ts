/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed } from "mobx";
import { GeneralEntity } from "../../../../common/catalog/entity/declarations/general";
import { preferencesURL, welcomeURL } from "../../../../common/routes";
import { catalogEntity } from "./view-catalog-entity";
import { getInjectable } from "@ogre-tools/injectable";
import addCatalogSourceInjectable from "../../entity/add-source.injectable";

const preferencesEntity = new GeneralEntity({
  metadata: {
    uid: "preferences-entity",
    name: "Preferences",
    source: "app",
    labels: {},
  },
  spec: {
    path: preferencesURL(),
    icon: {
      material: "settings",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});

const welcomePageEntity = new GeneralEntity({
  metadata: {
    uid: "welcome-page-entity",
    name: "Welcome Page",
    source: "app",
    labels: {},
  },
  spec: {
    path: welcomeURL(),
    icon: {
      material: "meeting_room",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});

const syncGeneralEntitiesInjectable = getInjectable({
  instantiate: (di) => {
    const addComputedSource = di.inject(addCatalogSourceInjectable);

    return () => addComputedSource(computed(() => [
      catalogEntity,
      preferencesEntity,
      welcomePageEntity,
    ]));
  },
  id: "sync-general-entities",
});

export default syncGeneralEntitiesInjectable;
