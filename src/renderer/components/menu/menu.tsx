/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu.scss";

import type { ReactElement, ReactNode, MouseEvent } from "react";
import React, { useImperativeHandle, useRef, forwardRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { autoBind, cssNames, getOrInsertWith, iter, noop } from "../../utils";
import { Animate } from "../animate";
import type { IconProps } from "../icon";
import { Icon } from "../icon";
import isEqual from "lodash/isEqual";

type GlobalMouseEvent = globalThis.MouseEvent;

export const MenuContext = React.createContext<MenuContextValue>(null);
export type MenuContextValue = Menu;

enum Direction {
  FORWARD = 1,
  REVERSE = 1,
}

export interface MenuPosition {
  left?: boolean;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
}

export interface MenuStyle {
  top: string;
  left: string;
}
export interface MenuProps {
  isOpen?: boolean;
  open(): void;
  close(): void;
  id?: string;
  className?: string;
  htmlFor?: string;
  autoFocus?: boolean;
  usePortal?: boolean | HTMLElement;
  closeOnClickItem?: boolean;       // close menu on item click
  closeOnClickOutside?: boolean;    // use false value for sub-menus
  closeOnScroll?: boolean;          // applicable when usePortal={true}
  position?: MenuPosition;          // applicable when usePortal={false}
  children?: ReactNode;
  toggleEvent?: "click" | "contextmenu";
}

interface State {
  position?: MenuPosition;
  menuStyle?: MenuStyle;
}

const defaultPropsMenu: Partial<MenuProps> = {
  position: { right: true, bottom: true },
  autoFocus: false,
  usePortal: false,
  closeOnClickItem: true,
  closeOnClickOutside: true,
  closeOnScroll: false,
  toggleEvent: "click",
};

export class Menu extends React.Component<MenuProps, State> {
  static defaultProps = defaultPropsMenu as object;

  constructor(props: MenuProps) {
    super(props);
    autoBind(this);
  }
  public opener: HTMLElement;
  public elem: HTMLUListElement;
  protected readonly items = new Map<number, React.MutableRefObject<MenuItemRef>>();
  public state: State = {};

  get isOpen() {
    return !!this.props.isOpen;
  }

  get isClosed() {
    return !this.isOpen;
  }

  componentDidMount() {
    if (!this.props.usePortal) {
      const parent = this.elem.parentElement;
      const position = window.getComputedStyle(parent).position;

      if (position === "static") {
        parent.style.position = "relative";
      }
    } else if (this.isOpen) {
      this.refreshPosition();
    }
    this.opener = document.getElementById(this.props.htmlFor); // might not exist in sub-menus

    if (this.opener) {
      this.opener.addEventListener(this.props.toggleEvent, this.toggle);
      this.opener.addEventListener("keydown", this.onKeyDown);
    }
    this.elem.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("click", this.onClickOutside, true);
    window.addEventListener("scroll", this.onScrollOutside, true);
    window.addEventListener("contextmenu", this.onContextMenu, true);
    window.addEventListener("blur", this.onBlur, true);
  }

  componentWillUnmount() {
    if (this.opener) {
      this.opener.removeEventListener(this.props.toggleEvent, this.toggle);
      this.opener.removeEventListener("keydown", this.onKeyDown);
    }
    this.elem.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("click", this.onClickOutside, true);
    window.removeEventListener("scroll", this.onScrollOutside, true);
  }

  componentDidUpdate(prevProps: MenuProps) {
    if (!isEqual(prevProps.children, this.props.children)) {
      this.refreshPosition();
    }
  }

  protected get focusableItems() {
    return [...iter.filter(this.items.values(), item => item.current.isFocusable)];
  }

  protected get focusedItem() {
    return iter.find(this.items.values(), item => item.current.isFocused);
  }

  protected focusNextItem(direction: Direction) {
    const items = this.focusableItems;

    if (!items.length) {
      return;
    }

    const activeIndex = Math.max(items.findIndex(item => item === this.focusedItem), 0);
    const nextItem = items[activeIndex + direction] ?? items[activeIndex];

    nextItem.current?.focus();
  }

  refreshPosition = () => {
    if (!this.props.usePortal || !this.opener || !this.elem) {
      return;
    }

    const openerClientRect = this.opener.getBoundingClientRect();
    let { left: openerLeft, top: openerTop, bottom: openerBottom, right: openerRight } = this.opener.getBoundingClientRect();
    const withScroll = window.getComputedStyle(this.elem).position !== "fixed";

    // window global scroll corrections
    if (withScroll) {
      openerLeft += window.pageXOffset;
      openerTop += window.pageYOffset;
      openerRight = openerLeft + openerClientRect.width;
      openerBottom = openerTop + openerClientRect.height;
    }

    const extraMargin = this.props.usePortal ? 8 : 0;

    const { width: menuWidth, height: menuHeight } = this.elem.getBoundingClientRect();

    const rightSideOfMenu = openerLeft + menuWidth;
    const renderMenuLeft = rightSideOfMenu > window.innerWidth;
    const menuOnLeftSidePosition = `${openerRight - this.elem.offsetWidth}px`;
    const menuOnRightSidePosition = `${openerLeft}px`;

    const bottomOfMenu = openerBottom + extraMargin + menuHeight;
    const renderMenuOnTop = bottomOfMenu > window.innerHeight;
    const menuOnTopPosition = `${openerTop - this.elem.offsetHeight - extraMargin}px`;
    const menuOnBottomPosition = `${openerBottom + extraMargin}px`;

    this.setState({
      position: {
        top: renderMenuOnTop,
        bottom: !renderMenuOnTop,
        left: renderMenuLeft,
        right: !renderMenuLeft,
      },
      menuStyle: {
        top: renderMenuOnTop ? menuOnTopPosition : menuOnBottomPosition,
        left: renderMenuLeft ? menuOnLeftSidePosition : menuOnRightSidePosition,
      },
    });
  };

  open() {
    if (this.isOpen) {
      return;
    }

    this.props.open();
    this.refreshPosition();

    if (this.props.autoFocus) {
      this.focusNextItem(Direction.FORWARD);
    }
  }

  close() {
    if (this.isClosed) {
      return;
    }

    this.props.close();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  onKeyDown(evt: KeyboardEvent) {
    if (!this.isOpen) return;

    switch (evt.code) {
      case "Escape":
        this.close();
        break;

      case "Space":
        // fallthrough

      case "Enter": {
        const focusedItem = this.focusedItem;

        if (focusedItem) {
          focusedItem.current.click();
          evt.preventDefault();
        }
        break;
      }

      case "ArrowUp":
        this.focusNextItem(Direction.REVERSE);
        break;

      case "ArrowDown":
        this.focusNextItem(Direction.FORWARD);
        break;
    }
  }

  onContextMenu() {
    this.close();
  }

  onWindowResize() {
    if (!this.isOpen) return;
    this.refreshPosition();
  }

  onScrollOutside(evt: UIEvent) {
    if (!this.isOpen) return;
    const target = evt.target as HTMLElement;
    const { usePortal, closeOnScroll } = this.props;

    if (usePortal && closeOnScroll && !target.contains(this.elem)) {
      this.close();
    }
  }

  onClickOutside(evt: GlobalMouseEvent) {
    if (!this.props.closeOnClickOutside) return;
    if (!this.isOpen || evt.target === document.body) return;
    const target = evt.target as HTMLElement;
    const clickInsideMenu = this.elem.contains(target);
    const clickOnOpener = this.opener && this.opener.contains(target);

    if (!clickInsideMenu && !clickOnOpener) {
      this.close();
    }
  }

  onBlur() {
    if (!this.isOpen) return;  // Prevents triggering document.activeElement for each <Menu/> instance

    if (document.activeElement?.tagName == "IFRAME") {
      this.close();
    }
  }

  protected bindRef(elem: HTMLUListElement) {
    this.elem = elem;
  }

  render() {
    const { position, id } = this.props;
    let { className, usePortal } = this.props;

    className = cssNames("Menu", className, this.state.position || position, {
      portal: usePortal,
    });

    let children = this.props.children as ReactElement<any>;

    if (children.type === Fragment) {
      children = children.props.children;
    }
    const menuItems = React.Children.toArray(children).map((item: ReactElement<MenuItemProps>, index) => {
      if (item.type === MenuItem) {
        const ref = getOrInsertWith(this.items, index, () => useRef());

        return React.cloneElement(item, { ref });
      }

      return item;
    });

    const menu = (
      <MenuContext.Provider value={this}>
        <Animate enter={this.isOpen}>
          <ul
            id={id}
            ref={this.bindRef}
            className={className}
            style={{
              left: this.state?.menuStyle?.left,
              top: this.state?.menuStyle?.top,
            }}
          >
            {menuItems}
          </ul>
        </Animate>
      </MenuContext.Provider>
    );

    if (usePortal === true) usePortal = document.body;

    return usePortal instanceof HTMLElement ? createPortal(menu, usePortal) : menu;
  }
}

export const SubMenu = ({ className, ...menuProps }: Partial<MenuProps>) => (
  <Menu
    className={cssNames("SubMenu", className)}
    isOpen
    open={noop}
    close={noop}
    position={{}} // reset position, must be handled in css
    closeOnClickOutside={false}
    closeOnClickItem={false}
    {...menuProps} />
);

export interface MenuItemProps extends React.HTMLProps<any> {
  icon?: string | IconProps;
  disabled?: boolean;
  active?: boolean;
  spacer?: boolean;
  href?: string;
}

export interface MenuItemRef {
  focus(): void;
  click(): void;
  readonly isFocusable: boolean;
  readonly isFocused: boolean;
}

export const MenuItem = forwardRef<MenuItemRef, MenuItemProps>(({ className, disabled, active, spacer, icon, children, onClick = noop, ...props }, ref) => {
  const elem = useRef<HTMLAnchorElement & HTMLLIElement>();
  const isFocusable = !(disabled || spacer);

  useImperativeHandle(ref, () => ({
    focus: () => elem.current?.focus(),
    click: () => elem.current?.click(),
    get isFocusable() {
      return isFocusable;
    },
    get isFocused() {
      return elem.current === document.activeElement;
    },
  }));

  return (
    <MenuContext.Consumer>
      {menu => {
        const childProps = {
          tabIndex: isFocusable ? 0 : -1,
          ...props,
          className: cssNames("MenuItem", className, { disabled, active, spacer }),
          onClick: (event: MouseEvent<HTMLElement>) => {
            if (spacer) {
              return;
            }

            onClick(event);

            if (menu.props.closeOnClickItem && !event.defaultPrevented) {
              menu.close();
            }
          },
        };
        const child = <>
          {icon && (
            <Icon {...(
              typeof icon === "string"
                ? { material: icon }
                : icon
            )} />
          )}
          {children}
        </>;

        return props.href
          ? <a {...childProps} ref={elem}>{child}</a>
          : <li {...childProps} ref={elem}>{child}</li>;
      } }
    </MenuContext.Consumer>
  );
});
