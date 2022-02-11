/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface TerminalShell {
  readonly rawValue: string;
  readonly resolvedValue: string;
  set: (value: string) => void;
}

const terminalShellInjectable = getInjectable({
  instantiate: (di): TerminalShell => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get rawValue() {
        return store.shell;
      },
      get resolvedValue() {
        return store.shell || process.env.SHELL || process.env.PTYSHELL;
      },
      set: (value) => {
        store.shell = value;
      },
    };
  },
  id: "terminal-shell",
});

export default terminalShellInjectable;
