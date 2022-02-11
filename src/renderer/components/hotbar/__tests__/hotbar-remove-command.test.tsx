/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";
import { HotbarRemoveCommand } from "../hotbar-remove-command";
import { fireEvent } from "@testing-library/react";
import React from "react";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import { ConfirmDialog } from "../../confirm-dialog/view";
import directoryForUserDataInjectable from "../../../../common/paths/user-data.injectable";
import hotbarsInjectable from "../../../../common/hotbars/hotbars.injectable";
import { observable } from "mobx";
import type { Hotbar } from "../../../../common/hotbars/hotbar";
import type { CreateHotbar } from "../../../../common/hotbars/create-hotbar.injectable";
import createHotbarInjectable from "../../../../common/hotbars/create-hotbar.injectable";
import type { RemoveHotbar } from "../../../../common/hotbars/remove-hotbar.injectable";
import removeHotbarInjectable from "../../../../common/hotbars/remove-hotbar.injectable";

jest.mock("electron", () => ({
  ipcRenderer: {
    on: jest.fn(),
    invoke: jest.fn(),
  },
}));

describe("<HotbarRemoveCommand />", () => {
  let di: DiContainer;
  let render: DiRender;
  let createHotbar: CreateHotbar;
  let removeHotbar: jest.MockedFunction<RemoveHotbar>;
  let mockHotbar1: [string, Hotbar];

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(removeHotbarInjectable, () => removeHotbar = jest.fn());

    render = renderFor(di);
    createHotbar = di.inject(createHotbarInjectable);
    mockHotbar1 = createHotbar({
      name: "Default",
    });
    di.override(hotbarsInjectable, () => observable.map([
      mockHotbar1,
    ]));
    await di.runSetups();
  });

  it("renders w/o errors", () => {
    const { container } = render(<HotbarRemoveCommand />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("calls remove if you click on the entry", async () => {
    const res = render(
      <>
        <HotbarRemoveCommand />
        <ConfirmDialog />
      </>,
    );

    fireEvent.click(await res.findByText("1: Default"));
    fireEvent.click(await res.findByText("Remove Hotbar"));

    expect(removeHotbar).toHaveBeenCalled();
  });
});
