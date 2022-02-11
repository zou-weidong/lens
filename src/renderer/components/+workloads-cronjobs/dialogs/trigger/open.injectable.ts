/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CronJob } from "../../../../../common/k8s-api/endpoints";
import cronJobTriggerDialogStateInjectable from "./state.injectable";

export type OpenCronJobTriggerDialog = (statefulSet: CronJob) => void;

const openCronJobTriggerDialogInjectable = getInjectable({
  instantiate: (di): OpenCronJobTriggerDialog => {
    const state = di.inject(cronJobTriggerDialogStateInjectable);

    return (cronJob) => {
      state.set(cronJob);
    };
  },
  id: "open-cron-job-trigger-dialog",
});

export default openCronJobTriggerDialogInjectable;
