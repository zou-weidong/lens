/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import ReactDOM, { render, unmountComponentAtNode } from "react-dom";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsRendererApi from "../extensions/renderer-api";
import { delay } from "../common/utils";
import { isMac, isDevelopment } from "../common/vars";
import { DefaultProps } from "./mui-base-theme";
import configurePackages from "../common/configure-packages";
import * as initializers from "./initializers";
import logger from "../common/logger";
import { WeblinkStore } from "../common/weblink-store";
import { initializeSentryReporting } from "../common/sentry";
import { registerCustomThemes } from "./components/monaco-editor";
import { getDi } from "./getDi";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { DiContainer } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import extensionInstallationStateStoreInjectable from "../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import initRootFrameInjectable from "./frames/root-frame/init-root-frame/init-root-frame.injectable";
import initClusterFrameInjectable from "./frames/cluster-frame/init-cluster-frame/init-cluster-frame.injectable";
import commandOverlayInjectable from "./components/command-palette/command-overlay.injectable";
import { Router } from "react-router";
import historyInjectable from "./navigation/history.injectable";
import themeStoreInjectable from "./themes/store.injectable";
import navigateToAddClusterInjectable  from "../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import addSyncEntriesInjectable from "./initializers/add-sync-entries.injectable";
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import { bindEvents } from "./navigation/events";
import openDeleteClusterDialogInjectable from "./components/delete-cluster-dialog/open.injectable";
import { init } from "@sentry/electron/renderer";
import kubernetesClusterCategoryInjectable from "../common/catalog/categories/kubernetes-cluster.injectable";
import autoRegistrationInjectable from "../common/k8s-api/api-manager/auto-registration.injectable";
import assert from "assert";
import startFrameInjectable from "./start-frame/start-frame.injectable";
import entityPreferencesStoreInjectable from "../common/entity-preferences/store.injectable";

configurePackages(); // global packages
registerCustomThemes(); // monaco editor themes

/**
 * If this is a development build, wait a second to attach
 * Chrome Debugger to renderer process
 * https://stackoverflow.com/questions/52844870/debugging-electron-renderer-process-with-vscode
 */
async function attachChromeDebugger() {
  if (isDevelopment) {
    await delay(1000);
  }
}

export async function bootstrap(di: DiContainer) {
  if (process.isMainFrame) {
    initializeSentryReporting(init);
  }

  const startFrame = di.inject(startFrameInjectable);

  await startFrame();

  // TODO: Consolidate import time side-effect to setup time
  bindEvents();

  const rootElem = document.getElementById("app");
  const logPrefix = `[BOOTSTRAP-${process.isMainFrame ? "ROOT" : "CLUSTER"}-FRAME]:`;

  assert(rootElem, "#app MUST exist");


  /**
   * This is injected here to initialize it for the side effect.
   *
   * The side effect CANNOT be within `apiManagerInjectable` itself since that causes circular
   * dependencies with the current need for legacy di use.
   *
   * This also MUST be done before anything else so that it can start listening for the events for
   * auto initialization.
   */
  di.inject(autoRegistrationInjectable);

  // TODO: Remove temporal dependencies to make timing of initialization not important
  di.inject(userStoreInjectable);

  await attachChromeDebugger();
  rootElem.classList.toggle("is-mac", isMac);

  logger.info(`${logPrefix} initializing Registries`);
  initializers.initRegistries();

  logger.info(`${logPrefix} initializing EntitySettingsRegistry`);
  initializers.initEntitySettingsRegistry();

  logger.info(`${logPrefix} initializing KubeObjectDetailRegistry`);
  initializers.initKubeObjectDetailRegistry();

  logger.info(`${logPrefix} initializing CatalogEntityDetailRegistry`);
  initializers.initCatalogEntityDetailRegistry();

  logger.info(`${logPrefix} initializing CatalogCategoryRegistryEntries`);
  initializers.initCatalogCategoryRegistryEntries({
    navigateToAddCluster: di.inject(navigateToAddClusterInjectable),
    addSyncEntries: di.inject(addSyncEntriesInjectable),
    kubernetesClusterCategory: di.inject(kubernetesClusterCategoryInjectable),
  });

  logger.info(`${logPrefix} initializing Catalog`);
  initializers.initCatalog({
    openCommandDialog: di.inject(commandOverlayInjectable).open,
    openDeleteClusterDialog: di.inject(openDeleteClusterDialogInjectable),
  });

  const extensionLoader = di.inject(extensionLoaderInjectable);

  logger.info(`${logPrefix} initializing IpcRendererListeners`);
  initializers.initIpcRendererListeners(extensionLoader);

  extensionLoader.init();

  const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

  extensionDiscovery.init();

  // ClusterStore depends on: UserStore
  const clusterStore = di.inject(clusterStoreInjectable);

  await clusterStore.loadInitialOnRenderer();

  // TODO replace with the runMany
  di.inject(entityPreferencesStoreInjectable);

  // HotbarStore depends on: ClusterStore
  di.inject(hotbarStoreInjectable).load();

  // ThemeStore depends on: UserStore
  // TODO: Remove temporal dependencies
  di.inject(themeStoreInjectable);

  WeblinkStore.createInstance();

  const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);

  extensionInstallationStateStore.bindIpcListeners();

  // Register additional store listeners
  clusterStore.registerIpcListener();

  let App;
  let initializeApp;

  // TODO: Introduce proper architectural boundaries between root and cluster iframes
  if (process.isMainFrame) {
    initializeApp = di.inject(initRootFrameInjectable);
    App = (await import("./frames/root-frame/root-frame")).RootFrame;
  } else {
    initializeApp = di.inject(initClusterFrameInjectable);
    App = (await import("./frames/cluster-frame/cluster-frame")).ClusterFrame;
  }

  try {
    await initializeApp(() => unmountComponentAtNode(rootElem));
  } catch (error) {
    console.error(`[BOOTSTRAP]: view initialization error: ${error}`, {
      origin: location.href,
      isTopFrameView: process.isMainFrame,
    });
  }

  const history = di.inject(historyInjectable);

  render(
    <DiContextProvider value={{ di }}>
      <Router history={history}>
        {DefaultProps(App)}
      </Router>
    </DiContextProvider>,
    rootElem,
  );
}

const di = getDi();

// run
bootstrap(di);

/**
 * Exports for virtual package "@k8slens/extensions" for renderer-process.
 * All exporting names available in global runtime scope:
 * e.g. Devtools -> Console -> window.LensExtensions (renderer)
 */
const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Renderer: LensExtensionsRendererApi,
};

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
