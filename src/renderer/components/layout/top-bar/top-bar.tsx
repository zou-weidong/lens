/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./top-bar.module.scss";
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { Icon } from "../../icon";
import { catalogRoute, catalogURL } from "../../../../common/routes";
import { cssNames } from "../../../utils";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TopBarRegistration } from "./top-bar-registration";
import isLinuxInjectable from "../../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import type { Navigate } from "../../../navigation/navigate.injectable";
import type { TopBarState } from "./state.injectable";
import navigateInjectable from "../../../navigation/navigate.injectable";
import topBarStateInjectable from "./state.injectable";
import type { TriggerWindowAction } from "../../../../common/ipc/window/trigger-action.token";
import { WindowAction } from "../../../../common/ipc/window/trigger-action.token";
import type { WindowOpenAppContextMenu } from "../../../../common/ipc/window/open-app-context-menu.token";
import type { WatchLocation } from "../../../ipc/history/helpers/watch-location.injectable";
import watchLocationInjectable from "../../../ipc/history/helpers/watch-location.injectable";
import windowOpenAppContextMenuInjectable from "../../../ipc/window/open-app-context-menu.injectable";
import triggerWindowActionInjectable from "../../../ipc/window/trigger-action.injectable";
import type { IsRouteActive } from "../../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../../navigation/is-route-active.injectable";

export interface TopBarProps {}

interface Dependencies {
  items: IComputedValue<TopBarRegistration[]>;
  isWindows: boolean;
  isLinux: boolean;
  navigate: Navigate;
  state: TopBarState;
  triggerWindowAction: TriggerWindowAction;
  openAppContextMenu: WindowOpenAppContextMenu;
  watchLocation: WatchLocation;
  isRouteActive: IsRouteActive;
}

const NonInjectedTopBar = observer(({
  items,
  isWindows,
  isLinux,
  navigate,
  state,
  triggerWindowAction,
  openAppContextMenu,
  watchLocation,
  isRouteActive,
  ...rest
}: TopBarProps & Dependencies) => {
  const elem = useRef<HTMLDivElement>();

  const goHome = () => navigate(catalogURL());
  const goBack = () => triggerWindowAction(WindowAction.GO_BACK);
  const goForward = () => triggerWindowAction(WindowAction.GO_FORWARD);
  const minimizeWindow = () => triggerWindowAction(WindowAction.MINIMIZE);
  const toggleMaximize = () => triggerWindowAction(WindowAction.TOGGLE_MAXIMIZE);
  const closeWindow = () => triggerWindowAction(WindowAction.CLOSE);

  const windowSizeToggle = (evt: React.MouseEvent) => {
    if (elem.current === evt.target) {
      toggleMaximize();
    }
  };

  useEffect(watchLocation, []);

  return (
    <div className={styles.topBar} onDoubleClick={windowSizeToggle} ref={elem}>
      <div className={styles.items}>
        {(isWindows || isLinux) && (
          <div className={styles.winMenu}>
            <div onClick={openAppContextMenu} data-testid="window-menu">
              <svg width="12" height="12" viewBox="0 0 12 12" shapeRendering="crispEdges">
                <path fill="currentColor" d="M0,8.5h12v1H0V8.5z"/>
                <path fill="currentColor" d="M0,5.5h12v1H0V5.5z"/>
                <path fill="currentColor" d="M0,2.5h12v1H0V2.5z"/>
              </svg>
            </div>
          </div>
        )}
        <Icon
          data-testid="home-button"
          material="home"
          onClick={goHome}
          disabled={isRouteActive(catalogRoute)}
        />
        <Icon
          data-testid="history-back"
          material="arrow_back"
          onClick={goBack}
          disabled={!state.prevEnabled}
        />
        <Icon
          data-testid="history-forward"
          material="arrow_forward"
          onClick={goForward}
          disabled={!state.nextEnabled}
        />
      </div>
      <div className={styles.items}>
        {renderRegisteredItems(items.get())}
        {(isWindows || isLinux) && (
          <div className={cssNames(styles.windowButtons, { [styles.linuxButtons]: isLinux })}>
            <div className={styles.minimize} data-testid="window-minimize" onClick={minimizeWindow}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect fill="currentColor" width="10" height="1" x="1" y="9" />
              </svg>
            </div>
            <div className={styles.maximize} data-testid="window-maximize" onClick={toggleMaximize}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
              </svg>
            </div>
            <div className={styles.close} data-testid="window-close" onClick={closeWindow}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <polygon fill="currentColor" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const renderRegisteredItems = (items: TopBarRegistration[]) => (
  items.map((registration, index) => {
    if (!registration?.components?.Item) {
      return null;
    }

    return <registration.components.Item key={index} />;
  })
);

export const TopBar = withInjectables<Dependencies, TopBarProps>(NonInjectedTopBar, {
  getProps: (di, props) => ({
    ...props,
    items: di.inject(topBarItemsInjectable),
    isLinux: di.inject(isLinuxInjectable),
    isWindows: di.inject(isWindowsInjectable),
    navigate: di.inject(navigateInjectable),
    state: di.inject(topBarStateInjectable),
    watchLocation: di.inject(watchLocationInjectable),
    openAppContextMenu: di.inject(windowOpenAppContextMenuInjectable),
    triggerWindowAction: di.inject(triggerWindowActionInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
