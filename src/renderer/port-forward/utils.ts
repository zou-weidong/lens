/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ForwardedPort } from "./item";

export function portForwardAddress(portForward: ForwardedPort) {
  return `${portForward.protocol ?? "http"}://localhost:${portForward.forwardPort}`;
}

export function predictProtocol(name: string) {
  return name === "https" ? "https" : "http";
}
