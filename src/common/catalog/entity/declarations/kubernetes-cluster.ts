/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { CatalogEntity } from "../../entity";
import type { CatalogEntitySpec, CatalogEntityActionContext, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../../entity";
import { activateClusterInjectionToken } from "../../../ipc/cluster/activate.token";
import { disconnectClusterInjectionToken } from "../../../ipc/cluster/disconnect.token";
import { asLegacyGlobalForExtensionApi } from "../../../../extensions/di-legacy-globals/for-extension-api";

export interface KubernetesClusterPrometheusMetrics {
  address?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  type?: string;
}

export interface KubernetesClusterSpec extends CatalogEntitySpec {
  kubeconfigPath: string;
  kubeconfigContext: string;
  metrics?: {
    source: string;
    prometheus?: KubernetesClusterPrometheusMetrics;
  };
  icon?: {
    // TODO: move to CatalogEntitySpec once any-entity icons are supported
    src?: string;
    material?: string;
    background?: string;
  };
  accessibleNamespaces?: string[];
}

export enum LensKubernetesClusterStatus {
  DELETING = "deleting",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export interface KubernetesClusterMetadata extends CatalogEntityMetadata {
  distro?: string;
  kubeVersion?: string;
}

/**
 * @deprecated This is no longer used as it is incorrect. Other sources can add more values
 */
export type KubernetesClusterStatusPhase = "connected" | "connecting" | "disconnected" | "deleting";

export interface KubernetesClusterStatus extends CatalogEntityStatus {
}

const activateCluster = asLegacyGlobalForExtensionApi(activateClusterInjectionToken.token);
const disconnectCluster = asLegacyGlobalForExtensionApi(disconnectClusterInjectionToken.token);

export class KubernetesCluster<
  Metadata extends KubernetesClusterMetadata = KubernetesClusterMetadata,
  Status extends KubernetesClusterStatus = KubernetesClusterStatus,
  Spec extends KubernetesClusterSpec = KubernetesClusterSpec,
> extends CatalogEntity<Metadata, Status, Spec> {
  public static readonly apiVersion: string = "entity.k8slens.dev/v1alpha1";
  public static readonly kind: string = "KubernetesCluster";

  public readonly apiVersion = KubernetesCluster.apiVersion;
  public readonly kind = KubernetesCluster.kind;

  connect(): Promise<void> {
    return activateCluster(this.getId());
  }

  disconnect(): Promise<void> {
    return disconnectCluster(this.getId());
  }

  onRun(context: CatalogEntityActionContext) {
    context.navigate(`/cluster/${this.getId()}`);
  }

  onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    if (!this.metadata.source || this.metadata.source === "local") {
      context.menuItems.push({
        title: "Settings",
        icon: "settings",
        onClick: () => context.navigate(`/entity/${this.getId()}/settings`, {
          forceRootFrame: true,
        }),
      });
    }

    switch (this.status.phase) {
      case LensKubernetesClusterStatus.CONNECTED:
      case LensKubernetesClusterStatus.CONNECTING:
        context.menuItems.push({
          title: "Disconnect",
          icon: "link_off",
          onClick: () => disconnectCluster(this.getId()),
        });
        break;
      case LensKubernetesClusterStatus.DISCONNECTED:
        context.menuItems.push({
          title: "Connect",
          icon: "link",
          onClick: () => context.navigate(`/cluster/${this.getId()}`),
        });
        break;
    }
  }
}
