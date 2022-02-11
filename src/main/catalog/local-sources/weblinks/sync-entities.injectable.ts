/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable, reaction, computed } from "mobx";
import type { Disposer } from "../../../../common/utils";
import type { WeblinkStore } from "../../../../common/weblinks/store";
import { WebLink } from "../../../../extensions/common-api/catalog";
import weblinkStoreInjectable from "../../../weblinks/store.injectable";
import type { AddCatalogSource } from "../../entity/add-source.injectable";
import addCatalogSourceInjectable from "../../entity/add-source.injectable";
import { periodicallyCheckLink } from "./period-check";

interface Dependencies {
  store: WeblinkStore;
  addComputedSource: AddCatalogSource;
}

const syncWeblinkEntities = ({ addComputedSource, store }: Dependencies) => (
  () => {
    const webLinkEntities = observable.map<string, [WebLink, Disposer]>();

    reaction(() => store.links.get(), (links) => {
      const seenWeblinks = new Set<string>();

      for (const weblinkData of links) {
        seenWeblinks.add(weblinkData.id);

        if (!webLinkEntities.has(weblinkData.id)) {
          const link = new WebLink({
            metadata: {
              uid: weblinkData.id,
              name: weblinkData.name,
              source: "local",
              labels: {},
            },
            spec: {
              url: weblinkData.url,
            },
            status: {
              phase: "available",
              active: true,
            },
          });

          webLinkEntities.set(weblinkData.id, [
            link,
            periodicallyCheckLink(link),
          ]);
        }
      }

      // Stop checking and remove weblinks that are no longer in the store
      for (const [weblinkId, [, disposer]] of webLinkEntities) {
        if (!seenWeblinks.has(weblinkId)) {
          disposer();
          webLinkEntities.delete(weblinkId);
        }
      }
    }, { fireImmediately: true });

    addComputedSource(computed(() => Array.from(webLinkEntities.values(), ([link]) => link)));
  }
);

const syncWeblinkEntitiesInjectable = getInjectable({
  instantiate: (di) => syncWeblinkEntities({
    store: di.inject(weblinkStoreInjectable),
    addComputedSource: di.inject(addCatalogSourceInjectable),
  }),
  id: "sync-weblink-entities",
});

export default syncWeblinkEntitiesInjectable;
