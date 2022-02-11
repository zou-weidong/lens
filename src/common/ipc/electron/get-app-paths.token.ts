/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getChannelInjectionToken } from "../channel";
import type { AppPaths } from "./app-paths.token";

export type GetAppPaths = () => Promise<AppPaths>;

export const getAppPathsInjectionToken = getChannelInjectionToken<GetAppPaths>("electron:app-paths");
