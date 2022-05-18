import { For, createMemo } from "solid-js"
import { descending } from "../utils"
import { getDataCols } from "../utils/map"

const PopupContent = (props) => {
  const candidateData = createMemo(() =>
    getDataCols(props.feature || {})
      .map((c) => ({
        label: c.replace(" Percent", ""),
        value: props.feature[c],
      }))
      .sort((a, b) => descending(a.value, b.value))
  )
  return (
    <>
      <p>
        <strong>
          Ward {props?.feature?.ward}, Precinct {props?.feature?.precinct}
        </strong>
      </p>
      <For each={candidateData()}>
        {({ label, value }) => (
          <p>
            {props.displayOverrides[label] || label}: {value}%,{" "}
            {props.feature[
              label === "turnout" ? "total" : label
            ].toLocaleString()}
          </p>
        )}
      </For>
    </>
  )
}

export default PopupContent
