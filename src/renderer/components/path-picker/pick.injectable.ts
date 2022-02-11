/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PathPickOpts } from "./path-picker";
import openFileDialogInjectable from "../../ipc/file-dialog/open.injectable";
import type { OpenFileDialog } from "../../../common/ipc/file-dialog/open.token";
import type { ErrorNotification } from "../notifications/error.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";

export type PickPaths = (opts: PathPickOpts) => void;

interface Dependencies {
  openFileDialog: OpenFileDialog;
  errorNotification: ErrorNotification;
}

const pickPaths = ({
  openFileDialog,
  errorNotification,
}: Dependencies): PickPaths => (
  ({ onPick, onCancel, label, minimumPaths = 0, ...opts }) => {
    if (minimumPaths < 0) {
      throw new TypeError("minimumPaths must be a non-negative number");
    }

    (async () => {
      try {
        const result = await openFileDialog({
          message: label,
          ...opts,
        });

        if (result.canceled === true) {
          try {
            await onCancel?.();
          } catch (error) {
            errorNotification(`onCancel failed for PickPaths: ${error}`);
          }
        } else if (result.filePaths.length >= minimumPaths) {
          try {
            await onPick(result.filePaths);
          } catch (error) {
            errorNotification(`onPick failed for PickPaths: ${error}`);
          }
        }
      } catch (error) {
        errorNotification(`Failed to open file dialog: ${error}`);
      }
    })();
  }
);

const pickPathsInjectable = getInjectable({
  instantiate: (di) => pickPaths({
    openFileDialog: di.inject(openFileDialogInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
  }),
  id: "pick-paths",
});

export default pickPathsInjectable;
