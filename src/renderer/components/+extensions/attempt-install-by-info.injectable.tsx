/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import path from "path";
import { SemVer } from "semver";
import URLParse from "url-parse";
import lodash from "lodash";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { AttemptInstall } from "./attempt-install/attempt-install.injectable";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import type { Confirm } from "../confirm-dialog/confirm.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import getBaseRegistryUrlInjectable from "./get-base-registry-url.injectable";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import confirmInjectable from "../confirm-dialog/confirm.injectable";
import type { Fetch } from "../../../common/utils/fetch.injectable";
import fetchInjectable from "../../../common/utils/fetch.injectable";

export type AttemptInstallByInfo = (info: ExtensionInfo) => Promise<void>;
export interface ExtensionInfo {
  name: string;
  version?: string;
  requireConfirmation?: boolean;
}

interface Dependencies {
  attemptInstall: AttemptInstall;
  getBaseRegistryUrl: () => Promise<string>;
  installStateStore: ExtensionInstallationStateManager;
  errorNotification: ErrorNotification;
  confirm: Confirm;
  fetch: Fetch;
}

export const attemptInstallByInfo = ({
  attemptInstall,
  getBaseRegistryUrl,
  installStateStore,
  errorNotification,
  confirm,
  fetch,
}: Dependencies): AttemptInstallByInfo => (
  async ({ name, version, requireConfirmation = false }: ExtensionInfo) => {
    const disposer = installStateStore.startPreInstall();
    const baseUrl = await getBaseRegistryUrl();
    const registryUrl = new URLParse(baseUrl).set("pathname", name).toString();
    let json: any;

    try {
      const res = await fetch(registryUrl, {
        timeout: 10 * 60 * 1000, // 10min
      });

      json = await res.json();

      if (!json || json.error || typeof json.versions !== "object" || !json.versions) {
        const message = json?.error ? `: ${json.error}` : "";

        errorNotification(`Failed to get registry information for that extension${message}`);

        return disposer();
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
      // assume invalid JSON
        console.warn("Set registry has invalid json", { url: baseUrl }, error);
        errorNotification("Failed to get valid registry information for that extension. Registry did not return valid JSON");
      } else {
        console.error("Failed to download registry information", error);
        errorNotification(`Failed to get valid registry information for that extension. ${error}`);
      }

      return disposer();
    }

    if (version) {
      if (!json.versions[version]) {
        if (json["dist-tags"][version]) {
          version = json["dist-tags"][version];
        } else {
          errorNotification(
            <p>
            The <em>{name}</em> extension does not have a version or tag{" "}
              <code>{version}</code>.
            </p>,
          );

          return disposer();
        }
      }
    } else {
      const versions = Object.keys(json.versions)
        .map(
          version =>
            new SemVer(version, { loose: true, includePrerelease: true }),
        )
      // ignore pre-releases for auto picking the version
        .filter(version => version.prerelease.length === 0);

      version = lodash.reduce(versions, (prev, curr) =>
        prev.compareMain(curr) === -1 ? curr : prev,
      ).format();
    }

    if (requireConfirmation) {
      const proceed = await confirm({
        message: <p>Are you sure you want to install <b>{name}@{version}</b>?</p>,
        labelCancel: "Cancel",
        labelOk: "Install",
      });

      if (!proceed) {
        return disposer();
      }
    }

    const url = json.versions[version].dist.tarball;
    const fileName = path.basename(url);
    const res = await fetch(url, {
      timeout: 10 * 60 * 1000, // 10min
    });

    return attemptInstall({ fileName, dataP: res.json() }, disposer);
  }
);

const attemptInstallByInfoInjectable = getInjectable({
  instantiate: (di) => attemptInstallByInfo({
    attemptInstall: di.inject(attemptInstallInjectable),
    getBaseRegistryUrl: di.inject(getBaseRegistryUrlInjectable),
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    confirm: di.inject(confirmInjectable),
    fetch: di.inject(fetchInjectable),
  }),
  id: "attempt-install-by-info",
});

export default attemptInstallByInfoInjectable;
