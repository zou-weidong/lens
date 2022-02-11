/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./list.scss";

import React, { createRef, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { computed, reaction } from "mobx";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import type { Align, ListOnScrollProps } from "react-window";
import { SearchStore } from "../../../search-store/search-store";
import { array, cssNames } from "../../../utils";
import { VirtualList } from "../../virtual-list";
import { ToBottom } from "./to-bottom";
import type { LogTabViewModel } from "../logs/logs-view-model";
import { Spinner } from "../../spinner";
import type { LocaleTimezone } from "../../../../common/user-preferences/locale-timezone.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import localeTimezoneInjectable from "../../../../common/user-preferences/locale-timezone.injectable";

export interface LogListProps {
  model: LogTabViewModel;
}

const colorConverter = new AnsiUp();

interface Dependencies {
  localeTimezone: LocaleTimezone;
}

const lineHeight = 18; // Height of a log line. Should correlate with styles in pod-log-list.scss

export interface LogListRef {
  scrollToItem: (index: number, align: Align) => void;
}

const NonInjectedLogList = observer(forwardRef<LogListRef, Dependencies & LogListProps>(({
  model,
  localeTimezone,
}, ref) => {
  const [isJumpButtonVisible, setIsJumpButtonVisible] = useState(false);
  const [isLastLineVisible, setIsLastLineVisible] = useState(true);
  const [computedLogs] = useState(computed(() => {
    const { showTimestamps } = model.logTabData.get();

    if (!showTimestamps) {
      return model.logsWithoutTimestamps.get();
    }

    return model.timestampSplitLogs
      .get()
      .map(([logTimestamp, log]) => `${logTimestamp && moment.tz(logTimestamp, localeTimezone.value).format()}${log}`);
  }));
  const divRef = createRef<HTMLDivElement>(); // A reference for outer container in VirtualList
  const listRef = createRef<VirtualList>(); // A reference for VirtualList component
  const logs = computedLogs.get();

  useImperativeHandle(ref, () => ({
    scrollToItem,
  }));

  const onLogsInitialLoad = (logs: string[], prevLogs: string[]) => {
    if (!prevLogs.length && logs.length) {
      setIsLastLineVisible(true);
    }
  };
  const onLogsUpdate = () => {
    if (isLastLineVisible) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);  // Giving some time to VirtualList to prepare its outerRef (divRef) element
    }
  };
  const onUserScrolledUp = (logs: string[], prevLogs: string[]) => {
    if (!divRef.current) return;

    const newLogsAdded = prevLogs.length < logs.length;
    const scrolledToBeginning = divRef.current.scrollTop === 0;

    if (newLogsAdded && scrolledToBeginning) {
      const firstLineContents = prevLogs[0];
      const lineToScroll = logs.findIndex((value) => value == firstLineContents);

      if (lineToScroll !== -1) {
        scrollToItem(lineToScroll, "start");
      }
    }
  };

  /**
   * Checks if JumpToBottom button should be visible and sets its observable
   * @param props Scrolling props from virtual list core
   */
  const setButtonVisibility = (props: ListOnScrollProps) => {
    const offset = 100 * lineHeight;
    const { scrollHeight } = divRef.current;
    const { scrollOffset } = props;

    setIsJumpButtonVisible(scrollHeight - scrollOffset >= offset);
  };

  /**
   * Checks if last log line considered visible to user, setting its observable
   * @param props Scrolling props from virtual list core
   */
  const setLastLineVisibility = (props: ListOnScrollProps) => {
    const { scrollHeight, clientHeight } = divRef.current;
    const { scrollOffset } = props;

    setIsLastLineVisible(clientHeight + scrollOffset === scrollHeight);
  };

  /**
   * Check if user scrolled to top and new logs should be loaded
   * @param props Scrolling props from virtual list core
   */
  const checkLoadIntent = (props: ListOnScrollProps) => {
    const { scrollOffset } = props;

    if (scrollOffset === 0) {
      model.loadLogs();
    }
  };

  const scrollToBottom = () => {
    if (!divRef.current) return;
    divRef.current.scrollTop = divRef.current.scrollHeight;
  };

  const scrollToItem = (index: number, align: Align) => {
    listRef.current?.scrollToItem(index, align);
  };

  const onScroll = (props: ListOnScrollProps) => {
    setIsLastLineVisible(false);
    onScrollDebounced(props);
  };

  const onScrollDebounced = debounce((props: ListOnScrollProps) => {
    if (divRef.current) {
      setButtonVisibility(props);
      setLastLineVisibility(props);
      checkLoadIntent(props);
    }
  }, 700); // Increasing performance and giving some time for virtual list to settle down

  /**
   * A function is called by VirtualList for rendering each of the row
   * @param rowIndex index of the log element in logs array
   * @returns A react element with a row itself
   */
  const getLogRow = (rowIndex: number) => {
    const { searchQuery, isActiveOverlay } = model.searchStore;
    const item = logs[rowIndex];
    const contents: React.ReactElement[] = [];
    const ansiToHtml = (ansi: string) => DOMPurify.sanitize(colorConverter.ansi_to_html(ansi));

    if (searchQuery) { // If search is enabled, replace keyword with backgrounded <span>
      // Case-insensitive search (lowercasing query and keywords in line)
      const regex = new RegExp(SearchStore.escapeRegex(searchQuery), "gi");
      const matches = item.matchAll(regex);
      const modified = item.replace(regex, match => match.toLowerCase());
      // Splitting text line by keyword
      const pieces = modified.split(searchQuery.toLowerCase());

      pieces.forEach((piece, index) => {
        const active = isActiveOverlay(rowIndex, index);
        const lastItem = index === pieces.length - 1;
        const overlayValue = matches.next().value;
        const overlay = !lastItem
          ? <span
            className={cssNames("overlay", { active })}
            dangerouslySetInnerHTML={{ __html: ansiToHtml(overlayValue) }}
          />
          : null;

        contents.push(
          <React.Fragment key={piece + index}>
            <span dangerouslySetInnerHTML={{ __html: ansiToHtml(piece) }} />
            {overlay}
          </React.Fragment>,
        );
      });
    }

    return (
      <div className={cssNames("LogRow")}>
        {contents.length > 1 ? contents : (
          <span dangerouslySetInnerHTML={{ __html: ansiToHtml(item) }} />
        )}
        {/* For preserving copy-paste experience and keeping line breaks */}
        <br />
      </div>
    );
  };

  useEffect(reaction(() => model.logs.get(), (logs, prevLogs) => {
    onLogsInitialLoad(logs, prevLogs);
    onLogsUpdate();
    onUserScrolledUp(logs, prevLogs);
  }), []);

  if (model.isLoading.get()) {
    return (
      <div className="LogList flex box grow align-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="LogList flex box grow align-center justify-center">
          There are no logs available for container {model.logTabData.get()?.selectedContainer}
      </div>
    );
  }

  return (
    <div className={cssNames("LogList flex" )}>
      <VirtualList
        items={logs}
        rowHeights={array.filled(logs.length, lineHeight)}
        getRow={getLogRow}
        onScroll={onScroll}
        outerRef={divRef}
        ref={listRef}
        className="box grow"
      />
      {isJumpButtonVisible && (
        <ToBottom onClick={scrollToBottom} />
      )}
    </div>
  );
}));

export const LogList = withInjectables<Dependencies, LogListProps, LogListRef>(NonInjectedLogList, {
  getProps: (di, props) => ({
    ...props,
    localeTimezone: di.inject(localeTimezoneInjectable),
  }),
});
