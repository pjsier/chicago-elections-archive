import { createEffect, createSignal } from "solid-js"
import { MapContext, useMap } from "../contexts/map"
import Map from "../components/map"

const MapPage = (props) => {
  const map = useMap()
  const [toggle, setToggle] = createSignal(false)

  return (
    <MapContext.Provider>
      <button
        style="position: absolute; z-index: 10000"
        onClick={() => setToggle(!toggle())}
      >
        Toggle
      </button>
      <Map
        year={2020}
        election={toggle() ? "251" : "250"}
        race={"0"}
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
    </MapContext.Provider>
  )
}

export default MapPage
