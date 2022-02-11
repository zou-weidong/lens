/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";
import type { Move } from "../../../common/fs/move.injectable";
import moveInjectable from "../../../common/fs/move.injectable";
import type { Remove } from "../../../common/fs/remove.injectable";
import removeInjectable from "../../../common/fs/remove.injectable";

interface Dependencies {
  userDataPath: string;
  move: Move;
  remove: Remove;
}

const fileNameMigration = ({ userDataPath, move, remove }: Dependencies) => (
  async () => {
    const configJsonPath = path.join(userDataPath, "config.json");
    const lensUserStoreJsonPath = path.join(userDataPath, "lens-user-store.json");

    switch (await move(configJsonPath, lensUserStoreJsonPath)) {
      case "dest-exists":
        return remove(configJsonPath);
      case "src-not-exist":
      case "success":
        // do nothing
    }
  }
);

const fileNameMigrationInjectable = getInjectable({
  instantiate: (di) => fileNameMigration({
    userDataPath: di.inject(directoryForUserDataInjectable),
    move: di.inject(moveInjectable),
    remove: di.inject(removeInjectable),
  }),
  id: "file-name-migration",
});

export default fileNameMigrationInjectable;

