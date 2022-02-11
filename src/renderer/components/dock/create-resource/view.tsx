/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { GroupSelectOption, SelectOption } from "../../select";
import { Select } from "../../select";
import yaml from "js-yaml";
import type { IComputedValue } from "mobx";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { CreateResourceTabStore } from "./store";
import type { DockTab } from "../dock/store";
import { EditorPanel } from "../editor-panel";
import { InfoPanel } from "../info-panel";
import logger from "../../../../common/logger";
import { prevDefault } from "../../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import createResourceTabStoreInjectable from "./store.injectable";
import createResourceTemplatesInjectable from "./create-resource-templates.injectable";
import type { OkNotification } from "../../notifications/ok.injectable";
import type { ErrorNotification } from "../../notifications/error.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import okNotificationInjectable from "../../notifications/ok.injectable";
import type { ShowDetails } from "../../kube-object/details/show.injectable";
import showDetailsInjectable from "../../kube-object/details/show.injectable";
import type { ResourceApplierApi } from "../../../../common/k8s-api/endpoints";
import resourceApplierApiInjectable from "../../../../common/k8s-api/endpoints/resource-applier.api.injectable";

export interface CreateResourceProps {
  tab: DockTab;
}

interface Dependencies {
  createResourceTemplates: IComputedValue<GroupSelectOption<SelectOption>[]>;
  createResourceTabStore: CreateResourceTabStore;
  resourceApplierApi: ResourceApplierApi;
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  showDetails: ShowDetails;
}

@observer
class NonInjectedCreateResource extends React.Component<CreateResourceProps & Dependencies> {
  @observable error = "";

  constructor(props: CreateResourceProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return this.props.createResourceTabStore.getData(this.tabId);
  }

  onChange = (value: string) => {
    this.error = ""; // reset first, validation goes later
    this.props.createResourceTabStore.setData(this.tabId, value);
  };

  onError = (error: Error | string) => {
    this.error = error.toString();
  };

  onSelectTemplate = (item: SelectOption<string>) => {
    this.props.createResourceTabStore.setData(this.tabId, item.value);
  };

  create = async (): Promise<void> => {
    if (this.error || !this.data.trim()) {
      // do not save when field is empty or there is an error
      return;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.data).filter(Boolean);

    if (resources.length === 0) {
      return void logger.info("Nothing to create");
    }

    const creatingResources = resources.map(async (resource: string) => {
      try {
        const data = await this.props.resourceApplierApi.update(resource);
        const { kind, apiVersion, metadata: { name, namespace }} = data;

        const showDetails = () => {
          this.props.showDetails({ kind, apiVersion, name, namespace });
          close();
        };

        const close = this.props.okNotification(
          <p>
            {kind} <a onClick={prevDefault(showDetails)}>{name}</a> successfully created.
          </p>,
        );
      } catch (error) {
        this.props.errorNotification(error?.toString() ?? "Unknown error occured");
      }
    });

    await Promise.allSettled(creatingResources);
  };

  renderControls() {
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions={false}
          controlShouldRenderValue={false} // always keep initial placeholder
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.props.createResourceTemplates.get()}
          menuPlacement="top"
          themeName="outlined"
          onChange={ this.onSelectTemplate}
        />
      </div>
    );
  }

  render() {
    const { tabId, data, error } = this;

    return (
      <div className="CreateResource flex column">
        <InfoPanel
          tabId={tabId}
          error={error}
          controls={this.renderControls()}
          submit={this.create}
          submitLabel="Create"
          showNotifications={false}
        />
        <EditorPanel
          tabId={tabId}
          value={data}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}

export const CreateResource = withInjectables<Dependencies, CreateResourceProps>(NonInjectedCreateResource, {
  getProps: (di, props) => ({
    ...props,
    createResourceTabStore: di.inject(createResourceTabStoreInjectable),
    createResourceTemplates: di.inject(createResourceTemplatesInjectable),
    okNotification: di.inject(okNotificationInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    showDetails: di.inject(showDetailsInjectable),
    resourceApplierApi: di.inject(resourceApplierApiInjectable),
  }),
});
