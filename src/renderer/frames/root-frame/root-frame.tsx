/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect } from "react";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { ClusterManager } from "../../components/cluster-manager";
import { ErrorBoundary } from "../../components/error-boundary";
import { ConfirmDialog } from "../../components/confirm-dialog/view";
import { CommandContainer } from "../../components/command-palette/command-container";
import historyInjectable from "../../navigation/history.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { History } from "history";
import type { WindowLoaded } from "../../../common/ipc/window/loaded.token";
import emitWindowLoadedInjectable from "../../ipc/window/loaded.injectable";
import { NotificationsList } from "../../components/notifications/list";
import type { LoadExtensions } from "./load-extensions.injectable";
import type { LensLogger } from "../../../common/logger";
import initCatalogEntityRunListenerInjectable from "../../ipc/catalog/listeners/entity-run.injectable";
import initUpdateAvailableListenerInjectable from "../../ipc/updates/listeners/available.injectable";
import initUpdateCheckingListenerInjectable from "../../ipc/updates/listeners/checking.injectable";
import initUpdateNotAvailableListenerInjectable from "../../ipc/updates/listeners/not-available.injectable";
import initNavigateInAppListenerInjectable from "../../ipc/window/listeners/navigate-in-app.injectable";
import initNetworkEmittersInjectable from "../../window/init-network-emitters.injectable";
import initVisibleClusterChangedInjectable from "../../window/init-visible-cluster-change.injectable";
import loadExtensionsInjectable from "./load-extensions.injectable";
import rootFrameLoggerInjectable from "./logger.injectable";

interface Dependencies {
  history: History;
  emitWindowLoaded: WindowLoaded;
  loadExtensions: LoadExtensions;
  initCatalogEnityRunListener: () => void;
  initUpdateAvailableListener: () => void;
  initUpdateCheckingListener: () => void;
  initUpdateNotAvailableListener: () => void;
  initVisibleClusterChanged: () => void;
  initNavigateInAppListener: () => void;
  initNetworkEmitters: () => void;
  logger: LensLogger;
}

const NonInjectedRootFrame = observer(({
  history,
  emitWindowLoaded,
  loadExtensions,
  initCatalogEnityRunListener,
  initUpdateAvailableListener,
  initUpdateCheckingListener,
  initUpdateNotAvailableListener,
  initVisibleClusterChanged,
  initNavigateInAppListener,
  initNetworkEmitters,
  logger,
}: Dependencies) => {
  useEffect(() => {
    logger.info("Initializing root app");
    initCatalogEnityRunListener();
    initUpdateAvailableListener();
    initUpdateCheckingListener();
    initUpdateNotAvailableListener();
    initVisibleClusterChanged();
    initNavigateInAppListener();
    initNetworkEmitters();
    loadExtensions();

    /**
     * Both the `setTimeout` and `window.requestAnimationFrame` are required for
     * the final callback to be invoked only after React has fully flushed
     * the first render draw to the screen.
     */
    setTimeout(() => {
      window.requestAnimationFrame(() => {
        emitWindowLoaded();
      });
    });
  }, []);

  return (
    <Router history={history}>
      <ErrorBoundary>
        <Switch>
          <Route component={ClusterManager} />
        </Switch>
      </ErrorBoundary>
      <NotificationsList />
      <ConfirmDialog />
      <CommandContainer />
    </Router>
  );
});

export const RootFrame = withInjectables<Dependencies>(NonInjectedRootFrame, {
  getProps: (di) => ({
    history: di.inject(historyInjectable),
    emitWindowLoaded: di.inject(emitWindowLoadedInjectable),
    loadExtensions: di.inject(loadExtensionsInjectable),
    initCatalogEnityRunListener: di.inject(initCatalogEntityRunListenerInjectable),
    initNavigateInAppListener: di.inject(initNavigateInAppListenerInjectable),
    initNetworkEmitters: di.inject(initNetworkEmittersInjectable),
    initUpdateAvailableListener: di.inject(initUpdateAvailableListenerInjectable),
    initUpdateCheckingListener: di.inject(initUpdateCheckingListenerInjectable),
    initUpdateNotAvailableListener: di.inject(initUpdateNotAvailableListenerInjectable),
    initVisibleClusterChanged: di.inject(initVisibleClusterChangedInjectable),
    logger: di.inject(rootFrameLoggerInjectable),
  }),
});
