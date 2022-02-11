/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./logs-dialog.scss";

import React from "react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Button } from "../button";
import { Icon } from "../icon";
import { clipboard } from "electron";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { OkNotification } from "../notifications/ok.injectable";
import okNotificationInjectable from "../notifications/ok.injectable";
import { cssNames } from "../../utils";

// todo: make as external BrowserWindow (?)

export interface LogsDialogProps extends DialogProps {
  title: string;
  logs: string;
}

interface Dependencies {
  okNotification: OkNotification;
}

const NonInjectedLogsDialog = observer(({
  okNotification,
  title,
  logs,
  className,
  ...dialogProps
}: Dependencies & LogsDialogProps) => {
  const copyToClipboard = () => {
    clipboard.writeText(logs);
    okNotification(`Logs copied to clipboard.`);
  };

  return (
    <Dialog
      className={cssNames("LogsDialog", className)}
      {...dialogProps}
    >
      <Wizard
        header={<h5>{title}</h5>}
        done={dialogProps.close}
      >
        <WizardStep
          scrollable={false}
          customButtons={(
            <div className="buttons flex gaps align-center justify-space-between">
              <Button plain onClick={copyToClipboard}>
                <Icon material="assignment"/> Copy to clipboard
              </Button>
              <Button plain onClick={dialogProps.close}>
                Close
              </Button>
            </div>
          )}
        >
          <code className="block">
            {logs || "There are no logs available."}
          </code>
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const LogsDialog = withInjectables<Dependencies, LogsDialogProps>(NonInjectedLogsDialog, {
  getProps: (di, props) => ({
    ...props,
    okNotification: di.inject(okNotificationInjectable),
  }),
});

