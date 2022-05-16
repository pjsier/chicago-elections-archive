import { onMount, onCleanup, createEffect } from "solid-js"
import { useMapStore } from "../providers/map"
import { usePopup } from "../providers/popup"

const Popup = (props) => {
  const [map, setMap] = useMapStore()
  const [popup, setPopup] = usePopup()
  let popupObj = null

  onMount(() => {
    popupObj = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
      .setDOMContent(<div>{props.children}</div>)
      .addTo(props.map)

    const onMouseMove = (e) => {
      if (popup.click) return

      const features = props.map.queryRenderedFeatures(e.point, {
        layers: [props.layer],
      })

      props.map.getCanvas().style.cursor = features.length > 0 ? "pointer" : ""
      popupObj.setLngLat(e.lngLat)
      setPopup({
        ...popup,
        click: false,
        hover: true,
        features: features.map(({ properties }) => properties),
      })
    }

    const onMouseOut = (e) => {
      if (popup.click) return
      props.map.getCanvas().style.cursor = ""
      popupObj.remove()
      setPopup({ ...popup, click: false, hover: false })
    }

    const onMapClick = (e) => {
      if (popup.click) {
        // TODO: better handling of click outside
        setPopup({ ...popup, click: false, hover: false, features: [] })
        return
      }

      const features = props.map.queryRenderedFeatures(e.point, {
        layers: [props.layer],
      })
      if (features.length > 0) {
        props.map.getCanvas().style.cursor = "pointer"
        setPopup({
          ...popup,
          click: true,
          hover: false,
          features: features.map(({ properties }) => properties),
        })
      }
    }

    props.map.on("mousemove", props.layer, onMouseMove)
    props.map.on("mouseout", props.layer, onMouseOut)
    props.map.on("click", props.layer, onMapClick)

    popupObj.on("close", () => {
      setPopup({ ...popup, click: false, hover: false })
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
