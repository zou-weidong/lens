/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createContainer } from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "../extensions/di-legacy-globals/setup";

export function getDi() {
  const di = createContainer(
    () => require.context("./", true, /\.injectable\.(ts|tsx)$/),
    () => require.context("../extensions", true, /\.injectable\.(ts|tsx)$/),
    () => require.context("../common", true, /\.injectable\.(ts|tsx)$/),
  );

  setLegacyGlobalDiForExtensionApi(di);

  return di;
}
