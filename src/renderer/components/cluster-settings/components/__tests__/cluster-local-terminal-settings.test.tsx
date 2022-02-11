/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { waitFor } from "@testing-library/react";
import { ClusterLocalTerminalSetting } from "../local-terminal-settings";
import userEvent from "@testing-library/user-event";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../../test-utils/renderFor";
import type { Stat } from "../../../../../common/fs/stat.injectable";
import statInjectable from "../../../../../common/fs/stat.injectable";
import type { ErrorNotification } from "../../../notifications/error.injectable";
import errorNotificationInjectable from "../../../notifications/error.injectable";

describe("ClusterLocalTerminalSettings", () => {
  let render: DiRender;
  let stat: jest.MockedFunction<Stat>;
  let errorNotification: jest.MockedFunction<ErrorNotification>;

  beforeEach(async () => {
    const di = getDiForUnitTesting();

    render = renderFor(di);

    di.override(statInjectable, () => stat = jest.fn());
    di.override(errorNotificationInjectable, () => errorNotification = jest.fn());
  });

  it("should render without errors", () => {
    const dom = render(<ClusterLocalTerminalSetting cluster={null}/>);

    expect(dom.container).toBeInstanceOf(HTMLElement);
  });

  it("should render the current settings", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
        defaultNamespace: "kube-system",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;
    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);

    expect(await dom.findByDisplayValue("/foobar")).toBeDefined();
    expect(await dom.findByDisplayValue("kube-system")).toBeDefined();
  });

  it("should change placeholder for 'Default Namespace' to be the namespace from the kubeconfig", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({
          namespace: "blat",
        })),
      })),
    } as any;
    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);

    expect(await dom.findByDisplayValue("/foobar")).toBeDefined();
    expect(await dom.findByPlaceholderText("blat")).toBeDefined();
  });

  it("should save the new default namespace after clicking away", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("default-namespace");

    userEvent.click(dn);
    userEvent.type(dn, "kube-system");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences.defaultNamespace).toBe("kube-system"));
  });

  it("should save the new CWD if path is a directory", async () => {
    stat.mockImplementation(async (path: string) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => true,
      } as any;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences?.terminalCWD).toBe("/foobar"));
  });

  it("should not save the new CWD if path is a file", async () => {
    stat.mockImplementation(async (path: string) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => false,
        isFile: () => true,
      } as any;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(errorNotification).toBeCalled());
  });
});
