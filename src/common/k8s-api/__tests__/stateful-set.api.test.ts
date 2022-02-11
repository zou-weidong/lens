/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { StatefulSetApi } from "../endpoints/stateful-set.api";
import type { JsonApiHandler } from "../json-api";
import type { KubeJsonApiData } from "../kube-json-api";

describe("StatefulSetApi", () => {
  let request: jest.Mocked<JsonApiHandler<KubeJsonApiData>>;
  let api: StatefulSetApi;

  beforeEach(() => {
    request = {
      del: jest.fn(),
      get: jest.fn(),
      getResponse: jest.fn(),
      patch: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      config: {
        apiBase: "foo/bar/bat",
        serverAddress: "localhost",
      },
    };
    api = new StatefulSetApi({
      request,
    });
  });

  describe("scale", () => {
    it("requests Kubernetes API with PATCH verb and correct amount of replicas", () => {
      api.scale({ namespace: "default", name: "statefulset-1" }, 5);

      expect(request.patch).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale", {
        data: {
          spec: {
            replicas: 5,
          },
        },
      },
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      });
    });
  });
});
