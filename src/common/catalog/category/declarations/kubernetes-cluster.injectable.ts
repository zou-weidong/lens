/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addCatalogCategoryInjectable from "../add-category.injectable";
import { KubernetesClusterCategory } from "./kubernetes-cluster";

const kubernetesClusterCategoryInjectable = getInjectable({
  instantiate: (di) => {
    const addCatalogCategory = di.inject(addCatalogCategoryInjectable);
    const kubernetesClusterCategory = new KubernetesClusterCategory();

    addCatalogCategory(kubernetesClusterCategory);

    return kubernetesClusterCategory;
  },
  id: "kubernetes-cluster-category",
});

export default kubernetesClusterCategoryInjectable;
