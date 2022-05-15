import { csvParse } from "d3-dsv"
import { maxIndex, minIndex } from "d3-array"
import { interpolateRgb } from "d3-interpolate"
import { scaleSequential } from "d3-scale"
// TODO: Import metadata of elections

async function fetchCsvData(election, race) {
  const data = await fetch(
    `https://chicago-elections-archive.us-east-1.linodeobjects.com/results/${election}/${race}.csv`
  )
  return data
    .map((row) =>
      Object.entries(row).map(([key, value]) => {
        const keyName = key.split(" &")[0]
        const cleanKey =
          key.includes("Percent") && key.includes("&")
            ? `${keyName} Percent`
            : keyName
        return { [cleanKey]: key === `id` ? value : +value }
      })
    )
    .reduce((acc, cur) => ({ ...acc, ...cur }), {})
}

const filterExpression = (data) => [
  "in",
  ["get", "id"],
  ["literal", data.map(({ id }) => id)],
]

const colorScale = (column, index) => {
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

const dataJoinExpression = (data, election) => {
  let expr = ["match", ["get", "id"]]
  // const dataCols = dataCols(csvData[0] || {}).filter(
  //   (c) => !LEGEND_HIDE.includes(c)
  // )

  const dataMatch = data.map((data) => {
    const dataValues = Object.entries(data).filter(([key, value]) =>
      dataCols.includes(key)
    )
    // TODO:
    const maxIdx = maxIndex(dataValues, ([key, value]) => value)
    const minIdx = minIndex(dataValues, ([key, value]) => value)
    const index =
      +election >= 103 &&
      +election <= 164 &&
      dataValues[maxIdx][1] < 60.0 &&
      dataValues[maxIdx][0].includes("Yes ")
        ? minIdx
        : maxIdx
    return [
      data.id,
      getColorScale(dataValues[index][0], index)(dataValues[index][1]),
    ]
  })
  return [...expr, ...dataMatch.flat(), "rgba(100,100,100,1)"]
}

const dataCols = (row) =>
  Object.keys(row || {}).filter(
    (row) => row.includes("Percent") || row === "turnout"
  )

export function renderMap(mapContainer) {
  const map = new window.maplibregl.Map({
    container: mapContainer,
    style: "style.json",
    center: [-87.6651, 41.8514],
    minZoom: 8,
    maxZoom: 15,
    zoom: 9.25,
    hash: true,
    dragRotate: false,
    attributionControl: true,
  })

  map.touchZoomRotate.disableRotation()
  map.addControl(
    new window.maplibregl.NavigationControl({ showCompass: false })
  )

  const isMobile = () => window.innerWidth <= 600

  const hoverPopup = new window.maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  })

  const clickPopup = new window.maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
  })

  const removePopup = (popup) => {
    map.getCanvas().style.cursor = ""
    popup.remove()
  }

  const popupContent = ({
    properties: { date, victimName, officerNames, slug },
  }) => {
    return `
    <p><strong>Date</strong> <span>${date}</span></p>
    <p><strong>Victim</strong> <span>${victimName}</span></p>
    <p><strong>Officers</strong> <span>${JSON.parse(officerNames).join(
      ", "
    )}</span></p>
    <p>
      <a href="/archive/${slug}">See more details</a>
    </p>
  `
  }

  const onMouseMove = (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["precincts"],
    })
    if (features.length > 0 && !clickPopup.isOpen()) {
      map.getCanvas().style.cursor = "pointer"
      if (!isMobile()) {
        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="popup hover">${popupContent(features[0])}</div>`
          )
          .addTo(map)
      }
    } else {
      removePopup(hoverPopup)
    }
  }

  const onMouseOut = () => {
    removePopup(hoverPopup)
  }

  const onMapClick = (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["precincts"],
    })
    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer"
      removePopup(hoverPopup)
      clickPopup
        .setLngLat(e.lngLat)
        .setHTML(`<div class="popup click">${popupContent(features[0])}</div>`)
        .addTo(map)
    }
  }

  map.on("mousemove", "precincts", onMouseMove)
  map.on("mouseout", "precincts", onMouseOut)
  map.on("click", "precincts", onMapClick)
}
