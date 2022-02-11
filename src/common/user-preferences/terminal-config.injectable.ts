/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface TerminalConfig {
  readonly fontSize: number;
  setFontSize: (val: number) => void;

  readonly fontFamily: string;
  setFontFamily: (val: string) => void;
}

const terminalConfigInjectable = getInjectable({
  instantiate: (di): TerminalConfig => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get fontSize() {
        return store.terminalConfig.fontSize;
      },
      setFontSize: (val) => {
        store.terminalConfig.fontSize = val;
      },
      get fontFamily() {
        return store.terminalConfig.fontFamily;
      },
      setFontFamily: (val) => {
        store.terminalConfig.fontFamily = val;
      },
    };
  },
  id: "terminal_config",
});

export default terminalConfigInjectable;
