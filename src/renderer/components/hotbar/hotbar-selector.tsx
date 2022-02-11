/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-selector.module.scss";
import React, { useRef, useState } from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { Tooltip, TooltipPosition } from "../tooltip";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { cssNames } from "../../utils";
import type { Hotbar } from "../../../common/hotbars/hotbar";
import type { SwitchHotbar } from "../../../common/hotbars/switch-hotbar.injectable";
import { OrderDirection } from "../../../common/hotbars/store";
import switchHotbarInjectable from "../../../common/hotbars/switch-hotbar.injectable";
import type { GetDisplayIndex } from "../../../common/hotbars/get-display-index.injectable";
import getDisplayIndexInjectable from "../../../common/hotbars/get-display-index.injectable";

interface Dependencies {
  openCommandOverlay: (component: React.ReactElement) => void;
  switchHotbar: SwitchHotbar;
  getDisplayIndex: GetDisplayIndex;
}

export interface HotbarSelectorProps extends Partial<Dependencies> {
  hotbar: Hotbar;
}

const NonInjectedHotbarSelector = observer(({
  hotbar,
  openCommandOverlay,
  switchHotbar,
  getDisplayIndex,
}: HotbarSelectorProps & Dependencies) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout>();

  function clearTimer() {
    clearTimeout(tooltipTimeout.current);
  }

  function onTooltipShow() {
    setTooltipVisible(true);
    clearTimer();
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 1500);
  }

  function onMouseEvent(event: React.MouseEvent) {
    clearTimer();
    setTooltipVisible(event.type == "mouseenter");
  }

  return (
    <div className={styles.HotbarSelector}>
      <Icon
        material="play_arrow"
        className={cssNames(styles.Icon, styles.previous)}
        onClick={() => {
          onTooltipShow();
          switchHotbar(OrderDirection.PREVIOUS);
        }}
      />
      <div className={styles.HotbarIndex}>
        <Badge
          id="hotbarIndex"
          small
          label={getDisplayIndex(hotbar)}
          onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
          className={styles.Badge}
          onMouseEnter={onMouseEvent}
          onMouseLeave={onMouseEvent}
        />
        <Tooltip
          visible={tooltipVisible}
          targetId="hotbarIndex"
          preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
        >
          {hotbar.name}
        </Tooltip>
      </div>
      <Icon
        material="play_arrow"
        className={styles.Icon}
        onClick={() => {
          onTooltipShow();
          switchHotbar(OrderDirection.NEXT);
        }}
      />
    </div>
  );
});

export const HotbarSelector = withInjectables<Dependencies, HotbarSelectorProps>(NonInjectedHotbarSelector, {
  getProps: (di, props) => ({
    ...props,
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    switchHotbar: di.inject(switchHotbarInjectable),
    getDisplayIndex: di.inject(getDisplayIndexInjectable),
  }),
});
