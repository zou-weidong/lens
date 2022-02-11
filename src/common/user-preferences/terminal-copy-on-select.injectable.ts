/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface TerminalCopyOnSelect {
  readonly value: boolean;
  toggle: () => void;
}

const terminalCopyOnSelectInjectable = getInjectable({
  instantiate: (di): TerminalCopyOnSelect => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.terminalCopyOnSelect;
      },
      toggle: () => {
        store.terminalCopyOnSelect = !store.terminalCopyOnSelect;
      },
    };
  },
  id: "terminal-copy-on-select",
});

export default terminalCopyOnSelectInjectable;
