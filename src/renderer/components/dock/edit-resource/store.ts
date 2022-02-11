/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { DockTabStore, type DockTabStoreOptions } from "../dock-tab.store";
import type { TabId } from "../dock/store";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import type { ApiManager } from "../../../../common/k8s-api/api-manager";

export interface EditingResource {
  resource: string; // resource path, e.g. /api/v1/namespaces/default
  draft?: string; // edited draft in yaml
  firstDraft?: string;
}

interface Dependencies {
  readonly apiManager: ApiManager;
}

export class EditResourceTabStore extends DockTabStore<EditingResource> {
  protected finalizeDataForSave({ draft, ...data }: EditingResource): EditingResource {
    return data; // skip saving draft to local-storage
  }

  constructor(protected readonly dependencies: Dependencies, options?: DockTabStoreOptions<EditingResource>) {
    super(options);
  }

  isReady(tabId: TabId) {
    return super.isReady(tabId) && Boolean(this.getResource(tabId)); // ready to edit resource
  }

  getStore(tabId: TabId): KubeObjectStore<KubeObject> | undefined {
    return this.dependencies.apiManager.getStore(this.getResourcePath(tabId));
  }

  getResource(tabId: TabId): KubeObject | undefined {
    return this.getStore(tabId)?.getByPath(this.getResourcePath(tabId));
  }

  getResourcePath(tabId: TabId): string | undefined {
    return this.getData(tabId)?.resource;
  }

  getTabIdByResource(object: KubeObject): TabId {
    return this.findTabIdFromData(({ resource }) => object.selfLink === resource);
  }

  clearInitialDraft(tabId: TabId): void {
    delete this.getData(tabId)?.firstDraft;
  }
}
