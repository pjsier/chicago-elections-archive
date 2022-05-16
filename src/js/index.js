import { render } from "solid-js/web"
import { setupNavToggle } from "./utils"
import MapProvider from "./providers/map"
import PopupProvider from "./providers/popup"
import MapPage from "./pages/map-page"

function parseMapMetadata() {
  const mapMetadataEl = document.getElementById("map-metadata")
  if (!mapMetadataEl) return {}

  const { elections, electionOrder } = JSON.parse(mapMetadataEl.innerText)
  const electionOptions = electionOrder
    .filter((idx) => elections[idx])
    .map((idx) => ({ label: elections[idx].label, value: idx }))
  return {
    elections,
    electionOptions,
  }
}

setupNavToggle()

const mapContainer = document.getElementById("map-container")
if (mapContainer) {
  const mapMetadata = parseMapMetadata()
  render(
    () => (
      <MapProvider>
        <PopupProvider>
          <MapPage {...mapMetadata} />
        </PopupProvider>
      </MapProvider>
    ),
    mapContainer
  )
}
