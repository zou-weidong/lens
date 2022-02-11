/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";

export interface BundledExtensionsEvents {
  loaded: () => void;
}

const bundledExtensionsEventEmitterInjectable = getInjectable({
  id: "bundled-extensions-event-emitter",
  instantiate: () => new EventEmitter() as TypedEventEmitter<BundledExtensionsEvents>,
});

export default bundledExtensionsEventEmitterInjectable;
