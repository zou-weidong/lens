/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./notifications.scss";

import React, { useEffect, useRef } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { cssNames, prevDefault } from "../../utils";
import type { NotificationsStore } from "./store";
import { Animate } from "../animate";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import notificationsStoreInjectable from "./store.injectable";

export interface NotificationsProps {}

interface Dependencies {
  notificationsStore: NotificationsStore;
}

const NonInjectedNotificationsList = observer(({ notificationsStore }: Dependencies & NotificationsProps) => {
  const elem = useRef<HTMLDivElement>();

  const scrollToLastNotification = () => {
    if (!elem.current) {
      return;
    }

    elem.current.scrollTo({
      top: elem.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => reaction(
    () => notificationsStore.count,
    scrollToLastNotification,
  ), []);

  return (
    <div className="Notifications flex column align-flex-end" ref={elem}>
      {
        notificationsStore.getAll()
          .map(([id, { kind, onClose, message, onMouseLeave, onMouseEnter }]) => (
            <Animate key={id}>
              <div
                className={cssNames("notification flex", kind)}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}>
                <div className="box">
                  <Icon material="info_outline" />
                </div>
                <div className="message box grow">
                  {message}
                </div>
                <div className="box">
                  <Icon
                    material="close"
                    className="close"
                    onClick={prevDefault(onClose)}
                  />
                </div>
              </div>
            </Animate>
          ))
      }
    </div>
  );
});

export const NotificationsList = withInjectables<Dependencies, NotificationsProps>(NonInjectedNotificationsList, {
  getProps: (di, props) => ({
    notificationsStore: di.inject(notificationsStoreInjectable),
    ...props,
  }),
});
