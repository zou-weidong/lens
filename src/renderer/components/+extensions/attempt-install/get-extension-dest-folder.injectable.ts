/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sanitizeExtensionName } from "../../../../extensions/lens-extension";
import path from "path";
import localExtensionsDirectoryInjectable from "../../../../common/paths/local-extensions.injectable";

export type GetExtensionDestFolder = (name: string) => string;

interface Dependencies {
  localExtensionsDirectory: string;
}

const getExtensionDestFolder = ({ localExtensionsDirectory }: Dependencies) => (
  (name: string) => path.join(localExtensionsDirectory, sanitizeExtensionName(name))
);

const getExtensionDestFolderInjectable = getInjectable({
  instantiate: (di) => getExtensionDestFolder({
    localExtensionsDirectory: di.inject(localExtensionsDirectoryInjectable),
  }),
  id: "get-extension-dest-folder",
});

export default getExtensionDestFolderInjectable;
