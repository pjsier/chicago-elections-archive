import { For } from "solid-js"
import { useMapStore } from "../providers/map"

const Legend = (props) => {
  const [mapStore, setMapStore] = useMapStore()

  // TODO: handle display overrides here
  return (
    <div class="legend">
      <h2>{props.raceLabel}</h2>
      <div
        class="color-ramp"
        style="background-image: linear-gradient(to right, #fff, #333)"
      >
        <span class="ramp-label">0%</span>
        <span class="ramp-label">
          {(mapStore.legendData?.maxDomain || 0).toFixed(0)}%
        </span>
      </div>
      <For each={mapStore.legendData?.candidates || []}>
        {({ name, color }) => (
          <div class="legend-item">
            <div class="color" style={`background-color: ${color}`}></div>{" "}
            <span>{name}</span>
          </div>
        )}
      </For>
    </div>
  )
}

export default Legend
