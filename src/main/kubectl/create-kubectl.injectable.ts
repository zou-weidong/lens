/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubectlDependencies } from "./kubectl";
import { Kubectl } from "./kubectl";
import directoryForKubectlBinariesInjectable from "../../common/paths/directory-for-kubectl-binaries.injectable";
import bundledKubectlBinaryPathInjectable from "../../common/vars/bundled-kubectl-binary.injectable";
import copyFileInjectable from "../../common/fs/copy-file.injectable";
import chmodInjectable from "../../common/fs/chmod.injectable";
import createWriteStreamInjectable from "../../common/fs/create-write-stream.injectable";
import directoryForBundledBinariesInjectable from "../../common/vars/directory-for-bundled-binaries.injectable";
import downloadBinariesPathInjectable from "../../common/user-preferences/download-binaries-path.injectable";
import downloadKubectlBinariesInjectable from "../../common/user-preferences/download-kubectl-binaries.injectable";
import downloadMirrorInjectable from "../../common/user-preferences/download-mirror.injectable";
import execFileInjectable from "../../common/utils/exec-file.injectable";
import kubectlBinariesPathInjectable from "../../common/user-preferences/kubectl-binaries-path.injectable";
import kubectlBinaryNameInjectable from "../../common/vars/kubectl-binary-name.injectable";
import kubectlLoggerInjectable from "./logger.injectable";
import unlinkInjectable from "../../common/fs/unlink.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";

export type CreateKubectl = (clusterVersion: string) => Kubectl;

const createKubectlInjectable = getInjectable({
  instantiate: (di): CreateKubectl => {
    const deps: KubectlDependencies = {
      directoryForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
      bundledKubectlPath: di.inject(bundledKubectlBinaryPathInjectable),
      chmod: di.inject(chmodInjectable),
      copyFile: di.inject(copyFileInjectable),
      createWriteStream: di.inject(createWriteStreamInjectable),
      directoryForBundledBinaries: di.inject(directoryForBundledBinariesInjectable),
      downloadBinariesPath: di.inject(downloadBinariesPathInjectable),
      downloadKubectlBinaries: di.inject(downloadKubectlBinariesInjectable),
      downloadMirror: di.inject(downloadMirrorInjectable),
      execFile: di.inject(execFileInjectable),
      kubectlBinariesPath: di.inject(kubectlBinariesPathInjectable),
      kubectlBinaryName: di.inject(kubectlBinaryNameInjectable),
      logger: di.inject(kubectlLoggerInjectable),
      unlink: di.inject(unlinkInjectable),
      writeFile: di.inject(writeFileInjectable),
    };

    return (version) => new Kubectl(deps, version);
  },
  id: "create-kubectl",
});

export default createKubectlInjectable;
