/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import React from "react";
import { createPortal } from "react-dom";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Animate } from "../animate";
import { cssNames, noop, stopPropagation } from "../../utils";
import type { ObservableHistory } from "mobx-observable-history";
import { withInjectables } from "@ogre-tools/injectable-react";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";

// todo: refactor + handle animation-end in props.onClose()?

export interface DialogProps {
  className?: string;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  close: () => void;
  modal?: boolean;
  pinned?: boolean;
  animated?: boolean;
  "data-testid"?: string;
}

interface Dependencies {
  navigation: ObservableHistory;
}

@observer
class NonInjectedDialog extends React.PureComponent<DialogProps & Dependencies> {
  private contentElem: HTMLElement;
  private ref = React.createRef<HTMLDivElement>();

  static defaultProps: DialogProps = {
    isOpen: false,
    onOpen: noop,
    onClose: noop,
    close: noop,
    modal: true,
    animated: true,
    pinned: false,
  };

  get elem(): HTMLElement {
    return this.ref.current;
  }

  get isOpen() {
    return this.props.isOpen;
  }

  componentDidMount() {
    if (this.isOpen) {
      this.onOpen();
    }

    disposeOnUnmount(this, [
      reaction(() => this.props.navigation.toString(), () => this.close()),
    ]);
  }

  componentDidUpdate(prevProps: DialogProps) {
    const { isOpen } = this.props;

    if (isOpen !== prevProps.isOpen) {
      this.toggle(isOpen);
    }
  }

  componentWillUnmount() {
    if (this.isOpen) {
      this.onClose();
    }
  }

  toggle(isOpen: boolean) {
    if (isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    requestAnimationFrame(this.onOpen); // wait for render(), bind close-event to this.elem
  }

  close() {
    this.onClose(); // must be first to get access to dialog's content from outside
    this.props.close();
  }

  onOpen = () => {
    this.props.onOpen();

    if (!this.props.pinned) {
      this.elem?.addEventListener("click", this.onClickOutside);
      // Using document.body target to handle keydown event before Drawer does
      document.body.addEventListener("keydown", this.onEscapeKey);
    }
  };

  onClose = () => {
    this.props.onClose();

    if (!this.props.pinned) {
      this.elem?.removeEventListener("click", this.onClickOutside);
      document.body.removeEventListener("keydown", this.onEscapeKey);
    }
  };

  onEscapeKey = (evt: KeyboardEvent) => {
    if (evt.code === "Escape") {
      this.close();
      evt.stopPropagation();
    }
  };

  onClickOutside = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement;

    if (!this.contentElem.contains(target)) {
      this.close();
      evt.stopPropagation();
    }
  };

  renderInner() {
    const { modal, animated, pinned, "data-testid": testId, className } = this.props;
    const classNames = cssNames("Dialog flex center", className, { modal, pinned });

    const dialog = (
      <div
        className={classNames}
        onClick={stopPropagation}
        ref={this.ref}
        data-testid={testId}
      >
        <div className="box" ref={e => this.contentElem = e}>
          {this.props.children}
        </div>
      </div>
    );

    if (animated) {
      return (
        <Animate enter={this.isOpen} name="opacity-scale">
          {dialog}
        </Animate>
      );
    }

    return dialog;
  }

  render() {
    if (!this.isOpen) {
      return null;
    }

    return createPortal(this.renderInner(), document.body);
  }
}

export const Dialog = withInjectables<Dependencies, DialogProps>(NonInjectedDialog, {
  getProps: (di, props) => ({
    ...props,
    navigation: di.inject(observableHistoryInjectable),
  }),
});
