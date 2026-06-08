const https = require('https');
const fs = require('fs');
// No external dependencies - use simple string parsing instead of cheerio to keep script self-contained.

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.headers = { 'Accept': 'text/html', 'X-Requested-With': 'XMLHttpRequest' };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', (err) => reject(err));
  });
}

function tryParseJsonString(s) {
  try { return JSON.parse(s); } catch (e) { return null; }
}

function extractJsonFromHtml(html) {
  // Look for a JSON blob that contains "cards". We'll try a few heuristics.
  // 1) data-page="..."
  const dataPageIdx = html.indexOf('data-page="');
  if (dataPageIdx !== -1) {
    const start = dataPageIdx + 'data-page="'.length;
    const end = html.indexOf('"', start);
    if (end > start) {
      const candidate = html.substring(start, end);
      const unescaped = candidate.replace(/&quot;/g, '"').replace(/\\n/g, '');
      const parsed = tryParseJsonString(unescaped);
      if (parsed) return parsed;
    }
  }

  // 2) Look for a large JSON-like block that contains "cards"
  const cardsIdx = html.indexOf('"cards"');
  if (cardsIdx === -1) return null;
  // Find opening brace before cards
  let start = html.lastIndexOf('{', cardsIdx);
  if (start === -1) start = html.indexOf('{');
  if (start === -1) return null;

  // Balance braces to find matching closing brace
  let depth = 0; let end = -1;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end > start) {
    const candidate = html.substring(start, end);
    // Unescape some HTML entities if present
    const unescaped = candidate.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const parsed = tryParseJsonString(unescaped);
    if (parsed) return parsed;
  }

  return null;
}

function findCardsObject(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj.cards)) return obj.cards;
  // Look recursively
  for (const k of Object.keys(obj)) {
    try {
      const v = obj[k];
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0].name && (v[0].mana_cost !== undefined || v[0].img !== undefined)) return v;
      if (typeof v === 'object') {
        const res = findCardsObject(v);
        if (res) return res;
      }
    } catch (e) { continue; }
  }
  return null;
}

function imageUrlFor(card) {
  // Construct the image URL following the site's client logic.
  // The site composes: /img/CardImages/${faction}/${armyNameNoSpaces}/${img}_full.png.webp
  if (!card.img || !card.army || !card.army.faction) return null;
  const faction = String(card.army.faction.name).replace(/\s+/g, '');
  const army = String(card.army.name).replace(/\s+/g, '');
  const img = String(card.img).replace(/'/g, '');
  return `https://warpforge-deck.com/img/CardImages/${encodeURIComponent(faction)}/${encodeURIComponent(army)}/${encodeURIComponent(img)}_full.png.webp`;
}

async function main() {
  console.log('Fetching warpforge card data...');
  const url = 'https://warpforge-deck.com/cards?json=1';
  const html = await fetchUrl(url);

  const pageObj = extractJsonFromHtml(html);
  if (!pageObj) {
    console.error('Could not extract page JSON from the HTML');
    process.exit(1);
  }

  const cards = findCardsObject(pageObj);
  if (!cards) {
    console.error('No cards array found inside the extracted JSON');
    process.exit(1);
  }

  console.log(`Found ${cards.length} cards. Mapping...`);

  const mapped = cards.map(c => ({
    id: c.unique_id || c.id,
    name: c.name || '',
    description: c.description || '',
    cost: c.mana_cost != null ? parseInt(c.mana_cost, 10) : null,
    max_health: c.max_health != null ? parseInt(c.max_health, 10) : null,
    armour: c.armour != null ? parseInt(c.armour, 10) : null,
    melee_attack: c.melee_attack != null ? parseInt(c.melee_attack, 10) : null,
    range_attack: c.range_attack != null ? parseInt(c.range_attack, 10) : null,
    rarity: c.rarity && c.rarity.name ? c.rarity.name : (c.rarity_id != null ? String(c.rarity_id) : null),
    army: c.army && c.army.name ? c.army.name : null,
    faction: c.army && c.army.faction && c.army.faction.name ? c.army.faction.name : null,
    traits: Array.isArray(c.traits) ? c.traits.map(t => ({ name: t.name, value: t.pivot && t.pivot.value ? t.pivot.value : null, text: t.pivot && t.pivot.text ? t.pivot.text : null })) : [],
    image: imageUrlFor(c)
  }));

  const out = { count: mapped.length, cards: mapped };
  const outPath = require('path').join(__dirname, '..', 'AllCards.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote', outPath);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { extractJsonFromHtml, findCardsObject };
