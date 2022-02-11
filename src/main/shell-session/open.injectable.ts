/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/clusters/cluster";
import type WebSocket from "ws";
import type { CreateKubectl } from "../kubectl/create-kubectl.injectable";
import type { OpenNodeShellSession } from "./node/open.injectable";
import type { OpenLocalShellSession } from "./local/open.injectable";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import openLocalShellSessionInjectable from "./local/open.injectable";
import openNodeShellSessionInjectable from "./node/open.injectable";

export interface CreatShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName?: string;
}

export type OpenShellSession = (args: CreatShellSessionArgs) => void;

interface Dependencies {
  createKubectl: CreateKubectl;
  openNodeShellSession: OpenNodeShellSession;
  openLocalShellSession: OpenLocalShellSession;
}

const openShellSession = ({
  createKubectl,
  openNodeShellSession,
  openLocalShellSession,
}: Dependencies): OpenShellSession => (
  ({ nodeName, cluster, tabId: terminalId, websocket }) => {
    const kubectl = createKubectl(cluster.version);
    const args = {
      cluster,
      terminalId,
      websocket,
      kubectl,
    };

    if (nodeName) {
      openNodeShellSession({ nodeName, ...args });
    } else {
      openLocalShellSession(args);
    }
  }
);

const openShellSessionInjectable = getInjectable({
  instantiate: (di) => openShellSession({
    createKubectl: di.inject(createKubectlInjectable),
    openLocalShellSession: di.inject(openLocalShellSessionInjectable),
    openNodeShellSession: di.inject(openNodeShellSessionInjectable),
  }),
  id: "open-shell-session",
});

export default openShellSessionInjectable;
