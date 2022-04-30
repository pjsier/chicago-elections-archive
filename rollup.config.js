import resolve from "@rollup/plugin-node-resolve"
import copy from "rollup-plugin-copy"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/js/index.js",
    external: ["maplibre-gl"],
    output: {
      file: "site/_includes/index.js",
      format: "esm",
    },
    plugins: [
      resolve(),
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
      ...(process.env.NODE_ENV === "production" ? [terser()] : []),
    ],
  },
]
