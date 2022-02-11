/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import type { SecretStore } from "../../+config-secrets/store";
import type { ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { Secret, SecretType } from "../../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Icon } from "../../icon";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Spinner } from "../../spinner";
import { ServiceAccountsSecret } from "./secret";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShowDetails } from "../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../kube-object/details/show.injectable";
import { prevDefault } from "../../../utils";
import secretStoreInjectable from "../../+config-secrets/store.injectable";

export interface ServiceAccountsDetailsProps extends KubeObjectDetailsProps<ServiceAccount> {
}

interface Dependencies {
  showDetails: ShowDetails;
  secretStore: SecretStore;
}

@observer
class NonInjectedServiceAccountsDetails extends React.Component<ServiceAccountsDetailsProps & Dependencies> {
  @observable secrets: Secret[];
  @observable imagePullSecrets: Secret[];

  componentDidMount(): void {
    disposeOnUnmount(this, [
      autorun(async () => {
        this.secrets = null;
        this.imagePullSecrets = null;
        const { object: serviceAccount, secretStore } = this.props;

        if (!serviceAccount) {
          return;
        }
        const namespace = serviceAccount.getNs();
        const secrets = serviceAccount.getSecrets().map(({ name }) => {
          return secretStore.load({ name, namespace });
        });

        this.secrets = await Promise.all(secrets);
        const imagePullSecrets = serviceAccount.getImagePullSecrets().map(async ({ name }) => {
          return secretStore.load({ name, namespace }).catch(() => this.generateDummySecretObject(name));
        });

        this.imagePullSecrets = await Promise.all(imagePullSecrets);
      }),
    ]);
  }

  constructor(props: ServiceAccountsDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  renderSecrets() {
    const { secrets } = this;

    if (!secrets) {
      return <Spinner center/>;
    }

    return secrets.map(secret =>
      <ServiceAccountsSecret key={secret.getId()} secret={secret}/>,
    );
  }

  renderImagePullSecrets() {
    const { imagePullSecrets } = this;

    if (!imagePullSecrets) {
      return <Spinner center/>;
    }

    return this.renderSecretLinks(imagePullSecrets);
  }

  renderSecretLinks(secrets: Secret[]) {
    const { showDetails } = this.props;

    return secrets.map((secret) => {
      if (secret.getId() === null) {
        return (
          <div key={secret.getName()}>
            {secret.getName()}
            <Icon
              small material="warning"
              tooltip="Secret is not found"
            />
          </div>
        );
      }

      return (
        <a key={secret.getId()} onClick={prevDefault(() => showDetails(secret))}>
          {secret.getName()}
        </a>
      );
    });
  }

  generateDummySecretObject(name: string) {
    return new Secret({
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name,
        uid: null,
        selfLink: null,
        resourceVersion: null,
      },
      type: SecretType.Opaque,
    });
  }

  render() {
    const { object: serviceAccount, secretStore } = this.props;

    if (!serviceAccount) {
      return null;
    }
    const tokens = secretStore.items.filter(secret =>
      secret.getNs() == serviceAccount.getNs() &&
      secret.getAnnotations().some(annot => annot == `kubernetes.io/service-account.name: ${serviceAccount.getName()}`),
    );
    const imagePullSecrets = serviceAccount.getImagePullSecrets();

    return (
      <div className="ServiceAccountsDetails">
        <KubeObjectMeta object={serviceAccount}/>

        {tokens.length > 0 &&
        <DrawerItem name="Tokens" className="links">
          {this.renderSecretLinks(tokens)}
        </DrawerItem>
        }
        {imagePullSecrets.length > 0 &&
        <DrawerItem name="ImagePullSecrets" className="links">
          {this.renderImagePullSecrets()}
        </DrawerItem>
        }

        <DrawerTitle title="Mountable secrets"/>
        <div className="secrets">
          {this.renderSecrets()}
        </div>
      </div>
    );
  }
}

export const ServiceAccountsDetails = withInjectables<Dependencies, ServiceAccountsDetailsProps>(NonInjectedServiceAccountsDetails, {
  getProps: (di, props) => ({
    ...props,
    showDetails: di.inject(showDetailsInjectable),
    secretStore: di.inject(secretStoreInjectable),
  }),
});
