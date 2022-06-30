/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "@testing-library/jest-dom/extend-expect";
import { KubeConfig } from "@kubernetes/client-node";
import { fireEvent } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import mockFs from "mock-fs";
import * as selectEvent from "react-select-event";
import type { CreateCluster } from "../../../../common/cluster/create-cluster-injection-token";
import { createClusterInjectionToken } from "../../../../common/cluster/create-cluster-injection-token";
import createContextHandlerInjectable from "../../../../main/context-handler/create-context-handler.injectable";
import type { OpenDeleteClusterDialog } from "../open.injectable";
import openDeleteClusterDialogInjectable from "../open.injectable";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import createKubeconfigManagerInjectable from "../../../../main/kubeconfig-manager/create-kubeconfig-manager.injectable";
import type { ApplicationBuilder } from "../../test-utils/get-application-builder";
import { getApplicationBuilder } from "../../test-utils/get-application-builder";
import normalizedPlatformInjectable from "../../../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../../../../main/kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../../../../main/kubectl/normalized-arch.injectable";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

const currentClusterServerUrl = "https://localhost";
const nonCurrentClusterServerUrl = "http://localhost";
const multiClusterConfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${currentClusterServerUrl}
  name: some-current-context-cluster
- cluster:
    server: ${nonCurrentClusterServerUrl}
  name: some-non-current-context-cluster
contexts:
- context:
    cluster: some-current-context-cluster
    user: some-user
  name: some-current-context
- context:
    cluster: some-non-current-context-cluster
    user: some-user
  name: some-non-current-context
current-context: some-current-context
kind: Config
preferences: {}
users:
- name: some-user
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

const singleClusterServerUrl = "http://localhost";
const singleClusterConfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${singleClusterServerUrl}
  name: some-cluster
contexts:
- context:
    cluster: some-cluster
    user: some-user
  name: some-context
current-context: some-context
kind: Config
preferences: {}
users:
- name: some-user
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

let config: KubeConfig;

describe("<DeleteClusterDialog />", () => {
  let applicationBuilder: ApplicationBuilder;
  let createCluster: CreateCluster;
  let openDeleteClusterDialog: OpenDeleteClusterDialog;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
      mainDi.override(createContextHandlerInjectable, () => () => undefined as never);
      mainDi.override(createKubeconfigManagerInjectable, () => () => undefined as never);
      mainDi.override(kubectlBinaryNameInjectable, () => "kubectl");
      mainDi.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
      mainDi.override(normalizedPlatformInjectable, () => "darwin");
      rendererDi.override(storesAndApisCanBeCreatedInjectable, () => true);
    });

    mockFs();

    applicationBuilder.beforeRender(({ rendererDi }) => {
      openDeleteClusterDialog = rendererDi.inject(openDeleteClusterDialogInjectable);
      createCluster = rendererDi.inject(createClusterInjectionToken);
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("shows context switcher when deleting current cluster", async () => {
    const mockOpts = {
      "temp-kube-config": multiClusterConfig,
    };

    mockFs(mockOpts);

    config = new KubeConfig();
    config.loadFromString(multiClusterConfig);

    applicationBuilder.beforeRender(({ rendererDi }) => {
      const createCluster = rendererDi.inject(createClusterInjectionToken);

      const cluster = createCluster({
        id: "some-current-context-cluster",
        contextName: "some-current-context",
        preferences: {
          clusterName: "some-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: currentClusterServerUrl,
      });

      openDeleteClusterDialog({ cluster, config });
    });

    const rendered = await applicationBuilder.render();

    const { getByText } = rendered;

    const menu = getByText("Select new context...");

    expect(menu).toBeInTheDocument();
    selectEvent.openMenu(menu);

    expect(getByText("some-current-context")).toBeInTheDocument();
    expect(getByText("some-non-current-context")).toBeInTheDocument();
  });


  describe("Kubeconfig with different clusters", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      const mockOpts = {
        "temp-kube-config": multiClusterConfig,
      };

      mockFs(mockOpts);

      config = new KubeConfig();
      config.loadFromString(multiClusterConfig);

      rendered = await applicationBuilder.render();
    });

    it("renders w/o errors", () => {
      expect(rendered.container).toBeInstanceOf(HTMLElement);
    });

    it("shows warning when deleting non-current-context cluster", () => {
      const cluster = createCluster({
        id: "some-non-current-context-cluster",
        contextName: "some-non-current-context",
        preferences: {
          clusterName: "minikube",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: nonCurrentClusterServerUrl,
      });

      openDeleteClusterDialog({ cluster, config });

      const message = "The contents of kubeconfig file will be changed!";

      expect(rendered.getByText(message)).toBeInstanceOf(HTMLElement);
    });

    it("shows warning when deleting current-context cluster", () => {
      const cluster = createCluster({
        id: "some-current-context-cluster",
        contextName: "some-current-context",
        preferences: {
          clusterName: "some-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: currentClusterServerUrl,
      });

      openDeleteClusterDialog({ cluster, config });

      expect(rendered.getByTestId("current-context-warning")).toBeInstanceOf(HTMLElement);
    });

    it("shows context switcher after checkbox click", () => {
      const cluster = createCluster({
        id: "some-current-context-cluster",
        contextName: "some-current-context",
        preferences: {
          clusterName: "some-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: currentClusterServerUrl,
      });

      openDeleteClusterDialog({ cluster, config });

      const { getByText, getByTestId } = rendered;
      const link = getByTestId("context-switch");

      expect(link).toBeInstanceOf(HTMLElement);
      fireEvent.click(link);

      const menu = getByText("Select new context...");

      expect(menu).toBeInTheDocument();
      selectEvent.openMenu(menu);

      expect(getByText("some-current-context")).toBeInTheDocument();
      expect(getByText("some-non-current-context")).toBeInTheDocument();
    });

    it("given cluster in internal kubeconfig, when deleting cluster outside of current context, shows warning for internal kubeconfig cluster", () => {
      const cluster = createCluster({
        id: "some-non-current-context-cluster",
        contextName: "some-non-current-context",
        preferences: {
          clusterName: "some-non-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: nonCurrentClusterServerUrl,
      });

      const spy = jest.spyOn(cluster, "isInLocalKubeconfig").mockImplementation(() => true);

      openDeleteClusterDialog({ cluster, config });

      expect(rendered.getByTestId("internal-kubeconfig-warning")).toBeInstanceOf(HTMLElement);

      spy.mockRestore();
    });
  });

  describe("Kubeconfig with single cluster", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      const mockOpts = {
        "temp-kube-config": singleClusterConfig,
      };

      mockFs(mockOpts);

      config = new KubeConfig();
      config.loadFromString(singleClusterConfig);

      rendered = await applicationBuilder.render();
    });

    it("shows warning if no other contexts left", () => {
      const cluster = createCluster({
        id: "some-cluster",
        contextName: "some-context",
        preferences: {
          clusterName: "some-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      }, {
        clusterServerUrl: singleClusterServerUrl,
      });

      openDeleteClusterDialog({ cluster, config });

      expect(rendered.getByTestId("no-more-contexts-warning")).toBeInstanceOf(HTMLElement);
    });
  });
});
