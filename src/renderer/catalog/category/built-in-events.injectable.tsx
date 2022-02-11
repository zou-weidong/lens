/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import kubernetesClusterCategoryInjectable from "../../../common/catalog/category/declarations/kubernetes-cluster.injectable";
import webLinkCatalogCategoryInjectable from "../../../common/catalog/category/declarations/web-link.injectable";
import { addClusterURL } from "../../../common/routes";
import isLinuxInjectable from "../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import commandOverlayInjectable from "../../components/command-palette/command-overlay.injectable";
import weblinkStoreInjectable from "../../weblinks/store.injectable";
import addSyncEntriesInjectable from "./helpers/add-sync-entries.injectable";
import { WeblinkAddCommand } from "../../components/catalog-entities/weblink-add-command";
import onClusterDeleteInjectable from "./helpers/on-cluster-delete.injectable";
import pickPathsInjectable from "../../components/path-picker/pick.injectable";
import productNameInjectable from "../../../common/vars/product-name.injectable";

const builtInCategoryEventsInjectable = getInjectable({
  setup: async (di) => {
    const kubernetesClusterCategory = await di.inject(kubernetesClusterCategoryInjectable);
    const isWindows = await di.inject(isWindowsInjectable);
    const isLinux = await di.inject(isLinuxInjectable);
    const addSyncEntries = await di.inject(addSyncEntriesInjectable);
    const onClusterDelete = await di.inject(onClusterDeleteInjectable);
    const pickPaths = await di.inject(pickPathsInjectable);
    const productName = await di.inject(productNameInjectable);

    kubernetesClusterCategory
      .on("catalogAddMenu", ctx => {
        ctx.menuItems.push(
          {
            icon: "text_snippet",
            title: "Add from kubeconfig",
            onClick: () => ctx.navigate(addClusterURL()),
          },
        );

        if (isWindows || isLinux) {
          ctx.menuItems.push(
            {
              icon: "create_new_folder",
              title: "Sync kubeconfig folder(s)",
              defaultAction: true,
              onClick: () => pickPaths({
                label: "Sync folder(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openDirectory"],
                onPick: addSyncEntries,
              }),
            },
            {
              icon: "note_add",
              title: "Sync kubeconfig file(s)",
              onClick: () => pickPaths({
                label: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile"],
                onPick: addSyncEntries,
              }),
            },
          );
        } else {
          ctx.menuItems.push(
            {
              icon: "create_new_folder",
              title: "Sync kubeconfig(s)",
              defaultAction: true,
              onClick: () => pickPaths({
                label: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile", "openDirectory"],
                onPick: addSyncEntries,
              }),
            },
          );
        }
      })
      .on("contextMenuOpen", (entity, ctx) => {
        if (entity.metadata?.source == "local") {
          ctx.menuItems.push({
            title: "Remove",
            icon: "delete",
            onClick: () => onClusterDelete(entity.getId()),
          });
        }
      });

    const webLinkCatalogCategory = await di.inject(webLinkCatalogCategoryInjectable);
    const weblinkStore = await di.inject(weblinkStoreInjectable);
    const commandOverlay = await di.inject(commandOverlayInjectable);

    webLinkCatalogCategory
      .on("contextMenuOpen", (entity, ctx) => {
        if (entity.metadata.source === "local") {
          ctx.menuItems.push({
            title: "Delete",
            icon: "delete",
            onClick: () => weblinkStore.removeById(entity.getId()),
            confirm: {
              message: `Remove Web Link "${entity.getName()}" from ${productName}?`,
            },
          });
        }
      })
      .on("catalogAddMenu", ctx => {
        ctx.menuItems.push({
          title: "Add web link",
          icon: "public",
          onClick: () => commandOverlay.open(<WeblinkAddCommand />),
        });
      });
  },
  instantiate: () => undefined,
  id: "built-in-category-events",
});

export default builtInCategoryEventsInjectable;
