/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";
import { spawn } from "node-pty";
import type { LensLogger } from "../../common/logger";
import { getOrInsertWith } from "../../common/utils";
import localShellSessionLoggerInjectable from "./local/logger.injectable";
import shellSessionProcessesInjectable from "./processes.injectable";

export interface EnsuredShellProcess {
  process: IPty;
  resume: boolean;
  kill: () => void;
}

export interface EnsureShellProcessArgs {
  terminalId: string;
  shell: string;
  args: string[];
  env: Record<string, string>;
  cwd: string;
}

export type EnsureShellProcess = (args: EnsureShellProcessArgs) => EnsuredShellProcess;

interface Dependencies {
  logger: LensLogger;
  processes: Map<string, IPty>;
}

const ensureShellProcess = ({ logger, processes }: Dependencies): EnsureShellProcess => (
  ({ terminalId, shell, args, env, cwd }) => {
    const resume = processes.has(terminalId);
    const process = getOrInsertWith(processes, terminalId, () => (
      spawn(shell, args, {
        rows: 30,
        cols: 80,
        cwd,
        env,
        name: "xterm-256color",
        // TODO: Something else is broken here so we need to force the use of winPty on windows
        useConpty: false,
      })
    ));

    logger.info(`PTY for ${terminalId} is ${resume ? "resumed" : "started"} with PID=${process.pid}`);

    return {
      process,
      resume,
      kill: () => {
        process.kill();
        processes.delete(terminalId);
      },
    };
  }
);

const ensureShellProcessInjectable = getInjectable({
  instantiate: (di) => ensureShellProcess({
    processes: di.inject(shellSessionProcessesInjectable),
    logger: di.inject(localShellSessionLoggerInjectable),
  }),
  id: "ensure-shell-process",
});

export default ensureShellProcessInjectable;
