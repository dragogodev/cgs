const fs = require("fs/promises");
const path = require("path");

async function splitCardsBySet() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const inputPath = path.join(repoRoot, "DragoBorne", "AllCards.json");
  const outputDir = path.join(repoRoot, "DragoBorne", "sets");

  const raw = await fs.readFile(inputPath, "utf8");
  const cards = JSON.parse(raw);

  const cardsBySet = new Map();
  for (const card of cards) {
    const set = card.set;
    if (!set) {
      continue;
    }

    if (!cardsBySet.has(set)) {
      cardsBySet.set(set, []);
    }
    cardsBySet.get(set).push(card);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const writes = [];
  for (const [set, setCards] of cardsBySet.entries()) {
    const outPath = path.join(outputDir, `${set}.json`);
    const contents = JSON.stringify(setCards, null, 2);
    writes.push(fs.writeFile(outPath, contents, "utf8"));
  }

  await Promise.all(writes);
  return { totalSets: cardsBySet.size, outputDir };
}

splitCardsBySet()
  .then(({ totalSets, outputDir }) => {
    console.log(`Wrote ${totalSets} set files to ${outputDir}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
