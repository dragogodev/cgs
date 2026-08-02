"""Regenerate Palworld/AllCards.json and Palworld/AllSets.json from the official card list API.

The site at en.palworld-official-cardgame.com runs Bushiroad's card manager plugin,
which exposes the same JSON endpoints the card list page consumes.

Usage: python Palworld/generate.py
"""

import json
import os
import re
import urllib.request

API_BASE = "https://en.palworld-official-cardgame.com/manage/card-list-user"
CARD_IMAGE_BASE = "https://en.palworld-official-cardgame.com/wordpress/wp-content/images/cardlist/"
PER_PAGE = 100  # The API caps per_page at 100.

# Card text embeds icons as "<placeholder>@" tokens, which the site swaps for images.
# The replacements below follow the wording the official Q&A uses for each icon.
TEXT_ICONS = {
    "AUTO@": "【AUTO】",
    "ACT@": "【ACT】",
    "CONT@": "【CONT】",
    "OnDeploy@": "【On Deploy】",
    "OnAttack@": "【On Attack】",
    "OnAssign@": "【On Assign】",
    "Quick@": "【Quick】",
    "LuckyPal@": "【Lucky Pal】",
    "Hand@": "【Hand】",
    "Material@": "【Material】",
    "Ingredient@": "【Ingredient】",
    "Strike@": "【Strike】",
    "Power@": "【Power】",
    "Durability@": "【Durability】",
    "1Turn@": "[Once Per Turn]",
    "Damage@": "[Damage]",
}

# A handful of cards write an element icon as "Dragon@" rather than "【Dragon】". The
# official site has no placeholder for that form and renders it as-is, so normalize it.
TEXT_ICONS.update(
    {
        f"{element}@": f"【{element}】"
        for element in ("Neutral", "Fire", "Water", "Electric", "Ground", "Grass", "Ice", "Dragon", "Dark")
    }
)

# EBP01-049 is listed as "RR/SSP" even though its SSP printing is the separate
# EBP01-049SSP entry, so the base card is treated as the RR it is printed at.
RARITIES = {"RR/SSP": "RR"}

# Keyword abilities are not their own field: they only appear in card text, directly
# after the ability type (and optional timing) icons, ie: "CONT@Taunt (You...)".
KEYWORD_ABILITIES = [
    "Assault",
    "Brave",
    "Breakthrough",
    "Interrupt",
    "Nocturnal",
    "Retaliate",
    "Serious",
    "Stealth",
    "Taunt",
    "Vigilance",
]
KEYWORD_ABILITY_PATTERN = re.compile(
    r"(?:AUTO|ACT|CONT)@(?:\w+@)*(" + "|".join(KEYWORD_ABILITIES) + r")\b"
)

# cgs.json declares these as stringEnum/stringEnumList, so any new value needs to be
# added to the matching cgs.json enums block.
ENUMS = {
    "card_kind": {"Pal", "Structure", "Gear", "Event", "Soul"},
    "card_kind_sub": {"Normal Pal", "Lucky Pal"},
    "color": {"Red", "Blue", "Green", "Purple", "Colorless"},
    "icon": {"Quick"},
    "rare": {"SSS", "SSP", "SP", "OSR", "SR", "RR", "R", "U", "C", "TSP", "TSR", "TD", "PR"},
    "type": {"Neutral", "Fire", "Water", "Electric", "Ground", "Grass", "Ice", "Dragon", "Dark"},
    "aptitude": {
        "Kindling",
        "Electricity",
        "Cooling",
        "Harvesting",
        "Crafting",
        "Collecting",
        "Farming",
        "Transporting",
    },
    "keyword_ability": set(KEYWORD_ABILITIES),
}


def get(endpoint, **params):
    query = "&".join(f"{key}={value}" for key, value in params.items())
    url = f"{API_BASE}/{endpoint}?lang=en&{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def format_text(text):
    """Replace the icon placeholders in card text with their official wording."""
    # Longest first, so that eg. "OnAttack@" is not shortened by a prefix match.
    for placeholder in sorted(TEXT_ICONS, key=len, reverse=True):
        text = text.replace(placeholder, TEXT_ICONS[placeholder])
    return text


def main():
    sets = []
    for year in get("products")["products"]:
        for product in year["items"]:
            sets.append({"code": product["code"], "name": product["name"]})

    rows = []
    page = 1
    while True:
        response = get("list", per_page=PER_PAGE, page=page)
        rows += response["items"]
        if len(rows) >= response["total"] or not response["items"]:
            break
        page += 1

    cards = []
    seen = {}
    unmapped = {}
    leftover_icons = []
    rows.sort(key=lambda row: (row["expansion"], row["card_number"]))
    for row in rows:
        # The soul card shared by both trial decks is listed once per deck, but a
        # *Card:Id* has to be unique, so the second listing is dropped.
        if row["card_number"] in seen:
            print(f"Skipping {row['card_number']} from {row['expansion']}: already in {seen[row['card_number']]}")
            continue
        seen[row["card_number"]] = row["expansion"]

        # flavor/icon/parallel_param are only populated on the detail endpoint.
        detail = get("detail", id=row["id"])["card"]

        card = {
            "id": row["card_number"],
            "name": row["card_name"],
            "set": row["expansion"],
            "image": CARD_IMAGE_BASE + row["picture"],
        }
        for key in ("card_kind", "card_kind_sub", "color", "rare"):
            if row[key]:
                card[key] = row[key]
        if "rare" in card:
            card["rare"] = RARITIES.get(card["rare"], card["rare"])
        for key in ("cost", "power", "attack"):
            if row[key]:
                card[key] = int(row[key])
        for key in ("type", "aptitude"):
            if row[key]:
                card[key] = row[key].split("|")
        keywords = sorted(set(KEYWORD_ABILITY_PATTERN.findall(row["text"])))
        if keywords:
            card["keyword_ability"] = keywords
        if row["text"]:
            card["text"] = format_text(row["text"])
        if detail.get("flavor"):
            card["flavor"] = format_text(detail["flavor"])
        if detail.get("icon"):
            card["icon"] = detail["icon"]
        if detail.get("parallel_param"):
            card["parallel"] = "Yes"
        cards.append(card)

        if "@" in card.get("text", "") + card.get("flavor", ""):
            leftover_icons.append(card["id"])
        for key, allowed in ENUMS.items():
            value = card.get(key)
            for entry in value if isinstance(value, list) else [value] if value else []:
                if entry not in allowed:
                    unmapped.setdefault(key, set()).add(entry)

    cards.sort(key=lambda card: (card["set"], card["id"]))
    sets.sort(key=lambda item: item["code"])

    # A "@" that survived format_text means the game added an icon placeholder that
    # needs a new entry in TEXT_ICONS above.
    if leftover_icons:
        print(f"WARNING: unreplaced icon placeholders on: {leftover_icons}")
    for key in sorted(unmapped):
        print(f"WARNING: values missing from the cgs.json {key} enum: {sorted(unmapped[key])}")

    palworld_dir = os.path.dirname(os.path.abspath(__file__))
    for filename, data in (("AllCards.json", cards), ("AllSets.json", sets)):
        with open(os.path.join(palworld_dir, filename), "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, separators=(",", ":"))
            out.write("\n")

    print(f"{len(rows)} rows -> {len(cards)} cards across {len(sets)} sets")


if __name__ == "__main__":
    main()
