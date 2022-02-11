/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { autoBind } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";

export enum SecretType {
  Opaque = "Opaque",
  ServiceAccountToken = "kubernetes.io/service-account-token",
  Dockercfg = "kubernetes.io/dockercfg",
  DockerConfigJson = "kubernetes.io/dockerconfigjson",
  BasicAuth = "kubernetes.io/basic-auth",
  SSHAuth = "kubernetes.io/ssh-auth",
  TLS = "kubernetes.io/tls",
  BootstrapToken = "bootstrap.kubernetes.io/token",
}

export interface ISecretRef {
  key?: string;
  name: string;
}

export interface SecretData extends KubeJsonApiData<KubeObjectMetadata, void, void> {
  type: SecretType;
  data?: Record<string, string>;
}

export class Secret extends KubeObject<KubeObjectMetadata, void, void> {
  static kind = "Secret";
  static namespaced = true;
  static apiBase = "/api/v1/secrets";

  declare type: SecretType;
  declare data: Record<string, string>;

  constructor(data: SecretData) {
    super(data);
    autoBind(this);

    this.data ??= {};
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }
}

export class SecretApi extends KubeApi<Secret> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: Secret,
      ...opts,
    });
  }
}
