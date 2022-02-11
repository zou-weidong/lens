/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { v4 as uuid } from "uuid";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellOpenError, ShellSession } from "../shell-session";
import { get } from "lodash";
import { NodeApi } from "../../../common/k8s-api/endpoints";
import { TerminalChannels } from "../../../renderer/api/terminal-api";
import type { KubeJsonApiForCluster } from "../../../common/k8s-api/kube-json-api-for-cluster.token";
import type { KubeConfig } from "@kubernetes/client-node";
import { CoreV1Api, Watch } from "@kubernetes/client-node";

export interface NodeShellSessionDependencies extends ShellSessionDependencies {
  kubeJsonApiForCluster: KubeJsonApiForCluster;
}

export interface NodeShellSessionArgs extends ShellSessionArgs {
  nodeName: string;
}

export class NodeShellSession extends ShellSession {
  readonly ShellType = "node-shell";

  protected readonly podName = `node-shell-${uuid()}`;

  protected readonly cwd: string | undefined = undefined;
  protected readonly nodeName: string;

  constructor(protected readonly dependencies: NodeShellSessionDependencies, { nodeName, ...args }: NodeShellSessionArgs) {
    super(dependencies, args);
    this.nodeName = nodeName;
  }

  public async open() {
    const kc = await this.cluster.getProxyKubeconfig();
    const shell = await this.kubectl.getPath();
    const coreApi = kc.makeApiClient(CoreV1Api);

    try {
      await this.createNodeShellPod(coreApi);
      await this.waitForRunningPod(kc);

      this.emitter.on("exit", () => this.deleteNodeShellPod(coreApi));
    } catch (error) {
      this.deleteNodeShellPod(coreApi);
      this.send({
        type: TerminalChannels.STDOUT,
        data: `Error occurred: ${get(error, "response.body.message", error?.toString() || "unknown error")}`,
      });

      throw new ShellOpenError("failed to create node pod", error);
    }

    const env = await this.getCachedShellEnv();
    const args = ["exec", "-i", "-t", "-n", "kube-system", this.podName, "--"];
    const nodeApi = new NodeApi({
      request: this.dependencies.kubeJsonApiForCluster(this.cluster.id),
    });
    const node = await nodeApi.get({ name: this.nodeName });
    const nodeOs = node.getOperatingSystem();

    switch (nodeOs) {
      default:
        this.dependencies.logger.warn(`[NODE]: could not determine node OS, falling back with assumption of linux`);
        // fallthrough
      case "linux":
        args.push("sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))");
        break;
      case "windows":
        args.push("powershell");
        break;
    }

    await this.openShellProcess(shell, args, env);
  }

  protected createNodeShellPod(coreApi: CoreV1Api) {
    const imagePullSecrets = this.cluster.imagePullSecret
      ? [{
        name: this.cluster.imagePullSecret,
      }]
      : undefined;

    return coreApi
      .createNamespacedPod("kube-system", {
        metadata: {
          name: this.podName,
          namespace: "kube-system",
        },
        spec: {
          nodeName: this.nodeName,
          restartPolicy: "Never",
          terminationGracePeriodSeconds: 0,
          hostPID: true,
          hostIPC: true,
          hostNetwork: true,
          tolerations: [{
            operator: "Exists",
          }],
          priorityClassName: "system-node-critical",
          containers: [{
            name: "shell",
            image: this.cluster.nodeShellImage,
            securityContext: {
              privileged: true,
            },
            command: ["nsenter"],
            args: ["-t", "1", "-m", "-u", "-i", "-n", "sleep", "14000"],
          }],
          imagePullSecrets,
        },
      });
  }

  protected waitForRunningPod(kc: KubeConfig): Promise<void> {
    this.dependencies.logger.debug(`[NODE]: waiting for ${this.podName} to be running`);

    return new Promise((resolve, reject) => {
      new Watch(kc)
        .watch(`/api/v1/namespaces/kube-system/pods`,
          {},
          // callback is called for each received object.
          (type, { metadata: { name }, status }) => {
            if (name === this.podName) {
              switch (status.phase) {
                case "Running":
                  return resolve();
                case "Failed":
                  return reject(`Failed to be created: ${status.message || "unknown error"}`);
              }
            }
          },
          // done callback is called if the watch terminates normally
          (err) => {
            this.dependencies.logger.error(`[NODE]: ${this.podName} was not created in time`);
            reject(err);
          },
        )
        .then(req => {
          setTimeout(() => {
            this.dependencies.logger.error(`[NODE]: aborting wait for ${this.podName}, timing out`);
            req.abort();
            reject("Pod creation timed out");
          }, 2 * 60 * 1000); // 2 * 60 * 1000
        })
        .catch(error => {
          this.dependencies.logger.error(`[NODE]: waiting for ${this.podName} failed: ${error}`);
          reject(error);
        });
    });
  }

  protected deleteNodeShellPod(coreApi: CoreV1Api) {
    coreApi
      .deleteNamespacedPod(this.podName, "kube-system")
      .catch(error => this.dependencies.logger.warn(`[NODE]: failed to remove pod shell`, error));
  }
}
