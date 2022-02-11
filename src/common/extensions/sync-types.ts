/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SyncMessage } from "../utils";
import type { BaseInstalledExtension, InstalledExtension } from "./installed.injectable";
import type { RawLensExtensionManifest, LensExtensionId } from "./manifest";
import { convertFromRawManifest, convertToRawManifest } from "./manifest";

export interface ExtensionDiscoveryEvents {
  add: (data: RawLensExtensionManifest) => void;
  delete: (uid: LensExtensionId) => void;
}

export type RawInstalledExtension = BaseInstalledExtension<RawLensExtensionManifest>;

export interface ExtensionDiscoverySyncAddMessage extends SyncMessage<"add"> {
  data: RawInstalledExtension;
}

export interface ExtensionDiscoverySyncDeleteMessage extends SyncMessage<"delete"> {
  uid: LensExtensionId;
}

export type ExtensionDiscoverySyncMessage = ExtensionDiscoverySyncAddMessage | ExtensionDiscoverySyncDeleteMessage;

export function convertToRawExtension(extension: InstalledExtension): RawInstalledExtension {
  const { manifest: parsedManifest, ...messageData } = extension;
  const manifest = convertToRawManifest(parsedManifest);

  return {
    manifest,
    ...messageData,
  };
}

export function convertFromRawExtension(extension: RawInstalledExtension): InstalledExtension {
  const { manifest: rawManifest, ...messageData } = extension;
  const manifest = convertFromRawManifest(rawManifest);

  return {
    manifest,
    ...messageData,
  };
}
