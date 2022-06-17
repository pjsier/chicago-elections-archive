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
import { getPrecinctYear } from "../utils/data"

const MapPage = (props) => {
  const [state, setState] = createStore({
    election: props.initialElection,
    race: props.initialRace,
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
        dataDomain={props.dataDomain}
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
          <h1>
            {props.embedElection
              ? props.elections[state.election].label
              : "Chicago Elections Archive"}
          </h1>
          <form method="GET" action="">
            <Show when={!props.embedElection}>
              <div class="select">
                <select
                  aria-label="Election"
                  value={state.election}
                  onChange={(e) =>
                    setState({ ...state, election: e.target.value, race: "0" })
                  }
                >
                  <For each={props.electionOptions}>
                    {({ label, value }) => (
                      <option value={value}>{label}</option>
                    )}
                  </For>
                </select>
              </div>
            </Show>
            <div class="select">
              <select
                aria-label="Race"
                value={state.race}
                onChange={(e) => setState({ ...state, race: e.target.value })}
              >
                <For each={raceOptions()}>
                  {({ label, value }) => <option value={value}>{label}</option>}
                </For>
              </select>
            </div>
          </form>
          <Legend
            candidates={mapStore.candidates || []}
            totalVotes={mapStore.electionResults.total}
            displayOverrides={props.displayOverrides}
          />
          <a
            class="embed-attribution"
            href="https://chicagoelectionsarchive.org"
            target="_blank"
            rel="noopener"
          >
            See more at Chicago Elections Archive
          </a>
        </div>
      </div>
      <Show when={mapStore.map}>
        <Popup
          map={mapStore.map}
          layer={"precincts"}
          source={`precincts-${getPrecinctYear(+year())}`}
          active={popup.click || popup.hover}
          lngLat={popup.lngLat}
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
