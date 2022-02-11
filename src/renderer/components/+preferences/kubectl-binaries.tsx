/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import type { SelectOption } from "../select";
import { Select } from "../select";
import { Switch } from "../switch";
import { packageMirrors } from "../../../common/user-preferences/preferences-helpers";
import directoryForBinariesInjectable from "../../../common/paths/binaries.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { DownloadBinariesPath } from "../../../common/user-preferences/download-binaries-path.injectable";
import type { KubectlBinariesPath } from "../../../common/user-preferences/kubectl-binaries-path.injectable";
import type { DownloadKubectlBinaries } from "../../../common/user-preferences/download-kubectl-binaries.injectable";
import type { DownloadMirror } from "../../../common/user-preferences/download-mirror.injectable";
import downloadBinariesPathInjectable from "../../../common/user-preferences/download-binaries-path.injectable";
import downloadKubectlBinariesInjectable from "../../../common/user-preferences/download-kubectl-binaries.injectable";
import downloadMirrorInjectable from "../../../common/user-preferences/download-mirror.injectable";
import kubectlBinariesPathInjectable from "../../../common/user-preferences/kubectl-binaries-path.injectable";
import bundledKubectlBinaryPathInjectable from "../../../common/vars/bundled-kubectl-binary.injectable";

interface Dependencies {
  defaultPathForKubectlBinaries: string;
  downloadBinariesPath: DownloadBinariesPath;
  kubectlBinariesPath: KubectlBinariesPath;
  downloadKubectlBinaries: DownloadKubectlBinaries;
  downloadMirror: DownloadMirror;
  bundledKubectlPath: string;
}

const NonInjectedKubectlBinaries = observer(({
  defaultPathForKubectlBinaries,
  downloadBinariesPath,
  kubectlBinariesPath,
  downloadKubectlBinaries,
  downloadMirror,
  bundledKubectlPath,
}: Dependencies) => {
  const [downloadPath, setDownloadPath] = useState(downloadBinariesPath.value);
  const [binariesPath, setBinariesPath] = useState(kubectlBinariesPath.value);
  const pathValidator = downloadPath ? InputValidators.isPath : undefined;
  const downloadMirrorOptions: SelectOption<string>[] = Array.from(
    packageMirrors.entries(),
    ([value, { label, platforms }]) => ({ value, label, platforms }),
  );

  return (
    <>
      <section>
        <SubTitle title="Kubectl binary download"/>
        <Switch
          checked={downloadKubectlBinaries.value}
          onChange={downloadKubectlBinaries.toggle}
        >
          Download kubectl binaries matching the Kubernetes cluster version
        </Switch>
      </section>

      <section>
        <SubTitle title="Download mirror" />
        <Select
          placeholder="Download mirror for kubectl"
          options={downloadMirrorOptions}
          value={downloadMirror.value}
          onChange={({ value }) => downloadMirror.set(value)}
          disabled={!downloadKubectlBinaries.value}
          isOptionDisabled={({ platforms }) => !platforms.has(process.platform)}
          themeName="lens"
        />
      </section>

      <section>
        <SubTitle title="Directory for binaries" />
        <Input
          theme="round-black"
          value={downloadPath}
          placeholder={defaultPathForKubectlBinaries}
          validators={pathValidator}
          onChange={setDownloadPath}
          onBlur={() => downloadBinariesPath.set(downloadPath)}
          disabled={!downloadKubectlBinaries.value}
        />
        <div className="hint">
          The directory to download binaries into.
        </div>
      </section>

      <section>
        <SubTitle title="Path to kubectl binary" />
        <Input
          theme="round-black"
          placeholder={bundledKubectlPath}
          value={binariesPath}
          validators={pathValidator}
          onChange={setBinariesPath}
          onBlur={() => kubectlBinariesPath.set(binariesPath)}
          disabled={downloadKubectlBinaries.value}
        />
      </section>
    </>
  );
});

export const KubectlBinaries = withInjectables<Dependencies>(NonInjectedKubectlBinaries, {
  getProps: (di) => ({
    defaultPathForKubectlBinaries: di.inject(directoryForBinariesInjectable),
    downloadBinariesPath: di.inject(downloadBinariesPathInjectable),
    downloadKubectlBinaries: di.inject(downloadKubectlBinariesInjectable),
    downloadMirror: di.inject(downloadMirrorInjectable),
    kubectlBinariesPath: di.inject(kubectlBinariesPathInjectable),
    bundledKubectlPath: di.inject(bundledKubectlBinaryPathInjectable),
  }),
});
