/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getReleaseValues } from "../../../../common/k8s-api/endpoints";
import { asyncComputed } from "@ogre-tools/injectable-react";
import releaseInjectable from "./release.injectable";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";

const releaseValuesInjectable = getInjectable({
  instantiate: (di) => {
    const helmRelease = di.inject(releaseInjectable);
    const userSuppliedValuesAreShown = di.inject(userSuppliedValuesAreShownInjectable);
    const errorNotification = di.inject(errorNotificationInjectable);

    return asyncComputed(async () => {
      const release = helmRelease.get();

      // TODO: Figure out way to get rid of defensive code
      if (!release) {
        return "";
      }

      try {
        return await getReleaseValues(release.getName(), release.getNs(), !userSuppliedValuesAreShown.value) ?? "";
      } catch (error) {
        errorNotification(`Failed to load values for ${release.getName()}: ${error}`);
      }

      return "";
    });
  },
  id: "release-values",
});

export default releaseValuesInjectable;
