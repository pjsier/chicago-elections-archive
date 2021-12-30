import json
import sys

import requests
from bs4 import BeautifulSoup

# TODO: Identify all
ELECTIONS = {
    "251": "2020 General Election - 11/3/2021",
    "250": "2020 Primary - Non-Partisan - 3/17/2020",
    "240": "2020 Primary - Republican - 3/17/2020",
    "230": "2020 Primary - Democratic - 3/17/2020",
    "220": "2019 Municipal Runoffs - 4/2/2019",
    "210": "2019 Municipal General - 2/26/2019",
    "200": "2018 General Election - 11/6/2018",
    "2": "2018 Primary - Non-Partisan - 3/20/2018",
    "1": "2018 Primary - Republican - 3/20/2018",
    "0": "2018 Primary - Democratic - 3/20/2018",
    "3": "2017 Municipal General - 2/28/2017",
    "4": "2016 General Election - 11/8/2016",
    "8": "2016 Primary - Non-Partisan - 3/15/2016",
    "7": "2016 Primary - Green - 3/15/2016",
    "6": "2016 Primary - Republican - 3/15/2016",
    "5": "2016 Primary - Democratic - 3/15/2016",
}


def get_races(soup):
    return {
        o.get("value").strip() or "0": o.get_text().split("\n")[0].strip()
        for o in soup.select("#race option")
    }


if __name__ == "__main__":
    election_metadata = {k: {"label": v, "races": {}} for k, v in ELECTIONS.items()}
    for election in ELECTIONS.keys():
        res = requests.get(
            f"https://chicagoelections.gov/en/election-results.asp?election={election}"
        )
        election_metadata[election]["races"] = get_races(
            BeautifulSoup(res.text, features="lxml")
        )
    json.dump(election_metadata, sys.stdout)
