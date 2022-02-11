/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import manifestFilenameInjectable from "../vars/manifest-filename.injectable";
import directoryForUserDataInjectable from "./user-data.injectable";

const lensPackageJsonPathInjectable = getInjectable({
  instantiate: (di) => path.join(
    di.inject(directoryForUserDataInjectable),
    di.inject(manifestFilenameInjectable),
  ),
  id: "lens-package-json-path",
});

export default lensPackageJsonPathInjectable;
