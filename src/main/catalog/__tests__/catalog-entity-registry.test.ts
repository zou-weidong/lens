/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, reaction } from "mobx";
import type { WebLinkSpec, WebLinkStatus } from "../../../common/catalog/entity/declarations";
import { WebLink } from "../../../common/catalog/entity/declarations";
import { CatalogEntity, type CatalogEntityMetadata } from "../../../common/catalog/entity";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { CatalogEntityRegistry } from "../entity/registry";
import catalogEntityRegistryInjectable from "../entity/registry.injectable";

class InvalidEntity extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "Invalid";

  async onRun() {
    return;
  }

  public onSettingsOpen(): void {
    return;
  }

  public onDetailsOpen(): void {
    return;
  }

  public onContextMenuOpen(): void {
    return;
  }
}

describe("CatalogEntityRegistry", () => {
  let registry: CatalogEntityRegistry;
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
  const invalidEntity = new InvalidEntity({
    metadata: {
      uid: "invalid",
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

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    registry = di.inject(catalogEntityRegistryInjectable);
  });

  describe("addSource", () => {
    it ("allows to add a computed source", () => {
      const source = observable.array<CatalogEntity>([]);

      registry.addSource(computed(() => [...source]));
      expect(registry.entities.get().length).toEqual(0);

      source.push(entity);

      expect(registry.entities.get().length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array<CatalogEntity>([]);

      registry.addSource(computed(() => [...source]));
      reaction(() => registry.entities.get(), () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array<CatalogEntity>([]);
      const removeSource = registry.addSource(computed(() => [...source]));

      source.push(entity);
      expect(registry.entities.get().length).toEqual(1);
      removeSource();
      expect(registry.entities.get().length).toEqual(0);
    });
  });

  describe("entities.get()", () => {
    it("returns added entities.get()", () => {
      expect(registry.entities.get().length).toBe(0);

      const source = observable.array<CatalogEntity>([entity]);

      registry.addSource(computed(() => [...source]));
      expect(registry.entities.get().length).toBe(1);
    });

    it("does not return entities.get() without matching category", () => {
      const source = observable.array<CatalogEntity>([invalidEntity]);

      registry.addSource(computed(() => [...source]));
      expect(registry.entities.get().length).toBe(0);
    });
  });
});
