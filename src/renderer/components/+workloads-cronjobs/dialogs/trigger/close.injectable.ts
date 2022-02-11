/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import cronJobTriggerDialogStateInjectable from "./state.injectable";

const closeCronJobTriggerDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(cronJobTriggerDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-cron-job-trigger-dialog",
});

export default closeCronJobTriggerDialogInjectable;
