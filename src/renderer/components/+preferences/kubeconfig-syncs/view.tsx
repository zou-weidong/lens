/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Notice } from "../../+extensions/notice";
import type { KubeConfigSyncs } from "../../../../common/user-preferences/kubeconfig-syncs.injectable";
import kubeconfigSyncsInjectable from "../../../../common/user-preferences/kubeconfig-syncs.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import { iter } from "../../../utils";
import { SubTitle } from "../../layout/sub-title";
import { PathPicker } from "../../path-picker/path-picker";
import { Spinner } from "../../spinner";
import { RemovableItem } from "../removable-item";
import type { GetAllEntries } from "./get-all-entries.injectable";
import getAllEntriesInjectable from "./get-all-entries.injectable";
import type { GetMapEntry, KubeconfigSyncParsedValue } from "./get-map-entry.injectable";
import getMapEntryInjectable from "./get-map-entry.injectable";

interface Entry extends KubeconfigSyncParsedValue {
  filePath: string;
}

interface Dependencies {
  isWindows: boolean;
  getMapEntry: GetMapEntry;
  getAllEntries: GetAllEntries;
  kubeConfigSyncs: KubeConfigSyncs;
}

@observer
class NonInjectedKubeconfigSyncs extends React.Component<Dependencies> {
  syncs = observable.map<string, KubeconfigSyncParsedValue>();
  @observable loaded = false;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const mapEntries = await Promise.all(
      iter.map(
        this.props.kubeConfigSyncs.value,
        ([filePath, ...value]) => this.props.getMapEntry({ filePath, ...value }),
      ),
    );

    this.syncs.replace(mapEntries);
    this.loaded = true;

    disposeOnUnmount(this, [
      reaction(
        () => Array.from(this.syncs.entries(), ([filePath, { data }]) => [filePath, data] as const),
        syncs => {
          this.props.kubeConfigSyncs.replace(syncs);
        },
      ),
    ]);
  }

  @computed get syncsList(): Entry[] | undefined {
    if (!this.loaded) {
      return undefined;
    }

    return Array.from(this.syncs.entries(), ([filePath, value]) => ({ filePath, ...value }));
  }

  onPick = async (filePaths: string[]) => {
    this.syncs.merge(await this.props.getAllEntries(filePaths));
  };

  getIconName(entry: Entry) {
    switch (entry.info.type) {
      case "file":
        return "description";
      case "folder":
        return "folder";
      case "unknown":
        return "help_outline";
    }
  }

  renderEntry = (entry: Entry) => {
    return (
      <RemovableItem
        key={entry.filePath}
        onRemove={() => this.syncs.delete(entry.filePath)}
        className="mt-3"
        icon={this.getIconName(entry)}
      >
        <div className="flex-grow break-all">
          {entry.filePath}
        </div>
      </RemovableItem>
    );
  };

  renderEntries() {
    const entries = this.syncsList;

    if (!entries) {
      return (
        <div className="loading-spinner">
          <Spinner />
        </div>
      );
    }

    if (!entries.length) {
      return (
        <Notice className="mt-3">
          <div className="flex-grow text-center">No files and folders have been synced yet</div>
        </Notice>
      );
    }

    return (
      <div>
        {entries.map(this.renderEntry)}
      </div>
    );
  }

  renderSyncButtons() {
    if (this.props.isWindows) {
      return (
        <div className="flex gaps align-center mb-5">
          <PathPicker
            label="Sync file(s)"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openFile"]}
          />
          <span>or</span>
          <PathPicker
            label="Sync folder(s)"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openDirectory"]}
          />
        </div>
      );
    }

    return (
      <div className="self-start mb-5">
        <PathPicker
          label="Sync Files and Folders"
          onPick={this.onPick}
          buttonLabel="Sync"
          properties={["showHiddenFiles", "multiSelections", "openFile", "openDirectory"]}
        />
      </div>
    );
  }

  render() {
    return (
      <>
        {this.renderSyncButtons()}
        <SubTitle title="Synced Items" className="pt-5"/>
        {this.renderEntries()}
      </>
    );
  }
}

export const KubeconfigSyncs = withInjectables<Dependencies>(NonInjectedKubeconfigSyncs, {
  getProps: (di, props) => ({
    ...props,
    getAllEntries: di.inject(getAllEntriesInjectable),
    getMapEntry: di.inject(getMapEntryInjectable),
    isWindows: di.inject(isWindowsInjectable),
    kubeConfigSyncs: di.inject(kubeconfigSyncsInjectable),
  }),
});
