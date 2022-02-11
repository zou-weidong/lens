/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import logger from "../../../logger";
import { getPortFrom } from "../../../utils";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import * as tcpPortUsed from "tcp-port-used";

const internalPortRegex = /^forwarding from (?<address>.+) ->/i;

export interface PortForwardArgs {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
}

export interface PortForwardDependencies {
  getKubectlBinPath: (bundled: boolean) => Promise<string>;
}

export class PortForward {
  public static portForwards: PortForward[] = [];

  static getPortforward(forward: PortForwardArgs) {
    return PortForward.portForwards.find((pf) => (
      pf.clusterId == forward.clusterId &&
      pf.kind == forward.kind &&
      pf.name == forward.name &&
      pf.namespace == forward.namespace &&
      pf.port == forward.port
    ));
  }

  public process?: ChildProcessWithoutNullStreams;
  public readonly clusterId: string;
  public readonly kind: string;
  public readonly namespace: string;
  public readonly name: string;
  public readonly port: number;
  public forwardPort: number;

  constructor(private dependencies: PortForwardDependencies, public readonly pathToKubeConfig: string, args: PortForwardArgs) {
    this.clusterId = args.clusterId;
    this.kind = args.kind;
    this.namespace = args.namespace;
    this.name = args.name;
    this.port = args.port;
    this.forwardPort = args.forwardPort;
  }

  public async start() {
    const kubectlBin = await this.dependencies.getKubectlBinPath(true);
    const args = [
      "--kubeconfig", this.pathToKubeConfig,
      "port-forward",
      "-n", this.namespace,
      `${this.kind}/${this.name}`,
      `${this.forwardPort ?? ""}:${this.port}`,
    ];

    this.process = spawn(kubectlBin, args, {
      env: process.env,
    });
    PortForward.portForwards.push(this);
    this.process.on("exit", () => {
      const index = PortForward.portForwards.indexOf(this);

      if (index > -1) {
        PortForward.portForwards.splice(index, 1);
      }
    });

    this.process.stderr.on("data", (data) => {
      logger.debug(`[PORT-FORWARD-ROUTE]: kubectl port-forward process stderr: ${data}`);
    });

    const internalPort = await getPortFrom(this.process.stdout, {
      lineRegex: internalPortRegex,
    });

    try {
      await tcpPortUsed.waitUntilUsed(internalPort, 500, 15000);

      // make sure this.forwardPort is set to the actual port used (if it was 0 then an available port is found by 'kubectl port-forward')
      this.forwardPort = internalPort;

      return true;
    } catch (error) {
      this.process.kill();

      return false;
    }
  }

  public async stop() {
    this.process.kill();
  }
}
