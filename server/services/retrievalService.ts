export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  sectionHeading?: string;
  pageNumber?: number;
  startPosition: number;
  endPosition: number;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'please', 'tell', 'show', 'give'
]);

export const retrievalService = {
  /**
   * Splits extracted document text into logical, structured chunks with headings and coordinates.
   */
  chunkDocument(extractedText: string, documentId: string): DocumentChunk[] {
    if (!extractedText || extractedText.trim().length === 0) {
      return [];
    }

    const raw = extractedText.replace(/\r\n/g, '\n');
    const chunks: DocumentChunk[] = [];

    // Split by double newlines or detected section markers
    const paragraphs = raw.split(/\n{2,}/);
    let currentChunkText = '';
    let currentHeading = 'Preamble / General Terms';
    let currentPageNumber: number | undefined = undefined;
    let currentStartPos = 0;
    let accumulatedPos = 0;

    // Pattern detecting Section / Article / Numbered clause headers
    const sectionPattern = /^(?:(?:section|article|clause)\s+[\dA-Z.]+|[\d]+\.[\d]*\s+[A-Z][^\n]+|[A-Z\s]{4,}:?)/i;
    // Pattern detecting [Page X] or Page X markers
    const pagePattern = /\[Page\s*(\d+)\]|---\s*Page\s*(\d+)\s*---/i;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) {
        accumulatedPos += para.length + 2;
        continue;
      }

      // Examine lines for page marker and section heading
      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      let contentLineIndex = 0;
      if (lines.length > 0 && pagePattern.test(lines[0])) {
        const pageMatch = lines[0].match(pagePattern);
        if (pageMatch) {
          const pNum = parseInt(pageMatch[1] || pageMatch[2], 10);
          if (!isNaN(pNum)) currentPageNumber = pNum;
        }
        contentLineIndex = 1;
      }

      // Check for potential section heading from the candidate line
      const headingCandidate = lines[contentLineIndex] || lines[0] || '';
      const isHeader =
        sectionPattern.test(headingCandidate) ||
        (headingCandidate.length < 80 && headingCandidate.endsWith(':'));

      if (isHeader) {
        // If we already have accumulated chunk text, save it before starting new section
        if (currentChunkText.trim().length > 0) {
          chunks.push({
            chunkId: `chunk-${chunks.length}`,
            documentId,
            chunkIndex: chunks.length,
            text: currentChunkText.trim(),
            sectionHeading: currentHeading,
            pageNumber: currentPageNumber,
            startPosition: currentStartPos,
            endPosition: currentStartPos + currentChunkText.length,
          });
          currentChunkText = '';
          currentStartPos = accumulatedPos;
        }
        currentHeading = headingCandidate.replace(/[:\-_\s]+$/, '').trim();
      }

      // If adding this paragraph makes the chunk exceed ~1500 characters, flush it
      if (currentChunkText.length + trimmed.length > 1500 && currentChunkText.length > 250) {
        chunks.push({
          chunkId: `chunk-${chunks.length}`,
          documentId,
          chunkIndex: chunks.length,
          text: currentChunkText.trim(),
          sectionHeading: currentHeading,
          pageNumber: currentPageNumber,
          startPosition: currentStartPos,
          endPosition: currentStartPos + currentChunkText.length,
        });
        currentChunkText = trimmed + '\n\n';
        currentStartPos = accumulatedPos;
      } else {
        currentChunkText += trimmed + '\n\n';
      }

      accumulatedPos += para.length + 2;
    }

    // Flush remaining chunk
    if (currentChunkText.trim().length > 0) {
      chunks.push({
        chunkId: `chunk-${chunks.length}`,
        documentId,
        chunkIndex: chunks.length,
        text: currentChunkText.trim(),
        sectionHeading: currentHeading,
        pageNumber: currentPageNumber,
        startPosition: currentStartPos,
        endPosition: currentStartPos + currentChunkText.length,
      });
    }

    return chunks;
  },

  /**
   * Retrieves relevant chunks for a user query using lexical and heading relevance.
   * If the document is small (< 4 chunks), returns all chunks in document order.
   */
  retrieveRelevantChunks(
    chunks: DocumentChunk[],
    query: string,
    topK = 5
  ): DocumentChunk[] {
    if (!chunks || chunks.length === 0) return [];
    
    // For very small documents (<= 3 chunks), provide complete document context
    if (chunks.length <= 3) {
      return chunks;
    }

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

    if (queryTokens.length === 0) {
      // Fallback: Return first topK chunks
      return chunks.slice(0, topK);
    }

    const scoredChunks = chunks.map((chunk) => {
      let score = 0;
      const lowerText = chunk.text.toLowerCase();
      const lowerHeading = (chunk.sectionHeading || '').toLowerCase();

      for (const token of queryTokens) {
        // Heading match has high weight
        if (lowerHeading.includes(token)) {
          score += 5;
        }

        // Exact word occurrences in body text
        const regex = new RegExp(`\\b${token}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length * 1.5;
        } else if (lowerText.includes(token)) {
          score += 0.5;
        }
      }

      // Phrase match bonus
      const cleanQuery = query.toLowerCase().trim();
      if (cleanQuery.length > 5 && lowerText.includes(cleanQuery)) {
        score += 10;
      }

      return { chunk, score };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Pick topK with score > 0, fallback to first topK if none scored > 0
    let selected = scoredChunks.filter((item) => item.score > 0).map((item) => item.chunk);
    if (selected.length === 0) {
      selected = chunks.slice(0, topK);
    } else {
      selected = selected.slice(0, topK);
    }

    // Always sort selected chunks back into original document sequence for coherent context reading
    selected.sort((a, b) => a.chunkIndex - b.chunkIndex);

    return selected;
  },
};
