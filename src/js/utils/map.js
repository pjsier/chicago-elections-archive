export const COLOR_SCHEME = [
  "#1f77b4",
  "#d62728",
  "#2ca02c",
  "#ff7f0e",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
]

export const getPrecinctYear = (year) => {
  if (year > 1983 && year < 2003) return 2003
  if ([2014, 2015, 2016].includes(year)) return 2015
  if (year === 2006) return 2007
  return [2019, 2015, 2011, 2010, 2008, 2007, 2004, 2003, 1983].find(
    (y) => year >= y
  )
}

export const getDataCols = (row) =>
  Object.keys(row || {}).filter(
    (row) => row.includes("Percent") || row === "turnout"
  )
