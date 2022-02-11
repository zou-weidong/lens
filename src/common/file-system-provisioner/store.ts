/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { randomBytes } from "crypto";
import { SHA256 } from "crypto-js";
import fse from "fs-extra";
import { action, makeObservable, observable } from "mobx";
import path from "path";
import { BaseStore, BaseStoreDependencies, BaseStoreParams } from "../base-store";
import type { LensExtensionId } from "../extensions/manifest";
import { getOrInsertWith, toJS } from "../utils";

export interface FileSystemProvisionerModel {
  extensions: Record<string, string>; // extension names to paths
}

interface Dependencies extends BaseStoreDependencies {
  readonly directoryForExtensionData: string;
}

export class FileSystemProvisionerStore extends BaseStore<FileSystemProvisionerModel> {
  readonly displayName = "FilesystemProvisionerStore";
  registeredExtensions = observable.map<LensExtensionId, string>();

  constructor(protected readonly dependencies: Dependencies, params: BaseStoreParams<FileSystemProvisionerModel>) {
    super(dependencies, {
      ...params,
      name: "lens-filesystem-provisioner-store",
    });
    makeObservable(this);
  }

  /**
   * This function retrieves the saved path to the folder which the extension
   * can saves files to. If the folder is not present then it is created.
   * @param extensionName the name of the extension requesting the path
   * @returns path to the folder that the extension can safely write files to.
   */
  async requestDirectory(extensionName: string): Promise<string> {
    const dirPath = getOrInsertWith(this.registeredExtensions, extensionName, () => {
      const salt = randomBytes(32).toString("hex");
      const hashedName = SHA256(`${extensionName}/${salt}`).toString();

      return path.resolve(this.dependencies.directoryForExtensionData, hashedName);
    });

    await fse.ensureDir(dirPath);

    return dirPath;
  }

  @action
  protected fromStore({ extensions = {}}: Partial<FileSystemProvisionerModel> = {}): void {
    this.registeredExtensions.replace(extensions);
  }

  toJSON(): FileSystemProvisionerModel {
    return toJS({
      extensions: Object.fromEntries(this.registeredExtensions),
    });
  }
}
