/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForKubeConfigsInjectable from "./local-kube-configs.injectable";

export type GetCustomKubeConfigDirectory = (dirName: string) => string;

const getCustomKubeConfigDirectoryInjectable = getInjectable({
  instantiate: (di): GetCustomKubeConfigDirectory => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);

    return (dirName) => path.resolve(directoryForKubeConfigs, dirName);
  },
  id: "get-custom-kube-config-directory",
});

export default getCustomKubeConfigDirectoryInjectable;
