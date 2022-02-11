/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import fse from "fs-extra";
import { getMessageFromError } from "./get-message-from-error";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { LensLogger } from "../../../common/logger";
import { getInjectable } from "@ogre-tools/injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import extensionsPageLoggerInjectable from "./logger.injectable";

export type ReadFileNotify = (filePath: string, showError?: boolean) => Promise<Buffer | null>;

interface Dependencies {
  errorNotification: ErrorNotification;
  logger: LensLogger;
}

const readFileNotify = ({
  errorNotification,
  logger,
}: Dependencies): ReadFileNotify => (
  async (filePath, showError = true) => {
    try {
      return await fse.readFile(filePath);
    } catch (error) {
      if (showError) {
        const message = getMessageFromError(error);

        logger.info(`preloading ${filePath} has failed: ${message}`, { error });
        errorNotification(`Error while reading "${filePath}": ${message}`);
      }
    }

    return null;
  }
);

const readFileNotifyInjectable = getInjectable({
  instantiate: (di) => readFileNotify({
    errorNotification: di.inject(errorNotificationInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
  }),
  id: "read-file-notify",
});

export default readFileNotifyInjectable;

