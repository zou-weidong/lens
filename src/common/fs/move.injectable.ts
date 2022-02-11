/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MoveOptions } from "fs-extra";
import fsInjectable from "./fs.injectable";

export type MoveResult = "success" | "dest-exists" | "src-not-exist";
export type Move = (src: string, dest: string, options?: MoveOptions) => Promise<MoveResult>;

const moveInjectable = getInjectable({
  id: "fs-move",
  instantiate: (di): Move => {
    const { move } = di.inject(fsInjectable);

    return async (src, dest, options) => {
      try {
        /**
         * This `?? {}` is to bypass a bug in fs-extra
         *
         * https://github.com/jprichardson/node-fs-extra/issues/947
         */
        await move(src, dest, options ?? {});

        return "success";
      } catch (error) {
        if (error.code === "ENOENT" && error.path === src) {
          return "src-not-exist";
        }

        if (error.message === "dest already exists.") {
          return "dest-exists";
        }

        throw error;
      }
    };
  },
});

export default moveInjectable;
