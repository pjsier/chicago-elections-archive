import { createEffect, onCleanup, onMount } from "solid-js"
import { MapContext } from "../contexts/map"

const Map = (props) => {
  let map
  let mapRef

  onMount(() => {
    map = new maplibregl.Map({
      container: mapRef,
      ...props.mapOptions,
    })
    map.touchZoomRotate.disableRotation()
  })

  onCleanup(() => {
    map.remove()
  })

  return (
    <MapContext.Provider value={() => map}>
      <div id="map" ref={mapRef}></div>
    </MapContext.Provider>
  )
}

export default Map
