/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../extensions/di-legacy-globals/for-extension-api";
import { baseLoggerInjectionToken } from "./logger/base-logger.token";

export interface LensLogger {
  error: (message: string, meta?: Record<string, any>) => void;
  info: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
}

/**
 * @deprecated use either di.inject(baseLoggerInjectableToken) or di.inject(createChildLoggerInjectable)
 */
const logger = asLegacyGlobalForExtensionApi(baseLoggerInjectionToken);

export default logger;
