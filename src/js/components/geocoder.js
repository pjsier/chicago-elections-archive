import { For, createResource } from "solid-js"
import { createStore } from "solid-js/store"
import SearchIcon from "./search-icon"

const DEBOUNCE_TIME = 350

/* eslint-disable */
// Debounce function from underscore
export const debounce = (func, wait, immediate) => {
  let timeout
  return function () {
    const context = this
    const args = arguments
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}
/* eslint-enable */

// TODO: reimplement these pieces
// input.addEventListener("blur", () => window.setTimeout(closeGeocoder, 100))
// input.addEventListener("focus", openGeocoder)
// input.addEventListener("change", updateClearButtonVisibility)
// clearButton.addEventListener("click", clearInput)
// document.body.addEventListener("click", (e) => {
//   if (!combobox.contains(e.target) && !resultList.contains(e.target)) {
//     closeGeocoder()
//   }
// })

const getAddress = ({
  entityType = null,
  address: { freeformAddress: address, countrySecondarySubdivision: county },
}) =>
  entityType === "CountrySecondarySubdivision"
    ? `${county} County, IL`
    : address

const getResults = ({ query, azureMapsKey }) =>
  fetch(
    `https://atlas.microsoft.com/search/fuzzy/json?${new URLSearchParams({
      "api-version": 1.0,
      topLeft: "42.023022,-87.940101",
      btmRight: "41.643919,-87.523984",
      countrySet: "US",
      idxSet: ["Addr", "PAD", "Geo"].join(","),
      limit: 5,
      typeahead: true,
      "subscription-key": azureMapsKey,
      query,
    })}`
  )
    .then((res) => res.json())
    .then(({ results }) =>
      results
        .filter(
          ({ address: { countrySubdivision: state } }) => state === "IL" // Restricting to Illinois, not just bbox
        )
        .map(({ type, position: { lat, lon }, ...result }) => ({
          type,
          lat,
          lon,
          address: getAddress(result),
        }))
    )
    .catch(() => [])

// TODO: fix setState syntax with spread across the board
// TODO: one prop should be onSelect so that it's managed at a higher level
// TODO: need to handle blue, document click, otherwise done
const Geocoder = (props) => {
  let selected = false

  const [state, setState] = createStore({
    search: "",
    activeIndex: -1,
    expanded: false, // TODO: figure out this part
    results: [],
  })

  const updateResults = async ([query, azureMapsKey]) => {
    if (!(query || "").trim()) return
    // Prevent double input from setting value on select
    if (selected) {
      selected = false
      return
    }
    const results = await getResults({ query, azureMapsKey })
    // unsets active index
    setState({
      activeIndex: -1,
      expanded: true,
      results,
    })
  }

  const debouncedUpdateResults = debounce(updateResults, DEBOUNCE_TIME)

  const onSelect = (result) => {
    selected = true
    setState({
      search: result.address,
      expanded: false,
      results: [],
    })
    props.onSelect(result)
  }

  createResource(
    () => [state.search, props.azureMapsKey],
    // eslint-disable-next-line solid/reactivity
    debouncedUpdateResults
  )

  const onKeyDown = (e) => {
    if (["ArrowDown", "ArrowRight"].includes(e.code)) {
      if (e.code === "ArrowDown" || state.activeIndex > -1) e.preventDefault()
      if (state.activeIndex < state.results.length - 1) {
        setState({ activeIndex: state.activeIndex + 1 })
      }
    } else if (["ArrowUp", "ArrowLeft"].includes(e.code)) {
      if (e.code === "ArrowUp" || state.activeIndex > -1) e.preventDefault()
      if (state.activeIndex > -1) {
        setState({ activeIndex: state.activeIndex - 1 })
      }
    } else if (e.code === "Enter") {
      e.preventDefault()
      if (state.activeIndex > -1) {
        onSelect(state.results[state.activeIndex])
      }
    } else if (e.code === "Space") {
      if (state.activeIndex > -1) {
        e.preventDefault()
        onSelect(state.results[state.activeIndex])
      }
    }
  }

  return (
    <>
      <div
        id="geocoder"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={state.expanded}
      >
        <SearchIcon />
        <input
          type="text"
          id="geocoder-search"
          class=""
          name="search"
          aria-label="Search for..."
          placeholder="Search for..."
          aria-autocomplete="list"
          aria-controls="geocoder-results"
          value={state.search}
          onInput={(e) => setState({ search: e.target.value })}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          class={`delete ${state.search.trim() ? `` : `hidden`}`}
          id="geocoder-clear"
          aria-label="Clear search input"
          onClick={() => setState({ search: "", results: [], activeIndex: -1 })}
        ></button>
      </div>
      <ul
        id="geocoder-results"
        role="listbox"
        class={state.expanded ? `` : `hidden`}
      >
        <For each={state.results}>
          {(result, idx) => (
            <li
              id={`result-${idx()}`}
              role="option"
              class="result"
              onClick={() => onSelect(result)}
              // eslint-disable-next-line solid/reactivity
              {...(state.activeIndex === idx()
                ? { "aria-selected": true }
                : {})}
            >
              {result.address}
            </li>
          )}
        </For>
      </ul>
    </>
  )
}

export default Geocoder
