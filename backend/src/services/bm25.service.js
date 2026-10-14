/**
 * Lightweight BM25 (Best Matching 25) retrieval engine for portfolio RAG-lite.
 * No external dependencies required.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'about', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'his', 'her', 'their', 'my',
  'tell', 'me', 'please', 'give', 'show', 'know', 'want'
]);

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

export class BM25Index {
  /**
   * @param {Array<{id: string, title: string, category: string, content: string, metadata?: object}>} documents
   * @param {object} [options]
   * @param {number} [options.k1=1.4] - Term frequency saturation
   * @param {number} [options.b=0.75] - Document length normalization
   */
  constructor(documents = [], options = {}) {
    this.k1 = options.k1 ?? 1.4;
    this.b = options.b ?? 0.75;
    this.documents = documents;
    this.docCount = documents.length;
    this.docTokens = [];
    this.docLengths = [];
    this.docFreqs = new Map(); // term -> number of docs containing term
    this.avgDocLength = 0;

    this._buildIndex();
  }

  _buildIndex() {
    let totalLength = 0;

    this.documents.forEach((doc, idx) => {
      // Include title, category, and content in indexed text
      const fullText = `${doc.title} ${doc.title} ${doc.category || ''} ${doc.content}`;
      const tokens = tokenize(fullText);
      this.docTokens.push(tokens);
      this.docLengths.push(tokens.length);
      totalLength += tokens.length;

      const uniqueTermsInDoc = new Set(tokens);
      uniqueTermsInDoc.forEach((term) => {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      });
    });

    this.avgDocLength = this.docCount > 0 ? totalLength / this.docCount : 1;
  }

  /**
   * Query the index and return top N matching documents with scores.
   *
   * @param {string} query
   * @param {number} [topN=4]
   * @returns {Array<{document: object, score: number}>}
   */
  search(query = '', topN = 4) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      // Return top documents by default (e.g. flagship projects & profile)
      return this.documents.slice(0, topN).map((doc) => ({ document: doc, score: 1.0 }));
    }

    const scores = new Array(this.docCount).fill(0);

    queryTokens.forEach((term) => {
      const docFreq = this.docFreqs.get(term) || 0;
      if (docFreq === 0) return;

      // Robertson-Spärck Jones IDF
      const idf = Math.log(1 + (this.docCount - docFreq + 0.5) / (docFreq + 0.5));

      for (let i = 0; i < this.docCount; i++) {
        const tokens = this.docTokens[i];
        let termFrequency = 0;
        for (let j = 0; j < tokens.length; j++) {
          if (tokens[j] === term) termFrequency++;
        }

        if (termFrequency > 0) {
          const docLen = this.docLengths[i];
          const numerator = termFrequency * (this.k1 + 1);
          const denominator =
            termFrequency + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
          scores[i] += idf * (numerator / denominator);
        }
      }
    });

    const results = this.documents
      .map((doc, idx) => ({ document: doc, score: scores[idx] }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    // If no keyword match found (e.g. generic conversational opener), return top flagship overview docs
    if (results.length === 0) {
      return this.documents
        .filter((doc) => doc.category === 'profile' || doc.category === 'flagship' || doc.category === 'overview')
        .slice(0, topN)
        .map((doc) => ({ document: doc, score: 0.5 }));
    }

    return results;
  }
}
