/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import attemptInstallByInfoInjectable from "./attempt-install-by-info.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import extensionsPageLoggerInjectable from "./logger.injectable";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";
import type { ExtendableDisposer } from "../../../common/utils";
import { InputValidators } from "../input";
import { getMessageFromError } from "./get-message-from-error";
import path from "path";
import type { ReadFileNotify } from "./read-file-notify.injectable";
import type { AttemptInstallByInfo } from "./attempt-install-by-info.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { LensLogger } from "../../../common/logger";
import type { AttemptInstall } from "./attempt-install/attempt-install.injectable";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import readFileNotifyInjectable from "./read-file-notify.injectable";
import type { Fetch } from "../../../common/utils/fetch.injectable";
import fetchInjectable from "../../../common/utils/fetch.injectable";

export type InstallFromInput = (input: string) => Promise<void>;

interface Dependencies {
  attemptInstall: AttemptInstall;
  attemptInstallByInfo: AttemptInstallByInfo;
  installationStateManager: ExtensionInstallationStateManager;
  errorNotification: ErrorNotification;
  logger: LensLogger;
  readFileNotify: ReadFileNotify;
  fetch: Fetch;
}

const installFromInput = ({
  attemptInstall,
  attemptInstallByInfo,
  installationStateManager,
  errorNotification,
  logger,
  readFileNotify,
  fetch,
}: Dependencies): InstallFromInput => (
  async (input) => {
    let disposer: ExtendableDisposer | undefined = undefined;

    try {
    // fixme: improve error messages for non-tar-file URLs
      if (InputValidators.isUrl.validate(input)) {
      // install via url
        disposer = installationStateManager.startPreInstall();
        const res = await fetch(input, {
          timeout: 10 * 60 * 1000, // 10min
        });
        const fileName = path.basename(input);

        await attemptInstall({ fileName, dataP: res.json() }, disposer);
      } else if (InputValidators.isPath.validate(input)) {
      // install from system path
        const fileName = path.basename(input);

        await attemptInstall({ fileName, dataP: readFileNotify(input) });
      } else if (InputValidators.isExtensionNameInstall.validate(input)) {
        const [{ groups: { name, version }}] = [...input.matchAll(InputValidators.isExtensionNameInstallRegex)];

        await attemptInstallByInfo({ name, version });
      }
    } catch (error) {
      const message = getMessageFromError(error);

      logger.info(`[EXTENSION-INSTALL]: installation has failed: ${message}`, { error, installPath: input });
      errorNotification(<p>Installation has failed: <b>{message}</b></p>);
    } finally {
      disposer?.();
    }
  }
);
const installFromInputInjectable = getInjectable({
  instantiate: (di) => installFromInput({
    attemptInstall: di.inject(attemptInstallInjectable),
    attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
    installationStateManager: di.inject(extensionInstallationStateManagerInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
    readFileNotify: di.inject(readFileNotifyInjectable),
    fetch: di.inject(fetchInjectable),
  }),
  id: "install-from-input",
});

export default installFromInputInjectable;
