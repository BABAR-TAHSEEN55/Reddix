import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  srcDir: "src",
  entrypointsDir: "entrypoints",
  outDir: "dist",
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      manifest_version: 2,
      name: "<Your extension name>>",
      description: "<Your extension description>",
      version: "1.0.0",
      //Good to have extension permissions
      permissions: [
        "storage",
        "scripting",
        "tabs",
        "contextMenus",
        "activeTab",
      ],
    };
  },
});
