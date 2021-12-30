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
  robots: production,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  locale: "en-us",
  nav: [{ url: "/about/", label: "About" }],
}
