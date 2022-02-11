/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./config-map-details.scss";

import React from "react";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import type { ConfigMapStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ConfigMap } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import type { LensLogger } from "../../../common/logger";
import type { OkNotification } from "../notifications/ok.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../notifications/error.injectable";
import okNotificationInjectable from "../notifications/ok.injectable";
import configMapsLoggerInjectable from "./logger.injectable";
import configMapStoreInjectable from "./store.injectable";

export interface ConfigMapDetailsProps extends KubeObjectDetailsProps<ConfigMap> {
}

interface Dependencies {
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  logger: LensLogger;
  configMapStore: ConfigMapStore;
}

@observer
class NonInjectedConfigMapDetails extends React.Component<ConfigMapDetailsProps & Dependencies> {
  private readonly isSaving = observable.box(false);
  private readonly data = observable.map<string, string>();

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: configMap } = this.props;

        if (configMap) {
          this.data.replace(configMap.data); // refresh
        }
      }),
    ]);
  }

  save = async () => {
    const { object: configMap, configMapStore } = this.props;

    try {
      this.isSaving.set(true);
      await configMapStore.update(configMap, {
        ...configMap,
        data: Object.fromEntries(this.data),
      });
      this.props.okNotification(
        <p>
          <>ConfigMap <b>{configMap.getName()}</b> successfully updated.</>
        </p>,
      );
    } catch (error) {
      this.props.errorNotification(`Failed to save config map: ${error}`);
    } finally {
      this.isSaving.set(false);
    }
  };

  render() {
    const { object: configMap } = this.props;

    if (!configMap) {
      return null;
    }

    if (!(configMap instanceof ConfigMap)) {
      this.props.logger.error("passed object that is not an instanceof ConfigMap", configMap);

      return null;
    }

    const data = Array.from(this.data.entries());

    return (
      <div className="ConfigMapDetails">
        <KubeObjectMeta object={configMap}/>
        {
          data.length > 0 && (
            <>
              <DrawerTitle title="Data"/>
              {
                data.map(([name, value]) => (
                  <div key={name} className="data">
                    <div className="name">{name}</div>
                    <div className="flex gaps align-flex-start">
                      <Input
                        multiLine
                        theme="round-black"
                        className="box grow"
                        value={value}
                        onChange={v => this.data.set(name, v)}
                      />
                    </div>
                  </div>
                ))
              }
              <Button
                primary
                label="Save"
                waiting={this.isSaving.get()}
                className="save-btn"
                onClick={this.save}
              />
            </>
          )
        }
      </div>
    );
  }
}

export const ConfigMapDetails = withInjectables<Dependencies, ConfigMapDetailsProps>(NonInjectedConfigMapDetails, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
    logger: di.inject(configMapsLoggerInjectable),
    configMapStore: di.inject(configMapStoreInjectable),
  }),
});
