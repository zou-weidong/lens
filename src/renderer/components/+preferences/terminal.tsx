/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { SubTitle } from "../layout/sub-title";
import { Input, InputValidators } from "../input";
import { Switch } from "../switch";
import type { SelectOption } from "../select";
import { Select } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import type { IComputedValue } from "mobx";
import themeOptionsInjectable from "./theme-options.injectable";
import type { TerminalShell } from "../../../common/user-preferences/terminal-shell.injectable";
import type { TerminalCopyOnSelect } from "../../../common/user-preferences/terminal-copy-on-select.injectable";
import type { ActiveTerminalThemeId } from "../../../common/user-preferences/active-terminal-theme-id.injectable";
import type { TerminalConfig } from "../../../common/user-preferences/terminal-config.injectable";
import activeTerminalThemeIdInjectable from "../../../common/user-preferences/active-terminal-theme-id.injectable";
import terminalConfigInjectable from "../../../common/user-preferences/terminal-config.injectable";
import terminalCopyOnSelectInjectable from "../../../common/user-preferences/terminal-copy-on-select.injectable";
import terminalShellInjectable from "../../../common/user-preferences/terminal-shell.injectable";

interface Dependencies {
  isWindows: boolean;
  themeOptions: IComputedValue<SelectOption<string>[]>;
  terminalShell: TerminalShell;
  terminalCopyOnSelect: TerminalCopyOnSelect;
  activeTerminalThemeId: ActiveTerminalThemeId;
  terminalConfig: TerminalConfig;
}

const NonInjectedTerminal = observer(({
  isWindows,
  themeOptions,
  terminalShell,
  terminalCopyOnSelect,
  activeTerminalThemeId,
  terminalConfig,
}: Dependencies) => {
  const [shell, setShell] = useState(terminalShell.rawValue);
  const defaultShell = (
    process.env.SHELL
    || process.env.PTYSHELL
    || (
      isWindows
        ? "powershell.exe"
        : "System default shell"
    )
  );

  return (
    <section>
      <h2>Terminal</h2>

      <section id="shell">
        <SubTitle title="Terminal Shell Path"/>
        <Input
          theme="round-black"
          placeholder={defaultShell}
          value={shell}
          onChange={setShell}
          onBlur={() => terminalShell.set(shell)}
        />
      </section>

      <section id="terminalSelection">
        <SubTitle title="Terminal copy & paste" />
        <Switch
          checked={terminalCopyOnSelect.value}
          onChange={terminalCopyOnSelect.toggle}
        >
          Copy on select and paste on right-click
        </Switch>
      </section>

      <section id="terminalTheme">
        <SubTitle title="Terminal theme" />
        <Select
          themeName="lens"
          options={[
            { label: "Match theme", value: undefined },
            ...themeOptions.get(),
          ]}
          value={activeTerminalThemeId.value}
          onChange={({ value }) => activeTerminalThemeId.set(value)}
        />
      </section>

      <section>
        <SubTitle title="Font size"/>
        <Input
          theme="round-black"
          type="number"
          min={10}
          validators={InputValidators.isNumber}
          value={String(terminalConfig.fontSize)}
          onChange={(value) => terminalConfig.setFontSize(Number(value))}
        />
      </section>
      <section>
        <SubTitle title="Font family"/>
        <Input
          theme="round-black"
          type="text"
          value={terminalConfig.fontFamily}
          onChange={terminalConfig.setFontFamily}
        />
      </section>
    </section>
  );
});

export const Terminal = withInjectables<Dependencies>(NonInjectedTerminal, {
  getProps: (di, props) => ({
    ...props,
    isWindows: di.inject(isWindowsInjectable),
    themeOptions: di.inject(themeOptionsInjectable),
    activeTerminalThemeId: di.inject(activeTerminalThemeIdInjectable),
    terminalConfig: di.inject(terminalConfigInjectable),
    terminalCopyOnSelect: di.inject(terminalCopyOnSelectInjectable),
    terminalShell: di.inject(terminalShellInjectable),
  }),
});
