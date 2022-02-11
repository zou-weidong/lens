/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";
import shellSessionProcessesInjectable from "./processes.injectable";

interface Dependencies {
  processes: Map<string, IPty>;
}

const cleanupShellProcesses = ({ processes }: Dependencies) => (
  () => {
    for (const shellProcess of processes.values()) {
      try {
        process.kill(shellProcess.pid);
      } catch {
        // ignore error
      }
    }

    processes.clear();
  }
);

/**
 * Kill all remaining shell backing processes. Should be called when about to
 * quit
 */
const cleanupShellProcessesInjectable = getInjectable({
  instantiate: (di) => cleanupShellProcesses({
    processes: di.inject(shellSessionProcessesInjectable),
  }),
  id: "cleanup-shell-processes",
});

export default cleanupShellProcessesInjectable;
