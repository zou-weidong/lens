/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import React from "react";

// TODO: Make components free of side effects by making them deterministic
jest.mock("../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip: (Target: any) => ({ tooltip, tooltipOverrideDisabled, ...props }: any) => <Target {...props} />,
}));

jest.mock("../../renderer/components/monaco-editor/monaco-editor", () => ({
  MonacoEditor: () => null,
}));

describe("add-cluster - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show add cluster page yet", () => {
    const actual = rendered.queryByTestId("add-cluster-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to add cluster using application menu", () => {
    beforeEach(async () => {
      await applicationBuilder.applicationMenu.click("file.add-cluster");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows add cluster page", () => {
      const actual = rendered.getByTestId("add-cluster-page");

      expect(actual).not.toBeNull();
    });
  });
});
