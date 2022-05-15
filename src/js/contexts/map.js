import { createContext, useContext } from "solid-js"

// TODO: This should expand to include the map as well as things like
// the data domain, other pieces calculated and needed elsewhere
const MapContext = createContext()
const useMap = () => useContext(MapContext)

export { MapContext, useMap }
