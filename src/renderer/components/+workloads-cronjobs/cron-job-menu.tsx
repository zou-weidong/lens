/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { CronJob, CronJobApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import type { ErrorNotification } from "../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import errorNotificationInjectable from "../notifications/error.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import type { OpenCronJobTriggerDialog } from "./dialogs/trigger/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import openCronJobTriggerDialogInjectable from "./dialogs/trigger/open.injectable";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";

export type CronJobMenuProps = KubeObjectMenuProps<CronJob>;

interface Dependencies {
  errorNotification: ErrorNotification;
  openConfirmDialog: OpenConfirmDialog;
  openCronJobTriggerDialog: OpenCronJobTriggerDialog;
  cronJobApi: CronJobApi;
}

const NonInjectedCronJobMenu = observer(({
  errorNotification,
  object,
  toolbar,
  openConfirmDialog,
  openCronJobTriggerDialog,
  cronJobApi,
}: Dependencies & CronJobMenuProps) => (
  <>
    <MenuItem onClick={() => openCronJobTriggerDialog(object)}>
      <Icon material="play_circle_filled" tooltip="Trigger" interactive={toolbar}/>
      <span className="title">Trigger</span>
    </MenuItem>

    {object.isSuspend() ?
      <MenuItem onClick={() => openConfirmDialog({
        ok: async () => {
          try {
            await cronJobApi.resume({ namespace: object.getNs(), name: object.getName() });
          } catch (err) {
            errorNotification(err);
          }
        },
        labelOk: `Resume`,
        message: (
          <p>
              Resume CronJob <b>{object.getName()}</b>?
          </p>
        ),
      })}>
        <Icon material="play_circle_outline" tooltip="Resume" interactive={toolbar}/>
        <span className="title">Resume</span>
      </MenuItem>
      : <MenuItem onClick={() => openConfirmDialog({
        ok: async () => {
          try {
            await cronJobApi.suspend({ namespace: object.getNs(), name: object.getName() });
          } catch (err) {
            errorNotification(err);
          }
        },
        labelOk: `Suspend`,
        message: (
          <p>
              Suspend CronJob <b>{object.getName()}</b>?
          </p>
        ),
      })}>
        <Icon material="pause_circle_filled" tooltip="Suspend" interactive={toolbar}/>
        <span className="title">Suspend</span>
      </MenuItem>
    }
  </>
));

export const CronJobMenu = withInjectables<Dependencies, CronJobMenuProps>(NonInjectedCronJobMenu, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    openCronJobTriggerDialog: di.inject(openCronJobTriggerDialogInjectable),
    cronJobApi: di.inject(cronJobApiInjectable),
  }),
});
