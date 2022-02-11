/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IReactionDisposer } from "mobx";
import { action, makeObservable, observable, when } from "mobx";
import type { ClusterId } from "../../../../common/clusters/cluster-types";
import { getClusterFrameUrl } from "../../../utils";
import type { GetClusterById } from "../../../../common/clusters/get-by-id.injectable";
import type { LensLogger } from "../../../../common/logger";
import type { SetClusterAsVisible } from "../../../../common/ipc/cluster/set-as-visible.token";

export interface LensView {
  isLoaded: boolean;
  frame: HTMLIFrameElement;
}

export interface ClusterFrameHandlerDependencies {
  getClusterById: GetClusterById;
  readonly logger: LensLogger;
  setClusterAsVisible: SetClusterAsVisible;
}

export class ClusterFramesManager {
  private views = observable.map<string, LensView>();

  constructor(protected readonly dependencies: ClusterFrameHandlerDependencies) {
    makeObservable(this);
  }

  public hasLoadedView(clusterId: string): boolean {
    return Boolean(this.views.get(clusterId)?.isLoaded);
  }

  @action
  public initView(clusterId: ClusterId) {
    const cluster = this.dependencies.getClusterById(clusterId);

    if (!cluster || this.views.has(clusterId)) {
      return;
    }

    this.dependencies.logger.info(`init dashboard, clusterId=${clusterId}`);
    const parentElem = document.getElementById("lens-views");
    const iframe = document.createElement("iframe");

    iframe.id = `cluster-frame-${cluster.id}`;
    iframe.name = cluster.contextName;
    iframe.style.display = "none";
    iframe.setAttribute("src", getClusterFrameUrl(clusterId));
    iframe.addEventListener("load", () => {
      this.dependencies.logger.info(`loaded from ${iframe.src}`);
      this.views.get(clusterId).isLoaded = true;
    }, { once: true });
    this.views.set(clusterId, { frame: iframe, isLoaded: false });
    parentElem.appendChild(iframe);

    this.dependencies.logger.info(`waiting cluster to be ready, clusterId=${clusterId}`);

    const dispose = when(
      () => cluster.ready,
      () => this.dependencies.logger.info(`cluster is ready, clusterId=${clusterId}`),
    );

    when(
      // cluster.disconnect is set to `false` when the cluster starts to connect
      () => !cluster.disconnected,
      () => {
        when(
          () => {
            const cluster = this.dependencies.getClusterById(clusterId);

            return !cluster || (cluster.disconnected && this.views.get(clusterId)?.isLoaded);
          },
          () => {
            this.dependencies.logger.info(`remove dashboard, clusterId=${clusterId}`);
            this.views.delete(clusterId);
            iframe.parentNode.removeChild(iframe);
            dispose();
          },
        );
      },
    );
  }

  private prevVisibleClusterChange?: IReactionDisposer;

  public setVisibleCluster(clusterId: ClusterId | null) {
    // Clear the previous when ASAP
    this.prevVisibleClusterChange?.();

    this.dependencies.logger.info(`refreshing iframe views, visible cluster id=${clusterId}`);
    this.dependencies.setClusterAsVisible(undefined);

    for (const { frame: view } of this.views.values()) {
      view.style.display = "none";
    }

    const cluster = this.dependencies.getClusterById(clusterId);

    if (cluster) {
      this.prevVisibleClusterChange = when(
        () => cluster.available && cluster.ready && this.views.get(clusterId)?.isLoaded,
        () => {
          this.dependencies.logger.info(`cluster id=${clusterId} should now be visible`);
          this.views.get(clusterId).frame.style.display = "flex";
          this.dependencies.setClusterAsVisible(clusterId);
        },
      );
    }
  }

  public clearVisibleCluster() {
    this.setVisibleCluster(null);
  }
}
