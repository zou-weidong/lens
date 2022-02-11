/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/clusters/cluster";
import type { Kubectl } from "../kubectl/kubectl";
import type WebSocket from "ws";
import { shellEnv, clearKubeconfigEnvVars } from "../utils";
import path from "path";
import os from "os";
import type { TerminalMessage } from "../../renderer/api/terminal-api";
import { TerminalChannels } from "../../renderer/api/terminal-api";
import { deserialize, serialize } from "v8";
import type { AppEventBus } from "../../common/app-event-bus/event-bus";
import type { LensLogger } from "../../common/logger";
import type { EnsureShellProcess } from "./ensure-process.injectable";
import type { Stat } from "../../common/fs/stat.injectable";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import type { TerminalShell } from "../../common/user-preferences/terminal-shell.injectable";

export class ShellOpenError extends Error {
  constructor(message: string, public cause: Error) {
    super(`${message}: ${cause}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export enum WebSocketCloseEvent {
  /**
   * The connection successfully completed the purpose for which it was created.
   */
  NormalClosure = 1000,
  /**
   * The endpoint is going away, either because of a server failure or because
   * the browser is navigating away from the page that opened the connection.
   */
  GoingAway = 1001,
  /**
   * The endpoint is terminating the connection due to a protocol error.
   */
  ProtocolError = 1002,
  /**
   * The connection is being terminated because the endpoint received data of a
   * type it cannot accept. (For example, a text-only endpoint received binary
   * data.)
   */
  UnsupportedData = 1003,
  /**
   * Indicates that no status code was provided even though one was expected.
   */
  NoStatusReceived = 1005,
  /**
   * Indicates that a connection was closed abnormally (that is, with no close
   * frame being sent) when a status code is expected.
   */
  AbnormalClosure = 1006,
  /**
   *  The endpoint is terminating the connection because a message was received
   * that contained inconsistent data (e.g., non-UTF-8 data within a text message).
   */
  InvalidFramePayloadData = 1007,
  /**
   * The endpoint is terminating the connection because it received a message
   * that violates its policy. This is a generic status code, used when codes
   * 1003 and 1009 are not suitable.
   */
  PolicyViolation = 1008,
  /**
   * The endpoint is terminating the connection because a data frame was
   * received that is too large.
   */
  MessageTooBig = 1009,
  /**
   * The client is terminating the connection because it expected the server to
   * negotiate one or more extension, but the server didn't.
   */
  MissingExtension = 1010,
  /**
   * The server is terminating the connection because it encountered an
   * unexpected condition that prevented it from fulfilling the request.
   */
  InternalError = 1011,
  /**
   * The server is terminating the connection because it is restarting.
   */
  ServiceRestart = 1012,
  /**
   * The server is terminating the connection due to a temporary condition,
   * e.g. it is overloaded and is casting off some of its clients.
   */
  TryAgainLater = 1013,
  /**
   * The server was acting as a gateway or proxy and received an invalid
   * response from the upstream server. This is similar to 502 HTTP Status Code.
   */
  BadGateway = 1014,
  /**
   * Indicates that the connection was closed due to a failure to perform a TLS
   * handshake (e.g., the server certificate can't be verified).
   */
  TlsHandshake = 1015,
}

export interface ShellSessionArgs {
  kubectl: Kubectl;
  websocket: WebSocket;
  cluster: Cluster;
  terminalId: string;
}

export interface ShellSessionDependencies {
  readonly appEventBus: AppEventBus;
  readonly shell: TerminalShell;
  readonly logger: LensLogger;
  ensureShellProcess: EnsureShellProcess;
  stat: Stat;
  readonly appName: string;
  readonly appVersion: string;
  readonly isMac: boolean;
  readonly isWindows: boolean;
}

export interface ShellSessionEvents {
  exit: () => void;
}

export abstract class ShellSession {
  abstract readonly ShellType: string;

  private static readonly shellEnvs = new Map<string, Record<string, string>>();
  protected readonly kubectl: Kubectl;
  protected readonly websocket: WebSocket;
  protected readonly cluster: Cluster;

  protected running = false;
  protected readonly kubectlBinDirP: Promise<string>;
  protected readonly kubeconfigPathP: Promise<string>;
  protected readonly terminalId: string;

  protected abstract get cwd(): string | undefined;
  protected readonly emitter = new EventEmitter() as TypedEventEmitter<ShellSessionEvents>;

  constructor(protected readonly dependencies: ShellSessionDependencies, { kubectl, websocket, cluster, terminalId }: ShellSessionArgs) {
    this.kubectl = kubectl;
    this.websocket = websocket;
    this.cluster = cluster;
    this.kubeconfigPathP = this.cluster.getProxyKubeconfigPath();
    this.kubectlBinDirP = this.kubectl.binDir();
    this.terminalId = `${cluster.id}:${terminalId}`;
  }

  protected send(message: TerminalMessage): void {
    this.websocket.send(serialize(message));
  }

  protected async getCwd(env: Record<string, string>): Promise<string> {
    const cwdOptions = [this.cwd];

    if (this.dependencies.isWindows) {
      cwdOptions.push(
        env.USERPROFILE,
        os.homedir(),
        "C:\\",
      );
    } else {
      cwdOptions.push(
        env.HOME,
        os.homedir(),
      );

      if (this.dependencies.isMac) {
        cwdOptions.push("/Users");
      } else {
        cwdOptions.push("/home");
      }
    }

    for (const potentialCwd of cwdOptions) {
      if (!potentialCwd) {
        continue;
      }

      try {
        const stats = await this.dependencies.stat(potentialCwd);

        if (stats.isDirectory()) {
          return potentialCwd;
        }
      } catch {
        // ignore error
      }
    }

    return "."; // Always valid
  }

  protected async openShellProcess(shell: string, args: string[], env: Record<string, string>) {
    const cwd = await this.getCwd(env);
    const { process, resume, kill } = this.dependencies.ensureShellProcess({
      shell,
      args,
      env,
      cwd,
      terminalId: this.terminalId,
    });

    if (resume) {
      this.send({ type: TerminalChannels.CONNECTED });
    }

    this.running = true;
    process.onData(data => this.send({ type: TerminalChannels.STDOUT, data }));
    process.onExit(({ exitCode }) => {
      this.dependencies.logger.info(`shell has exited for ${this.terminalId} closed with exitcode=${exitCode}`);

      // This might already be false because of the kill() within the websocket.on("close") handler
      if (this.running) {
        this.running = false;

        if (exitCode > 0) {
          this.send({ type: TerminalChannels.STDOUT, data: "Terminal will auto-close in 15 seconds ..." });
          setTimeout(() => this.exit(), 15 * 1000);
        } else {
          this.exit();
        }
      }
    });

    this.websocket
      .on("message", (data: string | Uint8Array) => {
        if (!this.running) {
          return this.dependencies.logger.debug(`received message from ${this.terminalId}, but shellProcess isn't running`);
        }

        if (typeof data === "string") {
          return this.dependencies.logger.debug(`Received message from ${this.terminalId}`, { data });
        }

        try {
          const message: TerminalMessage = deserialize(data);

          switch (message.type) {
            case TerminalChannels.STDIN:
              process.write(message.data);
              break;
            case TerminalChannels.RESIZE:
              process.resize(message.data.width, message.data.height);
              break;
            default:
              this.dependencies.logger.warn(`unknown or unhandleable message type for ${this.terminalId}`, message);
              break;
          }
        } catch (error) {
          this.dependencies.logger.error(`failed to handle message for ${this.terminalId}`, error);
        }
      })
      .on("close", code => {
        this.dependencies.logger.info(`websocket for ${this.terminalId} closed with code=${WebSocketCloseEvent[code]}(${code})`, { cluster: this.cluster.getMeta() });

        const stopShellSession = this.running
          && (
            (
              code !== WebSocketCloseEvent.AbnormalClosure
              && code !== WebSocketCloseEvent.GoingAway
            )
            || this.cluster.disconnected
          );

        if (stopShellSession) {
          this.running = false;

          try {
            this.dependencies.logger.info(`Killing shell process (pid=${process.pid}) for ${this.terminalId}`);
            kill();
          } catch (error) {
            this.dependencies.logger.warn(`failed to kill shell process (pid=${process.pid}) for ${this.terminalId}`, error);
          }
        }
      });

    this.dependencies.appEventBus.emit({ name: this.ShellType, action: "open" });
  }

  protected getPathEntries(): string[] {
    return [];
  }

  protected async getCachedShellEnv() {
    const { id: clusterId } = this.cluster;

    let env = ShellSession.shellEnvs.get(clusterId);

    if (!env) {
      env = await this.getShellEnv();
      ShellSession.shellEnvs.set(clusterId, env);
    } else {
      // refresh env in the background
      this.getShellEnv().then((shellEnv: any) => {
        ShellSession.shellEnvs.set(clusterId, shellEnv);
      });
    }

    return env;
  }

  protected async getShellEnv() {
    const env = clearKubeconfigEnvVars(JSON.parse(JSON.stringify(await shellEnv())));
    const pathStr = [...this.getPathEntries(), await this.kubectlBinDirP, process.env.PATH].join(path.delimiter);
    const shell = this.dependencies.shell.resolvedValue;

    delete env.DEBUG; // don't pass DEBUG into shells

    if (this.dependencies.isWindows) {
      env.SystemRoot = process.env.SystemRoot;
      env.PTYSHELL = shell || "powershell.exe";
      env.PATH = pathStr;
      env.LENS_SESSION = "true";
      env.WSLENV = [
        process.env.WSLENV,
        "KUBECONFIG/up:LENS_SESSION/u",
      ]
        .filter(Boolean)
        .join(":");
    } else if (shell !== undefined) {
      env.PTYSHELL = shell;
      env.PATH = pathStr;
    } else {
      env.PTYSHELL = ""; // blank runs the system default shell
    }

    if (path.basename(env.PTYSHELL) === "zsh") {
      env.OLD_ZDOTDIR = env.ZDOTDIR || env.HOME;
      env.ZDOTDIR = await this.kubectlBinDirP;
      env.DISABLE_AUTO_UPDATE = "true";
    }

    env.PTYPID = process.pid.toString();
    env.KUBECONFIG = await this.kubeconfigPathP;
    env.TERM_PROGRAM = this.dependencies.appName;
    env.TERM_PROGRAM_VERSION = this.dependencies.appVersion;

    if (this.cluster.preferences.httpsProxy) {
      env.HTTPS_PROXY = this.cluster.preferences.httpsProxy;
    }

    env.NO_PROXY = [
      "localhost",
      "127.0.0.1",
      env.NO_PROXY,
    ]
      .filter(Boolean)
      .join();

    return env;
  }

  protected exit(code = WebSocketCloseEvent.NormalClosure) {
    this.emitter.emit("exit");

    if (this.websocket.readyState == this.websocket.OPEN) {
      this.websocket.close(code);
    }
  }
}
