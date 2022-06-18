import { createEffect, createMemo, onCleanup, For } from "solid-js"
import { createStore } from "solid-js/store"
import { csvFormat } from "d3-dsv"

import { updateQueryParams } from "../utils"
import {
  fetchCsvData,
  fetchGeojsonData,
  mergeCsvAndGeojson,
} from "../utils/data"

const DownloadPage = (props) => {
  const [state, setState] = createStore({
    election: props.initialElection,
    race: props.initialRace,
    format: "csv",
    url: ``,
  })
  const year = createMemo(() => props.elections[state.election].year)
  const raceOptions = createMemo(() =>
    Object.entries(props.elections[state.election].races).map(
      ([value, label]) => ({ label, value })
    )
  )

  createEffect(() => {
    updateQueryParams({
      election: state.election,
      race: state.race,
      format: state.format,
    })
  })

  // Based on solidjs/solid/issues/670#issuecomment-930346644
  // eslint-disable-next-line solid/reactivity
  createEffect(async () => {
    let canceled = false
    onCleanup(() => (canceled = true))

    const [csvData, geojsonData] = await Promise.all([
      fetchCsvData(props.dataDomain, state.election, state.race),
      state.format === "geojson"
        ? fetchGeojsonData(props.dataDomain, year())
        : () => Promise.resolve(),
    ])
    if (canceled) return

    let blob = new Blob([""], { type: "text/plain;charset=utf8" })

    if (state.format === "csv") {
      blob = new Blob([csvFormat(csvData)], { type: "text/csv;charset=utf8" })
    } else if (state.format === "geojson") {
      const combinedData = mergeCsvAndGeojson(csvData, geojsonData)
      blob = new Blob([JSON.stringify(combinedData)], {
        type: "application/json;charset=utf8",
      })
    }

    setState({
      url: window.URL.createObjectURL(blob),
    })
  })

  return (
    <div>
      <form method="GET" action="">
        <fieldset class="radio mb-3">
          <legend>File format</legend>
          <div class="flex flex-col">
            <label class="radio">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={state.format === "csv"}
                onChange={(e) => setState({ format: e.target.value })}
              />
              <span>CSV (spreadsheet)</span>
            </label>
            <label class="radio">
              <input
                type="radio"
                name="format"
                value="geojson"
                checked={state.format === "geojson"}
                onChange={(e) => setState({ format: e.target.value })}
              />
              <span>GeoJSON (maps)</span>
            </label>
          </div>
        </fieldset>
        <label for="election">Election</label>
        <div class="select mb-3">
          <select
            id="election"
            name="election"
            value={state.election}
            onChange={(e) => setState({ election: e.target.value, race: "0" })}
          >
            <For each={props.electionOptions}>
              {({ label, value }) => <option value={value}>{label}</option>}
            </For>
          </select>
        </div>
        <label for="race">Race</label>
        <div class="select mb-3">
          <select
            id="race"
            name="race"
            aria-label="Race"
            value={state.race}
            onChange={(e) => setState({ race: e.target.value })}
          >
            <For each={raceOptions()}>
              {({ label, value }) => <option value={value}>{label}</option>}
            </For>
          </select>
        </div>
      </form>
      <a
        href={state.url}
        download={`election-data-${state.election}-${state.race}.${state.format}`}
        class="download-button"
      >
        Download file
      </a>
    </div>
  )
}

export default DownloadPage
