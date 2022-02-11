/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import { hasCorrectExtension } from "./has-correct-extension";
import readFileInjectable from "../../../../common/fs/read-file.injectable";
import readDirInjectable from "../../../../common/fs/read-dir.injectable";
import type { RawTemplates } from "./create-resource-templates.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import { computed, observable } from "mobx";
import resourcesPathInjectable from "../../../../common/vars/resources-path.injectable";

const lensCreateResourceTemplatesInjectable = getInjectable({
  instantiate: (di) => {
    const readDir = di.inject(readDirInjectable);
    const readFile = di.inject(readFileInjectable);
    const errorNotificiation = di.inject(errorNotificationInjectable);
    const templates = observable.array<[file: string, contents: string]>();
    const templatesFolder = path.resolve(di.inject(resourcesPathInjectable), "templates", "create-resource");

    (async () => {
      try {
        for (const dirEntry of await readDir(templatesFolder)) {
          if (hasCorrectExtension(dirEntry)) {
            templates.push([path.parse(dirEntry).name, await readFile(path.join(templatesFolder, dirEntry), "utf-8")]);
          }
        }
      } catch (error) {
        errorNotificiation(
          <p>
            Failed to load bundled create resource templates:
            <p>{String(error)}</p>
          </p>,
        );
      }
    })();

    return computed(() => ["lens", [...templates]] as RawTemplates);
  },
  id: "lens-create-resource-templates",
});

export default lensCreateResourceTemplatesInjectable;
