import { For, Show, createEffect, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import Map from "../components/map"
import Legend from "../components/legend"
import Popup from "../components/popup"
import PopupContent from "../components/popup-content"
import { useMapStore } from "../providers/map"
import { usePopup } from "../providers/popup"
import { updateQueryParams } from "../utils"

const MapPage = (props) => {
  const [state, setState] = createStore({
    election: props.initialElection || `251`,
    race: props.initialRace || `0`,
  })
  const [mapStore] = useMapStore()
  const [popup] = usePopup()

  createEffect(() => {
    updateQueryParams({
      election: state.election,
      race: state.race,
    })
  })

  const year = createMemo(() => props.elections[state.election].year)
  const raceOptions = createMemo(() =>
    Object.entries(props.elections[state.election].races).map(
      ([value, label]) => ({ label, value })
    )
  )

  return (
    <>
      <Map
        year={year()}
        election={state.election}
        race={state.race}
        mapOptions={{
          style: "style.json",
          center: [-87.6651, 41.8514],
          minZoom: 8,
          maxZoom: 15,
          zoom: 9.25,
          hash: true,
          dragRotate: false,
          attributionControl: true,
        }}
      />
      <div id="legend">
        <form method="GET" action="">
          <select
            onChange={(e) =>
              setState({ ...state, election: e.target.value, race: "0" })
            }
          >
            <For each={props.electionOptions}>
              {({ label, value }) => <option value={value}>{label}</option>}
            </For>
          </select>
          <select
            onChange={(e) => setState({ ...state, race: e.target.value })}
          >
            <For each={raceOptions()}>
              {({ label, value }) => <option value={value}>{label}</option>}
            </For>
          </select>
        </form>
        <Legend
          candidates={mapStore.candidates || []}
          raceLabel={props.elections[state.election].races[state.race]}
          displayOverrides={props.displayOverrides}
        />
      </div>
      <Show when={mapStore.map}>
        <Popup
          map={mapStore.map}
          layer={"precincts"}
          year={year()}
          active={popup.click || popup.hover}
          lngLat={popup.lngLat}
        >
          <Show when={popup.feature}>
            <PopupContent
              displayOverrides={props.displayOverrides}
              featData={popup.feature}
            />
          </Show>
        </Popup>
      </Show>
    </>
  )
}

export default MapPage
