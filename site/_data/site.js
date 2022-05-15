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
  precinctYears: [
    1983, 2000, 2003, 2004, 2007, 2008, 2010, 2011, 2012, 2015, 2019,
  ],
  nav: [{ url: "/about/", label: "About" }],
}
