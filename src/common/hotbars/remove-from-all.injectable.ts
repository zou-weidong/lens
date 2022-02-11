/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import hotbarsInjectable from "./hotbars.injectable";

/**
 * Remove all hotbar items that reference the `uid`.
 * @param uid The `EntityId` that each hotbar item refers to
 */
export type RemoveFromAllHotbars = (uid: string) => void;

const removeFromAllHotbarsInjectable = getInjectable({
  instantiate: (di): RemoveFromAllHotbars => {
    const hotbars = di.inject(hotbarsInjectable);

    return action((uid) => {
      for (const hotbar of hotbars.values()) {
        hotbar.remove(uid);
      }
    });
  },
  id: "remove-from-all-hotbars",
});

export default removeFromAllHotbarsInjectable;
