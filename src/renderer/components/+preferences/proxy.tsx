/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { AllowUntrustedCertificateAuthorities } from "../../../common/user-preferences/allow-untrusted-certificate-authorities.injectable";
import allowUntrustedCertificateAuthoritiesInjectable from "../../../common/user-preferences/allow-untrusted-certificate-authorities.injectable";
import type { HttpsProxy } from "../../../common/user-preferences/https-proxy.injectable";
import httpsProxyInjectable from "../../../common/user-preferences/https-proxy.injectable";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import { Switch } from "../switch";

interface Dependencies {
  httpsProxy: HttpsProxy;
  allowUntrustedCAs: AllowUntrustedCertificateAuthorities;
}

const NonInjectedLensProxy = observer(({
  httpsProxy,
  allowUntrustedCAs,
}: Dependencies) => {
  const [proxy, setProxy] = React.useState(httpsProxy.value);

  return (
    <section id="proxy">
      <section>
        <h2 data-testid="proxy-header">Proxy</h2>
        <SubTitle title="HTTP Proxy"/>
        <Input
          theme="round-black"
          placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
          value={proxy}
          onChange={setProxy}
          onBlur={() => httpsProxy.set(proxy)}
        />
        <small className="hint">
          Proxy is used only for non-cluster communication.
        </small>
      </section>

      <hr className="small"/>

      <section className="small">
        <SubTitle title="Certificate Trust"/>
        <Switch
          checked={allowUntrustedCAs.value}
          onChange={allowUntrustedCAs.toggle}
        >
          Allow untrusted Certificate Authorities
        </Switch>
        <small className="hint">
          This will make Lens to trust ANY certificate authority without any validations.{" "}
          Needed with some corporate proxies that do certificate re-writing.{" "}
          Does not affect cluster communications!
        </small>
      </section>
    </section>
  );
});

export const LensProxy = withInjectables<Dependencies>(NonInjectedLensProxy, {
  getProps: (di, props) => ({
    ...props,
    httpsProxy: di.inject(httpsProxyInjectable),
    allowUntrustedCAs: di.inject(allowUntrustedCertificateAuthoritiesInjectable),
  }),
});
