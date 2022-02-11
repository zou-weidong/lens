/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../extensions/di-legacy-globals/for-extension-api";
import { apiBaseInjectionToken } from "./api-base.token";
import { apiKubeInjectionToken } from "./api-kube.token";

/**
 * @deprecated use di.inject(apiBaseInjectionToken) instead
 */
export const apiBase = asLegacyGlobalForExtensionApi(apiBaseInjectionToken);

/**
 * @deprecated use di.inject(apiKubeInjectionToken) instead
 */
export const apiKube = asLegacyGlobalForExtensionApi(apiKubeInjectionToken);
