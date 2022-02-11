/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import createTerminalTabInjectable from "../../renderer/components/dock/terminal/create-terminal-tab.injectable";
import terminalStoreInjectable from "../../renderer/components/dock/terminal/store.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";
import logTabStoreInjectable from "../../renderer/components/dock/logs/tab-store.injectable";

import commandOverlayInjectable from "../../renderer/components/command-palette/command-overlay.injectable";
import createPodLogsTabInjectable from "../../renderer/components/dock/logs/create-pod-logs-tab.injectable";
import createWorkloadLogsTabInjectable from "../../renderer/components/dock/logs/create-workload-logs-tab.injectable";
import sendCommandInjectable from "../../renderer/components/dock/terminal/send-command.injectable";
import renameTabInjectable from "../../renderer/components/dock/dock/rename-tab.injectable";
import okNotificationInjectable from "../../renderer/components/notifications/ok.injectable";
import errorNotificationInjectable from "../../renderer/components/notifications/error.injectable";
import infoNotificationInjectable from "../../renderer/components/notifications/info.injectable";
import shortInfoNotificationInjectable from "../../renderer/components/notifications/short-info.injectable";
import { NotificationsList } from "../../renderer/components/notifications/list";
import { ConfirmDialog as _ConfirmDialog } from "../../renderer/components/confirm-dialog/view";
import confirmInjectable from "../../renderer/components/confirm-dialog/confirm.injectable";
import openConfirmDialogInjectable from "../../renderer/components/confirm-dialog/open.injectable";
import kubeSelectedUrlParamInjectable from "../../renderer/components/kube-object/details/selected.injectable";
import detailsSelflinkPageParamInjectable from "../../renderer/components/kube-object/details/selflink.injectable";
import { MainLayout, type MainLayoutProps } from "../../renderer/components/layout/main-layout";
import podStoreInjectable from "../../renderer/components/+workloads-pods/store.injectable";

// layouts
export { MainLayout, type MainLayoutProps };
export { SettingLayout, type SettingLayoutProps } from "../../renderer/components/layout/setting-layout";

/**
 * @deprecated use `MainLayout` or `SettingLayout` instead
 */
export const PageLayout = MainLayout;

export { WizardLayout, type WizardLayoutProps } from "../../renderer/components/layout/wizard-layout";
export { TabLayout, type TabLayoutProps, type TabLayoutRoute } from "../../renderer/components/layout/tab-layout";

// form-controls
export { Button, type ButtonProps } from "../../renderer/components/button";
export { Checkbox, type CheckboxProps } from "../../renderer/components/checkbox";
export { Radio, RadioGroup } from "../../renderer/components/radio";
export type { RadioProps, RadioGroupProps } from "../../renderer/components/radio";
export { Select } from "../../renderer/components/select";
export type { GroupSelectOption, SelectOption, SelectProps } from "../../renderer/components/select";
export { Slider, type SliderProps } from "../../renderer/components/slider";
export { Switch, FormSwitch, Switcher } from "../../renderer/components/switch";
export { InputValidators, Input } from "../../renderer/components/input/input";
export type { IconData, IconDataFnArg, InputProps, InputValidator } from "../../renderer/components/input/input";

// command-overlay
export const CommandOverlay = asLegacyGlobalForExtensionApi(commandOverlayInjectable);

export type {
  CategoryColumnRegistration,
  AdditionalCategoryColumnRegistration,
} from "../../renderer/components/+catalog/custom-category-columns";

// other components
export { Icon, type IconProps } from "../../renderer/components/icon";
export {
  Tooltip,
  TooltipPosition,
  withTooltip,
} from "../../renderer/components/tooltip";
export type {
  TooltipContentFormatters,
  TooltipDecoratorProps,
  TooltipProps,
} from "../../renderer/components/tooltip";
export { Tab, Tabs } from "../../renderer/components/tabs";
export type { TabProps, TabsProps } from "../../renderer/components/tabs";
export {
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "../../renderer/components/table";
export type {
  TableCellElem,
  TableCellProps,
  TableHeadProps,
  TableOrderBy,
  TableHeadElem,
  TableProps,
  TableRowElem,
  TableRowProps,
  TableSortBy,
  TableSortCallback,
  TableSortCallbacks,
  TableSortParams,
} from "../../renderer/components/table";
export { Badge, type BadgeProps } from "../../renderer/components/badge";
export {
  Drawer,
  DrawerItem,
  DrawerItemLabels,
  DrawerParamToggler,
  DrawerTitle,
} from "../../renderer/components/drawer";
export type {
  DrawerItemLabelsProps,
  DrawerItemProps,
  DrawerParamTogglerProps,
  DrawerProps,
  DrawerTitleProps,
} from "../../renderer/components/drawer";
export { Dialog, type DialogProps } from "../../renderer/components/dialog";
export {
  LineProgress,
  type LineProgressProps,
} from "../../renderer/components/line-progress";
export type {
  MenuActionsProps,
  MenuContextValue,
  MenuItemProps,
  MenuPosition,
  MenuProps,
  MenuStyle,
} from "../../renderer/components/menu";
export {
  Menu,
  MenuActions,
  MenuContext,
  MenuItem,
  SubMenu,
} from "../../renderer/components/menu";
export { Spinner, type SpinnerProps } from "../../renderer/components/spinner";
export { Stepper, type StepperProps } from "../../renderer/components/stepper";
export {
  Wizard,
  type WizardProps,
  WizardStep,
  type WizardStepProps,
} from "../../renderer/components/wizard";
export {
  PodDetailsList,
  type PodDetailsListProps,
} from "../../renderer/components/+workloads-pods/pod-details-list";
export {
  type NamespaceSelectProps,
  NamespaceSelect,
} from "../../renderer/components/+namespaces/namespace-select";
export { NamespaceSelectFilter } from "../../renderer/components/+namespaces/namespace-select-filter";
export {
  type SubTitleProps,
  SubTitle,
} from "../../renderer/components/layout/sub-title";
export {
  type SearchInputProps,
  SearchInput,
} from "../../renderer/components/input/search-input";
export {
  type BarChartProps,
  BarChart,
} from "../../renderer/components/chart/bar-chart";
export {
  type PieChartProps,
  PieChart,
} from "../../renderer/components/chart/pie-chart";

export type {
  ConfirmDialogBooleanParams,
  ConfirmDialogParams,
  ConfirmDialogProps,
} from "../../renderer/components/confirm-dialog/view";
export const ConfirmDialog = Object.assign(_ConfirmDialog, {
  confirm: asLegacyGlobalForExtensionApi(confirmInjectable),
  open: asLegacyGlobalForExtensionApi(openConfirmDialogInjectable),
});

export const Notifications = Object.assign(NotificationsList, {
  ok: asLegacyGlobalForExtensionApi(okNotificationInjectable),
  error: asLegacyGlobalForExtensionApi(errorNotificationInjectable),
  info: asLegacyGlobalForExtensionApi(infoNotificationInjectable),
  shortInfo: asLegacyGlobalForExtensionApi(shortInfoNotificationInjectable),
});

// kube helpers
export {
  type KubeObjectDetailsProps,
  KubeObjectDetails,
} from "../../renderer/components/kube-object-details";
export {
  type KubeObjectListLayoutProps,
  KubeObjectListLayout,
} from "../../renderer/components/kube-object-list-layout";
export {
  type KubeObjectMenuProps,
  KubeObjectMenu,
} from "../../renderer/components/kube-object-menu";
export {
  type KubeObjectMetaProps,
  KubeObjectMeta,
} from "../../renderer/components/kube-object-meta";
export {
  type KubeEventDetailsProps,
  KubeEventDetails,
} from "../../renderer/components/+events/kube-event-details";

export const kubeSelectedUrlParam = asLegacyGlobalForExtensionApi(kubeSelectedUrlParamInjectable);
export const kubeDetailsUrlParam = asLegacyGlobalForExtensionApi(detailsSelflinkPageParamInjectable);

// specific exports
export {
  StatusBrick,
  type StatusBrickProps,
} from "../../renderer/components/status-brick";

export const createTerminalTab = asLegacyGlobalForExtensionApi(createTerminalTabInjectable);
export const terminalStore = Object.assign(
  asLegacyGlobalForExtensionApi(terminalStoreInjectable),
  {
    sendCommand: asLegacyGlobalForExtensionApi(sendCommandInjectable),
  },
);

const renameTab = asLegacyGlobalForExtensionApi(renameTabInjectable);
const podStore = asLegacyGlobalForExtensionApi(podStoreInjectable);

export const logTabStore = Object.assign(
  asLegacyGlobalForExtensionApi(logTabStoreInjectable),
  {
    createPodTab: asLegacyGlobalForExtensionApi(createPodLogsTabInjectable),
    createWorkloadTab: asLegacyGlobalForExtensionApi(createWorkloadLogsTabInjectable),
    renameTab: (tabId: string): void => {
      const tabData = logTabStore.getData(tabId);
      const pod = podStore.getById(tabData.selectedPodId);

      renameTab(tabId, `Pod ${pod.getName()}`);
    },
    tabs: undefined,
  },
);

export class TerminalStore {
  static getInstance() {
    return terminalStore;
  }

  static createInstance() {
    return terminalStore;
  }

  static resetInstance() {
    console.warn("TerminalStore.resetInstance() does nothing");
  }
}
