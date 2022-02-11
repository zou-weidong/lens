/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ChildLoggerArgs } from "../logger/child-logger.injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";
import type { HotbarDependencies } from "./hotbar";
import { Hotbar } from "./hotbar";
import type { CreateHotbarData } from "./hotbar-types";
import { defaultHotbarCells } from "./hotbar-types";
import { onTooManyHotbarItemsInjectionToken } from "./too-many-items.token";
import * as uuid from "uuid";
import { tuple } from "../utils";
import type { LensLogger } from "../logger";

export type CreateHotbar = (data: CreateHotbarData) => [string, Hotbar];

interface Dependencies {
  createChildLogger: (args: ChildLoggerArgs) => LensLogger;
  onTooManyHotbarItems: () => void;
}

const createHotbar = ({ createChildLogger, onTooManyHotbarItems }: Dependencies): CreateHotbar => (
  (data) => {
    const {
      id = uuid.v4(),
      name,
      items = tuple.filled(defaultHotbarCells, null),
    } = data;
    const deps: HotbarDependencies = {
      onTooManyHotbarItems,
      logger: createChildLogger({
        prefix: "HOTBAR",
        defaultMeta: { name: data.name },
      }),
    };

    return [id, new Hotbar(deps, name, items)];
  }
);

const createHotbarInjectable = getInjectable({
  instantiate: (di) => createHotbar({
    createChildLogger: (args) => di.inject(childLoggerInjectable, args),
    onTooManyHotbarItems: di.inject(onTooManyHotbarItemsInjectionToken),
  }),
  id: "create-hotbar",
});

export default createHotbarInjectable;
