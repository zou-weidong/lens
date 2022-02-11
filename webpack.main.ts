/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import getTSLoader from "./getTSLoader";
import CircularDependencyPlugin from "circular-dependency-plugin";
import { iconsAndImagesWebpackRules } from "./webpack.renderer";
import type { WebpackPluginInstance } from "webpack";

const configs: { (): webpack.Configuration }[] = [];

configs.push((): webpack.Configuration => {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const buildDir = path.join(process.cwd(), "static", "build");
  const mainDir = path.join(process.cwd(), "src", "main");

  console.info("WEBPACK:main", {
    isDevelopment,
    buildDir,
    mainDir,
  });

  return {
    name: "lens-app-main",
    context: __dirname,
    target: "electron-main",
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    cache: isDevelopment ? { type: "filesystem" } : false,
    entry: {
      main: path.resolve(mainDir, "index.ts"),
    },
    output: {
      libraryTarget: "global",
      path: buildDir,
    },
    resolve: {
      extensions: [".json", ".js", ".ts"],
    },
    externals: [
      nodeExternals(),
    ],
    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader",
        },
        getTSLoader({}, /\.ts$/),
        ...iconsAndImagesWebpackRules(),
      ],
    },
    plugins: [
      new ForkTsCheckerPlugin(),
      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }) as unknown as WebpackPluginInstance,
    ].filter(Boolean),
  };
});

export default configs;
