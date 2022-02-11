/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import React from "react";

export interface CommandOverlay {
  open: (component: React.ReactElement) => void;
  close: () => void;
  readonly isOpen: boolean;
  readonly component: React.ReactElement | null;
}

const commandOverlayInjectable = getInjectable({
  instantiate: (): CommandOverlay => {
    const state = observable.box<React.ReactElement | null>(null, { deep: false });

    return {
      open: (component: React.ReactElement) => {
        if (!React.isValidElement(component)) {
          throw new TypeError("CommandOverlay.open must be passed a valid ReactElement");
        }

        state.set(component);
      },
      close: () => {
        state.set(null);
      },
      get isOpen(): boolean {
        return Boolean(state.get());
      },
      get component(): React.ReactElement | null {
        return state.get();
      },
    };
  },
  id: "command_overlay",
});

export default commandOverlayInjectable;
