const production = process.env.NODE_ENV === "production"

const host = production ? process.env.SITE_HOST : "http://0.0.0.0:8080"

// For modifying the <base> tag
const baseurl = production ? "" : ""

module.exports = {
  name: "Chicago Elections Archive",
  title: "Chicago Elections Archive",
  description: "Maps and data for Chicago elections",
  type: "website",
  baseurl,
  url: `${host}${baseurl}`,
  production,
  // robots: production,
  robots: false,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  locale: "en-us",
  precinctYears: [2019, 2020],
  nav: [{ url: "/about/", label: "About" }],
}
