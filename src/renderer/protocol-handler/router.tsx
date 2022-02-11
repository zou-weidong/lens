/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import URLParse from "url-parse";
import { foldAttemptResults, LensProtocolRouter, LensProtocolRouterDependencies, RouteAttempt } from "../../common/protocol-handler/router";
import type { ShortInfoNotification } from "../components/notifications/short-info.injectable";

export interface LensProtocolRouterRendererDependencies extends LensProtocolRouterDependencies {
  shortInfoNotification: ShortInfoNotification;
}

export class LensProtocolRouterRenderer extends LensProtocolRouter {
  constructor(protected readonly dependencies: LensProtocolRouterRendererDependencies) {
    super(dependencies);
  }

  routeInternal(rawUrl: string, mainAttempt: RouteAttempt): void {
    const rendererAttempt = this._routeToInternal(new URLParse(rawUrl, true));

    if (foldAttemptResults(mainAttempt, rendererAttempt) === RouteAttempt.MISSING) {
      this.dependencies.shortInfoNotification(
        <p>
          Unknown action <code>{rawUrl}</code>. Are you on the latest version?
        </p>,
      );
    }
  }

  routeExternal(rawUrl: string, mainAttempt: RouteAttempt): void {
    (async () => {
      const rendererAttempt = await this._routeToExtension(new URLParse(rawUrl, true));

      switch (foldAttemptResults(mainAttempt, rendererAttempt)) {
        case RouteAttempt.MISSING:
          this.dependencies.shortInfoNotification(
            <p>
                  Unknown action <code>{rawUrl}</code>.{" "}
                  Are you on the latest version of the extension?
            </p>,
          );
          break;
        case RouteAttempt.MISSING_EXTENSION:
          this.dependencies.shortInfoNotification(
            <p>
                  Missing extension for action <code>{rawUrl}</code>.{" "}
                  Not able to find extension in our known list.{" "}
                  Try installing it manually.
            </p>,
          );
          break;
      }
    })();
  }
}
