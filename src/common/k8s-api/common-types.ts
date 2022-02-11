/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector } from "./kube-object";

export interface ContainerProbe {
  httpGet?: {
    path?: string;

    /**
     * either a port number or an IANA_SVC_NAME string referring to a port defined in the container
     */
    port: number | string;
    scheme: string;
    host?: string;
  };
  exec?: {
    command: string[];
  };
  tcpSocket?: {
    port: number;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface Toleration {
  key?: string;
  operator?: string;
  effect?: string;
  value?: string;
  tolerationSeconds?: number;
}

export interface NodeAffinity {
  nodeSelectorTerms?: LabelSelector[];
  weight: number;
  preference: LabelSelector;
}

export interface PodAffinity {
  labelSelector: LabelSelector;
  topologyKey: string;
}

export interface ExecutionAffinity<SpecificAffinity> {
  requiredDuringSchedulingIgnoredDuringExecution?: SpecificAffinity[];
  preferredDuringSchedulingIgnoredDuringExecution?: SpecificAffinity[];
}

export interface Affinity {
  nodeAffinity?: ExecutionAffinity<NodeAffinity>;
  podAffinity?: ExecutionAffinity<PodAffinity>;
  podAntiAffinity?: ExecutionAffinity<PodAffinity>;
}
