import { For, Show, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import Map from "../components/map"
import Legend from "../components/legend"
import Popup from "../components/popup"
import { useMapStore } from "../providers/map"
import { usePopup } from "../providers/popup"

const MapPage = (props) => {
  const [state, setState] = createStore({
    election: props.initialElection || `251`,
    race: props.initialRace || `0`,
    year: props.initialYear || 2022,
  })
  const [mapStore, setMapStore] = useMapStore()
  const [popup, setPopup] = usePopup()

  const raceOptions = createMemo(() =>
    Object.entries(props.elections[state.election].races).map(
      ([value, label]) => ({ label, value })
    )
  )

  return (
    <>
      <section style="position: absolute; z-index: 1000">
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
      </section>
      <Map
        year={state.year}
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
      <Legend raceLabel={props.elections[state.election].races[state.race]} />
      <Show when={mapStore.map}>
        <Popup
          map={mapStore.map}
          layer={"precincts"}
          active={popup.click || popup.hover}
          lngLat={popup.lngLat}
        >
          <h2>Testing</h2>
          <Show when={popup.features.length > 0}>
            {popup.features[0].PRECINCT}
          </Show>
        </Popup>
      </Show>
    </>
  )
}

export default MapPage
