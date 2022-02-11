/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityActionContext, CatalogEntityMetadata, CatalogEntitySpec, CatalogEntityStatus } from "../../entity";
import { CatalogEntity } from "../../entity";

export interface GeneralEntitySpec extends CatalogEntitySpec {
  path: string;
  icon?: {
    material?: string;
    background?: string;
  };
}

export class GeneralEntity extends CatalogEntity<CatalogEntityMetadata, CatalogEntityStatus, GeneralEntitySpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "General";

  onRun(context: CatalogEntityActionContext) {
    context.navigate(this.spec.path);
  }
}
