/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../../common/clusters/cluster";
import { Input } from "../../input";
import { SubTitle } from "../../layout/sub-title";
import { resolveTilde } from "../../../utils";
import { Icon } from "../../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { DirExists } from "../../../../common/fs/dir-exists.injectable";
import type { ErrorNotification } from "../../notifications/error.injectable";
import dirExistsInjectable from "../../../../common/fs/dir-exists.injectable";
import errorNotificationInjectable from "../../notifications/error.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import type { PickPaths } from "../../path-picker/pick.injectable";
import pickPathsInjectable from "../../path-picker/pick.injectable";

export interface ClusterLocalTerminalSettingProps {
  cluster: Cluster;
}

interface Dependencies {
  isWindows: boolean;
  dirExists: DirExists;
  errorNotification: ErrorNotification;
  pickPaths: PickPaths;
}

const NonInjectedClusterLocalTerminalSetting = observer(({
  isWindows,
  dirExists,
  errorNotification,
  pickPaths,
  cluster,
}: Dependencies & ClusterLocalTerminalSettingProps) => {
  if (!cluster) {
    return null;
  }

  const [directory, setDirectory] = useState<string>(cluster.preferences?.terminalCWD || "");
  const [defaultNamespace, setDefaultNamespaces] = useState<string>(cluster.preferences?.defaultNamespace || "");
  const [placeholderDefaultNamespace, setPlaceholderDefaultNamespace] = useState("default");

  useEffect(() => {
    (async () => {
      const kubeconfig = await cluster.getKubeconfig();
      const { namespace } = kubeconfig.getContextObject(cluster.contextName);

      if (namespace) {
        setPlaceholderDefaultNamespace(namespace);
      }
    })();
    setDirectory(cluster.preferences?.terminalCWD || "");
    setDefaultNamespaces(cluster.preferences?.defaultNamespace || "");
  }, [cluster]);

  const commitDirectory = async (directory: string) => {
    cluster.preferences ??= {};

    if (!directory) {
      cluster.preferences.terminalCWD = undefined;
    } else {
      const dir = resolveTilde(directory);
      const errorMessage = await dirExists(dir);

      if (typeof errorMessage === "string") {
        errorNotification(
          <>
            <b>Terminal Working Directory</b>
            <p>Your changes were not saved because {errorMessage}</p>
          </>,
        );
      } else {
        cluster.preferences.terminalCWD = dir;
        setDirectory(dir);
      }
    }
  };

  const commitDefaultNamespace = () => {
    cluster.preferences ??= {};
    cluster.preferences.defaultNamespace = defaultNamespace || undefined;
  };

  const setAndCommitDirectory = (newPath: string) => {
    setDirectory(newPath);
    commitDirectory(newPath);
  };

  const openFilePicker = () => {
    pickPaths({
      label: "Choose Working Directory",
      buttonLabel: "Pick",
      properties: ["openDirectory", "showHiddenFiles"],
      onPick: ([directory]) => setAndCommitDirectory(directory),
    });
  };

  return (
    <>
      <section className="working-directory">
        <SubTitle title="Working Directory"/>
        <Input
          theme="round-black"
          value={directory}
          data-testid="working-directory"
          onChange={setDirectory}
          onBlur={() => commitDirectory(directory)}
          placeholder={isWindows ? "$USERPROFILE" : "$HOME"}
          iconRight={
            <>
              {
                directory && (
                  <Icon
                    material="close"
                    title="Clear"
                    onClick={() => setAndCommitDirectory("")}
                  />
                )
              }
              <Icon
                material="folder"
                title="Pick from filesystem"
                onClick={openFilePicker}
              />
            </>
          }
        />
        <small className="hint">
          An explicit start path where the terminal will be launched,{" "}
          this is used as the current working directory (cwd) for the shell process.
        </small>
      </section>
      <section className="default-namespace">
        <SubTitle title="Default Namespace"/>
        <Input
          theme="round-black"
          data-testid="default-namespace"
          value={defaultNamespace}
          onChange={setDefaultNamespaces}
          onBlur={commitDefaultNamespace}
          placeholder={placeholderDefaultNamespace}
        />
        <small className="hint">
          Default namespace used for kubectl.
        </small>
      </section>
    </>
  );
});

export const ClusterLocalTerminalSetting = withInjectables<Dependencies, ClusterLocalTerminalSettingProps>(NonInjectedClusterLocalTerminalSetting, {
  getProps: (di, props) => ({
    ...props,
    dirExists: di.inject(dirExistsInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    isWindows: di.inject(isWindowsInjectable),
    pickPaths: di.inject(pickPathsInjectable),
  }),
});
