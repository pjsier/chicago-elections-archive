import { For, Show, createEffect, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import Map from "../components/map"
import Legend from "../components/legend"
import Popup from "../components/popup"
import PopupContent from "../components/popup-content"
import Geocoder from "../components/geocoder"
import { useMapStore } from "../providers/map"
import { usePopup } from "../providers/popup"
import { updateQueryParams } from "../utils"
import { getPrecinctYear } from "../utils/map"

const MapPage = (props) => {
  const [state, setState] = createStore({
    election: props.initialElection || `251`,
    race: props.initialRace || `0`,
  })
  const [mapStore] = useMapStore()
  const [popup, setPopup] = usePopup()

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
          attributionControl: false,
        }}
      />
      <div id="legend">
        <div id="geocoder-container">
          <Geocoder
            azureMapsKey={props.azureMapsKey}
            onSelect={(selectedPoint) => setPopup({ selectedPoint })}
          />
        </div>
        <div class="content">
          <h2>{props.elections[state.election].races[state.race]}</h2>
          <form method="GET" action="">
            <select
              value={state.election}
              onChange={(e) =>
                setState({ ...state, election: e.target.value, race: "0" })
              }
            >
              <For each={props.electionOptions}>
                {({ label, value }) => <option value={value}>{label}</option>}
              </For>
            </select>
            <select
              value={state.race}
              onChange={(e) => setState({ ...state, race: e.target.value })}
            >
              <For each={raceOptions()}>
                {({ label, value }) => <option value={value}>{label}</option>}
              </For>
            </select>
          </form>
          <Legend
            candidates={mapStore.candidates || []}
            totalVotes={mapStore.electionResults.total}
            displayOverrides={props.displayOverrides}
          />
        </div>
      </div>
      <Show when={mapStore.map}>
        <Popup
          map={mapStore.map}
          layer={"precincts"}
          source={`precincts-${getPrecinctYear(+year())}`}
          active={popup.click || popup.hover}
          lngLat={popup.lngLat}
          selectedPoint={popup.selectedPoint}
        >
          <PopupContent
            displayOverrides={props.displayOverrides}
            candidateColors={mapStore.candidateColors}
            feature={popup.feature}
          />
        </Popup>
      </Show>
    </>
  )
}

export default MapPage
