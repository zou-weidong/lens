/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { Navigate } from "../navigation/navigate.injectable";
import navigateInjectable from "../navigation/navigate.injectable";
import { Button } from "../components/button";
import { portForwardsURL } from "../../common/routes";
import type { ErrorNotification } from "../components/notifications/error.injectable";
import errorNotificationInjectable from "../components/notifications/error.injectable";

export type PortForwardingErrorNotification = (message: string) => void;

interface Dependencies {
  errorNotification: ErrorNotification;
  navigate: Navigate;
}

const portForwardingErrorNotification = ({
  errorNotification,
  navigate,
}: Dependencies): PortForwardingErrorNotification => (
  (message) => {
    const remove = errorNotification(
      (
        <div className="flex column gaps">
          <b>Port Forwarding</b>
          <p>
            {message}
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
        id: "port-forward-error-notification",
        timeout: 10_000,
      },
    );
  }
);

const portForwardingErrorNotificationInjectable = getInjectable({
  instantiate: (di) => portForwardingErrorNotification({
    navigate: di.inject(navigateInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
  }),
  id: "port-forwarding-error-notification",
});

export default portForwardingErrorNotificationInjectable;
