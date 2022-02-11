/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import type { ObservableHistory } from "mobx-observable-history";
import type { WindowLocationChanged } from "../../../../common/ipc/window/location-changed.token";
import observableHistoryInjectable from "../../../navigation/observable-history.injectable";
import type { Disposer } from "../../../utils";
import windowLocationChangedInjectable from "../../window/location-changed.injectable";

export type WatchLocation = () => Disposer;

interface Dependencies {
  navigation: ObservableHistory;
  windowLocationChanged: WindowLocationChanged;
}

const watchLocation = ({
  navigation,
  windowLocationChanged,
}: Dependencies): WatchLocation => (
  () => reaction(() => navigation.location, windowLocationChanged)
);

const watchLocationInjectable = getInjectable({
  instantiate: (di) => watchLocation({
    navigation: di.inject(observableHistoryInjectable),
    windowLocationChanged: di.inject(windowLocationChangedInjectable),
  }),
  id: "watch-location",
});

export default watchLocationInjectable;
