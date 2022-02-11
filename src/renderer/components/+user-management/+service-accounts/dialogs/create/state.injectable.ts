/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const createServiceAccountDialogStateInjectable = getInjectable({
  instantiate: () => observable.box(false),
  id: "create-service-account-dialog-state",
});

export default createServiceAccountDialogStateInjectable;
