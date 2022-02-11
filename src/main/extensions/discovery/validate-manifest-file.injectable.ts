/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonValue, PackageJson } from "type-fest";
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";
import { SemVer } from "semver";
import type { LensExtensionManifest, RawLensExtensionManifest } from "../../../common/extensions/manifest";

export type ValidateManifestFile = (val: JsonValue) => LensExtensionManifest;

const semVerValidator: Joi.CustomValidator<any> = (val) => {
  try {
    return new SemVer(val);
  } catch (error) {
    return new Joi.ValidationError("Version is not a valid semver version", error, val);
  }
};

const authorValidator = Joi.alternatives(
  Joi.string(),
  Joi.object<PackageJson.Person>({
    email: Joi.string()
      .optional(),
    name: Joi.string()
      .optional(),
    url: Joi.string()
      .optional(),
  }).unknown(true),
);

const depsValidator = Joi.object()
  .pattern(Joi.string(), Joi.string())
  .optional();

const manifestValidator = Joi.object<LensExtensionManifest, RawLensExtensionManifest>({
  name: Joi.string()
    .required(),
  description: Joi.string()
    .required(),
  publisher: Joi.string()
    .optional(),
  license: Joi.string()
    .optional(),
  main: Joi.string(),
  renderer: Joi.string(),
  author: authorValidator,
  version: Joi.string()
    .required()
    .custom(semVerValidator, "semantic version"),
  engines: Joi.object({
    lens: Joi.string()
      .required(),
  }),
  dependencies: depsValidator,
  devDependencies: depsValidator,
})
  .unknown(true)
  .or("main", "renderer"); // Require that at least one of these fields are present

const validateManifestFileInjectable = getInjectable({
  instantiate: (): ValidateManifestFile => (val) => {
    const res = manifestValidator.validate(val);

    if (res.error) {
      throw res.error;
    }

    return res.value;
  },
  id: "validate-manifest-file",
});

export default validateManifestFileInjectable;

