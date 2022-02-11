/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/paths/user-data.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import platformInjectable from "../../../../common/vars/platform.injectable";
import type { WindowOpenAppContextMenu } from "../../../../common/ipc/window/open-app-context-menu.token";
import type { TriggerWindowAction } from "../../../../common/ipc/window/trigger-action.token";
import windowOpenAppContextMenuInjectable from "../../../ipc/window/open-app-context-menu.injectable";
import triggerWindowActionInjectable from "../../../ipc/window/trigger-action.injectable";

describe("<TopBar/> in Windows and Linux", () => {
  let render: DiRender;
  let di: DiContainer;
  let openAppContextMenu: jest.MockedFunction<WindowOpenAppContextMenu>;
  let triggerWindowAction: jest.MockedFunction<TriggerWindowAction>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(windowOpenAppContextMenuInjectable, () => openAppContextMenu = jest.fn());
    di.override(triggerWindowActionInjectable, () => triggerWindowAction = jest.fn());

    await di.runSetups();

    render = renderFor(di);
  });

  it("shows window controls on Windows", () => {
    di.override(platformInjectable, () => "windows" as const);

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("shows window controls on Linux", () => {
    di.override(platformInjectable, () => "linux" as const);

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("triggers ipc events on click", () => {
    di.override(platformInjectable, () => "windows" as const);

    const { getByTestId } = render(<TopBar />);

    const menu = getByTestId("window-menu");
    const minimize = getByTestId("window-minimize");
    const maximize = getByTestId("window-maximize");
    const close = getByTestId("window-close");

    fireEvent.click(menu);
    expect(openAppContextMenu).toHaveBeenCalledWith();

    fireEvent.click(minimize);
    expect(triggerWindowAction).toHaveBeenCalledWith("minimize");

    fireEvent.click(maximize);
    expect(triggerWindowAction).toHaveBeenCalledWith("toggle-maximize");

    fireEvent.click(close);
    expect(triggerWindowAction).toHaveBeenCalledWith("close");
  });
});
