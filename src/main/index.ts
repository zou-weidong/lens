/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import * as Mobx from "mobx";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsMainApi from "../extensions/main-api";
import { getDi } from "./getDi";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";

const di = getDi();
const startApplication = di.inject(startMainApplicationInjectable);

void startApplication();

/**
 * Exports for virtual package "@k8slens/extensions" for main-process.
 * All exporting names available in global runtime scope:
 * e.g. global.Mobx, global.LensExtensions
 */
const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Main: LensExtensionsMainApi,
};

export { Mobx, LensExtensions };
