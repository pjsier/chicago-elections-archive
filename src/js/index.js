import { setupNavToggle } from "./utils"
import { renderMap } from "./map"

setupNavToggle()
const mapContainer = document.getElementById("map")
if (mapContainer) {
  renderMap(mapContainer)
}
