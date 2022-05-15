S3_BUCKET = chicago-elections-archive
S3_REGION = us-east-1

PRECINCT_YEARS := 1983 2000 2003 2004 2007 2008 2010 2011 2012 2015 2019
ELECTION_IDS := $(shell cat input/results-metadata.json | jq -r 'keys[]')
IGNORE_RESULTS := output/results/7/334.csv output/results/7/335.csv output/results/80/250.csv output/results/80/255.csv output/results/80/253.csv output/results/80/261.csv output/results/80/266.csv 
RESULTS := $(filter-out $(IGNORE_RESULTS),$(foreach id,$(ELECTION_IDS),$(foreach result,$(shell cat input/results-metadata.json | jq -r '."$(id)".races|keys[]'),output/results/$(id)/$(result).csv)))

.PHONY: all
all: input/results-metadata.json $(RESULTS) $(foreach year,$(PRECINCT_YEARS),output/precincts-$(year).geojson)

.PRECIOUS: input/%.html output/results/%.csv

.PHONY: deploy
deploy:
	s3cmd sync ./output/ s3://$(S3_BUCKET)/ \
		--region=$(S3_REGION) \
		--host=$(S3_REGION).linodeobjects.com \
		--host-bucket="%(bucket)s.$(S3_REGION).linodeobjects.com" \
		--progress \
		--no-preserve \
		--acl-public \
		--no-mime-magic \
		--guess-mime-type \
		--add-header 'Cache-Control: "public, max-age=0, must-revalidate"'

output/precincts-%.geojson: input/wards.geojson
	wget -qO - https://raw.githubusercontent.com/datamade/chicago-municipal-elections/master/precincts/$*_precincts.geojson | \
	mapshaper -i - snap \
	-clip $< \
	-simplify 10% \
	-each 'WARD = WARD.toString()' \
	-each 'PRECINCT = PRECINCT.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-filter-fields id,WARD,PRECINCT \
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

output/precincts-2012.geojson: input/PRECINCTS_2012.shp input/wards.geojson
	mapshaper -i $< snap \
	-proj crs=wgs84 \
	-clip $(filter-out $<,$^) \
	-simplify 10% \
	-each 'WARD = WARD.toString()' \
	-each 'PRECINCT = PRECINCT.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-filter-fields id,WARD,PRECINCT \
	-o $@

input/PRECINCTS_2012.shp: input/precincts-2012.zip
	unzip -DD -d input $<

input/precincts-2012.zip:
	wget -O $@ "https://data.cityofchicago.org/api/geospatial/uvpq-qeeq?method=export&format=Original"

output/precincts-1983.geojson: input/wards.geojson
	wget -qO - https://raw.githubusercontent.com/datamade/chicago-municipal-elections/master/precincts/1983_precincts.geojson | \
	mapshaper -i - snap \
	-clip $< \
	-simplify 10% \
	-each 'WARD = Ward.toString()' \
	-each 'PRECINCT = Precinct.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-filter-fields id,WARD,PRECINCT \
	-o $@

output/results/19831/0.csv: input/1983/19831.csv
	mkdir -p $(dir $@)
	cat $< | pipenv run python scripts/process_1983.py > $@

output/results/19830/0.csv: input/1983/19830.csv
	mkdir -p $(dir $@)
	cat $< | pipenv run python scripts/process_1983.py > $@

input/1983/19831.csv: input/1983/
	pipenv run in2csv input/1983/Mayoral_General/ElectionResults_Spreadsheet/1983_MayoralGeneral_ElectionResultsSpreadsheet.xlsx > $@

input/1983/19830.csv: input/1983/
	pipenv run in2csv input/1983/Mayoral_Primary/ElectionResults_Spreadsheet/1983_MayoralPrimary_ElectionResultsSpreadsheet.xlsx > $@

input/1983/: input/1983.zip
	unzip -DD -d input $<

input/1983.zip:
	wget -O $@ https://data.lib.vt.edu/ndownloader/files/26588033

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
