import csv
import sys

COLUMN_MAPPING = {
    "Ward": "ward",
    "Precinct": "precinct",
    "Total Ballots Cast": "ballots",
    "Total_Votes": "ballots",
    # "Ballots Cast for Dems": "total",
}
DROP_COLS = [
    "PREC_ID",
    "Year",
    "Ballots Cast for Dems",
    "Ballots Cast for Rep.",
    "Ballots Cast for N.P.",
]
CANDIDATE_COLS = [
    "Washington",
    "Byrne",
    "Ranalio",
    "Daley",
    "Jones",
    "Markowski",
    "Epton",
    "Warren",
]


def get_candidate_percentage(row, candidate):
    return round((int(row[candidate] or "0") / int(row["ballots"])) * 100, 2)


if __name__ == "__main__":
    rows = []
    for r in csv.DictReader(sys.stdin):
        row = {
            COLUMN_MAPPING.get(key, key): value
            for key, value in r.items()
            if key not in DROP_COLS
        }
        row["id"] = f"{str(row['ward']).zfill(2)}{row['precinct'].zfill(3)}"
        if row["id"] == "33003" and row.get("Byrne") == "1933":
            row["Byrne"] = 193
        for candidate in CANDIDATE_COLS:
            if candidate not in row:
                continue
            row[f"{candidate} Percent"] = get_candidate_percentage(row, candidate)
        rows.append(row)

    fieldnames = ["id"] + list([k for k in rows[0].keys() if k != "id"])
    writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
