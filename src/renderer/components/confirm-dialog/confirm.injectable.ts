/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import openConfirmDialogInjectable from "./open.injectable";
import type { ConfirmDialogBooleanParams } from "./view";

export type Confirm = (params: ConfirmDialogBooleanParams) => Promise<boolean>;

const confirmInjectable = getInjectable({
  instantiate: (di): Confirm => {
    const openConfirmDialog = di.inject(openConfirmDialogInjectable);

    return (params) => {
      return new Promise(resolve => {
        openConfirmDialog({
          ok: () => resolve(true),
          cancel: () => resolve(false),
          ...params,
        });
      });
    };
  },
  id: "confirm",
});

export default confirmInjectable;
