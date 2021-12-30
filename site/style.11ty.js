exports.data = {
  layout: null,
  permalink: "/style.json",
}

exports.render = ({ site }) =>
  JSON.stringify({
    version: 8,
    id: "elections",
    sources: {},
    sprite: "",
    glyphs: "",
    layers: [],
  })
