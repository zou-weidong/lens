/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { random } from "lodash";
import fetch from "node-fetch";
import type { Disposer } from "../../../../common/utils";
import type { WebLink } from "../../../../extensions/common-api/catalog";

async function validateLink(link: WebLink) {
  try {
    const response = await fetch(link.spec.url, {
      timeout: 20_000,
    });

    if (response.status >= 200 && response.status < 500) {
      link.status.phase = "available";
    } else {
      link.status.phase = "unavailable";
    }
  } catch {
    link.status.phase = "unavailable";
  }
}

export function periodicallyCheckLink(link: WebLink): Disposer {
  validateLink(link);

  let interval: NodeJS.Timeout;
  const timeout = setTimeout(() => {
    interval = setInterval(() => validateLink(link), 60 * 60 * 1000); // every 60 minutes
  }, random(0, 5 * 60 * 1000, false)); // spread out over 5 minutes

  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}
