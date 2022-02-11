/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select, SelectOption } from "../select";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { IComputedValue } from "mobx";
import hotbarSelectOptionsInjectable from "../../hotbars/select-options.injectable";
import type { SetActiveHotbar } from "../../../common/hotbars/set-active.injectable";
import setActiveHotbarInjectable from "../../../common/hotbars/set-active.injectable";

const addActionId = "__add__";
const removeActionId = "__remove__";
const renameActionId = "__rename__";

interface Dependencies {
  hotbarSelectionOptions: IComputedValue<SelectOption<string>[]>;
  setActiveHotbar: SetActiveHotbar;
  commandOverlay: CommandOverlay;
}

function getHotbarSwitchOptions(hotbarSelectionOptions: IComputedValue<SelectOption<string>[]>) {
  const options = hotbarSelectionOptions.get();
  const hasMoreThanOneHotbar = options.length > 1;

  options.push({ value: addActionId, label: "Add hotbar ..." });

  if (hasMoreThanOneHotbar) {
    options.push({ value: removeActionId, label: "Remove hotbar ..." });
  }

  options.push({ value: renameActionId, label: "Rename hotbar ..." });

  return options;
}

const NonInjectedHotbarSwitchCommand = observer(({
  hotbarSelectionOptions,
  setActiveHotbar,
  commandOverlay,
}: Dependencies) => {
  const options = getHotbarSwitchOptions(hotbarSelectionOptions);

  const onChange = (idOrAction: string): void  => {
    switch (idOrAction) {
      case addActionId:
        return commandOverlay.open(<HotbarAddCommand />);
      case removeActionId:
        return commandOverlay.open(<HotbarRemoveCommand />);
      case renameActionId:
        return commandOverlay.open(<HotbarRenameCommand />);
      default:
        setActiveHotbar(idOrAction);
        commandOverlay.close();
    }
  };

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onChange(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Switch to hotbar"
    />
  );
});

export const HotbarSwitchCommand = withInjectables<Dependencies>(NonInjectedHotbarSwitchCommand, {
  getProps: (di, props) => ({
    ...props,
    commandOverlay: di.inject(commandOverlayInjectable),
    hotbarSelectionOptions: di.inject(hotbarSelectOptionsInjectable),
    setActiveHotbar: di.inject(setActiveHotbarInjectable),
  }),
});
