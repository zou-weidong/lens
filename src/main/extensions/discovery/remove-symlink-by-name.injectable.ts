/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Remove } from "../../../common/fs/remove.injectable";
import removeInjectable from "../../../common/fs/remove.injectable";
import type { GetInstallPath } from "./get-install-path.injectable";
import getInstallPathInjectable from "./get-install-path.injectable";

export type RemoveSymlinkByExtensionName = (extName: string) => Promise<void>;

interface Dependencies {
  remove: Remove;
  getInstallPath: GetInstallPath;
}

const removeSymlinkByExtensionName = ({
  remove,
  getInstallPath,
}: Dependencies): RemoveSymlinkByExtensionName => (
  (extName) => remove(getInstallPath(extName))
);

const removeSymlinkByExtensionNameInjectable = getInjectable({
  instantiate: (di) => removeSymlinkByExtensionName({
    remove: di.inject(removeInjectable),
    getInstallPath: di.inject(getInstallPathInjectable),
  }),
  id: "remove-symlink-by-extension-name",
});

export default removeSymlinkByExtensionNameInjectable;
