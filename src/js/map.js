import { render } from "solid-js/web"

import MapProvider from "./providers/map"
import PopupProvider from "./providers/popup"
import MapPage from "./pages/map-page"
import { DEFAULT_ELECTION } from "./utils/map"

function parseMapMetadata() {
  const mapMetadataEl = document.getElementById("map-metadata")
  if (!mapMetadataEl) return {}

  const { elections, electionOrder, ...metadata } = JSON.parse(
    mapMetadataEl.innerText
  )
  const electionOptions = electionOrder
    .filter((idx) => elections[idx])
    .map((idx) => ({ label: elections[idx].label, value: idx }))

  const azureMapsKey = document.head.querySelector(
    `meta[name="azure-maps-key"]`
  ).content
  const dataDomain = document.head.querySelector(
    `meta[name="data-domain"]`
  ).content
  const embedElection = document.head.querySelector(
    `meta[name="embed-election"]`
  )?.content
  const embedAttribution = !!document.head.querySelector(
    `meta[name="embed-attribution"]`
  )
  return {
    elections,
    electionOptions,
    azureMapsKey,
    dataDomain,
    embedElection,
    embedAttribution,
    ...metadata,
  }
}

const mapContainer = document.querySelector("main.map")

const params = new URLSearchParams(window.location.search)

if (mapContainer) {
  const mapMetadata = parseMapMetadata()
  render(
    () => (
      <MapProvider>
        <PopupProvider>
          <MapPage
            {...mapMetadata}
            initialElection={
              mapMetadata.embedElection ||
              params.get("election") ||
              DEFAULT_ELECTION
            }
            initialRace={params.get("race") || "0"}
          />
        </PopupProvider>
      </MapProvider>
    ),
    mapContainer
  )
}
