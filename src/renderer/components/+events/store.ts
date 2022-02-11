/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import groupBy from "lodash/groupBy";
import compact from "lodash/compact";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { KubeEvent, KubeEventApi } from "../../../common/k8s-api/endpoints";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Pod } from "../../../common/k8s-api/endpoints";
import type { PodStore } from "../+workloads-pods/store";

interface Dependencies {
  readonly podStore: PodStore;
}

export class KubeEventStore extends KubeObjectStore<KubeEvent, KubeEventApi> {
  limit = 1000;
  saveLimit = 50000;

  constructor(protected readonly dependencies: Dependencies, api: KubeEventApi) {
    super(api);
    autoBind(this);
  }

  protected bindWatchEventsUpdater() {
    return super.bindWatchEventsUpdater(5000);
  }

  protected sortItems(items: KubeEvent[]) {
    return super.sortItems(items, [
      event => event.getTimeDiffFromNow(), // keep events order as timeline ("fresh" on top)
    ], "asc");
  }

  getEventsByObject(obj: KubeObject): KubeEvent[] {
    return this.items.filter(evt => {
      if(obj.kind == "Node") {
        return obj.getName() == evt.involvedObject.uid && evt.involvedObject.kind == "Node";
      }

      return obj.getId() == evt.involvedObject.uid;
    });
  }

  getWarnings() {
    const warnings = this.items.filter(event => event.type == "Warning");
    const groupsByInvolvedObject = groupBy(warnings, warning => warning.involvedObject.uid);
    const eventsWithError = Object.values(groupsByInvolvedObject).map(events => {
      const recent = events[0];
      const { kind, uid } = recent.involvedObject;

      if (kind == Pod.kind) {  // Wipe out running pods
        const pod = this.dependencies.podStore.getById(uid);

        if (!pod || (!pod.hasIssues() && pod.spec.priority < 500000)) {
          return undefined;
        }
      }

      return recent;
    });

    return compact(eventsWithError);
  }

  getWarningsCount() {
    return this.getWarnings().length;
  }
}
