/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { anyObject } from "jest-mock-extended";
import mockFs from "mock-fs";
import type { HotbarStore } from "../hotbars/store";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import directoryForUserDataInjectable from "../paths/user-data.injectable";
import type { CatalogEntityData, CatalogEntityKindData, CatalogEntity } from "../catalog/entity";
import { hotbarStoreInjectionToken } from "../hotbars/store-injection-token";
import type { IComputedValue } from "mobx";
import type { Hotbar } from "../hotbars/hotbar";
import activeHotbarInjectable from "../hotbars/active-hotbar.injectable";
import type { LensLogger } from "../logger";
import hotbarStoreLoggerInjectable from "../hotbars/logger.injectable";
import type { GetHotbarById } from "../hotbars/get-by-id.injectable";
import getHotbarByIdInjectable from "../hotbars/get-by-id.injectable";
import { iter } from "../utils";

jest.mock("../../main/catalog/catalog-entity-registry", () => ({
  catalogEntityRegistry: {
    items: [
      getMockCatalogEntity({
        apiVersion: "v1",
        kind: "Cluster",
        status: {
          phase: "Running",
        },
        metadata: {
          uid: "1dfa26e2ebab15780a3547e9c7fa785c",
          name: "mycluster",
          source: "local",
          labels: {},
        },
      }),
      getMockCatalogEntity({
        apiVersion: "v1",
        kind: "Cluster",
        status: {
          phase: "Running",
        },
        metadata: {
          uid: "55b42c3c7ba3b04193416cda405269a5",
          name: "my_shiny_cluster",
          source: "remote",
          labels: {},
        },
      }),
      getMockCatalogEntity({
        apiVersion: "v1",
        kind: "Cluster",
        status: {
          phase: "Running",
        },
        metadata: {
          uid: "catalog-entity",
          name: "Catalog",
          source: "app",
          labels: {},
        },
      }),
    ],
  },
}));

function getMockCatalogEntity(data: Partial<CatalogEntityData> & CatalogEntityKindData): CatalogEntity {
  return {
    getName: jest.fn(() => data.metadata?.name),
    getId: jest.fn(() => data.metadata?.uid),
    getSource: jest.fn(() => data.metadata?.source ?? "unknown"),
    isEnabled: jest.fn(() => data.status?.enabled ?? true),
    onContextMenuOpen: jest.fn(),
    onSettingsOpen: jest.fn(),
    metadata: {},
    spec: {},
    status: {},
    ...data,
  } as CatalogEntity;
}

const testCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "test",
    name: "test",
    labels: {},
  },
});

const minikubeCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "minikube",
    name: "minikube",
    labels: {},
  },
});

const awsCluster = getMockCatalogEntity({
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running",
  },
  metadata: {
    uid: "aws",
    name: "aws",
    labels: {},
  },
});

describe("HotbarStore", () => {
  let store: HotbarStore;
  let activeHotbar: IComputedValue<Hotbar>;
  let logger: jest.Mocked<LensLogger>;
  let getHotbarById: GetHotbarById;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doStoresOverrides: [
      "hotbar-store-token",
    ] });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await di.runSetups();

    store = di.inject(hotbarStoreInjectionToken);
    activeHotbar = di.inject(activeHotbarInjectable);
    getHotbarById = di.inject(getHotbarByIdInjectable);
    logger = di.inject(hotbarStoreLoggerInjectable) as jest.Mocked<LensLogger>;

    mockFs({
      "some-directory-for-user-data": {
        "lens-hotbar-store.json": JSON.stringify({}),
      },
    });

  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("load", () => {
    it("loads one hotbar by default", () => {
      expect(store.hotbars.size).toEqual(1);
    });
  });

  describe("add", () => {
    it("adds a hotbar", () => {
      store.add({ name: "hottest" });
      expect(store.hotbars.size).toEqual(2);
    });
  });

  describe("hotbar items", () => {
    it("initially creates 12 empty cells", () => {
      expect(activeHotbar.get().items.length).toEqual(12);
    });

    it("initially adds catalog entity as first item", () => {
      expect(activeHotbar.get().items[0].entity.name).toEqual("Catalog");
    });

    it("adds items", () => {
      activeHotbar.get().add(testCluster);
      const items = activeHotbar.get().items.filter(Boolean);

      expect(items.length).toEqual(2);
    });

    it("removes items", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().remove("test");
      activeHotbar.get().remove("catalog-entity");
      const items = activeHotbar.get().items.filter(Boolean);

      expect(items).toStrictEqual([]);
    });

    it("does nothing if removing with invalid uid", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().remove("invalid uid");
      const items = activeHotbar.get().items.filter(Boolean);

      expect(items.length).toEqual(2);
    });

    it("moves item to empty cell", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().add(minikubeCluster);
      activeHotbar.get().add(awsCluster);

      expect(activeHotbar.get().items[6]).toBeNull();

      activeHotbar.get().restackItems(1, 5);

      expect(activeHotbar.get().items[5]).toBeTruthy();
      expect(activeHotbar.get().items[5].entity.uid).toEqual("test");
    });

    it("moves items down", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().add(minikubeCluster);
      activeHotbar.get().add(awsCluster);

      // aws -> catalog
      activeHotbar.get().restackItems(3, 0);

      const items = activeHotbar.get().items.map(item => item?.entity.uid || null);

      expect(items.slice(0, 4)).toEqual(["aws", "catalog-entity", "test", "minikube"]);
    });

    it("moves items up", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().add(minikubeCluster);
      activeHotbar.get().add(awsCluster);

      // test -> aws
      activeHotbar.get().restackItems(1, 3);

      const items = activeHotbar.get().items.map(item => item?.entity.uid || null);

      expect(items.slice(0, 4)).toEqual(["catalog-entity", "minikube", "aws", "test"]);
    });

    it("logs an error if cellIndex is out of bounds", () => {
      store.add({ name: "hottest", id: "hottest" });
      store.setActiveHotbar("hottest");
      activeHotbar.get().add(testCluster, -1);
      expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

      activeHotbar.get().add(testCluster, 12);
      expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

      activeHotbar.get().add(testCluster, 13);
      expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());
    });

    it("throws an error if getId is invalid or returns not a string", () => {
      expect(() => activeHotbar.get().add({} as any)).toThrowError(TypeError);
      expect(() => activeHotbar.get().add({ getId: () => true } as any)).toThrowError(TypeError);
    });

    it("throws an error if getName is invalid or returns not a string", () => {
      expect(() => activeHotbar.get().add({ getId: () => "" } as any)).toThrowError(TypeError);
      expect(() => activeHotbar.get().add({ getId: () => "", getName: () => 4 } as any)).toThrowError(TypeError);
    });

    it("does nothing when item moved to same cell", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().restackItems(1, 1);

      expect(activeHotbar.get().items[1].entity.uid).toEqual("test");
    });

    it("new items takes first empty cell", () => {
      activeHotbar.get().add(testCluster);
      activeHotbar.get().add(awsCluster);
      activeHotbar.get().restackItems(0, 3);
      activeHotbar.get().add(minikubeCluster);

      expect(activeHotbar.get().items[0].entity.uid).toEqual("minikube");
    });

    it("throws if invalid arguments provided", () => {
      // Prevent writing to stderr during this render.
      const { error, warn } = console;

      console.error = jest.fn();
      console.warn = jest.fn();

      activeHotbar.get().add(testCluster);

      expect(() => activeHotbar.get().restackItems(-5, 0)).toThrow();
      expect(() => activeHotbar.get().restackItems(2, -1)).toThrow();
      expect(() => activeHotbar.get().restackItems(14, 1)).toThrow();
      expect(() => activeHotbar.get().restackItems(11, 112)).toThrow();

      // Restore writing to stderr.
      console.error = error;
      console.warn = warn;
    });

    it("checks if entity already pinned to hotbar", () => {
      activeHotbar.get().add(testCluster);

      expect(activeHotbar.get().has(testCluster)).toBeTruthy();
      expect(activeHotbar.get().has(awsCluster)).toBeFalsy();
    });
  });

  describe("pre beta-5 migrations", () => {
    beforeEach(() => {
      const mockOpts = {
        "some-directory-for-user-data": {
          "lens-hotbar-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.0.0-beta.3",
              },
            },
            "hotbars": [
              {
                "id": "3caac17f-aec2-4723-9694-ad204465d935",
                "name": "myhotbar",
                "items": [
                  {
                    "entity": {
                      "uid": "1dfa26e2ebab15780a3547e9c7fa785c",
                    },
                  },
                  {
                    "entity": {
                      "uid": "55b42c3c7ba3b04193416cda405269a5",
                    },
                  },
                  {
                    "entity": {
                      "uid": "176fd331968660832f62283219d7eb6e",
                    },
                  },
                  {
                    "entity": {
                      "uid": "61c4fb45528840ebad1badc25da41d14",
                      "name": "user1-context",
                      "source": "local",
                    },
                  },
                  {
                    "entity": {
                      "uid": "27d6f99fe9e7548a6e306760bfe19969",
                      "name": "foo2",
                      "source": "local",
                    },
                  },
                  null,
                  {
                    "entity": {
                      "uid": "c0b20040646849bb4dcf773e43a0bf27",
                      "name": "multinode-demo",
                      "source": "local",
                    },
                  },
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          }),
        },
      };

      mockFs(mockOpts);

    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows to retrieve a hotbar", () => {
      const hotbar = getHotbarById("3caac17f-aec2-4723-9694-ad204465d935");

      expect(hotbar.name).toBe("myhotbar");
    });

    it("clears cells without entity", () => {
      const { items } = iter.first(store.hotbars.values());

      expect(items[2]).toBeNull();
    });

    it("adds extra data to cells with according entity", () => {
      const { items } = iter.first(store.hotbars.values());

      expect(items[0]).toEqual({
        entity: {
          name: "mycluster",
          source: "local",
          uid: "1dfa26e2ebab15780a3547e9c7fa785c",
        },
      });

      expect(items[1]).toEqual({
        entity: {
          name: "my_shiny_cluster",
          source: "remote",
          uid: "55b42c3c7ba3b04193416cda405269a5",
        },
      });
    });
  });
});
