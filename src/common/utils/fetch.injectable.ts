/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  instantiate: () => fetch as Fetch,
  id: "fetch",
});

export default fetchInjectable;
