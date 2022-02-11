/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseInjectionToken } from "../api-base.token";
import type { ResourceApplierApi } from "./resource-applier.api";
import yaml from "js-yaml";
import type { KubeJsonApiData } from "../kube-json-api";
import type { Patch } from "rfc6902";

const resourceApplierApiInjectable = getInjectable({
  id: "resource-applier-api",
  instantiate: (di): ResourceApplierApi => {
    const apiBase = di.inject(apiBaseInjectionToken);

    return {
      annotations: [
        "kubectl.kubernetes.io/last-applied-configuration",
      ],
      async update(resource: object | string): Promise<KubeJsonApiData> {
        if (typeof resource === "string") {
          const parsed = yaml.load(resource);

          if (typeof parsed !== "object") {
            throw new Error("Cannot update resource to string or number");
          }

          resource = parsed;
        }

        return apiBase.post("/stack", { data: resource });
      },
      async patch(name: string, kind: string, ns: string, patch: Patch): Promise<KubeJsonApiData> {
        return apiBase.patch("/stack", {
          data: {
            name,
            kind,
            ns,
            patch,
          },
        });
      },
    };
  },
});

export default resourceApplierApiInjectable;
