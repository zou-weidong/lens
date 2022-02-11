/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import getElectronAppPathInjectable from "../../../main/electron/get-app-path.injectable";
import { getDisForUnitTesting } from "../../../test-utils/get-dis-for-unit-testing";
import type { PathName } from "../electron/app-path-names";
import setElectronAppPathInjectable from "../../../main/electron/set-app-path.injectable";
import directoryForIntegrationTestingInjectable from "../../paths/integration-testing.injectable";
import path from "path";
import { appPathsInjectionToken } from "../electron/app-paths.token";
import appNameInjectable from "../../vars/app-name.injectable";

describe("app-paths", () => {
  let mainDi: DiContainer;
  let rendererDi: DiContainer;
  let runSetups: () => Promise<void>;

  beforeEach(() => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mainDi = dis.mainDi;
    rendererDi = dis.rendererDi;
    runSetups = dis.runSetups;

    const defaultAppPathsStub: Record<PathName, string> = {
      appData: "some-app-data",
      cache: "some-cache",
      crashDumps: "some-crash-dumps",
      desktop: "some-desktop",
      documents: "some-documents",
      downloads: "some-downloads",
      exe: "some-exe",
      home: "some-home-path",
      logs: "some-logs",
      module: "some-module",
      music: "some-music",
      pictures: "some-pictures",
      recent: "some-recent",
      temp: "some-temp",
      videos: "some-videos",
      userData: "some-irrelevant",
    };

    mainDi.override(
      getElectronAppPathInjectable,
      () =>
        (key: PathName): string | null =>
          defaultAppPathsStub[key],
    );

    mainDi.override(
      setElectronAppPathInjectable,
      () =>
        (key: PathName, path: string): void => {
          defaultAppPathsStub[key] = path;
        },
    );

    mainDi.override(appNameInjectable, () => "some-app-name");
  });

  describe("normally", () => {
    beforeEach(async () => {
      await runSetups();
    });

    it("given in renderer, when injecting app paths, returns application specific app paths", () => {
      const actual = rendererDi.inject(appPathsInjectionToken);

      expect(actual).toEqual({
        appData: "some-app-data",
        cache: "some-cache",
        crashDumps: "some-crash-dumps",
        desktop: "some-desktop",
        documents: "some-documents",
        downloads: "some-downloads",
        exe: "some-exe",
        home: "some-home-path",
        logs: "some-logs",
        module: "some-module",
        music: "some-music",
        pictures: "some-pictures",
        recent: "some-recent",
        temp: "some-temp",
        videos: "some-videos",
        userData: `some-app-data${path.sep}some-app-name`,
      });
    });

    it("given in main, when injecting app paths, returns application specific app paths", () => {
      const actual = mainDi.inject(appPathsInjectionToken);

      expect(actual).toEqual({
        appData: "some-app-data",
        cache: "some-cache",
        crashDumps: "some-crash-dumps",
        desktop: "some-desktop",
        documents: "some-documents",
        downloads: "some-downloads",
        exe: "some-exe",
        home: "some-home-path",
        logs: "some-logs",
        module: "some-module",
        music: "some-music",
        pictures: "some-pictures",
        recent: "some-recent",
        temp: "some-temp",
        videos: "some-videos",
        userData: `some-app-data${path.sep}some-app-name`,
      });
    });
  });

  describe("when running integration tests", () => {
    beforeEach(async () => {
      mainDi.override(
        directoryForIntegrationTestingInjectable,
        () => "some-integration-testing-app-data",
      );

      await runSetups();
    });

    it("given in renderer, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: `some-integration-testing-app-data${path.sep}some-app-name`,
      });
    });

    it("given in main, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: `some-integration-testing-app-data${path.sep}some-app-name`,
      });
    });
  });
});
