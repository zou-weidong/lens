/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppUpdater } from "electron-updater";
import isPublishConfiguredInjectable from "../../common/vars/is-publish-configured.injectable";
import electronUpdaterInjectable from "./electron-updater.injectable";

interface Dependencies {
  autoUpdater: AppUpdater;
  isPublishConfigured: boolean;
}

export type IsAutoUpdateEnabled = () => boolean;

const isAutoUpdateEnabled = ({ autoUpdater, isPublishConfigured }: Dependencies): IsAutoUpdateEnabled => (
  () => isPublishConfigured && autoUpdater.isUpdaterActive()
);

const isAutoUpdateEnabledInjectable = getInjectable({
  instantiate: (di) => isAutoUpdateEnabled({
    autoUpdater: di.inject(electronUpdaterInjectable),
    isPublishConfigured: di.inject(isPublishConfiguredInjectable),
  }),
  id: "is-auto-update-enabled",
});

export default isAutoUpdateEnabledInjectable;
