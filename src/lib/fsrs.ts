import { Concept } from '../types';

/**
 * FSRS (Free Spaced Repetition Scheduler) Mathematical Engine
 * Models human memory decay as a power law:
 * R(t) = (1 + FACTOR * (t / S))^(-DECAY_POWER)
 */

export const FSRS_FACTOR = 19 / 81; // FSRS default standard scaling
export const DECAY_POWER = 0.5; // Power law decay parameter

export function calculateRetention(stabilityDays: number, elapsedDays: number): number {
  if (stabilityDays <= 0) return 0.1;
  if (elapsedDays <= 0) return 1.0;
  const r = Math.pow(1 + FSRS_FACTOR * (elapsedDays / stabilityDays), -DECAY_POWER);
  return Math.max(0.02, Math.min(1.0, r));
}

export function calculateConfidenceInterval(retention: number, reviewCount: number): [number, number] {
  // Bayesian uncertainty narrows as review count increases
  const uncertainty = Math.max(0.04, 0.22 / Math.sqrt(reviewCount + 1));
  const low = Math.max(0.02, retention - uncertainty);
  const high = Math.min(1.0, retention + uncertainty * 0.8);
  return [Number(low.toFixed(3)), Number(high.toFixed(3))];
}

export function predictForgettingCliffDate(lastReviewedAt: string, stabilityDays: number, cliffThreshold: number = 0.70): Date {
  const last = new Date(lastReviewedAt);
  // Solve for t when R(t) = cliffThreshold
  // cliffThreshold = (1 + FSRS_FACTOR * (t / S))^(-DECAY_POWER)
  // cliffThreshold^(-1/DECAY_POWER) = 1 + FSRS_FACTOR * (t / S)
  // t = S * (cliffThreshold^(-1/DECAY_POWER) - 1) / FSRS_FACTOR
  const tDays = (stabilityDays * (Math.pow(cliffThreshold, -1 / DECAY_POWER) - 1)) / FSRS_FACTOR;
  const cliffTime = last.getTime() + tDays * 24 * 60 * 60 * 1000;
  return new Date(cliffTime);
}

export function getDecayCurvePoints(concept: Concept, totalDays: number = 14) {
  const points = [];
  const now = new Date();
  const lastReview = new Date(concept.lastReviewedAt);
  const elapsedToNowDays = Math.max(0, (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

  for (let d = 0; d <= totalDays; d += 0.5) {
    const r = calculateRetention(concept.stability, d);
    const [low, high] = calculateConfidenceInterval(r, concept.reviewCount);
    points.push({
      day: `Day ${d.toFixed(1)}`,
      dayNum: d,
      retention: Math.round(r * 100),
      confidenceLow: Math.round(low * 100),
      confidenceHigh: Math.round(high * 100),
      threshold: 70, // The 70% forgetting cliff
      isToday: Math.abs(d - elapsedToNowDays) < 0.25,
    });
  }
  return points;
}

export function getStatusFromRetention(retention: number, kintsugiRepairs: number): Concept['status'] {
  if (kintsugiRepairs >= 2 && retention >= 0.85) return 'golden';
  if (retention >= 0.80) return 'healthy';
  if (retention >= 0.65) return 'wilting';
  return 'critical';
}

// Initial Seed Concepts for Instant Exploration & Practice
export const SEED_CONCEPTS: Concept[] = [
  {
    id: 'c-pacelc',
    title: 'PACELC Theorem & Partition Dynamics',
    summary: 'Extends CAP: if partition (P), trade Availability (A) vs Consistency (C); Else (E), trade Latency (L) vs Consistency (C).',
    category: 'Distributed Systems',
    tags: ['distributed', 'consensus', 'replication', 'database', 'latency', 'cap-theorem'],
    keyMechanisms: ['Quorum consensus (R+W > N)', 'Vector clocks', 'Network partition tolerance'],
    commonMisconceptions: ['Assuming partitions are instantaneous', 'Believing ACID guarantees match CAP consistency'],
    sourceSnippet: 'Under normal execution, PACELC dictates latency penalties for synchronous cross-region quorums.',
    stability: 2.8,
    difficulty: 7,
    lastReviewedAt: new Date(Date.now() - 3.2 * 24 * 60 * 60 * 1000).toISOString(), // 3.2 days ago -> Cliff!
    nextReviewAt: new Date(Date.now() + 0.4 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.64,
    confidenceLow: 0.52,
    confidenceHigh: 0.74,
    reviewCount: 3,
    kintsugiRepairs: 1,
    status: 'critical',
    history: [
      {
        id: 'h1',
        timestamp: new Date(Date.now() - 3.2 * 24 * 60 * 60 * 1000).toISOString(),
        question: 'What trade-off does PACELC force when no partition is active?',
        questionType: 'free_recall',
        studentAnswer: 'It forces latency vs consistency trade-off during regular replication.',
        score: 82,
        feedback: 'Precise recall of the Else (E) condition.',
        misconceptionsFound: [],
        priorRetention: 0.71,
        postRetention: 0.95,
        newStability: 2.8,
      }
    ]
  },
  {
    id: 'c-fsrs',
    title: 'FSRS Bayesian Stability Curve',
    summary: 'Memory retrievability decays by power law. Synaptic stability expands exponentially with spaced retrieval.',
    category: 'Cognitive Science',
    tags: ['neuroscience', 'spaced-repetition', 'fsrs', 'bayesian', 'retention', 'memory'],
    keyMechanisms: ['Power law decay R(t)', 'Stability growth factor', 'Bayesian interval estimation'],
    commonMisconceptions: ['Assuming memory decays exponentially like radioactive half-life', 'Believing passive review resets curve'],
    sourceSnippet: 'Active retrieval at the 70% threshold induces maximal synaptic potentiation.',
    stability: 5.2,
    difficulty: 6,
    lastReviewedAt: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 4.1 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.88,
    confidenceLow: 0.81,
    confidenceHigh: 0.94,
    reviewCount: 4,
    kintsugiRepairs: 2,
    status: 'golden',
    history: []
  },
  {
    id: 'c-2pc',
    title: 'Two-Phase Commit (2PC) Blocking Locks',
    summary: 'Coordinator prepares cohort nodes before committing. If coordinator fails after prepare, cohorts remain indefinitely locked.',
    category: 'Database Engines',
    tags: ['database', 'locking', 'transactions', 'distributed', 'consensus', '2pc'],
    keyMechanisms: ['Prepare phase', 'Write-ahead log commit barrier', 'Cohort blocking vulnerability'],
    commonMisconceptions: ['Thinking 2PC can safely self-recover without external recovery protocols', 'Confusing 2PC with Paxos consensus'],
    sourceSnippet: 'Cohorts that voted YES must wait indefinitely if the coordinator network segment dies.',
    stability: 1.4,
    difficulty: 8,
    lastReviewedAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.58,
    confidenceLow: 0.44,
    confidenceHigh: 0.70,
    reviewCount: 2,
    kintsugiRepairs: 0,
    status: 'critical',
    history: []
  },
  {
    id: 'c-fluency',
    title: 'Metacognitive Illusion of Competence',
    summary: 'Re-reading notes triggers semantic perceptual fluency, creating a false subjective feeling of mastery without synaptic encoding.',
    category: 'Neurobiology',
    tags: ['metacognition', 'learning-science', 'fluency', 'neurobiology', 'memory'],
    keyMechanisms: ['Perceptual fluency heuristic', 'Generative retrieval demand', 'Long-term synaptic potentiation'],
    commonMisconceptions: ['Treating highlighter color coding as active study', 'Assuming understanding equals recall capability'],
    sourceSnippet: 'Fluency in the working memory buffer masquerades as long-term storage consolidation.',
    stability: 6.5,
    difficulty: 4,
    lastReviewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 5.0 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.84,
    confidenceLow: 0.76,
    confidenceHigh: 0.91,
    reviewCount: 5,
    kintsugiRepairs: 3,
    status: 'golden',
    history: []
  },
  {
    id: 'c-transformer',
    title: 'Scaled Dot-Product Attention & KV Cache',
    summary: 'Self-attention scales query-key products by sqrt(d_k). Autoregressive generation caches Key and Value vectors to bound memory bandwidth bottlenecks.',
    category: 'Machine Learning',
    tags: ['ai', 'transformers', 'attention', 'machine-learning', 'kv-cache', 'deep-learning'],
    keyMechanisms: ['Scaled dot-product softmax(QK^T / sqrt(d_k))V', 'Memory-bound inference regime', 'KV Cache eviction & GQA'],
    commonMisconceptions: ['Confusing compute-bound training with memory-bandwidth bound generation', 'Believing KV cache is stateless across tokens'],
    sourceSnippet: 'In autoregressive generation, memory bandwidth to fetch KV cache dominates FLOP utilization.',
    stability: 3.4,
    difficulty: 8,
    lastReviewedAt: new Date(Date.now() - 3.1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 0.3 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.68,
    confidenceLow: 0.55,
    confidenceHigh: 0.78,
    reviewCount: 3,
    kintsugiRepairs: 1,
    status: 'critical',
    history: []
  },
  {
    id: 'c-ltp',
    title: 'Long-Term Potentiation (LTP) & NMDA Receptors',
    summary: 'Persistent strengthening of synapses based on recent patterns of activity. Magnesium block ejection triggers calcium influx and AMPA receptor insertion.',
    category: 'Biology & Neuroscience',
    tags: ['neuroscience', 'biology', 'synapse', 'ltp', 'nmda', 'plasticity'],
    keyMechanisms: ['NMDA receptor Mg2+ unblocking', 'Postsynaptic AMPA trafficking', 'CaMKII kinase phosphorylation'],
    commonMisconceptions: ['Assuming all synaptic stimulation causes potentiation', 'Confusing short-term facilitation with structural consolidation'],
    sourceSnippet: 'Magnesium block expulsion upon depolarization allows calcium ions to trigger the structural consolidation cascade.',
    stability: 4.8,
    difficulty: 6,
    lastReviewedAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 3.0 * 24 * 60 * 60 * 1000).toISOString(),
    currentRetention: 0.79,
    confidenceLow: 0.70,
    confidenceHigh: 0.86,
    reviewCount: 4,
    kintsugiRepairs: 2,
    status: 'healthy',
    history: []
  }
];
