import babel from "@rollup/plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import copy from "rollup-plugin-copy"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import externalGlobals from "rollup-plugin-external-globals"

export default [
  {
    input: "src/js/index.js",
    output: {
      file: "site/_includes/index.js",
      format: "esm",
    },
    plugins: [
      resolve(),
      babel({
        presets: ["solid"],
      }),
      commonjs(),
      copy({
        targets: [
          {
            src: "node_modules/maplibre-gl/dist/maplibre-gl.js",
            dest: "dist/static",
          },
          {
            src: "node_modules/maplibre-gl/dist/maplibre-gl.css",
            dest: "dist/static",
          },
        ],
      }),
      externalGlobals({
        maplibregl: "window.maplibregl",
      }),
      ...(process.env.NODE_ENV === "production" ? [terser()] : []),
    ],
  },
]
