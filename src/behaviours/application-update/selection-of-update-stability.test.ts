/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import quitAndInstallUpdateInjectable from "../../main/application-update/quit-and-install-update.injectable";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../main/application-update/publish-is-configured.injectable";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { UpdateChannel, UpdateChannelId } from "../../common/application-update/update-channels";
import { updateChannels } from "../../common/application-update/update-channels";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import type { SelectedUpdateChannel } from "../../common/application-update/selected-update-channel/selected-update-channel.injectable";
import selectedUpdateChannelInjectable from "../../common/application-update/selected-update-channel/selected-update-channel.injectable";
import type { IComputedValue } from "mobx";
import setUpdateOnQuitInjectable from "../../main/electron-app/features/set-update-on-quit.injectable";
import showInfoNotificationInjectable from "../../renderer/components/notifications/show-info-notification.injectable";
import processCheckingForUpdatesInjectable from "../../main/application-update/check-for-updates/process-checking-for-updates.injectable";
import appVersionInjectable from "../../common/get-configuration-file-model/app-version/app-version.injectable";

describe("selection of update stability", () => {
  let applicationBuilder: ApplicationBuilder;
  let quitAndInstallUpdateMock: jest.Mock;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let setUpdateOnQuitMock: jest.Mock;
  let showInfoNotificationMock: jest.Mock;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
      quitAndInstallUpdateMock = jest.fn();
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();
      setUpdateOnQuitMock = jest.fn();
      showInfoNotificationMock = jest.fn(() => () => {});

      rendererDi.override(showInfoNotificationInjectable, () => showInfoNotificationMock);

      mainDi.override(setUpdateOnQuitInjectable, () => setUpdateOnQuitMock);

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(
        downloadPlatformUpdateInjectable,
        () => downloadPlatformUpdateMock,
      );

      mainDi.override(
        quitAndInstallUpdateInjectable,
        () => quitAndInstallUpdateMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);
    });
  });

  describe("when started", () => {
    let rendered: RenderResult;
    let processCheckingForUpdates: (source: string) => Promise<void>;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();

      processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe('given update channel "alpha" is selected, when checking for updates', () => {
      let selectedUpdateChannel: SelectedUpdateChannel;

      beforeEach(() => {
        selectedUpdateChannel = applicationBuilder.dis.mainDi.inject(
          selectedUpdateChannelInjectable,
        );

        selectedUpdateChannel.setValue(updateChannels.alpha.id);

        processCheckingForUpdates("irrelevant");
      });

      it('checks updates from update channel "alpha"', () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          updateChannels.alpha,
          { allowDowngrade: true },
        );
      });

      it("when update is discovered, does not check update from other update channels", async () => {
        checkForPlatformUpdatesMock.mockClear();

        await checkForPlatformUpdatesMock.resolve({
          updateWasDiscovered: true,
          version: "some-version",
        });

        expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
      });

      describe("when no update is discovered", () => {
        beforeEach(async () => {
          checkForPlatformUpdatesMock.mockClear();

          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });
        });

        it('checks updates from update channel "beta"', () => {
          expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
            updateChannels.beta,
            { allowDowngrade: true },
          );
        });

        it("when update is discovered, does not check update from other update channels", async () => {
          checkForPlatformUpdatesMock.mockClear();

          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });

          expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
        });

        describe("when no update is discovered again", () => {
          beforeEach(async () => {
            checkForPlatformUpdatesMock.mockClear();

            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: false,
            });
          });

          it('finally checks updates from update channel "latest"', () => {
            expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
              updateChannels.latest,
              { allowDowngrade: true },
            );
          });

          it("when update is discovered, does not check update from other update channels", async () => {
            checkForPlatformUpdatesMock.mockClear();

            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: true,
              version: "some-version",
            });

            expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('given update channel "beta" is selected', () => {
      let selectedUpdateChannel: {
        value: IComputedValue<UpdateChannel>;
        setValue: (channelId: UpdateChannelId) => void;
      };

      beforeEach(() => {
        selectedUpdateChannel = applicationBuilder.dis.mainDi.inject(
          selectedUpdateChannelInjectable,
        );

        selectedUpdateChannel.setValue(updateChannels.beta.id);
      });

      describe("when checking for updates", () => {
        beforeEach(() => {
          processCheckingForUpdates("irrelevant");
        });

        describe('when update from "beta" channel is discovered', () => {
          beforeEach(async () => {
            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: true,
              version: "some-beta-version",
            });
          });

          describe("when update is downloaded", () => {
            beforeEach(async () => {
              await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
            });

            it("when user would close the application, installs the update", () => {
              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(true);
            });

            it('given user changes update channel to "latest", when user would close the application, does not install the update for not being stable enough', () => {
              selectedUpdateChannel.setValue(updateChannels.latest.id);

              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(false);
            });

            it('given user changes update channel to "alpha", when user would close the application, installs the update for being stable enough', () => {
              selectedUpdateChannel.setValue(updateChannels.alpha.id);

              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(false);
            });
          });
        });
      });
    });
  });

  it("given valid update channel selection is stored, when checking for updates, checks for updates from the update channel", async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      // TODO: Switch to more natural way of setting initial value
      // TODO: UserStore is currently responsible for getting and setting initial value
      const selectedUpdateChannel = mainDi.inject(selectedUpdateChannelInjectable);

      selectedUpdateChannel.setValue(updateChannels.beta.id);
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(updateChannels.beta, expect.any(Object));
  });

  it("given invalid update channel selection is stored, when checking for updates, checks for updates from the update channel", async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      // TODO: Switch to more natural way of setting initial value
      // TODO: UserStore is currently responsible for getting and setting initial value
      const selectedUpdateChannel = mainDi.inject(selectedUpdateChannelInjectable);

      selectedUpdateChannel.setValue("something-invalid" as UpdateChannelId);
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(updateChannels.latest, expect.any(Object));
  });

  it('given no update channel selection is stored and currently using stable release, when user checks for updates, checks for updates from "latest" update channel by default', async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(appVersionInjectable, () => "1.0.0");
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
      updateChannels.latest,
      { allowDowngrade: true },
    );
  });

  it('given no update channel selection is stored and currently using alpha release, when checking for updates, checks for updates from "alpha" channel', async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(appVersionInjectable, () => "1.0.0-alpha");
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(updateChannels.alpha, expect.any(Object));
  });

  it('given no update channel selection is stored and currently using beta release, when checking for updates, checks for updates from "beta" channel', async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(appVersionInjectable, () => "1.0.0-beta");
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(updateChannels.beta, expect.any(Object));
  });

  it("given update channel selection is stored and currently using prerelease, when checking for updates, checks for updates from stored channel", async () => {
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(appVersionInjectable, () => "1.0.0-alpha");

      // TODO: Switch to more natural way of setting initial value
      // TODO: UserStore is currently responsible for getting and setting initial value
      const selectedUpdateChannel = mainDi.inject(selectedUpdateChannelInjectable);

      selectedUpdateChannel.setValue(updateChannels.beta.id);
    });

    await applicationBuilder.render();

    const processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);

    processCheckingForUpdates("irrelevant");

    expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(updateChannels.beta, expect.any(Object));
  });
});
