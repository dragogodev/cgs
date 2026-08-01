"""Regenerate Digimon/AllCards.json and Digimon/AllSets.json from the digimoncard.io API.

Usage: python Digimon/generate.py
"""

import json
import os
import re
import urllib.request

API_URL = "https://digimoncard.io/api-public/search.php?n="

DROPPED_FIELDS = {
    "artist",  # null for every card
    "date_added",
    "form",  # duplicate of "stage", with fewer values populated
    "pretty_url",
    "tcgplayer_id",
    "tcgplayer_name",
}

RARITIES = {
    "c": "Common",
    "common": "Common",
    "u": "Uncommon",
    "uncommon": "Uncommon",
    "r": "Rare",
    "rare": "Rare",
    "sr": "Super Rare",
    "sec": "Secret Rare",
    "ur": "Ultra Rare",
    "p": "Promo",
}

ATTRIBUTES = {"Free}}": "Free"}

# Set prefixes whose name cannot be recovered from the set_name list.
SET_NAME_OVERRIDES = {
    "BO": "Digi-Battle Card Game: Booster Packs",
    "DD": "Digimon Collectible Card Game: DD",
    "DM": "Digimon Collectible Card Game: DM",
    "DV": "Digimon Collectible Card Game: DV",
    "LM": "Limited Card Packs",
    "MD": "Digimon Collectible Card Game: MD",
    "MO": "Digimon The Movie Promo Cards",
    "P": "Promotional Cards",
    "ST": "Digi-Battle Card Game: Starter Sets",
}


def set_code(card_id):
    match = re.match(r"^([A-Za-z]+\d*)-", card_id)
    if not match:
        raise ValueError(f"Unable to derive a set code from card id {card_id!r}")
    return match.group(1).upper()


def set_name_code(set_name):
    token = set_name.split(":")[0].strip()
    match = re.match(r"^([A-Za-z]+)-?0*(\d+)?$", token)
    if not match:
        return None
    return (match.group(1) + (match.group(2) or "")).upper()


def main():
    with urllib.request.urlopen(API_URL) as response:
        rows = json.load(response)

    # The API emits one row per TCGplayer printing; those rows are identical
    # apart from tcgplayer_name/tcgplayer_id, both of which are dropped.
    unique = {}
    for row in rows:
        unique.setdefault(row["id"], row)

    cards = []
    names_by_code = {}
    for row in unique.values():
        code = set_code(row["id"])
        card = {"set": code}
        for key, value in row.items():
            if key in DROPPED_FIELDS or value in (None, "", []):
                continue
            if key == "rarity":
                value = RARITIES.get(value.lower(), value)
            elif key == "attribute":
                value = ATTRIBUTES.get(value, value)
            card[key] = value
        cards.append(card)

        candidates = names_by_code.setdefault(code, set())
        candidates.update(n for n in row["set_name"] if set_name_code(n) == code)

    cards.sort(key=lambda card: (card["set"], card["id"]))

    # cgs.json declares rarity as a stringEnum, so anything unmapped needs a new
    # entry in RARITIES above and in the cgs.json enums block.
    unmapped = {card["rarity"] for card in cards if card.get("rarity")}
    unmapped -= set(RARITIES.values())
    if unmapped:
        print(f"WARNING: unmapped rarities: {sorted(unmapped)}")

    sets = []
    for code in sorted(names_by_code):
        candidates = names_by_code[code]
        if len(candidates) == 1:
            name = next(iter(candidates))
        else:
            name = SET_NAME_OVERRIDES.get(code, code)
        sets.append({"code": code, "name": name})

    digimon_dir = os.path.dirname(os.path.abspath(__file__))
    for filename, data in (("AllCards.json", cards), ("AllSets.json", sets)):
        with open(os.path.join(digimon_dir, filename), "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, separators=(",", ":"))
            out.write("\n")

    print(f"{len(rows)} rows -> {len(cards)} cards across {len(sets)} sets")


if __name__ == "__main__":
    main()
