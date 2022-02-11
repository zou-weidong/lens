/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React, { useState } from "react";
import type { SecretStore } from "../+config-secrets/store";
import secretStoreInjectable from "../+config-secrets/store.injectable";
import type { Secret } from "../../../common/k8s-api/endpoints";
import { base64, cssNames } from "../../utils";
import { Icon } from "../icon";

export interface SecretKeyProps {
  reference: {
    name: string;
    key: string;
  };
  namespace: string;
}

interface Dependencies {
  secretStore: SecretStore;
}

const NonInjectedSecretKey = ({
  secretStore,
  reference: { name, key },
  namespace,
}: Dependencies & SecretKeyProps) => {
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<Secret>();

  const showKey = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    setLoading(true);
    const secret = await secretStore.load({ name, namespace });

    setLoading(false);
    setSecret(secret);
  };

  if (secret?.data?.[key]) {
    return <>{base64.decode(secret.data[key])}</>;
  }

  return (
    <>
      secretKeyRef({name}.{key})&nbsp;
      <Icon
        className={cssNames("secret-button", { loading })}
        material="visibility"
        tooltip="Show"
        onClick={showKey}
      />
    </>
  );
};

export const SecretKey = withInjectables<Dependencies, SecretKeyProps>(NonInjectedSecretKey, {
  getProps: (di, props) => ({
    ...props,
    secretStore: di.inject(secretStoreInjectable),
  }),
});
