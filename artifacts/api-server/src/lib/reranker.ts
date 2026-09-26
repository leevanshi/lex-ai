import { LegalSource } from "./legalKnowledge";

export interface RerankOptions {
  topK?: number;
  keywordWeight?: number;
}

/**
 * A lightweight hybrid reranker that combines vector similarity scores
 * with lexical keyword matches (BM25-lite) to boost exact phrase matches.
 */
export class LegalReranker {
  
  public rerank(question: string, sources: LegalSource[], options: RerankOptions = {}): LegalSource[] {
    const { topK = 5, keywordWeight = 0.5 } = options;
    
    // Normalize question to lowercase tokens
    const queryTokens = question.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    
    const scoredSources = sources.map(source => {
      // Base score is the vector similarity score (0 to 1)
      const baseScore = source.score || 0;
      
      // Calculate a basic lexical overlap score
      const text = source.text.toLowerCase();
      let matchCount = 0;
      
      for (const token of queryTokens) {
        if (text.includes(token)) {
          matchCount += 1;
        }
      }
      
      // Normalize lexical score by query length
      const lexicalScore = queryTokens.length > 0 ? (matchCount / queryTokens.length) : 0;
      
      // Calculate exact phrase match bonus
      const exactPhraseBonus = text.includes(question.toLowerCase()) ? 0.3 : 0;
      
      // Hybrid Score = Vector Score + (Lexical Score * Weight) + Exact Phrase Bonus
      const hybridScore = baseScore + (lexicalScore * keywordWeight) + exactPhraseBonus;
      
      return {
        ...source,
        score: Math.min(hybridScore, 1.0) // cap at 1.0
      };
    });
    
    // Sort by new hybrid score
    scoredSources.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Return top K
    return scoredSources.slice(0, topK);
  }
}

export const reranker = new LegalReranker();
