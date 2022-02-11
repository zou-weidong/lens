/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "../catalog.module.scss";

import { getInjectable } from "@ogre-tools/injectable";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import renderEntityNameInjectable from "./render-entity-name.injectable";

const nameCategoryColumnInjectable = getInjectable({
  instantiate: (di): RegisteredAdditionalCategoryColumn => {
    const renderEntityName = di.inject(renderEntityNameInjectable);

    return {
      id: "name",
      priority: 0,
      renderCell: renderEntityName,
      titleProps: {
        title: "Name",
        className: styles.entityName,
        id: "name",
        sortBy: "name",
      },
      searchFilter: entity => entity.getName(),
      sortCallback: entity => `name=${entity.getName()}`,
    };
  },
  id: "name-category-column",
});

export default nameCategoryColumnInjectable;
