/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

export interface AppPreferenceComponents {
  Hint: React.ComponentType;
  Input: React.ComponentType;
}

export interface AppPreferenceRegistration {
  title: string;
  id?: string;
  showInPreferencesTab?: string;
  components: AppPreferenceComponents;
}

export interface RegisteredAppPreference extends AppPreferenceRegistration {
  id: string;
}

const titleReplaceRegex = /[^0-9a-zA-Z]+/g;

const appPreferencesInjectable = getInjectable({
  id: "app-preferences",
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => (
      extensions.get()
        .flatMap((extension) => extension.appPreferences)
        .map(({ id, ...rest }) => ({
          id: id || rest.title.toLowerCase().replace(titleReplaceRegex, "-"),
          ...rest,
        }))
    ));
  },
});

export default appPreferencesInjectable;
