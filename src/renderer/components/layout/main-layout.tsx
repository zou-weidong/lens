/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./main-layout.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { ErrorBoundary } from "../error-boundary";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SidebarStorageState } from "./sidebar/storage.injectable";
import sidebarStorageInjectable, { defaultSidebarWidth } from "./sidebar/storage.injectable";
import type { StorageLayer } from "../../utils/storage/create.injectable";

export interface MainLayoutProps {
  sidebar: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  children?: React.ReactChild | React.ReactChild[];
}

/**
 * Main layout is commonly used as a wrapper for "global pages"
 *
 * @link https://api-docs.k8slens.dev/master/extensions/capabilities/common-capabilities/#global-pages
 */

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
}

const NonInjectedMainLayout = observer(({
  sidebarStorage,
  className,
  footer,
  children,
  sidebar,
}: Dependencies & MainLayoutProps) => {
  const onSidebarResize = (width: number) => {
    sidebarStorage.merge({ width });
  };

  return (
    <div
      className={cssNames(styles.mainLayout, className)}
      style={{ "--sidebar-width": `${sidebarStorage.get().width}px` } as React.CSSProperties}
    >
      <div className={styles.sidebar}>
        {sidebar}
        <ResizingAnchor
          direction={ResizeDirection.HORIZONTAL}
          placement={ResizeSide.TRAILING}
          growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
          getCurrentExtent={() => sidebarStorage.get().width}
          onDrag={onSidebarResize}
          onDoubleClick={() => onSidebarResize(defaultSidebarWidth)}
          minExtent={120}
          maxExtent={400}
        />
      </div>

      <div className={styles.contents}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

      <div className={styles.footer}>
        {footer}
      </div>
    </div>
  );
});

export const MainLayout = withInjectables<Dependencies, MainLayoutProps>(NonInjectedMainLayout, {
  getProps: (di, props) => ({
    ...props,
    sidebarStorage: di.inject(sidebarStorageInjectable),
  }),
});

