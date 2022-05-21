# Chicago Elections Archive

Access precinct-level results from historical Chicago elections.

## Setup

```shell
poetry install
npm install
make all
```

## Updating Data

To update data, regenerate `input/results-metadata.json` and `output/results-metadata.json`. Then re-run `make all`, forcing execution if necessary.

## Data Notes

- Reformat 1983 data
- Adjust precincts
  - 2014 and 2016 can use 2015 precincts
  - 2006 can use 2007
    - missing a few
- Missing precincts for years:
  - 2013 2nd District
  - 2012 has some missing
  - a few missing for 2004, 2003, 2002
  - 2000 missing a good amount
  - 1983 missing a few
