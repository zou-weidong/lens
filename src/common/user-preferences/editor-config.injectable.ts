/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { EditorLineNumbers, EditorMinimapConfiguration, MinimapShowSlider, MinimapSide, MinimapSize } from "./preferences-helpers";
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface EditorConfig {
  readonly minimap: Readonly<EditorMinimapConfiguration>;
  toggleMinimapEnabled: () => void;
  setMinimapSide: (side: MinimapSide) => void;
  setMinimapSize: (size: MinimapSize) => void;
  toggleRenderCharacters: () => void;
  setShowSlider: (val: MinimapShowSlider) => void;
  setMaxColumn: (val: number) => void;
  setScale: (val: number) => void;

  readonly tabSize: number;
  setTabSide: (size: number) => void;

  readonly lineNumbers: EditorLineNumbers;
  setLineNumbers: (opt: EditorLineNumbers) => void;

  readonly fontSize: number;
  setFontSize: (size: number) => void;

  readonly fontFamily: string;
  setFontFamily: (family: string) => void;
}

const editorConfigInjectable = getInjectable({
  instantiate: (di): EditorConfig => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get minimap() {
        return store.editorConfiguration.minimap;
      },
      toggleMinimapEnabled: () => {
        store.editorConfiguration.minimap.enabled = !store.editorConfiguration.minimap.enabled;
      },
      setMinimapSide: (val) => {
        store.editorConfiguration.minimap.side = val;
      },
      setMinimapSize: (val) => {
        store.editorConfiguration.minimap.size = val;
      },
      toggleRenderCharacters: () => {
        store.editorConfiguration.minimap.renderCharacters = !store.editorConfiguration.minimap.renderCharacters;
      },
      setShowSlider: (val) => {
        store.editorConfiguration.minimap.showSlider = val;
      },
      setMaxColumn: (val) => {
        store.editorConfiguration.minimap.maxColumn = val;
      },
      setScale: (val) => {
        store.editorConfiguration.minimap.scale = val;
      },
      get tabSize() {
        return store.editorConfiguration.tabSize;
      },
      setTabSide: (val) => {
        store.editorConfiguration.tabSize = val;
      },
      get lineNumbers() {
        return store.editorConfiguration.lineNumbers;
      },
      setLineNumbers: (val) => {
        store.editorConfiguration.lineNumbers = val;
      },
      get fontSize() {
        return store.editorConfiguration.fontSize;
      },
      setFontSize: (val) => {
        store.editorConfiguration.fontSize = val;
      },
      get fontFamily() {
        return store.editorConfiguration.fontFamily;
      },
      setFontFamily: (val) => {
        store.editorConfiguration.fontFamily = val;
      },
    };
  },
  id: "editor-config",
});

export default editorConfigInjectable;

