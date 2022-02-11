/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type ElectronStore from "electron-store";
import type { Migrations } from "conf/dist/source/types";
import { getOrInsert, iter } from "../../common/utils";
import type { LensLogger } from "../../common/logger";

export type Migration = (log: (message: string, meta?: Record<string, any>) => void, store: ElectronStore<any>) => void;

export interface MigrationDeclaration {
  version: string;
  run: Migration;
}

export function joinMigrations(logger: LensLogger, declarations: MigrationDeclaration[]): Migrations<any> {
  const migrations = new Map<string, Migration[]>();

  for (const decl of declarations) {
    getOrInsert(migrations, decl.version, []).push(decl.run);
  }

  return Object.fromEntries(
    iter.map(
      migrations,
      ([v, fns]) => [v, (store: ElectronStore<any>) => {
        logger.debug(`Running ${v} migration`);

        for (const fn of fns) {
          fn(logger.info, store);
        }
      }],
    ),
  );
}
