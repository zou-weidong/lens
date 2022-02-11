/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OpenDialogOptions } from "electron";
import type { FilePickingResult } from "../../../main/dialog/file-picker.injectable";
import { getChannelInjectionToken } from "../channel";

export type OpenFileDialog = (dialogOptions: OpenDialogOptions) => Promise<FilePickingResult>;

export const openFileDialogInjectionToken = getChannelInjectionToken<OpenFileDialog>("file-picker:open");
