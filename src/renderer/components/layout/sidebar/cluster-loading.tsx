/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./cluster.module.scss";

import React from "react";
import { Avatar } from "../../avatar";

export const SidebarClusterLoading = () => (
  <div className={styles.SidebarCluster}>
    <Avatar
      title="??"
      background="var(--halfGray)"
      size={40}
      className={styles.loadingAvatar}
    />
    <div className={styles.loadingClusterName} />
  </div>
);
