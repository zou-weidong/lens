/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shellEnv } from "../utils";
import type { LensLogger } from "../../common/logger";
import shellEnvSyncLoggerInjectable from "./logger.injectable";
import { userInfo } from "os";
import type { App } from "electron";
import electronAppInjectable from "../electron/app.injectable";
import isSnapInjectable from "../../common/vars/is-snap.injectable";

export type ShellEnvSyncer = () => Promise<void>;

interface Dependencies {
  logger: LensLogger;
  app: App;
  isSnap: boolean;
}

const shellEnvSyncer = ({
  logger,
  app,
  isSnap,
}: Dependencies): ShellEnvSyncer => (
  async () => {
    const env = await shellEnv(userInfo().shell);

    if (!env.LANG) {
    // the LANG env var expects an underscore instead of electron's dash
      env.LANG = `${app.getLocale().replace("-", "_")}.UTF-8`;
    } else if (!env.LANG.endsWith(".UTF-8")) {
      env.LANG += ".UTF-8";
    }

    if (!isSnap) {
      process.env.PATH = env.PATH;
    }

    // The spread operator allows joining of objects. The precedence is last to first.
    process.env = {
      ...env,
      ...process.env,
    };

    logger.debug(`[SHELL-SYNC]: Synced shell env, and updating`, {
      syncedEnv: env,
      currentEnv: process.env,
    });
  }
);

const shellEnvSyncerInjectable = getInjectable({
  instantiate: (di) => shellEnvSyncer({
    logger: di.inject(shellEnvSyncLoggerInjectable),
    app: di.inject(electronAppInjectable),
    isSnap: di.inject(isSnapInjectable),
  }),
  id: "shell-env-syncer",
});

export default shellEnvSyncerInjectable;
