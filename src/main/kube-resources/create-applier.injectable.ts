/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/clusters/cluster";
import { ResourceApplier } from "./applier";
import type { ResourceApplierDependencies } from "./applier";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import kubeResourceApplierLoggerInjectable from "./logger.injectable";
import removeInjectable from "../../common/fs/remove.injectable";
import tmpDirInjectable from "../../common/vars/tmp-dir.injectable";
import unlinkInjectable from "../../common/fs/unlink.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import execFileInjectable from "../../common/utils/exec-file.injectable";

export type CreateResourceApplier = (cluster: Cluster) => ResourceApplier;

const createResourceApplierInjectable = getInjectable({
  instantiate: (di): CreateResourceApplier => {
    const deps: ResourceApplierDependencies = {
      appEventBus: di.inject(appEventBusInjectable),
      logger: di.inject(kubeResourceApplierLoggerInjectable),
      remove: di.inject(removeInjectable),
      tmpDir: di.inject(tmpDirInjectable),
      unlink: di.inject(unlinkInjectable),
      writeFile: di.inject(writeFileInjectable),
      execFile: di.inject(execFileInjectable),
    };

    return (cluster) => new ResourceApplier(deps, cluster);
  },
  id: "create-resource-applier",
});

export default createResourceApplierInjectable;
