/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import { KubeObject } from "../kube-object";
import { formatDuration } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeObjectRef } from "../url/parse.injectable";

export interface KubeEventSource {
  component: string;
  host: string;
}

export class KubeEvent extends KubeObject {
  static kind = "Event";
  static namespaced = true;
  static apiBase = "/api/v1/events";

  declare involvedObject: KubeObjectRef;
  declare reason: string;
  declare message: string;
  declare source: KubeEventSource;
  declare firstTimestamp: string;
  declare lastTimestamp: string;
  declare count: number;
  declare type: "Normal" | "Warning" | string;
  declare eventTime: null;
  declare reportingComponent: string;
  declare reportingInstance: string;

  isWarning() {
    return this.type === "Warning";
  }

  getSource() {
    const { component, host } = this.source;

    return `${component} ${host || ""}`;
  }

  getFirstSeenTime() {
    const diff = moment().diff(this.firstTimestamp);

    return formatDuration(diff, true);
  }

  getLastSeenTime() {
    const diff = moment().diff(this.lastTimestamp);

    return formatDuration(diff, true);
  }
}

export class KubeEventApi extends KubeApi<KubeEvent> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: KubeEvent,
    });
  }
}
