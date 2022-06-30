/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rootFrameChildComponentInjectionToken } from "../../frames/root-frame/root-frame-child-component-injection-token";
import { computed } from "mobx";
import { CommandContainer } from "./command-container";

const commandContainerRootFrameChildComponentInjectable = getInjectable({
  id: "command-container-root-frame-child-component",

  instantiate: () => ({
    id: "command-container",
    shouldRender: computed(() => true),
    Component: CommandContainer,
  }),

  causesSideEffects: true,

  injectionToken: rootFrameChildComponentInjectionToken,
});

export default commandContainerRootFrameChildComponentInjectable;
