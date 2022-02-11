/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type * as registries from "./registries";
import { Disposers, LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import type { CatalogEntity } from "../common/catalog/entity";
import type { Disposer } from "../common/utils";
import type { EntityFilter } from "../renderer/catalog/entity/registry";
import type { TopBarRegistration } from "../renderer/components/layout/top-bar/top-bar-registration";
import type { KubernetesCluster } from "../common/catalog/entity/declarations";
import type { WelcomeMenuRegistration } from "../renderer/components/+welcome/menu-items.injectable";
import type { WelcomeBannerRegistration } from "../renderer/components/+welcome/banner-items.injectable";
import type { CommandRegistration } from "../renderer/components/command-palette/registered-commands/commands";
import type { AppPreferenceRegistration } from "../renderer/components/+preferences/app-preferences.injectable";
import type { AdditionalCategoryColumnRegistration } from "../renderer/components/+catalog/custom-category-columns";
import type { CustomCategoryViewRegistration } from "../renderer/components/+catalog/custom-views";
import type { StatusBarRegistration } from "../renderer/components/status-bar/status-bar-registration";
import type { WorkloadsOverviewDetailRegistration } from "../renderer/components/+workloads-overview/workloads-overview-detail-registration";
import type { KubeObjectStatusRegistration } from "../renderer/components/kube-object-status-icon/kube-object-status-registration";
import type { KubeObjectMenuRegistration } from "../renderer/components/kube-object-menu/registration";
import type { LensRendererExtensionDependencies } from "./lens-extension-set-dependencies";
import { extensionDependencies } from "./lens-extension-set-dependencies";
import type { CategoryFilter } from "../renderer/catalog/category/registry";

export class LensRendererExtension extends LensExtension<LensRendererExtensionDependencies> {
  globalPages: registries.PageRegistration[] = [];
  clusterPages: registries.PageRegistration[] = [];
  clusterPageMenus: registries.ClusterPageMenuRegistration[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  entitySettings: registries.EntitySettingRegistration[] = [];
  statusBarItems: StatusBarRegistration[] = [];
  kubeObjectDetailItems: registries.KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: KubeObjectMenuRegistration[] = [];
  kubeWorkloadsOverviewItems: WorkloadsOverviewDetailRegistration[] = [];
  commands: CommandRegistration[] = [];
  welcomeMenus: WelcomeMenuRegistration[] = [];
  welcomeBanners: WelcomeBannerRegistration[] = [];
  catalogEntityDetailItems: registries.CatalogEntityDetailRegistration<CatalogEntity>[] = [];
  topBarItems: TopBarRegistration[] = [];
  additionalCategoryColumns: AdditionalCategoryColumnRegistration[] = [];
  customCategoryViews: CustomCategoryViewRegistration[] = [];

  navigate(pageId?: string, params?: Record<string, any>): void;
  /**
   * @deprecated This function is not really async, it just returns a resolved promise
   */
  navigate<P>(pageId?: string, params?: Record<string, any>): Promise<P extends void ? void : void>;
  navigate<P>(pageId?: string, params: Record<string, any> = {}): Promise<P extends void ? void : void> {
    this[extensionDependencies].navigate(getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params,
    }));

    return Promise.resolve();
  }

  /**
   * Defines if extension is enabled for a given cluster. This method is only
   * called when the extension is created within a cluster frame.
   *
   * The default implementation is to return `true`
   */
  async isEnabledForCluster(cluster: KubernetesCluster): Promise<Boolean> {
    return (void cluster) || true;
  }

  /**
   * Add a filtering function for the catalog entities. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those entities which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogFilter(fn: EntityFilter): Disposer {
    const dispose = this[extensionDependencies].addEntityFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }

  /**
   * Add a filtering function for the catalog categories. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those categories which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    const dispose = this[extensionDependencies].addCategoryFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }
}
