/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./catalog.module.scss";

import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { CatalogEntity } from "../../../common/catalog/entity";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { noop } from "../../utils";
import { Badge } from "../badge";
import searchUrlParamInjectable from "../input/search-param.injectable";

export type GetLabelBadges = (entity: CatalogEntity, onClick?: (evt: React.MouseEvent<any, MouseEvent>) => void) => React.ReactElement[];

const getLabelBadgesInjectable = getInjectable({
  id: "get-label-badges",
  instantiate: (di): GetLabelBadges => {
    const searchUrlParam = di.inject(searchUrlParamInjectable);

    return (entity, onClick = noop) => (
      KubeObject.stringifyLabels(entity.metadata.labels)
        .map(label => (
          <Badge
            scrollable
            className={styles.badge}
            key={label}
            label={label}
            title={label}
            onClick={(event) => {
              searchUrlParam.set(label);
              onClick?.(event);
              event.stopPropagation();
            }}
            expandable={false}
          />
        ))
    );
  },
});

export default getLabelBadgesInjectable;
