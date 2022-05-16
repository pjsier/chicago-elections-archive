import { createEffect, onCleanup, onMount } from "solid-js"
import { csvParse } from "d3-dsv"
import { maxIndex, minIndex } from "d3-array"
import { interpolateRgb } from "d3-interpolate"
import { scaleSequential } from "d3-scale"
import { useMapStore } from "../providers/map"
import { usePopup } from "../providers/popup"

const COLOR_SCHEME = [
  "#1f77b4",
  "#d62728",
  "#2ca02c",
  "#ff7f0e",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
]

const getPrecinctYear = (year) => {
  if (year > 1983 && year < 2003) return 2003
  if ([2014, 2015, 2016].includes(year)) return 2015
  if (year === 2006) return 2007
  return [2019, 2015, 2011, 2010, 2008, 2007, 2004, 2003, 1983].find(
    (y) => year >= y
  )
}

function fetchCsvData(election, race) {
  return fetch(
    `https://chicago-elections-archive.us-east-1.linodeobjects.com/results/${election}/${race}.csv`
  )
    .then((data) => data.text())
    .then((data) =>
      csvParse(data).map((row) =>
        Object.entries(row)
          .map(([key, value]) => {
            const keyName = key.split(" &")[0]
            const cleanKey =
              key.includes("Percent") && key.includes("&")
                ? `${keyName} Percent`
                : keyName
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

const colorScale = (colorScales, dataDomain, column, index) => {
  if (["Yes", "Yes Percent"].includes(column)) {
    return scaleSequential(interpolateRgb("#ffffff", "#e88729")).domain(
      dataDomain.map((d) => d + 10)
    )
  } else if (["No", "No Percent"].includes(column)) {
    return scaleSequential(interpolateRgb("#ffffff", "#8c67b9")).domain(
      dataDomain
    )
  }
  return colorScales[index % 10]
}

const getDataCols = (row) =>
  Object.keys(row || {}).filter(
    (row) => row.includes("Percent") || row === "turnout"
  )

const dataJoinExpression = (
  data,
  dataDomain,
  dataCols,
  colorScales,
  election
) => {
  let expr = ["match", ["get", "id"]]
  const dataMatch = data.map((row) => {
    const rowValues = Object.entries(row).filter(([key, value]) =>
      dataCols.includes(key)
    )

    const maxIdx = maxIndex(rowValues, ([key, value]) => value)
    const minIdx = minIndex(rowValues, ([key, value]) => value)
    const index =
      +election >= 103 &&
      +election <= 164 &&
      rowValues[maxIdx][1] < 60.0 &&
      rowValues[maxIdx][0].includes("Yes ")
        ? minIdx
        : maxIdx
    return [
      row.id,
      colorScale(
        colorScales,
        dataDomain,
        rowValues[index][0],
        index
      )(rowValues[index][1]),
    ]
  })
  return [...expr, ...dataMatch.flat(), "rgba(100,100,100,1)"]
}

const createPrecinctLayerDefinition = (data, election, year) => {
  const dataCols = getDataCols(data[0] || [])
  const dataDomain = [
    0,
    Math.min(
      Math.max(...data.map((d) => Math.max(...dataCols.map((c) => d[c])))),
      100
    ),
  ]
  const colorScales = COLOR_SCHEME.map((c) =>
    scaleSequential(interpolateRgb("#ffffff", c)).domain(dataDomain)
  )
  // TODO:
  const candidates = dataCols
    .map((c) => c.replace(" Percent", ""))
    .map((name, idx) => ({
      name,
      color: colorScale(colorScales, dataDomain, name, idx)(dataDomain[1]),
    }))

  return {
    layerDefinition: {
      id: "precincts",
      source: `precincts-${getPrecinctYear(+year)}`,
      type: "fill",
      filter: filterExpression(data),
      paint: {
        "fill-outline-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "rgba(0,0,0,0.7)",
          "rgba(150,150,150,0.2)",
        ],
        "fill-color": dataJoinExpression(
          data,
          dataDomain,
          dataCols,
          colorScales,
          election
        ),
      },
    },
    legendData: {
      candidates,
      dataCols,
      maxDomain: dataDomain[1],
    },
  }
}

// TODO: A lot of refactoring here
const Map = (props) => {
  let map
  let mapRef

  const [mapStore, setMapStore] = useMapStore()

  onMount(() => {
    map = new maplibregl.Map({
      container: mapRef,
      ...props.mapOptions,
    })
    map.touchZoomRotate.disableRotation()

    setMapStore({ ...mapStore, map })
  })

  createEffect(async () => {
    const data = await fetchCsvData(props.election, props.race)
    const def = createPrecinctLayerDefinition(data, props.election, props.year)

    setMapStore({ ...mapStore, legendData: def.legendData })

    if (map.isStyleLoaded()) {
      map.removeLayer("precincts")
      map.addLayer(def.layerDefinition, "poi_label")
    } else {
      map.once("styledata", () => {
        map.removeLayer("precincts")
        map.addLayer(def.layerDefinition, "poi_label")
      })
    }
  })

  onCleanup(() => {
    map.remove()
  })

  return <div id="map" ref={mapRef}></div>
}

export default Map
