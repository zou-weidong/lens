/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Select, SelectOption } from "../select";
import { Input, InputValidator } from "../input";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import uniqueHotbarNameInjectable from "../input/validators/unique-hotbar-name.injectable";
import type { IComputedValue } from "mobx";
import type { GetHotbarById } from "../../../common/hotbars/get-by-id.injectable";
import getHotbarByIdInjectable from "../../../common/hotbars/get-by-id.injectable";
import hotbarSelectOptionsInjectable from "../../hotbars/select-options.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  uniqueHotbarName: InputValidator;
  hotbarSelectionOptions: IComputedValue<SelectOption<string>[]>;
  getHotbarById: GetHotbarById;
}

const NonInjectedHotbarRenameCommand = observer(({
  closeCommandOverlay,
  hotbarSelectionOptions,
  uniqueHotbarName,
  getHotbarById,
}: Dependencies) => {
  const [hotbarId, setHotbarId] = useState("");
  const [hotbarName, setHotbarName] = useState("");

  const onSelect = (id: string) => {
    setHotbarId(id);
    setHotbarName(getHotbarById(id).name);
  };
  const onSubmit = (name: string) => {
    if (!name.trim()) {
      return;
    }

    getHotbarById(hotbarId).name = name;
    closeCommandOverlay();
  };

  if (hotbarId) {
    return (
      <>
        <Input
          trim={true}
          value={hotbarName}
          onChange={setHotbarName}
          placeholder="New hotbar name"
          autoFocus={true}
          theme="round-black"
          validators={uniqueHotbarName}
          onSubmit={onSubmit}
          showValidationLine={true}
        />
        <small className="hint">
          Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onSelect(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={hotbarSelectionOptions.get()}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Rename hotbar"
    />
  );
});

export const HotbarRenameCommand = withInjectables<Dependencies>(NonInjectedHotbarRenameCommand, {
  getProps: (di, props) => ({
    ...props,
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    uniqueHotbarName: di.inject(uniqueHotbarNameInjectable),
    getHotbarById: di.inject(getHotbarByIdInjectable),
    hotbarSelectionOptions: di.inject(hotbarSelectOptionsInjectable),
  }),
});
