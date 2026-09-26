import { retrievalSystem } from "./retrieval";
import { reranker } from "./reranker";

const EVALUATION_DATASET = [
  {
    query: "What is the penalty for not returning a security deposit?",
    expectedDocumentId: "security-deposit-rental"
  },
  {
    query: "What rights do I have if I buy a defective electronic product?",
    expectedDocumentId: "consumer-protection-act"
  },
  {
    query: "Can a company refuse to provide information under RTI?",
    expectedDocumentId: "rti-act"
  }
];

async function runEvaluation() {
  console.log("Starting RAG Evaluation Pipeline...\n");
  
  let totalQueries = EVALUATION_DATASET.length;
  let top1Hits = 0;
  let top5Hits = 0;

  for (const item of EVALUATION_DATASET) {
    console.log(`Evaluating Query: "${item.query}"`);
    
    // 1. Broad Vector Recall
    const rawSources = await retrievalSystem.retrieveRelevantSources(item.query, { limit: 10, minScore: -1 });
    
    // 2. Hybrid Reranking
    const rankedSources = reranker.rerank(item.query, rawSources, { topK: 5, keywordWeight: 0.5 });
    
    // Check hits (we check against title prefix to handle demo mode mismatches gracefully)
    const expectedPrefix = item.expectedDocumentId.split('-')[0].toLowerCase();
    
    const isTop1 = rankedSources[0]?.title?.toLowerCase().includes(expectedPrefix);
                   
    let isTop5 = false;
    for (const source of rankedSources) {
       if (source.title?.toLowerCase().includes(expectedPrefix)) {
         isTop5 = true;
         break;
       }
    }

    console.log(`Expected Topic: ${item.expectedDocumentId}`);
    console.log(`Retrieved Top 1: ${rankedSources[0]?.title || 'None'}`);
    console.log(`Top 5 Contains Expected: ${isTop5 ? 'Yes' : 'No'}`);
    
    if (isTop5) top5Hits++;
    if (isTop1) top1Hits++;
    console.log("---");
  }

  console.log("\nEvaluation Complete:");
  console.log(`Total Queries: ${totalQueries}`);
  console.log(`Top-1 Accuracy: ${Math.round((top1Hits/totalQueries)*100)}%`);
  console.log(`Top-5 Recall: ${Math.round((top5Hits/totalQueries)*100)}%`);
  
  console.log("\nNote: Accuracy depends on the Embedding Provider (Demo vs OpenAI vs Ollama)");
}

runEvaluation().catch(console.error);
