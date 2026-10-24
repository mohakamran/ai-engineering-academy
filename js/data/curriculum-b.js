/* Curriculum data, part B: modules 8–15. Same shape as part A. */
window.AIEA = window.AIEA || {};
AIEA.data = AIEA.data || {};
AIEA.data.modules = AIEA.data.modules || [];

AIEA.data.modules.push(
// ───────────────────────────────────────────── Module 8
{
  id: 'm08', num: 8, title: 'Retrieval-Augmented Generation (RAG)', short: 'RAG', stage: 6,
  icon: 'database', category: 'retrieval', difficulty: 'Intermediate', hours: 20, formats: ['reading', 'interactive', 'project'],
  prereqLevel: 'solid', deps: ['m07', 'm06'], projectId: 'p04',
  summary: 'Build systems that answer from your own documents: ingestion, chunking, retrieval, reranking, grounded generation with citations, and access control.',
  why: 'RAG is the most common production LLM pattern. Doing it well — not just “embed and pray” — is a core AI engineering skill.',
  outcomes: ['Design an ingestion pipeline for PDFs and text', 'Choose chunking and metadata strategies', 'Implement hybrid retrieval with reranking', 'Generate grounded answers with citations and safe abstention', 'Diagnose RAG failures systematically'],
  tech: ['pgvector', 'PyMuPDF', 'Rerankers', 'Embedding models', 'FastAPI'],
  diagram: 'ragPipeline',
  kit: { primary: 'anthropic-contextual', practical: 'claude-cookbooks', advanced: 'rag-paper' },
  resources: ['pgvector', 'pymupdf', 'unstructured', 'tesseract', 'cohere-rerank', 'lost-middle', 'sbert', 'pinecone-learn', 'openai-cookbook', 'ragas-docs'],
  project: { title: 'Document Q&A with citations', brief: 'Build a PDF question-answering app: upload, parse, chunk, embed, store with metadata, retrieve with hybrid search, answer with inline citations and refuse when the answer is not in the documents.', projectId: 'p04' },
  check: [
    { q: 'The right answer exists in your docs but the model says “not found”. First thing to check?', options: ['Model temperature', 'Whether retrieval returned the relevant chunk', 'The UI font', 'Token pricing'], answer: 1, why: 'Inspect retrieval first; generation cannot use what was not retrieved.' },
    { q: 'Why store document IDs and permissions as chunk metadata?', options: ['To improve embeddings', 'To filter retrieval by access rights and support updates/deletion', 'It is required by PDFs', 'To reduce token count'], answer: 1, why: 'Metadata enables access control, citations and lifecycle operations.' }
  ],
  topics: [
    ['Why RAG exists', 'Giving models current, private, citable knowledge.'],
    ['RAG architecture', 'Offline ingestion plus online retrieval and generation.'],
    ['Document ingestion', 'Collecting, tracking and versioning sources.'],
    ['PDF and text parsing', 'Extracting text, tables and structure reliably.'],
    ['OCR considerations', 'Handling scanned documents and images of text.'],
    ['Cleaning and normalization', 'Removing boilerplate, fixing encoding and whitespace.'],
    ['Chunking strategies', 'Fixed, recursive, semantic and structure-aware splitting.'],
    ['Chunk size and overlap', 'Balancing precision, context and cost.'],
    ['Metadata design', 'Source, section, dates, permissions and versions.'],
    ['Embedding generation', 'Batching, caching and re-embedding on model change.'],
    ['Vector storage', 'Choosing and operating the index.'],
    ['Keyword retrieval', 'BM25 for exact terms and identifiers.'],
    ['Hybrid retrieval', 'Fusing keyword and vector results.'],
    ['Reranking', 'Cross-encoders reorder candidates by true relevance.'],
    ['Query rewriting', 'Clarifying, expanding or decomposing user questions.'],
    ['Context assembly', 'Ordering, deduplicating and fitting chunks to a budget.'],
    ['Grounded generation', 'Instructing the model to answer only from context.'],
    ['Source citations', 'Linking each claim to a retrievable source.'],
    ['Handling missing information', 'Abstaining honestly when context is insufficient.'],
    ['Access control', 'Never retrieving what the user may not see.'],
    ['Document updates and deletion', 'Keeping the index consistent with sources.'],
    ['Retrieval evaluation', 'Recall@k, MRR and labelled query sets.'],
    ['Answer evaluation', 'Correctness, groundedness and citation accuracy.'],
    ['RAG failure analysis', 'Classifying failures by pipeline stage.']
  ],
  lessons: {
    1: {
      overview: 'RAG has two halves. Offline, documents are parsed, chunked, embedded and indexed with metadata. Online, a user query is (optionally) rewritten, used to retrieve candidate chunks, reranked, assembled into a context, and passed to a model that answers with citations.',
      why: 'Separating the halves lets you test and improve each stage independently — the key to debugging RAG.',
      prereqs: ['Semantic search', 'Clear task definitions'],
      objectives: ['Draw both pipelines end to end', 'Name the artefact each stage produces', 'Identify where to log and evaluate'],
      concepts: [['Ingestion pipeline', 'Source → parse → clean → chunk → embed → index.'], ['Query pipeline', 'Query → rewrite → retrieve → rerank → assemble → generate.'], ['Artefacts', 'Chunks, vectors, retrieved sets and answers can each be inspected.'], ['Traceability', 'Log retrieved chunk IDs with every answer.']],
      diagram: 'ragPipeline',
      exercise: { task: 'Build a minimal RAG in under 100 lines.', steps: ['Load 5 Markdown files and chunk by heading', 'Embed and store in memory', 'Retrieve top-4 by cosine', 'Prompt the model to answer only from the chunks and cite [doc#section]'] },
      resources: ['anthropic-contextual', 'claude-cookbooks', 'rag-paper'],
      quiz: { q: 'Which stage happens offline in a typical RAG system?', options: ['Reranking', 'Chunking and embedding documents', 'Answer generation', 'Query rewriting'], answer: 1, why: 'Documents are processed ahead of time; queries are handled online.' }
    },
    7: {
      overview: 'Chunk size sets how much text each retrievable unit contains; overlap repeats a margin between consecutive chunks so ideas split at a boundary still appear whole in one chunk.',
      why: 'Too small and chunks lose context; too large and they dilute relevance and waste tokens. The right setting depends on your documents and questions — measure it.',
      prereqs: ['Chunking strategies'],
      objectives: ['Explain the precision/context trade-off', 'Choose starting values and evaluate alternatives', 'Prefer structure-aware boundaries when available'],
      concepts: [['Small chunks', 'Precise matches, but answers may be split across chunks.'], ['Large chunks', 'More context per hit, but noisier embeddings and higher cost.'], ['Overlap', 'Typically a small fraction of chunk size; more overlap means more storage.'], ['Structure-aware', 'Split on headings, paragraphs, list items or code blocks first.']],
      diagram: 'chunking', demo: 'chunker',
      exercise: { task: 'Compare three chunk sizes on your eval set.', steps: ['Chunk at ~200, ~500 and ~1000 tokens with modest overlap', 'Run 20 labelled questions', 'Record recall@5 and answer correctness; pick the winner and explain why'] },
      resources: ['pinecone-learn', 'anthropic-contextual'],
      quiz: { q: 'Why add overlap between chunks?', options: ['To save storage', 'So information spanning a boundary appears intact in at least one chunk', 'To make embeddings shorter', 'It is required by vector databases'], answer: 1, why: 'Overlap protects sentences and ideas cut at boundaries.' }
    },
    13: {
      overview: 'A reranker (usually a cross-encoder) reads the query and each candidate chunk together and scores relevance more accurately than embedding similarity. Retrieve broadly (e.g. top-50), rerank, keep the best few.',
      why: 'Reranking often gives a large relevance improvement for modest latency, and lets you pass fewer, better chunks to the model.',
      prereqs: ['Hybrid retrieval'],
      objectives: ['Explain bi-encoder vs cross-encoder scoring', 'Add a rerank stage with latency budgets', 'Measure the improvement'],
      concepts: [['Bi-encoder', 'Embeds query and documents separately — fast, approximate.'], ['Cross-encoder', 'Scores the pair jointly — slower, more accurate.'], ['Candidate depth', 'How many items you rerank; more = better recall, higher latency.'], ['Cutoff', 'Keep top-k or those above a relevance threshold.']],
      diagram: 'rerank',
      exercise: { task: 'Add a reranker.', steps: ['Retrieve top-30 with hybrid search', 'Rerank with an open cross-encoder or a hosted rerank API', 'Compare MRR and answer quality with and without reranking'] },
      resources: ['cohere-rerank', 'sbert'],
      quiz: { q: 'Why not rerank the entire corpus?', options: ['Cross-encoders are too slow to score every document per query', 'Rerankers cannot read text', 'It reduces accuracy', 'It is forbidden'], answer: 0, why: 'Cross-encoders score pairs one at a time; use them on a shortlist.' }
    },
    17: {
      overview: 'Citations link each claim in an answer to the specific chunk it came from. Number the chunks in context, instruct the model to cite them inline, then verify citations point to real retrieved IDs.',
      why: 'Citations build user trust, enable verification and make groundedness measurable.',
      prereqs: ['Grounded generation', 'Metadata design'],
      objectives: ['Format context with stable source IDs', 'Request and parse inline citations', 'Validate citations against retrieved sources'],
      concepts: [['Source IDs', 'Stable labels like [S3] mapped to doc, page and section.'], ['Inline citation', 'Each sentence or claim followed by its source label.'], ['Citation validation', 'Reject or flag labels that were not in the context.'], ['Citation accuracy', 'Does the cited chunk actually support the claim?']],
      diagram: 'citations',
      exercise: { task: 'Add verifiable citations.', steps: ['Label chunks [S1]…[Sn] with page numbers', 'Require a citation per sentence', 'Parse citations with a regex and drop answers citing unknown labels', 'Render citations as links to the source page'] },
      resources: ['claude-cookbooks', 'anthropic-contextual'],
      quiz: { q: 'A model cites [S7] but only S1–S5 were provided. What should the system do?', options: ['Show it anyway', 'Flag or reject the answer as having an invalid citation', 'Add S7 to the database', 'Increase top-k to 7'], answer: 1, why: 'Fabricated citations are a hallucination signal and must be caught.' }
    },
    19: {
      overview: 'Access control in RAG means users can only retrieve chunks they are permitted to see. Permissions must be enforced at retrieval time with metadata filters — never by asking the model to hide content.',
      why: 'If unauthorised content reaches the context window, it can leak into answers. This is a security boundary, not a prompt-engineering problem.',
      prereqs: ['Metadata design', 'Authentication and authorization'],
      objectives: ['Attach tenant and ACL metadata to every chunk', 'Filter retrieval by the authenticated user’s permissions', 'Test for cross-tenant leakage'],
      concepts: [['Tenant ID', 'Mandatory filter in multi-tenant systems.'], ['ACL metadata', 'Groups or roles allowed to read a document.'], ['Pre-filtering', 'Apply permission filters inside the search query.'], ['Leak tests', 'Automated tests that user A never sees user B’s documents.']],
      diagram: 'trustBoundaries',
      exercise: { task: 'Prove isolation.', steps: ['Create two tenants with distinct documents', 'Add tenant_id filters to retrieval', 'Write tests asking tenant A about tenant B’s secret phrase'] },
      resources: ['owasp-llm', 'pgvector'],
      quiz: { q: 'Where must document permissions be enforced?', options: ['In the system prompt', 'In the retrieval query filters before content reaches the model', 'In the UI only', 'After generation'], answer: 1, why: 'Models cannot be trusted to withhold content already in context.' }
    },
    23: {
      overview: 'RAG failures can be traced to a stage: content missing from the corpus, parsing errors, poor chunking, retrieval misses, reranking errors, context truncation, or generation that ignores or misreads context. Classify each failure before fixing anything.',
      why: 'Without stage-level diagnosis, teams tweak prompts when the real problem is parsing or retrieval.',
      prereqs: ['Retrieval evaluation', 'Answer evaluation'],
      objectives: ['Classify failures by stage', 'Build a failure log with examples', 'Prioritise fixes by frequency and impact'],
      concepts: [['Missing content', 'The answer is not in the corpus at all.'], ['Retrieval miss', 'The answer exists but is not in the top-k.'], ['Context problems', 'Retrieved but truncated, buried or contradicted.'], ['Generation errors', 'Model misreads, over-generalises or ignores context.']],
      diagram: 'ragFailures',
      exercise: { task: 'Run a failure review.', steps: ['Collect 30 bad answers from testing', 'Label each with its failing stage', 'Count by category and fix the top one first', 'Re-run the evaluation to confirm'] },
      resources: ['ragas-docs', 'lost-middle'],
      quiz: { q: 'Most failures are labelled “retrieval miss”. Best next step?', options: ['Rewrite the generation prompt', 'Improve chunking, hybrid search, query rewriting or reranking', 'Switch to a bigger model', 'Increase temperature'], answer: 1, why: 'Fix the stage that fails most.' }
    }
  }
},
// ───────────────────────────────────────────── Module 9
{
  id: 'm09', num: 9, title: 'AI Agents and Tool Calling', short: 'Agents', stage: 7,
  icon: 'bot', category: 'agents', difficulty: 'Advanced', hours: 14, formats: ['reading', 'project'],
  prereqLevel: 'solid', deps: ['m06', 'm08'], projectId: 'p08',
  summary: 'Design controlled systems where models plan, call tools and act — with state, permissions, approvals and observability.',
  why: 'Agents unlock multi-step automation but multiply risk and cost. The skill is knowing when to use them and how to keep them bounded.',
  outcomes: ['Distinguish workflows from agents', 'Implement a tool loop with state and stopping conditions', 'Add permissions and human approval', 'Trace and recover from agent failures'],
  tech: ['Tool calling APIs', 'LangGraph', 'MCP', 'Pydantic'],
  diagram: 'agentLoop',
  kit: { primary: 'anthropic-agents', practical: 'hf-agents-course', advanced: 'react-paper' },
  resources: ['openai-function', 'claude-tooluse', 'mcp', 'langgraph-overview', 'langgraph-interrupts', 'owasp-llm'],
  project: { title: 'Controlled tool-using agent', brief: 'Build an agent with 3–4 narrowly scoped tools, an iteration cap, argument validation, an approval step for any write action, and full traces of every step.', projectId: 'p08' },
  check: [
    { q: 'Which is a reason NOT to use an agent?', options: ['The steps are fixed and known in advance', 'The task needs dynamic tool selection', 'Inputs vary widely', 'The path depends on intermediate results'], answer: 0, why: 'Fixed steps are better as a deterministic workflow — cheaper and more predictable.' },
    { q: 'An agent can send emails. A safe control is…', options: ['Trusting the model', 'Requiring human approval before sending', 'Giving it admin credentials', 'Removing logging'], answer: 1, why: 'Irreversible, outward-facing actions warrant human confirmation.' }
  ],
  topics: [
    ['What an AI agent is', 'A model choosing actions in a loop toward a goal.'],
    ['Model calls versus agent workflows', 'Single calls, chains, workflows and autonomous loops.'],
    ['Tool calling', 'The mechanism agents use to act.'],
    ['Function schemas', 'Precise tool interfaces the model can follow.'],
    ['Tool execution', 'Running tools safely with timeouts and validation.'],
    ['State and context', 'What the agent knows at each step.'],
    ['Memory concepts', 'Short-term context, long-term stores and summaries.'],
    ['Planning and task decomposition', 'Breaking goals into steps.'],
    ['Workflow graphs', 'Explicit nodes and edges instead of free loops.'],
    ['Conditional routing', 'Choosing the next step from results.'],
    ['Retry logic', 'Recovering from tool and model errors.'],
    ['Checkpointing', 'Saving state so runs can resume.'],
    ['Human-in-the-loop approval', 'Pausing for people at critical points.'],
    ['Permissions and tool boundaries', 'Least privilege for autonomous systems.'],
    ['Agent observability', 'Tracing every thought, call and result.'],
    ['Failure recovery', 'Graceful degradation and safe stops.'],
    ['When not to use agents', 'Simpler patterns that win most of the time.']
  ],
  lessons: {
    1: {
      overview: 'There is a spectrum: a single model call; a fixed chain of calls; a workflow with explicit branches; and an agent that decides its own next step in a loop. Each step right adds flexibility and also cost, latency and unpredictability.',
      why: 'Picking the simplest pattern that solves the problem is the most important agent design decision.',
      prereqs: ['Tool calling'],
      objectives: ['Place a task on the call → workflow → agent spectrum', 'Recognise common workflow patterns (routing, parallelisation, evaluator-optimiser)', 'Justify autonomy with requirements'],
      concepts: [['Prompt chaining', 'Output of one call feeds the next.'], ['Routing', 'Classify input, send to a specialised path.'], ['Orchestrator-workers', 'One model delegates sub-tasks.'], ['Autonomous agent', 'Model loops with tools until it decides it is done.']],
      diagram: 'workflowVsAgent',
      exercise: { task: 'Classify five product ideas.', steps: ['For each idea, choose: single call, workflow or agent', 'Write one sentence of justification', 'Sketch the simplest viable design'] },
      resources: ['anthropic-agents', 'hf-agents-course'],
      quiz: { q: 'A support router that classifies tickets into 4 queues is best built as…', options: ['An autonomous agent', 'A single classification call or simple routing workflow', 'A multi-agent system', 'A fine-tuned model from scratch'], answer: 1, why: 'Known categories and one decision — no need for an agent loop.' }
    },
    12: {
      overview: 'Human-in-the-loop means the system pauses before consequential actions, shows a person what it intends to do, and continues only on approval — optionally with edits. Checkpointed state lets the run resume later.',
      why: 'Approval gates make agents usable for real actions — refunds, emails, data changes — without granting unchecked autonomy.',
      prereqs: ['Checkpointing', 'Permissions and tool boundaries'],
      objectives: ['Identify actions that need approval', 'Implement pause/resume with persisted state', 'Design an approval UI that shows enough context'],
      concepts: [['Interrupt', 'Pause the graph and surface a pending action.'], ['Approval payload', 'Tool name, arguments, rationale and impact.'], ['Resume', 'Continue with approved, edited or rejected input.'], ['Audit', 'Record who approved what, when.']],
      diagram: 'hitl',
      exercise: { task: 'Add an approval gate.', steps: ['Mark the refund tool as requires_approval', 'When called, persist state and return a pending status', 'Expose approve/reject endpoints that resume the run'] },
      resources: ['langgraph-interrupts', 'anthropic-agents'],
      quiz: { q: 'Which action most clearly needs approval?', options: ['Searching a knowledge base', 'Issuing a refund to a customer', 'Summarising a document', 'Formatting text'], answer: 1, why: 'Financial, irreversible and external actions need human oversight.' }
    },
    16: {
      overview: 'Agents add latency, cost and failure modes. Many tasks are better served by a single well-designed call, retrieval plus generation, or a fixed workflow. Use agents when the path genuinely cannot be known in advance.',
      why: 'Unnecessary agents are a common cause of unreliable, expensive AI features.',
      prereqs: ['Model calls versus agent workflows'],
      objectives: ['List signals that an agent is unnecessary', 'Estimate agent cost and latency', 'Propose simpler alternatives'],
      concepts: [['Predictable steps', 'If you can draw the flowchart, build the flowchart.'], ['Compounding error', 'Each step’s error rate multiplies across a long loop.'], ['Cost multiplier', 'Every iteration resends growing context.'], ['Debuggability', 'Fixed workflows are easier to test and explain.']],
      diagram: 'workflowVsAgent',
      exercise: { task: 'Refactor an agent into a workflow.', steps: ['Take an agent that always calls search → summarise → format', 'Rewrite as three explicit steps', 'Compare cost, latency and error rate on 20 inputs'] },
      resources: ['anthropic-agents'],
      quiz: { q: 'If each of 10 sequential steps succeeds 95% of the time, overall success is roughly…', options: ['95%', '60%', '99%', '10%'], answer: 1, why: '0.95¹⁰ ≈ 0.60 — errors compound.' }
    }
  }
},
// ───────────────────────────────────────────── Module 10
{
  id: 'm10', num: 10, title: 'LangChain and LangGraph', short: 'LangGraph', stage: 7,
  icon: 'workflow', category: 'agents', difficulty: 'Advanced', hours: 12, formats: ['reading', 'project'],
  prereqLevel: 'solid', deps: ['m09'], projectId: 'p09',
  summary: 'Use orchestration frameworks deliberately: model interfaces, tools, stateful graphs, checkpoints, approvals and streaming — and know when direct SDK calls are better.',
  why: 'Frameworks speed up common patterns and provide persistence and tracing, but add abstraction and version churn. Judgement matters more than syntax.',
  outcomes: ['Compare direct SDK calls with framework abstractions', 'Build a LangGraph state graph with conditional edges', 'Add persistence, interrupts and streaming', 'Pin versions and test graph nodes in isolation'],
  tech: ['LangChain', 'LangGraph', 'LangSmith (optional)', 'Model SDKs'],
  diagram: 'langgraph',
  kit: { primary: 'langgraph-overview', practical: 'langchain-overview', advanced: 'langgraph-persistence' },
  resources: ['langchain-docs', 'langgraph-interrupts', 'langsmith', 'anthropic-agents', 'hf-agents-course'],
  project: { title: 'Stateful AI workflow', brief: 'Build a LangGraph workflow (e.g. research → draft → review → approve → publish) with typed state, conditional routing, a checkpointer, a human approval interrupt and node-level tests.', projectId: 'p09' },
  check: [
    { q: 'What does a LangGraph checkpointer provide?', options: ['Faster models', 'Persisted graph state so runs can pause, resume and be inspected', 'Prompt templates', 'Vector search'], answer: 1, why: 'Checkpoints persist state per thread, enabling resumption and human-in-the-loop.' },
    { q: 'Good reason to skip a framework?', options: ['A single model call with structured output', 'A long-running multi-step workflow with approvals', 'Needing persistence', 'Needing streaming across nodes'], answer: 0, why: 'For simple calls, the direct SDK is clearer and has fewer dependencies.' }
  ],
  topics: [
    ['Why orchestration frameworks exist', 'Common patterns, integrations and infrastructure.'],
    ['Direct SDK calls versus frameworks', 'Control and clarity versus speed and features.'],
    ['Prompt templates', 'Parameterised, reusable prompts.'],
    ['Model interfaces', 'Swapping providers behind one interface.'],
    ['Output parsers', 'Turning text into structured data.'],
    ['Retrieval integrations', 'Retrievers, vector stores and loaders.'],
    ['Chains and runnable composition', 'Composing steps where the chosen version supports it.'],
    ['Tool definitions', 'Declaring tools from typed functions.'],
    ['Agent execution', 'Running tool loops with the framework.'],
    ['LangGraph state', 'Typed shared state passed between nodes.'],
    ['Nodes and edges', 'Steps and transitions in the graph.'],
    ['Conditional transitions', 'Routing based on state.'],
    ['Persistence and checkpoints', 'Threads, history and resumption.'],
    ['Human approval', 'Interrupts and resume commands.'],
    ['Streaming', 'Tokens and intermediate steps to the UI.'],
    ['Testing and debugging', 'Unit-testing nodes and tracing runs.'],
    ['Framework version management', 'Pinning, upgrading and reading changelogs.'],
    ['Avoiding unnecessary abstractions', 'Keeping your domain logic framework-free.']
  ],
  lessons: {
    9: {
      overview: 'A LangGraph graph operates on a typed state object. Each node receives the current state and returns updates; reducers define how updates merge (e.g. appending messages). Edges — fixed or conditional — decide which node runs next.',
      why: 'Explicit state and edges make complex workflows inspectable, testable and resumable, unlike opaque agent loops.',
      prereqs: ['Workflow graphs', 'Type hints'],
      objectives: ['Define a typed state schema', 'Write nodes that return partial updates', 'Use reducers for message lists'],
      concepts: [['State schema', 'A TypedDict or Pydantic model describing all fields.'], ['Node', 'A function: state in, partial update out.'], ['Reducer', 'Merge rule for a field, such as appending messages.'], ['Thread', 'One conversation or run, identified for persistence.']],
      diagram: 'langgraph',
      exercise: { task: 'Build a 3-node graph.', steps: ['State: question, draft, approved', 'Nodes: draft → review → finalize', 'Add a conditional edge from review back to draft if quality is low', 'Run and print state after each step'] },
      resources: ['langgraph-overview', 'langgraph-persistence'],
      quiz: { q: 'What should a LangGraph node return?', options: ['Nothing', 'A partial state update', 'A new graph', 'HTML'], answer: 1, why: 'Nodes return updates that are merged into the shared state.' }
    },
    17: {
      overview: 'Frameworks are tools, not architecture. Keep business rules, prompts and validation in your own modules; use the framework for orchestration, persistence and integrations where it clearly helps.',
      why: 'Thin framework layers make upgrades, provider swaps and testing far easier.',
      prereqs: ['Direct SDK calls versus frameworks'],
      objectives: ['Identify where abstraction adds value', 'Wrap framework code behind your interfaces', 'Keep domain logic testable without the framework'],
      concepts: [['Ports and adapters', 'Your code depends on interfaces; adapters wrap frameworks.'], ['Leaky abstraction', 'When you must understand internals to debug — a cost.'], ['Exit cost', 'How hard it would be to remove the dependency.'], ['Pinning', 'Lock versions; upgrade deliberately.']],
      diagram: 'layers',
      exercise: { task: 'Audit a framework-based project.', steps: ['List every framework import', 'Mark which ones save real effort', 'Move one piece of domain logic out of framework classes into plain functions with tests'] },
      resources: ['anthropic-agents', 'langchain-docs'],
      quiz: { q: 'Where should validation rules for business data live?', options: ['Inside framework callback handlers', 'In your own domain modules, independent of the framework', 'In prompts only', 'In the vector store'], answer: 1, why: 'Domain logic should outlive any framework choice.' }
    }
  }
},
// ───────────────────────────────────────────── Module 11
{
  id: 'm11', num: 11, title: 'AI Evaluation and Reliability', short: 'Evaluation', stage: 8,
  icon: 'gauge', category: 'reliability', difficulty: 'Advanced', hours: 14, formats: ['reading', 'project'],
  prereqLevel: 'solid', deps: ['m08', 'm06'], projectId: 'p10',
  summary: 'Measure AI quality systematically with datasets, metrics, judges and humans — and use evaluations to make changes safely.',
  why: 'Without evaluation every prompt or model change is a guess. Evaluation turns AI development into engineering.',
  outcomes: ['Build an evaluation dataset with expected outputs', 'Measure retrieval and answer quality', 'Use model-as-judge carefully and calibrate with humans', 'Run regression evals in CI and compare prompts/models'],
  tech: ['pytest', 'Ragas', 'Inspect', 'OpenAI Evals', 'LangSmith (optional)'],
  diagram: 'evalLoop',
  kit: { primary: 'ragas-docs', practical: 'inspect', advanced: 'llm-judge-paper' },
  resources: ['openai-evals', 'langsmith', 'hf-datasets', 'pytest', 'lost-middle'],
  project: { title: 'RAG evaluation suite', brief: 'Create a 50+ item evaluation set for a RAG app, measure retrieval recall, answer correctness, groundedness and citation accuracy, and run it automatically on every change.', projectId: 'p10' },
  check: [
    { q: 'Why is an exact-match unit test often insufficient for LLM outputs?', options: ['LLMs are always wrong', 'Many different outputs can be correct, and outputs vary between runs', 'pytest cannot read strings', 'It is too fast'], answer: 1, why: 'Open-ended outputs need graded, semantic or rubric-based evaluation.' },
    { q: 'A known weakness of LLM judges is…', options: ['They cannot read', 'Position and verbosity biases', 'They are always slower than humans', 'They never agree with humans'], answer: 1, why: 'Research documents position, verbosity and self-preference biases.' }
  ],
  topics: [
    ['Why ordinary software tests are insufficient', 'Non-determinism and open-ended correctness.'],
    ['Deterministic tests versus model evaluations', 'Two complementary layers of quality.'],
    ['Evaluation datasets', 'Representative, labelled, versioned cases.'],
    ['Expected outputs', 'Reference answers, rubrics and acceptable variants.'],
    ['Task success metrics', 'Measuring whether users get what they need.'],
    ['Answer correctness', 'Comparing outputs to references.'],
    ['Groundedness', 'Are claims supported by the provided context?'],
    ['Retrieval relevance', 'Did we fetch the right evidence?'],
    ['Citation accuracy', 'Do cited sources support the claims?'],
    ['Hallucination analysis', 'Finding and categorising unsupported claims.'],
    ['Model-as-judge limitations', 'Bias, inconsistency and calibration.'],
    ['Human evaluation', 'Expert review, rubrics and agreement.'],
    ['Regression tests', 'Ensuring changes do not break what worked.'],
    ['Adversarial test cases', 'Edge cases, attacks and stress inputs.'],
    ['Prompt comparison', 'A/B testing prompt versions on the same set.'],
    ['Model comparison', 'Quality, cost and latency across models.'],
    ['Latency and cost benchmarks', 'Tracking p50/p95 and cost per task.'],
    ['Continuous evaluation', 'Evals in CI and on sampled production traffic.']
  ],
  lessons: {
    2: {
      overview: 'An evaluation dataset is a versioned set of inputs with expected outputs or grading criteria, representative of real usage and including hard and adversarial cases.',
      why: 'The dataset defines “good”. A small, well-chosen set run often beats a large one run rarely.',
      prereqs: ['Expected outputs'],
      objectives: ['Collect cases from real or realistic usage', 'Stratify by intent, difficulty and risk', 'Version and grow the set from failures'],
      concepts: [['Coverage', 'Include common, rare, edge and adversarial cases.'], ['Golden answers', 'References or rubrics for each case.'], ['Versioning', 'Track dataset changes alongside code.'], ['Failure mining', 'Every production bug becomes a new test case.']],
      diagram: 'evalLoop',
      exercise: { task: 'Create your first 30-case set.', steps: ['Write 15 typical questions, 10 hard ones and 5 adversarial ones', 'Add expected answers and source IDs', 'Store as JSONL in your repo'] },
      resources: ['hf-datasets', 'inspect'],
      quiz: { q: 'Where should new eval cases most often come from?', options: ['Random internet text', 'Observed failures and real user queries', 'The model itself only', 'Nowhere — sets should be frozen'], answer: 1, why: 'Real failures reveal what matters most.' }
    },
    10: {
      overview: 'Using an LLM to grade outputs scales evaluation but introduces biases: preferring the first option shown, longer answers, or its own style. Judges must be given rubrics, checked against human labels and monitored.',
      why: 'An uncalibrated judge can make a worse system look better.',
      prereqs: ['Answer correctness', 'Human evaluation'],
      objectives: ['Write clear rubric-based judge prompts', 'Measure judge agreement with humans', 'Mitigate position and verbosity bias'],
      concepts: [['Rubric', 'Explicit criteria and scales for the judge.'], ['Position bias', 'Swap option order and average.'], ['Verbosity bias', 'Penalise or normalise for length when it is irrelevant.'], ['Calibration', 'Compare with a human-labelled subset regularly.']],
      diagram: 'judge',
      exercise: { task: 'Calibrate a judge.', steps: ['Hand-label 30 answers as correct/incorrect', 'Run an LLM judge with a rubric', 'Compute agreement; revise rubric and re-measure'] },
      resources: ['llm-judge-paper', 'ragas-docs'],
      quiz: { q: 'Simple mitigation for position bias in pairwise judging?', options: ['Always show the new answer first', 'Evaluate both orderings and combine', 'Use temperature 2', 'Hide the question'], answer: 1, why: 'Swapping order cancels systematic preference for a position.' }
    },
    12: {
      overview: 'Regression evaluation runs your dataset on every meaningful change — prompt, model, retrieval settings — and blocks or flags changes that reduce quality beyond a threshold.',
      why: 'Fixing one case often breaks another. Automated regression checks make improvement cumulative.',
      prereqs: ['Evaluation datasets'],
      objectives: ['Run evals in CI', 'Set metric thresholds and diff reports', 'Track results over time'],
      concepts: [['Baseline', 'Scores of the currently deployed version.'], ['Threshold', 'Maximum acceptable drop per metric.'], ['Diff report', 'Which cases flipped from pass to fail.'], ['Cost control', 'Run a fast subset per commit and the full set nightly.']],
      diagram: 'ciEval',
      exercise: { task: 'Wire evals into CI.', steps: ['Create a pytest-based eval runner', 'Add a GitHub Actions job using a repository secret for the API key', 'Fail the job if correctness drops >3 points vs baseline'] },
      resources: ['gh-actions', 'pytest', 'openai-evals'],
      quiz: { q: 'What should a regression report highlight first?', options: ['Average token count', 'Cases that changed from pass to fail', 'The commit author', 'The model’s name'], answer: 1, why: 'Flipped cases are where to look first.' }
    }
  }
},
// ───────────────────────────────────────────── Module 12
{
  id: 'm12', num: 12, title: 'Production AI Engineering', short: 'Production', stage: 9,
  icon: 'rocket', category: 'production', difficulty: 'Advanced', hours: 16, formats: ['reading', 'project'],
  prereqLevel: 'solid', deps: ['m02', 'm11'],
  summary: 'Containerise, deploy, observe and operate AI services: CI/CD, tracing, cost tracking, load testing, rollbacks and incident response.',
  why: 'A demo becomes a product when it is deployable, observable, affordable and recoverable.',
  outcomes: ['Containerise an AI service and run it with dependencies', 'Build CI/CD with tests and evals', 'Trace requests and track tokens and cost', 'Plan graceful failure, rollbacks and incident response'],
  tech: ['Docker', 'GitHub Actions', 'OpenTelemetry', 'Prometheus', 'PostgreSQL', 'Redis', 'Cloud platforms'],
  diagram: 'deployment',
  kit: { primary: 'docker-start', practical: 'gh-actions', advanced: 'sre-book' },
  resources: ['docker-compose', 'fastapi-docker', 'otel', 'prometheus', 'k6', 'cloud-run', 'fly-docs', 'alembic', 'twelve-factor', 'py-logging', 'redis-docs', 'celery-docs'],
  project: { title: 'Deployed AI service', brief: 'Deploy an AI API in a container with CI (tests + eval subset), migrations, structured logs, traces, token/cost metrics, rate limiting and a documented rollback procedure.' },
  check: [
    { q: 'The model provider is down. What is graceful failure?', options: ['Return a 500 with a stack trace', 'Return a clear message, fall back to a secondary model or cached answer where appropriate, and alert', 'Retry forever', 'Silently return an empty answer'], answer: 1, why: 'Degrade predictably, inform users and operators.' },
    { q: 'Why track tokens per request?', options: ['Required by law', 'To attribute cost, detect abuse and spot prompt bloat', 'To speed up models', 'It is not useful'], answer: 1, why: 'Token metrics drive cost control and anomaly detection.' }
  ],
  topics: [
    ['Application architecture', 'Services, workers, stores and their responsibilities.'],
    ['Docker containers', 'Reproducible images for every environment.'],
    ['Configuration management', 'Environment-specific config without code changes.'],
    ['Environment separation', 'Dev, staging and production with separate keys and data.'],
    ['CI/CD', 'Automated test, eval, build and deploy.'],
    ['Cloud deployment', 'Containers on managed platforms.'],
    ['Database migrations', 'Versioned, reversible schema changes.'],
    ['Background processing', 'Queues and workers for ingestion and long tasks.'],
    ['Rate limits', 'Per-user and per-provider limits.'],
    ['Timeouts', 'End-to-end deadlines across the stack.'],
    ['Retries', 'Bounded, jittered and idempotent.'],
    ['Caching', 'Response, embedding and prompt caching.'],
    ['Request tracing', 'Following one request through every component.'],
    ['Logging and metrics', 'Signals for health and debugging.'],
    ['Model usage monitoring', 'Models, versions, errors and refusals over time.'],
    ['Token and cost tracking', 'Cost per request, user and feature.'],
    ['Load testing', 'Finding limits before users do.'],
    ['Graceful failure', 'Fallbacks and clear degraded modes.'],
    ['Rollbacks', 'Reverting code, prompts and models quickly.'],
    ['Data retention', 'Keeping only what you need, for as long as needed.'],
    ['Incident response', 'Detect, mitigate, communicate, learn.'],
    ['Versioning and reproducibility', 'Pinning prompts, models, data and code together.']
  ],
  lessons: {
    1: {
      overview: 'A container image packages your application, runtime and dependencies so it runs the same on a laptop, in CI and in the cloud. A good AI service image is small, non-root, reproducible and configured entirely by environment variables.',
      why: 'Containers are the standard unit of deployment on almost every platform.',
      prereqs: ['Dependency management', 'Configuration management'],
      objectives: ['Write a multi-stage Dockerfile for a FastAPI service', 'Run API + Postgres + Redis with Compose', 'Keep secrets out of images'],
      concepts: [['Image vs container', 'Template vs running instance.'], ['Layer caching', 'Install dependencies before copying source for faster builds.'], ['Non-root user', 'Reduces impact of a compromise.'], ['Health check', 'Lets orchestrators restart unhealthy containers.']],
      diagram: 'deployment',
      exercise: { task: 'Containerise your API.', steps: ['Write a Dockerfile with a slim Python base', 'Add docker-compose.yml with Postgres', 'Pass secrets via environment at runtime, not build time'], code: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY pyproject.toml uv.lock ./\nRUN pip install uv && uv sync --frozen --no-dev\nCOPY src ./src\nRUN useradd -m app\nUSER app\nCMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]' },
      resources: ['docker-start', 'fastapi-docker', 'docker-compose'],
      quiz: { q: 'Where should an API key come from in a container?', options: ['Baked into the image', 'Injected at runtime via environment or a secrets manager', 'Hard-coded in source', 'Downloaded from a public URL'], answer: 1, why: 'Images are shared artefacts; secrets must be injected at runtime.' }
    },
    15: {
      overview: 'Record input and output tokens, model and estimated cost for every model call, tagged with user, tenant, feature and request ID. Aggregate into dashboards and alerts.',
      why: 'AI costs scale with usage and prompt size. Without attribution you cannot price features, catch abuse or justify optimisations.',
      prereqs: ['Logging and metrics', 'Tokens and tokenization'],
      objectives: ['Capture usage fields returned by provider APIs', 'Attribute cost per feature and user', 'Set budget alerts and anomaly detection'],
      concepts: [['Usage fields', 'Most APIs return input/output token counts per response.'], ['Price table', 'Versioned config mapping model → price; check provider pages for current rates.'], ['Attribution tags', 'user_id, tenant_id, feature, prompt_version.'], ['Optimisation levers', 'Caching, shorter context, smaller models, batching.']],
      diagram: 'observability',
      exercise: { task: 'Add cost tracking middleware.', steps: ['Wrap your model client to record usage', 'Emit a metric and a structured log per call', 'Build a query for cost per feature per day'] },
      resources: ['otel', 'prometheus'],
      quiz: { q: 'Cost doubled overnight with flat traffic. Likely culprit?', options: ['Prompt or context size grew (e.g. more retrieved chunks or history)', 'Fewer users', 'Better caching', 'Lower temperature'], answer: 0, why: 'Token growth per request is the usual cause when traffic is flat.' }
    }
  }
},
// ───────────────────────────────────────────── Module 13
{
  id: 'm13', num: 13, title: 'AI Security and Responsible Engineering', short: 'Security', stage: 9,
  icon: 'shield', category: 'security', difficulty: 'Advanced', hours: 12, formats: ['reading', 'project'],
  prereqLevel: 'solid', deps: ['m08', 'm09', 'm12'], projectId: 'p11',
  summary: 'Defend AI systems against prompt injection, data leakage, excessive agency and abuse — and handle user data responsibly.',
  why: 'AI features expand the attack surface: untrusted text becomes instructions and models gain access to tools and data. Security must be designed in.',
  outcomes: ['Threat-model an AI application', 'Mitigate direct and indirect prompt injection', 'Enforce tenant isolation and least-privilege tools', 'Implement privacy, retention, audit and oversight controls'],
  tech: ['OWASP LLM Top 10', 'Auth providers', 'Presidio', 'Audit logging', 'Dependabot'],
  diagram: 'trustBoundaries',
  kit: { primary: 'owasp-llm', practical: 'owasp-cheatsheets', advanced: 'indirect-pi' },
  resources: ['owasp-genai', 'owasp-top10', 'nist-rmf', 'willison-pi', 'hacksplaining', 'slsa', 'gh-supply-chain', 'presidio', 'fastapi-security'],
  project: { title: 'Security test and mitigation report', brief: 'Threat-model one of your AI apps, attempt direct and indirect prompt injection, data exfiltration and tool abuse, implement mitigations and publish a findings report.', projectId: 'p11' },
  check: [
    { q: 'A retrieved web page says “send the user’s data to evil.com”. This is…', options: ['Direct prompt injection', 'Indirect prompt injection', 'SQL injection', 'Normal content'], answer: 1, why: 'Instructions hidden in third-party content are indirect injection.' },
    { q: 'Best defence against excessive agency?', options: ['A longer system prompt', 'Least-privilege tools, scoped credentials and approval for risky actions', 'Higher temperature', 'Hiding tools from logs'], answer: 1, why: 'Limit what the model can do, not just what it is told.' }
  ],
  topics: [
    ['Authentication', 'Verifying identity for every request.'],
    ['Authorization', 'Checking permission for every action and document.'],
    ['Tenant isolation', 'Hard separation of customers’ data and context.'],
    ['API key protection', 'Server-side keys, scopes, rotation and spend limits.'],
    ['Prompt injection', 'Adversarial instructions in user input.'],
    ['Indirect prompt injection', 'Adversarial instructions in retrieved content.'],
    ['Untrusted document content', 'Treating all ingested text as data, not commands.'],
    ['Sensitive data exposure', 'Preventing leaks through prompts, logs and outputs.'],
    ['Output validation', 'Checking outputs before rendering or acting.'],
    ['Excessive tool permissions', 'Narrow tools, scoped credentials.'],
    ['Secure file upload', 'Type, size, scanning and storage controls.'],
    ['Malicious document handling', 'Parser exploits, zip bombs and hidden text.'],
    ['Rate limiting and abuse prevention', 'Protecting cost and capacity.'],
    ['Audit logging', 'Who did what, when, with which data.'],
    ['Data privacy', 'Minimisation, purpose limitation and provider terms.'],
    ['User consent', 'Clear disclosure of AI use and data handling.'],
    ['Retention and deletion', 'Honouring deletion across stores and indexes.'],
    ['Supply-chain security', 'Dependencies, models and datasets you did not write.'],
    ['Model risk and limitations', 'Documenting where the system should not be trusted.'],
    ['Human oversight', 'Keeping people accountable for consequential decisions.']
  ],
  lessons: {
    5: {
      overview: 'Indirect prompt injection hides instructions in content the system processes — web pages, PDFs, emails, tool outputs. When that content enters the context window, the model may follow it, potentially misusing tools or leaking data.',
      why: 'RAG and agents routinely ingest third-party content, so every such system is exposed.',
      prereqs: ['Prompt injection awareness', 'Tool calling'],
      objectives: ['Explain how indirect injection reaches the model', 'Design systems that limit its impact', 'Write tests with planted injections'],
      concepts: [['Data/instruction confusion', 'Models cannot reliably tell instructions from data in context.'], ['Exfiltration channels', 'Links, images, tool calls that send data out.'], ['Privilege separation', 'Content-processing steps get no dangerous tools.'], ['Confirmation', 'User approval before actions influenced by untrusted content.']],
      diagram: 'promptInjection',
      exercise: { task: 'Plant and defend.', steps: ['Add a document containing hidden instructions to your RAG corpus', 'Ask a question that retrieves it', 'Apply mitigations: strip markup, block outbound links in output, remove tool access on that path', 'Record which mitigations worked'] },
      resources: ['indirect-pi', 'willison-pi', 'owasp-llm'],
      quiz: { q: 'Which change most reduces impact of indirect injection in a summariser?', options: ['Remove all tool/network access from the summarisation step', 'Tell the model to ignore bad instructions', 'Use a larger model', 'Add more documents'], answer: 0, why: 'Without capabilities, a hijacked summariser can do little harm.' }
    },
    16: {
      overview: 'Deleting a user’s data in an AI system means deleting it everywhere: primary DB, object storage, vector index, caches, logs, eval sets and any provider-side retention you control.',
      why: 'Privacy regulations and user trust require real deletion; vector indexes and caches are easy to forget.',
      prereqs: ['Document updates and deletion', 'Data privacy'],
      objectives: ['Map all stores that hold user data', 'Implement cascading deletion with verification', 'Set retention periods per data type'],
      concepts: [['Data map', 'Inventory of where each data type lives.'], ['Cascading delete', 'One request triggers deletion in every store.'], ['Retention policy', 'Automatic expiry for logs and traces.'], ['Provider retention', 'Review and configure API data retention settings.']],
      diagram: 'dataLifecycle',
      exercise: { task: 'Implement “delete my data”.', steps: ['List all stores', 'Write a deletion job removing rows, files, vectors and cache keys', 'Add a test that searches for the user’s content afterwards'] },
      resources: ['owasp-cheatsheets', 'nist-rmf'],
      quiz: { q: 'Which store is most often forgotten during deletion?', options: ['The primary database', 'Vector indexes and caches', 'The UI', 'DNS'], answer: 1, why: 'Derived stores hold copies of content and are easy to miss.' }
    }
  }
},
// ───────────────────────────────────────────── Module 14
{
  id: 'm14', num: 14, title: 'Advanced Applied AI Specializations', short: 'Specializations', stage: 10,
  icon: 'sparkles', category: 'specialization', difficulty: 'Advanced', hours: 22, formats: ['reading', 'video', 'project'],
  prereqLevel: 'solid', deps: ['m11', 'm12'], optional: true,
  summary: 'Choose one or two optional branches — fine-tuning, multimodal, local models, ML engineering or advanced agents — to deepen your profile.',
  why: 'Specialisation differentiates you. Pick branches that match the problems you want to solve; nobody needs all of them.',
  outcomes: ['Choose a specialisation aligned with your goals', 'Complete one branch project end to end', 'Explain trade-offs versus simpler approaches'],
  tech: ['PEFT / LoRA', 'TRL', 'Whisper', 'vLLM', 'llama.cpp', 'Ollama', 'MLflow'],
  diagram: 'branches',
  kit: { primary: 'hf-llm-course', practical: 'hf-peft', advanced: 'lora-paper' },
  resources: ['qlora-paper', 'hf-trl', 'whisper', 'vllm', 'ollama', 'llamacpp', 'mlflow', 'tei', 'hf-datasets', 'cs336'],
  project: { title: 'Branch project', brief: 'Complete one: fine-tune a small model with LoRA and compare to prompting; build a voice or vision workflow; deploy a quantised local model behind an API; set up experiment tracking and drift monitoring; or build a supervised multi-agent workflow.' },
  check: [
    { q: 'When is fine-tuning preferable to RAG?', options: ['When the model needs frequently changing facts', 'When you need consistent style/format or narrow task behaviour that prompting cannot achieve', 'Always', 'Never'], answer: 1, why: 'Fine-tuning shapes behaviour; RAG supplies changing knowledge.' },
    { q: 'What does quantisation trade?', options: ['Security for speed', 'Some accuracy for lower memory use and often faster inference', 'Tokens for images', 'Nothing'], answer: 1, why: 'Lower-precision weights reduce memory at some quality cost.' }
  ],
  topics: [
    ['A · Fine-tuning versus prompting versus RAG', 'Choosing the right lever for behaviour or knowledge.'],
    ['A · Dataset preparation', 'Clean, representative, formatted training examples.'],
    ['A · Training and validation', 'Splits, hyperparameters and overfitting checks.'],
    ['A · Parameter-efficient fine-tuning', 'Training a small number of parameters.'],
    ['A · LoRA concepts', 'Low-rank adapters on frozen weights.'],
    ['A · Evaluation', 'Comparing fine-tuned models to baselines.'],
    ['A · Model deployment', 'Serving adapters and merged weights.'],
    ['B · Image understanding', 'Vision-language models for documents and photos.'],
    ['B · Speech-to-text', 'Transcription with timestamps and diarisation.'],
    ['B · Text-to-speech', 'Natural voice output and latency.'],
    ['B · Audio workflows', 'Streaming voice assistants end to end.'],
    ['B · Vision-language models', 'Joint image and text reasoning.'],
    ['B · Multimodal retrieval', 'Searching images, audio and text together.'],
    ['B · Input and output safety', 'Moderating non-text content.'],
    ['C · Model quantization', 'Lower precision for smaller, faster models.'],
    ['C · Inference servers', 'vLLM, llama.cpp, Ollama and TEI.'],
    ['C · GPU and memory constraints', 'Estimating VRAM for weights and KV cache.'],
    ['C · Throughput and latency', 'Batching, streaming and concurrency.'],
    ['C · Local model evaluation', 'Benchmarking open models on your tasks.'],
    ['C · Deployment trade-offs', 'Cost, control, privacy and operations.'],
    ['D · Experiment tracking', 'Logging runs, parameters and metrics.'],
    ['D · Data pipelines', 'Reliable, versioned data processing.'],
    ['D · Model serving', 'APIs, batching and autoscaling for models.'],
    ['D · Drift monitoring', 'Detecting changing inputs and outcomes.'],
    ['D · Model lifecycle management', 'Registry, promotion and retirement.'],
    ['E · Multi-agent patterns', 'Supervisors, specialists and handoffs.'],
    ['E · Workflow coordination', 'Ordering and synchronising agent work.'],
    ['E · Shared state', 'Consistent state across agents.'],
    ['E · Delegation risks', 'Compounding errors and privilege escalation.'],
    ['E · Evaluation and control', 'Measuring multi-agent outcomes.'],
    ['E · Recovery and approval mechanisms', 'Checkpoints and human gates at scale.']
  ],
  lessons: {
    0: {
      overview: 'Prompting changes instructions; RAG changes available knowledge; fine-tuning changes the model’s weights and therefore its default behaviour. Each solves different problems at different cost.',
      why: 'Teams often fine-tune when RAG or better prompts would work — wasting time and creating models that go stale.',
      prereqs: ['Prompt evaluation', 'RAG architecture'],
      objectives: ['Map problems to the right technique', 'Estimate cost and maintenance of each', 'Combine techniques where appropriate'],
      concepts: [['Prompting', 'Fastest to iterate; limited by context and instruction-following.'], ['RAG', 'Best for large, changing or private knowledge with citations.'], ['Fine-tuning', 'Best for style, format, narrow skills or latency/cost reduction via smaller models.'], ['Combination', 'A fine-tuned model can still use RAG.']],
      diagram: 'pretrainedLadder',
      exercise: { task: 'Decide for three scenarios.', steps: ['Legal Q&A over a changing document set', 'Consistent brand-voice product descriptions', 'Classifying support tickets at very high volume', 'Choose a technique for each and justify'] },
      resources: ['hf-llm-course', 'hf-peft'],
      quiz: { q: 'Your knowledge base changes daily. Best primary technique?', options: ['Fine-tuning weekly', 'RAG', 'Higher temperature', 'Longer system prompt with all documents'], answer: 1, why: 'RAG reflects changes as soon as documents are re-indexed.' }
    },
    4: {
      overview: 'LoRA freezes the original weights and learns small low-rank matrices that are added to selected layers. Only a tiny fraction of parameters are trained, cutting memory and storage while often approaching full fine-tuning quality.',
      why: 'LoRA (and QLoRA) make fine-tuning feasible on a single GPU and let you keep many task adapters for one base model.',
      prereqs: ['Parameter-efficient fine-tuning', 'Vectors and matrices'],
      objectives: ['Explain low-rank updates intuitively', 'Choose rank, alpha and target modules', 'Merge or hot-swap adapters at inference'],
      concepts: [['Low-rank update', 'ΔW ≈ B·A with small inner dimension r.'], ['Rank r', 'Capacity of the adapter; larger is more expressive.'], ['Target modules', 'Typically attention projections and sometimes MLP layers.'], ['QLoRA', 'LoRA on a 4-bit quantised base model.']],
      diagram: 'lora',
      exercise: { task: 'Fine-tune a small model with LoRA.', steps: ['Prepare 500 instruction examples', 'Train with PEFT + TRL on a small open model', 'Evaluate against the base model with your eval set'] },
      resources: ['lora-paper', 'qlora-paper', 'hf-peft', 'hf-trl'],
      quiz: { q: 'What does LoRA train?', options: ['All model weights', 'Small low-rank adapter matrices while the base stays frozen', 'Only the tokenizer', 'The embedding index'], answer: 1, why: 'Frozen base + trainable adapters is the core idea.' }
    }
  }
},
// ───────────────────────────────────────────── Module 15
{
  id: 'm15', num: 15, title: 'Capstone and Career Readiness', short: 'Capstone', stage: 10,
  icon: 'trophy', category: 'career', difficulty: 'Advanced', hours: 32, formats: ['project'],
  prereqLevel: 'solid', deps: ['m12', 'm13', 'm11'], projectId: 'p12',
  summary: 'Plan, build, evaluate, secure, deploy and present a complete full-stack AI application — then explain it confidently in interviews.',
  why: 'A deployed, documented, evaluated capstone is the strongest evidence of AI engineering skill.',
  outcomes: ['Write requirements and an architecture for a real problem', 'Ship a deployed full-stack AI app with tests and evals', 'Document limitations and trade-offs professionally', 'Explain design decisions in technical interviews'],
  tech: ['FastAPI', 'TypeScript frontend', 'PostgreSQL + pgvector', 'Model APIs', 'Docker', 'GitHub Actions'],
  diagram: 'capstone',
  kit: { primary: 'twelve-factor', practical: 'gh-actions', advanced: 'sre-book' },
  resources: ['ts-docs', 'docker-start', 'owasp-llm', 'ragas-docs', 'otel', 'anthropic-agents'],
  project: { title: 'Final capstone', brief: 'Build and deploy a complete AI application that solves a real problem, with authentication, retrieval or tools, evaluations, monitoring, a professional README, architecture diagram and recorded demo.', projectId: 'p12' },
  check: [
    { q: 'What makes a capstone most convincing to reviewers?', options: ['The number of frameworks used', 'A deployed app with evaluations, clear trade-offs and honest limitations', 'A long feature list', 'A complex UI'], answer: 1, why: 'Evidence of judgement and rigour outweighs feature count.' },
    { q: 'In interviews, explaining a design choice well includes…', options: ['Only what you built', 'The alternatives considered, trade-offs and how you measured the outcome', 'Tool names', 'Avoiding mention of failures'], answer: 1, why: 'Interviewers look for reasoning and measurement.' }
  ],
  topics: [
    ['Define a real problem', 'A specific user, pain and measurable outcome.'],
    ['Write requirements', 'Functional, non-functional and out-of-scope.'],
    ['Choose the architecture', 'Simplest design that meets requirements.'],
    ['Create system diagrams', 'Context, container and data-flow views.'],
    ['Implement the backend', 'API, data model, orchestration.'],
    ['Implement the frontend', 'Usable UI with streaming and error states.'],
    ['Integrate models', 'Provider clients, fallbacks and settings.'],
    ['Add retrieval or tool workflows', 'RAG, tools or both where justified.'],
    ['Add security and validation', 'Auth, isolation, input/output checks.'],
    ['Write unit and integration tests', 'Deterministic coverage of your code.'],
    ['Build an evaluation dataset', 'Measure quality for your specific task.'],
    ['Deploy the application', 'Public URL, CI/CD and environment config.'],
    ['Add monitoring', 'Traces, errors, cost and quality signals.'],
    ['Write a professional README', 'Purpose, setup, architecture, results, limits.'],
    ['Record a product demonstration', 'A short, focused video walkthrough.'],
    ['Publish an architecture diagram', 'A clear visual of components and data flow.'],
    ['Document limitations and trade-offs', 'Honest boundaries of the system.'],
    ['Prepare technical interview explanations', 'Telling the story of your decisions.']
  ],
  lessons: {
    0: {
      overview: 'A strong capstone starts with a narrow, real problem: a specific user, a painful task and a measurable improvement. “AI for everything” projects rarely finish; “help clinic receptionists answer insurance questions from policy PDFs in under 30 seconds” does.',
      why: 'Clear problems lead to clear evaluations, scoped builds and compelling portfolio stories.',
      prereqs: ['All core modules'],
      objectives: ['Write a one-paragraph problem statement', 'Define success metrics', 'Identify data sources and constraints'],
      concepts: [['User', 'A real role with a recurring task.'], ['Pain', 'Time, errors, cost or frustration you can measure.'], ['Outcome metric', 'Task success, time saved, accuracy.'], ['Constraints', 'Privacy, budget, latency, data availability.']],
      diagram: 'capstone',
      exercise: { task: 'Draft your problem statement.', steps: ['Interview or observe one potential user if possible', 'Write who, what, why now, and how you will measure success', 'List three things explicitly out of scope'] },
      resources: ['twelve-factor'],
      quiz: { q: 'Which is the best capstone problem statement?', options: ['“An AI that helps people”', '“A tool that answers employee benefits questions from our 40 policy PDFs with cited answers, aiming for 90% correctness on a 60-question eval set”', '“ChatGPT but better”', '“Use every framework”'], answer: 1, why: 'Specific user, data, output and measurable target.' }
    },
    17: {
      overview: 'Technical interviews for AI engineers probe judgement: why you chose an architecture, how you evaluated it, what failed, what it costs and what you would change. Prepare concise stories backed by numbers.',
      why: 'Your capstone only helps if you can explain it clearly and honestly.',
      prereqs: ['Document limitations and trade-offs'],
      objectives: ['Prepare a two-minute project overview', 'Explain three key decisions with alternatives', 'Discuss failures and what you learned'],
      concepts: [['Situation → decision → result', 'A simple structure for each story.'], ['Numbers', 'Eval scores, latency, cost per request, before/after.'], ['Trade-offs', 'What you gave up and why it was acceptable.'], ['Next steps', 'What you would build with more time.']],
      diagram: 'careerRoles',
      exercise: { task: 'Mock interview.', steps: ['Record yourself explaining your architecture in 2 minutes', 'Answer: “Why not fine-tune?”, “How do you know it works?”, “What happens if the model API is down?”', 'Refine based on playback'] },
      resources: ['anthropic-agents', 'sre-book'],
      quiz: { q: 'Which answer best addresses “How do you know it works?”', options: ['“It looked good when I tried it.”', '“On a 60-case eval set, correctness is 88%, groundedness 95%; I re-run it in CI on every change.”', '“The model is state of the art.”', '“Users haven’t complained.”'], answer: 1, why: 'Concrete, repeatable evidence.' }
    }
  }
}
);

/* Derived lookups */
(function () {
  const mods = AIEA.data.modules.sort((a, b) => a.num - b.num);
  AIEA.data.moduleById = Object.fromEntries(mods.map(m => [m.id, m]));
  mods.forEach(m => {
    const perTopic = Math.max(15, Math.round((m.hours * 60) / m.topics.length / 5) * 5);
    m.topicList = m.topics.map((t, i) => ({
      id: m.id + '-t' + String(i + 1).padStart(2, '0'),
      idx: i, num: m.num + '.' + (i + 1), title: t[0], summary: t[1],
      minutes: perTopic, lesson: (m.lessons && m.lessons[i]) || null, module: m
    }));
  });
  AIEA.data.allTopics = mods.flatMap(m => m.topicList);
  AIEA.data.topicById = Object.fromEntries(AIEA.data.allTopics.map(t => [t.id, t]));
})();
