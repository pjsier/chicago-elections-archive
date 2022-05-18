import { onMount, onCleanup, createEffect } from "solid-js"
import { usePopup } from "../providers/popup"
import { getPrecinctYear } from "../utils/map"

const Popup = (props) => {
  const [popup, setPopup] = usePopup()
  let hoverId = null
  let popupObj = null

  const updateHoverState = (features) => {
    const source = `precincts-${getPrecinctYear(+props.year)}`
    if (hoverId) props.map.removeFeatureState({ source, id: hoverId }, "hover")

    hoverId = features.length > 0 ? features[0].id : null
    if (hoverId) {
      props.map.setFeatureState({ source, id: hoverId }, { hover: true })
    }
  }

  const getFeatureData = (features) =>
    features.length > 0
      ? props.map.getFeatureState({
          source: `precincts-${getPrecinctYear(+props.year)}`,
          id: features[0].id,
        })
      : null

  onMount(() => {
    popupObj = new window.maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
    })
      .setDOMContent(<div>{props.children}</div>)
      .addTo(props.map)

    const onMouseMove = (e) => {
      if (popup.click) return

      const features = props.map.queryRenderedFeatures(e.point, {
        layers: [props.layer],
      })

      props.map.getCanvas().style.cursor = features.length > 0 ? "pointer" : ""
      popupObj.setLngLat(e.lngLat)
      updateHoverState(features)

      setPopup({
        ...popup,
        click: false,
        hover: true,
        feature: getFeatureData(features),
      })
    }

    const onMouseOut = () => {
      if (popup.click) return
      props.map.getCanvas().style.cursor = ""
      popupObj.remove()
      updateHoverState([])
      setPopup({ ...popup, click: false, hover: false, feature: null })
    }

    const onMapClick = (e) => {
      if (popup.click) {
        // TODO: better handling of click outside
        setPopup({ ...popup, click: false, hover: false, feature: null })
        return
      }

      const features = props.map.queryRenderedFeatures(e.point, {
        layers: [props.layer],
      })
      updateHoverState(features)
      if (features.length > 0) {
        props.map.getCanvas().style.cursor = "pointer"
        setPopup({
          ...popup,
          click: true,
          hover: false,
          feature: getFeatureData(features),
        })
      }
    }

    props.map.on("mousemove", props.layer, onMouseMove)
    props.map.on("mouseout", props.layer, onMouseOut)
    props.map.on("click", props.layer, onMapClick)

    popupObj.on("close", () => {
      setPopup({ ...popup, click: false, hover: false, feature: null })
    })
  })

  onCleanup(() => popupObj.remove())

  createEffect(() => {
    if (props.active && !popup.click) popupObj.addTo(props.map)
  })

  createEffect(() => {
    if (props.lngLat) popupObj.setLngLat(props.lngLat)
  })

  createEffect(() => popupObj.setDOMContent(<div>{props.children}</div>))

  return <></>
}

export default Popup
