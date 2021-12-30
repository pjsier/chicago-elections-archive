PRECINCT_YEARS := 1983 2000 2003 2004 2007 2008 2010 2011 2015 2019
ELECTION_IDS := $(shell cat input/results-metadata.json | jq -r 'keys[]')
RESULTS := $(filter-out output/results/7/334.csv output/results/7/335.csv,$(foreach id,$(ELECTION_IDS),$(foreach result,$(shell cat input/results-metadata.json | jq -r '."$(id)".races|keys[]'),output/results/$(id)/$(result).csv)))

.PHONY: all
all: input/results-metadata.json $(RESULTS) $(foreach year,$(PRECINCT_YEARS),output/precincts-$(year).geojson)

.PRECIOUS: input/%.html output/results/%.csv

output/precincts-%.geojson: input/wards.geojson
	wget -qO - https://raw.githubusercontent.com/datamade/chicago-municipal-elections/master/precincts/$*_precincts.geojson | \
	mapshaper -i - \
	-clip $< \
	-simplify 10% \
	-each 'WARD = WARD.toString()' \
	-each 'PRECINCT = PRECINCT.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-filter-fields WARD,PRECINCT \
	-o $@

output/precincts-1983.geojson: input/wards.geojson
	wget -qO - https://raw.githubusercontent.com/datamade/chicago-municipal-elections/master/precincts/1983_precincts.geojson | \
	mapshaper -i - \
	-clip $< \
	-simplify 10% \
	-each 'WARD = Ward.toString()' \
	-each 'PRECINCT = Precinct.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-filter-fields WARD,PRECINCT \
	-o $@

output/results/%.csv: input/%.html
	mkdir -p $(dir $@)
	pipenv run python scripts/scrape_table.py $< > $@

output/results/%/0.csv: input/%/0.html
	mkdir -p $(dir $@)
	echo "id,ward,precinct,registered,ballots,turnout" > $@
	pipenv run python scripts/scrape_table.py $< | \
	xsv select --no-headers 1-3,6,7,9 -| \
	xsv slice --no-headers -s 1 - >> $@

input/%.html:
	mkdir -p $(dir $@)
	curl https://chicagoelections.gov/en/election-results-specifics.asp \
	-X POST \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "election=$(word 1,$(subst /, ,$*))&race=$(filter-out 0,$(word 2,$(subst /, ,$*)))&ward=&precinct=" -o $@

input/results-metadata.json:
	pipenv run python scripts/scrape_results_metadata.py > $@

input/wards.geojson:
	wget -O $@ 'https://data.cityofchicago.org/api/geospatial/sp34-6z76?method=export&format=GeoJSON'
