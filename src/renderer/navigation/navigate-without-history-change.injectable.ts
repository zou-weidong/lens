/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "./observable-history.injectable";

export type NavigateWithoutHistoryChange = (location: Partial<Location>) => void;

const navigateWithoutHistoryChangeInjectable = getInjectable({
  id: "navigate-without-history-change",
  instantiate: (di): NavigateWithoutHistoryChange => {
    const navigation = di.inject(observableHistoryInjectable);

    return (location) => navigation.merge(location, true);
  },
});

export default navigateWithoutHistoryChangeInjectable;
