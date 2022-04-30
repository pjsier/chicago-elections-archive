export function renderMap(mapContainer) {
  const map = new window.maplibregl.Map({
    container: mapContainer,
    style: "style.json",
    center: [-87.6651, 41.8514],
    minZoom: 8,
    maxZoom: 15,
    zoom: 9.25,
    hash: true,
    dragRotate: false,
    attributionControl: true,
  })

  map.touchZoomRotate.disableRotation()
  map.addControl(
    new window.maplibregl.NavigationControl({ showCompass: false })
  )

  const isMobile = () => window.innerWidth <= 600

  const hoverPopup = new window.maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  })

  const clickPopup = new window.maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
  })

  const removePopup = (popup) => {
    map.getCanvas().style.cursor = ""
    popup.remove()
  }

  const popupContent = ({
    properties: { date, victimName, officerNames, slug },
  }) => {
    return `
    <p><strong>Date</strong> <span>${date}</span></p>
    <p><strong>Victim</strong> <span>${victimName}</span></p>
    <p><strong>Officers</strong> <span>${JSON.parse(officerNames).join(
      ", "
    )}</span></p>
    <p>
      <a href="/archive/${slug}">See more details</a>
    </p>
  `
  }

  const onMouseMove = (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["cases"],
    })
    if (features.length > 0 && !clickPopup.isOpen()) {
      map.getCanvas().style.cursor = "pointer"
      if (!isMobile()) {
        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="popup hover">${popupContent(features[0])}</div>`
          )
          .addTo(map)
      }
    } else {
      removePopup(hoverPopup)
    }
  }

  const onMouseOut = () => {
    removePopup(hoverPopup)
  }

  const onMapClick = (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["cases"],
    })
    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer"
      removePopup(hoverPopup)
      clickPopup
        .setLngLat(e.lngLat)
        .setHTML(`<div class="popup click">${popupContent(features[0])}</div>`)
        .addTo(map)
    }
  }

  map.on("mousemove", "cases", onMouseMove)
  map.on("mouseout", "cases", onMouseOut)
  map.on("click", "cases", onMapClick)
}

const mapContainer = document.getElementById("map")
if (mapContainer) {
  renderMap(mapContainer)
}
