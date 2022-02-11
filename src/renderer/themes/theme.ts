/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ITheme } from "xterm";
import type { MonacoTheme } from "../components/monaco-editor";

export type ThemeId = string;

export type ThemeType = "dark" | "light";

export const systemThemeMatchId: ThemeId = "__system__";

export interface Theme {
  name: string;
  type: ThemeType;
  colors: ThemeColors;
  terminalColors: TerminalThemeColors;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
}

export interface ThemeColors {
  blue: string;
  magenta: string;
  golden: string;
  halfGray: string;
  primary: string;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorTertiary: string;
  textColorAccent: string;
  textColorDimmed: string;
  borderColor: string;
  borderFaintColor: string;
  mainBackground: string;
  secondaryBackground: string;
  contentColor: string;
  layoutBackground: string;
  layoutTabsBackground: string;
  layoutTabsActiveColor: string;
  layoutTabsLineColor: string;
  sidebarBackground: string;
  sidebarLogoBackground: string;
  sidebarActiveColor: string;
  sidebarSubmenuActiveColor: string;
  sidebarItemHoverBackground: string;
  buttonPrimaryBackground: string;
  buttonDefaultBackground: string;
  buttonLightBackground: string;
  buttonAccentBackground: string;
  buttonDisabledBackground: string;
  tableBgcStripe: string;
  tableBgcSelected: string;
  tableHeaderBackground: string;
  tableHeaderBorderWidth: string;
  tableHeaderBorderColor: string;
  tableHeaderColor: string;
  tableSelectedRowColor: string;
  helmLogoBackground: string;
  helmImgBackground: string;
  helmStableRepo: string;
  helmIncubatorRepo: string;
  helmDescriptionHr: string;
  helmDescriptionBlockquoteColor: string;
  helmDescriptionBlockquoteBorder: string;
  helmDescriptionBlockquoteBackground: string;
  helmDescriptionHeaders: string;
  helmDescriptionH6: string;
  helmDescriptionTdBorder: string;
  helmDescriptionTrBackground: string;
  helmDescriptionCodeBackground: string;
  helmDescriptionPreBackground: string;
  helmDescriptionPreColor: string;
  colorSuccess: string;
  colorOk: string;
  colorInfo: string;
  colorError: string;
  colorSoftError: string;
  colorWarning: string;
  colorVague: string;
  colorTerminated: string;
  dockHeadBackground: string;
  dockInfoBackground: string;
  dockInfoBorderColor: string;
  dockEditorBackground: string;
  dockEditorTag: string;
  dockEditorKeyword: string;
  dockEditorComment: string;
  dockEditorActiveLineBackground: string;
  dockBadgeBackground: string;
  logsBackground: string;
  logsForeground: string;
  logRowHoverBackground: string;
  dialogTextColor: string;
  dialogBackground: string;
  dialogHeaderBackground: string;
  dialogFooterBackground: string;
  drawerTogglerBackground: string;
  drawerTitleText: string;
  drawerSubtitleBackground: string;
  drawerItemNameColor: string;
  drawerItemValueColor: string;
  clusterMenuBackground: string;
  clusterMenuBorderColor: string;
  clusterMenuCellBackground: string;
  clusterSettingsBackground: string;
  addClusterIconColor: string;
  boxShadow: string;
  iconActiveColor: string;
  iconActiveBackground: string;
  filterAreaBackground: string;
  chartLiveBarBackground: string;
  chartStripesColor: string;
  chartCapacityColor: string;
  pieChartDefaultColor: string;
  inputOptionHoverColor: string;
  inputControlBackground: string;
  inputControlBorder: string;
  inputControlHoverBorder: string;
  lineProgressBackground: string;
  radioActiveBackground: string;
  menuActiveBackground: string;
  menuSelectedOptionBgc: string;
  canvasBackground: string;
  scrollBarColor: string;
  settingsBackground: string;
  settingsColor: string;
  navSelectedBackground: string;
  navHoverColor: string;
  hrColor: string;
  tooltipBackground: string;
}

export type TerminalThemeColors = Required<ITheme>;
