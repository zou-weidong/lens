/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterDependencies } from "../../common/cluster/cluster";
import { Cluster } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import authorizationReviewInjectable from "../../common/cluster/authorization-review.injectable";
import listNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import loggerInjectable from "../../common/logger.injectable";
import detectorRegistryInjectable from "../cluster-detectors/detector-registry.injectable";
import createVersionDetectorInjectable from "../cluster-detectors/create-version-detector.injectable";
import emitClusterConnectionUpdateInjectable from "../cluster/emit-connection-update.injectable";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: di.inject(createKubeconfigManagerInjectable),
      createKubectl: di.inject(createKubectlInjectable),
      createContextHandler: di.inject(createContextHandlerInjectable),
      createAuthorizationReview: di.inject(authorizationReviewInjectable),
      createListNamespaces: di.inject(listNamespacesInjectable),
      logger: di.inject(loggerInjectable),
      detectorRegistry: di.inject(detectorRegistryInjectable),
      createVersionDetector: di.inject(createVersionDetectorInjectable),
      emitClusterConnectionUpdate: di.inject(emitClusterConnectionUpdateInjectable),
    };

    return (model, configData) => new Cluster(dependencies, model, configData);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
