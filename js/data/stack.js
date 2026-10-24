/* Technology stack explorer. tier: core | alternative | specialization.
   docs URLs reuse links verified in resources.js where possible. */
window.AIEA = window.AIEA || {};
AIEA.data = AIEA.data || {};

AIEA.data.stack = [
  {
    id: 'programming', title: 'Programming', icon: 'terminal', desc: 'Languages you will read and write daily.',
    items: [
      { name: 'Python', mono: 'Py', tier: 'core', what: 'General-purpose language with the richest AI ecosystem.', why: 'Model SDKs, data tooling, evaluation frameworks and most AI backends are Python-first.', prereqs: 'None', when: 'Backends, pipelines, evaluation, notebooks.', whenNot: 'Browser UIs; latency-critical native inference kernels.', docs: 'https://docs.python.org/3/tutorial/', modules: ['m01'] },
      { name: 'SQL', mono: 'SQL', tier: 'core', what: 'Query language for relational databases.', why: 'Users, documents, metadata, permissions and often vectors live in Postgres.', prereqs: 'Basic programming', when: 'Any structured, transactional data.', whenNot: 'Large binary blobs (use object storage).', docs: 'https://www.postgresql.org/docs/current/tutorial.html', modules: ['m02'] },
      { name: 'TypeScript', mono: 'TS', tier: 'alternative', what: 'Typed JavaScript for web frontends and Node backends.', why: 'Most AI product UIs are web apps; streaming chat interfaces are built here.', prereqs: 'JavaScript basics', when: 'Frontends, full-stack apps, edge functions.', whenNot: 'Heavy data science or training.', docs: 'https://www.typescriptlang.org/docs/', modules: ['m15'] },
      { name: 'Shell scripting', mono: 'sh', tier: 'core', what: 'Automating tasks in the terminal.', why: 'Running servers, CI steps, containers and data jobs.', prereqs: 'None', when: 'Glue scripts, CI, local automation.', whenNot: 'Complex logic — switch to Python.', docs: 'https://www.gnu.org/software/bash/manual/', modules: ['m00'] }
    ]
  },
  {
    id: 'backend', title: 'Python backend', icon: 'server', desc: 'Building typed, testable services.',
    items: [
      { name: 'FastAPI', mono: 'FA', tier: 'core', what: 'Async Python web framework built on type hints.', why: 'Fast to build typed AI APIs with automatic validation and docs; supports streaming.', prereqs: 'Python, HTTP basics', when: 'APIs for AI features and internal services.', whenNot: 'Server-rendered content sites where a full-stack framework fits better.', docs: 'https://fastapi.tiangolo.com/tutorial/', modules: ['m02', 'm12'] },
      { name: 'Pydantic', mono: 'Pd', tier: 'core', what: 'Data validation using type hints.', why: 'Validates requests, configs, model outputs and tool arguments; generates JSON Schema.', prereqs: 'Type hints', when: 'Every trust boundary.', whenNot: 'Hot inner loops where validation overhead matters.', docs: 'https://pydantic.dev/docs/validation/latest/get-started/', modules: ['m01', 'm06'] },
      { name: 'pytest', mono: 'pt', tier: 'core', what: 'Python testing framework.', why: 'Tests deterministic code and drives evaluation runners.', prereqs: 'Python', when: 'Always.', whenNot: '—', docs: 'https://docs.pytest.org/en/stable/', modules: ['m01', 'm11'] },
      { name: 'HTTPX', mono: 'HX', tier: 'core', what: 'Sync and async HTTP client.', why: 'Calling model and third-party APIs with timeouts and connection pooling.', prereqs: 'HTTP basics', when: 'Outbound HTTP when no official SDK fits.', whenNot: 'When a provider SDK already handles retries and auth well.', docs: 'https://www.python-httpx.org/', modules: ['m01', 'm02'] },
      { name: 'asyncio', mono: 'aio', tier: 'core', what: 'Standard-library async runtime.', why: 'Concurrent model calls, streaming and I/O-bound services.', prereqs: 'Functions, HTTP', when: 'I/O-bound concurrency.', whenNot: 'CPU-bound work.', docs: 'https://docs.python.org/3/library/asyncio.html', modules: ['m01'] }
    ]
  },
  {
    id: 'ml', title: 'Machine learning', icon: 'sigma', desc: 'Numerical computing and classic ML.',
    items: [
      { name: 'NumPy', mono: 'np', tier: 'core', what: 'N-dimensional arrays and vectorised math.', why: 'Embedding math, similarity, quick experiments.', prereqs: 'Python', when: 'Numerical work in Python.', whenNot: 'Tabular data wrangling (use pandas).', docs: 'https://numpy.org/doc/stable/user/absolute_beginners.html', modules: ['m03'] },
      { name: 'pandas', mono: 'pd', tier: 'core', what: 'DataFrames for tabular data.', why: 'Analysing eval results, logs and datasets.', prereqs: 'Python', when: 'Exploring and transforming tables.', whenNot: 'Very large data — consider other engines.', docs: 'https://pandas.pydata.org/docs/getting_started/index.html', modules: ['m03', 'm11'] },
      { name: 'scikit-learn', mono: 'sk', tier: 'core', what: 'Classic ML algorithms, pipelines and metrics.', why: 'Baselines, classifiers on embeddings, evaluation metrics.', prereqs: 'NumPy, ML basics', when: 'Tabular ML, quick baselines.', whenNot: 'Deep learning on raw text/images.', docs: 'https://scikit-learn.org/stable/user_guide.html', modules: ['m03'] },
      { name: 'PyTorch', mono: 'PT', tier: 'specialization', what: 'Deep learning framework.', why: 'Understanding and fine-tuning neural networks.', prereqs: 'NumPy, ML basics', when: 'Training or fine-tuning models.', whenNot: 'Apps that only call hosted models.', docs: 'https://docs.pytorch.org/tutorials/', modules: ['m04', 'm14'] },
      { name: 'Hugging Face', mono: 'HF', tier: 'specialization', what: 'Hub and libraries for open models and datasets.', why: 'Finding, running and fine-tuning open-weight models.', prereqs: 'Python, PyTorch basics', when: 'Open models, embeddings, fine-tuning.', whenNot: 'When a hosted API meets all requirements.', docs: 'https://huggingface.co/docs/transformers/index', modules: ['m05', 'm14'] }
    ]
  },
  {
    id: 'llm', title: 'LLM development', icon: 'brain', desc: 'Working with language models directly.',
    items: [
      { name: 'Commercial model APIs', mono: 'API', tier: 'core', what: 'Hosted frontier models via HTTP APIs and SDKs.', why: 'Fastest route to high-quality capabilities without managing GPUs.', prereqs: 'Python, HTTP', when: 'Most applications, especially early on.', whenNot: 'Strict data-residency or offline needs that rule out third parties.', docs: 'https://platform.claude.com/docs/en/home', modules: ['m05', 'm06'] },
      { name: 'Open-weight inference', mono: 'OW', tier: 'specialization', what: 'Running downloadable models on your own hardware.', why: 'Control, privacy, offline use and cost at scale.', prereqs: 'LLM basics, GPU basics', when: 'Privacy constraints, high volume, customisation.', whenNot: 'Small teams without ops capacity.', docs: 'https://docs.vllm.ai/en/latest/', modules: ['m14'] },
      { name: 'Structured output', mono: '{}', tier: 'core', what: 'Constraining responses to a JSON Schema.', why: 'Reliable integration of model output into code.', prereqs: 'Pydantic, JSON', when: 'Extraction, classification, any machine-read output.', whenNot: 'Free-form prose for humans.', docs: 'https://developers.openai.com/api/docs/guides/structured-outputs', modules: ['m06'] },
      { name: 'Tool calling', mono: 'fn', tier: 'core', what: 'Models requesting function calls with typed arguments.', why: 'Connecting models to data and actions; foundation of agents.', prereqs: 'Structured output', when: 'Live data lookups and controlled actions.', whenNot: 'When a fixed pipeline can fetch data deterministically.', docs: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview', modules: ['m06', 'm09'] },
      { name: 'Streaming', mono: '≋', tier: 'core', what: 'Receiving tokens incrementally.', why: 'Lower perceived latency in chat UIs.', prereqs: 'Async, HTTP', when: 'User-facing generation.', whenNot: 'Batch jobs where whole responses are needed.', docs: 'https://developers.openai.com/api/docs', modules: ['m05'] },
      { name: 'Embeddings', mono: 'emb', tier: 'core', what: 'Vector representations of text and other media.', why: 'Semantic search, RAG, clustering, classification.', prereqs: 'Cosine similarity', when: 'Similarity-based retrieval.', whenNot: 'Exact-match lookups (use keyword/SQL).', docs: 'https://www.sbert.net/', modules: ['m07'] }
    ]
  },
  {
    id: 'frameworks', title: 'AI frameworks', icon: 'workflow', desc: 'Orchestration — use when justified.',
    items: [
      { name: 'Direct model SDKs', mono: 'SDK', tier: 'core', what: 'Official provider client libraries.', why: 'Clear, minimal, up to date with provider features.', prereqs: 'Python', when: 'Default choice for most calls.', whenNot: 'Complex stateful multi-step workflows needing persistence.', docs: 'https://developers.openai.com/api/docs/quickstart', modules: ['m05', 'm10'] },
      { name: 'LangGraph', mono: 'LG', tier: 'alternative', what: 'Graph-based orchestration with state, persistence and interrupts.', why: 'Long-running, resumable workflows with human approval.', prereqs: 'Agents, tool calling', when: 'Stateful multi-step agents/workflows.', whenNot: 'Single calls or simple chains.', docs: 'https://docs.langchain.com/oss/python/langgraph/overview', modules: ['m10'] },
      { name: 'LangChain', mono: 'LC', tier: 'alternative', what: 'Integrations and abstractions for models, tools and retrieval.', why: 'Quick access to many integrations and agent helpers.', prereqs: 'LLM basics', when: 'Prototyping across many providers/integrations.', whenNot: 'When the abstraction obscures simple code you could write directly.', docs: 'https://docs.langchain.com/oss/python/langchain/overview', modules: ['m10'] },
      { name: 'Model Context Protocol', mono: 'MCP', tier: 'specialization', what: 'Open protocol for exposing tools and data to models.', why: 'Reusable tool servers across clients and agents.', prereqs: 'Tool calling', when: 'Sharing tools across applications.', whenNot: 'A single app with two internal functions.', docs: 'https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro', modules: ['m09'] }
    ]
  },
  {
    id: 'data', title: 'Data and retrieval', icon: 'database', desc: 'Where documents, vectors and state live.',
    items: [
      { name: 'PostgreSQL', mono: 'PG', tier: 'core', what: 'Reliable relational database.', why: 'One store for users, metadata, permissions and (with pgvector) embeddings.', prereqs: 'SQL', when: 'Default primary database.', whenNot: '—', docs: 'https://www.postgresql.org/docs/', modules: ['m02', 'm08'] },
      { name: 'pgvector', mono: 'pgv', tier: 'core', what: 'Vector similarity search inside Postgres.', why: 'Keeps vectors next to metadata and permissions with transactional consistency.', prereqs: 'PostgreSQL, embeddings', when: 'Up to large-but-not-huge collections; when you already run Postgres.', whenNot: 'Very large-scale, specialised vector workloads.', docs: 'https://github.com/pgvector/pgvector', modules: ['m07', 'm08'] },
      { name: 'Dedicated vector DBs', mono: 'VDB', tier: 'alternative', what: 'Purpose-built vector stores (e.g. Qdrant, Chroma).', why: 'Advanced filtering, scaling and quantisation features.', prereqs: 'Embeddings', when: 'Scale or features exceed Postgres.', whenNot: 'Small projects — extra infrastructure.', docs: 'https://qdrant.tech/documentation/', modules: ['m07'] },
      { name: 'Redis', mono: 'Rd', tier: 'alternative', what: 'In-memory data store.', why: 'Caching, rate limiting, short-lived session state, queues.', prereqs: 'Basic backend', when: 'Low-latency ephemeral data.', whenNot: 'Primary durable storage.', docs: 'https://redis.io/docs/latest/', modules: ['m02', 'm12'] },
      { name: 'Object storage', mono: 'S3', tier: 'core', what: 'Blob storage for files (S3-compatible services).', why: 'Uploaded PDFs, images, audio and exports.', prereqs: 'Basic backend', when: 'Any binary files.', whenNot: 'Small structured records.', docs: null, docsNote: 'Vendor-specific — use your cloud provider’s object storage docs.', modules: ['m08', 'm12'] }
    ]
  },
  {
    id: 'ops', title: 'Deployment and operations', icon: 'rocket', desc: 'Shipping and running AI services.',
    items: [
      { name: 'Docker', mono: 'Dk', tier: 'core', what: 'Container images and runtime.', why: 'Reproducible deployments across environments.', prereqs: 'Shell', when: 'Packaging any service.', whenNot: '—', docs: 'https://docs.docker.com/get-started/', modules: ['m12'] },
      { name: 'GitHub Actions', mono: 'GA', tier: 'core', what: 'CI/CD workflows in GitHub.', why: 'Run tests, evals, builds and deploys automatically.', prereqs: 'Git', when: 'Repos hosted on GitHub.', whenNot: 'If your org standardises on another CI.', docs: 'https://docs.github.com/en/actions', modules: ['m12', 'm11'] },
      { name: 'Cloud platforms', mono: '☁', tier: 'core', what: 'Managed hosting for containers and databases.', why: 'Run services without managing servers.', prereqs: 'Docker', when: 'Production deployment.', whenNot: 'Strict on-prem requirements.', docs: 'https://docs.cloud.google.com/run/docs', modules: ['m12'] },
      { name: 'Logging', mono: 'log', tier: 'core', what: 'Structured event records.', why: 'Debugging and auditing AI requests.', prereqs: 'Python', when: 'Always.', whenNot: 'Never log secrets or unnecessary personal data.', docs: 'https://docs.python.org/3/howto/logging.html', modules: ['m01', 'm12'] },
      { name: 'Tracing (OpenTelemetry)', mono: 'OT', tier: 'core', what: 'Distributed request traces.', why: 'See retrieval, model and tool spans per request.', prereqs: 'Logging', when: 'Multi-step AI pipelines.', whenNot: '—', docs: 'https://opentelemetry.io/docs/', modules: ['m12'] },
      { name: 'Monitoring (Prometheus)', mono: 'Pm', tier: 'alternative', what: 'Metrics collection and alerting.', why: 'Latency, errors, token usage and cost dashboards.', prereqs: 'Basic ops', when: 'Self-managed metrics.', whenNot: 'When your platform provides managed monitoring.', docs: 'https://prometheus.io/docs/introduction/overview/', modules: ['m12'] },
      { name: 'Evaluation pipelines', mono: 'Ev', tier: 'core', what: 'Automated quality measurement (e.g. Ragas, Inspect).', why: 'Catch regressions from prompt/model changes.', prereqs: 'pytest, eval basics', when: 'Any production AI feature.', whenNot: '—', docs: 'https://inspect.aisi.org.uk/', modules: ['m11'] }
    ]
  }
];
