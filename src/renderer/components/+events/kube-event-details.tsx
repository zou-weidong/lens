/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { Disposer } from "../../utils";
import { cssNames } from "../../utils";
import { LocaleDate } from "../locale-date";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeEventStore } from "./store";
import kubeEventStoreInjectable from "./store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface KubeEventDetailsProps {
  object: KubeObject;
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  kubeEventStore: KubeEventStore;
}

@observer
class NonInjectedKubeEventDetails extends React.Component<KubeEventDetailsProps & Dependencies> {
  componentDidMount() {
    const {
      kubeEventStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      subscribeStores([
        kubeEventStore,
      ]),
    ]);
  }

  render() {
    const { object, kubeEventStore } = this.props;

    if (!object) {
      return null;
    }

    if (!(object instanceof KubeObject)) {
      logger.error("[KubeEventDetails]: passed object that is not an instanceof KubeObject", object);

      return null;
    }

    const events = kubeEventStore.getEventsByObject(object);

    if (!events.length) {
      return (
        <DrawerTitle className="flex gaps align-center">
          <span>Events</span>
        </DrawerTitle>
      );
    }

    return (
      <div>
        <DrawerTitle className="flex gaps align-center">
          <span>Events</span>
        </DrawerTitle>
        <div className="KubeEventDetails">
          {events.map(evt => {
            const { message, count, lastTimestamp, involvedObject } = evt;

            return (
              <div className="event" key={evt.getId()}>
                <div className={cssNames("title", { warning: evt.isWarning() })}>
                  {message}
                </div>
                <DrawerItem name="Source">
                  {evt.getSource()}
                </DrawerItem>
                <DrawerItem name="Count">
                  {count}
                </DrawerItem>
                <DrawerItem name="Sub-object">
                  {involvedObject.fieldPath}
                </DrawerItem>
                <DrawerItem name="Last seen">
                  <LocaleDate date={lastTimestamp} />
                </DrawerItem>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export const KubeEventDetails = withInjectables<Dependencies, KubeEventDetailsProps>(NonInjectedKubeEventDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
  }),
});



