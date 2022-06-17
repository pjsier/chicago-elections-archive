---
layout: base
permalink: about/
title: About | Chicago Elections Archive
---

# About

This site is an open source, volunteer project to make it easier to access the historical results of Chicago elections.

Source code is available on GitHub: [pjsier/chicago-elections-archive](https://github.com/pjsier/chicago-elections-archive)

## Data issues

There are some inconsistencies in the data, including precincts where the turnout is reported as greater than 100%, as well as some precincts where data is missing. In general, if there are only a few precincts like this the election is still included here.

Several elections were missing too many precinct matches to be usable, so those are not made available here.

Notice something else? Feel free to send an email to [info@chicagoelectionsarchive.org](mailto:info@chicagoelectionsarchive.org)

## Data access

To make accessing data easier, you can use the [custom download tool](/download/) to generate custom exports of spreadsheets or map files for any election you're interested in.

Elections results for elections going back to 2000 are available from the [Chicago Board of Election Commissioners website](https://chicagoelections.gov/en/election-results.html).

Election results for some earlier historic elections (some of which are not displayed here) are available from the [Chicago Elections Project](https://data.lib.vt.edu/articles/dataset/Chicago_Elections_Project/14099084).

All precinct boundaries can be accessed through DataMade's open source project: [datamade/chicago-municipal-elections](https://github.com/datamade/chicago-municipal-elections)

## Embed the map

Want to use this on your site? You can embed a responsive iframe with [`pym.js`](https://blog.apps.npr.org/pym.js/).

All you need to do is set up the view that you want on the map page, copy the full URL (including all of the parts after `?` and `#`), and add `embed/` after `chicagoelectionsarchive.org/`.

As an example, `https://chicagoelectionsarchive.org/?election=251&race=0#9.25/41.8514/-87.6651` would be become `https://chicagoelectionsarchive.org/embed/?election=251&race=0#9.25/41.8514/-87.6651`.

Then, take that URL and copy it into your CMS or site's code in quotes after `data-pym-src` like this:

```html
<div data-pym-src="https://chicagoelectionsarchive.org/embed/?election=251&race=0#9.25/41.8514/-87.6651">Loading...</div>
<script type="text/javascript" src="https://pym.nprapps.org/pym.v1.min.js"></script>
```

## Contact

Other questions or concerns? Feel free to reach out at [info@chicagoelectionsarchive.org](mailto:info@chicagoelectionsarchive.org)
