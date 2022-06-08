import { createEffect, createMemo, onCleanup, onMount } from "solid-js"
import { csvParse } from "d3-dsv"
import { useMapStore } from "../providers/map"
import { descending, fromEntries } from "../utils"
import { COLOR_SCHEME, getDataCols, getPrecinctYear } from "../utils/map"

const MOBILE_CUTOFF = 800

const compactAttribControl = () => {
  const control = document.querySelector("details.maplibregl-ctrl-attrib")
  control.removeAttribute("open")
  control.classList.remove("mapboxgl-compact-show", "maplibregl-compact-show")
}

function fetchCsvData(dataDomain, election, race) {
  return fetch(`https://${dataDomain}/results/${election}/${race}.csv`)
    .then((data) => data.text())
    .then((data) =>
      csvParse(data).map((row) =>
        Object.entries(row)
          .map(([key, value]) => {
            const keyName = key.split(" &")[0]
            let cleanKey =
              key.includes("Percent") && key.includes("&")
                ? `${keyName} Percent`
                : keyName
            // Handling discrepancy where turnout doesn't have "total" column
            if (row.turnout && cleanKey === "ballots") {
              cleanKey = "total"
            }
            return { [cleanKey]: key === `id` ? value : +value }
          })
          .reduce((acc, cur) => ({ ...acc, ...cur }), {})
      )
    )
}

const filterExpression = (data) => [
  "in",
  ["get", "id"],
  ["literal", data.map(({ id }) => id)],
]

const aggregateElection = (data) => {
  const dataCols = Object.keys(data[0] || {}).filter(
    (row) =>
      row.includes("Percent") ||
      ["turnout", "registered", "ballots"].includes(row)
  )
  const candidateNames = dataCols.map((c) => c.replace(" Percent", ""))

  const aggBase = {
    total: 0,
    ...candidateNames.reduce((a, v) => ({ ...a, [v]: 0 }), {}),
  }
  const electionResults = data.reduce(
    (agg, val) =>
      Object.keys(agg).reduce((a, v) => ({ ...a, [v]: agg[v] + val[v] }), {}),
    aggBase
  )

  const candidates = candidateNames
    .filter((name) => !["ballots", "registered"].includes(name))
    .map((name, idx) => ({
      name,
      color: COLOR_SCHEME[idx % COLOR_SCHEME.length],
      votes: electionResults[name === "turnout" ? "total" : name],
    }))
    .sort((a, b) => descending(a.votes, b.votes))

  // TODO: simplify here, maybe pull out of candidates?
  const candidateColors = candidateNames
    .filter((name) => !["ballots", "registered"].includes(name))
    .reduce(
      (a, v, idx) => ({ ...a, [v]: COLOR_SCHEME[idx % COLOR_SCHEME.length] }),
      {}
    )

  // Workaround for turnout display
  if (electionResults.turnout) {
    electionResults.total = electionResults.registered
  } else if (isNaN(electionResults.total)) {
    electionResults.total = electionResults.ballots
  }
  return { candidates, candidateColors, electionResults }
}

const createPrecinctLayerDefinition = (data, year) => ({
  layerDefinition: {
    id: "precincts",
    source: `precincts-${getPrecinctYear(+year)}`,
    "source-layer": "precincts",
    type: "fill",
    filter: filterExpression(data),
    paint: {
      "fill-outline-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "rgba(0,0,0,0.7)",
        "rgba(0,0,0,0)",
      ],
      "fill-color": [
        "case",
        ["==", ["feature-state", "colorValue"], null],
        "#ffffff",
        [
          "interpolate",
          ["linear"],
          ["feature-state", "colorValue"],
          0,
          "#ffffff",
          100,
          ["feature-state", "color"],
        ],
      ],
    },
  },
  legendData: aggregateElection(data),
})

function setFeatureData(map, dataCols, source, feature) {
  const featureData = fromEntries(
    Object.entries(feature).filter(([col]) => dataCols.includes(col))
  )
  const featureDataValues = Object.entries(featureData).map(
    ([, value]) => value
  )
  const colorValue = Math.max(...featureDataValues)
  const colorIndex = featureDataValues.indexOf(colorValue)
  map.setFeatureState(
    {
      source,
      sourceLayer: "precincts",
      id: feature.id,
    },
    {
      color: COLOR_SCHEME[colorIndex % COLOR_SCHEME.length],
      colorValue: colorValue,
      ...feature,
    }
  )
}

// TODO: A lot of refactoring here
const Map = (props) => {
  let map
  let mapRef

  const [mapStore, setMapStore] = useMapStore()

  const mapSource = createMemo(() => `precincts-${getPrecinctYear(props.year)}`)

  onMount(() => {
    map = new window.maplibregl.Map({
      container: mapRef,
      ...props.mapOptions,
    })
    map.touchZoomRotate.disableRotation()
    const isMobile = window.innerWidth < MOBILE_CUTOFF
    map.addControl(
      new window.maplibregl.AttributionControl({
        compact: isMobile,
      }),
      isMobile ? "top-left" : "bottom-right"
    )
    // Workaround for a bug in maplibre-gl where the attrib is default open
    if (isMobile) {
      compactAttribControl()
      setTimeout(compactAttribControl, 250)
    }
    map.once("styledata", () => {
      map.addControl(
        new window.maplibregl.NavigationControl({ showCompass: false })
      )
      map.addControl(
        new window.maplibregl.FullscreenControl({ container: mapRef })
      )
      map.resize()
    })

    setMapStore({ map })
  })

  // Based on solidjs/solid/issues/670#issuecomment-930346644
  // eslint-disable-next-line solid/reactivity
  createEffect(async () => {
    let canceled = false
    onCleanup(() => (canceled = true))
    const data = await fetchCsvData(
      props.dataDomain,
      props.election,
      props.race
    )
    if (canceled) return
    const def = createPrecinctLayerDefinition(data, props.year)
    const dataCols = getDataCols(data[0] || [])
    if (canceled) return
    setMapStore({ ...def.legendData })

    const updateLayer = () => {
      if (!map) return

      mapStore.map.removeLayer("precincts")
      mapStore.map.removeFeatureState({
        source: mapSource(),
        sourceLayer: "precincts",
      })
      data.forEach((feature) => {
        setFeatureData(map, dataCols, mapSource(), feature)
      })
      mapStore.map.addLayer(def.layerDefinition, "place_other")
    }

    if (mapStore.map.isStyleLoaded()) {
      updateLayer()
    } else {
      mapStore.map.once("styledata", updateLayer)
    }
  })

  onCleanup(() => {
    map.remove()
  })

  return <div id="map" ref={mapRef}></div>
}

export default Map
