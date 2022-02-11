/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./preferences.scss";

import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { RouteProps } from "react-router";
import { matchPath, Redirect, Route, Switch } from "react-router";
import {
  appRoute,
  appURL,
  editorURL,
  extensionRoute,
  extensionURL,
  kubernetesRoute,
  kubernetesURL,
  preferencesURL,
  proxyRoute,
  proxyURL,
  editorRoute,
  telemetryRoute,
  telemetryURL,
  terminalRoute,
  terminalURL,
} from "../../../common/routes";
import { SettingLayout } from "../layout/setting-layout";
import { Tab, Tabs } from "../tabs";
import { Application } from "./application";
import { Kubernetes } from "./kubernetes";
import { Editor } from "./editor";
import { Terminal } from "./terminal";
import { LensProxy } from "./proxy";
import { Telemetry } from "./telemetry";
import { Extensions } from "./extensions";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { RegisteredAppPreference } from "./app-preferences.injectable";
import appPreferencesInjectable from "./app-preferences.injectable";
import type { ObservableHistory } from "mobx-observable-history";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import sentryDsnInjectable from "../../../common/vars/sentry-dsn.injectable";
import type { NavigateWithoutHistoryChange } from "../../navigation/navigate-without-history-change.injectable";
import navigateWithoutHistoryChangeInjectable from "../../navigation/navigate-without-history-change.injectable";

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
  sentryDsn: string;
  navigation: ObservableHistory;
  navigateWithoutHistoryChange: NavigateWithoutHistoryChange;
}

const NonInjectedPreferences = observer(({
  appPreferenceItems,
  sentryDsn,
  navigation,
  navigateWithoutHistoryChange,
}: Dependencies) => {
  const currentLocation = navigation.location.pathname;
  const isActive = (route: RouteProps) => !!matchPath(currentLocation, { path: route.path, exact: route.exact });
  const extensions = appPreferenceItems.get();
  const telemetryExtensions = extensions.filter(e => e.showInPreferencesTab == "telemetry");

  return (
    <SettingLayout
      navigation={(
        <Tabs className="flex column" scrollable={false} onChange={(url) => navigateWithoutHistoryChange({ pathname: url })}>
          <div className="header">Preferences</div>
          <Tab value={appURL()} label="Application" data-testid="application-tab" active={isActive(appRoute)}/>
          <Tab value={proxyURL()} label="Proxy" data-testid="proxy-tab" active={isActive(proxyRoute)}/>
          <Tab value={kubernetesURL()} label="Kubernetes" data-testid="kubernetes-tab" active={isActive(kubernetesRoute)}/>
          <Tab value={editorURL()} label="Editor" data-testid="editor-tab" active={isActive(editorRoute)}/>
          <Tab value={terminalURL()} label="Terminal" data-testid="terminal-tab" active={isActive(terminalRoute)}/>
          {(telemetryExtensions.length > 0 || !!sentryDsn) && (
            <Tab value={telemetryURL()} label="Telemetry" data-testid="telemetry-tab" active={isActive(telemetryRoute)}/>
          )}
          {extensions.filter(e => !e.showInPreferencesTab).length > 0 && (
            <Tab value={extensionURL()} label="Extensions" data-testid="extensions-tab" active={isActive(extensionRoute)}/>
          )}
        </Tabs>
      )}
      className="Preferences"
      contentGaps={false}
    >
      <Switch>
        <Route path={appURL()} component={Application}/>
        <Route path={proxyURL()} component={LensProxy}/>
        <Route path={kubernetesURL()} component={Kubernetes}/>
        <Route path={editorURL()} component={Editor}/>
        <Route path={terminalURL()} component={Terminal}/>
        <Route path={telemetryURL()} component={Telemetry}/>
        <Route path={extensionURL()} component={Extensions}/>
        <Redirect exact from={`${preferencesURL()}/`} to={appURL()}/>
      </Switch>
    </SettingLayout>
  );
});

export const Preferences = withInjectables<Dependencies>(NonInjectedPreferences, {
  getProps: (di) => ({
    appPreferenceItems: di.inject(appPreferencesInjectable),
    navigation: di.inject(observableHistoryInjectable),
    sentryDsn: di.inject(sentryDsnInjectable),
    navigateWithoutHistoryChange: di.inject(navigateWithoutHistoryChangeInjectable),
  }),
});
