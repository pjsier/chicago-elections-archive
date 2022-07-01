import csv
import re
import sys

from bs4 import BeautifulSoup


def get_candidates(soup):
    headers = [v.get_text().strip() for v in soup.find("table").find_all("b")]
    return [h for h in headers if "%" not in h and h != "Votes"]


def process_table(table, candidates):
    ward = int(table.select("thead th b, tr td b")[0].get_text().split()[-1])
    rows = []
    for row in table.find_all("tr"):
        row_values = get_row_values(row, ward, candidates)
        if row_values:
            rows.append(row_values)
    return rows


def get_row_values(row, ward, candidates):
    values = [v.get_text().strip() for v in row.find_all("td")]
    if len(values) <= 1 or any(
        w in values[0].lower() for w in ["total", "precinct", "ward"]
    ):
        return
    vote_values = [int(v.replace(",", "")) for v in values[2:] if "%" not in v]
    pct_values = [
        float(v.replace(",", "").replace("%", "")) for v in values[2:] if "%" in v
    ]
    return {
        "id": f"{str(ward).zfill(2)}{values[0].zfill(3)}",
        "ward": ward,
        "precinct": int(values[0] or "0"),
        "registered": "",
        "ballots": "",
        "total": int(values[1].replace(",", "")),
        **dict(zip(candidates, vote_values)),
        **dict(zip([f"{c} Percent" for c in candidates], pct_values)),
    }


if __name__ == "__main__":
    with open(sys.argv[1], "rb") as f:
        soup = BeautifulSoup(f.read(), features="lxml")

    body_text = re.sub(r"\s+", " ", soup.find("body").getText()).lower()
    if "an error occurred" in body_text:
        raise ValueError("Incomplete results due to error")

    candidates = get_candidates(soup)
    columns = (
        ["id", "ward", "precinct", "registered", "ballots", "total"]
        + candidates
        + [f"{c} Percent" for c in candidates]
    )
    writer = csv.DictWriter(sys.stdout, fieldnames=columns)
    writer.writeheader()
    for table in soup.find_all("table")[1:]:
        writer.writerows(process_table(table, candidates))
