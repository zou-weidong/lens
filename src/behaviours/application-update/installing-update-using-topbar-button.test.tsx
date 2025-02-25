/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import publishIsConfiguredInjectable from "../../main/application-update/publish-is-configured.injectable";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import processCheckingForUpdatesInjectable from "../../main/application-update/check-for-updates/process-checking-for-updates.injectable";
import quitAndInstallUpdateInjectable from "../../main/application-update/quit-and-install-update.injectable";

function daysToMilliseconds(days: number) {
  return Math.round(days * 24 * 60 * 60 * 1000);
}

describe("encourage user to update when sufficient time passed since update was downloaded", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let quitAndInstallUpdateMock: jest.MockedFunction<() => void>;

  beforeEach(() => {
    jest.useFakeTimers();

    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(
        downloadPlatformUpdateInjectable,
        () => downloadPlatformUpdateMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);

      quitAndInstallUpdateMock = jest.fn();
      mainDi.override(quitAndInstallUpdateInjectable, () => quitAndInstallUpdateMock);
    });
  });

  describe("when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show update button yet", () => {
      const button = rendered.queryByTestId("update-button");

      expect(button).toBeNull();
    });

    describe("given the update check", () => {
      let processCheckingForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

        processCheckingForUpdatesPromise = processCheckingForUpdates("irrelevant");
      });

      describe("when update downloaded", () => {
        let button: HTMLElement;

        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });

          await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
          await processCheckingForUpdatesPromise;

          button = rendered.getByTestId("update-button");
        });

        it("shows update button to help user to update", () => {
          expect(button).toBeInTheDocument();
        });

        it("has soft emotional indication in the button", () => {
          expect(button).toHaveAttribute("data-warning-level", "light");
        });

        describe("when button is clicked", () => {
          beforeEach(() => {
            act(() => button.click());
          });

          it("shows dropdown with update item", () => {
            expect(rendered.getByTestId("update-lens-menu-item")).toBeInTheDocument();
          });

          it("when selected update now, restarts the application to update", () => {
            const updateMenuItem = rendered.getByTestId("update-lens-menu-item");

            act(() => updateMenuItem.click());

            expect(quitAndInstallUpdateMock).toBeCalled();
          });

          it("when dropdown closed without clicking update item, does not restart the application to update", () => {
            act(() => button.click());

            expect(quitAndInstallUpdateMock).not.toBeCalled();
          });
        });

        it("given just enough time passes for medium update encouragement, has medium emotional indication in the button", () => {
          jest.advanceTimersByTime(daysToMilliseconds(22));

          expect(button).toHaveAttribute("data-warning-level", "medium");
        });

        it("given just enough time passes for severe update encouragement, has severe emotional indication in the button", () => {
          jest.advanceTimersByTime(daysToMilliseconds(26));

          expect(button).toHaveAttribute("data-warning-level", "high");
        });
      });
    });
  });
});
