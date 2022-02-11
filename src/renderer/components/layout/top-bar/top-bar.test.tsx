/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import type { DiContainer } from "@ogre-tools/injectable";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { computed } from "mobx";
import directoryForUserDataInjectable from "../../../../common/paths/user-data.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { TriggerWindowAction } from "../../../../common/ipc/window/trigger-action.token";
import { WindowAction } from "../../../../common/ipc/window/trigger-action.token";
import triggerWindowActionInjectable from "../../../ipc/window/trigger-action.injectable";
import platformInjectable from "../../../../common/vars/platform.injectable";
import windowOpenAppContextMenuInjectable from "../../../ipc/window/open-app-context-menu.injectable";

describe("<TopBar/>", () => {
  let di: DiContainer;
  let render: DiRender;
  let triggerWindowAction: jest.MockedFunction<TriggerWindowAction>;

  beforeEach(async () => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(triggerWindowActionInjectable, () => triggerWindowAction = jest.fn());
    di.override(windowOpenAppContextMenuInjectable, () => jest.fn());

    await di.runSetups();
  });

  it("renders w/o errors", () => {
    const { container } = render(<TopBar/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders home button", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("home-button")).toBeInTheDocument();
  });

  it("renders history arrows", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("history-back")).toBeInTheDocument();
    expect(await findByTestId("history-forward")).toBeInTheDocument();
  });

  it("enables arrow by ipc event", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("history-back")).not.toHaveClass("disabled");
    expect(await findByTestId("history-forward")).not.toHaveClass("disabled");
  });

  it("triggers browser history back and forward", async () => {
    const { findByTestId } = render(<TopBar/>);

    const prevButton = await findByTestId("history-back");
    const nextButton = await findByTestId("history-forward");

    fireEvent.click(prevButton);

    expect(triggerWindowAction).toBeCalledWith(WindowAction.GO_BACK);

    fireEvent.click(nextButton);

    expect(triggerWindowAction).toBeCalledWith(WindowAction.GO_FORWARD);
  });

  it("renders items", async () => {
    const testId = "testId";
    const text = "an item";

    di.override(topBarItemsInjectable, () => computed(() => [
      {
        components: {
          Item: () => <span data-testid={testId}>{text}</span>,
        },
      },
    ]));

    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId(testId)).toHaveTextContent(text);
  });

  it("doesn't show windows title buttons on macos", () => {
    di.override(platformInjectable, () => "darwin" as const);

    const { queryByTestId } = render(<TopBar/>);

    expect(queryByTestId("window-menu")).not.toBeInTheDocument();
    expect(queryByTestId("window-minimize")).not.toBeInTheDocument();
    expect(queryByTestId("window-maximize")).not.toBeInTheDocument();
    expect(queryByTestId("window-close")).not.toBeInTheDocument();
  });

  it("does show windows title buttons on linux", () => {
    di.override(platformInjectable, () => "linux" as const);

    const { queryByTestId } = render(<TopBar/>);

    expect(queryByTestId("window-menu")).toBeInTheDocument();
    expect(queryByTestId("window-minimize")).toBeInTheDocument();
    expect(queryByTestId("window-maximize")).toBeInTheDocument();
    expect(queryByTestId("window-close")).toBeInTheDocument();
  });
});
