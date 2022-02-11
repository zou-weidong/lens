/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Input } from "../input";
import { isUrl } from "../input/input_validators";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { AddWeblink } from "../../../common/weblinks/add.injectable";
import addWeblinkInjectable from "../../../common/weblinks/add.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  addWeblink: AddWeblink;
}


const NonInjectedWeblinkAddCommand = observer(({
  addWeblink,
  closeCommandOverlay,
}: Dependencies) => {
  const [url, setUrl] = useState("");
  const [nameHidden, setNameHidden] = useState(true);
  const [dirty, setDirty] = useState(false);

  const onChangeUrl = (url: string) => {
    setDirty(true);
    setUrl(url);
  };

  const onSubmitUrl = () => {
    setNameHidden(false);
  };

  const onSubmit = (name: string) => {
    addWeblink({
      name: name || url,
      url,
    });
    closeCommandOverlay();
  };

  return (
    <>
      <Input
        placeholder="Link URL"
        autoFocus={nameHidden}
        theme="round-black"
        data-test-id="command-palette-weblink-add-url"
        validators={[isUrl]}
        dirty={dirty}
        value={url}
        onChange={onChangeUrl}
        onSubmit={onSubmitUrl}
        showValidationLine={true}
      />
      {
        nameHidden
          ? (
            <small className="hint">
              Please provide a web link URL (Press &quot;Enter&quot; to continue or &quot;Escape&quot; to cancel)
            </small>
          )
          : (
            <>
              <Input
                placeholder="Name (optional)"
                autoFocus={true}
                theme="round-black"
                data-test-id="command-palette-weblink-add-name"
                onSubmit={onSubmit}
                dirty={true}
              />
              <small className="hint">
                Please provide a name for the web link (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
              </small>
            </>
          )
      }
    </>
  );
});

export const WeblinkAddCommand = withInjectables<Dependencies>(NonInjectedWeblinkAddCommand, {
  getProps: (di, props) => ({
    ...props,
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    addWeblink: di.inject(addWeblinkInjectable),
  }),
});
