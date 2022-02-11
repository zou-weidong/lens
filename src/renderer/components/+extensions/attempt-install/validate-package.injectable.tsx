/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { listTarEntries, readFileFromTar } from "../../../../common/utils";
import path from "path";
import { getInjectable } from "@ogre-tools/injectable";
import manifestFilenameInjectable from "../../../../common/vars/manifest-filename.injectable";
import type { LensExtensionManifest } from "../../../../common/extensions/manifest";
import type { ValidateManifestFile } from "../../../../main/extensions/discovery/validate-manifest-file.injectable";
import validateManifestFileInjectable from "../../../../main/extensions/discovery/validate-manifest-file.injectable";

export type ValidatePackage = (filePath: string) => Promise<LensExtensionManifest>;

interface Dependencies {
  manifestFilename: string;
  validateManifestFile: ValidateManifestFile;
}

const validatePackage = ({
  manifestFilename,
  validateManifestFile,
}: Dependencies): ValidatePackage => (
  async (filePath) => {
    const tarFiles = await listTarEntries(filePath);

    // tarball from npm contains single root folder "package/*"
    const firstFile = tarFiles[0];

    if (!firstFile) {
      throw new Error(`invalid extension bundle,  ${manifestFilename} not found`);
    }

    const rootFolder = path.normalize(firstFile).split(path.sep)[0];
    const packedInRootFolder = tarFiles.every(entry =>
      entry.startsWith(rootFolder),
    );
    const manifestLocation = packedInRootFolder
      ? path.join(rootFolder, manifestFilename)
      : manifestFilename;

    if (!tarFiles.includes(manifestLocation)) {
      throw new Error(`invalid extension bundle, ${manifestFilename} not found`);
    }

    const data = await readFileFromTar({
      tarPath: filePath,
      filePath: manifestLocation,
      parseJson: true,
    });

    try {
      return validateManifestFile(data);
    } catch (error) {
      throw new Error(`${manifestFilename} is invalid: ${error}`);
    }
  }
);

const validatePackageInjectable = getInjectable({
  instantiate: (di) => validatePackage({
    manifestFilename: di.inject(manifestFilenameInjectable),
    validateManifestFile: di.inject(validateManifestFileInjectable),
  }),
  id: "validate-package",
});

export default validatePackageInjectable;
