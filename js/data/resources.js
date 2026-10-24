/* Curated resource library.
   Every URL below was checked on CHECKED_ON (HTTP 200 after redirects); the
   stored URL is the final redirect target. Cost is only stated when it is
   clear from the provider (open docs, free courses, open-source repos);
   otherwise it is left null and shown as "Check provider". */
window.AIEA = window.AIEA || {};
AIEA.data = AIEA.data || {};

AIEA.data.CHECKED_ON = '2026-10-24';

AIEA.data.resourceTypes = {
  docs: { label: 'Official documentation', icon: 'book', tone: 'cyan' },
  interactive: { label: 'Interactive tutorial', icon: 'hand', tone: 'green' },
  video: { label: 'Video course', icon: 'video', tone: 'rose' },
  university: { label: 'University course', icon: 'graduation', tone: 'violet' },
  paper: { label: 'Research paper', icon: 'paper', tone: 'amber' },
  book: { label: 'Book', icon: 'library', tone: 'blue' },
  repo: { label: 'GitHub repository', icon: 'repo', tone: 'cyan' },
  exercises: { label: 'Coding exercises', icon: 'dumbbell', tone: 'green' },
  blog: { label: 'Technical blog', icon: 'pen', tone: 'blue' },
  architecture: { label: 'Reference architecture', icon: 'blueprint', tone: 'violet' }
};

AIEA.data.resourceTags = {
  python: 'Python', ml: 'Machine learning', llm: 'LLMs', prompting: 'Prompt engineering', rag: 'RAG',
  vector: 'Vector databases', agents: 'Agents', evaluation: 'Evaluation', mlops: 'MLOps',
  security: 'Security', deployment: 'Deployment', research: 'Research & advanced'
};

(function () {
  // R(id, title, publisher, type, difficulty, tags, modules, url, description, cost, duration)
  const list = [];
  function R(id, title, publisher, type, difficulty, tags, modules, url, desc, cost, duration) {
    list.push({ id, title, publisher, type, difficulty, tags, modules, url, desc, cost: cost || null, duration: duration || null });
  }
  const F = 'Free';

  // ---- Python & tooling
  R('py-tutorial', 'The Python Tutorial', 'Python Software Foundation', 'docs', 'Beginner', ['python'], ['m01'], 'https://docs.python.org/3/tutorial/', 'The official, authoritative walkthrough of Python syntax, data structures, modules, errors and classes.', F);
  R('cs50p', "CS50's Introduction to Programming with Python", 'Harvard University', 'university', 'Beginner', ['python'], ['m00', 'm01'], 'https://cs50.harvard.edu/python/', 'Lecture videos and problem sets covering functions, conditionals, loops, exceptions, libraries, tests, file I/O and OOP.', F);
  R('exercism-py', 'Python Track', 'Exercism', 'exercises', 'Beginner', ['python'], ['m01'], 'https://exercism.org/tracks/python', 'Hundreds of small exercises with automated tests and optional human mentoring.', F);
  R('py-typing', 'typing — Support for type hints', 'Python Software Foundation', 'docs', 'Intermediate', ['python'], ['m01'], 'https://docs.python.org/3/library/typing.html', 'Reference for type hints, generics, Protocols, TypedDict and Literal types.', F);
  R('py-asyncio', 'asyncio — Asynchronous I/O', 'Python Software Foundation', 'docs', 'Intermediate', ['python'], ['m01', 'm02'], 'https://docs.python.org/3/library/asyncio.html', 'Coroutines, tasks, timeouts and concurrency primitives used by async API clients and servers.', F);
  R('py-logging', 'Logging HOWTO', 'Python Software Foundation', 'docs', 'Beginner', ['python', 'deployment'], ['m01', 'm12'], 'https://docs.python.org/3/howto/logging.html', 'Basic and advanced logging tutorials: loggers, handlers, formatters and configuration.', F);
  R('py-venv', 'venv — Creation of virtual environments', 'Python Software Foundation', 'docs', 'Beginner', ['python'], ['m00', 'm01'], 'https://docs.python.org/3/library/venv.html', 'How isolated environments work and how to create them with the standard library.', F);
  R('py-errors', 'Errors and Exceptions', 'Python Software Foundation', 'docs', 'Beginner', ['python'], ['m01'], 'https://docs.python.org/3/tutorial/errors.html', 'Tutorial chapter on raising, handling, chaining and defining exceptions.', F);
  R('py-json', 'json — JSON encoder and decoder', 'Python Software Foundation', 'docs', 'Beginner', ['python'], ['m01'], 'https://docs.python.org/3/library/json.html', 'Serialising and parsing JSON — the lingua franca of model APIs.', F);
  R('py-classes', 'Classes', 'Python Software Foundation', 'docs', 'Beginner', ['python'], ['m01'], 'https://docs.python.org/3/tutorial/classes.html', 'Tutorial chapter on classes, inheritance, iterators and generators.', F);
  R('py-dataclasses', 'dataclasses — Data Classes', 'Python Software Foundation', 'docs', 'Intermediate', ['python'], ['m01'], 'https://docs.python.org/3/library/dataclasses.html', 'Lightweight typed data containers from the standard library.', F);
  R('uv', 'uv documentation', 'Astral', 'docs', 'Beginner', ['python'], ['m00', 'm01'], 'https://docs.astral.sh/uv/', 'A fast Python package and project manager: environments, lockfiles, Python versions.', F);
  R('ruff', 'Ruff documentation', 'Astral', 'docs', 'Beginner', ['python'], ['m01'], 'https://docs.astral.sh/ruff/', 'An extremely fast Python linter and formatter.', F);
  R('py-packaging', 'Packaging Python Projects', 'Python Packaging Authority', 'docs', 'Intermediate', ['python'], ['m01'], 'https://packaging.python.org/en/latest/tutorials/packaging-projects/', 'Official tutorial on pyproject.toml, building and distributing a package.', F);
  R('httpx', 'HTTPX documentation', 'HTTPX project (Encode)', 'docs', 'Intermediate', ['python'], ['m01', 'm02'], 'https://www.python-httpx.org/', 'A fully featured sync + async HTTP client with timeouts and HTTP/2 support.', F);
  R('pydantic', 'Pydantic documentation', 'Pydantic', 'docs', 'Intermediate', ['python', 'llm'], ['m01', 'm06'], 'https://pydantic.dev/docs/validation/latest/get-started/', 'Data validation with type hints — the backbone of FastAPI and most structured-output tooling.', F);
  R('pydantic-models', 'Pydantic: Models', 'Pydantic', 'docs', 'Intermediate', ['python'], ['m01', 'm06'], 'https://pydantic.dev/docs/validation/latest/concepts/models/', 'Concept guide to BaseModel, validation, serialisation and JSON Schema generation.', F);
  R('pytest', 'pytest documentation', 'pytest-dev', 'docs', 'Beginner', ['python', 'evaluation'], ['m01', 'm02', 'm11'], 'https://docs.pytest.org/en/stable/', 'The standard Python testing framework: assertions, fixtures, parametrisation, plugins.', F);
  R('pytest-fixtures', 'How to use fixtures', 'pytest-dev', 'docs', 'Intermediate', ['python'], ['m01', 'm02'], 'https://docs.pytest.org/en/stable/how-to/fixtures.html', 'Reusable test setup — essential for testing services with databases and fake model clients.', F);

  // ---- Software engineering
  R('fastapi-tutorial', 'FastAPI Tutorial — User Guide', 'FastAPI', 'docs', 'Beginner', ['python', 'deployment'], ['m01', 'm02'], 'https://fastapi.tiangolo.com/tutorial/', 'Step-by-step guide to building typed, documented HTTP APIs in Python.', F);
  R('fastapi-deps', 'FastAPI: Dependencies', 'FastAPI', 'docs', 'Intermediate', ['python'], ['m02'], 'https://fastapi.tiangolo.com/tutorial/dependencies/', 'Dependency injection for settings, database sessions, auth and clients.', F);
  R('fastapi-security', 'FastAPI: Security', 'FastAPI', 'docs', 'Intermediate', ['security'], ['m02', 'm13'], 'https://fastapi.tiangolo.com/tutorial/security/', 'OAuth2, password flows and bearer tokens in FastAPI.', F);
  R('fastapi-docker', 'FastAPI in Containers — Docker', 'FastAPI', 'docs', 'Intermediate', ['deployment'], ['m12'], 'https://fastapi.tiangolo.com/deployment/docker/', 'Building production container images for FastAPI services.', F);
  R('missing-semester', 'The Missing Semester of Your CS Education', 'MIT CSAIL', 'university', 'Beginner', ['python', 'deployment'], ['m00'], 'https://missing.csail.mit.edu/', 'Shell, editors, version control, debugging and tooling skills rarely taught in courses.', F);
  R('git-book', 'Pro Git', 'Scott Chacon & Ben Straub', 'book', 'Beginner', ['deployment'], ['m00'], 'https://git-scm.com/book/en/v2', 'The complete Git book, free to read online.', F);
  R('learn-git-branching', 'Learn Git Branching', 'Open-source project', 'interactive', 'Beginner', ['deployment'], ['m00'], 'https://learngitbranching.js.org/', 'Visual, in-browser puzzles that teach branching, rebasing and remotes.', F);
  R('gh-hello', 'GitHub Docs: Hello World', 'GitHub', 'docs', 'Beginner', ['deployment'], ['m00'], 'https://docs.github.com/en/get-started/using-github/hello-world', 'Repositories, branches, commits and pull requests in one short walkthrough.', F);
  R('mdn-http', 'HTTP', 'MDN Web Docs (Mozilla)', 'docs', 'Beginner', ['deployment'], ['m02'], 'https://developer.mozilla.org/en-US/docs/Web/HTTP', 'Reference for HTTP methods, headers, caching, CORS and authentication.', F);
  R('mdn-status', 'HTTP response status codes', 'MDN Web Docs (Mozilla)', 'docs', 'Beginner', ['deployment'], ['m02'], 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status', 'What each status code means and when to return it.', F);
  R('twelve-factor', 'The Twelve-Factor App', 'Adam Wiggins', 'architecture', 'Intermediate', ['deployment'], ['m02', 'm12'], 'https://12factor.net/', 'Methodology for config, dependencies, logs and processes in deployable services.', F);
  R('sqlalchemy', 'SQLAlchemy documentation', 'SQLAlchemy', 'docs', 'Intermediate', ['python'], ['m02'], 'https://docs.sqlalchemy.org/en/21/', 'The Python SQL toolkit and ORM.', F);
  R('alembic', 'Alembic documentation', 'SQLAlchemy', 'docs', 'Intermediate', ['deployment'], ['m02', 'm12'], 'https://alembic.sqlalchemy.org/en/latest/', 'Database schema migrations for SQLAlchemy projects.', F);
  R('postgres-docs', 'PostgreSQL Documentation', 'PostgreSQL Global Development Group', 'docs', 'Intermediate', ['vector'], ['m02', 'm07'], 'https://www.postgresql.org/docs/', 'Complete manual for PostgreSQL, including indexing, transactions and full-text search.', F);
  R('postgres-tutorial', 'PostgreSQL Tutorial', 'PostgreSQL Global Development Group', 'docs', 'Beginner', ['vector'], ['m02'], 'https://www.postgresql.org/docs/current/tutorial.html', 'Official introductory tutorial: SQL basics, joins, transactions.', F);
  R('sqlbolt', 'SQLBolt', 'SQLBolt', 'interactive', 'Beginner', ['python'], ['m02'], 'https://sqlbolt.com/', 'Short interactive lessons and exercises for learning SQL in the browser.', F);
  R('redis-docs', 'Redis documentation', 'Redis', 'docs', 'Intermediate', ['deployment'], ['m02', 'm12'], 'https://redis.io/docs/latest/', 'Caching, rate limiting, queues and data structures.', F);
  R('celery-docs', 'Celery documentation', 'Celery project', 'docs', 'Intermediate', ['deployment'], ['m02', 'm12'], 'https://docs.celeryq.dev/en/stable/', 'Distributed task queue for background jobs such as document ingestion.', F);
  R('bash-manual', 'GNU Bash Reference Manual', 'GNU Project', 'docs', 'Beginner', ['deployment'], ['m00'], 'https://www.gnu.org/software/bash/manual/', 'The reference for shell scripting.', F);
  R('ts-docs', 'TypeScript Documentation', 'Microsoft', 'docs', 'Intermediate', ['deployment'], ['m15'], 'https://www.typescriptlang.org/docs/', 'Handbook for typed JavaScript — useful for AI app frontends.', F);

  // ---- Math & ML
  R('3b1b-linalg', 'Essence of Linear Algebra', '3Blue1Brown', 'video', 'Beginner', ['ml'], ['m03'], 'https://www.3blue1brown.com/?topic=linear-algebra', 'Visual intuition for vectors, matrices, dot products and transformations.', F);
  R('mathsisfun-dot', 'Dot Product', 'Math is Fun', 'interactive', 'Beginner', ['ml', 'vector'], ['m03', 'm07'], 'https://www.mathsisfun.com/algebra/vectors-dot-product.html', 'Gentle, interactive explanation of the dot product and the angle between vectors.', F);
  R('seeing-theory', 'Seeing Theory', 'Brown University', 'interactive', 'Beginner', ['ml'], ['m03'], 'https://seeing-theory.brown.edu/', 'Interactive visual introduction to probability and statistics.', F);
  R('matrix-calculus', 'The Matrix Calculus You Need for Deep Learning', 'Terence Parr & Jeremy Howard', 'blog', 'Advanced', ['ml', 'research'], ['m03', 'm04'], 'https://explained.ai/matrix-calculus/', 'Derivatives of vector and matrix expressions as used in backpropagation.', F);
  R('google-mlcc', 'Machine Learning Crash Course', 'Google for Developers', 'interactive', 'Beginner', ['ml'], ['m03'], 'https://developers.google.com/machine-learning/crash-course', 'Modules with visualisations and exercises on regression, classification, data and fairness.', F);
  R('sklearn-guide', 'scikit-learn User Guide', 'scikit-learn', 'docs', 'Intermediate', ['ml'], ['m03'], 'https://scikit-learn.org/stable/user_guide.html', 'Comprehensive guide to supervised/unsupervised learning, model selection and metrics.', F);
  R('sklearn-start', 'scikit-learn: Getting Started', 'scikit-learn', 'docs', 'Beginner', ['ml'], ['m03'], 'https://scikit-learn.org/stable/getting_started.html', 'Fit/predict, pipelines, cross-validation and parameter search in one page.', F);
  R('kaggle-learn', 'Kaggle Learn', 'Kaggle', 'interactive', 'Beginner', ['ml', 'python'], ['m03'], 'https://www.kaggle.com/learn', 'Short hands-on courses in pandas, ML, feature engineering and more, run in notebooks.', F);
  R('numpy-basics', 'NumPy: the absolute basics for beginners', 'NumPy', 'docs', 'Beginner', ['ml', 'python'], ['m03'], 'https://numpy.org/doc/stable/user/absolute_beginners.html', 'Arrays, shapes, broadcasting and vectorised math.', F);
  R('pandas-start', 'pandas: Getting started', 'pandas', 'docs', 'Beginner', ['ml', 'python'], ['m03'], 'https://pandas.pydata.org/docs/getting_started/index.html', 'DataFrames, selection, grouping and reshaping tabular data.', F);

  // ---- Deep learning
  R('3b1b-nn', 'Neural Networks (series)', '3Blue1Brown', 'video', 'Beginner', ['ml'], ['m04', 'm05'], 'https://www.3blue1brown.com/?topic=neural-networks', 'Visual series on neurons, gradient descent, backpropagation and transformers.', F);
  R('3b1b-nn-ch1', 'But what is a neural network?', '3Blue1Brown', 'video', 'Beginner', ['ml'], ['m04'], 'https://www.youtube.com/watch?v=aircAruvnKk', 'Chapter 1 of the deep learning series — layers, weights and activations visualised.', F, '~19 min');
  R('pytorch-tutorials', 'PyTorch Tutorials', 'PyTorch', 'docs', 'Intermediate', ['ml'], ['m04'], 'https://docs.pytorch.org/tutorials/', 'Official tutorials from tensors to model deployment.', F);
  R('pytorch-basics', 'Learn the Basics', 'PyTorch', 'interactive', 'Beginner', ['ml'], ['m04'], 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html', 'Tensors, datasets, models, autograd, optimisation and saving — one runnable sequence.', F);
  R('d2l', 'Dive into Deep Learning', 'Zhang, Lipton, Li & Smola', 'book', 'Intermediate', ['ml', 'research'], ['m04', 'm05'], 'https://d2l.ai/', 'Interactive open-source book with runnable code for every concept.', F);
  R('dl-book', 'Deep Learning', 'Goodfellow, Bengio & Courville', 'book', 'Advanced', ['ml', 'research'], ['m03', 'm04'], 'https://www.deeplearningbook.org/', 'The classic textbook, free to read online.', F);
  R('fastai-course', 'Practical Deep Learning for Coders', 'fast.ai', 'video', 'Intermediate', ['ml'], ['m04'], 'https://course.fast.ai/', 'Top-down, code-first course on training and deploying deep learning models.', F);
  R('cs231n', 'CS231n: Deep Learning for Computer Vision — Notes', 'Stanford University', 'university', 'Advanced', ['ml', 'research'], ['m04', 'm14'], 'https://cs231n.github.io/', 'Course notes on optimisation, backprop, CNNs and training practice.', F);
  R('zero-to-hero', 'Neural Networks: Zero to Hero', 'Andrej Karpathy', 'video', 'Intermediate', ['ml', 'llm'], ['m04', 'm05'], 'https://karpathy.ai/zero-to-hero.html', 'Build backprop, language models and GPT from scratch in code.', F);

  // ---- LLMs
  R('karpathy-intro', 'Intro to Large Language Models', 'Andrej Karpathy', 'video', 'Beginner', ['llm'], ['m05'], 'https://www.youtube.com/watch?v=zjkBMFhNj_g', 'One-hour talk on how LLMs are trained, what they can do, and their security challenges.', F, '~1 h');
  R('karpathy-gpt', "Let's build GPT: from scratch, in code", 'Andrej Karpathy', 'video', 'Advanced', ['llm', 'research'], ['m05'], 'https://www.youtube.com/watch?v=kCc8FmEb1nY', 'Implement a small transformer language model step by step.', F, '~2 h');
  R('3b1b-transformers', 'Transformers, the tech behind LLMs', '3Blue1Brown', 'video', 'Beginner', ['llm'], ['m05'], 'https://www.youtube.com/watch?v=wjZofJX0v4M', 'Visual explanation of embeddings, attention and next-token prediction.', F);
  R('illustrated-transformer', 'The Illustrated Transformer', 'Jay Alammar', 'blog', 'Intermediate', ['llm'], ['m05'], 'https://jalammar.github.io/illustrated-transformer/', 'Diagram-driven walkthrough of the original transformer architecture.', F);
  R('attention-paper', 'Attention Is All You Need', 'Vaswani et al. (2017)', 'paper', 'Advanced', ['llm', 'research'], ['m05'], 'https://arxiv.org/abs/1706.03762', 'The paper that introduced the transformer architecture.', F);
  R('hf-learn', 'Hugging Face Learn', 'Hugging Face', 'interactive', 'Intermediate', ['llm', 'ml'], ['m05', 'm14'], 'https://huggingface.co/learn', 'Hub of free courses: LLMs, agents, diffusion, audio, deep RL and more.', F);
  R('hf-llm-course', 'LLM Course', 'Hugging Face', 'interactive', 'Intermediate', ['llm'], ['m05', 'm14'], 'https://huggingface.co/learn/llm-course/chapter1/1', 'Transformers, tokenizers, datasets, fine-tuning and sharing models.', F);
  R('hf-transformers', 'Transformers documentation', 'Hugging Face', 'docs', 'Intermediate', ['llm', 'ml'], ['m05', 'm14'], 'https://huggingface.co/docs/transformers/index', 'Load and run pretrained models for text, vision and audio.', F);
  R('hf-hub', 'Hugging Face Hub documentation', 'Hugging Face', 'docs', 'Beginner', ['llm'], ['m05', 'm14'], 'https://huggingface.co/docs/hub/index', 'Model cards, datasets, licences and Spaces.', F);
  R('hf-datasets', 'Datasets documentation', 'Hugging Face', 'docs', 'Intermediate', ['ml', 'evaluation'], ['m11', 'm14'], 'https://huggingface.co/docs/datasets/index', 'Loading, processing and sharing datasets for training and evaluation.', F);
  R('cs224n', 'CS224N: Natural Language Processing with Deep Learning', 'Stanford University', 'university', 'Advanced', ['llm', 'research'], ['m05'], 'https://web.stanford.edu/class/cs224n/', 'Course site with lectures and assignments on word vectors, transformers and LLMs.', F);
  R('cs336', 'CS336: Language Modeling from Scratch', 'Stanford University', 'university', 'Advanced', ['llm', 'research'], ['m05', 'm14'], 'http://cs336.stanford.edu/spring2025/', 'Build tokenizers, transformers, training and inference systems yourself.', F);
  R('nanogpt', 'nanoGPT', 'Andrej Karpathy', 'repo', 'Advanced', ['llm', 'research'], ['m05'], 'https://github.com/karpathy/nanoGPT', 'Minimal, readable repository for training and fine-tuning GPT-style models.', F);
  R('tiktokenizer', 'Tiktokenizer', 'Open-source project', 'interactive', 'Beginner', ['llm'], ['m05'], 'https://tiktokenizer.vercel.app/', 'Paste text and see how real tokenizers split it into tokens.', F);
  R('openai-docs', 'OpenAI API documentation', 'OpenAI', 'docs', 'Beginner', ['llm'], ['m05', 'm06'], 'https://developers.openai.com/api/docs', 'Models, text generation, streaming, tools and SDKs. API usage itself is billed.', F);
  R('openai-quickstart', 'OpenAI Developer quickstart', 'OpenAI', 'docs', 'Beginner', ['llm'], ['m05'], 'https://developers.openai.com/api/docs/quickstart', 'Make a first API request with an SDK in a few minutes.', F);
  R('openai-structured', 'Structured Outputs', 'OpenAI', 'docs', 'Intermediate', ['llm', 'prompting'], ['m06'], 'https://developers.openai.com/api/docs/guides/structured-outputs', 'Constrain model responses to a JSON Schema.', F);
  R('openai-function', 'Function calling', 'OpenAI', 'docs', 'Intermediate', ['llm', 'agents'], ['m06', 'm09'], 'https://developers.openai.com/api/docs/guides/function-calling', 'Define tools, let the model request calls, and return results.', F);
  R('openai-embeddings', 'Embeddings', 'OpenAI', 'docs', 'Intermediate', ['llm', 'vector'], ['m07'], 'https://developers.openai.com/api/docs/guides/embeddings', 'Generating embeddings and using them for search, clustering and classification.', F);
  R('openai-cookbook', 'OpenAI Cookbook', 'OpenAI', 'repo', 'Intermediate', ['llm', 'rag', 'agents'], ['m06', 'm08', 'm09'], 'https://developers.openai.com/cookbook', 'Worked examples and notebooks for common API tasks.', F);
  R('claude-docs', 'Claude Developer Platform documentation', 'Anthropic', 'docs', 'Beginner', ['llm'], ['m05', 'm06'], 'https://platform.claude.com/docs/en/home', 'Models, Messages API, tool use, prompt caching and SDKs. API usage itself is billed.', F);
  R('claude-prompting', 'Prompt engineering overview', 'Anthropic', 'docs', 'Beginner', ['prompting'], ['m06'], 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview', 'Practical techniques: clarity, examples, XML structure, role prompting and more.', F);
  R('claude-tooluse', 'Tool use overview', 'Anthropic', 'docs', 'Intermediate', ['agents', 'llm'], ['m06', 'm09'], 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview', 'How to define tools and run the tool-use loop with Claude models.', F);
  R('claude-cookbooks', 'Claude Cookbooks', 'Anthropic', 'repo', 'Intermediate', ['llm', 'rag', 'agents'], ['m06', 'm08', 'm09'], 'https://github.com/anthropics/claude-cookbooks', 'Notebooks for RAG, tool use, classification, evaluation and more.', F);
  R('prompting-guide', 'Prompt Engineering Guide', 'DAIR.AI', 'docs', 'Beginner', ['prompting'], ['m06'], 'https://www.promptingguide.ai/', 'Survey of prompting techniques with examples and paper references.', F);
  R('cot-paper', 'Chain-of-Thought Prompting Elicits Reasoning in LLMs', 'Wei et al. (2022)', 'paper', 'Advanced', ['prompting', 'research'], ['m06'], 'https://arxiv.org/abs/2201.11903', 'Shows how intermediate reasoning steps in prompts improve multi-step tasks.', F);

  // ---- Embeddings, vector search, RAG
  R('sbert', 'Sentence Transformers documentation', 'Sentence Transformers (Hugging Face)', 'docs', 'Intermediate', ['vector', 'llm'], ['m07', 'm08'], 'https://www.sbert.net/', 'Open-source embedding and reranker models with training and usage guides.', F);
  R('mteb', 'MTEB Leaderboard', 'Hugging Face', 'interactive', 'Intermediate', ['vector', 'evaluation'], ['m07'], 'https://huggingface.co/spaces/mteb/leaderboard', 'Benchmark comparison of embedding models across retrieval and other tasks.', F);
  R('faiss', 'Faiss', 'Meta AI Research', 'repo', 'Advanced', ['vector'], ['m07'], 'https://github.com/facebookresearch/faiss', 'Library for efficient similarity search and clustering of dense vectors.', F);
  R('pgvector', 'pgvector', 'pgvector project', 'repo', 'Intermediate', ['vector', 'rag'], ['m07', 'm08'], 'https://github.com/pgvector/pgvector', 'Vector similarity search inside PostgreSQL, with HNSW and IVFFlat indexes.', F);
  R('chroma-docs', 'Chroma documentation', 'Chroma', 'docs', 'Beginner', ['vector'], ['m07'], 'https://docs.trychroma.com/docs/overview/introduction', 'Open-source embedding database that is easy to run locally.', F);
  R('qdrant-docs', 'Qdrant documentation', 'Qdrant', 'docs', 'Intermediate', ['vector'], ['m07'], 'https://qdrant.tech/documentation/', 'Vector database with payload filtering, hybrid search and quantisation.', F);
  R('elastic-docs', 'Elasticsearch reference', 'Elastic', 'docs', 'Intermediate', ['vector', 'rag'], ['m07', 'm08'], 'https://www.elastic.co/docs/reference/elasticsearch', 'Keyword (BM25), vector and hybrid search at scale.', F);
  R('pinecone-learn', 'Pinecone Learn', 'Pinecone', 'blog', 'Intermediate', ['vector', 'rag'], ['m07', 'm08'], 'https://www.pinecone.io/learn/', 'Articles on vector indexes, chunking, hybrid search and RAG patterns.', F);
  R('tei', 'Text Embeddings Inference', 'Hugging Face', 'repo', 'Advanced', ['vector', 'deployment'], ['m07', 'm14'], 'https://github.com/huggingface/text-embeddings-inference', 'High-throughput server for self-hosted embedding and reranker models.', F);
  R('rag-paper', 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', 'Lewis et al. (2020)', 'paper', 'Advanced', ['rag', 'research'], ['m08'], 'https://arxiv.org/abs/2005.11401', 'The paper that named and formalised RAG.', F);
  R('lost-middle', 'Lost in the Middle: How Language Models Use Long Contexts', 'Liu et al. (2023)', 'paper', 'Advanced', ['rag', 'research'], ['m08'], 'https://arxiv.org/abs/2307.03172', 'Evidence that models use information at the start/end of context better than the middle.', F);
  R('anthropic-contextual', 'Contextual Retrieval', 'Anthropic', 'blog', 'Intermediate', ['rag'], ['m08'], 'https://www.anthropic.com/research/contextual-retrieval', 'Adding chunk-level context plus hybrid search and reranking to reduce retrieval failures.', F);
  R('cohere-rerank', 'Rerank overview', 'Cohere', 'docs', 'Intermediate', ['rag'], ['m08'], 'https://docs.cohere.com/docs/rerank-overview', 'How cross-encoder reranking reorders retrieved candidates.', F);
  R('pymupdf', 'PyMuPDF documentation', 'Artifex', 'docs', 'Intermediate', ['rag', 'python'], ['m08'], 'https://pymupdf.readthedocs.io/en/latest/', 'Fast PDF text, layout and image extraction in Python.', null);
  R('unstructured', 'Unstructured documentation', 'Unstructured', 'docs', 'Intermediate', ['rag'], ['m08'], 'https://docs.unstructured.io/transform/first-request', 'Partitioning PDFs, HTML and office documents into clean elements.', null);
  R('tesseract', 'Tesseract OCR', 'Tesseract project', 'repo', 'Intermediate', ['rag'], ['m08', 'm14'], 'https://github.com/tesseract-ocr/tesseract', 'Open-source OCR engine for scanned documents.', F);

  // ---- Agents & orchestration
  R('anthropic-agents', 'Building Effective Agents', 'Anthropic', 'architecture', 'Intermediate', ['agents'], ['m09', 'm10'], 'https://www.anthropic.com/research/building-effective-agents', 'Workflow patterns vs. agents, and when simple compositions beat frameworks.', F);
  R('react-paper', 'ReAct: Synergizing Reasoning and Acting in Language Models', 'Yao et al. (2022)', 'paper', 'Advanced', ['agents', 'research'], ['m09'], 'https://arxiv.org/abs/2210.03629', 'Interleaving reasoning traces with tool actions.', F);
  R('hf-agents-course', 'AI Agents Course', 'Hugging Face', 'interactive', 'Intermediate', ['agents'], ['m09', 'm10'], 'https://huggingface.co/learn/agents-course/unit0/introduction', 'Free course on agent fundamentals, frameworks and evaluation.', F);
  R('mcp', 'Model Context Protocol', 'Model Context Protocol project', 'docs', 'Intermediate', ['agents'], ['m09'], 'https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro', 'Open protocol for connecting models to tools and data sources.', F);
  R('langchain-docs', 'LangChain documentation', 'LangChain', 'docs', 'Intermediate', ['agents', 'rag'], ['m10'], 'https://docs.langchain.com/', 'Docs hub for LangChain, LangGraph and LangSmith.', F);
  R('langchain-overview', 'LangChain (Python) overview', 'LangChain', 'docs', 'Intermediate', ['agents'], ['m10'], 'https://docs.langchain.com/oss/python/langchain/overview', 'Models, tools, agents and integrations in the current LangChain release.', F);
  R('langgraph-overview', 'LangGraph overview', 'LangChain', 'docs', 'Intermediate', ['agents'], ['m09', 'm10'], 'https://docs.langchain.com/oss/python/langgraph/overview', 'Low-level orchestration for stateful, long-running agent workflows.', F);
  R('langgraph-persistence', 'LangGraph: Persistence', 'LangChain', 'docs', 'Advanced', ['agents'], ['m10'], 'https://docs.langchain.com/oss/python/langgraph/persistence', 'Checkpointers, threads and state history.', F);
  R('langgraph-interrupts', 'LangGraph: Interrupts', 'LangChain', 'docs', 'Advanced', ['agents', 'security'], ['m09', 'm10'], 'https://docs.langchain.com/oss/python/langgraph/interrupts', 'Pausing graphs for human review and approval.', F);
  R('langsmith', 'LangSmith observability', 'LangChain', 'docs', 'Intermediate', ['evaluation', 'mlops'], ['m10', 'm11'], 'https://docs.langchain.com/langsmith/observability', 'Tracing and monitoring LLM applications. Hosted service with its own pricing.', null);

  // ---- Evaluation
  R('ragas-docs', 'Ragas documentation', 'Ragas', 'docs', 'Intermediate', ['evaluation', 'rag'], ['m11'], 'https://docs.ragas.io/en/stable/', 'Metrics and tooling for evaluating RAG and LLM applications.', F);
  R('openai-evals', 'OpenAI Evals', 'OpenAI', 'repo', 'Advanced', ['evaluation'], ['m11'], 'https://github.com/openai/evals', 'Framework and registry for evaluating LLMs and LLM systems.', F);
  R('inspect', 'Inspect', 'UK AI Security Institute', 'docs', 'Advanced', ['evaluation'], ['m11'], 'https://inspect.aisi.org.uk/', 'Open-source framework for LLM evaluations: datasets, solvers, scorers.', F);
  R('llm-judge-paper', 'Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena', 'Zheng et al. (2023)', 'paper', 'Advanced', ['evaluation', 'research'], ['m11'], 'https://arxiv.org/abs/2306.05685', 'Measures agreement and biases (position, verbosity, self-preference) of LLM judges.', F);

  // ---- Production
  R('docker-start', 'Docker: Get started', 'Docker', 'docs', 'Beginner', ['deployment'], ['m12'], 'https://docs.docker.com/get-started/', 'Images, containers, Dockerfiles and registries.', F);
  R('docker-compose', 'Docker Compose', 'Docker', 'docs', 'Intermediate', ['deployment'], ['m12'], 'https://docs.docker.com/compose/', 'Run multi-container apps (API + Postgres + Redis) locally.', F);
  R('gh-actions', 'GitHub Actions documentation', 'GitHub', 'docs', 'Intermediate', ['deployment', 'mlops'], ['m12'], 'https://docs.github.com/en/actions', 'CI/CD workflows for tests, evals, builds and deploys.', F);
  R('otel', 'OpenTelemetry documentation', 'OpenTelemetry (CNCF)', 'docs', 'Intermediate', ['mlops', 'deployment'], ['m12'], 'https://opentelemetry.io/docs/', 'Vendor-neutral traces, metrics and logs.', F);
  R('prometheus', 'Prometheus overview', 'Prometheus (CNCF)', 'docs', 'Intermediate', ['mlops'], ['m12'], 'https://prometheus.io/docs/introduction/overview/', 'Metrics collection and alerting.', F);
  R('k6', 'Grafana k6 documentation', 'Grafana Labs', 'docs', 'Intermediate', ['deployment'], ['m12'], 'https://grafana.com/docs/k6/latest/', 'Scripted load testing for APIs.', F);
  R('sre-book', 'Site Reliability Engineering', 'Google', 'book', 'Advanced', ['deployment', 'mlops'], ['m12'], 'https://sre.google/sre-book/table-of-contents/', 'SLOs, monitoring, incident response and postmortems — free online.', F);
  R('cloud-run', 'Cloud Run documentation', 'Google Cloud', 'docs', 'Intermediate', ['deployment'], ['m12'], 'https://docs.cloud.google.com/run/docs', 'Serverless container hosting. The service itself is billed.', null);
  R('fly-docs', 'Fly.io documentation', 'Fly.io', 'docs', 'Intermediate', ['deployment'], ['m12'], 'https://docs.fly.io/', 'Deploying containers close to users. The service itself is billed.', null);
  R('mlflow', 'MLflow documentation', 'MLflow (Linux Foundation)', 'docs', 'Advanced', ['mlops'], ['m14'], 'https://mlflow.org/docs/latest/index.html', 'Experiment tracking, model registry and GenAI tracing.', F);

  // ---- Security
  R('owasp-llm', 'OWASP Top 10 for LLM Applications', 'OWASP', 'architecture', 'Intermediate', ['security'], ['m06', 'm13'], 'https://owasp.org/projects/top-10-for-large-language-model-applications', 'The most critical risks for LLM apps: prompt injection, data leakage, excessive agency and more.', F);
  R('owasp-genai', 'OWASP GenAI Security Project', 'OWASP', 'architecture', 'Intermediate', ['security'], ['m13'], 'https://genai.owasp.org/', 'Guides, checklists and threat taxonomies for generative AI security.', F);
  R('owasp-top10', 'OWASP Top 10 (Web)', 'OWASP', 'architecture', 'Intermediate', ['security'], ['m02', 'm13'], 'https://top10.owasp.org/', 'The baseline web application security risks every AI backend still faces.', F);
  R('owasp-cheatsheets', 'OWASP Cheat Sheet Series', 'OWASP', 'docs', 'Intermediate', ['security'], ['m02', 'm13'], 'https://cheatsheetseries.owasp.org/', 'Concise guidance on auth, file upload, secrets, logging and more.', F);
  R('nist-rmf', 'AI Risk Management Framework', 'NIST', 'architecture', 'Advanced', ['security'], ['m13'], 'https://www.nist.gov/itl/ai-risk-management-framework', 'Framework for governing, mapping, measuring and managing AI risks.', F);
  R('indirect-pi', 'Not what you\'ve signed up for: Indirect Prompt Injection', 'Greshake et al. (2023)', 'paper', 'Advanced', ['security', 'research'], ['m13'], 'https://arxiv.org/abs/2302.12173', 'Demonstrates attacks via retrieved documents, web pages and emails.', F);
  R('willison-pi', 'Prompt injection (series)', 'Simon Willison', 'blog', 'Intermediate', ['security'], ['m06', 'm13'], 'https://simonwillison.net/series/prompt-injection/', 'Long-running, practical writing on prompt injection and why it is hard to fix.', F);
  R('hacksplaining', 'Hacksplaining', 'Hacksplaining', 'interactive', 'Beginner', ['security'], ['m13'], 'https://www.hacksplaining.com/', 'Interactive lessons on common web vulnerabilities.', null);
  R('slsa', 'SLSA: Supply-chain Levels for Software Artifacts', 'OpenSSF', 'architecture', 'Advanced', ['security'], ['m13'], 'https://slsa.dev/', 'Framework for build integrity and provenance.', F);
  R('gh-supply-chain', 'Secure your supply chain', 'GitHub', 'docs', 'Intermediate', ['security'], ['m13'], 'https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain', 'Dependency review, Dependabot alerts and updates.', F);
  R('presidio', 'Presidio', 'Presidio open-source project', 'repo', 'Advanced', ['security'], ['m13'], 'https://github.com/data-privacy-stack/presidio', 'PII detection and anonymisation for text and images.', F);

  // ---- Specialisations
  R('lora-paper', 'LoRA: Low-Rank Adaptation of Large Language Models', 'Hu et al. (2021)', 'paper', 'Advanced', ['research', 'llm'], ['m14'], 'https://arxiv.org/abs/2106.09685', 'Parameter-efficient fine-tuning via low-rank update matrices.', F);
  R('qlora-paper', 'QLoRA: Efficient Finetuning of Quantized LLMs', 'Dettmers et al. (2023)', 'paper', 'Advanced', ['research', 'llm'], ['m14'], 'https://arxiv.org/abs/2305.14314', 'Fine-tuning quantised models on a single GPU.', F);
  R('hf-peft', 'PEFT documentation', 'Hugging Face', 'docs', 'Advanced', ['llm', 'mlops'], ['m14'], 'https://huggingface.co/docs/peft/index', 'LoRA and other parameter-efficient fine-tuning methods.', F);
  R('hf-trl', 'TRL documentation', 'Hugging Face', 'docs', 'Advanced', ['llm', 'mlops'], ['m14'], 'https://huggingface.co/docs/trl/index', 'Supervised fine-tuning and preference optimisation trainers.', F);
  R('whisper', 'Whisper', 'OpenAI', 'repo', 'Intermediate', ['llm'], ['m14'], 'https://github.com/openai/whisper', 'Open-weight speech recognition model and reference code.', F);
  R('vllm', 'vLLM documentation', 'vLLM project', 'docs', 'Advanced', ['deployment', 'llm'], ['m14'], 'https://docs.vllm.ai/en/latest/', 'High-throughput inference server for open-weight models.', F);
  R('ollama', 'Ollama', 'Ollama', 'repo', 'Beginner', ['llm', 'deployment'], ['m05', 'm14'], 'https://github.com/ollama/ollama', 'Run open-weight models locally with a simple CLI and API.', F);
  R('llamacpp', 'llama.cpp', 'ggml-org', 'repo', 'Advanced', ['llm', 'deployment'], ['m14'], 'https://github.com/ggml-org/llama.cpp', 'C/C++ inference with quantisation for CPUs and consumer GPUs.', F);

  const checked = AIEA.data.CHECKED_ON;
  list.forEach(r => { r.checked = checked; });
  AIEA.data.resources = list;
  AIEA.data.resourceById = Object.fromEntries(list.map(r => [r.id, r]));
})();
