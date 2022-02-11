/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./setting-layout.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { catalogURL } from "../../../common/routes";
import { CloseButton } from "./close-button";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ObservableHistory } from "mobx-observable-history";
import type { AddWindowEventListener } from "../../window/event-listener.injectable";
import addWindowEventListenerInjectable from "../../window/event-listener.injectable";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";

export interface SettingLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  contentClass?: IClassName;
  provideBackButtonNavigation?: boolean;
  contentGaps?: boolean;
  navigation?: React.ReactNode;
  back?: (evt: React.MouseEvent | KeyboardEvent) => void;
}

interface Dependencies {
  history: ObservableHistory;
  addWindowEventListener: AddWindowEventListener;
}

const NonInjectedSettingLayout = observer(({
  history,
  addWindowEventListener,
  className,
  contentClass,
  provideBackButtonNavigation = true,
  contentGaps = true,
  navigation,
  back = () => {
    if (history.length <= 1) {
      history.push(catalogURL());
    } else {
      history.goBack();
    }
  },
  children,
  ...elemProps
}: Dependencies & SettingLayoutProps) => {
  useEffect(() => {
    const { hash } = window.location;

    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
    }

    return addWindowEventListener("keydown", (event) => {
      if (!provideBackButtonNavigation) {
        return;
      }

      if (event.code === "Escape") {
        event.stopPropagation();
        back(event);
      }
    });
  });


  return (
    <div
      className={cssNames("SettingLayout", { showNavigation: navigation }, className)}
      {...elemProps}
    >
      { navigation && (
        <nav className="sidebarRegion">
          <div className="sidebar">
            {navigation}
          </div>
        </nav>
      )}
      <div className="contentRegion" id="ScrollSpyRoot">
        <div className={cssNames("content", contentClass, contentGaps && "flex column gaps")}>
          {children}
        </div>
        <div className="toolsRegion">
          {
            provideBackButtonNavigation && (
              <div className="fixed top-[60px]">
                <CloseButton onClick={back}/>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
});

/**
 * Layout for settings like pages with navigation
 */
export const SettingLayout = withInjectables<Dependencies, SettingLayoutProps>(NonInjectedSettingLayout, {
  getProps: (di, props) => ({
    ...props,
    addWindowEventListener: di.inject(addWindowEventListenerInjectable),
    history: di.inject(observableHistoryInjectable),
  }),
});
