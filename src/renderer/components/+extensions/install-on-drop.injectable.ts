/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import extensionsPageLoggerInjectable from "./logger.injectable";
import type { LensLogger } from "../../../common/logger";

export type InstallOnDrop = (files: File[]) => Promise<void>;

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>;
  logger: LensLogger;
}

const installOnDrop = ({
  attemptInstalls,
  logger,
}: Dependencies): InstallOnDrop => (
  async (files: File[]) => {
    logger.info("Install from D&D");
    await attemptInstalls(files.map(({ path }) => path));
  }
);

const installOnDropInjectable = getInjectable({
  instantiate: (di) => installOnDrop({
    attemptInstalls: di.inject(attemptInstallsInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
  }),
  id: "install-on-drop",
});

export default installOnDropInjectable;
