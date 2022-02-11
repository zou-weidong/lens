/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { catalogURL } from "../../../common/routes";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";

export interface WelcomeMenuRegistration {
  title: string | (() => string);
  icon: string;
  click: () => void | Promise<void>;
}

const welcomeMenuItemsInjectable = getInjectable({
  id: "welcome-menu-items",
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);
    const navigate = di.inject(navigateInjectable);

    return computed(() => [
      {
        title: "Browse Clusters in Catalog",
        icon: "view_list",
        click: () =>
          navigate(
            catalogURL({
              params: { group: "entity.k8slens.dev", kind: "KubernetesCluster" },
            }),
          ),
      },
      ...extensions.get().flatMap((extension) => extension.welcomeMenus),
    ]);
  },
});

export default welcomeMenuItemsInjectable;
