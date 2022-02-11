/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import type { FindEntityById } from "../../../common/catalog/entity/find-by-id.injectable";
import type { ClusterId } from "../../../common/clusters/cluster-types";
import type { ShellEnvModifier } from "./types";
import { getInjectable } from "@ogre-tools/injectable";
import findEntityByIdInjectable from "../../../common/catalog/entity/find-by-id.injectable";
import shellEnvModifiersInjectable from "./env-modifiers.injectable";

export type TerminalShellEnvModify = (clusterId: ClusterId, env: Record<string, string>) => Record<string, string>;

interface Dependencies {
  modifiers: IComputedValue<ShellEnvModifier[]>;
  getEntityById: FindEntityById;
}

const terminalShellEnvModify = ({ modifiers, getEntityById }: Dependencies): TerminalShellEnvModify => (
  (clusterId, env) => {
    const envModifiers = modifiers.get();
    const entity = getEntityById(clusterId);

    if (entity) {
      const ctx = { catalogEntity: entity };

      // clone it so the passed value is not also modified
      env = JSON.parse(JSON.stringify(env));
      env = envModifiers.reduce((env, modifier) => modifier(ctx, env), env);
    }

    return env;
  }
);

const terminalShellEnvModifyInjectable = getInjectable({
  instantiate: (di) => terminalShellEnvModify({
    getEntityById: di.inject(findEntityByIdInjectable),
    modifiers: di.inject(shellEnvModifiersInjectable),
  }),
  id: "terminal-shell-env-modify",
});

export default terminalShellEnvModifyInjectable;

