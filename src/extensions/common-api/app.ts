/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getAppVersion } from "../../common/utils";
import getEnabledExtensionNamesInjectable from "../../common/extensions/preferences/get-enabled.injectable";
import * as Preferences from "./user-preferences";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";
import isSnapInjectable from "../../common/vars/is-snap.injectable";
import { slackUrl, issuesTrackerUrl } from "../../common/vars";
import isLinuxInjectable from "../../common/vars/is-linux.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import appNameInjectable from "../../common/vars/app-name.injectable";
import { getLegacyGlobalDiForExtensionApi } from "../di-legacy-globals/setup";

export default Object.freeze({
  Preferences,
  slackUrl,
  issuesTrackerUrl,
  version: getAppVersion(),
  getEnabledExtensions: asLegacyGlobalForExtensionApi(getEnabledExtensionNamesInjectable),
  get isSnap() {
    return getLegacyGlobalDiForExtensionApi().inject(isSnapInjectable);
  },
  get isWindows() {
    return getLegacyGlobalDiForExtensionApi().inject(isWindowsInjectable);
  },
  get isMac() {
    return getLegacyGlobalDiForExtensionApi().inject(isMacInjectable);
  },
  get isLinux() {
    return getLegacyGlobalDiForExtensionApi().inject(isLinuxInjectable);
  },
  get appName() {
    return getLegacyGlobalDiForExtensionApi().inject(appNameInjectable);
  },
});
