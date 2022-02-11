/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addCatalogCategoryInjectable from "../add-category.injectable";
import { WebLinkCategory } from "./web-link";

const webLinkCatalogCategoryInjectable = getInjectable({
  instantiate: (di) => {
    const addCatalogCategory = di.inject(addCatalogCategoryInjectable);
    const webLinkCategory = new WebLinkCategory();

    addCatalogCategory(webLinkCategory);

    return webLinkCategory;
  },
  id: "web-link-catalog-category",
});

export default webLinkCatalogCategoryInjectable;
