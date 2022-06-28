/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { UserStore } from "../../../common/user-store";
import type { TerminalShellEnvModify } from "../shell-env-modifier/terminal-shell-env-modify.injectable";
import type { ShellSessionArgs } from "../shell-session";
import { ShellSession } from "../shell-session";

export interface LocalShellSessionDependencies {
  terminalShellEnvModify: TerminalShellEnvModify;
  readonly baseBundeledBinariesDirectory: string;
}

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected readonly dependencies: LocalShellSessionDependencies, args: ShellSessionArgs) {
    super(args);
  }

  protected getPathEntries(): string[] {
    return [this.dependencies.baseBundeledBinariesDirectory];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    let env = await this.getCachedShellEnv();

    // extensions can modify the env
    env = this.dependencies.terminalShellEnvModify(this.cluster.id, env);

    const shell = env.PTYSHELL;

    if (!shell) {
      throw new Error("PTYSHELL is not defined with the environment");
    }

    const args = await this.getShellArgs(shell);

    await this.openShellProcess(shell, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = UserStore.getInstance().kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = UserStore.getInstance().downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${kubectlPathDir};${this.dependencies.baseBundeledBinariesDirectory};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${kubectlPathDir}:${this.dependencies.baseBundeledBinariesDirectory}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}
