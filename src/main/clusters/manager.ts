/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type http from "http";
import { action, makeObservable, observable, reaction, toJS } from "mobx";
import type { Cluster } from "../../common/clusters/cluster";
import { apiKubePrefix } from "../../common/vars";
import { getClusterIdFromHost } from "../../common/utils";
import type { KubernetesClusterPrometheusMetrics } from "../../common/catalog/entity/declarations/kubernetes-cluster";
import { KubernetesCluster, LensKubernetesClusterStatus } from "../../common/catalog/entity/declarations/kubernetes-cluster";
import type { ClusterStore } from "../../common/clusters/store";
import type { ClusterId } from "../../common/clusters/cluster-types";
import type { FindEntitiesByClass } from "../../common/catalog/entity/find-by-class.injectable";
import type { LensLogger } from "../../common/logger";
import type { FindEntityById } from "../../common/catalog/entity/find-by-id.injectable";
import type { CatalogEntity } from "../../common/catalog/entity";

const lensSpecificClusterStatuses: Set<string> = new Set(Object.values(LensKubernetesClusterStatus));

export interface ClusterManagerDependencies {
  readonly store: ClusterStore;
  readonly logger: LensLogger;
  findEntitiesByClass: FindEntitiesByClass;
  findEntityById: FindEntityById;
}

export class ClusterManager {
  private deleting = observable.set<ClusterId>();

  @observable visibleCluster: ClusterId | undefined = undefined;

  constructor(protected readonly dependencies: ClusterManagerDependencies) {
    makeObservable(this);

    // reacting to every cluster's state change and total amount of items
    reaction(
      () => this.dependencies.store.clustersList.get().map(c => c.getState()),
      () => this.updateCatalog(this.dependencies.store.clustersList.get()),
      { fireImmediately: false },
    );

    // reacting to every cluster's preferences change and total amount of items
    reaction(
      () => this.dependencies.store.clustersList.get().map(c => toJS(c.preferences)),
      () => this.updateCatalog(this.dependencies.store.clustersList.get()),
      { fireImmediately: false },
    );

    reaction(
      () => this.dependencies.findEntitiesByClass(KubernetesCluster) as KubernetesCluster[],
      entities => this.syncClustersFromCatalog(entities),
    );

    reaction(() => [
      this.dependencies.findEntitiesByClass(KubernetesCluster),
      this.visibleCluster,
    ] as const, ([entities, visibleCluster]) => {
      for (const entity of entities) {
        if (entity.getId() === visibleCluster) {
          entity.status.active = true;
        } else {
          entity.status.active = false;
        }
      }
    });
  }

  @action
  protected updateCatalog(clusters: Cluster[]) {
    this.dependencies.logger.debug("updating catalog from cluster store");

    for (const cluster of clusters) {
      this.updateEntityFromCluster(cluster);
    }
  }

  public setAsDeleting(clusterId: ClusterId): void {
    this.deleting.add(clusterId);
    this.updateEntityStatus(this.dependencies.findEntityById(clusterId));
  }

  public clearAsDeleting(clusterId: ClusterId): void {
    this.deleting.delete(clusterId);
    this.updateEntityStatus(this.dependencies.findEntityById(clusterId));
  }

  @action
  protected updateEntityFromCluster(cluster: Cluster) {
    const entity = this.dependencies.findEntityById(cluster.id) as KubernetesCluster;

    if (!entity) {
      return;
    }

    this.updateEntityStatus(entity, cluster);

    entity.metadata.labels = {
      ...entity.metadata.labels,
      ...cluster.labels,
    };
    entity.metadata.distro = cluster.distribution;
    entity.metadata.kubeVersion = cluster.version;

    if (cluster.preferences?.clusterName) {
      /**
       * Only set the name if the it is overriden in preferences. If it isn't
       * set then the name of the entity has been explicitly set by its source
       */
      entity.metadata.name = cluster.preferences.clusterName;
    }

    entity.spec.metrics ||= { source: "local" };

    if (entity.spec.metrics.source === "local") {
      const prometheus: KubernetesClusterPrometheusMetrics = entity.spec?.metrics?.prometheus || {};

      prometheus.type = cluster.preferences.prometheusProvider?.type;
      prometheus.address = cluster.preferences.prometheus;
      entity.spec.metrics.prometheus = prometheus;
    }

    if (cluster.preferences.icon) {
      entity.spec.icon ??= {};
      entity.spec.icon.src = cluster.preferences.icon;
    } else if (cluster.preferences.icon === null) {
      /**
       * NOTE: only clear the icon if set to `null` by ClusterIconSettings.
       * We can then also clear that value too
       */
      entity.spec.icon = undefined;
      cluster.preferences.icon = undefined;
    }
  }

  @action
  protected updateEntityStatus(entity: CatalogEntity, cluster?: Cluster) {
    if (this.deleting.has(entity.getId())) {
      entity.status.phase = LensKubernetesClusterStatus.DELETING;
      entity.status.enabled = false;
    } else {
      entity.status.phase = (() => {
        if (!cluster) {
          return LensKubernetesClusterStatus.DISCONNECTED;
        }

        if (cluster.accessible) {
          return LensKubernetesClusterStatus.CONNECTED;
        }

        if (!cluster.disconnected) {
          return LensKubernetesClusterStatus.CONNECTING;
        }

        // Extensions are not allowed to use the Lens specific status phases
        if (!lensSpecificClusterStatuses.has(entity?.status?.phase)) {
          return entity.status.phase;
        }

        return LensKubernetesClusterStatus.DISCONNECTED;
      })();

      entity.status.enabled = true;
    }
  }

  @action
  protected syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = this.dependencies.store.getById(entity.getId());

      if (!cluster) {
        const model = {
          id: entity.getId(),
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext,
          accessibleNamespaces: entity.spec.accessibleNamespaces ?? [],
        };

        try {
          /**
           * Add the bare minimum of data to ClusterStore. And especially no
           * preferences, as those might be configured by the entity's source
           */
          this.dependencies.store.addCluster(model);
        } catch (error) {
          if (error.code === "ENOENT" && error.path === entity.spec.kubeconfigPath) {
            this.dependencies.logger.warn("kubeconfig file disappeared", model);
          } else {
            this.dependencies.logger.error(`failed to add cluster: ${error}`, model);
          }
        }
      } else {
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;

        if (entity.spec.accessibleNamespace) {
          cluster.accessibleNamespaces = entity.spec.accessibleNamespaces;
        }

        if (entity.spec.metrics) {
          const { source, prometheus } = entity.spec.metrics;

          if (source !== "local" && prometheus) {
            const { type, address } = prometheus;

            if (type) {
              cluster.preferences.prometheusProvider = { type };
            }

            if (address) {
              cluster.preferences.prometheus = address;
            }
          }
        }

        this.updateEntityFromCluster(cluster);
      }
    }
  }

  onNetworkOffline() {
    this.dependencies.logger.info("network is offline");

    for (const cluster of this.dependencies.store.clustersList.get()) {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    }
  }

  onNetworkOnline() {
    this.dependencies.logger.info("network is online");

    for (const cluster of this.dependencies.store.clustersList.get()) {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    }
  }

  stop() {
    for (const cluster of this.dependencies.store.clustersList.get()) {
      cluster.disconnect();
    }
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster | undefined {
    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];
      const cluster = this.dependencies.store.getById(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }

      return cluster;
    }

    return this.dependencies.store.getById(getClusterIdFromHost(req.headers.host));
  }
}

export function catalogEntityFromCluster(cluster: Cluster) {
  return new KubernetesCluster({
    metadata: {
      uid: cluster.id,
      name: cluster.name,
      source: "local",
      labels: {
        ...cluster.labels,
      },
      distro: cluster.distribution,
      kubeVersion: cluster.version,
    },
    spec: {
      kubeconfigPath: cluster.kubeConfigPath,
      kubeconfigContext: cluster.contextName,
      icon: {},
    },
    status: {
      phase: cluster.disconnected
        ? LensKubernetesClusterStatus.DISCONNECTED
        : LensKubernetesClusterStatus.CONNECTED,
      reason: "",
      message: "",
      active: !cluster.disconnected,
    },
  });
}
