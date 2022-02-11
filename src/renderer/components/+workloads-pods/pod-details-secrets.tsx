/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-secrets.scss";

import React, { useEffect, useState } from "react";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import type { Pod, Secret, SecretApi } from "../../../common/k8s-api/endpoints";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { prevDefault } from "../../utils";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import secretApiInjectable from "../../../common/k8s-api/endpoints/secret.api.injectable";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

interface Dependencies {
  showDetails: ShowDetails;
  secretApi: SecretApi;
}

const NonInjectedPodDetailsSecrets = observer(({
  pod,
  showDetails,
  secretApi,
}: Dependencies & PodDetailsSecretsProps) => {
  const [secrets] = useState(observable.map<string, Secret>());

  useEffect(() => {
    (async () => {
      const secretList = await Promise.all(
        pod.getSecrets().map(secretName => secretApi.get({
          name: secretName,
          namespace: pod.getNs(),
        })),
      );

      runInAction(() => {
        for (const secret of secretList) {
          if (!secret) {
            continue;
          }

          secrets.set(secret.getName(), secret);
        }
      });
    })();
  }, [pod.getSecrets().join()]);

  return (
    <div className="PodDetailsSecrets">
      {
        pod.getSecrets()
          .map(secretName => (
            secrets.has(secretName)
              ? (
                <a key={secretName} onClick={prevDefault(() => showDetails(secrets.get(secretName)))}>
                  {secretName}
                </a>
              )
              : (
                <span key={secretName}>
                  {secretName}
                </span>
              )
          ))
      }
    </div>
  );
});

export const PodDetailsSecrets = withInjectables<Dependencies, PodDetailsSecretsProps>(NonInjectedPodDetailsSecrets, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    secretApi: di.inject(secretApiInjectable),
  }),
});
