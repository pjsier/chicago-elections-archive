import { searchParamsToForm, formToObj, formToSearchParams } from "./utils"
const isMobile = () => window.innerWidth <= 600

function onMapLoad(map) {}

function setupMap() {
  const mapContainer = document.getElementById("map")

  const mapParams = isMobile()
    ? { center: [-89.3, 39.52], zoom: 5.6 }
    : { center: [-89.3, 40], zoom: 6.1 }

  const map = new window.mapboxgl.Map({
    container: mapContainer,
    minZoom: 5.6,
    maxZoom: isMobile() ? 11.75 : 12,
    hash: true,
    dragRotate: false,
    style: `style.json`,
    attributionControl: false,
    ...mapParams,
  })

  map.touchZoomRotate.disableRotation()

  map.once("styledata", () => {
    map.addControl(
      new window.mapboxgl.AttributionControl({
        compact: window.innerWidth < 800,
      })
    )
    map.addControl(
      new window.mapboxgl.NavigationControl({ showCompass: false })
    )
    map.addControl(
      new window.mapboxgl.FullscreenControl({ container: mapContainer })
    )
    onMapLoad(map)
  })
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if page is embedded, toggle some conditional styles
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get("embed")) {
    document.documentElement.classList.toggle("embedded", true)
  }

  const form = document.getElementById("legend-form")
  searchParamsToForm(form)

  // Hide controls if showing Biden/Tax Amendment difference
  if (getMapRace() === "tax-diff") {
    form.querySelectorAll("fieldset").forEach((fieldset) => {
      fieldset.classList.toggle("hidden", true)
    })
  }

  setupMap()
})
