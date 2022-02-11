/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import electronAppInjectable from "../app.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { App } from "electron";
import getAppPathInjectable from "../get-app-path.injectable";
import { noop } from "../../../common/utils";

describe("get-electron-app-path", () => {
  let getElectronAppPath: (name: string) => string | null;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: false });

    const appStub = {
      name: "some-app-name",
      getPath: (name: string) => {
        if (name !== "some-existing-name") {
          throw new Error("irrelevant");
        }

        return "some-existing-app-path";
      },
      setPath: noop,
    } as App;

    di.override(electronAppInjectable, () => appStub);

    await di.runSetups();

    getElectronAppPath = di.inject(getAppPathInjectable);
  });

  it("given app path exists, when called, returns app path", () => {
    const actual = getElectronAppPath("some-existing-name");

    expect(actual).toBe("some-existing-app-path");
  });

  it("given app path does not exist, when called, returns null", () => {
    const actual = getElectronAppPath("some-non-existing-name");

    expect(actual).toBe("");
  });
});
