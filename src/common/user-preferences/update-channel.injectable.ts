/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";
import appVersionInjectable from "../vars/app-version.injectable";

export interface UpdateChannel {
  readonly value: string;
  readonly isAllowedToDowngrade: boolean;
  set: (channel: string) => void;
}

const updateChannelInjectable = getInjectable({
  instantiate: (di): UpdateChannel => {
    const store = di.inject(userPreferencesStoreInjectionToken);
    const appVersion = di.inject(appVersionInjectable);

    return {
      get value() {
        return store.updateChannel;
      },
      get isAllowedToDowngrade() {
        return appVersion.prerelease[0] !== store.updateChannel;
      },
      set: (channel) => {
        store.updateChannel = channel;
      },
    };
  },
  id: "update-channel",
});

export default updateChannelInjectable;
