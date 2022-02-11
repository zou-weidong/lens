/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stat } from "../../../../common/fs/stat.injectable";
import statInjectable from "../../../../common/fs/stat.injectable";
import type { LensLogger } from "../../../../common/logger";
import type { KubeconfigSyncEntry, KubeconfigSyncValue } from "../../../../common/user-preferences";
import kubeconfigSyncsPreferencesLoggerInjectable from "./logger.injectable";

export interface KubeconfigSyncInfo {
  type: "file" | "folder" | "unknown";
}

export interface KubeconfigSyncParsedValue {
  data: KubeconfigSyncValue;
  info: KubeconfigSyncInfo;
}

export type GetMapEntry = (entry: KubeconfigSyncEntry) => Promise<[string, KubeconfigSyncParsedValue]>;

interface Dependencies {
  logger: LensLogger;
  stat: Stat;
}

const getMapEntry = ({
  logger,
  stat,
}: Dependencies): GetMapEntry => (
  async ({ filePath, ...data }) => {
    try {
      // stat follows the stat(2) linux syscall spec, namely it follows symlinks
      const stats = await stat(filePath);

      if (stats.isFile()) {
        return [filePath, { info: { type: "file" }, data }];
      }

      if (stats.isDirectory()) {
        return [filePath, { info: { type: "folder" }, data }];
      }

      logger.warn("[KubeconfigSyncs]: unknown stat entry", { stats });

      return [filePath, { info: { type: "unknown" }, data }];
    } catch (error) {
      logger.warn(`[KubeconfigSyncs]: failed to stat entry: ${error}`, { error });

      return [filePath, { info: { type: "unknown" }, data }];
    }
  }
);

const getMapEntryInjectable = getInjectable({
  instantiate: (di) => getMapEntry({
    logger: di.inject(kubeconfigSyncsPreferencesLoggerInjectable),
    stat: di.inject(statInjectable),
  }),
  id: "get-map-entry",
});

export default getMapEntryInjectable;
