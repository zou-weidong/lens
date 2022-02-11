/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { supportedExtensionFormats } from "./supported-extension-formats";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import directoryForDownloadsInjectable from "../../../common/paths/downloads.injectable";
import type { PickPaths } from "../path-picker/pick.injectable";
import pickPathsInjectable from "../path-picker/pick.injectable";

export type InstallFromSelectFileDialog = () => void;

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>;
  directoryForDownloads: string;
  pickPaths: PickPaths;
}

const installFromSelectFileDialog = ({
  attemptInstalls,
  directoryForDownloads,
  pickPaths,
}: Dependencies): InstallFromSelectFileDialog => (
  () => pickPaths({
    defaultPath: directoryForDownloads,
    properties: ["openFile", "multiSelections"],
    label: `Select extensions to install (formats: ${supportedExtensionFormats.join(", ")})`,
    onPick: attemptInstalls,
    buttonLabel: "Use configuration",
    filters: [{ name: "tarball", extensions: supportedExtensionFormats }],
  })
);

const installFromSelectFileDialogInjectable = getInjectable({
  instantiate: (di) => installFromSelectFileDialog({
    attemptInstalls: di.inject(attemptInstallsInjectable),
    directoryForDownloads: di.inject(directoryForDownloadsInjectable),
    pickPaths: di.inject(pickPathsInjectable),
  }),
  id: "install-from-select-file-dialog",
});

export default installFromSelectFileDialogInjectable;
