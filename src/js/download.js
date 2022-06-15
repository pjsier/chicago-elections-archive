import { render } from "solid-js/web"

import DownloadPage from "./pages/download-page"

function parseMapMetadata() {
  const mapMetadataEl = document.getElementById("map-metadata")
  if (!mapMetadataEl) return {}

  const { elections, electionOrder, ...metadata } = JSON.parse(
    mapMetadataEl.innerText
  )
  const electionOptions = electionOrder
    .filter((idx) => elections[idx])
    .map((idx) => ({ label: elections[idx].label, value: idx }))

  const dataDomain = document.head.querySelector(
    `meta[name="data-domain"]`
  ).content
  return {
    elections,
    electionOptions,
    dataDomain,
    ...metadata,
  }
}

const downloadContainer = document.getElementById("download-container")

const params = new URLSearchParams(window.location.search)

if (downloadContainer) {
  const mapMetadata = parseMapMetadata()
  render(
    () => (
      <DownloadPage
        {...mapMetadata}
        initialElection={params.get("election")}
        initialRace={params.get("race")}
      />
    ),
    downloadContainer
  )
}
