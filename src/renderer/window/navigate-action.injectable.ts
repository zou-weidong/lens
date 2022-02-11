/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { NavigateAction } from "../../extensions/common-api/catalog";
import navigateInAppInjectable from "../ipc/window/navigate-in-app.injectable";
import type { Navigate } from "../navigation/navigate.injectable";
import navigateInjectable from "../navigation/navigate.injectable";

interface Dependencies {
  navigateRootFrame: Navigate;
  navigate: Navigate;
}

const navigateAction = ({ navigate, navigateRootFrame }: Dependencies): NavigateAction => (
  (url, opts) => {
    const forceRootFrame = opts?.forceRootFrame ?? false;

    if (forceRootFrame) {
      navigateRootFrame(url);
    } else {
      navigate(url);
    }
  }
);

const navigateActionInjectable = getInjectable({
  instantiate: (di) => navigateAction({
    navigate: di.inject(navigateInjectable),
    navigateRootFrame: di.inject(navigateInAppInjectable),
  }),
  id: "navigate-action",
});

export default navigateActionInjectable;
