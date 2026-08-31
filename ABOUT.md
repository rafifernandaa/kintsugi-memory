# Kintsugi Memory: Project Story

## About the Project

Kintsugi Memory is an active retrieval and memory augmentation platform powered by Google Gemini 3.5 Flash, Vertex AI, and Google Cloud Platform. 

Named after the Japanese art of *Kintsugi*—where broken pottery is mended with gold lacquer to make fractures resilient and beautiful—the system reframes forgetting as an essential neuroplastic opportunity. By combining Bayesian Free Spaced Repetition Scheduling (FSRS), interactive D3.js synaptic knowledge topologies, multimodal Socratic dialogue, and an asynchronous forgetting-cliff governor on Google Cloud Pub/Sub, Kintsugi Memory identifies conceptual decay and intervenes at the exact point of forgetting.

---

## Inspiration

Traditional study methods suffer from the **Illusion of Competence**: passive re-reading and highlighting create a false sense of mastery that collapses under pressure.

Cognitive psychology and neuroscience demonstrate two core principles:
1. **The Testing Effect**: Durable synaptic connections are forged through effortful active retrieval against resistance, not passive exposure.
2. **Consolidation Through Failure**: Mending a misconception right as recall drops to the critical threshold reorganizes neural circuits and flattens subsequent forgetting curves.

We designed Kintsugi Memory to replace rigid multiple-choice flashcards with an intelligent, multimodal Socratic partner that pinpoints cognitive fractures and repairs them through guided reasoning.

---

## Mathematical Foundation

Kintsugi Memory models cognitive decay using a power-law retention equation parameterized by Stability ($S$) and intrinsic Difficulty ($D$):

### 1. Recall Probability $R(t)$

$$R(t) = \left( 1 + F \cdot \frac{t}{S} \right)^{-w}$$

Where:
- $t$: Elapsed time in days since last retrieval.
- $S \in (0, \infty)$: Stability (days required for recall probability to drop to the critical threshold $R = 70\%$).
- $D \in [1, 10]$: Intrinsic cognitive complexity of the subject matter.
- $F = \frac{19}{81}$ and $w = 0.5$: Power-law decay shape constants.

### 2. Bayesian Stability Multiplication

When a learner completes a Socratic retrieval session, the Cognitive Evaluator Agent scores performance ($\sigma \in [0, 100]$) and updates stability non-linearly:

$$S' = S \cdot \left( 1 + C(D) \cdot \left(\frac{\sigma}{100}\right)^\gamma \cdot e^{-k \cdot R(t)} \right)$$

Successful retrieval at low retention $R(t)$ produces a substantial stability multiplier (the Golden Kintsugi Mend), consolidating long-term retention.

---

## How We Built It

Kintsugi Memory is built as a cloud-native reactive system on Google Cloud Platform:

```
[User Ingestion] -> [Scribe Agent: Gemini 3.5 Flash] -> [Bayesian FSRS Engine]
                                                              │
                    ┌─────────────────────────────────────────┴─────────────────────────────────────────┐
                    ▼                                                                                   ▼
      [D3.js Synaptic Topology]                                                           [Autonomous Cliff Governor]
   (Force-Directed Semantic Graph)                                                        (Cloud Pub/Sub Event Bus)
                    │                                                                                   │
                    └─────────────────────────────────────────┬─────────────────────────────────────────┘
                                                              ▼
                                            [Socratic Retrieval Chamber]
                                             (Voice / Multimodal Input)
                                                              │
                                                              ▼
                                                [Cognitive Evaluator Agent]
                                                (Stability Boost & Golden Seam)
```

1. **Autonomous Multimodal Agents (Google Gemini 3.5 Flash via Vertex AI)**:
   - **Scribe Agent**: Decomposes PDFs, audio, code, and notes into structured conceptual units.
   - **Socratic Interviewer Agent**: Synthesizes adaptive probing questions to challenge mental boundaries.
   - **Cognitive Evaluator Agent**: Evaluates spoken or typed arguments against diagnostic rubrics.
   - **Autonomous Cliff Agent**: Analyzes decay vectors to generate daily intervention blueprints.
2. **Interactive Synaptic Topology (D3.js)**:
   - Visualizes concepts as an interactive force-directed graph with dynamic clustering, charge repulsion, and visual indicators for mended nodes and forgetting risks.
3. **Asynchronous Forgetting-Cliff Governor (Google Cloud Pub/Sub)**:
   - Runs background daemons on topic `kintsugi-cliff-pings` and subscription `kintsugi-cliff-pings-sub` to deliver proactive email and in-app alerts before biological forgetting occurs.
4. **Algorithmic Audio Synthesis (Web Audio API)**:
   - Generates harmonic pentatonic frequencies (880 Hz, 1320 Hz, 1760 Hz) to provide acoustic reinforcement upon concept consolidation.

---

## Challenges We Faced

- **Bayesian Parameter Calibration**: Converting qualitative Socratic dialogue into continuous mathematical parameters ($S$ and $D$) without relying on crude 1-to-4 button clicks.
- **D3 Graph Performance**: Resolving SVG event bubbling and hover feedback loops across dense node topologies using strict pointer-event boundaries.
- **Low-Latency Voice Pipeline**: Streamlining audio capture, transcription, and Gemini 3.5 Flash structured reasoning into seamless conversational turns.
- **Cloud Run Event Synchronization**: Guaranteeing idempotent Pub/Sub message delivery across container lifecycles without duplicate alerts.

---

## Accomplishments That We're Proud Of

- **Deep Socratic Guidance**: Built a conversational agent that guides users to solutions from first principles rather than providing answers directly.
- **Wabi-Sabi UI/UX**: Merged ceramic aesthetics with real-time telemetry to create an engaging visual memory garden.
- **Full Gemini 3.5 Flash Standardization**: Unified all prompt architectures and schema validations around Gemini 3.5 Flash.
- **Production GCP Deployment**: Shipped a containerized service deployed to Google Cloud Run with automated Cloud Build, Vertex AI, and Cloud Pub/Sub integration.

---

## What We Learned

- **Desirable Difficulty**: Making retrieval effortful is essential for neuroplastic reinforcement; passive review leads to rapid decay.
- **Structured LLM Orchestration**: High-reliability agent workflows require deterministic JSON schemas and dedicated task boundaries.
- **Event-Driven Architecture**: Designing asynchronous background pipelines on Cloud Pub/Sub decouples heavy compute from interactive user workflows.

---

## What's Next for Kintsugi Memory

- **Dynamic Novelty & Multi-Perspective Synthesis**: Continuously rotating question angles (analogies, debugger scenarios, counterfactuals) to prevent cognitive habituation across languages and STEM subjects.
- **Anti-Interference Neural Scheduling**: Graph-based semantic distance algorithms that decouple competing or phonetically confusable concepts across review sessions to protect nascent synaptic pathways.
- **Cross-Domain Synaptic Transference Bridges**: Discovering structural invariants and analogical links across disparate fields (e.g., biological homeostasis and feedback control loops) to foster deep conceptual transfer.
- **Age-Adaptive Cognitive Load Regulation**: Real-time response and hesitation calibration that adjusts Socratic temperature and scaffolding, keeping school students, university candidates, and lifelong adult learners in their optimal neuroplastic growth zone.
- **Mobile Auditory Companion**: Hands-free background voice dialogue on native mobile devices for low-friction daily retrieval during commutes.
