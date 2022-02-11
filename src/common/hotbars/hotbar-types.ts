/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Tuple } from "../utils";

export type HotbarItems = Tuple<HotbarItem | null, typeof defaultHotbarCells>;

export interface HotbarItem {
  entity: {
    uid: string;
    name?: string;
    source?: string;
  };
  params?: {
    [key: string]: string;
  };
}

export interface CreateHotbarData {
  id?: string;
  name: string;
  items?: HotbarItems;
}

export interface CreateHotbarOptions {
  setActive?: boolean;
}

export const defaultHotbarCells = 12; // Number is chosen to easy hit any item with keyboard
