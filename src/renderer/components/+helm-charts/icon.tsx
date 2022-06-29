/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";

export interface HelmChartIconProps {
  className?: string;
  chart: HelmChart;
}

export const HelmChartIcon = ({
  chart,
  className,
}: HelmChartIconProps) => {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const icon = chart.getIcon();

  if (!icon || failedToLoad) {
    return (
      <div className={className}>
        <svg viewBox="0 0 722.8 702" xmlns="http://www.w3.org/2000/svg">
          <g fill="#929ba6">
            <path d="m318 299.5c2.1 1.6 4.8 2.5 7.6 2.5 6.9 0 12.6-5.5 12.9-12.3l.3-.2 4.3-76.7c-5.2.6-10.4 1.5-15.6 2.7-28.5 6.5-53.2 20.5-72.6 39.5l62.9 44.6z"/>
            <path d="m309.5 411.9c-1.4-5.9-6.6-9.9-12.4-10-.8 0-1.7.1-2.5.2l-.1-.2-75.5 12.8c11.7 32.2 33.4 58.5 60.8 76.1l29.2-70.7-.2-.3c1.1-2.4 1.4-5.2.7-7.9z"/>
            <path d="m284.4 357.5c2.5-.7 4.9-2.2 6.7-4.4 4.3-5.4 3.6-13.2-1.6-17.8l.1-.3-57.4-51.4c-17 27.8-25.1 61.1-21.4 95.3l73.6-21.2z"/>
            <path d="m340.2 380 21.2 10.2 21.1-10.1 5.3-22.9-14.6-18.2h-23.6l-14.6 18.2z"/>
            <path d="m384.2 289.4c.1 2.6 1 5.2 2.8 7.5 4.3 5.4 12.1 6.4 17.7 2.4l.2.1 62.5-44.3c-23.6-23.1-54.4-38.2-87.6-42.2z"/>
            <path d="m490.3 283.7-57.1 51.1v.2c-2 1.7-3.5 4.1-4.1 6.8-1.5 6.8 2.5 13.5 9.2 15.3l.1.3 74 21.3c1.6-16 .6-32.5-3.2-49-3.9-16.8-10.4-32.2-18.9-46z"/>
            <path d="m372.8 439.6c-1.2-2.3-3.2-4.3-5.8-5.5-2-.9-4-1.4-6-1.3-4.5.2-8.7 2.6-10.9 6.8h-.1l-37.1 67.1c25.7 8.8 54.1 10.7 82.5 4.2 5.1-1.2 10-2.5 14.9-4.2l-37.3-67.1z"/>
            <path d="m711.7 425-60.4-262.2c-3.2-13.7-12.5-25.3-25.3-31.4l-244.4-116.8c-7.1-3.4-14.8-4.9-22.7-4.5-6.2.3-12.3 1.9-17.9 4.5l-244.3 116.7c-12.8 6.1-22.1 17.7-25.3 31.4l-60.2 262.3c-2.8 12.2-.5 25 6.3 35.5.8 1.3 1.7 2.5 2.7 3.7l169.1 210.3c8.9 11 22.3 17.4 36.5 17.4l271.2-.1c14.2 0 27.7-6.4 36.5-17.4l169.1-210.3c8.9-10.9 12.2-25.4 9.1-39.1zm-93-3.2c-1.8 7.8-10.2 12.6-18.9 10.7-.1 0-.2 0-.2 0-.1 0-.2-.1-.3-.1-1.2-.3-2.7-.5-3.8-.8-5-1.3-8.6-3.3-13.1-5.1-9.7-3.5-17.7-6.4-25.5-7.5-4-.3-6 1.6-8.2 3-1.1-.2-4.4-.8-6.2-1.1-14 44-43.9 82.2-84.3 106.1.7 1.7 1.9 5.3 2.4 5.9-.9 2.5-2.3 4.8-1.1 8.6 2.8 7.4 7.4 14.6 13 23.2 2.7 4 5.4 7.1 7.8 11.7.6 1.1 1.3 2.8 1.9 3.9 3.8 8 1 17.3-6.2 20.8-7.3 3.5-16.3-.2-20.2-8.3-.6-1.1-1.3-2.7-1.8-3.8-2.1-4.7-2.8-8.8-4.2-13.4-3.3-9.7-6-17.8-10-24.6-2.2-3.3-5-3.7-7.5-4.5-.5-.8-2.2-4-3.1-5.6-8.1 3.1-16.4 5.6-25.1 7.6-37.9 8.6-75.9 5.1-109.9-7.9l-3.3 6c-2.5.7-4.8 1.3-6.3 3.1-5.3 6.4-7.5 16.6-11.3 26.3-1.5 4.6-2.1 8.7-4.2 13.4-.5 1.1-1.3 2.6-1.8 3.7-3.9 8.1-12.9 11.7-20.2 8.2-7.2-3.5-10-12.7-6.2-20.8.6-1.2 1.3-2.8 1.9-3.9 2.4-4.6 5.2-7.7 7.8-11.7 5.5-8.7 10.4-16.4 13.2-23.8.7-2.4-.3-5.8-1.3-8.3l2.7-6.4c-38.9-23.1-69.7-59.8-84.3-105.3l-6.4 1.1c-1.7-1-5.1-3.2-8.4-3-7.8 1.1-15.8 4-25.5 7.5-4.5 1.7-8.1 3.7-13.1 5-1.1.3-2.6.6-3.8.8-.1 0-.2.1-.3.1s-.2 0-.2 0c-8.7 1.9-17.1-2.9-18.9-10.7s3.8-15.7 12.4-17.8c.1 0 .2 0 .2-.1h.1c1.2-.3 2.8-.7 3.9-.9 5.1-1 9.2-.7 14-1.1 10.2-1.1 18.7-1.9 26.2-4.3 2.4-1 4.7-4.3 6.3-6.3l6.1-1.8c-6.9-47.5 4.8-94.2 29.8-131.9l-4.7-4.2c-.3-1.8-.7-6-2.9-8.4-5.8-5.4-13-9.9-21.8-15.3-4.2-2.4-8-4-12.1-7.1-.9-.7-2.1-1.7-3-2.4-.1-.1-.1-.1-.2-.2-7-5.6-8.6-15.2-3.6-21.6 2.8-3.6 7.2-5.3 11.7-5.2 3.5.1 7.1 1.4 10.2 3.8 1 .8 2.4 1.8 3.2 2.6 3.9 3.4 6.3 6.7 9.6 10.2 7.2 7.3 13.2 13.4 19.7 17.8 3.4 2 6.1 1.2 8.7.8.8.6 3.7 2.6 5.3 3.8 24.9-26.4 57.6-46 95.6-54.6 8.8-2 17.7-3.3 26.4-4.1l.3-6.2c1.9-1.9 4.1-4.6 4.8-7.6.6-7.9-.4-16.3-1.6-26.5-.7-4.8-1.8-8.7-2-13.9 0-1.1 0-2.5 0-3.8 0-.1 0-.3 0-.4 0-9 6.5-16.2 14.6-16.2s14.6 7.3 14.6 16.2c0 1.3.1 3 0 4.2-.2 5.2-1.3 9.1-2 13.9-1.2 10.2-2.3 18.7-1.7 26.5.6 3.9 2.9 5.5 4.8 7.3 0 1.1.2 4.6.3 6.5 46.5 4.1 89.7 25.4 121.4 58.7l5.6-4c1.9.1 6 .7 8.9-1 6.5-4.4 12.5-10.5 19.7-17.8 3.3-3.5 5.7-6.8 9.7-10.2.9-.8 2.3-1.8 3.2-2.6 7-5.6 16.8-5 21.8 1.3s3.4 16-3.6 21.6c-1 .8-2.3 1.9-3.2 2.6-4.2 3.1-8 4.7-12.2 7.1-8.7 5.4-16 9.9-21.8 15.3-2.7 2.9-2.5 5.7-2.8 8.3-.8.7-3.7 3.3-5.2 4.7 12.6 18.8 22.1 40.1 27.4 63.3 5.3 23.1 6.1 46.1 3.1 68.3l5.9 1.7c1.1 1.5 3.2 5.2 6.3 6.3 7.5 2.4 16 3.2 26.2 4.3 4.8.4 8.9.2 14 1.1 1.2.2 3 .7 4.2 1 8.9 2.4 14.4 10.4 12.6 18.2z"/>
            <path d="m428 401.7c-1-.2-2-.3-3-.2-1.7.1-3.3.5-4.9 1.3-6.2 3-9 10.4-6.2 16.7l-.1.1 29.6 71.4c28.5-18.2 49.8-45.3 61-76.6l-76.2-12.9z"/>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={icon}
      onLoad={evt => evt.currentTarget.classList.add("visible")}
      onError={() => setFailedToLoad(true)}
    />
  );
};
