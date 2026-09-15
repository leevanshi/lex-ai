import test from "node:test";
import assert from "node:assert/strict";
import { rankLegalSources, retrieveRelevantLegalSources } from "./legalKnowledge.ts";

test("retrieves the correct source for a landlord security deposit question", () => {
  const results = retrieveRelevantLegalSources("My landlord has refused to return my security deposit.", 5);
  assert.ok(results.some((source) => source.id === "security-deposit-rental"));
  assert.equal(results[0]?.id, "security-deposit-rental");
});

test("keeps a legally relevant source above a semantically similar but weaker source", () => {
  const results = retrieveRelevantLegalSources("I need a court order to stop my partner from using my client list.", 5);
  assert.ok(results.some((source) => source.id === "specific-relief-act"));
  assert.ok(results[0]?.id === "specific-relief-act");
});

test("recognizes specific legal terminology such as cheque dishonour", () => {
  const results = retrieveRelevantLegalSources("I received a bounced cheque from a client and want to know my rights.", 5);
  assert.ok(results.some((source) => source.id === "negotiable-instruments-act"));
  assert.equal(results[0]?.id, "negotiable-instruments-act");
});

test("returns no source when the legal evidence is too weak", () => {
  const results = retrieveRelevantLegalSources("A completely fictional fantasy dispute about magical debt in a made-up country.", 5);
  assert.equal(results.length, 0);
});

test("returns multiple relevant sources when a question spans more than one legal concept", () => {
  const results = retrieveRelevantLegalSources("I need an injunction because my partner breached my contract and used my client list.", 5);
  assert.ok(results.some((source) => source.id === "specific-relief-act"));
  assert.ok(results.some((source) => source.id === "indian-contract-act"));
  assert.ok(results.some((source) => source.id === "companies-act"));
});

test("deduplicates near-duplicate or repeated source matches", () => {
  const ranked = rankLegalSources("I need a cheque dishonour remedy and I am also seeking contract damages.", { limit: 5 });
  const ids = ranked.map((entry) => entry.source.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("negotiable-instruments-act"));
  assert.ok(ids.includes("indian-contract-act"));
});

test("preserves source metadata for the chosen legal source", () => {
  const source = retrieveRelevantLegalSources("I want to know about workplace sexual harassment complaint process.", 5)[0];
  assert.ok(source);
  assert.equal(source.id, "posh-act");
  assert.ok(source.sourceUrl.length > 0);
  assert.ok(source.section.length > 0);
  assert.ok(source.summary.length > 0);
});
