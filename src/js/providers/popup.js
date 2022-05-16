import { createContext, useContext } from "solid-js"
import { createStore } from "solid-js/store"

const PopupContext = createContext()
const usePopup = () => useContext(PopupContext)

function PopupProvider(props) {
  const store = createStore({
    hover: false,
    click: false,
    lngLat: null,
    features: [],
  })

  return (
    <PopupContext.Provider value={store}>
      {props.children}
    </PopupContext.Provider>
  )
}

export { PopupProvider as default, usePopup }
