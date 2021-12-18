# S3_BUCKET =
# CLOUDFRONT_ID =
# RESULTS :=  $(shell cat input/metadata.json | jq -r 'keys[]' | xargs -I {} echo "output/results/combined/{}.csv")

# .PHONY: data
# data: $(RESULTS) output/tiles/precincts/

.PHONY: all
all: input/results-metadata.json

.PRECIOUS: input/251/%.html output/results/251/%.csv

# .PHONY: deploy
# deploy:
# 	aws s3 cp ./output/tiles s3://$(S3_BUCKET)/cook-2020-general-election/tiles/ --recursive --acl=public-read --cache-control "public, max-age=31536000" --content-encoding=gzip --region=us-east-1
# 	aws s3 cp ./output/results/combined s3://$(S3_BUCKET)/cook-2020-general-election/results/ --acl=public-read --cache-control "public, max-age=86400, must-revalidate" --recursive --acl=public-read --region=us-east-1
# 	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths /cook-2020-general-election/*

output/tiles/precincts/: input/precincts.mbtiles
	mkdir -p output/tiles
	tile-join --no-tile-size-limit --force -e $@ $<

output/results/251/0.csv: input/251/0.html
	mkdir -p $(dir $@)
	echo "id,ward,precinct,registered,ballots,turnout" > $@
	pipenv run python scripts/scrape_table.py $< | \
	xsv select --no-headers 1-5,8- - | \
	xsv slice --no-headers -s 1 - >> $@

output/results/251/%.csv: input/251/%.html
	mkdir -p $(dir $@)
	pipenv run python scripts/scrape_table.py $< > $@

input/251/%.html:
	mkdir -p $(dir $@)
	curl https://chicagoelections.gov/en/election-results-specifics.asp -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "election=251&race=$*&ward=&precinct=" -o $@

input/251/0.html:
	mkdir -p $(dir $@)
	curl https://chicagoelections.gov/en/election-results-specifics.asp -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "election=251&race=&ward=&precinct=" -o $@

input/results-metadata.json:
	pipenv run python scripts/scrape_results_metadata.py > $@

input/precincts.mbtiles: input/precincts.geojson
	tippecanoe --simplification=10 --simplify-only-low-zooms --maximum-zoom=11 --no-tile-stats --generate-ids \
	--force --detect-shared-borders --coalesce-smallest-as-needed -L precincts:$< -o $@

# TODO: Split up pulling these
input/precincts.geojson: input/wards.geojson
	wget -qO - https://raw.githubusercontent.com/datamade/chicago-municipal-elections/master/precincts/2019_precincts.geojson | \
	mapshaper -i - \
	-clip $< \
	-each 'WARD = WARD.toString()' \
	-each 'PRECINCT = PRECINCT.toString()' \
	-each 'id = WARD.padStart(2, "0") + PRECINCT.padStart(3, "0")' \
	-o $@

input/wards.geojson:
	wget -O $@ 'https://data.cityofchicago.org/api/geospatial/sp34-6z76?method=export&format=GeoJSON'
