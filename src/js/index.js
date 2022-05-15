import { render } from "solid-js/web"
import { setupNavToggle } from "./utils"
import MapPage from "./pages/map-page"

setupNavToggle()
const mapContainer = document.getElementById("map-container")
if (mapContainer) {
  render(() => <MapPage />, mapContainer)
}
