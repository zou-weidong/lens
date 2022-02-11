/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface UserSuppliedValuesAreShown {
  readonly value: boolean;
  toggle: () => void;
}

const userSuppliedValuesAreShownInjectable = getInjectable({
  instantiate: (): UserSuppliedValuesAreShown => {
    const state = observable.box(false);

    return {
      get value() {
        return state.get();
      },

      toggle: () => {
        state.set(!state.get());
      },
    };
  },
  id: "user-supplied-values-are-shown",
});

export default userSuppliedValuesAreShownInjectable;

