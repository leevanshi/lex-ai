import { rankLegalSources } from "./legalKnowledge.ts";

const dataset = [
  {
    query: "My landlord has refused to return my security deposit.",
    expected: ["security-deposit-rental"],
    description: "tenant-landlord deposit issue",
  },
  {
    query: "I received a bounced cheque from a client and want to know the legal position.",
    expected: ["negotiable-instruments-act"],
    description: "cheque dishonour terminology",
  },
  {
    query: "I need a court order to stop my partner from using my client list.",
    expected: ["specific-relief-act", "indian-contract-act"],
    description: "injunction and contract confidentiality issue",
  },
  {
    query: "I want to know about workplace sexual harassment complaint process.",
    expected: ["posh-act"],
    description: "POSH legal terminology",
  },
  {
    query: "My employee copied my client list to a new company.",
    expected: ["companies-act", "indian-contract-act"],
    description: "corporate confidentiality with employee misuse",
  },
  {
    query: "I need legal guidance on a purely fictional scenario with no relevant law in the knowledge base.",
    expected: [],
    description: "insufficient evidence case",
  },
];

function evaluate() {
  const rows = dataset.map(({ query, expected, description }) => {
    const ranked = rankLegalSources(query, { limit: 5, minScore: 0.18 });
    const retrieved = ranked.map((entry) => entry.source.id);
    const hits = expected.filter((sourceId) => retrieved.includes(sourceId));
    const correctSourceAppears = hits.length > 0;
    const topHit = retrieved[0] ?? null;
    const rankingQuality = expected.length > 0 ? (expected.includes(topHit ?? "") ? 1 : 0) : 1;

    return {
      query,
      description,
      expected,
      retrieved,
      correctSourceAppears,
      rankingQuality,
      thresholdBehavior: retrieved.length === 0 ? "no sources above threshold" : "sources above threshold",
    };
  });

  const summary = {
    total: rows.length,
    correctSourceAppears: rows.filter((row) => row.correctSourceAppears).length,
    rankingQuality: rows.filter((row) => row.rankingQuality === 1).length,
    noEvidenceCases: rows.filter((row) => row.retrieved.length === 0).length,
  };

  console.log(JSON.stringify({ summary, rows }, null, 2));

  if (summary.correctSourceAppears < rows.length) {
    const failed = rows.filter((row) => !row.correctSourceAppears);
    throw new Error(`Evaluation failed for: ${failed.map((row) => row.query).join(" | ")}`);
  }
}

const main = () => {
  try {
    evaluate();
    console.log("Retrieval evaluation passed.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

main();
