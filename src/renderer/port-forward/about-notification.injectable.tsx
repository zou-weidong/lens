/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { InfoNotification } from "../components/notifications/info.injectable";
import infoNotificationInjectable from "../components/notifications/info.injectable";
import type { Navigate } from "../navigation/navigate.injectable";
import navigateInjectable from "../navigation/navigate.injectable";
import { Button } from "../components/button";
import { portForwardsURL } from "../../common/routes";

export type AboutPortForwardingNotification = () => void;

interface Dependencies {
  infoNotification: InfoNotification;
  navigate: Navigate;
}

const aboutPortForwardingNotification = ({
  infoNotification,
  navigate,
}: Dependencies): AboutPortForwardingNotification => (
  () => {
    const remove = infoNotification(
      (
        <div className="flex column gaps">
          <b>Port Forwarding</b>
          <p>
            You can manage your port forwards on the Port Forwarding Page.
          </p>
          <div className="flex gaps row align-left box grow">
            <Button
              active
              outlined
              label="Go to Port Forwarding"
              onClick={() => {
                navigate(portForwardsURL());
                remove();
              }}
            />
          </div>
        </div>
      ),
      {
        id: "port-forward-notification",
        timeout: 10_000,
      },
    );
  }
);

const aboutPortForwardingNotificationInjectable = getInjectable({
  instantiate: (di) => aboutPortForwardingNotification({
    infoNotification: di.inject(infoNotificationInjectable),
    navigate: di.inject(navigateInjectable),
  }),
  id: "about-port-forwarding-notification",
});

export default aboutPortForwardingNotificationInjectable;
