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
      name: "Reddix",
      description: "A reddit extension that solved the nightmare of subreddtis",
      version: "1.0.0",

      browser_specific_settings: {
        gecko: {
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },

      icons: {
        16: "reddix-16.png",
        32: "reddix-32.png",
        128: "reddix-128.png",
        256: "reddix-256.png",
      },
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
