/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LocalShellSessionArgs, LocalShellSessionDependencies } from "./shell-session";
import { LocalShellSession } from "./shell-session";
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import electronAppVersionInjectable from "../../electron/app-version.injectable";
import ensureShellProcessInjectable from "../ensure-process.injectable";
import localShellSessionLoggerInjectable from "./logger.injectable";
import terminalShellEnvModifyInjectable from "../shell-env-modifier/modifier.injectable";
import statInjectable from "../../../common/fs/stat.injectable";
import terminalShellInjectable from "../../../common/user-preferences/terminal-shell.injectable";
import downloadKubectlBinariesInjectable from "../../../common/user-preferences/download-kubectl-binaries.injectable";
import kubectlBinariesPathInjectable from "../../../common/user-preferences/kubectl-binaries-path.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import directoryForBundledBinariesInjectable from "../../../common/vars/directory-for-bundled-binaries.injectable";

export type OpenLocalShellSession = (args: LocalShellSessionArgs) => void;

const openLocalShellSession = (deps: LocalShellSessionDependencies): OpenLocalShellSession => (
  (args) => {
    new LocalShellSession(deps, args)
      .open()
      .catch(error => deps.logger.error("Failed to open a local shell", error));
  }
);

const openLocalShellSessionInjectable = getInjectable({
  instantiate: (di) => openLocalShellSession({
    appEventBus: di.inject(appEventBusInjectable),
    appName: di.inject(appNameInjectable),
    appVersion: di.inject(electronAppVersionInjectable),
    ensureShellProcess: di.inject(ensureShellProcessInjectable),
    logger: di.inject(localShellSessionLoggerInjectable),
    shellEnvModify: di.inject(terminalShellEnvModifyInjectable),
    stat: di.inject(statInjectable),
    shell: di.inject(terminalShellInjectable),
    downloadKubectlBinaries: di.inject(downloadKubectlBinariesInjectable),
    kubectlBinariesPath: di.inject(kubectlBinariesPathInjectable),
    isMac: di.inject(isMacInjectable),
    isWindows: di.inject(isWindowsInjectable),
    directoryForBundledBinaries: di.inject(directoryForBundledBinariesInjectable),
  }),
  id: "open-local-shell-session",
});

export default openLocalShellSessionInjectable;

