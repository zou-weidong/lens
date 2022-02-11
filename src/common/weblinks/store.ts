/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable } from "mobx";
import type { BaseStoreDependencies, BaseStoreParams } from "../base-store";
import { BaseStore } from "../base-store";
import * as uuid from "uuid";
import { toJS } from "../utils";

export interface WeblinkModel extends WeblinkData {
  id: string;
}

export interface WeblinkData {
  name: string;
  url: string;
}

export interface WeblinkCreateOptions {
  id?: string;
  name: string;
  url: string;
}

export interface WeblinkStoreModel {
  weblinks: WeblinkModel[];
}

export class WeblinkStore extends BaseStore<WeblinkStoreModel> {
  readonly displayName = "WeblinkStore";
  protected readonly weblinks = observable.map<string, WeblinkData>();

  constructor(deps: BaseStoreDependencies, params: BaseStoreParams<WeblinkStoreModel>) {
    super(deps, {
      ...params,
      name: "lens-weblink-store",
    });
  }

  protected fromStore(data: Partial<WeblinkStoreModel> = {}) {
    const { weblinks = [] } = data;

    this.weblinks.replace(weblinks.map(({ id, ...rest }) => [id, rest]));
  }

  readonly links = computed(() => Array.from(this.weblinks, ([id, data]) => ({ id, ...data })));

  add(data: WeblinkCreateOptions): WeblinkData {
    const { id = uuid.v4(), ...weblink } = data;

    this.weblinks.set(id, weblink);

    return weblink;
  }

  removeById(id: string) {
    this.weblinks.delete(id);
  }

  getById(id: string) {
    return this.weblinks.get(id);
  }

  toJSON(): WeblinkStoreModel {
    const model: WeblinkStoreModel = {
      weblinks: Array.from(this.weblinks, ([id, weblink]) => ({ id, ...weblink })),
    };

    return toJS(model);
  }
}
