# AI Engineering Academy — Zero to Job-Ready

**One clear lesson a day. No random tutorials.**

A structured, day-by-day roadmap that takes you from your first line of Python to deploying RAG apps and AI agents. It's built for people who keep jumping between YouTube videos and losing their way.

🔗 **Live site:** https://mohakamran.github.io/ai-engineering-academy/

## How it works

1. **Pick your pace.** Choose a daily time budget (30 min to 3 h) and how many days a week you study. The plan resizes itself to fit.
2. **Do today's mission.** Each task follows four steps: Learn → watch or read **one** vetted link → Practice → mark it done.
3. **Build real projects.** Build days come right after the module that prepares you for them.
4. **Become job-ready.** A checklist tracks what employers look for: a RAG app, an agent, an evaluation suite, a deployed capstone and portfolio projects.

### Focus tools
- **Today:** just the current day's mission, so it's always clear what to do next.
- **Parking Lot:** if something distracting comes up, park it here instead of opening a new tutorial. The site suggests which lesson covers it.
- **Learning journal:** write 2–3 lines about what you learned each day and log your study time.
- **Streak calendar:** 12 weeks of activity at a glance.

## Pages

| Page | What it's for |
|---|---|
| **Today** | Your mission for the day, daily log, parking lot and what's coming up |
| **Plan** | The whole schedule, week by week and day by day |
| **Roadmap** | The big picture: 10 stages and 16 modules, with filters |
| **Lessons** | 294 topics across 16 modules. 45 have full interactive lessons with diagrams, exercises and quizzes. |
| **Projects** | 12 portfolio projects with architecture diagrams, milestones and acceptance criteria |
| **Resources** | 143 hand-picked, link-checked resources (docs, courses, papers, repos) |
| **Progress** | Streaks, journal, job readiness, skills earned, notes, export/import |
| **Tech stack** | Which tools matter, when to use them and when not to |

### Learning paths

| Path | For | Typical length |
|---|---|---|
| Beginner | No programming experience | ≈ 9–13 months at 1.5–2 h/day |
| Intermediate | Web/backend developers | ≈ 5–7 months at 1.5–2 h/day |
| Advanced | Experienced engineers | ≈ 4–6 months at 1.5–2 h/day |
| Accelerated | Intensive foundation | 12 weeks at ≈ 2 h/day, 7 days/week |

These lengths come from the generated plan itself. The Plan page shows the exact number of days for your settings. Changing your pace or path never deletes progress.

## Tracking your daily progress

- Progress is saved in your browser's **localStorage**. There are no accounts and no server, and nothing leaves your device.
- It's tied to **one browser on one device**. To move it to another device, open **Progress → Export progress** there, then **Import** the file on the other device.
- **Progress → Export as Markdown** saves your learning journal as a `.md` file. You can commit it to your own repo to keep a public record of your learning.
- Clearing browser data erases progress, so export a backup now and then.

## Run locally

There's no build step and nothing to install:

```bash
open index.html                 # or: python3 -m http.server 8000
```

## Deploy on GitHub Pages

The site is pure static files with hash-based routing, so Pages serves it as-is:

1. Push to a GitHub repository.
2. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

The `.nojekyll` file tells Pages to serve the files without running Jekyll.

## Project structure

```
index.html               App shell
css/styles.css           Design tokens (dark + light) and components
js/data/                 Curriculum, resources, paths, projects, tech stack (content only)
js/plan.js               Day-by-day plan engine (packs topics + build days into your daily budget)
js/store.js              localStorage persistence (validated, fails safely)
js/diagrams.js           SVG diagrams and interactive demos
js/components.js         Shared UI, progress maths, job-ready checklist
js/views/                today, home, roadmap, curriculum, library, progress
js/app.js                Navigation, theme, search, router
```

To add a topic, append `['Title', 'One-line summary']` to a module's `topics` in `js/data/curriculum-*.js`. The plan picks it up automatically.

## Accuracy

- Every resource link was checked on 2026-10-24, and only links that loaded are included. Pricing is shown only when it's clear from the provider.
- There are no fake ratings, testimonials or statistics. Every number on the site is either counted from the content or calculated from your own progress.
- Technology names appear as plain text. No logos are used.

## Accessibility

The site has semantic landmarks, a skip link, keyboard-accessible accordions, `aria-pressed`/`aria-expanded` states, a focus-trapped modal, text labels on every diagram, support for reduced motion, and dark and light themes. It's responsive from 320px up.
