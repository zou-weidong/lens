/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Terminal, TerminalDependencies } from "./terminal";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import terminalConfigInjectable from "../../../../common/user-preferences/terminal-config.injectable";
import activeTerminalThemeInjectable from "../../../themes/active-terminal.injectable";
import terminalCopyOnSelectInjectable from "../../../../common/user-preferences/terminal-copy-on-select.injectable";

export type CreateTerminal = (tabId: TabId, api: TerminalApi) => Terminal;

const createTerminalInjectable = getInjectable({
  instantiate: (di): CreateTerminal => {
    const deps: TerminalDependencies = {
      isMac: di.inject(isMacInjectable),
      terminalConfig: di.inject(terminalConfigInjectable),
      activeTerminalTheme: di.inject(activeTerminalThemeInjectable),
      terminalCopyOnSelect: di.inject(terminalCopyOnSelectInjectable),
    };

    return (tabId, api) => new Terminal(deps, tabId, api);
  },
  id: "create-terminal",
});

export default createTerminalInjectable;
