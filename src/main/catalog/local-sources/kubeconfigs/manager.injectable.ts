/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../../common/paths/local-kube-configs.injectable";
import { KubeconfigSyncManager } from "./manager";
import addCatalogSourceInjectable from "../../entity/add-source.injectable";
import kubeconfigSyncManagerLoggerInjectable from "./logger.injectable";
import watchFileChangesInjectable from "./watch-file-changes.injectable";
import kubeconfigSyncsInjectable from "../../../../common/user-preferences/kubeconfig-syncs.injectable";

const kubeconfigSyncManagerInjectable = getInjectable({
  instantiate: (di) => new KubeconfigSyncManager({
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    addComputedSource: di.inject(addCatalogSourceInjectable),
    logger: di.inject(kubeconfigSyncManagerLoggerInjectable),
    watchFileChanges: di.inject(watchFileChangesInjectable),
    kubeconfigSyncs: di.inject(kubeconfigSyncsInjectable),
  }),
  id: "kubeconfig-sync-manager",
});

export default kubeconfigSyncManagerInjectable;
