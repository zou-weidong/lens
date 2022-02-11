/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createObservableHistory } from "mobx-observable-history";
import historyInjectable from "./history.injectable";
import navigationLoggerInjectable from "./logger.injectable";

// skip empty params, e.g. "?x=&y2=" will be "?y=2"
export const skipEmptySearchParams = true;

const observableHistoryInjectable = getInjectable({
  id: "observable-history",
  instantiate: (di) => {
    const logger = di.inject(navigationLoggerInjectable);
    const navigation = createObservableHistory(di.inject(historyInjectable), {
      searchParams: {
        skipEmpty: skipEmptySearchParams,
        joinArrays: false, // join multiple params with same name, e.g. "?x=1&x=2" => "?x=1,2"
        joinArraysWith: ",", // param values splitter, applicable only with {joinArrays:true}
      },
    });

    navigation.listen((location, action) => {
      const isClusterView = !process.isMainFrame;
      const domain = global.location.href;

      logger.debug(`${action}-ing. Current is now:`, { isClusterView, domain, location });
    });

    return navigation;
  },
});

export default observableHistoryInjectable;
