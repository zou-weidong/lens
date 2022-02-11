/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import { TerminalApi, TerminalChannels } from "../../../api/terminal-api";
import { noop } from "../../../utils";
import type { InfoNotification } from "../../notifications/info.injectable";
import infoNotificationInjectable from "../../notifications/info.injectable";
import selectDockTabInjectable from "../dock/select-dock-tab.injectable";
import type { DockTab, TabId } from "../dock/store";
import createTerminalTabInjectable from "./create-terminal-tab.injectable";
import getTerminalApiInjectable from "./get-terminal-api.injectable";

interface Dependencies {
  selectTab: (tabId: TabId) => void;
  createTerminalTab: () => DockTab;
  getTerminalApi: (tabId: TabId) => TerminalApi;
  infoNotification: InfoNotification;
}

export interface SendCommandOptions {
  /**
   * Emit an enter after the command
   */
  enter?: boolean;

  /**
   * @deprecated This option is ignored and infered to be `true` if `tabId` is not provided
   */
  newTab?: any;

  /**
   * Specify a specific terminal tab to send this command to
   */
  tabId?: TabId;
}

export type SendCommand = (command: string, options?: SendCommandOptions) => Promise<void>;

const sendCommand = ({
  selectTab,
  createTerminalTab,
  getTerminalApi,
  infoNotification,
}: Dependencies): SendCommand => (
  async (command, options = {}) => {
    let { tabId } = options;

    if (tabId) {
      selectTab(tabId);
    } else {
      tabId = createTerminalTab().id;
    }

    await when(() => Boolean(getTerminalApi(tabId)));

    const terminalApi = getTerminalApi(tabId);
    const shellIsReady = when(() =>terminalApi.isReady);
    const notifyVeryLong = setTimeout(() => {
      shellIsReady.cancel();
      infoNotification(
        "If terminal shell is not ready please check your shell init files, if applicable.",
        {
          timeout: 4_000,
        },
      );
    }, 10_000);

    await shellIsReady.catch(noop);
    clearTimeout(notifyVeryLong);

    if (terminalApi) {
      if (options.enter) {
        command += "\r";
      }

      terminalApi.sendMessage({
        type: TerminalChannels.STDIN,
        data: command,
      });
    } else {
      console.warn(
        "The selected tab is does not have a connection. Cannot send command.",
        { tabId, command },
      );
    }
  }
);

const sendCommandInjectable = getInjectable({
  id: "send-command",

  instantiate: (di) => sendCommand({
    createTerminalTab: di.inject(createTerminalTabInjectable),
    selectTab: di.inject(selectDockTabInjectable),
    getTerminalApi: di.inject(getTerminalApiInjectable),
    infoNotification: di.inject(infoNotificationInjectable),
  }),
});

export default sendCommandInjectable;
