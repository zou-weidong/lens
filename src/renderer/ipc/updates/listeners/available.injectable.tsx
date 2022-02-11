/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { emitUpdateAvailableInjectionToken, UpdateAvailable } from "../../../../common/ipc/updates/available/emit.token";
import type { InfoNotification } from "../../../components/notifications/info.injectable";
import infoNotificationInjectable from "../../../components/notifications/info.injectable";
import type { UpdateAvailableRespond } from "../../../../common/ipc/updates/respond.token";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import { Button } from "../../../components/button";
import updateAvailableRespondInjectable from "../respond.injectable";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

interface Dependencies {
  infoNotification: InfoNotification;
  isMac: boolean;
  updateAvailableRespond: UpdateAvailableRespond;
}


const getListener = ({
  infoNotification,
  isMac,
  updateAvailableRespond,
}: Dependencies): UpdateAvailable => (
  (info) => {
    const remove = infoNotification(
      (
        <div className="flex column gaps">
          <b>Update Available</b>
          <p>Version {info.version} of Lens IDE is available and ready to be installed. Would you like to update now?</p>
          <p>Lens should restart automatically, if it doesn&apos;t please restart manually. Installed extensions might require updating.</p>
          <div className="flex gaps row align-left box grow">
            {
              isMac
                ? (
                  /**
                   * auto-updater's "installOnQuit" is not applicable for macOS as per their docs.
                   *
                   * See: https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/AppUpdater.ts#L27-L32
                   */
                  <Button
                    light
                    label="Yes"
                    onClick={() => {
                      remove();
                      updateAvailableRespond({ doUpgrade: true, now: true });
                    }}
                  />
                )
                : (
                  <>
                    <Button
                      light
                      label="Yes, now"
                      onClick={() => {
                        remove();
                        updateAvailableRespond({ doUpgrade: true, now: true });
                      }}
                    />
                    <Button
                      active
                      outlined
                      label="Yes, later"
                      onClick={() => {
                        remove();
                        updateAvailableRespond({ doUpgrade: true, now: false });
                      }}
                    />
                  </>
                )
            }
            <Button
              active
              outlined
              label="No"
              onClick={() => updateAvailableRespond({ doUpgrade: false })}
            />
          </div>
        </div>
      ),
      {
        onClose: () => updateAvailableRespond({ doUpgrade: false }),
      },
    );
  }
);

const initUpdateAvailableListenerInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const listener = getListener({
      infoNotification: di.inject(infoNotificationInjectable),
      isMac: di.inject(isMacInjectable),
      updateAvailableRespond: di.inject(updateAvailableRespondInjectable),
    });

    return () => emitUpdateAvailableInjectionToken.setupListener(ipcRenderer, listener);
  },
  id: "init-update-available-listener",
});

export default initUpdateAvailableListenerInjectable;
