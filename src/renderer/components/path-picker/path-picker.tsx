/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { FileFilter, OpenDialogOptions } from "electron";
import { observer } from "mobx-react";
import React from "react";
import { cssNames } from "../../utils";
import { Button } from "../button";
import type { PickPaths } from "./pick.injectable";
import pickPathsInjectable from "./pick.injectable";

export interface PathPickOpts {
  label: string;
  /**
   * Must be a non-negative number. If the number of paths picked is fewer then
   * `onPick` is not called
   */
  minimumPaths?: number;
  onPick: (paths: string[]) => any;
  onCancel?: () => any;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: OpenDialogOptions["properties"];
  securityScopedBookmarks?: boolean;
}

export interface PathPickerProps extends PathPickOpts {
  className?: string;
  disabled?: boolean;
}

interface Dependencies {
  pickPaths: PickPaths;
}

const NonInjectedPathPicker = observer(({
  className,
  label,
  disabled,
  pickPaths,
  ...opts
}: Dependencies & PathPickerProps) => (
  <Button
    primary
    label={label}
    disabled={disabled}
    className={cssNames("PathPicker", className)}
    onClick={() => pickPaths({ label, ...opts })}
  />
));

export const PathPicker = withInjectables<Dependencies, PathPickerProps>(NonInjectedPathPicker, {
  getProps: (di, props) => ({
    ...props,
    pickPaths: di.inject(pickPathsInjectable),
  }),
});
