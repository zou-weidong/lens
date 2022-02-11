/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "./observable-history.injectable";
import { PageParam, type PageParamInit, type PageParamDependencies } from "./page-param";

export type CreatePageParam = <V>(args: PageParamInit<V>) => PageParam<V>;

const createPageParamInjectable = getInjectable({
  id: "create-page-param",
  instantiate: (di): CreatePageParam => {
    const deps: PageParamDependencies = {
      history: di.inject(observableHistoryInjectable),
    };

    return (args) => new PageParam(deps, args);
  },
});

export default createPageParamInjectable;
