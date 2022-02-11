/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./monaco-editor.module.scss";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { observer } from "mobx-react";
import { action, computed, reaction } from "mobx";
import { editor, Uri } from "monaco-editor";
import type { MonacoTheme } from "./monaco-themes";
import type { MonacoValidator } from "./monaco-validators";
import { monacoValidators } from "./monaco-validators";
import { debounce, merge, pick } from "lodash";
import { cssNames, disposer, noop } from "../../utils";
import type { ActiveTheme } from "../../themes/active.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active.injectable";
import type { EditorConfig } from "../../../common/user-preferences/editor-config.injectable";
import editorConfigInjectable from "../../../common/user-preferences/editor-config.injectable";
import type { LensLogger } from "../../../common/logger";
import monacoEditorLoggerInjectable from "./logger.injectable";

export type MonacoEditorId = string;

export interface MonacoEditorProps {
  id?: MonacoEditorId; // associating editor's ID with created model.uri
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  readOnly?: boolean;
  theme?: MonacoTheme;
  language?: "yaml" | "json"; // supported list of languages, configure in `webpack.renderer.ts`
  options?: Partial<editor.IStandaloneEditorConstructionOptions>; // customize editor's initialization options
  value?: string;
  onChange?(value: string, evt: editor.IModelContentChangedEvent): void; // catch latest value updates
  onError?(error?: Error | unknown): void; // provide syntax validation error, etc.
  onDidLayoutChange?(info: editor.EditorLayoutInfo): void;
  onDidContentSizeChange?(evt: editor.IContentSizeChangedEvent): void;
  onModelChange?(model: editor.ITextModel, prev?: editor.ITextModel): void;
}

const viewStates = new WeakMap<Uri, editor.ICodeEditorViewState>();

interface Dependencies {
  activeTheme: ActiveTheme;
  editorConfig: EditorConfig;
  logger: LensLogger;
}

function createMonacoUri(id: MonacoEditorId): Uri {
  return Uri.file(`/monaco-editor/${id}`);
}

function createEditor(domElement: HTMLElement, options?: editor.IStandaloneEditorConstructionOptions, override?: editor.IEditorOverrideServices): editor.IStandaloneCodeEditor {
  return editor.create(domElement, options, override);
}

export interface MonacoEditorRef {
  focus: () => void;
}

const NonInjectedMonacoEditor = observer(forwardRef<MonacoEditorRef, Dependencies & MonacoEditorProps>(({
  activeTheme,
  id: propsId,
  className,
  style,
  autoFocus,
  readOnly,
  theme = activeTheme.value.monacoTheme,
  language,
  options: propOptions,
  value,
  onChange = noop,
  onError = noop,
  onDidLayoutChange = noop,
  onDidContentSizeChange = noop,
  onModelChange: propsOnModelChange = noop,
  editorConfig,
  logger,
}, ref) => {
  const [baseId] = useState(`editor-id#${Math.round(1e7 * Math.random())}`);
  const editorId = propsId ?? baseId;
  const [computedModel] = useState(computed(() => {
    const uri = createMonacoUri(editorId);
    const model = editor.getModel(uri);

    if (model) {
      return model; // already exists
    }

    return editor.createModel(value, language, uri);
  }));
  const [computedOptions] = useState(computed(() => (
    merge({},
      pick(editorConfig, "minimap", "tabSize", "lineNumbers", "fontSize", "fontFamily"),
      propOptions,
    )
  )));
  const containerElem = useRef<HTMLDivElement>();
  const [monacoEditor] = useState(() => {
    const newEditor = createEditor(containerElem.current, {
      model,
      detectIndentation: false, // allow `option.tabSize` to use custom number of spaces for [Tab]
      value,
      language,
      theme,
      readOnly,
      ...options,
    });

    logger.info(`editor created for language=${language}, theme=${theme}`, logMetadata);
    validateLazy(); // validate initial value
    restoreViewState(model); // restore previous state if any

    if (autoFocus) {
      newEditor.focus();
    }

    const onDidLayoutChangeDisposer = newEditor.onDidLayoutChange(layoutInfo => {
      onDidLayoutChange?.(layoutInfo);
    });

    const onValueChangeDisposer = newEditor.onDidChangeModelContent(event => {
      const value = newEditor.getValue();

      onChange?.(value, event);
      validateLazy(value);
    });

    const onContentSizeChangeDisposer = newEditor.onDidContentSizeChange((params) => {
      onDidContentSizeChange?.(params);
    });

    dispose.push(
      reaction(() => model, onModelChange),
      reaction(() => theme, editor.setTheme),
      reaction(() => value, value => setValue(value)),
      reaction(() => options, opts => newEditor.updateOptions(opts)),
      () => onDidLayoutChangeDisposer.dispose(),
      () => onValueChangeDisposer.dispose(),
      () => onContentSizeChangeDisposer.dispose(),
      bindResizeObserver(),
    );

    return newEditor;
  });
  const [dispose] = useState(disposer);

  const model = computedModel.get();
  const options = computedOptions.get();
  const logMetadata = { editorId, model };

  const getValue = (opts?: { preserveBOM: boolean; lineEnding: string }): string => {
    return monacoEditor?.getValue(opts) ?? "";
  };
  const setValue = (value = ""): void => {
    if (value == getValue()) return;

    monacoEditor.setValue(value);
    validate(value);
  };
  const focus = () => {
    monacoEditor?.focus();
  };

  const validate = action((value = getValue()) => {
    const validators: MonacoValidator[] = [
      monacoValidators[language], // parsing syntax check
    ].filter(Boolean);

    for (const validate of validators) {
      try {
        validate(value);
      } catch (error) {
        onError(error); // emit error outside
      }
    }
  });

  // avoid excessive validations during typing
  const validateLazy = useCallback(debounce(validate, 250), []);

  /**
   * Save current view-model state in the editor.
   * This will allow restore cursor position, selected text, etc.
   * @param {editor.ITextModel} model
   */
  const saveViewState = (model: editor.ITextModel) => {
    viewStates.set(model.uri, monacoEditor.saveViewState());
  };

  const restoreViewState = (model: editor.ITextModel) => {
    const viewState = viewStates.get(model.uri);

    if (viewState) {
      monacoEditor.restoreViewState(viewState);
    }
  };

  const onModelChange = (model: editor.ITextModel, oldModel?: editor.ITextModel) => {
    logger.info("model change", { model, oldModel, ...logMetadata });

    if (oldModel) {
      saveViewState(oldModel);
    }

    monacoEditor.setModel(model);
    restoreViewState(model);
    monacoEditor.layout();
    monacoEditor.focus(); // keep focus in editor, e.g. when clicking between dock-tabs
    propsOnModelChange(model, oldModel);
    validateLazy();
  };
  const bindResizeObserver = () => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        monacoEditor?.layout(entry.contentRect);
      }
    });

    const containerElem = monacoEditor.getContainerDomNode();

    resizeObserver.observe(containerElem);

    return () => resizeObserver.unobserve(containerElem);
  };

  useImperativeHandle(ref, () => ({
    focus,
  }));

  useEffect(() => {
    try {
      logger.info(`editor did mount`, logMetadata);
    } catch (error) {
      logger.error(`mounting failed: ${error}`, logMetadata);
    }

    return () => {
      saveViewState(model);
      dispose();
      monacoEditor.dispose();
    };
  }, []);

  return (
    <div
      data-test-component="monaco-editor"
      className={cssNames(styles.MonacoEditor, className)}
      style={style}
      ref={containerElem}
    />
  );
}));

export const MonacoEditor = withInjectables<Dependencies, MonacoEditorProps, MonacoEditorRef>(NonInjectedMonacoEditor, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
    editorConfig: di.inject(editorConfigInjectable),
    logger: di.inject(monacoEditorLoggerInjectable),
  }),
});
