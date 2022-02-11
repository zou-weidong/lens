/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpc } from "./override-ipc";
import type { GetDiForUnitTestingArgs } from "./common-types";

export function getDisForUnitTesting(args?: GetDiForUnitTestingArgs) {
  const rendererDi = getRendererDi(args);
  const mainDi = getMainDi(args);

  overrideIpc({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: async () => {
      await mainDi.runSetups();
      await rendererDi.runSetups();
    },
  };
}
