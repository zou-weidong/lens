/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// This is the common k8s API between main and renderer. Currently it is exported there

import { KubeJsonApi as _KubeJsonApi } from "../../common/k8s-api/kube-json-api";
import { kubeJsonApiForClusterInjectionToken } from "../../common/k8s-api/kube-json-api-for-cluster.token";
import createResourceStackInjectable from "../../common/k8s/create-resource-stack.injectable";
import type { KubernetesCluster } from "./catalog";
import type { ResourceStack as _ResourceStack, ResourceApplingStack } from "../../common/k8s/resource-stack";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";
import kubeApiForClusterInjectable from "../../common/k8s-api/kube-api-for-cluster.injectable";
import apiManagerInjectable from "../../common/k8s-api/api-manager.injectable";

export const KubeJsonApi = Object.assign(_KubeJsonApi, {
  forCluster: asLegacyGlobalForExtensionApi(kubeJsonApiForClusterInjectionToken),
});

export const createResourceStack = asLegacyGlobalForExtensionApi(createResourceStackInjectable);

/**
 * @deprecated use `createResourceStack` instead
 */
export class ResourceStack implements ResourceApplingStack {
  #inner: _ResourceStack;

  constructor(cluster: KubernetesCluster, name: string) {
    this.#inner = createResourceStack(cluster, name);
  }

  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    return this.#inner.kubectlApplyFolder(folderPath, templateContext, extraArgs);
  }

  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    return this.#inner.kubectlDeleteFolder(folderPath, templateContext, extraArgs);
  }
}

export const forCluster = asLegacyGlobalForExtensionApi(kubeApiForClusterInjectable);
export const apiManager = asLegacyGlobalForExtensionApi(apiManagerInjectable);

export { KubeApi, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { Pod, PodApi as PodsApi } from "../../common/k8s-api/endpoints";
export { Node, NodeApi as NodesApi } from "../../common/k8s-api/endpoints";
export { Deployment, DeploymentApi } from "../../common/k8s-api/endpoints";
export { DaemonSet, DaemonSetApi } from "../../common/k8s-api/endpoints";
export { StatefulSet, StatefulSetApi } from "../../common/k8s-api/endpoints";
export { Job, JobApi } from "../../common/k8s-api/endpoints";
export { CronJob, CronJobApi } from "../../common/k8s-api/endpoints";
export { ConfigMap, ConfigMapApi } from "../../common/k8s-api/endpoints";
export { Secret, SecretApi as SecretsApi } from "../../common/k8s-api/endpoints";
export { ReplicaSet, ReplicaSetApi } from "../../common/k8s-api/endpoints";
export { ResourceQuota, ResourceQuotaApi } from "../../common/k8s-api/endpoints";
export { LimitRange, LimitRangeApi } from "../../common/k8s-api/endpoints";
export { HorizontalPodAutoscaler, HorizontalPodAutoscalerApi } from "../../common/k8s-api/endpoints";
export { PodDisruptionBudget, PodDisruptionBudgetApi } from "../../common/k8s-api/endpoints";
export { Service, ServiceApi } from "../../common/k8s-api/endpoints";
export { Endpoint, EndpointApi } from "../../common/k8s-api/endpoints";
export { Ingress, IngressApi } from "../../common/k8s-api/endpoints";
export { NetworkPolicy, NetworkPolicyApi } from "../../common/k8s-api/endpoints";
export { PersistentVolume, PersistentVolumeApi } from "../../common/k8s-api/endpoints";
export { PersistentVolumeClaim, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints";
export { StorageClass, StorageClassApi } from "../../common/k8s-api/endpoints";
export { Namespace, NamespaceApi } from "../../common/k8s-api/endpoints";
export { KubeEvent, KubeEventApi } from "../../common/k8s-api/endpoints";
export { ServiceAccount, ServiceAccountApi } from "../../common/k8s-api/endpoints";
export { Role, RoleApi } from "../../common/k8s-api/endpoints";
export { RoleBinding, RoleBindingApi } from "../../common/k8s-api/endpoints";
export { ClusterRole, ClusterRoleApi } from "../../common/k8s-api/endpoints";
export { ClusterRoleBinding, ClusterRoleBindingApi } from "../../common/k8s-api/endpoints";
export { CustomResourceDefinition, CustomResourceDefinitionApi } from "../../common/k8s-api/endpoints";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { PodContainer as IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectMetadata, KubeStatusData } from "../../common/k8s-api/kube-object";
export type { KubeObjectStoreLoadAllParams, KubeObjectStoreLoadingParams, KubeObjectStoreSubscribeParams } from "../../common/k8s-api/kube-object.store";
