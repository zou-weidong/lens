/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterModel, ClusterPreferences, ClusterPrometheusPreferences } from "../../../common/clusters/cluster-types";
import type { MigrationDeclaration } from "../../utils";
import path from "path";
import { moveSync, removeSync } from "fs-extra";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { generateNewIdFor } from "../../../common/utils";

function mergePrometheusPreferences(left: ClusterPrometheusPreferences, right: ClusterPrometheusPreferences): ClusterPrometheusPreferences {
  if (left.prometheus && left.prometheusProvider) {
    return {
      prometheus: left.prometheus,
      prometheusProvider: left.prometheusProvider,
    };
  }

  if (right.prometheus && right.prometheusProvider) {
    return {
      prometheus: right.prometheus,
      prometheusProvider: right.prometheusProvider,
    };
  }

  return {};
}

function mergePreferences(left: ClusterPreferences, right: ClusterPreferences): ClusterPreferences {
  return {
    terminalCWD: left.terminalCWD || right.terminalCWD || undefined,
    clusterName: left.clusterName || right.clusterName || undefined,
    iconOrder: left.iconOrder || right.iconOrder || undefined,
    icon: left.icon || right.icon || undefined,
    httpsProxy: left.httpsProxy || right.httpsProxy || undefined,
    hiddenMetrics: mergeSet(left.hiddenMetrics ?? [], right.hiddenMetrics ?? []),
    ...mergePrometheusPreferences(left, right),
  };
}

function mergeLabels(left: Record<string, string>, right: Record<string, string>): Record<string, string> {
  return {
    ...right,
    ...left,
  };
}

function mergeSet(...iterables: Iterable<string>[]): string[] {
  const res = new Set<string>();

  for (const iterable of iterables) {
    for (const val of iterable) {
      res.add(val);
    }
  }

  return [...res];
}

function mergeClusterModel(prev: ClusterModel, right: Omit<ClusterModel, "id">): ClusterModel {
  return {
    id: prev.id,
    kubeConfigPath: prev.kubeConfigPath,
    contextName: prev.contextName,
    preferences: mergePreferences(prev.preferences ?? {}, right.preferences ?? {}),
    metadata: prev.metadata,
    labels: mergeLabels(prev.labels ?? {}, right.labels ?? {}),
    accessibleNamespaces: mergeSet(prev.accessibleNamespaces ?? [], right.accessibleNamespaces ?? []),
    workspace: prev.workspace || right.workspace,
    workspaces: mergeSet([prev.workspace, right.workspace], prev.workspaces ?? [], right.workspaces ?? []),
  };
}

interface Dependencies {
  userDataPath: string;
}

const v500Beta13Migration = ({ userDataPath }: Dependencies): MigrationDeclaration => ({
  version: "5.0.0-beta.13",
  run(log, store) {
    const folder = path.resolve(userDataPath, "lens-local-storage");

    const oldClusters: ClusterModel[] = store.get("clusters") ?? [];
    const clusters = new Map<string, ClusterModel>();

    for (const { id: oldId, ...cluster } of oldClusters) {
      const newId = generateNewIdFor(cluster);

      if (clusters.has(newId)) {
        log(`Duplicate entries for ${newId}`, { oldId });
        clusters.set(newId, mergeClusterModel(clusters.get(newId), cluster));
      } else {
        log(`First entry for ${newId}`, { oldId });
        clusters.set(newId, {
          ...cluster,
          id: newId,
          workspaces: [cluster.workspace].filter(Boolean),
        });

        const oldPath = path.resolve(folder, `${oldId}.json`);
        const newPath = path.resolve(folder, `${newId}.json`);

        try {
          moveSync(oldPath, newPath);
        } catch (error) {
          if (String(error).includes("dest already exists")) {
            log(`Multiple old lens-local-storage files for newId=${newId}. Removing ${oldId}.json`);
            removeSync(oldPath);
          }
        }
      }
    }

    store.set("clusters", [...clusters.values()]);
  },
});

const v500Beta13MigrationInjectable = getInjectable({
  instantiate: (di) => v500Beta13Migration({
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  id: "cluster-store-v5.0.0-beta.13-migration",
});

export default v500Beta13MigrationInjectable;
