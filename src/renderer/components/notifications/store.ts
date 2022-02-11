/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { action, observable, makeObservable, computed } from "mobx";
import { autoBind, Disposer, noop } from "../../utils";
import uniqueId from "lodash/uniqueId";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";

export type NotificationId = string | number;
export type NotificationMessage = React.ReactNode | React.ReactNode[] | JsonApiErrorParsed;

export enum NotificationKind {
  OK = "ok",
  ERROR = "error",
  INFO = "info",
}

export type SpecificNotifcationCreateArgs = {
  id: NotificationId;
  timeout?: undefined;
  onClose?: undefined;
} | {
  id?: NotificationId;
  timeout?: number; // auto-hiding timeout in milliseconds, falsy = no hide
  onClose?(): void; // additional logic on when the notification times out or is closed by the "x"
};

export type NotificationCreateArgs = {
  id: NotificationId,
  message: NotificationMessage;
  kind?: undefined;
  timeout?: undefined;
  onClose?: undefined;
} | {
  id?: NotificationId;
  message: NotificationMessage;
  kind: NotificationKind;
  timeout?: number; // auto-hiding timeout in milliseconds, falsy = no hide
  onClose?(): void; // additional logic on when the notification times out or is closed by the "x"
};

export interface Notification {
  message: NotificationMessage;
  kind: NotificationKind;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export class NotificationsStore {
  private notifications = observable.map<NotificationId, Notification>([], { deep: false });

  protected autoHideTimers = new Map<NotificationId, number>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  @computed get count() {
    return this.notifications.size;
  }

  getAll(): [NotificationId, Notification][] {
    return Array.from(this.notifications.entries());
  }

  hasById(id: NotificationId): boolean {
    return this.notifications.has(id);
  }

  private addAutoHideTimer(id: NotificationId, timeout: number) {
    const notification = this.notifications.get(id);

    if (!notification) {
      return;
    }

    this.removeAutoHideTimer(id);

    const timer = window.setTimeout(() => this.remove(id), timeout);

    this.autoHideTimers.set(id, timer);
  }

  private removeAutoHideTimer(id: NotificationId) {
    clearTimeout(this.autoHideTimers.get(id));
    this.autoHideTimers.delete(id);
  }

  private getMessage(message: NotificationMessage) {
    if (message instanceof JsonApiErrorParsed || message instanceof Error) {
      return message.toString();
    }

    return React.Children.toArray(message);
  }

  @action
  add(notification: NotificationCreateArgs): Disposer {
    const {
      id = uniqueId("notification_"),
      kind,
      message: rawMessage,
      onClose = noop,
      timeout,
    } = notification;
    const message = this.getMessage(rawMessage);

    if (this.notifications.has(id)) {
      // Only allowed to update message
      this.notifications.get(id).message = message;
    } else {
      const [ onMouseEnter, onMouseLeave ] = timeout
        ? [
          () => this.addAutoHideTimer(id, timeout),
          () => this.removeAutoHideTimer(id),
        ]
        : [noop, noop];

      this.notifications.set(id, {
        message,
        kind,
        onClose: () => {
          this.remove(id);
          onClose();
        },
        onMouseEnter,
        onMouseLeave,
      });

      onMouseEnter();
    }

    return () => this.remove(id);
  }

  private remove(id: NotificationId) {
    this.removeAutoHideTimer(id);
    this.notifications.delete(id);
  }
}
