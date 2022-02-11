/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../../../common/clusters/cluster-types";
import type { GetClusterById } from "../../../../common/clusters/get-by-id.injectable";
import type { ReadFile } from "../../../../common/fs/read-file.injectable";
import { loadConfigFromString } from "../../../../common/k8s/helpers";
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../../common/clusters/get-by-id.injectable";
import readFileInjectable from "../../../../common/fs/read-file.injectable";
import type { OpenDeleteClusterDialog } from "../../../components/delete-cluster-dialog/open.injectable";
import openDeleteClusterDialogInjectable from "../../../components/delete-cluster-dialog/open.injectable";

export type OnClusterDelete = (clusterId: ClusterId) => Promise<void>;

interface Dependencies {
  readFile: ReadFile;
  getClusterById: GetClusterById;
  openDeleteClusterDialog: OpenDeleteClusterDialog;
}

const onClusterDelete = ({
  getClusterById,
  readFile,
  openDeleteClusterDialog,
}: Dependencies): OnClusterDelete => (
  async (clusterId) => {
    const cluster = getClusterById(clusterId);

    if (!cluster) {
      return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
    }

    const { config, error } = loadConfigFromString(await readFile(cluster.kubeConfigPath, "utf-8"));

    if (error) {
      throw error;
    }

    openDeleteClusterDialog({ cluster, config });
  }
);

const onClusterDeleteInjectable = getInjectable({
  instantiate: (di) => onClusterDelete({
    getClusterById: di.inject(getClusterByIdInjectable),
    readFile: di.inject(readFileInjectable),
    openDeleteClusterDialog: di.inject(openDeleteClusterDialogInjectable),
  }),
  id: "on-cluster-delete",
});

export default onClusterDeleteInjectable;

