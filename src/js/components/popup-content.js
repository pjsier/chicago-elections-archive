import { For, createMemo } from "solid-js"
import { descending } from "../utils"

const PopupContent = (props) => {
  const candidateData = createMemo(() =>
    props.dataCols.map((c) => ({
      label: c.replace(" Percent", ""),
      value: props.featData[c],
    }))
  )
  return (
    <>
      <p>
        <strong>
          Ward {+props.featData.ward}, Precinct {+props.featData.precinct}
        </strong>
      </p>
      <For each={candidateData().sort((a, b) => descending(a.value, b.value))}>
        {({ label, value }) => (
          <p>
            {props.displayOverrides[label] || label}: {value}%,{" "}
            {props.featData[label].toLocaleString()}
          </p>
        )}
      </For>
    </>
  )
}

export default PopupContent
