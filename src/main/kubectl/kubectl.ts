/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getBundledKubectlVersion } from "../../common/utils";
import { ensureDir, pathExists } from "fs-extra";
import * as lockFile from "proper-lockfile";
import { normalizedPlatform, normalizedArch } from "../../common/vars";
import { SemVer } from "semver";
import { defaultPackageMirror, packageMirrors } from "../../common/user-preferences/preferences-helpers";
import got from "got/dist/source";
import { promisify } from "util";
import stream from "stream";
import { noop } from "lodash/fp";
import type { LensLogger } from "../../common/logger";
import type { ExecFile } from "../../common/utils/exec-file.injectable";
import type { DownloadBinariesPath } from "../../common/user-preferences/download-binaries-path.injectable";
import type { DownloadKubectlBinaries } from "../../common/user-preferences/download-kubectl-binaries.injectable";
import type { KubectlBinariesPath } from "../../common/user-preferences/kubectl-binaries-path.injectable";
import type { Unlink } from "../../common/fs/unlink.injectable";
import type { CopyFile } from "../../common/fs/copy-file.injectable";
import type { Chmod } from "../../common/fs/chmod.injectable";
import type { CreateWriteStream } from "../../common/fs/create-write-stream.injectable";
import type { DownloadMirror } from "../../common/user-preferences/download-mirror.injectable";
import type { WriteFile } from "../../common/fs/write-file.injectable";

const bundledVersion = getBundledKubectlVersion();
const kubectlMap: Map<string, string> = new Map([
  ["1.7", "1.8.15"],
  ["1.8", "1.9.10"],
  ["1.9", "1.10.13"],
  ["1.10", "1.11.10"],
  ["1.11", "1.12.10"],
  ["1.12", "1.13.12"],
  ["1.13", "1.13.12"],
  ["1.14", "1.14.10"],
  ["1.15", "1.15.11"],
  ["1.16", "1.16.15"],
  ["1.17", "1.17.17"],
  ["1.18", "1.18.20"],
  ["1.19", "1.19.12"],
  ["1.20", "1.20.8"],
  ["1.21", "1.21.9"],
  ["1.22", "1.22.6"],
  ["1.23", bundledVersion],
]);
const initScriptVersionString = "# lens-initscript v3";

export interface KubectlDependencies {
  readonly directoryForKubectlBinaries: string;
  readonly directoryForBundledBinaries: string;
  readonly logger: LensLogger;
  readonly kubectlBinaryName: string;
  readonly bundledKubectlPath: string;
  readonly downloadBinariesPath: DownloadBinariesPath;
  readonly kubectlBinariesPath: KubectlBinariesPath;
  readonly downloadKubectlBinaries: DownloadKubectlBinaries;
  readonly downloadMirror: DownloadMirror;
  execFile: ExecFile;
  unlink: Unlink;
  copyFile: CopyFile;
  chmod: Chmod;
  createWriteStream: CreateWriteStream;
  writeFile: WriteFile;
}

export class Kubectl {
  public kubectlVersion: string;
  protected directory: string;
  protected url: string;
  protected path: string;
  protected dirname: string;

  public static readonly bundledKubectlVersion: string = bundledVersion;
  public static invalidBundle = false;

  constructor(protected readonly dependencies: KubectlDependencies, clusterVersion: string) {
    let version: SemVer;

    try {
      version = new SemVer(clusterVersion, { includePrerelease: false });
    } catch {
      version = new SemVer(Kubectl.bundledKubectlVersion);
    }

    const minorVersion = `${version.major}.${version.minor}`;

    /* minorVersion is the first two digits of kube server version
       if the version map includes that, use that version, if not, fallback to the exact x.y.z of kube version */
    if (kubectlMap.has(minorVersion)) {
      this.kubectlVersion = kubectlMap.get(minorVersion);
      this.dependencies.logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using version map`);
    } else {
      this.kubectlVersion = version.format();
      this.dependencies.logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using fallback`);
    }

    this.url = `${this.getDownloadMirror()}/v${this.kubectlVersion}/bin/${normalizedPlatform}/${normalizedArch}/${this.dependencies.kubectlBinaryName}`;
    this.dirname = path.normalize(path.join(this.getDownloadDir(), this.kubectlVersion));
    this.path = path.join(this.dirname, this.dependencies.kubectlBinaryName);
  }

  public getBundledPath() {
    return this.dependencies.bundledKubectlPath;
  }

  public getPathFromPreferences() {
    return this.dependencies.kubectlBinariesPath.value || this.getBundledPath();
  }

  protected getDownloadDir() {
    if (this.dependencies.downloadBinariesPath.value) {
      return path.join(this.dependencies.downloadBinariesPath.value, "kubectl");
    }

    return this.dependencies.directoryForKubectlBinaries;
  }

  public async getPath(bundled = false): Promise<string> {
    if (bundled) {
      return this.getBundledPath();
    }

    if (this.dependencies.downloadKubectlBinaries.value === false) {
      return this.getPathFromPreferences();
    }

    // return binary name if bundled path is not functional
    if (!await this.checkBinary(this.getBundledPath(), false)) {
      Kubectl.invalidBundle = true;

      return path.basename(this.getBundledPath());
    }

    try {
      if (!await this.ensureKubectl()) {
        this.dependencies.logger.error("Failed to ensure kubectl, fallback to the bundled version");

        return this.getBundledPath();
      }

      return this.path;
    } catch (err) {
      this.dependencies.logger.error("Failed to ensure kubectl, fallback to the bundled version");
      this.dependencies.logger.error(err);

      return this.getBundledPath();
    }
  }

  public async binDir() {
    try {
      await this.ensureKubectl();
      await this.writeInitScripts();

      return this.dirname;
    } catch (err) {
      this.dependencies.logger.error(err);

      return "";
    }
  }

  public async checkBinary(path: string, checkVersion = true) {
    const exists = await pathExists(path);

    if (exists) {
      try {
        const args = [
          "version",
          "--client", "true",
          "--output", "json",
        ];
        const { stdout } = await this.dependencies.execFile(path, args);
        const output = JSON.parse(stdout);

        if (!checkVersion) {
          return true;
        }
        let version: string = output.clientVersion.gitVersion;

        if (version[0] === "v") {
          version = version.slice(1);
        }

        if (version === this.kubectlVersion) {
          this.dependencies.logger.debug(`Local kubectl is version ${this.kubectlVersion}`);

          return true;
        }
        this.dependencies.logger.error(`Local kubectl is version ${version}, expected ${this.kubectlVersion}, unlinking`);
      } catch (err) {
        this.dependencies.logger.error(`Local kubectl failed to run properly (${err.message}), unlinking`);
      }
      await this.dependencies.unlink(this.path);
    }

    return false;
  }

  protected async checkBundled(): Promise<boolean> {
    if (this.kubectlVersion === Kubectl.bundledKubectlVersion) {
      try {
        const exist = await pathExists(this.path);

        if (!exist) {
          await this.dependencies.copyFile(this.getBundledPath(), this.path);
          await this.dependencies.chmod(this.path, 0o755);
        }

        return true;
      } catch (err) {
        this.dependencies.logger.error(`Could not copy the bundled kubectl to app-data: ${err}`);

        return false;
      }
    } else {
      return false;
    }
  }

  public async ensureKubectl(): Promise<boolean> {
    if (this.dependencies.downloadKubectlBinaries.value === false) {
      return true;
    }

    if (Kubectl.invalidBundle) {
      this.dependencies.logger.error(`Detected invalid bundle binary, returning ...`);

      return false;
    }

    await ensureDir(this.dirname, 0o755);

    try {
      const release = await lockFile.lock(this.dirname);

      this.dependencies.logger.debug(`Acquired a lock for ${this.kubectlVersion}`);
      const bundled = await this.checkBundled();
      let isValid = await this.checkBinary(this.path, !bundled);

      if (!isValid && !bundled) {
        try {
          await this.downloadKubectl();
        } catch (error) {
          this.dependencies.logger.error(`failed to download kubectl`, error);
          this.dependencies.logger.debug(`Releasing lock for ${this.kubectlVersion}`);
          await release();

          return false;
        }

        isValid = await this.checkBinary(this.path, false);
      }

      if (!isValid) {
        this.dependencies.logger.debug(`Releasing lock for ${this.kubectlVersion}`);
        await release();

        return false;
      }

      this.dependencies.logger.debug(`Releasing lock for ${this.kubectlVersion}`);
      await release();

      return true;
    } catch (error) {
      this.dependencies.logger.error(`Failed to get a lock for ${this.kubectlVersion}`, error);

      return false;
    }
  }

  public async downloadKubectl() {
    await ensureDir(path.dirname(this.path), 0o755);

    this.dependencies.logger.info(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`);

    const downloadStream = got.stream({ url: this.url, decompress: true });
    const fileWriteStream = this.dependencies.createWriteStream(this.path, { mode: 0o755 });
    const pipeline = promisify(stream.pipeline);

    try {
      await pipeline(downloadStream, fileWriteStream);
      await this.dependencies.chmod(this.path, 0o755);
      this.dependencies.logger.debug("kubectl binary download finished");
    } catch (error) {
      await this.dependencies.unlink(this.path).catch(noop);
      throw error;
    }
  }

  protected async writeInitScripts() {
    const kubectlPath = this.dependencies.downloadKubectlBinaries
      ? this.dirname
      : path.dirname(this.getPathFromPreferences());

    const binariesDir = this.dependencies.directoryForBundledBinaries;

    const bashScriptPath = path.join(this.dirname, ".bash_set_path");
    const bashScript = [
      initScriptVersionString,
      "tempkubeconfig=\"$KUBECONFIG\"",
      "test -f \"/etc/profile\" && . \"/etc/profile\"",
      "if test -f \"$HOME/.bash_profile\"; then",
      "  . \"$HOME/.bash_profile\"",
      "elif test -f \"$HOME/.bash_login\"; then",
      "  . \"$HOME/.bash_login\"",
      "elif test -f \"$HOME/.profile\"; then",
      "  . \"$HOME/.profile\"",
      "fi",
      `export PATH="${binariesDir}:${kubectlPath}:$PATH"`,
      'export KUBECONFIG="$tempkubeconfig"',
      `NO_PROXY=",\${NO_PROXY:-localhost},"`,
      `NO_PROXY="\${NO_PROXY//,localhost,/,}"`,
      `NO_PROXY="\${NO_PROXY//,127.0.0.1,/,}"`,
      `NO_PROXY="localhost,127.0.0.1\${NO_PROXY%,}"`,
      "export NO_PROXY",
      "unset tempkubeconfig",
    ].join("\n");

    const zshScriptPath = path.join(this.dirname, ".zlogin");
    const zshScript = [
      initScriptVersionString,
      "tempkubeconfig=\"$KUBECONFIG\"",

      // restore previous ZDOTDIR
      "export ZDOTDIR=\"$OLD_ZDOTDIR\"",

      // source all the files
      "test -f \"$OLD_ZDOTDIR/.zshenv\" && . \"$OLD_ZDOTDIR/.zshenv\"",
      "test -f \"$OLD_ZDOTDIR/.zprofile\" && . \"$OLD_ZDOTDIR/.zprofile\"",
      "test -f \"$OLD_ZDOTDIR/.zlogin\" && . \"$OLD_ZDOTDIR/.zlogin\"",
      "test -f \"$OLD_ZDOTDIR/.zshrc\" && . \"$OLD_ZDOTDIR/.zshrc\"",

      // voodoo to replace any previous occurrences of kubectl path in the PATH
      `kubectlpath="${kubectlPath}"`,
      `binariesDir="${binariesDir}"`,
      "p=\":$kubectlpath:\"",
      "d=\":$PATH:\"",
      `d=\${d//$p/:}`,
      `d=\${d/#:/}`,
      `export PATH="$binariesDir:$kubectlpath:\${d/%:/}"`,
      "export KUBECONFIG=\"$tempkubeconfig\"",
      `NO_PROXY=",\${NO_PROXY:-localhost},"`,
      `NO_PROXY="\${NO_PROXY//,localhost,/,}"`,
      `NO_PROXY="\${NO_PROXY//,127.0.0.1,/,}"`,
      `NO_PROXY="localhost,127.0.0.1\${NO_PROXY%,}"`,
      "export NO_PROXY",
      "unset tempkubeconfig",
      "unset OLD_ZDOTDIR",
    ].join("\n");

    await Promise.all([
      this.dependencies.writeFile(bashScriptPath, bashScript, { mode: 0o644 }),
      this.dependencies.writeFile(zshScriptPath, zshScript, { mode: 0o644 }),
    ]);
  }

  protected getDownloadMirror(): string {
    // MacOS packages are only available from default

    const { url } = packageMirrors.get(this.dependencies.downloadMirror.value)
      ?? packageMirrors.get(defaultPackageMirror);

    return url;
  }
}
