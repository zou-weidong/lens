/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ConfirmDialogParams } from "./view";
import confirmDialogStateInjectable from "./state.injectable";
import React from "react";
import { Icon } from "../icon";
import { noop } from "../../utils";

export type OpenConfirmDialog = (params: ConfirmDialogParams) => void;

const openConfirmDialogInjectable = getInjectable({
  instantiate: (di): OpenConfirmDialog => {
    const state = di.inject(confirmDialogStateInjectable);

    return (params) => {
      state.set({
        ...params,
        ok: noop,
        cancel: noop,
        labelOk: "Ok",
        labelCancel: "Cancel",
        icon: <Icon big material="warning"/>,
        okButtonProps: {},
        cancelButtonProps: {},
      });
    };
  },
  id: "open-confirm-dialog",
});

export default openConfirmDialogInjectable;
