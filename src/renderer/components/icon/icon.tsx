/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./icon.scss";

import React, { createRef } from "react";
import { NavLink } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { boundMethod, cssNames } from "../../utils";
import type { TooltipDecoratorProps } from "../tooltip";
import { withTooltip } from "../tooltip";
import isNumber from "lodash/isNumber";
import { base64 } from "../../../common/utils";
import type { LiteralUnion, RequireExactlyOne } from "type-fest";
import Configuration from "./configuration.svg";
import Crane from "./crane.svg";
import Group from "./group.svg";
import Helm from "./helm.svg";
import Install from "./install.svg";
import Kube from "./kube.svg";
import LensLogo from "./lens-logo.svg";
import License from "./license.svg";
import LogoLens from "./logo-lens.svg";
import Logout from "./logout.svg";
import Nodes from "./nodes.svg";
import PushOff from "./push_off.svg";
import PushPin from "./push_pin.svg";
import Spinner from "./spinner.svg";
import Ssh from "./ssh.svg";
import Storage from "./storage.svg";
import Terminal from "./terminal.svg";
import User from "./user.svg";
import Users from "./users.svg";
import Wheel from "./wheel.svg";
import Workloads from "./workloads.svg";

const svgs = {
  configuration: Configuration,
  crane: Crane,
  group: Group,
  helm: Helm,
  install: Install,
  kube: Kube,
  "lens-logo": LensLogo,
  license: License,
  "logo-lens": LogoLens,
  logout: Logout,
  nodes: Nodes,
  push_off: PushOff,
  push_pin: PushPin,
  spinner: Spinner,
  ssh: Ssh,
  storage: Storage,
  terminal: Terminal,
  user: User,
  users: Users,
  wheel: Wheel,
  workloads: Workloads,
};

export type IconDescriptorProps = RequireExactlyOne<{
  /**
   * material-icon, see available names at https://material.io/icons/
   */
  material?: string;
  /**
   * svg-filename without extension in current folder or an svg data URL
   */
  svg?: LiteralUnion<keyof typeof svgs, string>;
}>;

export interface BaseIconProps extends React.HTMLAttributes<Element>, TooltipDecoratorProps {
  link?: LocationDescriptor;   // render icon as NavLink from react-router-dom
  href?: string;              // render icon as hyperlink
  size?: string | number;     // icon-size
  small?: boolean;            // pre-defined icon-size
  smallest?: boolean;            // pre-defined icon-size
  big?: boolean;              // pre-defined icon-size
  active?: boolean;           // apply active-state styles
  interactive?: boolean;      // indicates that icon is interactive and highlight it on focus/hover
  focusable?: boolean;        // allow focus to the icon + show .active styles (default: "true", when icon is interactive)
  sticker?: boolean;
  disabled?: boolean;
}

export type IconProps = BaseIconProps & IconDescriptorProps;

const svgDataUrlPrefix = "data:image/svg+xml;base64,";

@withTooltip
export class Icon extends React.PureComponent<IconProps> {
  private readonly ref = createRef<HTMLAnchorElement>();

  static defaultProps = {
    focusable: true,
  };

  static isSvg(content: string) {
    return String(content).includes("svg+xml"); // data-url for raw svg-icon
  }

  static convertProps(icon: string): IconDescriptorProps {
    return Icon.isSvg(icon)
      ? {
        svg: icon,
      }
      : {
        material: icon,
      };
  }

  get isInteractive() {
    const { interactive, onClick, href, link } = this.props;

    return interactive ?? !!(onClick || href || link);
  }

  @boundMethod
  onClick(evt: React.MouseEvent) {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick(evt);
    }
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<any>) {
    switch (evt.nativeEvent.code) {
      case "Space":

      // fallthrough
      case "Enter": {
        this.ref.current?.click();
        evt.preventDefault();
        break;
      }
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }
  }

  private getSvgDataText(svg: string) {
    if (svg.startsWith(svgDataUrlPrefix)) {
      return svg;
    }

    const icon = svgs[svg as keyof typeof svgs];

    if (icon) {
      return icon;
    }

    throw new Error(`${svg} is invalid, either it is isn't a svg data URL or it is not the name of a built in svg`);
  }

  private getSvgContent(svg: string) {
    const svgDataText = this.getSvgDataText(svg);
    const __html = base64.decode(svgDataText.replace(svgDataUrlPrefix, ""));

    return <span className="icon" dangerouslySetInnerHTML={{ __html }} />;
  }

  private getIconContent(svg: string | undefined, material: string | undefined) {
    if (typeof svg === "string") {
      return this.getSvgContent(svg);
    }

    if (typeof material === "string") {
      return (
        <span className="icon" data-icon-name={material}>
          {material}
        </span>
      );
    }

    throw new Error(`one of IconProps.svg and IconProps.material is required`);
  }

  render() {
    const { isInteractive } = this;
    const {
      // skip passing props to icon's html element
      className, href, link, material, svg, size, smallest, small, big,
      disabled, sticker, active, focusable, children,
      interactive: _interactive,
      onClick: _onClick,
      onKeyDown: _onKeyDown,
      ...elemProps
    } = this.props;
    const iconProps: Partial<IconProps> = {
      className: cssNames("Icon", className,
        { svg, material, interactive: isInteractive, disabled, sticker, active, focusable },
        !size ? { smallest, small, big } : {},
      ),
      onClick: isInteractive ? this.onClick : undefined,
      onKeyDown: isInteractive ? this.onKeyDown : undefined,
      tabIndex: isInteractive && focusable && !disabled ? 0 : undefined,
      style: size ? { "--size": size + (isNumber(size) ? "px" : "") } as React.CSSProperties : undefined,
      children: (
        <>
          {this.getIconContent(svg, material)}
          {children}
        </>
      ),
      ...elemProps,
    };

    // render icon type
    if (link) {
      const { className, children } = iconProps;

      return (
        <NavLink className={className} to={link} ref={this.ref}>
          {children}
        </NavLink>
      );
    }

    if (href) {
      return <a {...iconProps} href={href} ref={this.ref} />;
    }

    return <i {...iconProps} ref={this.ref} />;
  }
}
