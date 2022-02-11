/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { LocaleTimezone } from "../../../common/user-preferences/locale-timezone.injectable";
import localeTimezoneInjectable from "../../../common/user-preferences/locale-timezone.injectable";

export interface LocaleDateProps {
  date: string;
}

interface Dependencies {
  localeTimezone: LocaleTimezone;
}

const NonInjectedLocaleDate = observer(({
  localeTimezone,
  date,
}: Dependencies & LocaleDateProps) => (
  <>{moment.tz(date, localeTimezone.value).format()}</>
));

export const LocaleDate = withInjectables<Dependencies, LocaleDateProps>(NonInjectedLocaleDate, {
  getProps: (di, props) => ({
    ...props,
    localeTimezone: di.inject(localeTimezoneInjectable),
  }),
});
