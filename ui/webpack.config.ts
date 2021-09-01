import * as path from "path";
import { Configuration as WebpackConfig, RuleSetUseItem } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import "webpack-dev-server"; // types

const BUILD_DIR = path.resolve(__dirname, "dist");

const config = (env): WebpackConfig => {
  const mode = env?.NODE_ENV ?? "production";

  return {
    mode,
    entry: "./src/index.tsx",
    output: {
      filename:
        mode === "production"
          ? "[name].[contenthash].js"
          : "[name].[chunkhash].js",
      path: BUILD_DIR,
      publicPath: "/",
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
      },
      usedExports: true,
    },
    devtool: mode === "production" ? "source-map" : "inline-source-map",
    devServer: {
      contentBase: BUILD_DIR,
      historyApiFallback: true, // Do not server paths react-router will handle.
      hot: true,
      overlay: true,
      proxy: {
        "/graphql": { target: "http://localhost:4000" /* ws: true */ },
      },
      stats: "errors-warnings",
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.tsx?$/,
          use: (() => {
            const use: RuleSetUseItem[] = [
              {
                loader: "ts-loader",
                options: {
                  // type checks via fork-ts-checker-webpack-plugin
                  transpileOnly: true,
                  ...(mode === "production"
                    ? // tsconfig overrides for production
                      {
                        compilerOptions: {
                          target: "ES2018",
                        },
                      }
                    : {}),
                },
              },
            ];

            // Add babel for browser converge
            if (mode === "production")
              use.unshift({
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        targets: "> 0.25%, not dead",
                      },
                    ],
                  ],
                  plugins: ["@babel/plugin-transform-runtime"],
                },
              });
            return use;
          })(),
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".wasm", ".mjs", ".json", ".tsx", ".ts", ".js"],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "Budget Management",
        template: "node_modules/html-webpack-template/index.ejs",
        appMountId: "root",
      }),
      new ForkTsCheckerWebpackPlugin({
        eslint: {
          files: "./src/**/*.{ts,tsx,js,jsx}",
        },
      }),
    ],
  };
};

export default config;
