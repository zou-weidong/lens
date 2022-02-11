/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import URLParse from "url-parse";
import type { LensExtension } from "../../extensions/lens-extension";
import { observable, when, makeObservable } from "mobx";
import { disposer, noop } from "../../common/utils";
import type { WindowManager } from "../window/manager";
import { RoutingError, RoutingErrorType } from "../../common/protocol-handler/error";
import type { LensProtocolRouterDependencies } from "../../common/protocol-handler/router";
import { LensProtocolRouter, type RouteAttempt } from "../../common/protocol-handler/router";
import type { InvalidProtocolUrl } from "../../common/ipc/protocol-handler/invalid.token";
import type { RouteProtocolInternal } from "../../common/ipc/protocol-handler/router-internal.token";
import type { RouteProtocolExternal } from "../../common/ipc/protocol-handler/router-external.token";

export interface FallbackHandler {
  (name: string): Promise<boolean>;
}

/**
 * This function checks if the host part is valid
 * @param host the URI host part
 * @returns `true` if it should be routed internally to Lens, `false` if to an extension
 * @throws if `host` is not valid
 */
function checkHost<Query>(url: URLParse<Query>): boolean {
  switch (url.host) {
    case "app":
      return true;
    case "extension":
      return false;
    default:
      throw new RoutingError(RoutingErrorType.INVALID_HOST, url);
  }
}

export interface LensProtocolRouterMainDependencies extends LensProtocolRouterDependencies {
  readonly windowManager: WindowManager;
  emitInvalidProtocolUrl: InvalidProtocolUrl;
  emitRouteProtocolInternal: RouteProtocolInternal;
  emitRouteProtocolExternal: RouteProtocolExternal;
}

export class LensProtocolRouterMain extends LensProtocolRouter {
  private missingExtensionHandlers: FallbackHandler[] = [];

  @observable rendererLoaded = false;

  protected disposers = disposer();

  constructor(protected readonly dependencies: LensProtocolRouterMainDependencies) {
    super(dependencies);
    makeObservable(this);
  }

  public cleanup() {
    this.disposers();
  }

  /**
   * Find the most specific registered handler, if it exists, and invoke it.
   *
   * This will send an IPC message to the renderer router to do the same
   * in the renderer.
   */
  public async route(rawUrl: string) {
    try {
      const url = new URLParse(rawUrl, true);

      if (url.protocol.toLowerCase() !== "lens:") {
        throw new RoutingError(RoutingErrorType.INVALID_PROTOCOL, url);
      }

      this.dependencies.windowManager.ensureMainWindow().catch(noop);
      const routeInternally = checkHost(url);

      this.dependencies.logger.info(`routing ${url.toString()}`);

      if (routeInternally) {
        this._routeToInternal(url);
      } else {
        await this._routeToExtension(url);
      }
    } catch (error) {
      this.dependencies.emitInvalidProtocolUrl(rawUrl, error.toString());

      if (error instanceof RoutingError) {
        this.dependencies.logger.error(`${error}`, { url: error.url });
      } else {
        this.dependencies.logger.error(`${error}`, { rawUrl });
      }
    }
  }

  protected async _executeMissingExtensionHandlers(extensionName: string): Promise<boolean> {
    for (const handler of this.missingExtensionHandlers) {
      if (await handler(extensionName)) {
        return true;
      }
    }

    return false;
  }

  protected async _findMatchingExtensionByName(url: URLParse<Record<string, string>>): Promise<LensExtension | string> {
    const firstAttempt = await super._findMatchingExtensionByName(url);

    if (typeof firstAttempt !== "string") {
      return firstAttempt;
    }

    if (await this._executeMissingExtensionHandlers(firstAttempt)) {
      return super._findMatchingExtensionByName(url);
    }

    return "";
  }

  protected _routeToInternal(url: URLParse<Record<string, string>>): RouteAttempt {
    const rawUrl = url.toString(); // for sending to renderer
    const attempt = super._routeToInternal(url);

    this.disposers.push(when(() => this.rendererLoaded, () => this.dependencies.emitRouteProtocolInternal(rawUrl, attempt)));

    return attempt;
  }

  protected async _routeToExtension(url: URLParse<Record<string, string>>): Promise<RouteAttempt> {
    const rawUrl = url.toString(); // for sending to renderer

    /**
     * This needs to be done first, so that the missing extension handlers can
     * be called before notifying the renderer.
     *
     * Note: this needs to clone the url because _routeToExtension modifies its
     * argument.
     */
    const attempt = await super._routeToExtension(new URLParse(url.toString(), true));

    this.disposers.push(when(() => this.rendererLoaded, () => this.dependencies.emitRouteProtocolExternal(rawUrl, attempt)));

    return attempt;
  }

  /**
   * Add a function to the list which will be sequentially called if an extension
   * is not found while routing to the extensions
   * @param handler A function that tries to find an extension
   */
  public addMissingExtensionHandler(handler: FallbackHandler): void {
    this.missingExtensionHandlers.push(handler);
  }
}
