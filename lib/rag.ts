/**
 * Retrieval-Augmented Generation (RAG) Engine
 * Provides semantic chunking, TF-IDF vector space embeddings, cosine similarity search,
 * and knowledge base retrieval for resume analysis, company interview questions, and candidate answer evaluation.
 */

export interface KnowledgeChunk {
  id: string;
  category: string;
  title: string;
  content: string;
  metadata?: Record<string, string>;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}

/**
 * Splits text into overlapping semantic chunks for retrieval.
 */
export function chunkText(
  text: string,
  chunkSize: number = 400,
  overlap: number = 80
): string[] {
  if (!text || text.trim().length === 0) return [];
  
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;
    
    // Try to break at a sentence or space boundary if possible
    if (endIndex < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex + chunkSize / 2) {
        endIndex = lastSpace;
      }
    }

    const chunk = cleaned.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;
    if (startIndex >= cleaned.length - overlap) break;
  }

  return chunks;
}

/**
 * Tokenizes text into normalized unigram and bigram terms for feature extraction.
 */
function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const tokens: string[] = [...words];
  
  // Add bigrams for enhanced phrase matching (e.g. "system design", "react hooks", "big o")
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }

  return tokens;
}

/**
 * Converts a string into a term-frequency vector map.
 */
function getTermFrequencyVector(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const tfMap = new Map<string, number>();

  for (const token of tokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }

  // Sublinear term frequency scaling (1 + log(tf))
  const tfVector = new Map<string, number>();
  for (const [term, freq] of tfMap.entries()) {
    tfVector.set(term, 1 + Math.log(freq));
  }

  return tfVector;
}

/**
 * Computes Cosine Similarity between two term-frequency vector maps.
 */
export function calculateCosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const val of vecA.values()) {
    normA += val * val;
  }
  for (const val of vecB.values()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;

  const magA = Math.sqrt(normA);
  const magB = Math.sqrt(normB);

  for (const [term, weightA] of vecA.entries()) {
    const weightB = vecB.get(term);
    if (weightB) {
      dotProduct += weightA * weightB;
    }
  }

  return dotProduct / (magA * magB);
}

/**
 * Curated Technical & Behavioral Interview Knowledge Base Chunks
 */
export const DOMAIN_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "kb-frontend-react",
    category: "Frontend",
    title: "React & Next.js Core Concepts",
    content: "Virtual DOM diffing algorithm, Fiber architecture, state vs props, useEffect cleanup hooks, React 19 Server Components, SSR vs SSG vs ISR, Hydration errors, Memoization (useMemo, useCallback, React.memo), Custom hooks, Event loop interaction.",
  },
  {
    id: "kb-frontend-perf",
    category: "Frontend",
    title: "Web Performance & Core Web Vitals",
    content: "Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), Code splitting, Lazy loading, Bundle size optimization, Image optimization, Critical rendering path, Browser caching strategies.",
  },
  {
    id: "kb-backend-node",
    category: "Backend",
    title: "Node.js & Asynchronous I/O Architecture",
    content: "Single-threaded event loop, libuv worker threads, non-blocking I/O, Event Emitter, Stream buffer processing, Memory leaks debugging, Garbage collection, Microservices vs Monolith architecture.",
  },
  {
    id: "kb-backend-db",
    category: "Database",
    title: "Database Design, SQL & NoSQL Trade-offs",
    content: "Relational (PostgreSQL, MySQL) vs NoSQL (MongoDB, Redis), ACID compliance vs BASE consistency, B-Tree and Hash Indexing, Composite indexes, SQL Join optimizations, Connection pooling, Query execution plans, N+1 query problem.",
  },
  {
    id: "kb-dsa-core",
    category: "DSA",
    title: "Data Structures & Algorithmic Complexity",
    content: "Big-O Time & Space Complexity, Array, Linked List, Hash Table collision resolution, Stack, Queue, Binary Search Tree, Heaps/Priority Queue, Graph Traversal (BFS/DFS), Dynamic Programming memoization, Sliding Window, Two Pointers.",
  },
  {
    id: "kb-system-design-scale",
    category: "System Design",
    title: "High Scalability & Distributed Systems",
    content: "Load Balancing (Round Robin, Least Connections), Horizontal vs Vertical Scaling, Database Sharding & Partitioning, Caching strategies (Write-through, Write-back, Cache-aside), Message Queues (Kafka, RabbitMQ), CDN edge delivery, Rate Limiting (Token Bucket).",
  },
  {
    id: "kb-system-design-reliability",
    category: "System Design",
    title: "Reliability, Idempotency & CAP Theorem",
    content: "CAP Theorem (Consistency, Availability, Partition Tolerance), Distributed consensus (Raft, Paxos), Idempotent API requests with unique headers, Circuit breaker pattern, Graceful degradation, Distributed locking (Redlock).",
  },
  {
    id: "kb-behavioral-star",
    category: "Behavioral",
    title: "STAR Methodology & Leadership Principles",
    content: "Structuring behavioral answers using Situation, Task, Action, Result. Demonstrating Ownership, Bias for Action, Customer Obsession, Handling conflict with teammates, Communicating technical trade-offs to non-technical stakeholders.",
  },
  {
    id: "kb-ai-machine-learning",
    category: "AI & ML",
    title: "LLM, Vector Embeddings & RAG Concepts",
    content: "Retrieval-Augmented Generation (RAG) architecture, Vector Embeddings, Cosine Similarity, Prompt Engineering, Model fine-tuning, Token limits, Context window management, Quantization, Hallucination mitigation.",
  },
  {
    id: "kb-security-auth",
    category: "Security",
    title: "Web Security & Authentication Standards",
    content: "OAuth 2.0 & OIDC workflows, JWT token rotation, Refresh tokens, CSRF protection, Cross-Origin Resource Sharing (CORS), Rate limiting & anti-DDoS, SQL Injection prevention, XSS sanitization, HTTPS & SSL/TLS handshake.",
  },
];

/**
 * Retrieves the top K most semantically relevant knowledge chunks for a query string.
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: KnowledgeChunk[] = DOMAIN_KNOWLEDGE_BASE,
  topK: number = 3
): SearchResult[] {
  if (!query || query.trim().length === 0 || chunks.length === 0) {
    return [];
  }

  const queryVec = getTermFrequencyVector(query);
  const results: SearchResult[] = [];

  for (const chunk of chunks) {
    const chunkTextToVectorize = `${chunk.title} ${chunk.category} ${chunk.content}`;
    const chunkVec = getTermFrequencyVector(chunkTextToVectorize);
    const score = calculateCosineSimilarity(queryVec, chunkVec);

    if (score > 0) {
      results.push({ chunk, score });
    }
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

/**
 * Processes raw candidate resume text into RAG knowledge chunks and extracts relevant context.
 */
export function processResumeRAG(
  resumeText: string,
  targetRoleQuery: string,
  topK: number = 4
): {
  chunks: KnowledgeChunk[];
  relevantChunks: SearchResult[];
  contextString: string;
} {
  const rawChunks = chunkText(resumeText, 450, 90);
  
  const chunks: KnowledgeChunk[] = rawChunks.map((text, idx) => ({
    id: `resume-chunk-${idx + 1}`,
    category: "Candidate Resume",
    title: `Resume Excerpt ${idx + 1}`,
    content: text,
  }));

  const relevantChunks = retrieveRelevantChunks(targetRoleQuery, chunks, topK);

  const contextString = relevantChunks.length > 0
    ? relevantChunks.map((r, i) => `[Resume RAG Excerpt ${i + 1} (Relevance: ${(r.score * 100).toFixed(0)}%)]: ${r.chunk.content}`).join("\n")
    : chunks.slice(0, topK).map((c, i) => `[Resume Excerpt ${i + 1}]: ${c.content}`).join("\n");

  return {
    chunks,
    relevantChunks,
    contextString,
  };
}

/**
 * Formats RAG retrieved context into an augmented prompt section for AI generation.
 */
export function buildAugmentedRAGPrompt(
  role: string,
  company: string,
  interviewType: string,
  candidateAnswerText?: string,
  candidateResumeText?: string
): string {
  const query = `${role} ${company} ${interviewType} ${candidateAnswerText || ""}`;
  
  // 1. Retrieve domain knowledge chunks
  const domainResults = retrieveRelevantChunks(query, DOMAIN_KNOWLEDGE_BASE, 3);
  
  // 2. Retrieve resume RAG chunks if candidate resume text is provided
  let resumeRAGContext = "";
  if (candidateResumeText && candidateResumeText.length > 20) {
    const resumeRAG = processResumeRAG(candidateResumeText, `${role} ${interviewType}`, 3);
    resumeRAGContext = resumeRAG.contextString;
  }

  const domainContext = domainResults.length > 0
    ? domainResults.map((r) => `- [${r.chunk.category} | ${r.chunk.title}]: ${r.chunk.content}`).join("\n")
    : "- Core CS & System Principles: Standard evaluation based on industry best practices.";

  return `
--- RAG RETRIEVED KNOWLEDGE CONTEXT ---
DOMAIN & TECHNICAL BENCHMARKS:
${domainContext}

${resumeRAGContext ? `RELEVANT CANDIDATE RESUME RAG EXCERPTS:\n${resumeRAGContext}` : ""}
--------------------------------------
`.trim();
}
