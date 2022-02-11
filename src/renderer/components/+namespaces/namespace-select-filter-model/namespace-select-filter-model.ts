/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observable, makeObservable, action, untracked } from "mobx";
import type { NamespaceStore } from "../namespace-store/namespace.store";
import type { SelectOption } from "../../select";

interface Dependencies {
  namespaceStore: NamespaceStore;
  isMac: boolean;
}

export class NamespaceSelectFilterModel {
  private readonly namespaceStore: NamespaceStore;
  private isSelectionKey: (event: React.KeyboardEvent) => boolean;

  constructor({ isMac, namespaceStore }: Dependencies) {
    makeObservable(this, {
      menuIsOpen: observable,
      closeMenu: action,
      openMenu: action,
      reset: action,
    });

    this.namespaceStore = namespaceStore;
    this.isSelectionKey = isMac
      ? (event) => event.key === "Meta"
      : (event) => event.key === "Control";
  }

  menuIsOpen = false;

  closeMenu = () => {
    this.menuIsOpen = false;
  };

  openMenu = () => {
    this.menuIsOpen = true;
  };

  get selectedNames() {
    return untracked(() => this.namespaceStore.selectedNames);
  }

  isSelected = (namespace: string | string[]) =>
    this.namespaceStore.hasContext(namespace);

  selectSingle = (namespace: string) => {
    this.namespaceStore.selectSingle(namespace);
  };

  selectAll = () => {
    this.namespaceStore.selectAll();
  };

  onChange = ([{ value: namespace }]: SelectOption[]) => {
    if (namespace) {
      if (this.isMultiSelection) {
        this.namespaceStore.toggleSingle(namespace);
      } else {
        this.namespaceStore.selectSingle(namespace);
      }
    } else {
      this.namespaceStore.selectAll();
    }
  };

  onClick = () => {
    if (!this.menuIsOpen) {
      this.openMenu();
    } else if (!this.isMultiSelection) {
      this.closeMenu();
    }
  };

  private isMultiSelection = false;

  onKeyDown = (event: React.KeyboardEvent) => {
    if (this.isSelectionKey(event)) {
      this.isMultiSelection = true;
    }
  };

  onKeyUp = (event: React.KeyboardEvent) => {
    if (this.isSelectionKey(event)) {
      this.isMultiSelection = false;
    }
  };

  reset = () => {
    this.isMultiSelection = false;
    this.closeMenu();
  };
}
