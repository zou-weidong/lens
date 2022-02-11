/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ConfirmDialogParams } from "./view";

const confirmDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<Required<ConfirmDialogParams> | undefined>(),
  id: "confirm-dialog-state",
});

export default confirmDialogStateInjectable;
