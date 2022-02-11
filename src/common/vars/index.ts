/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Default theme variables
export const defaultTheme = "lens-dark" as string;
export const defaultFontSize = 12;
export const defaultTerminalFontFamily = "RobotoMono";
export const defaultEditorFontFamily = "RobotoMono";

// Normalized platform
export const normalizedPlatform = (() => {
  switch (process.platform) {
    case "darwin":
      return "darwin";
    case "linux":
      return "linux";
    case "win32":
      return "windows";
    default:
      throw new Error(`platform=${process.platform} is unsupported`);
  }
})();
export const normalizedArch = (() => {
  switch (process.arch) {
    case "arm64":
      return "arm64";
    case "x64":
    case "amd64":
      return "x64";
    case "386":
    case "x32":
    case "ia32":
      return "ia32";
    default:
      throw new Error(`arch=${process.arch} is unsupported`);
  }
})();

// Apis
export const apiPrefix = "/api" as string; // local router apis
export const apiKubePrefix = "/api-kube" as string; // k8s cluster apis
export const shellRoute = "/shell" as string; // for shell api requests

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/zt-wcl8jq3k-68R5Wcmk1o95MLBE5igUDQ" as string;
export const supportUrl = "https://docs.k8slens.dev/latest/support/" as string;
export const docsUrl = "https://docs.k8slens.dev/main/" as string;
