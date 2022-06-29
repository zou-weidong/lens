/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import { KubeconfigManager } from "../kubeconfig-manager/kubeconfig-manager";
import mockFs from "mock-fs";
import type { Cluster } from "../../common/cluster/cluster";
import fse from "fs-extra";
import { loadYaml } from "@kubernetes/client-node";
import { Console } from "console";
import * as path from "path";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { parse } from "url";
import loggerInjectable from "../../common/logger.injectable";
import type { Logger } from "../../common/logger";
import assert from "assert";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../kubectl/normalized-arch.injectable";
import fsInjectable from "../../common/fs/fs.injectable";

console = new Console(process.stdout, process.stderr); // fix mockFS

const clusterServerUrl = "https://192.168.64.3:8443";

describe("kubeconfig manager tests", () => {
  let clusterFake: Cluster;
  let createKubeconfigManager: (cluster: Cluster) => KubeconfigManager | undefined;
  let di: DiContainer;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForTempInjectable, () => "some-directory-for-temp");
    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");
    di.permitSideEffects(fsInjectable); // still using mockFs

    loggerMock = {
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
    };

    di.override(loggerInjectable, () => loggerMock);

    mockFs({
      "minikube-config.yml": JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: clusterServerUrl,
          },
        }],
        contexts: [{
          context: {
            cluster: "minikube",
            user: "minikube",
          },
          name: "minikube",
        }],
        users: [{
          name: "minikube",
        }],
        kind: "Config",
        preferences: {},
      }),
    });

    di.override(createContextHandlerInjectable, () => (cluster) => ({
      restartServer: jest.fn(),
      stopServer: jest.fn(),
      clusterUrl: parse(cluster.apiUrl),
      getApiTarget: jest.fn(),
      getPrometheusDetails: jest.fn(),
      resolveAuthProxyCa: jest.fn(),
      resolveAuthProxyUrl: jest.fn(),
      setupPrometheus: jest.fn(),
      ensureServer: jest.fn(),
    }));

    const createCluster = di.inject(createClusterInjectionToken);

    createKubeconfigManager = di.inject(createKubeconfigManagerInjectable);

    clusterFake = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    }, {
      clusterServerUrl,
    });

    jest.spyOn(KubeconfigManager.prototype, "resolveProxyUrl", "get").mockReturnValue("http://127.0.0.1:9191/foo");
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should create 'temp' kube config with proxy", async () => {
    const kubeConfManager = createKubeconfigManager(clusterFake);

    assert(kubeConfManager, "should actually create one");

    expect(loggerMock.error).not.toBeCalled();
    expect(await kubeConfManager.getPath()).toBe(`some-directory-for-temp${path.sep}kubeconfig-foo`);
    // this causes an intermittent "ENXIO: no such device or address, read" error
    //    const file = await fse.readFile(await kubeConfManager.getPath());
    const file = fse.readFileSync(await kubeConfManager.getPath());
    const yml = loadYaml<any>(file.toString());

    expect(yml["current-context"]).toBe("minikube");
    expect(yml["clusters"][0]["cluster"]["server"].endsWith("/foo")).toBe(true);
    expect(yml["users"][0]["name"]).toBe("proxy");
  });

  it("should remove 'temp' kube config on unlink and remove reference from inside class", async () => {
    const kubeConfManager = createKubeconfigManager(clusterFake);

    assert(kubeConfManager, "should actually create one");

    const configPath = await kubeConfManager.getPath();

    expect(await fse.pathExists(configPath)).toBe(true);
    await kubeConfManager.clear();
    expect(await fse.pathExists(configPath)).toBe(false);
    await kubeConfManager.clear(); // doesn't throw
    expect(async () => {
      await kubeConfManager.getPath();
    }).rejects.toThrow("already unlinked");
  });
});
