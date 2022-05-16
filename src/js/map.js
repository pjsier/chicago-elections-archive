import { render } from "solid-js/web"

import MapProvider from "./providers/map"
import PopupProvider from "./providers/popup"
import MapPage from "./pages/map-page"

function parseMapMetadata() {
  const mapMetadataEl = document.getElementById("map-metadata")
  if (!mapMetadataEl) return {}

  const { elections, electionOrder, ...metadata } = JSON.parse(
    mapMetadataEl.innerText
  )
  const electionOptions = electionOrder
    .filter((idx) => elections[idx])
    .map((idx) => ({ label: elections[idx].label, value: idx }))
  return {
    elections,
    electionOptions,
    ...metadata,
  }
}

const mapContainer = document.getElementById("map-container")

const params = new URLSearchParams(window.location.search)

if (mapContainer) {
  const mapMetadata = parseMapMetadata()
  render(
    () => (
      <MapProvider>
        <PopupProvider>
          <MapPage
            {...mapMetadata}
            initialElection={params.get("election")}
            initialRace={params.get("race")}
          />
        </PopupProvider>
      </MapProvider>
    ),
    mapContainer
  )
}
