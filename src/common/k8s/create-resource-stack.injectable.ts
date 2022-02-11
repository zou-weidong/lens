/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubernetesCluster } from "../catalog/entity/declarations";
import readDirInjectable from "../fs/read-dir.injectable";
import readFileInjectable from "../fs/read-file.injectable";
import { kubectlApplyAllInjectionToken } from "../ipc/kubectl/apply-all.token";
import { kubectlDeleteAllInjectionToken } from "../ipc/kubectl/delete-all.token";
import productNameInjectable from "../vars/product-name.injectable";
import type { ResourceStackDependencies } from "./resource-stack";
import { ResourceStack } from "./resource-stack";
import resourceStackLoggerInjectable from "./resource-stack-logger.injectable";

export type CreateResourceStack = (cluster: KubernetesCluster, name: string) => ResourceStack;

const createResourceStackInjectable = getInjectable({
  instantiate: (di): CreateResourceStack => {
    const deps: ResourceStackDependencies = {
      kubectlApplyAll: di.inject(kubectlApplyAllInjectionToken.token),
      kubectlDeleteAll: di.inject(kubectlDeleteAllInjectionToken.token),
      logger: di.inject(resourceStackLoggerInjectable),
      productName: di.inject(productNameInjectable),
      readDir: di.inject(readDirInjectable),
      readFile: di.inject(readFileInjectable),
    };

    return (cluster, name) => new ResourceStack(deps, cluster, name);
  },
  id: "create-resource-stack",
});

export default createResourceStackInjectable;
