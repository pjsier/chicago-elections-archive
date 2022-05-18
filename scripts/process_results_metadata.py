import json
import sys

if __name__ == "__main__":
    results = json.load(sys.stdin)

    results["210"]["races"].pop("10")
    results["210"]["races"]["9"] = "Mayor"
    json.dump(results, sys.stdout)
