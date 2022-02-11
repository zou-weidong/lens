/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsRendererApi from "../extensions/renderer-api";
import { render, unmountComponentAtNode } from "react-dom";
import { delay } from "../common/utils";
import { HelmRepoManager } from "../main/helm/helm-repo-manager";
import { DefaultProps } from "./mui-base-theme";
import configurePackages from "../common/configure-packages";
import * as initializers from "./initializers";
import { registerCustomThemes } from "./components/monaco-editor";
import { getDi } from "./getDi";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { DiContainer } from "@ogre-tools/injectable";
import initClusterFrameInjectable from "./frames/cluster-frame/init.injectable";
import initSentryInjectable from "../common/error-reporting/init-sentry.injectable";
import childLoggerInjectable from "../common/logger/child-logger.injectable";
import isMacInjectable from "../common/vars/is-mac.injectable";
import isDevelopmentInjectable from "../common/vars/is-development.injectable";

configurePackages(); // global packages
registerCustomThemes(); // monaco editor themes

export async function bootstrap(di: DiContainer) {
  await di.runSetups();

  if (process.isMainFrame) {
    const initSentry = di.inject(initSentryInjectable);

    initSentry();
  }

  const rootElem = document.getElementById("app");
  const frameName = process.isMainFrame ? "ROOT" : "CLUSTER";
  const logger = di.inject(childLoggerInjectable, {
    prefix: `BOOTSTRAP-${frameName}-FRAME`,
  });
  const isMac = di.inject(isMacInjectable);
  const isDevelopment = di.inject(isDevelopmentInjectable);

  /**
   * If this is a development build, wait a second to attach
   * Chrome Debugger to renderer process
   * https://stackoverflow.com/questions/52844870/debugging-electron-renderer-process-with-vscode
   */
  if (isDevelopment) {
    await delay(1000);
  }

  rootElem.classList.toggle("is-mac", isMac);

  logger.info(`initializing Registries`);
  initializers.initRegistries();

  logger.info(`initializing EntitySettingsRegistry`);
  initializers.initEntitySettingsRegistry();

  logger.info(`initializing KubeObjectDetailRegistry`);
  initializers.initKubeObjectDetailRegistry();

  logger.info(`initializing CatalogEntityDetailRegistry`);
  initializers.initCatalogEntityDetailRegistry();

  HelmRepoManager.createInstance(); // initialize the manager

  let App;

  // TODO: Introduce proper architectural boundaries between root and cluster iframes
  if (process.isMainFrame) {
    App = (await import("./frames/root-frame/root-frame")).RootFrame;
  } else {
    const initializeApp = di.inject(initClusterFrameInjectable);

    App = (await import("./frames/cluster-frame/cluster-frame")).ClusterFrame;

    try {
      await initializeApp();
    } catch (error) {
      logger.error(`view initialization error`, {
        error,
        origin: location.href,
        isTopFrameView: process.isMainFrame,
      });
    }
  }

  window.addEventListener("beforeunload", () => {
    unmountComponentAtNode(rootElem);
  });

  render(
    <DiContextProvider value={{ di }}>
      {DefaultProps(App)}
    </DiContextProvider>,
    rootElem,
  );
}

// run
bootstrap(getDi());

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
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
