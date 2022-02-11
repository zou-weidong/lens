/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select, SelectOption } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { IComputedValue } from "mobx";
import type { RemoveHotbar } from "../../../common/hotbars/remove-hotbar.injectable";
import type { GetHotbarById } from "../../../common/hotbars/get-by-id.injectable";
import getHotbarByIdInjectable from "../../../common/hotbars/get-by-id.injectable";
import hotbarSelectOptionsInjectable from "../../hotbars/select-options.injectable";
import removeHotbarInjectable from "../../../common/hotbars/remove-hotbar.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  hotbarSelectionOptions: IComputedValue<SelectOption<string>[]>;
  removeHotbar: RemoveHotbar;
  getHotbarById: GetHotbarById;
  openConfirmDialog: OpenConfirmDialog;
}

const NonInjectedHotbarRemoveCommand = observer(({
  closeCommandOverlay,
  hotbarSelectionOptions,
  removeHotbar,
  getHotbarById,
  openConfirmDialog,
}: Dependencies) => {
  const onChange = (id: string): void => {
    const hotbar = getHotbarById(id);

    if (!hotbar) {
      return;
    }

    closeCommandOverlay();
    openConfirmDialog({
      okButtonProps: {
        label: "Remove Hotbar",
        primary: false,
        accent: true,
      },
      ok: () => removeHotbar(id),
      message: (
        <div className="confirm flex column gaps">
          <p>
            Are you sure you want remove hotbar <b>{hotbar.name}</b>?
          </p>
        </div>
      ),
    });
  };

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onChange(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={hotbarSelectionOptions.get()}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Remove hotbar"
    />
  );
});

export const HotbarRemoveCommand = withInjectables<Dependencies>(NonInjectedHotbarRemoveCommand, {
  getProps: (di, props) => ({
    ...props,
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    getHotbarById: di.inject(getHotbarByIdInjectable),
    hotbarSelectionOptions: di.inject(hotbarSelectOptionsInjectable),
    removeHotbar: di.inject(removeHotbarInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
