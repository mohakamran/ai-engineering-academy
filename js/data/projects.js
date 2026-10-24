/* Project gallery. `flow` is a column-based architecture spec rendered by
   AIEA.diagrams.flow(): cols = [[node…]…], node = [id, label, sublabel, tone].
   `edges` = ['a>b', 'b>c', 'x~>y' (dashed)]; omitted → connect adjacent columns fully. */
window.AIEA = window.AIEA || {};
AIEA.data = AIEA.data || {};

AIEA.data.projects = [
  {
    id: 'p01', num: 1, title: 'Python AI Text Utility', difficulty: 'Beginner', duration: '6–10 hours',
    tech: ['Python', 'Pydantic', 'pytest', 'argparse'], prereqs: ['m01'],
    summary: 'A command-line tool and small library that validates user-submitted text and reports statistics, keywords and readability.',
    features: ['Validate input (length, encoding, empty) with Pydantic', 'Word, sentence and character statistics', 'Top keywords with stop-word filtering', 'Readability score', 'JSON and human-readable output modes'],
    architecture: 'A pure-Python core library (validation + analysis functions) wrapped by a thin CLI. No network calls — everything is deterministic and unit-testable.',
    flow: { cols: [[['in', 'Text input', 'CLI / file', 'cyan']], [['val', 'Validator', 'Pydantic model', 'violet']], [['an', 'Analyzer', 'stats · keywords', 'blue'], ['rd', 'Readability', 'score', 'blue']], [['out', 'Report', 'JSON / table', 'green']]] },
    milestones: [['Project scaffold', 'pyproject, src layout, virtual env, Ruff'], ['Validation model', 'Pydantic model with clear errors'], ['Analysis functions', 'Stats, keywords, readability'], ['CLI + output formats', 'argparse with --json flag'], ['Test suite', '≥ 90% coverage of core functions']],
    acceptance: ['Invalid input produces a helpful error and non-zero exit code', 'Analysis results are correct on a fixed sample corpus', 'All tests pass with one command', 'README explains install and usage'],
    testing: 'Parametrised pytest cases for edge inputs (empty, unicode, very long text); golden-file test for JSON output.',
    deployment: 'Installable package (pip install -e .) with a console entry point.',
    extensions: ['Add an optional LLM summary behind a feature flag', 'Language detection', 'Publish to TestPyPI'],
    prototype: ['Single script', 'Manual testing'], production: ['Typed package with tests', 'Validated inputs and clear errors', 'Versioned releases']
  },
  {
    id: 'p02', num: 2, title: 'LLM-Powered Chatbot', difficulty: 'Beginner', duration: '8–12 hours',
    tech: ['Python', 'Model API SDK', 'FastAPI or CLI', 'Streaming'], prereqs: ['m01', 'm05'],
    summary: 'A chatbot that streams responses, remembers conversation history within a token budget and handles API errors gracefully.',
    features: ['Streaming token output', 'System prompt with clear role and rules', 'Conversation history trimmed to a token budget', 'Timeouts, retries and friendly error messages', 'Usage logging (tokens per turn)'],
    architecture: 'A client (terminal or minimal web page) talks to a small backend that owns the API key, builds the message list, calls the model with streaming and logs usage.',
    flow: { cols: [[['ui', 'Chat UI', 'terminal / web', 'cyan']], [['api', 'Backend', 'holds API key', 'blue']], [['hist', 'History manager', 'token budget', 'violet'], ['llm', 'Model API', 'streaming', 'amber']], [['log', 'Usage log', 'tokens · latency', 'green']]], edges: ['ui>api', 'api>hist', 'api>llm', 'llm>log', 'hist~>llm'] },
    milestones: [['First API call', 'Key from environment, simple completion'], ['Streaming', 'Print tokens as they arrive'], ['History + budget', 'Trim oldest turns over budget'], ['Error handling', 'Timeouts, retries, user-friendly errors'], ['Usage logging', 'Tokens and latency per turn']],
    acceptance: ['API key never appears in client code or logs', 'Long conversations do not exceed the context budget', 'Network failure produces a clear message, not a crash', 'Streaming visibly reduces time-to-first-token'],
    testing: 'Unit tests with a fake streaming client; manual test plan for disconnects and long chats.',
    deployment: 'Run locally; optional container with the key injected at runtime.',
    extensions: ['Switch providers behind an interface', 'Summarise old history instead of dropping it', 'Add a simple web UI with server-sent events'],
    prototype: ['Hard-coded prompt', 'No error handling'], production: ['Server-side key management', 'Token budgeting and retries', 'Usage metrics']
  },
  {
    id: 'p03', num: 3, title: 'Structured-Output Extraction API', difficulty: 'Intermediate', duration: '12–18 hours',
    tech: ['FastAPI', 'Pydantic', 'Structured outputs', 'pytest'], prereqs: ['m02', 'm06'],
    summary: 'An API that turns free text (job posts, invoices, emails) into validated JSON with confidence handling and retries.',
    features: ['POST /extract with input text and document type', 'Schema-constrained model output', 'Pydantic validation with one repair retry', 'Null for missing fields — no guessing', 'Labelled test set with field-level accuracy'],
    architecture: 'FastAPI validates the request, a prompt builder selects schema and instructions, the model returns schema-constrained JSON, Pydantic validates, and failures trigger a single repair attempt before a 422.',
    flow: { cols: [[['c', 'Client', 'POST /extract', 'cyan']], [['api', 'FastAPI', 'auth · validation', 'blue']], [['pb', 'Prompt builder', 'schema + rules', 'violet']], [['llm', 'Model API', 'JSON schema mode', 'amber']], [['v', 'Validator', 'Pydantic', 'green'], ['r', 'Repair retry', 'on error', 'rose']]], edges: ['c>api', 'api>pb', 'pb>llm', 'llm>v', 'v~>r', 'r~>llm'] },
    milestones: [['Schema design', 'Pydantic models for 2 document types'], ['Endpoint', 'FastAPI route with request validation'], ['Model integration', 'Schema-constrained output'], ['Validation + repair', 'One retry with error feedback'], ['Evaluation', '30 labelled examples, field-level accuracy']],
    acceptance: ['Responses always validate against the schema or return a clear 422', 'Missing information returns null, not invented values', 'Field accuracy reported on the test set', 'Prompt-injection text in input does not change the schema'],
    testing: 'Unit tests with fake model responses (valid, invalid, malicious); eval script over the labelled set.',
    deployment: 'Container with health check; key via environment.',
    extensions: ['Batch endpoint with background jobs', 'Per-field confidence', 'Human review queue for low-confidence results'],
    prototype: ['Regex-parsing model text'], production: ['Schema-constrained output + validation', 'Repair strategy and metrics', 'Labelled evaluation set']
  },
  {
    id: 'p04', num: 4, title: 'PDF Question-Answering System', difficulty: 'Intermediate', duration: '18–25 hours',
    tech: ['PyMuPDF', 'Embeddings', 'pgvector', 'FastAPI', 'Model API'], prereqs: ['m07', 'm08'],
    summary: 'Upload PDFs and ask questions; answers cite page numbers and abstain when the documents do not contain the answer.',
    features: ['PDF upload with size/type checks', 'Parsing with page tracking', 'Structure-aware chunking', 'Vector retrieval with page metadata', 'Answers with [page] citations and “not found” abstention'],
    architecture: 'An ingestion worker parses, chunks and embeds PDFs into Postgres + pgvector; the query API retrieves top chunks, assembles cited context and generates a grounded answer.',
    flow: { cols: [[['up', 'Upload', 'PDF', 'cyan'], ['q', 'Question', 'user', 'cyan']], [['ing', 'Parse + chunk', 'PyMuPDF · page meta', 'blue'], ['ret', 'Retriever', 'embed query · top-k', 'blue']], [['db', 'pgvector', 'chunks + vectors', 'violet']], [['gen', 'Generator', 'cited answer', 'green']]], edges: ['up>ing', 'ing>db', 'q>ret', 'ret>db', 'db>gen'] },
    milestones: [['Ingestion', 'Parse PDFs, keep page numbers'], ['Chunk + embed', 'Store in pgvector with metadata'], ['Retrieval', 'Top-k search endpoint'], ['Grounded answers', 'Citations + abstention'], ['Evaluation', '25 questions with expected pages']],
    acceptance: ['Every answer cites at least one valid page', 'Questions outside the documents return an explicit “not found”', 'Recall@5 measured on the question set', 'Uploading a non-PDF is rejected safely'],
    testing: 'Ingestion unit tests on sample PDFs; retrieval recall tests; answer eval with groundedness checks.',
    deployment: 'Docker Compose (API + Postgres); then a managed container platform.',
    extensions: ['OCR for scanned PDFs', 'Hybrid search', 'Highlight cited passages in a PDF viewer'],
    prototype: ['All text in one prompt'], production: ['Indexed retrieval with citations', 'Abstention + eval set', 'Safe upload handling']
  },
  {
    id: 'p05', num: 5, title: 'RAG Knowledge Assistant', difficulty: 'Intermediate', duration: '25–35 hours',
    tech: ['Hybrid search', 'Reranker', 'pgvector', 'FastAPI', 'Ragas'], prereqs: ['m08', 'm11'],
    summary: 'A team knowledge assistant over Markdown/HTML docs with hybrid retrieval, reranking, citations and a measured evaluation baseline.',
    features: ['Incremental ingestion with document versions', 'Hybrid BM25 + vector retrieval', 'Cross-encoder reranking', 'Query rewriting for follow-ups', 'Retrieval + answer evaluation dashboard'],
    architecture: 'Two pipelines: incremental ingestion keyed by content hash, and an online query path (rewrite → hybrid retrieve → rerank → assemble → generate) with every step traced.',
    flow: { cols: [[['q', 'Query', 'with chat history', 'cyan']], [['rw', 'Rewrite', 'standalone query', 'violet']], [['bm', 'BM25', 'keyword', 'blue'], ['vec', 'Vector', 'semantic', 'blue']], [['rr', 'Rerank', 'cross-encoder', 'violet']], [['gen', 'Generate', 'cited answer', 'amber'], ['ev', 'Eval + traces', 'quality', 'green']]], edges: ['q>rw', 'rw>bm', 'rw>vec', 'bm>rr', 'vec>rr', 'rr>gen', 'gen~>ev'] },
    milestones: [['Incremental ingestion', 'Hash-based updates and deletes'], ['Hybrid retrieval', 'BM25 + vector with RRF'], ['Reranking', 'Top-30 → top-5'], ['Conversation support', 'Query rewriting'], ['Evaluation baseline', 'Recall, correctness, groundedness']],
    acceptance: ['Edited and deleted documents are reflected in answers', 'Hybrid + rerank beats vector-only on the eval set (measured)', 'Each answer stores retrieved chunk IDs in traces', 'Evaluation runs with one command'],
    testing: 'Retrieval regression tests; eval suite comparing configurations; ingestion idempotency tests.',
    deployment: 'Containerised API + worker; scheduled re-index job.',
    extensions: ['Contextual chunk headers', 'Feedback buttons feeding the eval set', 'Slack/Teams integration'],
    prototype: ['Vector-only search, no evaluation'], production: ['Hybrid + rerank with traces', 'Versioned ingestion', 'Measured quality baseline']
  },
  {
    id: 'p06', num: 6, title: 'Semantic Search Engine', difficulty: 'Intermediate', duration: '12–18 hours',
    tech: ['Embeddings', 'pgvector or Chroma', 'FastAPI', 'BM25'], prereqs: ['m07'],
    summary: 'A search API over a small collection (articles, products or FAQs) comparing vector, keyword and hybrid relevance.',
    features: ['Batch embedding with caching', 'Metadata filters (category, date)', 'Vector, keyword and hybrid modes', 'Relevance evaluation on labelled queries', 'Simple search UI'],
    architecture: 'Offline indexing job embeds items into the vector store; the search API embeds the query, applies filters and fuses rankings for hybrid mode.',
    flow: { cols: [[['docs', 'Collection', 'items + metadata', 'cyan'], ['q', 'Query', 'text + filters', 'cyan']], [['emb', 'Embedder', 'same model', 'violet'], ['tok', 'Analyzer', 'BM25 terms', 'violet']], [['vs', 'Vector store', 'filters', 'blue'], ['kw', 'Keyword index', 'BM25', 'blue']], [['fuse', 'Fusion', 'RRF', 'green']]], edges: ['docs>emb', 'docs>tok', 'q>emb', 'q>tok', 'emb>vs', 'tok>kw', 'vs>fuse', 'kw>fuse'] },
    milestones: [['Dataset + labels', '200 items, 20 labelled queries'], ['Indexing', 'Embed and store with metadata'], ['Search modes', 'Vector, keyword, hybrid'], ['Evaluation', 'Recall@5 and MRR per mode'], ['UI', 'Search page with filters']],
    acceptance: ['Filters restrict results correctly', 'Metrics reported for all three modes', 'Embeddings are not recomputed for unchanged items'],
    testing: 'Unit tests for fusion and filters; offline relevance evaluation.',
    deployment: 'Container + managed Postgres with pgvector.',
    extensions: ['Reranking', 'Query autocomplete', 'Multilingual embeddings'],
    prototype: ['Linear scan in memory'], production: ['Indexed, filterable, evaluated search']
  },
  {
    id: 'p07', num: 7, title: 'AI Customer Support Assistant', difficulty: 'Advanced', duration: '30–40 hours',
    tech: ['RAG', 'Tool calling', 'FastAPI', 'Postgres', 'Guardrails'], prereqs: ['m08', 'm09', 'm13'],
    summary: 'A support assistant that answers from help-centre content, looks up orders via read-only tools and escalates to humans.',
    features: ['Intent routing (FAQ, order status, complaint)', 'RAG over help articles with citations', 'Read-only order lookup tool scoped to the authenticated customer', 'Escalation with conversation summary', 'PII redaction in logs'],
    architecture: 'A router classifies each message; FAQ intents go to RAG, order intents to a scoped tool, sensitive or low-confidence cases to a human queue. All steps are traced.',
    flow: { cols: [[['u', 'Customer', 'authenticated', 'cyan']], [['rt', 'Router', 'intent', 'violet']], [['rag', 'RAG', 'help centre', 'blue'], ['tool', 'Order tool', 'read-only, scoped', 'amber'], ['esc', 'Escalate', 'human queue', 'rose']], [['ans', 'Response', 'cited · redacted logs', 'green']]], edges: ['u>rt', 'rt>rag', 'rt>tool', 'rt>esc', 'rag>ans', 'tool>ans'] },
    milestones: [['Intent router', 'Classification with eval set'], ['Help-centre RAG', 'Cited answers'], ['Scoped order tool', 'Customer can only see own orders'], ['Escalation', 'Summary handed to human'], ['Safety & logging', 'PII redaction, injection tests']],
    acceptance: ['A customer can never retrieve another customer’s order', 'Unanswerable questions escalate rather than guess', 'Routing accuracy measured', 'Logs contain no raw emails/phone numbers'],
    testing: 'Authorization tests, adversarial prompts, routing eval, end-to-end conversation tests.',
    deployment: 'Container behind auth; staging environment with synthetic data.',
    extensions: ['Refund tool with human approval', 'CSAT feedback loop', 'Multilingual support'],
    prototype: ['Single prompt with all FAQs'], production: ['Routing + scoped tools + escalation', 'Isolation tests and redaction']
  },
  {
    id: 'p08', num: 8, title: 'Tool-Using AI Agent', difficulty: 'Intermediate', duration: '15–25 hours',
    tech: ['Tool calling', 'Pydantic', 'Tracing'], prereqs: ['m09'],
    summary: 'A bounded agent with a handful of tools — search, calculator, file reader, draft writer — and strict limits on what it can do.',
    features: ['3–4 narrowly scoped tools with schemas', 'Argument validation and timeouts', 'Iteration and cost caps', 'Approval required for write actions', 'Full step-by-step trace'],
    architecture: 'A loop sends state to the model, validates any tool call against an allow-list and schema, executes with timeouts, appends results and stops on answer, cap or approval-pending.',
    flow: { cols: [[['goal', 'Goal', 'user task', 'cyan']], [['llm', 'Model', 'decide next step', 'violet']], [['guard', 'Guard', 'allow-list · schema', 'rose']], [['tools', 'Tools', 'search · calc · read', 'blue'], ['appr', 'Approval', 'write actions', 'amber']], [['trace', 'Trace store', 'every step', 'green']]], edges: ['goal>llm', 'llm>guard', 'guard>tools', 'guard>appr', 'tools~>llm', 'tools>trace'] },
    milestones: [['Tool definitions', 'Schemas and fake implementations'], ['Agent loop', 'Call → execute → return'], ['Guards', 'Validation, caps, timeouts'], ['Approval gate', 'Pause on write tools'], ['Traces + evals', '15 tasks with success criteria']],
    acceptance: ['Agent stops at the iteration cap', 'Invalid tool arguments never reach tool code', 'Write actions never execute without approval', 'Task success rate measured'],
    testing: 'Scripted fake-model tests for each branch; task-level evals with real model.',
    deployment: 'Local service; optional container.',
    extensions: ['MCP server for tools', 'Parallel tool calls', 'Memory of past tasks'],
    prototype: ['Unbounded loop with broad tools'], production: ['Least-privilege tools, caps, approvals, traces']
  },
  {
    id: 'p09', num: 9, title: 'Multi-Step Workflow with LangGraph', difficulty: 'Advanced', duration: '20–30 hours',
    tech: ['LangGraph', 'Checkpointer', 'FastAPI', 'Postgres'], prereqs: ['m10'],
    summary: 'A research → draft → review → approve → publish workflow with typed state, conditional loops and human approval.',
    features: ['Typed graph state', 'Conditional edge for revise-or-continue', 'Persistent checkpoints per thread', 'Human approval interrupt before publish', 'Streaming progress to the UI'],
    architecture: 'A LangGraph graph with explicit nodes, a reviewer that routes back to drafting when quality is low, and an interrupt before publishing. State is checkpointed in Postgres.',
    flow: { cols: [[['in', 'Request', 'topic', 'cyan']], [['res', 'Research', 'retrieve sources', 'blue']], [['draft', 'Draft', 'write', 'violet']], [['rev', 'Review', 'score', 'amber']], [['hitl', 'Approval', 'interrupt', 'rose']], [['pub', 'Publish', 'output', 'green']]], edges: ['in>res', 'res>draft', 'draft>rev', 'rev~>draft', 'rev>hitl', 'hitl>pub'] },
    milestones: [['State + nodes', 'Typed state, 4 nodes'], ['Conditional routing', 'Revise loop with max revisions'], ['Persistence', 'Checkpointer with thread IDs'], ['Approval', 'Interrupt + resume API'], ['Streaming + tests', 'Node unit tests, streamed updates']],
    acceptance: ['Workflow resumes after a server restart', 'Revision loop stops at the configured maximum', 'Publishing never occurs without approval', 'Each node is unit-tested in isolation'],
    testing: 'Node-level unit tests, graph integration tests with fake model, interrupt/resume tests.',
    deployment: 'Container + Postgres checkpointer.',
    extensions: ['Parallel research branches', 'Reviewer calibrated against human scores', 'Time-travel debugging UI'],
    prototype: ['In-memory, no approval'], production: ['Persistent, resumable, approved, tested']
  },
  {
    id: 'p10', num: 10, title: 'AI Evaluation and Monitoring Dashboard', difficulty: 'Advanced', duration: '20–30 hours',
    tech: ['pytest', 'Ragas or Inspect', 'GitHub Actions', 'OpenTelemetry'], prereqs: ['m11', 'm12'],
    summary: 'An evaluation harness and dashboard that tracks quality, latency and cost across prompt and model versions.',
    features: ['Versioned eval dataset', 'Metrics: correctness, groundedness, recall, latency, cost', 'Calibrated LLM judge', 'CI job with regression thresholds', 'Dashboard of runs over time'],
    architecture: 'An eval runner executes the app against the dataset, scores with deterministic checks and a calibrated judge, stores results, and a dashboard compares runs. CI blocks regressions.',
    flow: { cols: [[['ds', 'Eval dataset', 'versioned JSONL', 'cyan']], [['run', 'Runner', 'app under test', 'blue']], [['det', 'Deterministic checks', 'schema · citations', 'green'], ['judge', 'LLM judge', 'rubric · calibrated', 'violet']], [['store', 'Results store', 'per run', 'amber']], [['dash', 'Dashboard', 'diffs · trends', 'cyan'], ['ci', 'CI gate', 'thresholds', 'rose']]] },
    milestones: [['Dataset', '50+ cases with references'], ['Runner + metrics', 'Deterministic and judge scores'], ['Judge calibration', 'Agreement with 30 human labels'], ['CI gate', 'Fail on regression'], ['Dashboard', 'Trends and flipped cases']],
    acceptance: ['Judge agreement with humans reported', 'CI fails when correctness drops beyond threshold', 'Dashboard shows per-case diffs between runs', 'Cost and p95 latency tracked per run'],
    testing: 'Tests for scorers; a deliberately degraded prompt must fail CI.',
    deployment: 'CI workflow + static or containerised dashboard.',
    extensions: ['Sample production traces into evals', 'Statistical significance for comparisons', 'Alerting on online quality signals'],
    prototype: ['Eyeballing outputs'], production: ['Automated, calibrated, gated evaluation']
  },
  {
    id: 'p11', num: 11, title: 'Secure Multi-User AI Knowledge Platform', difficulty: 'Advanced', duration: '35–50 hours',
    tech: ['Auth', 'Tenant isolation', 'pgvector', 'Audit logs', 'Rate limiting'], prereqs: ['m08', 'm12', 'm13'],
    summary: 'A multi-tenant document assistant with authentication, per-tenant isolation, secure uploads, audit logging and deletion.',
    features: ['User auth and roles', 'Tenant-scoped retrieval filters', 'Secure upload pipeline (type, size, scanning)', 'Audit log of queries and document access', 'Rate limits and per-tenant cost caps', 'Full data deletion'],
    architecture: 'Every request is authenticated; tenant ID flows from the token into every query and retrieval filter. Uploads go through a quarantine step. Audit and usage events are written separately.',
    flow: { cols: [[['u', 'User', 'tenant A / B', 'cyan']], [['auth', 'Auth + rate limit', 'JWT · quotas', 'rose']], [['up', 'Upload quarantine', 'validate · scan', 'amber'], ['qa', 'Query service', 'tenant filter', 'blue']], [['db', 'pgvector', 'tenant_id on every row', 'green'], ['audit', 'Audit log', 'append-only', 'violet']]], edges: ['u>auth', 'auth>up', 'auth>qa', 'up>db', 'qa>db', 'qa>audit', 'up>audit'] },
    milestones: [['Auth + roles', 'Login, tokens, role checks'], ['Tenant isolation', 'Filters + leak tests'], ['Secure upload', 'Validation and quarantine'], ['Audit + limits', 'Audit events, rate limits, cost caps'], ['Deletion', 'Cascade across DB, files, vectors']],
    acceptance: ['Automated tests prove no cross-tenant retrieval', 'Malicious/oversized uploads are rejected', 'Every document access is audited', 'Deleting a tenant removes all derived data'],
    testing: 'Security test suite (isolation, injection, upload abuse), load test for rate limits.',
    deployment: 'Staging + production environments with separate keys and databases.',
    extensions: ['SSO', 'Per-document ACLs', 'Customer-managed encryption keys'],
    prototype: ['Single user, shared index'], production: ['Isolated, audited, rate-limited, deletable']
  },
  {
    id: 'p12', num: 12, title: 'Full-Stack AI Learning Application', difficulty: 'Advanced', duration: '50–80 hours',
    tech: ['TypeScript frontend', 'FastAPI', 'Postgres + pgvector', 'Model APIs', 'Docker', 'GitHub Actions'], prereqs: ['m15'],
    summary: 'Capstone: a deployed learning app that answers questions over course material, generates quizzes and tracks progress.',
    features: ['Auth and user progress', 'RAG tutor with citations', 'Quiz generation with validated structured output', 'Evaluation suite and monitoring', 'CI/CD to a public URL', 'README, diagram and demo video'],
    architecture: 'A TypeScript frontend calls a FastAPI backend; the backend orchestrates RAG and structured generation, stores progress in Postgres, and emits traces and cost metrics.',
    flow: { cols: [[['fe', 'Frontend', 'TypeScript', 'cyan']], [['api', 'FastAPI', 'auth · validation', 'blue']], [['rag', 'RAG tutor', 'cited answers', 'violet'], ['quiz', 'Quiz generator', 'structured output', 'violet']], [['db', 'Postgres + pgvector', 'content · progress', 'green'], ['obs', 'Observability', 'traces · cost · evals', 'amber']]], edges: ['fe>api', 'api>rag', 'api>quiz', 'rag>db', 'quiz>db', 'rag~>obs', 'quiz~>obs'] },
    milestones: [['Requirements + architecture', 'Problem, scope, diagram'], ['Backend + data model', 'Auth, progress, ingestion'], ['AI features', 'RAG tutor and quiz generator'], ['Evaluation + security', 'Eval set, isolation, validation'], ['Deploy + monitor', 'CI/CD, traces, cost'], ['Portfolio polish', 'README, demo, limitations']],
    acceptance: ['Publicly deployed with authentication', 'Evaluation results documented in README', 'Generated quizzes always validate against schema', 'Limitations and trade-offs documented honestly'],
    testing: 'Unit, integration, end-to-end and evaluation suites run in CI.',
    deployment: 'Containerised services on a cloud platform with staging and production.',
    extensions: ['Spaced-repetition scheduling', 'Voice mode', 'Instructor analytics'],
    prototype: ['Local demo'], production: ['Deployed, evaluated, monitored, documented']
  }
];

AIEA.data.projectById = Object.fromEntries(AIEA.data.projects.map(p => [p.id, p]));
