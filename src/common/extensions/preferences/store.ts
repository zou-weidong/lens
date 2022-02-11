/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, makeObservable, observable } from "mobx";
import { iter, toJS } from "../../utils";
import type { BaseStoreDependencies, BaseStoreParams } from "../../base-store";
import { BaseStore } from "../../base-store";
import type { LensExtensionId } from "../manifest";
import type { InstalledExtension } from "../installed.injectable";

export interface ExtensionsPreferencesStoreModel {
  extensions: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled: boolean;
}

export class ExtensionsPreferencesStore extends BaseStore<ExtensionsPreferencesStoreModel> {
  constructor(deps: BaseStoreDependencies, params: BaseStoreParams<ExtensionsPreferencesStoreModel>) {
    super(deps, {
      ...params,
      name: "lens-extensions",
    });
    makeObservable(this);
  }

  readonly enabledExtensionIds = computed(() => (
    new Set(iter.filterMap(this.state, ([extId, { enabled }]) => enabled && extId))
  ));

  protected state = observable.map<LensExtensionId, LensExtensionState>();

  isEnabled({ isBundled, id }: Pick<InstalledExtension, "id" | "isBundled">): boolean {
    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return isBundled || Boolean(this.state.get(id)?.enabled);
  }

  setEnabled(extId: LensExtensionId, enabled: boolean) {
    if (this.state.has(extId)) {
      this.state.get(extId).enabled = enabled;
    } else {
      this.state.set(extId, { enabled });
    }
  }

  @action
  protected fromStore({ extensions }: ExtensionsPreferencesStoreModel) {
    this.state.merge(extensions);
  }

  toJSON(): ExtensionsPreferencesStoreModel {
    return toJS({
      extensions: Object.fromEntries(this.state),
    });
  }
}
