/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable, when } from "mobx";
import type { ClusterId } from "../../../common/cluster-types";
import type { Disposer } from "../../utils";
import { getClusterFrameUrl, onceDefined } from "../../utils";
import assert from "assert";
import type { GetClusterById } from "../../../common/cluster/get-by-id.injectable";
import type { SendSetVisibleCluster } from "../../cluster/send-set-visible.injectable";
import type { Logger } from "../../../common/logger";

export interface LensView {
  isLoaded: boolean;
  frame: HTMLIFrameElement;
}

export interface ClusterFrameHandlerDependencies {
  getClusterById: GetClusterById;
  sendSetVisibleCluster: SendSetVisibleCluster;
  readonly parentElem: HTMLElement;
  readonly logger: Logger;
}

export class ClusterFrameHandler {
  private readonly views = observable.map<string, LensView>();

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

    this.dependencies.logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
    const iframe = document.createElement("iframe");

    iframe.id = `cluster-frame-${cluster.id}`;
    iframe.name = cluster.contextName;
    iframe.setAttribute("src", getClusterFrameUrl(clusterId));
    iframe.addEventListener("load", action(() => {
      this.dependencies.logger.info(`[LENS-VIEW]: frame for clusterId=${clusterId} has loaded`);
      const view = this.views.get(clusterId);

      assert(view, `view for ${clusterId} MUST still exist here`);
      view.isLoaded = true;
    }), { once: true });
    this.views.set(clusterId, { frame: iframe, isLoaded: false });
    this.dependencies.parentElem.appendChild(iframe);

    this.dependencies.logger.info(`[LENS-VIEW]: waiting cluster to be ready, clusterId=${clusterId}`);

    const dispose = when(
      () => cluster.ready,
      () => this.dependencies.logger.info(`[LENS-VIEW]: cluster is ready, clusterId=${clusterId}`),
    );

    when(
      // cluster.disconnect is set to `false` when the cluster starts to connect
      () => !cluster.disconnected,
      () => {
        when(
          () => {
            const cluster = this.dependencies.getClusterById(clusterId);

            return Boolean(!cluster || (cluster.disconnected && this.views.get(clusterId)?.isLoaded));
          },
          () => {
            this.dependencies.logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
            this.views.delete(clusterId);
            this.dependencies.parentElem.removeChild(iframe);
            dispose();
          },
        );
      },
    );
  }

  private prevVisibleClusterChange?: Disposer;

  public setVisibleCluster(clusterId: ClusterId | null) {
    // Clear the previous when ASAP
    this.prevVisibleClusterChange?.();

    this.dependencies.logger.info(`[LENS-VIEW]: refreshing iframe views, visible cluster id=${clusterId}`);
    this.dependencies.sendSetVisibleCluster({ action: "clear" });

    for (const { frame: view } of this.views.values()) {
      view.classList.add("hidden");
    }

    const cluster = clusterId
      ? this.dependencies.getClusterById(clusterId)
      : undefined;

    if (cluster && clusterId) {
      this.prevVisibleClusterChange = onceDefined(
        () => {
          const view = this.views.get(clusterId);

          if (cluster.available && cluster.ready && view?.isLoaded) {
            return view;
          }

          return undefined;
        },
        (view: LensView) => {
          this.dependencies.logger.info(`[LENS-VIEW]: cluster id=${clusterId} should now be visible`);
          view.frame.classList.remove("hidden");
          this.dependencies.sendSetVisibleCluster({ action: "set", clusterId });
        },
      );
    }
  }

  public clearVisibleCluster() {
    this.setVisibleCluster(null);
  }
}
