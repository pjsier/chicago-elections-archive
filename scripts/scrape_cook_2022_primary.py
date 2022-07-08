import csv
import sys

import requests
from bs4 import BeautifulSoup

RACE_MAP = {"17": "7", "19": "9", "23": "13", "109": "115", "14": "4"}

CANDIDATE_MAP = {}


def get_candidates(soup):
    return [v.get_text().strip() for v in soup.find_all("table")[1].find_all("th")][
        3:-1
    ]


def process_row(row, candidates):
    values = [td.getText().strip() for td in row.find_all("td")]
    precinct = values[0]
    num_values = [int(v.replace(",", "")) for v in values[1:]]
    total = num_values[-1]
    candidate_values = num_values[2:-1]
    pct_values = [
        round((v / total) * 100, 2) if total > 0 else 0.0 for v in candidate_values
    ]
    if "berwyn" in precinct.lower() or "evanston" in precinct.lower():
        township = precinct.split(" ")[0]
        precinct_id = precinct.replace("Ward ", "").replace(" Precinct ", "-").upper()
        pct = precinct_id.split(" ")[-1]
    else:
        precinct_id = precinct.replace("  Precinct ", " ").upper()
        township, pct = precinct.split("  ")
        pct = pct.replace("Precinct ", "")
    return {
        "id": precinct_id,
        "ward": township,
        "precinct": pct,
        "registered": "",
        "ballots": "",
        "total": num_values[-1],
        **dict(zip(candidates, candidate_values)),
        **dict(zip([f"{c} Percent" for c in candidates], pct_values)),
    }


if __name__ == "__main__":
    race_id = RACE_MAP[sys.argv[1]]
    req = requests.get(
        f"https://results622.cookcountyclerkil.gov/Home/Detail?contestId={race_id}"
    )

    soup = BeautifulSoup(req.content, features="lxml")
    candidates = get_candidates(soup)

    columns = (
        ["id", "ward", "precinct", "registered", "ballots", "total"]
        + candidates
        + [f"{c} Percent" for c in candidates]
    )
    writer = csv.DictWriter(sys.stdout, fieldnames=columns)
    writer.writeheader()
    for table in soup.find_all("table")[1:]:
        for row in table.find_all("tr")[1:-1]:
            writer.writerow(process_row(row, candidates))
