import { For } from "solid-js"

const Legend = (props) => (
  <div class="legend">
    <h2>{props.raceLabel}</h2>
    <div
      class="color-ramp"
      style={{ "background-image": "linear-gradient(to right, #fff, #333)" }}
    >
      <span class="ramp-label">0%</span>
      <span class="ramp-label">100%</span>
    </div>
    <For each={props.candidates}>
      {({ name, color }) => (
        <div class="legend-item">
          <div class="color" style={{ "background-color": color }}></div>{" "}
          <span>{props.displayOverrides[name] || name}</span>
        </div>
      )}
    </For>
  </div>
)

export default Legend
