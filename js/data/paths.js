/* Roadmap stages and learning paths. All paths share the same modules;
   paths change emphasis (core / light / optional) and pacing only. */
window.AIEA = window.AIEA || {};
AIEA.data = AIEA.data || {};

AIEA.data.stages = [
  { n: 1, title: 'Programming and Python Foundations', icon: 'code', tone: 'cyan', modules: ['m00', 'm01', 'm02'], requires: [], desc: 'Write, test and ship Python services.' },
  { n: 2, title: 'AI and Machine Learning Fundamentals', icon: 'sigma', tone: 'blue', modules: ['m03', 'm04'], requires: [1], desc: 'Vectors, optimisation, ML workflow and neural nets.' },
  { n: 3, title: 'LLMs and Prompt Engineering', icon: 'brain', tone: 'violet', modules: ['m05'], requires: [1], desc: 'How LLMs work and how to choose them.' },
  { n: 4, title: 'APIs and Structured Outputs', icon: 'braces', tone: 'violet', modules: ['m06'], requires: [3], desc: 'Prompts, JSON schemas and tool calls.' },
  { n: 5, title: 'Embeddings and Vector Search', icon: 'scan', tone: 'cyan', modules: ['m07'], requires: [2, 4], desc: 'Meaning as vectors; similarity search.' },
  { n: 6, title: 'Retrieval-Augmented Generation', icon: 'database', tone: 'blue', modules: ['m08'], requires: [5], desc: 'Grounded answers with citations.' },
  { n: 7, title: 'AI Agents and Workflow Orchestration', icon: 'bot', tone: 'violet', modules: ['m09', 'm10'], requires: [4, 6], desc: 'Controlled tool use and stateful graphs.' },
  { n: 8, title: 'Evaluation and Reliability', icon: 'gauge', tone: 'green', modules: ['m11'], requires: [6], desc: 'Measure quality; change safely.' },
  { n: 9, title: 'Production Deployment and Security', icon: 'rocket', tone: 'amber', modules: ['m12', 'm13'], requires: [8], desc: 'Deploy, observe and defend AI systems.' },
  { n: 10, title: 'Advanced Specialization and Portfolio', icon: 'trophy', tone: 'rose', modules: ['m14', 'm15'], requires: [9], desc: 'Specialise and ship a capstone.' }
];

AIEA.data.paths = {
  beginner: {
    id: 'beginner', name: 'Beginner', icon: 'compass',
    duration: '≈ 9–13 months', pace: '1.5–2 h / day, self-paced',
    audience: 'Little or no programming experience.',
    focus: 'Programming fundamentals first, then progressively more complex AI applications. Includes extra exercises and prerequisite explanations.',
    multiplier: 1.25, projectFactor: 0.4,
    emphasis: { m00: 'core', m01: 'core', m02: 'core', m03: 'core', m04: 'core', m05: 'core', m06: 'core', m07: 'core', m08: 'core', m09: 'core', m10: 'light', m11: 'core', m12: 'core', m13: 'core', m14: 'optional', m15: 'core' },
    tips: ['Do every exercise — reading alone will not build skill.', 'Spend extra time on Modules 1–2; everything later depends on them.', 'Build the small projects before attempting the capstone.']
  },
  intermediate: {
    id: 'intermediate', name: 'Intermediate', icon: 'route',
    duration: '≈ 5–7 months', pace: '1.5–2 h / day',
    audience: 'Developers familiar with web apps, REST APIs, Git and databases.',
    focus: 'Python, LLM integration, RAG, agents, evaluation, security, deployment and portfolio projects.',
    multiplier: 0.85, projectFactor: 0.4,
    emphasis: { m00: 'light', m01: 'core', m02: 'light', m03: 'light', m04: 'light', m05: 'core', m06: 'core', m07: 'core', m08: 'core', m09: 'core', m10: 'core', m11: 'core', m12: 'core', m13: 'core', m14: 'optional', m15: 'core' },
    tips: ['Skim Module 2 — focus on retries, idempotency and secrets.', 'Learn Math & ML for intuition, not proofs.', 'Ship RAG and evaluation projects; they carry the most portfolio weight.']
  },
  advanced: {
    id: 'advanced', name: 'Advanced', icon: 'zap',
    duration: '≈ 4–6 months', pace: '1.5–2 h / day',
    audience: 'Experienced engineers specialising in production-grade applied AI.',
    focus: 'LLM systems, retrieval, agents, evaluation, security and operations, plus at least one specialisation branch.',
    multiplier: 0.75, projectFactor: 0.3,
    emphasis: { m00: 'light', m01: 'light', m02: 'light', m03: 'light', m04: 'light', m05: 'core', m06: 'core', m07: 'core', m08: 'core', m09: 'core', m10: 'core', m11: 'core', m12: 'core', m13: 'core', m14: 'core', m15: 'core' },
    tips: ['Use foundation modules as reference, not a course.', 'Go deep on evaluation and security — they separate prototypes from products.', 'Pick one Module 14 branch and ship it.']
  },
  accelerated: {
    id: 'accelerated', name: 'Accelerated 12-week', icon: 'flame',
    duration: '12 weeks', pace: '≈ 2 h / day, 7 days / week',
    audience: 'Experienced developers who want a structured, intensive foundation.',
    focus: 'A fixed weekly plan through the core curriculum. This is an accelerated foundation — advanced specialisation needs further study.',
    multiplier: 0.6, projectFactor: 0.15,
    emphasis: { m00: 'light', m01: 'core', m02: 'core', m03: 'light', m04: 'light', m05: 'core', m06: 'core', m07: 'core', m08: 'core', m09: 'core', m10: 'core', m11: 'core', m12: 'core', m13: 'core', m14: 'optional', m15: 'core' },
    tips: ['Protect the daily 2-hour block.', 'If you fall behind, push the plan back a week rather than skipping evaluation or security.', 'Changing pace never resets your progress.'],
    weeks: [
      { w: 1, title: 'Python for AI Engineering & environment', modules: ['m00', 'm01'], items: ['Environment, Git, uv', 'Type hints, Pydantic, async', 'pytest basics'], deliverable: 'Text analysis CLI with tests (P01)' },
      { w: 2, title: 'FastAPI, Pydantic, testing & architecture', modules: ['m02'], items: ['REST design, schemas, status codes', 'Config, secrets, DI', 'Retries, timeouts, idempotency'], deliverable: 'Tested FastAPI + Postgres backend' },
      { w: 3, title: 'ML & deep learning fundamentals', modules: ['m03', 'm04'], items: ['Vectors & cosine similarity', 'Gradient descent & training loops', 'Splits, metrics, leakage'], deliverable: 'Small classifier with evaluation write-up' },
      { w: 4, title: 'LLM concepts, model APIs & prompting', modules: ['m05', 'm06'], items: ['Tokens, context, sampling', 'Hallucinations & model selection', 'Clear task prompts'], deliverable: 'Streaming chatbot (P02)' },
      { w: 5, title: 'Structured outputs, tool calling & embeddings', modules: ['m06', 'm07'], items: ['JSON Schema & validation', 'Tool-call loop', 'Embeddings basics'], deliverable: 'Extraction API (P03)' },
      { w: 6, title: 'Vector search & RAG foundations', modules: ['m07', 'm08'], items: ['Indexing & metadata', 'Ingestion & chunking', 'Grounded generation'], deliverable: 'Semantic search (P06)' },
      { w: 7, title: 'Advanced retrieval, RAG evaluation & citations', modules: ['m08'], items: ['Hybrid search & reranking', 'Citations & abstention', 'Failure analysis'], deliverable: 'PDF Q&A with citations (P04)' },
      { w: 8, title: 'AI agents & LangGraph workflows', modules: ['m09', 'm10'], items: ['Workflows vs agents', 'State, checkpoints, approvals', 'Tool permissions'], deliverable: 'Controlled agent (P08)' },
      { w: 9, title: 'Testing, reliability & evaluation pipelines', modules: ['m11'], items: ['Eval datasets', 'LLM-as-judge calibration', 'Regression evals in CI'], deliverable: 'RAG eval suite (P10)' },
      { w: 10, title: 'Security, observability & cost optimisation', modules: ['m13', 'm12'], items: ['Prompt injection & isolation', 'Tracing & token cost', 'Caching'], deliverable: 'Security test report' },
      { w: 11, title: 'Docker, CI/CD & deployment', modules: ['m12'], items: ['Containers & Compose', 'GitHub Actions', 'Cloud deploy & rollback'], deliverable: 'Deployed AI service' },
      { w: 12, title: 'Capstone, portfolio & interview prep', modules: ['m15'], items: ['Scope & build capstone MVP', 'README, diagram, demo', 'Interview stories'], deliverable: 'Capstone v1 (P12)' }
    ]
  }
};

AIEA.data.categories = {
  foundations: 'Foundations', ml: 'Machine learning', llm: 'LLMs', retrieval: 'Retrieval', agents: 'Agents',
  reliability: 'Reliability', production: 'Production', security: 'Security', specialization: 'Specialization', career: 'Career'
};

/* Skills shown on the skill map and progress page; earned when all linked modules are complete. */
AIEA.data.skills = [
  { id: 'python', label: 'Python', modules: ['m01'], x: 110, y: 90 },
  { id: 'apis', label: 'APIs', modules: ['m02'], x: 260, y: 60 },
  { id: 'databases', label: 'Databases', modules: ['m02'], x: 110, y: 250 },
  { id: 'ml', label: 'ML basics', modules: ['m03', 'm04'], x: 250, y: 190 },
  { id: 'llms', label: 'LLMs', modules: ['m05', 'm06'], x: 420, y: 110 },
  { id: 'rag', label: 'RAG', modules: ['m07', 'm08'], x: 410, y: 270 },
  { id: 'agents', label: 'Agents', modules: ['m09', 'm10'], x: 580, y: 80 },
  { id: 'evaluation', label: 'Evaluation', modules: ['m11'], x: 590, y: 230 },
  { id: 'security', label: 'Security', modules: ['m13'], x: 730, y: 140 },
  { id: 'deployment', label: 'Deployment', modules: ['m12'], x: 740, y: 290 }
];
AIEA.data.skillEdges = [
  ['python', 'apis'], ['python', 'ml'], ['python', 'databases'], ['apis', 'llms'], ['databases', 'rag'], ['ml', 'llms'], ['ml', 'rag'],
  ['llms', 'rag'], ['llms', 'agents'], ['rag', 'agents'], ['rag', 'evaluation'], ['agents', 'evaluation'], ['agents', 'security'],
  ['evaluation', 'deployment'], ['security', 'deployment'], ['apis', 'deployment']
];
