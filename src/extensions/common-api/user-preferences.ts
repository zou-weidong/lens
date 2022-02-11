/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import kubectlBinariesPathInjectable from "../../common/user-preferences/kubectl-binaries-path.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

const kubectlBinariesPath = asLegacyGlobalForExtensionApi(kubectlBinariesPathInjectable);

/**
 * Get the configured kubectl binaries path.
 */
export function getKubectlPath(): string | undefined {
  return kubectlBinariesPath.value;
}
