/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import mockFs from "mock-fs";
import { BaseStore, BaseStoreDependencies } from "../base-store";
import { action, makeObservable, observable, toJS } from "mobx";
import { readFileSync } from "fs";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";

import directoryForUserDataInjectable
  from "../paths/user-data.injectable";
import baseLoggerInjectable from "../../main/logger/base-logger.injectable";

jest.mock("electron", () => ({
  ipcMain: {
    on: jest.fn(),
    off: jest.fn(),
  },
}));

interface TestStoreModel {
  a: string;
  b: string;
  c: string;
}

class TestStore extends BaseStore<TestStoreModel> {
  @observable a: string;
  @observable b: string;
  @observable c: string;

  constructor(deps: BaseStoreDependencies) {
    super(deps, { name: "test-store" });
    makeObservable(this);
    this.load();
  }

  @action
  updateAll(data: TestStoreModel) {
    this.a = data.a;
    this.b = data.b;
    this.c = data.c;
  }

  @action
  fromStore(data: Partial<TestStoreModel> = {}) {
    this.a = data.a || "";
    this.b = data.b || "";
    this.c = data.c || "";
  }

  saveToFile(data: TestStoreModel) {
    super.saveToFile(data);
  }

  toJSON(): TestStoreModel {
    return toJS({
      a: this.a,
      b: this.b,
      c: this.c,
    });
  }
}

describe("BaseStore", () => {
  let store: TestStore;

  beforeEach(async () => {
    const dis = getDisForUnitTesting();

    dis.mainDi.override(directoryForUserDataInjectable, () => "some-user-data-directory");

    await dis.runSetups();

    store = new TestStore({
      logger: dis.mainDi.inject(baseLoggerInjectable),
      userDataPath: dis.mainDi.inject(directoryForUserDataInjectable),
    });

    const mockOpts = {
      "some-user-data-directory": {
        "test-store.json": JSON.stringify({}),
      },
    };

    mockFs(mockOpts);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("persistence", () => {
    it("persists changes to the filesystem", () => {
      store.updateAll({
        a: "foo", b: "bar", c: "hello",
      });

      const data = JSON.parse(readFileSync("some-user-data-directory/test-store.json").toString());

      expect(data).toEqual({ a: "foo", b: "bar", c: "hello" });
    });

    it("persists transaction only once", () => {
      const fileSpy = jest.spyOn(store, "saveToFile");

      store.updateAll({
        a: "foo", b: "bar", c: "hello",
      });

      expect(fileSpy).toHaveBeenCalledTimes(1);
    });

    it("persists changes one-by-one without transaction", () => {
      const fileSpy = jest.spyOn(store, "saveToFile");

      store.a = "a";
      store.b = "b";

      expect(fileSpy).toHaveBeenCalledTimes(2);

      const data = JSON.parse(readFileSync("some-user-data-directory/test-store.json").toString());

      expect(data).toEqual({ a: "a", b: "b", c: "" });
    });

    // it("persists changes coming via onSync (sync from different process)", () => {
    //   const fileSpy = jest.spyOn(store, "saveToFile");

    //   store.onSync({ a: "foo", b: "", c: "bar" });

    //   expect(store.toJSON()).toEqual({ a: "foo", b: "", c: "bar" });

    //   expect(fileSpy).toHaveBeenCalledTimes(1);
    // });
  });
});
