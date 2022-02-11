/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import path from "path";
import type { AttemptInstall } from "./attempt-install/attempt-install.injectable";
import type { ReadFileNotify } from "./read-file-notify.injectable";
import readFileNotifyInjectable from "./read-file-notify.injectable";

export type AttemptInstalls = (filePaths: string[]) => Promise<void>;

interface Dependencies {
  attemptInstall: AttemptInstall;
  readFileNotify: ReadFileNotify;
}

const attemptInstalls = ({
  attemptInstall,
  readFileNotify,
}: Dependencies): AttemptInstalls => (
  async (filePaths) => {
    const promises: Promise<void>[] = [];

    for (const filePath of filePaths) {
      promises.push(
        attemptInstall({
          fileName: path.basename(filePath),
          dataP: readFileNotify(filePath),
        }),
      );
    }

    await Promise.allSettled(promises);
  }
);

const attemptInstallsInjectable = getInjectable({
  instantiate: (di) => attemptInstalls({
    attemptInstall: di.inject(attemptInstallInjectable),
    readFileNotify: di.inject(readFileNotifyInjectable),
  }),
  id: "attempt-installs",
});

export default attemptInstallsInjectable;
