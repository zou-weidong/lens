/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityRegistry } from "../../catalog/entity/registry";
import { KubernetesCluster, WebLink } from "../../../common/catalog/entity/declarations";
import { CatalogCategory } from "../../../common/catalog/category";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";
import catalogEntitySyncerInjectable from "../../catalog/entity/entity-syncer.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import catalogEntityRegistryInjectable from "../../catalog/entity/registry.injectable";
import type { EntityChangeEvents } from "../../../common/catalog/entity/sync-types";
import type { CatalogCategoryRegistry } from "../../catalog/category/registry";
import catalogCategoryRegistryInjectable from "../../catalog/category/registry.injectable";

class FooBarCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "FooBars",
    icon: "broken",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: WebLink,
      },
    ],
    names: {
      kind: "FooBar",
    },
  };
}
const entity = new WebLink({
  metadata: {
    uid: "test",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    url: "https://k8slens.dev",
  },
  status: {
    phase: "available",
  },
});
const entity2 = new WebLink({
  metadata: {
    uid: "test2",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    url: "https://k8slens.dev",
  },
  status: {
    phase: "available",
  },
});
const entitykc = new KubernetesCluster({
  metadata: {
    uid: "test3",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    kubeconfigPath: "",
    kubeconfigContext: "",
  },
  status: {
    phase: "connected",
  },
});

describe("CatalogEntityRegistry", () => {
  let categoryRegistry: CatalogCategoryRegistry;
  let entityRegistry: CatalogEntityRegistry;
  let eventHandlers: EntityChangeEvents;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(catalogEntitySyncerInjectable, () => (events) => eventHandlers = events);

    await di.runSetups();

    entityRegistry = di.inject(catalogEntityRegistryInjectable);
    categoryRegistry = di.inject(catalogCategoryRegistryInjectable);
  });

  describe("updateItems", () => {
    beforeEach(() => {
      eventHandlers.add({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "123",
          name: "foobar",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });
    });

    it("adds new catalog item", () => {
      eventHandlers.add({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "456",
          name: "barbaz",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });

      expect(entityRegistry.entities.get().length).toEqual(2);
    });

    it("updates existing items", () => {
      expect(entityRegistry.entities.get()[0].status.phase).toEqual("disconnected");

      eventHandlers.update("123", {
        status: {
          phase: "connected",
        },
      });
      expect(entityRegistry.entities.get().length).toEqual(1);
      expect(entityRegistry.entities.get()[0].status.phase).toEqual("connected");
    });

    it("updates activeEntity", () => {
      entityRegistry.setActiveEntity(entityRegistry.entities.get()[0]);
      expect(entityRegistry.activeEntity.get().status.phase).toEqual("disconnected");

      eventHandlers.update("123", {
        status: {
          phase: "connected",
        },
      });
      expect(entityRegistry.activeEntity.get().status.phase).toEqual("connected");
    });

    it("removes deleted items", () => {
      eventHandlers.add({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "456",
          name: "barbaz",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });
      eventHandlers.delete("123");
      expect(entityRegistry.entities.get().length).toEqual(1);
      expect(entityRegistry.entities.get()[0].metadata.uid).toEqual("456");
    });
  });

  describe("items", () => {
    it("does not return items without matching category", () => {
      eventHandlers.add({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "123",
          name: "foobar",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });
      eventHandlers.add({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "FooBar",
        metadata: {
          uid: "456",
          name: "barbaz",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });

      expect(entityRegistry.entities.get().length).toBe(1);
    });
  });

  it("does return items after matching category is added", () => {
    eventHandlers.add({
      apiVersion: "entity.k8slens.dev/v1alpha1",
      kind: "FooBar",
      metadata: {
        uid: "456",
        name: "barbaz",
        source: "test",
        labels: {},
      },
      status: {
        phase: "disconnected",
      },
      spec: {},
    });

    categoryRegistry.add(new FooBarCategory());
    expect(entityRegistry.entities.get().length).toBe(1);
  });

  it("does not return items that are filtered out", () => {
    eventHandlers.add(entity);
    eventHandlers.add(entity2);
    eventHandlers.add(entitykc);

    expect(entityRegistry.entities.get().length).toBe(3);
    expect(entityRegistry.filteredEntities.get().length).toBe(3);

    const d = entityRegistry.addFilter(entity => entity.kind === KubernetesCluster.kind);

    expect(entityRegistry.entities.get().length).toBe(3);
    expect(entityRegistry.filteredEntities.get().length).toBe(1);

    // Remove filter
    d();

    expect(entityRegistry.entities.get().length).toBe(3);
    expect(entityRegistry.filteredEntities.get().length).toBe(3);
  });
});
