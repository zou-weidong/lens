/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AppEventBus, AppEvent } from "../app-event-bus/event-bus";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import appEventBusInjectable from "../app-event-bus/app-event-bus.injectable";

describe("event bus tests", () => {
  let appEventBus: AppEventBus;

  beforeEach(async () => {
    const di = getDiForUnitTesting();

    appEventBus = di.inject(appEventBusInjectable);
  });

  describe("emit", () => {
    it("emits an event", () => {
      let event: AppEvent = null;

      appEventBus.addListener((data) => {
        event = data;
      });

      appEventBus.emit({ name: "foo", action: "bar" });
      expect(event.name).toBe("foo");
    });
  });
});
