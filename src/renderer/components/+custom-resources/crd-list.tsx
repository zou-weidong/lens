/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-list.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { CustomResourceDefinitionStore } from "./definitions/store";
import type { SelectOption } from "../select";
import { Select } from "../select";
import { Icon } from "../icon";
import type { PageParam } from "../../navigation/page-param";
import { withInjectables } from "@ogre-tools/injectable-react";
import crdGroupsUrlParamInjectable from "./groups-url-param.injectable";
import customResourceDefinitionStoreInjectable from "./definitions/store.injectable";

enum columnId {
  kind = "kind",
  group = "group",
  version = "version",
  scope = "scope",
  age = "age",
}

interface Dependencies {
  crdGroupsUrlParam: PageParam<string[]>;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

@observer
class NonInjectedCustomResourceDefinitions extends React.Component<Dependencies> {
  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  get selectedGroups(): string[] {
    return this.props.crdGroupsUrlParam.get();
  }

  @computed get items() {
    if (this.selectedGroups.length) {
      return this.props.customResourceDefinitionStore.items.filter(item => this.selectedGroups.includes(item.getGroup()));
    }

    return this.props.customResourceDefinitionStore.items; // show all by default
  }

  toggleSelection(group: string) {
    const groups = new Set(this.props.crdGroupsUrlParam.get());

    if (groups.has(group)) {
      groups.delete(group);
    } else {
      groups.add(group);
    }
    this.props.crdGroupsUrlParam.set([...groups]);
  }

  render() {
    const { items, selectedGroups } = this;

    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="crd"
        className="CrdList"
        store={this.props.customResourceDefinitionStore}
        items={items}
        sortingCallbacks={{
          [columnId.kind]: crd => crd.getResourceKind(),
          [columnId.group]: crd => crd.getGroup(),
          [columnId.version]: crd => crd.getVersion(),
          [columnId.scope]: crd => crd.getScope(),
        }}
        searchFilters={[
          crd => crd.getResourceKind(),
          crd => crd.getGroup(),
          crd => crd.getVersion(),
          crd => crd.getScope(),
        ]}
        renderHeaderTitle="Custom Resources"
        customizeHeader={({ filters, ...headerPlaceholders }) => {
          let placeholder = <>All groups</>;

          if (selectedGroups.length == 1) placeholder = <>Group: {selectedGroups[0]}</>;
          if (selectedGroups.length >= 2) placeholder = <>Groups: {selectedGroups.join(", ")}</>;

          return {
            // todo: move to global filters
            filters: (
              <>
                {filters}
                <Select
                  className="group-select"
                  placeholder={placeholder}
                  options={Object.keys(this.props.customResourceDefinitionStore.groups)}
                  onChange={({ value: group }: SelectOption) => this.toggleSelection(group)}
                  closeMenuOnSelect={false}
                  controlShouldRenderValue={false}
                  formatOptionLabel={({ value: group }: SelectOption) => {
                    const isSelected = selectedGroups.includes(group);

                    return (
                      <div className="flex gaps align-center">
                        <Icon small material="folder"/>
                        <span>{group}</span>
                        {isSelected && <Icon small material="check" className="box right"/>}
                      </div>
                    );
                  }}
                />
              </>
            ),
            ...headerPlaceholders,
          };
        }}
        renderTableHeader={[
          { title: "Resource", className: "kind", sortBy: columnId.kind, id: columnId.kind },
          { title: "Group", className: "group", sortBy: columnId.group, id: columnId.group },
          { title: "Version", className: "version", sortBy: columnId.version, id: columnId.version },
          { title: "Scope", className: "scope", sortBy: columnId.scope, id: columnId.scope },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={crd => [
          <Link key="link" to={crd.getResourceUrl()} onClick={stopPropagation}>
            {crd.getResourceKind()}
          </Link>,
          crd.getGroup(),
          crd.getVersion(),
          crd.getScope(),
          crd.getAge(),
        ]}
      />
    );
  }
}

export const CustomResourceDefinitions = withInjectables<Dependencies>(NonInjectedCustomResourceDefinitions, {
  getProps: (di, props) => ({
    ...props,
    crdGroupsUrlParam: di.inject(crdGroupsUrlParamInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
  }),
});
