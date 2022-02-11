/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterDetector, K8sClusterRequest } from "./cluster-detector";
import type { Cluster } from "../../../common/clusters/cluster";

function isGKE(version: string) {
  return version.includes("gke");
}

function isEKS(version: string) {
  return version.includes("eks");
}

function isIKS(version: string) {
  return version.includes("IKS");
}

function isAKS(cluster: Cluster) {
  return cluster.apiUrl.includes("azmk8s.io");
}

function isMirantis(version: string) {
  return version.includes("-mirantis-") || version.includes("-docker-");
}

function isDigitalOcean(cluster: Cluster) {
  return cluster.apiUrl.endsWith("k8s.ondigitalocean.com");
}

function isMinikube(cluster: Cluster) {
  return cluster.contextName.startsWith("minikube");
}

function isMicrok8s(cluster: Cluster) {
  return cluster.contextName.startsWith("microk8s");
}

function isKind(cluster: Cluster) {
  return cluster.contextName.startsWith("kubernetes-admin@kind-");
}

function isDockerDesktop(cluster: Cluster) {
  return cluster.contextName === "docker-desktop";
}

function isTke(version: string) {
  return version.includes("-tke.");
}

function isCustom(version: string) {
  return version.includes("+");
}

function isVMWare(version: string) {
  return version.includes("+vmware");
}

function isRke(version: string) {
  return version.includes("-rancher");
}

function isRancherDesktop(cluster: Cluster) {
  return cluster.contextName === "rancher-desktop";
}

function isK3s(version: string) {
  return version.includes("+k3s");
}

function isK0s(version: string) {
  return version.includes("-k0s") || version.includes("+k0s");
}

function isAlibaba(version: string) {
  return version.includes("-aliyun");
}

function isHuawei(version: string) {
  return version.includes("-CCE");
}

async function isOpenshift(k8sRequest: K8sClusterRequest) {
  try {
    const { paths } = await k8sRequest("");

    return (paths as string)?.includes("/apis/project.openshift.io");
  } catch (e) {
    return false;
  }
}

async function getKubernetesVersion(cluster: Cluster, k8sRequest: K8sClusterRequest) {
  if (cluster.version) {
    return cluster.version;
  }

  const response = await k8sRequest("/version");

  return response.gitVersion as string;
}

export const distributionDetector: ClusterDetector = async (cluster, { k8sRequest }) => {
  const version = await getKubernetesVersion(cluster, k8sRequest);

  if (isRke(version)) {
    return { value: "rke", accuracy: 80 };
  }

  if (isRancherDesktop(cluster)) {
    return { value: "rancher-desktop", accuracy: 80 };
  }

  if (isK3s(version)) {
    return { value: "k3s", accuracy: 80 };
  }

  if (isGKE(version)) {
    return { value: "gke", accuracy: 80 };
  }

  if (isEKS(version)) {
    return { value: "eks", accuracy: 80 };
  }

  if (isIKS(version)) {
    return { value: "iks", accuracy: 80 };
  }

  if (isAKS(cluster)) {
    return { value: "aks", accuracy: 80 };
  }

  if (isDigitalOcean(cluster)) {
    return { value: "digitalocean", accuracy: 90 };
  }

  if (isK0s(version)) {
    return { value: "k0s", accuracy: 80 };
  }

  if (isVMWare(version)) {
    return { value: "vmware", accuracy: 90 };
  }

  if (isMirantis(version)) {
    return { value: "mirantis", accuracy: 90 };
  }

  if (isAlibaba(version)) {
    return { value: "alibaba", accuracy: 90 };
  }

  if (isHuawei(version)) {
    return { value: "huawei", accuracy: 90 };
  }

  if (isTke(version)) {
    return { value: "tencent", accuracy: 90 };
  }

  if (isMinikube(cluster)) {
    return { value: "minikube", accuracy: 80 };
  }

  if (isMicrok8s(cluster)) {
    return { value: "microk8s", accuracy: 80 };
  }

  if (isKind(cluster)) {
    return { value: "kind", accuracy: 70 };
  }

  if (isDockerDesktop(cluster)) {
    return { value: "docker-desktop", accuracy: 80 };
  }

  if (isCustom(version) && await isOpenshift(k8sRequest)) {
    return { value: "openshift", accuracy: 90 };
  }

  if (isCustom(version)) {
    return { value: "custom", accuracy: 10 };
  }

  return { value: "unknown", accuracy: 10 };
};
