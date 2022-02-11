/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { NodeShellSessionArgs, NodeShellSessionDependencies } from "./shell-session";
import { NodeShellSession } from "./shell-session";
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import statInjectable from "../../../common/fs/stat.injectable";
import terminalShellInjectable from "../../../common/user-preferences/terminal-shell.injectable";
import electronAppVersionInjectable from "../../electron/app-version.injectable";
import ensureShellProcessInjectable from "../ensure-process.injectable";
import localShellSessionLoggerInjectable from "../local/logger.injectable";
import { kubeJsonApiForClusterInjectionToken } from "../../../common/k8s-api/kube-json-api-for-cluster.token";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";

export type OpenNodeShellSession = (args: NodeShellSessionArgs) => void;

const openNodeShellSession = (deps: NodeShellSessionDependencies): OpenNodeShellSession => (
  (args) => {
    new NodeShellSession(deps, args)
      .open()
      .catch(error => deps.logger.error("Failed to open a node shell", error));
  }
);

const openNodeShellSessionInjectable = getInjectable({
  instantiate: (di) => openNodeShellSession({
    appEventBus: di.inject(appEventBusInjectable),
    appName: di.inject(appNameInjectable),
    appVersion: di.inject(electronAppVersionInjectable),
    ensureShellProcess: di.inject(ensureShellProcessInjectable),
    logger: di.inject(localShellSessionLoggerInjectable),
    stat: di.inject(statInjectable),
    shell: di.inject(terminalShellInjectable),
    kubeJsonApiForCluster: di.inject(kubeJsonApiForClusterInjectionToken),
    isMac: di.inject(isMacInjectable),
    isWindows: di.inject(isWindowsInjectable),
  }),
  id: "open-node-shell-session",
});

export default openNodeShellSessionInjectable;

