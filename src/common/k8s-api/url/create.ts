/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IKubeApiLinkRef } from "./parse.injectable";

export default function createKubeApiURL({ apiPrefix = "/apis", resource, apiVersion, name, namespace }: IKubeApiLinkRef): string {
  const parts = [apiPrefix, apiVersion];

  if (namespace) {
    parts.push("namespaces", namespace);
  }

  parts.push(resource);

  if (name) {
    parts.push(name);
  }

  return parts.join("/");
}
