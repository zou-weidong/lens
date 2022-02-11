/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WebContents, webContents } from "electron";

export type GetAllWebContents = () => WebContents[];

const getAllWebContentsInjectable = getInjectable({
  instantiate: (): GetAllWebContents => () => {
    const res = webContents.getAllWebContents();

    if (!Array.isArray(res)) {
      return [];
    }

    return res;
  },
  id: "get-all-web-contents",
});

export default getAllWebContentsInjectable;
