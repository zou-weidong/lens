/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app, BrowserWindow, dialog } from "electron";
import windowStateKeeper from "electron-window-state";
import type { AppEventBus } from "../../common/app-event-bus/event-bus";
import { delay, openBrowser } from "../../common/utils";
import type { ClusterFrameInfo } from "../clusters/frames.injectable";
import type TypedEventEmitter from "typed-emitter";
import type { BundledExtensionsEvents } from "../extensions/bundled-loaded.injectable";
import type { LensLogger } from "../../common/logger";
import type { IComputedValue } from "mobx";

function isHideable(window: BrowserWindow | null): boolean {
  return Boolean(window && !window.isDestroyed());
}

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: any[];
}

export interface WindowManagerDependencies {
  readonly bundledExtensionsEmitter: TypedEventEmitter<BundledExtensionsEvents>;
  readonly appEventBus: AppEventBus;
  readonly mainContentUrl: IComputedValue<string>;
  readonly logger: LensLogger;
  readonly isMac: boolean;
  readonly productName: string;
}

export class WindowManager {
  protected mainWindow?: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected windowState: windowStateKeeper.State;
  protected disposers: Record<string, Function> = {};

  constructor(protected readonly dependencies: WindowManagerDependencies) {}

  private async initMainWindow(showSplash: boolean) {
    // Manage main window size and position with state persistence
    if (!this.windowState) {
      this.windowState = windowStateKeeper({
        defaultHeight: 900,
        defaultWidth: 1440,
      });
    }

    if (!this.mainWindow) {
      // show icon in dock (mac-os only)
      app.dock?.show();

      const { width, height, x, y } = this.windowState;

      this.mainWindow = new BrowserWindow({
        x, y, width, height,
        title: this.dependencies.productName,
        show: false,
        minWidth: 700,  // accommodate 800 x 600 display minimum
        minHeight: 500, // accommodate 800 x 600 display minimum
        titleBarStyle: this.dependencies.isMac ? "hiddenInset" : "hidden",
        frame: this.dependencies.isMac,
        backgroundColor: "#1e2124",
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          webviewTag: true,
          contextIsolation: false,
          nativeWindowOpen: false,
        },
      });
      this.windowState.manage(this.mainWindow);

      // open external links in default browser (target=_blank, window.open)
      this.mainWindow
        .on("focus", () => {
          this.dependencies.appEventBus.emit({ name: "app", action: "focus" });
        })
        .on("blur", () => {
          this.dependencies.appEventBus.emit({ name: "app", action: "blur" });
        })
        .on("closed", () => {
          // clean up
          this.windowState.unmanage();
          this.mainWindow = null;
          this.splashWindow = null;
          app.dock?.hide(); // hide icon in dock (mac-os)
        })
        .webContents
        .on("dom-ready", () => {
          this.dependencies.appEventBus.emit({ name: "app", action: "dom-ready" });
        })
        .on("did-fail-load", (_event, code, desc) => {
          this.dependencies.logger.error(`Failed to load Main window`, { code, desc });
        })
        .on("did-finish-load", () => {
          this.dependencies.logger.info("Main window loaded");
        })
        .on("will-attach-webview", (event, webPreferences, params) => {
          this.dependencies.logger.debug("Attaching webview");
          // Following is security recommendations because we allow webview tag (webviewTag: true)
          // suggested by https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
          // and https://www.electronjs.org/docs/tutorial/security#10-do-not-use-allowpopups

          if (webPreferences.preload) {
            this.dependencies.logger.warn("Strip away preload scripts of webview");
            delete webPreferences.preload;
          }

          // @ts-expect-error some electron version uses webPreferences.preloadURL/webPreferences.preload
          if (webPreferences.preloadURL) {
            this.dependencies.logger.warn("Strip away preload scripts of webview");
            delete webPreferences.preload;
          }

          if (params.allowpopups) {
            this.dependencies.logger.warn("We do not allow allowpopups props, stop webview from renderer");

            // event.preventDefault() will destroy the guest page.
            event.preventDefault();

            return;
          }

          // Always disable Node.js integration for all webviews
          webPreferences.nodeIntegration = false;
        })
        .setWindowOpenHandler((details) => {
          openBrowser(details.url).catch(error => {
            this.dependencies.logger.error("failed to open browser", { error });
          });

          return { action: "deny" };
        });
    }

    try {
      if (showSplash) {
        await this.showSplash();
      }

      const url = this.dependencies.mainContentUrl.get();

      this.dependencies.logger.info(`Loading Main window from url: ${url} ...`);
      await this.mainWindow.loadURL(url);
    } catch (error) {
      this.dependencies.logger.error("Loading main window failed", { error });
      dialog.showErrorBox("ERROR!", error.toString());
    }
  }

  async ensureMainWindow(showSplash = true): Promise<BrowserWindow> {
    // This needs to be ready to hear the IPC message before the window is loaded
    let viewHasLoaded = Promise.resolve();

    if (!this.mainWindow) {
      viewHasLoaded = new Promise<void>(resolve => {
        const timeoutId = setTimeout(() => showWindow(true), 10_000);

        const showWindow = (showWarning = false) => {
          resolve();
          this.dependencies.bundledExtensionsEmitter.off("loaded", showWindow);
          clearTimeout(timeoutId);

          if (showWarning) {
            dialog.showErrorBox(
              "Failed to load bundled extensions",
              "The loading of bundled extensions took too long, some functionality may not be availble",
            );
          }
        };

        this.dependencies.bundledExtensionsEmitter.once("loaded", showWindow);

      });
      await this.initMainWindow(showSplash);
    }

    try {
      await viewHasLoaded;
      await delay(50); // wait just a bit longer to let the first round of rendering happen
      this.dependencies.logger.info("Main window has reported that it has loaded");

      this.mainWindow.show();
      this.splashWindow?.close();
      this.splashWindow = undefined;
      setTimeout(() => {
        this.dependencies.appEventBus.emit({ name: "app", action: "start" });
      }, 1000);
    } catch (error) {
      this.dependencies.logger.error(`Showing main window failed: ${error.stack || error}`);
      dialog.showErrorBox("ERROR!", error.toString());
    }

    return this.mainWindow;
  }

  async showSplash() {
    if (!this.splashWindow) {
      this.splashWindow = new BrowserWindow({
        width: 500,
        height: 300,
        backgroundColor: "#1e2124",
        center: true,
        frame: false,
        resizable: false,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          nodeIntegrationInSubFrames: true,
          nativeWindowOpen: true,
        },
      });
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  hide() {
    if (isHideable(this.mainWindow)) {
      this.mainWindow.hide();
    }

    if (isHideable(this.splashWindow)) {
      this.splashWindow.hide();
    }
  }

  destroy() {
    this.mainWindow.destroy();
    this.splashWindow.destroy();
    this.mainWindow = null;
    this.splashWindow = null;
    Object.entries(this.disposers).forEach(([name, dispose]) => {
      dispose();
      delete this.disposers[name];
    });
  }
}
