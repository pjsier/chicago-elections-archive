import { createContext, useContext } from "solid-js"

const MapContext = createContext()
const useMap = () => useContext(MapContext)

export { MapContext, useMap }
