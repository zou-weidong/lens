/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Parse kube-api path and get api-version, group, etc.

import { array } from "../../utils";
import { inspect } from "util";
import { getInjectable } from "@ogre-tools/injectable";
import kubeApiParseLoggerInjectable from "./parse-logger.injectable";

export interface KubeObjectRef {
  kind: string;
  apiVersion: string;
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  fieldPath?: string;
}

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name?: string;
  namespace?: string;
}

export interface IKubeApiParsed extends IKubeApiLinkRef {
  apiBase: string;
  apiGroup: string;
  apiVersionWithGroup: string;
}

export type ParseKubeApi = (pathname: string) => IKubeApiParsed;

function parseKubeApi(path: string): IKubeApiParsed {
  const apiPath = new URL(path, "http://localhost").pathname;
  const [, prefix, ...parts] = apiPath.split("/");
  const apiPrefix = `/${prefix}`;
  const [left, right, namespaced] = array.split(parts, "namespaces");
  let apiGroup, apiVersion, namespace, resource, name;

  if (namespaced) {
    switch (right.length) {
      case 1:
        name = right[0];
      // fallthrough
      case 0:
        resource = "namespaces"; // special case this due to `split` removing namespaces
        break;
      default:
        [namespace, resource, name] = right;
        break;
    }

    apiVersion = left.pop();
    apiGroup = left.join("/");
  } else {
    switch (left.length) {
      case 0:
        throw new Error(`invalid apiPath: ${apiPath}`);
      case 4:
        [apiGroup, apiVersion, resource, name] = left;
        break;
      case 2:
        resource = left.pop();
        // fallthrough
      case 1:
        apiVersion = left.pop();
        apiGroup = "";
        break;
      default:
      /**
       * Given that
       *  - `apiVersion` is `GROUP/VERSION` and
       *  - `VERSION` is `DNS_LABEL` which is /^[a-z0-9]((-[a-z0-9])|[a-z0-9])*$/i
       *     where length <= 63
       *  - `GROUP` is /^D(\.D)*$/ where D is `DNS_LABEL` and length <= 253
       *
       * There is no well defined selection from an array of items that were
       * separated by '/'
       *
       * Solution is to create a heuristic. Namely:
       * 1. if '.' in left[0] then apiGroup <- left[0]
       * 2. if left[1] matches /^v[0-9]/ then apiGroup, apiVersion <- left[0], left[1]
       * 3. otherwise assume apiVersion <- left[0]
       * 4. always resource, name <- left[(0 or 1)+1..]
       */
        if (left[0].includes(".") || left[1].match(/^v[0-9]/)) {
          [apiGroup, apiVersion] = left;
          resource = left.slice(2).join("/");
        } else {
          apiGroup = "";
          apiVersion = left[0];
          [resource, name] = left.slice(1);
        }
        break;
    }
  }

  const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join("/");
  const apiBase = [apiPrefix, apiGroup, apiVersion, resource].filter(v => v).join("/");

  if (!apiBase) {
    throw new Error(`invalid apiPath: ${apiPath}`);
  }

  return {
    apiBase,
    apiPrefix, apiGroup,
    apiVersion, apiVersionWithGroup,
    namespace, resource, name,
  };
}

const parseKubeApiInjectable = getInjectable({
  id: "parse-kube-api",
  instantiate: (di): ParseKubeApi => {
    const logger = di.inject(kubeApiParseLoggerInjectable);

    return (pathname) => {
      try {
        const res = parseKubeApi(pathname);

        logger.debug(`(${inspect(pathname, false, null, false)}) -> ${inspect(res, false, null, false)}`);

        return res;
      } catch (error) {
        logger.debug(`(${inspect(pathname, false, null, false)}) threw: ${error}`);

        throw error;
      }
    };
  },
});

export default parseKubeApiInjectable;

