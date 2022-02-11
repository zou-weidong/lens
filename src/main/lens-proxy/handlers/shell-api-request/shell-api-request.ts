/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Server as WebSocketServer } from "ws";
import type { ClusterProxyApiRequestArgs } from "../types";
import URLParse from "url-parse";
import type { OpenShellSession } from "../../../shell-session/open.injectable";
import type { AuthenticateRequest } from "./authenticate.injectable";

export type ShellApiRequest = (args: ClusterProxyApiRequestArgs) => void;

interface Dependencies {
  authenticateRequest: AuthenticateRequest,
  openShellSession: OpenShellSession;
}

export const shellApiRequest = ({
  openShellSession,
  authenticateRequest,
}: Dependencies): ShellApiRequest => (
  ({ req, socket, head, cluster }: ClusterProxyApiRequestArgs): void => {
    const url = new URLParse(req.url, true);
    const { query: { node: nodeName, shellToken, id: tabId }} = url;

    if (!cluster || !authenticateRequest(cluster.id, tabId, shellToken)) {
      socket.write("Invalid shell request");

      return void socket.end();
    }

    const ws = new WebSocketServer({ noServer: true });

    ws.handleUpgrade(req, socket, head, (websocket) => {
      openShellSession({ websocket, cluster, tabId, nodeName });
    });
  }
);
