/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createPath, LocationDescriptor } from "history";
import { action } from "mobx";
import type { ObservableHistory } from "mobx-observable-history";
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "./observable-history.injectable";

export type Navigate = (location: LocationDescriptor) => void;

interface Dependencies {
  navigation: ObservableHistory;
}

const navigate = ({ navigation }: Dependencies): Navigate => (
  action((url) => {
    const currentLocation = createPath(navigation.location);

    navigation.push(url);

    const newLocation = createPath(navigation.location);

    if (currentLocation === newLocation) {
      navigation.goBack(); // prevent sequences of same url in history
    }
  })
);

const navigateInjectable = getInjectable({
  instantiate: (di) => navigate({
    navigation: di.inject(observableHistoryInjectable),
  }),
  id: "navigate",
});

export default navigateInjectable;

