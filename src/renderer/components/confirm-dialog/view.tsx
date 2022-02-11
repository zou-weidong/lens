/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { ReactNode } from "react";
import { observable, makeObservable, IObservableValue } from "mobx";
import { observer } from "mobx-react";
import { cssNames, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import type { ErrorNotification } from "../notifications/error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import errorNotificationInjectable from "../notifications/error.injectable";
import confirmDialogStateInjectable from "./state.injectable";
import closeConfirmDialogInjectable from "./close.injectable";

export interface ConfirmDialogProps extends Omit<DialogProps, "isOpen" | "close"> {
}

export interface ConfirmDialogParams extends ConfirmDialogBooleanParams {
  ok?: () => any | Promise<any>;
  cancel?: () => any | Promise<any>;
}

export interface ConfirmDialogBooleanParams {
  labelOk?: ReactNode;
  labelCancel?: ReactNode;
  message: ReactNode;
  icon?: ReactNode;
  okButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
}

interface Dependencies {
  state: IObservableValue<Required<ConfirmDialogParams> | undefined>;
  close: () => void;
  errorNotification: ErrorNotification;
}

@observer
class NonInjectedConfirmDialog extends React.Component<ConfirmDialogProps & Dependencies> {
  @observable isConfirming = false;

  constructor(props: ConfirmDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  ok = async (ok: () => void | Promise<void>) => {
    try {
      this.isConfirming = true;
      await ok();
    } catch (error) {
      this.props.errorNotification(
        <>
          <p>Confirmation action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      this.isConfirming = false;
      this.props.close();
    }
  };

  onClose = () => {
    this.isConfirming = false;
  };

  close = async (cancel: () => void | Promise<void>) => {
    try {
      await cancel();
    } catch (error) {
      this.props.errorNotification(
        <>
          <p>Cancelling action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      this.isConfirming = false;
      this.props.close();
    }
  };

  renderContents({ icon, labelOk, labelCancel, message, okButtonProps, cancelButtonProps, ok, cancel }: Required<ConfirmDialogParams>) {
    return (
      <>
        <div className="confirm-content">
          {icon} {message}
        </div>
        <div className="confirm-buttons">
          <Button
            plain
            className="cancel"
            label={labelCancel}
            onClick={prevDefault(() => this.close(cancel))}
            {...cancelButtonProps}
          />
          <Button
            autoFocus primary
            className="ok"
            label={labelOk}
            onClick={prevDefault(() => this.ok(ok))}
            waiting={this.isConfirming}
            data-testid="confirm"
            {...okButtonProps}
          />
        </div>
      </>
    );
  }

  render() {
    const { className, state, close, errorNotification, ...dialogProps } = this.props;
    const params = state.get();
    const isOpen = Boolean(params);

    return (
      <Dialog
        {...dialogProps}
        className={cssNames("ConfirmDialog", className)}
        isOpen={isOpen}
        onClose={this.onClose}
        close={() => this.close(params.cancel)}
        data-testid="confirmation-dialog"
      >
        {params && this.renderContents(params)}
      </Dialog>
    );
  }
}

export const ConfirmDialog = withInjectables<Dependencies, ConfirmDialogProps>(NonInjectedConfirmDialog, {
  getProps: (di, props) => ({
    ...props,
    errorNotification: di.inject(errorNotificationInjectable),
    state: di.inject(confirmDialogStateInjectable),
    close: di.inject(closeConfirmDialogInjectable),
  }),
});
