/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tab-layout.scss";

import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { ErrorBoundary } from "../error-boundary";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";

export interface TabLayoutProps {
  className?: IClassName;
  contentClass?: IClassName;
  tabs?: TabLayoutRoute[];
  children?: React.ReactNode | React.ReactNode[];
}

export interface TabLayoutRoute {
  routePath: string;
  title: React.ReactNode;
  component: React.ComponentType<any>;
  url?: string; // page-url, if not provided `routePath` is used (doesn't work when path has some :placeholder(s))
  exact?: boolean; // route-path matching rule
  default?: boolean; // initial tab to open with provided `url, by default tabs[0] is used
}

interface Dependencies {
  navigate: Navigate;
  isRouteActive: IsRouteActive;
}

function getDefaultOrFirst(tabs: TabLayoutRoute[]): TabLayoutRoute {
  return tabs.find(tab => tab.default) ?? tabs[0];
}

const NonInjectedTabLayout = observer(({
  className,
  contentClass,
  tabs = [],
  children,
  navigate,
  isRouteActive,
}: Dependencies & TabLayoutProps) => (
  <div className={cssNames("TabLayout", className)}>
    {tabs.length > 0 && (
      <Tabs center onChange={navigate}>
        {tabs.map(({ title, routePath, url = routePath, exact }) => (
          <Tab
            key={url}
            label={title}
            value={url}
            active={isRouteActive({ path: routePath, exact })}
          />
        ))}
      </Tabs>
    )}
    <main className={cssNames(contentClass)}>
      <ErrorBoundary>
        {tabs.length > 0 && (
          <Switch>
            {tabs.map(({ routePath, exact, component }) => (
              <Route
                key={routePath}
                exact={exact}
                path={routePath}
                component={component} />
            ))}
            <Redirect to={getDefaultOrFirst(tabs).url} />
          </Switch>
        )}
        {children}
      </ErrorBoundary>
    </main>
  </div>
));

export const TabLayout = withInjectables<Dependencies, TabLayoutProps>(NonInjectedTabLayout, {
  getProps: (di, props) => ({
    ...props,
    navigate: di.inject(navigateInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
