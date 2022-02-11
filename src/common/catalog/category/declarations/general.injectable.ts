/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addCatalogCategoryInjectable from "../add-category.injectable";
import { GeneralCategory } from "./general";

const generalCatalogCategoryInjectable = getInjectable({
  instantiate: (di) => {
    const addCatalogCategory = di.inject(addCatalogCategoryInjectable);
    const generalCategory = new GeneralCategory();

    addCatalogCategory(generalCategory);

    return generalCategory;
  },
  id: "general-catalog-category",
});

export default generalCatalogCategoryInjectable;
