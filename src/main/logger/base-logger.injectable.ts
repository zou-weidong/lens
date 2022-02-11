/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { baseLoggerInjectionToken } from "../../common/logger/base-logger.token";
import winston, { format } from "winston";
import { consoleFormat } from "winston-console-format";
import appPathsInjectable from "../electron/app-paths.injectable";
import type { LensLogger } from "../../common/logger";
import isTestEnvInjectable from "../../common/vars/is-test-env.injectable";

const isDebuggingGlobal = /^(true|1|yes|y|on)$/i;

const baseLoggerInjectable = getInjectable({
  instantiate: (di) => {
    const appPaths = di.inject(appPathsInjectable);
    const isTestEnv = di.inject(isTestEnvInjectable);
    const logLevel = process.env.LOG_LEVEL ?? (
      isDebuggingGlobal.exec(process.env.DEBUG ?? "")
        ? "debug"
        : isTestEnv
          ? "error"
          : "info"
    );

    return winston.createLogger({
      format: format.simple(),
      transports: [
        new winston.transports.Console({
          handleExceptions: false,
          level: logLevel,
          format: format.combine(
            format.colorize({ level: true, message: false }),
            format.padLevels(),
            format.ms(),
            consoleFormat({
              showMeta: true,
              inspectOptions: {
                depth: 4,
                colors: true,
                maxArrayLength: 10,
                breakLength: 120,
                compact: Infinity,
              },
            }),
          ),
        }),
        new winston.transports.File({
          handleExceptions: false,
          level: logLevel,
          filename: "lens.log",
          dirname: appPaths["logs"],
          maxsize: 16 * 1024,
          maxFiles: 16,
          tailable: true,
        }),
      ],
    }) as LensLogger;
  },
  injectionToken: baseLoggerInjectionToken,
  id: "base-logger",
});

export default baseLoggerInjectable;
