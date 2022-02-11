/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, makeObservable, isObservableArray, isObservableSet, isObservableMap } from "mobx";
import type { BaseStoreDependencies, BaseStoreParams } from "../base-store";
import { BaseStore } from "../base-store";
import { kubeConfigDefaultPath } from "../k8s/helpers";
import type { AppEventBus } from "../app-event-bus/event-bus";
import { toJS, entries, fromEntries } from "../../renderer/utils";
import { DESCRIPTORS } from "./preferences-helpers";
import type { EditorConfiguration, ExtensionRegistry, KubeconfigSyncValue, UserPreferencesModel, TerminalConfig } from "./preferences-helpers";

export interface UserPreferencesStoreModel {
  lastSeenAppVersion: string;
  preferences: UserPreferencesModel;
}

export interface UserStoreDependencies extends BaseStoreDependencies {
  readonly appEventBus: AppEventBus;
}

export class UserPreferencesStore extends BaseStore<UserPreferencesStoreModel> /* implements UserStoreFlatModel (when strict null is enabled) */ {
  constructor(protected readonly dependencies: UserStoreDependencies, baseStoreParams: BaseStoreParams<UserPreferencesStoreModel> = {}) {
    super(dependencies, {
      ...baseStoreParams,
      name: "lens-user-store",
    });
    makeObservable(this);
  }

  @observable lastSeenAppVersion = "0.0.0";

  /**
   * used in add-cluster page for providing context
   */
  @observable kubeConfigPath = kubeConfigDefaultPath;
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();
  @observable allowTelemetry: boolean;
  @observable allowErrorReporting: boolean;
  @observable allowUntrustedCAs: boolean;
  @observable colorTheme: string;
  @observable terminalTheme: string | undefined;
  @observable localeTimezone: string;
  @observable downloadMirror: string;
  @observable httpsProxy: string;
  @observable shell: string;
  @observable downloadBinariesPath: string;
  @observable kubectlBinariesPath: string;
  @observable terminalCopyOnSelect: boolean;
  @observable terminalConfig: TerminalConfig;
  @observable updateChannel: string;
  @observable extensionRegistryUrl: ExtensionRegistry;

  /**
   * Download kubectl binaries matching cluster version
   */
  @observable downloadKubectlBinaries: boolean;
  @observable openAtLogin: boolean;

  /**
   * The column IDs under each configurable table ID that have been configured
   * to not be shown
   */
  hiddenTableColumns = observable.map<string, Set<string>>();

  /**
   * Monaco editor configs
   */
  @observable editorConfiguration: EditorConfiguration;

  /**
   * The set of file/folder paths to be synced
   */
  syncKubeconfigEntries = observable.map<string, KubeconfigSyncValue>();

  @action
  protected fromStore({ lastSeenAppVersion, preferences }: Partial<UserPreferencesStoreModel> = {}) {
    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    for (const [key, { fromStore }] of entries(DESCRIPTORS)) {
      const curVal = this[key];
      const newVal = fromStore((preferences)?.[key] as never) as never;

      if (
        isObservableArray(curVal)
        || isObservableSet(curVal)
        || isObservableMap(curVal)
      ) {
        curVal.replace(newVal);
      } else {
        this[key] = newVal;
      }
    }
  }

  toJSON(): UserPreferencesStoreModel {
    const preferences = fromEntries(
      entries(DESCRIPTORS)
        .map(([key, { toStore }]) => [key, toStore(this[key] as never)]),
    ) as UserPreferencesModel;

    return toJS({
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences,
    });
  }
}
