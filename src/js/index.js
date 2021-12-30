function setupNavToggle() {
  const navToggle = document.getElementById("nav-toggle")

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded")
    navToggle.setAttribute("aria-expanded", !(expanded === "true"))
  })
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavToggle()
})
