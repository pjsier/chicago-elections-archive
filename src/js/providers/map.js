import { createContext, useContext } from "solid-js"
import { createStore } from "solid-js/store"

const MapContext = createContext()
const useMapStore = () => useContext(MapContext)

function MapProvider(props) {
  const store = createStore({
    map: null,
    legendData: {},
  })

  return (
    <MapContext.Provider value={store}>{props.children}</MapContext.Provider>
  )
}

export { MapProvider as default, useMapStore }
