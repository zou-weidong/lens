/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import extensionRegistryUrlInjectable, { ExtensionRegistryUrl } from "../../../common/user-preferences/extension-registry.injectable";
import { defaultExtensionRegistryUrl, ExtensionRegistryLocation } from "../../../common/user-preferences/preferences-helpers";
import { promiseExecFile } from "../../utils";
import type { ErrorNotification } from "../notifications/error.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";

interface Dependencies {
  extensionRegistryUrl: ExtensionRegistryUrl;
  errorNotification: ErrorNotification;
}

const getBaseRegistryUrl = ({
  extensionRegistryUrl,
  errorNotification,
}: Dependencies) => async () => {
  switch (extensionRegistryUrl.value.location) {
    case ExtensionRegistryLocation.CUSTOM:
      return extensionRegistryUrl.value.customUrl;

    case ExtensionRegistryLocation.NPMRC: {
      try {
        const filteredEnv = Object.fromEntries(
          Object.entries(process.env)
            .filter(([key]) => !key.startsWith("npm")),
        );
        const { stdout } = await promiseExecFile("npm", ["config", "get", "registry"], { env: filteredEnv });

        return stdout.trim();
      } catch (error) {
        errorNotification(<p>Failed to get configured registry from <code>.npmrc</code>. Falling back to default registry</p>);
        console.warn("[EXTENSIONS]: failed to get configured registry from .npmrc", error);
      }
      // fallthrough
    }
    default:
    case ExtensionRegistryLocation.DEFAULT:
      return defaultExtensionRegistryUrl;
  }
};

const getBaseRegistryUrlInjectable = getInjectable({
  instantiate: (di) => getBaseRegistryUrl({
    extensionRegistryUrl: di.inject(extensionRegistryUrlInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
  }),
  id: "get-base-registry-url",
});

export default getBaseRegistryUrlInjectable;
