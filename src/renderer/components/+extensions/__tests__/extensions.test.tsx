/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, waitFor } from "@testing-library/react";
import fse from "fs-extra";
import React from "react";
import { ConfirmDialog } from "../../confirm-dialog/view";
import { Extensions } from "../extensions";
import { mockWindow } from "../../../../../__mocks__/windowMock";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/paths/user-data.injectable";
import directoryForDownloadsInjectable from "../../../../common/paths/downloads.injectable";
import type { CheckedUninstallExtension } from "../checked-uninstall-extension.injectable";
import checkedUninstallExtensionInjectable from "../checked-uninstall-extension.injectable";
import installedExtensionsInjectable from "../../../../common/extensions/installed.injectable";
import { observable } from "mobx";
import { SemVer } from "semver";
import type { DiContainer } from "@ogre-tools/injectable";
import isExtensionsInitiallyLoadedStateInjectable from "../../../extensions/discovery-is-loaded.injectable";

mockWindow();

describe("Extensions", () => {
  let render: DiRender;
  let di: DiContainer;
  let checkedUninstallExtension: jest.MockedFunction<CheckedUninstallExtension>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForDownloadsInjectable, () => "some-directory-for-downloads");

    await di.runSetups();

    render = renderFor(di);

    di.override(checkedUninstallExtensionInjectable, () => checkedUninstallExtension = jest.fn());
    di.override(installedExtensionsInjectable, () => observable.map([
      ["extensionId", {
        id: "extensionId",
        manifest: {
          name: "test",
          version: new SemVer("1.2.3"),
          description: "foobar",
          engines: {
            lens: ">5.0.0",
          },
        },
        absolutePath: "/absolute/path",
        manifestPath: "/symlinked/path/package.json",
        isBundled: false,
        isEnabled: true,
        isCompatible: true,
      }],
    ]));
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    const res = render(<><Extensions /><ConfirmDialog /></>);
    const table = res.getByTestId("extensions-table");
    const menuTrigger = table.querySelector("div[role=row]:first-of-type .actions .Icon");

    fireEvent.click(menuTrigger);

    expect(res.getByText("Disable")).toHaveAttribute("aria-disabled", "false");
    expect(res.getByText("Uninstall")).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(res.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(res.getByText("Yes"));

    await waitFor(() => {
      expect(checkedUninstallExtension).toHaveBeenCalled();
      fireEvent.click(menuTrigger);
      expect(res.getByText("Disable")).toHaveAttribute("aria-disabled", "true");
      expect(res.getByText("Uninstall")).toHaveAttribute("aria-disabled", "true");
    }, {
      timeout: 30000,
    });
  });

  it("disables install button while installing", async () => {
    const res = render(<Extensions />);

    (fse.unlink as jest.MockedFunction<typeof fse.unlink>).mockReturnValue(Promise.resolve() as any);

    fireEvent.change(res.getByPlaceholderText("File path or URL", {
      exact: false,
    }), {
      target: {
        value: "https://test.extensionurl/package.tgz",
      },
    });

    fireEvent.click(res.getByText("Install"));
    expect(res.getByText("Install").closest("button")).toBeDisabled();
  });

  it("displays spinner while extensions are loading", () => {
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).toBeInTheDocument();
  });

  it("does not display the spinner while extensions are not loading", async () => {
    di.inject(isExtensionsInitiallyLoadedStateInjectable).set(true);
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).not.toBeInTheDocument();
  });
});
