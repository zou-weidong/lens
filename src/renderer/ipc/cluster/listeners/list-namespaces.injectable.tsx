/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import getClusterByIdInjectable, { GetClusterById } from "../../../../common/clusters/get-by-id.injectable";
import { emitListNamespacesForbiddenInjectionToken, ListNamespacesForbidden } from "../../../../common/ipc/cluster/list-namespaces/emit.token";
import { entitySettingsURL } from "../../../../common/routes";
import { Button } from "../../../components/button";
import type { HasNotificationById } from "../../../components/notifications/has-by-id.injectable";
import hasNotificationByIdInjectable from "../../../components/notifications/has-by-id.injectable";
import type { InfoNotification } from "../../../components/notifications/info.injectable";
import infoNotificationInjectable from "../../../components/notifications/info.injectable";
import type { Navigate } from "../../../navigation/navigate.injectable";
import navigateInjectable from "../../../navigation/navigate.injectable";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

interface Dependencies {
  getClusterById: GetClusterById;
  infoNotification: InfoNotification;
  hasNotificationById: HasNotificationById;
  navigate: Navigate;
}

const notificationLastDisplayedAt = new Map<string, number>();
const intervalBetweenNotifications = 1000 * 60; // 60s

const getListener = ({
  getClusterById,
  infoNotification,
  hasNotificationById,
  navigate,
}: Dependencies): ListNamespacesForbidden => (
  (clusterId) => {
    const lastDisplayedAt = notificationLastDisplayedAt.get(clusterId);
    const now = Date.now();

    if (!notificationLastDisplayedAt.has(clusterId) || (now - lastDisplayedAt) > intervalBetweenNotifications) {
      notificationLastDisplayedAt.set(clusterId, now);
    } else {
      // don't bother the user too often
      return;
    }

    const notificationId = `list-namespaces-forbidden:${clusterId}`;

    if (hasNotificationById(notificationId)) {
      // previous notification is still visible
      return;
    }

    const remove = infoNotification(
      (
        <div className="flex column gaps">
          <b>Add Accessible Namespaces</b>
          <p>
            Cluster <b>{getClusterById(clusterId).name}</b> does not have permissions to list namespaces.{" "}
            Please add the namespaces you have access to.
          </p>
          <div className="flex gaps row align-left box grow">
            <Button
              active
              outlined
              label="Go to Accessible Namespaces Settings"
              onClick={() => {
                navigate(entitySettingsURL({ params: { entityId: clusterId }, fragment: "namespaces" }));
                remove();
              }}
            />
          </div>
        </div>
      ),
      {
        id: notificationId,
        /**
         * Set the time when the notification is closed as well so that there is at
         * least a minute between closing the notification as seeing it again
         */
        onClose: () => notificationLastDisplayedAt.set(clusterId, Date.now()),
      },
    );
  }
);

const clusterListNamespacesForbiddenListenerInjectable = getInjectable({
  setup: async (di) => {
    const ipcRenderer = await di.inject(ipcRendererInjectable);

    emitListNamespacesForbiddenInjectionToken.setupListener(ipcRenderer, getListener({
      getClusterById: await di.inject(getClusterByIdInjectable),
      hasNotificationById: await di.inject(hasNotificationByIdInjectable),
      infoNotification: await di.inject(infoNotificationInjectable),
      navigate: await di.inject(navigateInjectable),
    }));
  },
  instantiate: () => null,
  id: "cluster-list-namespaces-forbidden-listener",
});

export default clusterListNamespacesForbiddenListenerInjectable;
