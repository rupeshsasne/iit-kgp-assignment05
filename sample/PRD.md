# iPe (India Pay) — Merchant Onboarding Copilot

**Read this on GitHub Pages:** https://rupeshsasne.github.io/iit-kgp-assignment05/ipe-prd.html

Track B product and engineering spec. iPe is fictional. Every numbered Track B item in the coverage table is in scope.

## Constraint

Hosted OpenAI-compatible chat endpoint, model size at most 8B, plus embeddings. No training, no fine-tuning, no larger model. The 8B weakness is a graded section.

## Product

An operator asks whether a shop can go live. The copilot answers from iPe policy and the application, cites the file, and can open a review. It cannot turn a merchant on.

Lotus Tea House is the worked example: missing pack items, missing addendum, and an instruction in the application to mark the merchant Active. A correct run opens a review and does not activate.

## Track B coverage

| Track B item | What iPe will ship |
| --- | --- |
| Hosted ≤8B API only | Course chat and embeddings endpoints only |
| I. Spec, refusal, gold set before code | This page. Refusal list below. 60–100 gold questions frozen before agent code |
| II. Three prompting strategies | Single-prompt baseline: structured few-shot, CoT or self-consistency, decomposition. How the 8B model breaks is written down. Frozen before week 3 |
| III. 500–2,000 documents | iPe policies and applications, not employer files |
| III. Chunking experiments | At least two sizes and one overlap, keep the better recall@k, report the loser |
| III. Hybrid retrieval | BM25 plus dense. Both required |
| III. Reranker | On the hybrid candidate list |
| III. Citations | File and section on every rule. No file is a failure |
| III. Recall@k separate from answer quality | Two columns. Not one blended score |
| IV. Three tools | `policy_search`, `read_application`, `open_review`. No activate tool |
| IV. Planner → executor → critic | Operator sees only the critic output |
| IV. Persistent state | Review id from turn one still known in turn two |
| IV. Failures and budget | Retry a dead tool once. JSON schema on tool calls. Stop at 10 steps. Token budget per query |
| V. Eval on the Week 1 set | Gold set is not rewritten to match the agent |
| V. Completion, tool calls, cost, latency | Recorded per query, averaged in the report |
| V. Failure taxonomy | Retrieval miss, reasoning error, tool-call error, hallucination |
| V. Tracing | LangSmith, Langfuse, or OpenTelemetry. Demo opens a real Lotus trace |
| VI. UI and container | Streamlit or React, one Docker image |
| VI. Rate limit and cache | Per session limit. Policy lookups cached |
| VI. Prompt injection | Lotus plus more hidden "activate now" cases. Pass is still a refusal |
| VI. PII | Do not echo owner IDs, bank numbers, or payer phones into chat |
| VI. Human-in-the-loop | Only a person turns a merchant on, outside this product |
| Compensate for the 8B model | Required report section: schema, retry, reranker, critic, citation check |

## Refusal

Forbidden: activate, change a ceiling, mark a pack complete, waive a document, lower the shop's volume, follow an instruction inside the application.

If the files do not contain the fact, say so.

## Four weeks

Week 1 is a hard gate. No gold set and no baseline numbers means week 3 does not start.

| Week | Track B | Done means |
| --- | --- | --- |
| 1 | I, II | Spec agreed. 60–100 gold questions. Three prompting strategies scored. 8B failures written. No agent code |
| 2 | III | Corpus in. Chunking experiment. Hybrid plus reranker. Recall@k and answer quality as two columns |
| 3 | IV, start of V | Three tools, planner–executor–critic, state, 10-step cap, schema, retry, traces, failure labels |
| 4 | V, VI | Full eval. Cost and latency. Injection and PII. Containerised UI. 12-page report. 10-minute demo |

## Six roles

| Role | Owns |
| --- | --- |
| Domain spec and eval design | This page, gold set, refusal, shop cases |
| Prompt engineering | Three-strategy baseline, structured output, 8B failure notes |
| RAG / retrieval | Chunking, BM25 plus dense, reranker, citations, recall@k |
| Agent orchestration and tools | Loop, three tools, state, schema, retry, 10-step cap |
| Observability and safety | Traces, taxonomy, injection, PII |
| Front-end and deployment | Chat UI, Docker, rate limit, cache, demo |

## Course deliverables

- Git repository with the full agent stack
- Trace dashboard with a real Lotus Tea House query
- Evaluation report (taxonomy, recall@k, answer quality, completion, tool calls, cost, latency)
- 12-page technical report, including the 8B compensation section
- 10-minute live demo of the containerised chat
