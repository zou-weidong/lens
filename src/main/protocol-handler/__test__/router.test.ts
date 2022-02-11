/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";

import { delay, noop } from "../../../common/utils";
import { LensExtension } from "../../../extensions/main-api";
import type { ExtensionsPreferencesStore } from "../../../common/extensions/preferences/store";
import type { LensProtocolRouterMain } from "../router";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import lensProtocolRouterMainInjectable from "../router.injectable";
import extensionsPreferencesStoreInjectable from "../../extensions/preferences-store.injectable";
import type { RouteProtocolExternal } from "../../../common/ipc/protocol-handler/router-external.token";
import type { RouteProtocolInternal } from "../../../common/ipc/protocol-handler/router-internal.token";
import emitInvalidProtocolUrlInjectable from "../../ipc/protocol-handler/invalid.injectable";
import emitRouteProtocolExternalInjectable from "../../ipc/protocol-handler/route-external.injectable";
import emitRouteProtocolInternalInjectable from "../../ipc/protocol-handler/route-internal.injectable";
import { SemVer } from "semver";
import type { ExtensionInstances } from "../../../common/extensions/instances.injectable";
import extensionInstancesInjectable from "../../../common/extensions/instances.injectable";

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  let extensionInstances: ExtensionInstances;
  let emitRouteProtocolExternal: jest.MockedFunction<RouteProtocolExternal>;
  let emitRouteProtocolInternal: jest.MockedFunction<RouteProtocolInternal>;
  let lpr: LensProtocolRouterMain;
  let extensionsStore: ExtensionsPreferencesStore;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs({
      "tmp": {},
    });

    await di.runSetups();

    di.override(emitInvalidProtocolUrlInjectable, () => jest.fn());
    di.override(emitRouteProtocolExternalInjectable, () => emitRouteProtocolExternal = jest.fn());
    di.override(emitRouteProtocolInternalInjectable, () => emitRouteProtocolInternal = jest.fn());
    extensionInstances = di.inject(extensionInstancesInjectable);
    extensionsStore = di.inject(extensionsPreferencesStoreInjectable);
    lpr = di.inject(lensProtocolRouterMainInjectable);

    lpr.rendererLoaded = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockFs.restore();
  });

  it("should throw on non-lens URLS", async () => {
    try {
      expect(await lpr.route("https://google.ca")).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should throw when host not internal or extension", async () => {
    try {
      expect(await lpr.route("lens://foobar")).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should not throw when has valid host", async () => {
    const extId = uuid.v4();
    const ext = new LensExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@mirantis/minikube",
        version: new SemVer("0.1.1"),
        description: "foobar",
        engines: {
          lens: ">=1.0.0",
        },
      },
      isBundled: false,
      isCompatible: true,
      absolutePath: "/foo/bar",
    });

    ext.protocolHandlers.push({
      pathSchema: "/",
      handler: noop,
    });

    extensionInstances.set(extId, ext);
    extensionsStore.setEnabled(extId, true);

    lpr.addInternalHandler("/", noop);

    try {
      expect(await lpr.route("lens://app")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    try {
      expect(await lpr.route("lens://extension/@mirantis/minikube")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);
    expect(emitRouteProtocolInternal).toHaveBeenCalledWith("lens://app", "matched");
    expect(emitRouteProtocolExternal).toHaveBeenCalledWith("lens://extension/@mirantis/minikube", "matched");
  });

  it("should call handler if matches", async () => {
    let called = false;

    lpr.addInternalHandler("/page", () => { called = true; });

    try {
      expect(await lpr.route("lens://app/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(true);
    expect(emitRouteProtocolInternal).toBeCalledWith("lens://app/page", "matched");
  });

  it("should call most exact handler", async () => {
    let called: any = 0;

    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/:id", params => { called = params.pathname.id; });

    try {
      expect(await lpr.route("lens://app/page/foo")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe("foo");
    expect(emitRouteProtocolInternal).toBeCalledWith("lens://app/page/foo", "matched");
  });

  it("should call most exact handler for an extension", async () => {
    let called: any = 0;

    const extId = uuid.v4();
    const ext = new LensExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@foobar/icecream",
        version: new SemVer("0.1.1"),
        description: "foobar",
        engines: {
          lens: ">=1.0.0",
        },
      },
      isBundled: false,
      isCompatible: true,
      absolutePath: "/foo/bar",
    });

    ext.protocolHandlers
      .push({
        pathSchema: "/page",
        handler: () => { called = 1; },
      }, {
        pathSchema: "/page/:id",
        handler: params => { called = params.pathname.id; },
      });

    extensionInstances.set(extId, ext);
    extensionsStore.setEnabled(extId, true);

    try {
      expect(await lpr.route("lens://extension/@foobar/icecream/page/foob")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);
    expect(called).toBe("foob");
    expect(emitRouteProtocolExternal).toBeCalledWith("lens://extension/@foobar/icecream/page/foob", "matched");
  });

  it("should work with non-org extensions", async () => {
    let called: any = 0;

    {
      const extId = uuid.v4();
      const ext = new LensExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "@foobar/icecream",
          version: new SemVer("0.1.1"),
          description: "foobar",
          engines: {
            lens: ">=1.0.0",
          },
        },
        isBundled: false,
        isCompatible: true,
        absolutePath: "/foo/bar",
      });

      ext.protocolHandlers
        .push({
          pathSchema: "/page/:id",
          handler: params => { called = params.pathname.id; },
        });

      extensionInstances.set(extId, ext);
      extensionsStore.setEnabled(extId, true);
    }

    {
      const extId = uuid.v4();
      const ext = new LensExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "icecream",
          version: new SemVer("0.1.1"),
          description: "foobar",
          engines: {
            lens: ">=1.0.0",
          },
        },
        isBundled: false,
        isCompatible: true,
        absolutePath: "/foo/bar",
      });

      ext.protocolHandlers
        .push({
          pathSchema: "/page",
          handler: () => { called = 1; },
        });

      extensionInstances.set(extId, ext);
      extensionsStore.setEnabled(extId, true);
    }

    (extensionsStore as any).state.set("@foobar/icecream", { enabled: true, name: "@foobar/icecream" });
    (extensionsStore as any).state.set("icecream", { enabled: true, name: "icecream" });

    try {
      expect(await lpr.route("lens://extension/icecream/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);

    expect(called).toBe(1);
    expect(emitRouteProtocolExternal).toBeCalledWith("lens://extension/icecream/page", "matched");
  });

  it("should throw if urlSchema is invalid", () => {
    expect(() => lpr.addInternalHandler("/:@", noop)).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", async () => {
    let called: any = 0;

    lpr.addInternalHandler("/", () => { called = 2; });
    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/foo", () => { called = 3; });
    lpr.addInternalHandler("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(3);
    expect(emitRouteProtocolInternal).toBeCalledWith("lens://app/page/foo/bar/bat", "matched");
  });

  it("should call most exact handler with 2 found handlers", async () => {
    let called: any = 0;

    lpr.addInternalHandler("/", () => { called = 2; });
    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(1);
    expect(emitRouteProtocolInternal).toBeCalledWith("lens://app/page/foo/bar/bat", "matched");
  });
});
