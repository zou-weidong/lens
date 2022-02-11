/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { SubTitle } from "../layout/sub-title";
import type { SelectOption } from "../select";
import { Select } from "../select";
import { Input } from "../input";
import { Switch } from "../switch";
import moment from "moment-timezone";
import { CONSTANTS, defaultExtensionRegistryUrl, ExtensionRegistryLocation } from "../../../common/user-preferences/preferences-helpers";
import type { IComputedValue } from "mobx";
import { isUrl } from "../input/input_validators";
import { ExtensionSettings } from "./extension-settings";
import type { RegisteredAppPreference } from "./app-preferences.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import appPreferencesInjectable from "./app-preferences.injectable";
import type { ExtensionRegistryUrl } from "../../../common/user-preferences/extension-registry.injectable";
import extensionRegistryUrlInjectable from "../../../common/user-preferences/extension-registry.injectable";
import type { OpenAtLogin } from "../../../common/user-preferences/open-at-login.injectable";
import type { ActiveThemeId } from "../../../common/user-preferences/active-theme-id.injectable";
import type { UpdateChannel } from "../../../common/user-preferences/update-channel.injectable";
import activeThemeIdInjectable from "../../../common/user-preferences/active-theme-id.injectable";
import openAtLoginInjectable from "../../../common/user-preferences/open-at-login.injectable";
import themeOptionsInjectable from "./theme-options.injectable";
import updateChannelInjectable from "../../../common/user-preferences/update-channel.injectable";
import type { LocaleTimezone } from "../../../common/user-preferences/locale-timezone.injectable";
import localeTimezoneInjectable from "../../../common/user-preferences/locale-timezone.injectable";
import { systemThemeMatchId } from "../../themes/theme";

const timezoneOptions: SelectOption<string>[] = moment.tz.names().map(zone => ({
  label: zone,
  value: zone,
}));
const updateChannelOptions: SelectOption<string>[] = Array.from(
  CONSTANTS.updateChannels.entries(),
  ([value, { label }]) => ({ value, label }),
);

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
  extensionRegistryUrl: ExtensionRegistryUrl;
  themeOptions: IComputedValue<SelectOption<string>[]>;
  activeThemeId: ActiveThemeId;
  openAtLogin: OpenAtLogin;
  updateChannel: UpdateChannel;
  localeTimezone: LocaleTimezone;
}

const NonInjectedApplication = observer(({
  appPreferenceItems,
  extensionRegistryUrl,
  themeOptions,
  activeThemeId,
  openAtLogin,
  updateChannel,
  localeTimezone,
}: Dependencies) => {
  const [customUrl, setCustomUrl] = React.useState(extensionRegistryUrl.value.customUrl || "");
  const extensionSettings = appPreferenceItems.get().filter((preference) => preference.showInPreferencesTab === "application");

  return (
    <section id="application">
      <h2 data-testid="application-header">Application</h2>
      <section id="appearance">
        <SubTitle title="Theme" />
        <Select
          options={[
            { label: "Sync with computer", value: systemThemeMatchId },
            ...themeOptions.get(),
          ]}
          value={activeThemeId.value}
          onChange={({ value }) => activeThemeId.set(value)}
          themeName="lens"
        />
      </section>

      <hr/>

      <section id="extensionRegistryUrl">
        <SubTitle title="Extension Install Registry" />
        <Select
          options={Object.values(ExtensionRegistryLocation)}
          value={extensionRegistryUrl.value.location}
          onChange={({ value }) => extensionRegistryUrl.setLocation(value)}
          themeName="lens"
        />
        <p className="mt-4 mb-5 leading-relaxed">
          This setting is to change the registry URL for installing extensions by name.{" "}
          If you are unable to access the default registry ({defaultExtensionRegistryUrl}){" "}
          you can change it in your <b>.npmrc</b>&nbsp;file or in the input below.
        </p>

        <Input
          theme="round-black"
          validators={isUrl}
          value={customUrl}
          onChange={setCustomUrl}
          onBlur={() => extensionRegistryUrl.setUrl(customUrl)}
          placeholder="Custom Extension Registry URL..."
          disabled={extensionRegistryUrl.value.location !== ExtensionRegistryLocation.CUSTOM}
        />
      </section>

      <hr />

      <section id="other">
        <SubTitle title="Start-up" />
        <Switch
          checked={openAtLogin.value}
          onChange={openAtLogin.toggle}
        >
          Automatically start Lens on login
        </Switch>
      </section>

      <hr />

      {extensionSettings.map(setting => (
        <ExtensionSettings key={setting.id} setting={setting} size="normal" />
      ))}

      <section id="update-channel">
        <SubTitle title="Update Channel" />
        <Select
          options={updateChannelOptions}
          value={updateChannel.value}
          onChange={({ value }) => updateChannel.set(value)}
          themeName="lens"
        />
      </section>

      <hr />

      <section id="locale">
        <SubTitle title="Locale Timezone" />
        <Select
          options={timezoneOptions}
          value={localeTimezone.value}
          onChange={({ value }) => localeTimezone.set(value)}
          themeName="lens"
        />
      </section>
    </section>
  );
});

export const Application = withInjectables<Dependencies>(NonInjectedApplication, {
  getProps: (di) => ({
    appPreferenceItems: di.inject(appPreferencesInjectable),
    extensionRegistryUrl: di.inject(extensionRegistryUrlInjectable),
    activeThemeId: di.inject(activeThemeIdInjectable),
    openAtLogin: di.inject(openAtLoginInjectable),
    themeOptions: di.inject(themeOptionsInjectable),
    updateChannel: di.inject(updateChannelInjectable),
    localeTimezone: di.inject(localeTimezoneInjectable),
  }),
});
