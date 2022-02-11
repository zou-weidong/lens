/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensApiRequest, LensApiResult, Route } from "../router/router";
import type { SupportedFileExtension } from "../router/router-content-types";
import { contentTypes } from "../router/router-content-types";
import { routeInjectionToken } from "../router/router.injectable";
import path from "path";
import type { ReadFile } from "../../common/fs/read-file.injectable";
import readFileInjectable from "../../common/fs/read-file.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";
import type { LensLogger } from "../../common/logger";
import appNameInjectable from "../../common/vars/app-name.injectable";
import directoryForStaticFilesInjectable from "../../common/vars/directory-for-static-files.injectable";
import routerLoggerInjectable from "../router/logger.injectable";

interface ProductionDependencies {
  readFile: ReadFile;
  logger: LensLogger;
  rootPath: string;
  appName: string;
}

const handleStaticFileInProduction = ({
  readFile,
  logger,
  rootPath,
  appName,
}: ProductionDependencies) => (
  async ({ params }: LensApiRequest): Promise<LensApiResult<Buffer>> => {
    let filePath = params.path;

    for (let retryCount = 0; retryCount < 5; retryCount += 1) {
      const asset = path.join(rootPath, filePath);
      const normalizedFilePath = path.resolve(asset);

      if (!normalizedFilePath.startsWith(rootPath)) {
        return { statusCode: 404 };
      }

      try {
        const fileExtension = path
          .extname(asset)
          .slice(1) as SupportedFileExtension;

        const contentType = contentTypes[fileExtension] || contentTypes.txt;

        return { response: await readFile(asset), contentType };
      } catch (err) {
        if (retryCount > 5) {
          logger.error("handleStaticFile:", err.toString());

          return { statusCode: 404 };
        }

        filePath = `build/${appName}.html`;
      }
    }

    return { statusCode: 404 };
  }
);

interface DevelopmentDependencies {
  proxy: httpProxy;
  appName: string;
}

const handleStaticFileInDevelopment = ({
  proxy,
  appName,
}: DevelopmentDependencies) => (
  (apiReq: LensApiRequest): LensApiResult<Buffer> => {
    const { req, res } = apiReq.raw;

    if (req.url === "/" || !req.url.startsWith("/build/")) {
      req.url = `build/${appName}.html`;
    }

    proxy.web(req, res, {
      target: "http://127.0.0.1:8080",
    });

    return {
      proxy: true,
    };
  }
);

const staticFileRouteInjectable = getInjectable({
  id: "static-file-route",

  instantiate: (di): Route<Buffer> => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const appName = di.inject(appNameInjectable);

    return {
      method: "get",
      path: `/{path*}`,
      handler: isDevelopment
        ? handleStaticFileInDevelopment({
          proxy: httpProxy.createProxy(),
          appName,
        })
        : handleStaticFileInProduction({
          readFile: di.inject(readFileInjectable),
          appName,
          rootPath: di.inject(directoryForStaticFilesInjectable),
          logger: di.inject(routerLoggerInjectable),
        }),
    };
  },

  injectionToken: routeInjectionToken,
});

export default staticFileRouteInjectable;
