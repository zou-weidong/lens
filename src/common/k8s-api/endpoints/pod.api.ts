/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Affinity, Toleration, ContainerProbe } from "../common-types";
import { autoBind } from "../../utils";
import type { IMetrics } from "./metrics.api";
import { metricsApi } from "./metrics.api";
import type { DerivedKubeApiOptions, IgnoredKubeApiOptions, ResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";

export type QueryForLogs = (params: ResourceDescriptor, query?: PodLogsQuery) => Promise<string>;

export interface PodApiQueries {
  getLogs: QueryForLogs;
}

export class PodApi extends KubeApi<Pod> implements PodApiQueries {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Pod,
    });
  }

  async getLogs(params: ResourceDescriptor, query?: PodLogsQuery): Promise<string> {
    return this.request.get(`${this.getUrl(params)}/log`, { query });
  }
}

export function getMetricsForPods(pods: Pod[], namespace: string, selector = "pod, namespace"): Promise<IPodMetrics> {
  const podSelector = pods.map(pod => pod.getName()).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    cpuRequests: opts,
    cpuLimits: opts,
    memoryUsage: opts,
    memoryRequests: opts,
    memoryLimits: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export interface IPodMetrics<T = IMetrics> {
  [metric: string]: T;
  cpuUsage: T;
  memoryUsage: T;
  fsUsage: T;
  fsWrites: T;
  fsReads: T;
  networkReceive: T;
  networkTransmit: T;
  cpuRequests?: T;
  cpuLimits?: T;
  memoryRequests?: T;
  memoryLimits?: T;
}

// Reference: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#read-log-pod-v1-core
export interface PodLogsQuery {
  container?: string;
  tailLines?: number;
  timestamps?: boolean;
  sinceTime?: string; // Date.toISOString()-format
  follow?: boolean;
  previous?: boolean;
}

export enum PodStatusKind {
  TERMINATED = "Terminated",
  FAILED = "Failed",
  PENDING = "Pending",
  RUNNING = "Running",
  SUCCEEDED = "Succeeded",
  EVICTED = "Evicted",
}

export interface PodContainer extends Partial<Record<PodContainerProbe, ContainerProbe>> {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports?: {
    name?: string;
    containerPort: number;
    protocol: string;
  }[];
  resources?: {
    limits?: {
      cpu: string;
      memory: string;
    };
    requests?: {
      cpu: string;
      memory: string;
    };
  };
  terminationMessagePath?: string;
  terminationMessagePolicy?: string;
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      fieldRef?: {
        apiVersion: string;
        fieldPath: string;
      };
      secretKeyRef?: {
        key: string;
        name: string;
      };
      configMapKeyRef?: {
        key: string;
        name: string;
      };
    };
  }[];
  envFrom?: {
    configMapRef?: {
      name: string;
    };
    secretRef?: {
      name: string;
    };
  }[];
  volumeMounts?: {
    name: string;
    readOnly: boolean;
    mountPath: string;
  }[];
  imagePullPolicy: string;
}

export type PodContainerProbe = "livenessProbe" | "readinessProbe" | "startupProbe";

export interface ContainerStateRunning {
  startedAt: string;
}

export interface ContainerStateWaiting {
  reason: string;
  message: string;
}

export interface ContainerStateTerminated {
  startedAt: string;
  finishedAt: string;
  exitCode: number;
  reason: string;
  containerID?: string;
  message?: string;
  signal?: number;
}

/**
 * ContainerState holds a possible state of container. Only one of its members
 * may be specified. If none of them is specified, the default one is
 * `ContainerStateWaiting`.
 */
export interface ContainerState {
  running?: ContainerStateRunning;
  waiting?: ContainerStateWaiting;
  terminated?: ContainerStateTerminated;
}

export interface IPodContainerStatus {
  name: string;
  state?: ContainerState;
  lastState?: ContainerState;
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID?: string;
  started?: boolean;
}

export interface PodSpec {
  volumes?: {
    name: string;
    persistentVolumeClaim: {
      claimName: string;
    };
    emptyDir: {
      medium?: string;
      sizeLimit?: string;
    };
    configMap: {
      name: string;
    };
    secret: {
      secretName: string;
      defaultMode: number;
    };
  }[];
  initContainers?: PodContainer[];
  containers?: PodContainer[];
  restartPolicy?: string;
  terminationGracePeriodSeconds?: number;
  activeDeadlineSeconds?: number;
  dnsPolicy?: string;
  serviceAccountName: string;
  serviceAccount: string;
  automountServiceAccountToken?: boolean;
  priority?: number;
  priorityClassName?: string;
  nodeName?: string;
  nodeSelector?: {
    [selector: string]: string;
  };
  securityContext?: {};
  imagePullSecrets?: {
    name: string;
  }[];
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostIPC?: boolean;
  shareProcessNamespace?: boolean;
  hostname?: string;
  subdomain?: string;
  schedulerName?: string;
  tolerations?: Toleration[];
  hostAliases?: {
    ip: string;
    hostnames: string[];
  };
  affinity?: Affinity;
}

export interface PodStatus {
  phase: string;
  conditions: {
    type: string;
    status: string;
    lastProbeTime: number;
    lastTransitionTime: string;
  }[];
  hostIP: string;
  podIP: string;
  podIPs?: {
    ip: string;
  }[];
  startTime: string;
  initContainerStatuses?: IPodContainerStatus[];
  containerStatuses?: IPodContainerStatus[];
  qosClass?: string;
  reason?: string;
}

export class Pod extends KubeObject<KubeObjectMetadata, PodStatus, PodSpec> {
  static kind = "Pod";
  static namespaced = true;
  static apiBase = "/api/v1/pods";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getInitContainers() {
    return this.spec?.initContainers || [];
  }

  getContainers() {
    return this.spec?.containers || [];
  }

  getAllContainers() {
    return [...this.getContainers(), ...this.getInitContainers()];
  }

  getRunningContainers() {
    const runningContainerNames = new Set(
      this.getContainerStatuses()
        .filter(({ state }) => state.running)
        .map(({ name }) => name),
    );

    return this.getAllContainers()
      .filter(({ name }) => runningContainerNames.has(name));
  }

  getContainerStatuses(includeInitContainers = true) {
    const { containerStatuses = [], initContainerStatuses = [] } = this.status ?? {};

    if (includeInitContainers) {
      return [...containerStatuses, ...initContainerStatuses];
    }

    return [...containerStatuses];
  }

  getRestartsCount(): number {
    const { containerStatuses = [] } = this.status ?? {};

    return containerStatuses.reduce((totalCount, { restartCount }) => totalCount + restartCount, 0);
  }

  getQosClass() {
    return this.status?.qosClass || "";
  }

  getReason() {
    return this.status?.reason || "";
  }

  getPriorityClassName() {
    return this.spec.priorityClassName || "";
  }

  getStatus(): PodStatusKind {
    const phase = this.getStatusPhase();
    const reason = this.getReason();
    const trueConditionTypes = new Set(this.getConditions()
      .filter(({ status }) => status === "True")
      .map(({ type }) => type));
    const isInGoodCondition = ["Initialized", "Ready"].every(condition => trueConditionTypes.has(condition));

    if (reason === PodStatusKind.EVICTED) {
      return PodStatusKind.EVICTED;
    }

    if (phase === PodStatusKind.FAILED) {
      return PodStatusKind.FAILED;
    }

    if (phase === PodStatusKind.SUCCEEDED) {
      return PodStatusKind.SUCCEEDED;
    }

    if (phase === PodStatusKind.RUNNING && isInGoodCondition) {
      return PodStatusKind.RUNNING;
    }

    return PodStatusKind.PENDING;
  }

  // Returns pod phase or container error if occurred
  getStatusMessage(): string {
    if (this.getReason() === PodStatusKind.EVICTED) {
      return "Evicted";
    }

    if (this.metadata.deletionTimestamp) {
      return "Terminating";
    }

    return this.getStatusPhase() || "Waiting";
  }

  getStatusPhase() {
    return this.status?.phase;
  }

  getConditions() {
    return this.status?.conditions || [];
  }

  getVolumes() {
    return this.spec.volumes || [];
  }

  getSecrets(): string[] {
    return this.getVolumes()
      .filter(vol => vol.secret)
      .map(vol => vol.secret.secretName);
  }

  getNodeSelectors(): string[] {
    const { nodeSelector = {}} = this.spec;

    return Object.entries(nodeSelector).map(values => values.join(": "));
  }

  getTolerations() {
    return this.spec.tolerations || [];
  }

  getAffinity(): Affinity | undefined {
    return this.spec.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  hasIssues() {
    for (const { type, status } of this.getConditions()) {
      if (type === "Ready" && status !== "True") {
        return true;
      }
    }

    for (const { state } of this.getContainerStatuses()) {
      if (state?.waiting?.reason === "CrashLookBackOff") {
        return true;
      }
    }

    return this.getStatusPhase() !== "Running";
  }

  getLivenessProbe(container: PodContainer) {
    return this.getProbe(container, "livenessProbe");
  }

  getReadinessProbe(container: PodContainer) {
    return this.getProbe(container, "readinessProbe");
  }

  getStartupProbe(container: PodContainer) {
    return this.getProbe(container, "startupProbe");
  }

  private getProbe(container: PodContainer, field: PodContainerProbe): string[] {
    const probe: string[] = [];
    const probeData = container[field];

    if (!probeData) {
      return probe;
    }

    const {
      httpGet, exec, tcpSocket,
      initialDelaySeconds = 0,
      timeoutSeconds = 0,
      periodSeconds = 0,
      successThreshold = 0,
      failureThreshold = 0,
    } = probeData;

    // HTTP Request
    if (httpGet) {
      const { path = "", port, host = "", scheme } = httpGet;
      const resolvedPort = typeof port === "number"
        ? port
        // Try and find the port number associated witht the name or fallback to the name itself
        : container.ports?.find(containerPort => containerPort.name === port)?.containerPort || port;

      probe.push(
        "http-get",
        `${scheme.toLowerCase()}://${host}:${resolvedPort}${path}`,
      );
    }

    // Command
    if (exec?.command) {
      probe.push(`exec [${exec.command.join(" ")}]`);
    }

    // TCP Probe
    if (tcpSocket?.port) {
      probe.push(`tcp-socket :${tcpSocket.port}`);
    }

    probe.push(
      `delay=${initialDelaySeconds}s`,
      `timeout=${timeoutSeconds}s`,
      `period=${periodSeconds}s`,
      `#success=${successThreshold}`,
      `#failure=${failureThreshold}`,
    );

    return probe;
  }

  getNodeName() {
    return this.spec.nodeName;
  }

  getSelectedNodeOs(): string | undefined {
    return this.spec.nodeSelector?.["kubernetes.io/os"] || this.spec.nodeSelector?.["beta.kubernetes.io/os"];
  }

  getIPs(): string[] {
    if(!this.status.podIPs) return [];
    const podIPs = this.status.podIPs;

    return podIPs.map(value => value.ip);
  }
}
