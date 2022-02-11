/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base http-service / json-api class

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { merge } from "lodash";
import type { Response, RequestInit } from "node-fetch";
import fetch from "node-fetch";
import { stringify } from "querystring";
import { EventEmitter } from "../../common/event-emitter";
import type { LensLogger } from "../../common/logger";

export interface JsonApiData {}

export interface JsonApiError {
  code?: number;
  message?: string;
  errors?: { id: string; title: string; status?: number }[];
}

export interface JsonApiParams<D = any> {
  query?: { [param: string]: string | number | any };
  data?: D; // request body
}

export interface JsonApiLog {
  method: string;
  reqUrl: string;
  reqInit: RequestInit;
  data?: any;
  error?: any;
}

export interface JsonApiConfig {
  readonly apiBase: string;
  readonly serverAddress: string;

  /**
   * @deprecated This is no longer used, instead specify a logger
   */
  readonly debug?: boolean;
  readonly logger?: LensLogger;
  getRequestOptions?: () => Promise<RequestInit>;
}

const httpAgent = new HttpAgent({ keepAlive: true });
const httpsAgent = new HttpsAgent({ keepAlive: true });

export interface JsonApiHandler<D, P extends JsonApiParams = JsonApiParams> {
  readonly config: JsonApiConfig;
  get<T = D>(path: string, params?: P, reqInit?: RequestInit): Promise<T>;
  post<T = D>(path: string, params?: P, reqInit?: RequestInit): Promise<T>;
  put<T = D>(path: string, params?: P, reqInit?: RequestInit): Promise<T>;
  patch<T = D>(path: string, params?: P, reqInit?: RequestInit): Promise<T>;
  del<T = D>(path: string, params?: P, reqInit?: RequestInit): Promise<T>;
  getResponse(path: string, params?: P, reqInit?: RequestInit): Promise<Response>;
}

const jsonApiReqInitDefaults: RequestInit = {
  headers: {
    "content-type": "application/json",
  },
  method: "get",
};

export class JsonApi<D = JsonApiData, P extends JsonApiParams = JsonApiParams> implements JsonApiHandler<D, P> {
  public readonly config: JsonApiConfig;
  protected readonly reqInitDefaults: RequestInit;

  constructor(config: JsonApiConfig, reqInit?: RequestInit) {
    this.config = config;
    this.reqInitDefaults = merge({}, jsonApiReqInitDefaults, reqInit);
  }

  public onData = new EventEmitter<[D, Response]>();
  public onError = new EventEmitter<[JsonApiErrorParsed, Response]>();

  private async mergeRequestInits(init: RequestInit | undefined): Promise<RequestInit> {
    return merge(
      {},
      this.reqInitDefaults,
      (await this.config.getRequestOptions?.()),
      init,
    );
  }

  async getResponse(path: string, params?: P, init?: RequestInit): Promise<Response> {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = await this.mergeRequestInits(init);
    const { query } = params ?? {};

    reqInit.agent ??= reqUrl.startsWith("https:") ? httpsAgent : httpAgent;

    if (query) {
      reqUrl += (reqUrl.includes("?") ? "&" : "?") + stringify(query);
    }

    return fetch(reqUrl, reqInit);
  }

  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "get" });
  }

  post<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "post" });
  }

  put<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "put" });
  }

  patch<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "PATCH" });
  }

  del<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "delete" });
  }

  protected async request<D>(path: string, params?: P, init: RequestInit = {}) {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = await this.mergeRequestInits(init);
    const { data, query } = params ?? {};

    if (data) {
      reqInit.body ??= JSON.stringify(data);
    }

    if (query) {
      reqUrl += (reqUrl.includes("?") ? "&" : "?") + stringify(query);
    }

    return this.parseResponse<D>(
      await fetch(reqUrl, reqInit),
      {
        method: reqInit.method.toUpperCase(),
        reqUrl,
        reqInit,
      },
    );
  }

  protected async parseResponse<D>(res: Response, log: JsonApiLog): Promise<D> {
    const { status } = res;

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : ""; // DELETE-requests might not have response-body
    } catch (e) {
      data = text;
    }

    if (status >= 200 && status < 300) {
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });

      return data;
    }

    if (log.method === "GET" && res.status === 403) {
      this.writeLog({ ...log, error: data });
      throw data;
    }

    const error = new JsonApiErrorParsed(data, this.parseError(data, res));

    this.onError.emit(error, res);
    this.writeLog({ ...log, error });

    throw error;
  }

  protected parseError(error: JsonApiError | string, res: Response): string[] {
    if (typeof error === "string") {
      return [error];
    }

    if (Array.isArray(error.errors)) {
      return error.errors.map(error => error.title);
    }

    if (error.message) {
      return [error.message];
    }

    return [res.statusText || "Error!"];
  }

  protected writeLog({ method, reqUrl, ...params }: JsonApiLog) {
    this.config.logger?.debug(`[JSON-API] request ${method} ${reqUrl}`, params);
  }
}

export class JsonApiErrorParsed {
  isUsedForNotification = false;

  constructor(private error: JsonApiError | DOMException, private messages: string[]) {
  }

  get isAborted() {
    return this.error.code === DOMException.ABORT_ERR;
  }

  toString() {
    return this.messages.join("\n");
  }
}
