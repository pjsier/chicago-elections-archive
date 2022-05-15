const baseFonts = [
  "BlinkMacSystemFont",
  "-apple-system",
  "Segoe UI",
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  "Fira Sans",
  "Droid Sans",
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "sans-serif",
]

module.exports = {
  important: false,
  purge: {
    enabled: true,
    layers: ["base", "components", "utilities"],
    content: ["./src/**/*.js", "./site/**/*.njk", "./site/**/*.11ty.js"],
  },
  theme: {
    fontFamily: {
      body: baseFonts,
    },
  },
  plugins: [],
}
