/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import { Switch } from "../switch";
import { Select } from "../select";
import { SubTitle } from "../layout/sub-title";
import { SubHeader } from "../layout/sub-header";
import { Input, InputValidators } from "../input";
import type { EditorConfig } from "../../../common/user-preferences/editor-config.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import editorConfigInjectable from "../../../common/user-preferences/editor-config.injectable";

enum EditorLineNumbersStyles {
  on = "On",
  off = "Off",
  relative = "Relative",
  interval = "Interval",
}

export interface EditorProps {}

interface Dependencies {
  editorConfig: EditorConfig;
}

const NonInjectedEditor = observer(({
  editorConfig,
}: Dependencies & EditorProps) => (
  <section id="editor">
    <h2 data-testid="editor-configuration-header">Editor configuration</h2>

    <SubTitle title="Minimap" />
    <section>
      <div className="flex gaps justify-space-between">
        <div className="flex gaps align-center">
          <Switch
            checked={editorConfig.minimap.enabled}
            onChange={editorConfig.toggleMinimapEnabled}
          >
            Show minimap
          </Switch>
        </div>
        <div className="flex gaps align-center">
          <SubHeader compact>Position</SubHeader>
          <Select
            themeName="lens"
            options={["left", "right"]}
            value={editorConfig.minimap.side}
            onChange={({ value }) => editorConfig.setMinimapSide(value)} />
        </div>
      </div>
    </section>

    <section>
      <SubTitle title="Line numbers" />
      <Select
        options={Object.entries(EditorLineNumbersStyles).map(([value, label]) => ({ label, value }))}
        value={editorConfig.lineNumbers}
        onChange={({ value }) => editorConfig.setLineNumbers(value)}
        themeName="lens" />
    </section>

    <section>
      <SubTitle title="Tab size" />
      <Input
        theme="round-black"
        type="number"
        min={1}
        validators={InputValidators.isNumber}
        value={editorConfig.tabSize.toString()}
        onChange={value => editorConfig.setTabSide(Number(value))} />
    </section>
    <section>
      <SubTitle title="Font size" />
      <Input
        theme="round-black"
        type="number"
        min={10}
        validators={InputValidators.isNumber}
        value={editorConfig.fontSize.toString()}
        onChange={value => editorConfig.setFontSize(Number(value))} />
    </section>
    <section>
      <SubTitle title="Font family" />
      <Input
        theme="round-black"
        type="text"
        validators={InputValidators.isNumber}
        value={editorConfig.fontFamily}
        onChange={value => editorConfig.setFontFamily(value)} />
    </section>
  </section>
));

export const Editor = withInjectables<Dependencies, EditorProps>(NonInjectedEditor, {
  getProps: (di, props) => ({
    ...props,
    editorConfig: di.inject(editorConfigInjectable),
  }),
});
