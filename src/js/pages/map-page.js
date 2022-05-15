import { MapContext, useMap } from "../contexts/map"
import Map from "../components/map"

const MapPage = (props) => {
  const map = useMap()

  return (
    <MapContext.Provider>
      <Map
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
