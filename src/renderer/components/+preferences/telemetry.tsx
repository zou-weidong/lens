/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { Checkbox } from "../checkbox";
import { SubTitle } from "../layout/sub-title";
import { ExtensionSettings } from "./extension-settings";
import type { RegisteredAppPreference } from "./app-preferences.injectable";
import appPreferencesInjectable from "./app-preferences.injectable";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { AllowErrorReporting } from "../../../common/user-preferences/allow-error-reporting.injectable";
import allowErrorReportingInjectable from "../../../common/user-preferences/allow-error-reporting.injectable";
import sentryDsnInjectable from "../../../common/vars/sentry-dsn.injectable";

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
  sentryDsn: string;
  allowErrorReporting: AllowErrorReporting;
}

const NonInjectedTelemetry = observer(({
  appPreferenceItems,
  sentryDsn,
  allowErrorReporting,
}: Dependencies) => {
  const extensions = appPreferenceItems.get();
  const telemetryExtensions = extensions.filter(e => e.showInPreferencesTab == "telemetry");

  return (
    <section id="telemetry">
      <h2 data-testid="telemetry-header">Telemetry</h2>
      {telemetryExtensions.map((extension) => <ExtensionSettings key={extension.id} setting={extension} size="small" />)}
      {sentryDsn
        ? (
          <>
            <section id='sentry' className="small">
              <SubTitle title='Automatic Error Reporting' />
              <Checkbox
                label="Allow automatic error reporting"
                value={allowErrorReporting.value}
                onChange={allowErrorReporting.toggle}
              />
              <div className="hint">
                <span>
                  Automatic error reports provide vital information about issues and application crashes.{" "}
                  It is highly recommended to keep this feature enabled to ensure fast turnaround for issues you might encounter.
                </span>
              </div>
            </section>
            <hr className="small" />
          </>
        )
        : null // we don't need to shows the checkbox at all if Sentry dsn is not a valid url
      }
    </section>
  );
});

export const Telemetry = withInjectables<Dependencies>(NonInjectedTelemetry, {
  getProps: (di) => ({
    appPreferenceItems: di.inject(appPreferencesInjectable),
    allowErrorReporting: di.inject(allowErrorReportingInjectable),
    sentryDsn: di.inject(sentryDsnInjectable),
  }),
});
