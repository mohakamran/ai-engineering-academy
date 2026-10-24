/* Home / learning dashboard */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc;

  function skillMapSvg() {
    const pos = Object.fromEntries(D.skills.map(s => [s.id, s]));
    const edges = D.skillEdges.map(([a, b]) => `<line class="sm-edge" data-a="${a}" data-b="${b}" x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}"/>`).join('');
    const nodes = D.skills.map(s => `<g class="sm-node${ui.skillEarned(s) ? ' done' : ''}" data-skill="${s.id}" tabindex="0" role="button" aria-label="${esc(s.label)} skill: show related modules"><circle cx="${s.x}" cy="${s.y}" r="40"/><text x="${s.x}" y="${s.y + 4}" text-anchor="middle">${esc(s.label)}</text></g>`).join('');
    return `<svg viewBox="40 10 770 330" role="group" aria-label="Skill map connecting Python, APIs, databases, ML, LLMs, RAG, agents, evaluation, security and deployment">${edges}${nodes}</svg>`;
  }

  function skillPanel(id) {
    const s = D.skills.find(x => x.id === id);
    if (!s) return `<div class="panel"><div class="panel-title">${icon('network')} Skill map</div><p class="muted">Select a skill to see how it connects to others and which modules teach it. Skills turn green when you complete every topic in their modules.</p><div class="legend"><span>${icon('circle')} Not yet earned</span><span style="color:var(--green)">${icon('checkCircle')} Earned</span></div></div>`;
    const links = D.skillEdges.filter(e => e.includes(id)).map(e => e[0] === id ? e[1] : e[0]).map(x => D.skills.find(k => k.id === x).label);
    return `<div class="panel"><div class="panel-title">${icon(ui.skillEarned(s) ? 'checkCircle' : 'target')} ${esc(s.label)}</div>
      <p class="text-sm muted">Connects to: ${links.map(esc).join(', ')}</p>
      <div class="stack">${s.modules.map(mid => { const m = D.moduleById[mid], p = ui.moduleProgress(m); return `<a class="mod-pill" href="#/curriculum/${m.id}"><span class="mod-num">${ui.modLabel(m)}</span><span class="mod-txt"><b>${esc(m.title)}</b><small>${p.done}/${p.total} topics · ${ui.fmtHours(ui.estHours(m))}</small></span>${icon('chevronRight')}</a>`; }).join('')}</div></div>`;
  }

  function stageTile(st) {
    const status = ui.stageStatus(st);
    const hours = st.modules.reduce((s, id) => s + ui.estHours(D.moduleById[id]), 0);
    return `<a class="stage-tile" href="#/roadmap?stage=${st.n}">
      <div class="row" style="justify-content:space-between"><span class="stage-icon" style="background:${ui.stageColor(st.tone)}">${icon(st.icon)}</span><span class="stage-num">STAGE ${String(st.n).padStart(2, '0')}</span></div>
      <h4>${esc(st.title)}</h4><p>${esc(st.desc)}</p>
      <div class="stage-meta"><span>${icon('clock')} ~${hours} h</span><span>${st.requires.length ? 'After ' + st.requires.map(r => 'S' + r).join(', ') : 'Start here'}</span></div>
      <div class="row" style="justify-content:space-between"><span class="status-dot ${status}">${ui.statusLabel(status)}</span><span class="text-sm muted">${ui.stageProgress(st).pct}%</span></div>
      <div class="progress progress-sm"><span style="width:${ui.stageProgress(st).pct}%"></span></div></a>`;
  }

  AIEA.views.home = {
    title: () => null,
    render() {
      const path = ui.currentPath();
      const plan = AIEA.plan.build();
      const cur = AIEA.plan.currentIndex(plan);
      const day = plan[Math.min(cur, plan.length - 1)];
      const started = cur > 0 || ui.overall().done > 0;
      const act = ui.activity();
      const jr = ui.jobReady();
      const first = day.items[0];
      const firstTitle = first.type === 'topic' ? first.topic.title : first.project.title + ': ' + first.project.milestones[first.ms][0];

      return `
      <section class="hero"><div class="container hero-grid">
        <div>
          <span class="eyebrow">${icon('sparkles')} Zero → job-ready AI engineer</span>
          <h1>One clear lesson a day. <span class="grad-text">No random tutorials.</span></h1>
          <p class="lead">A complete, structured path from your first line of Python to deployed RAG apps and AI agents.</p>
          <div class="hero-cta"><a class="btn btn-primary" href="#/today">${icon('target')} ${started ? `Continue Day ${day.n}` : 'Start Day 1'}</a><a class="btn" href="#/plan">${icon('list')} See the full plan</a></div>
          <div class="hero-meta"><span>${icon('layers')} ${D.modules.length} modules</span><span>${icon('book')} ${D.allTopics.length} lessons</span><span>${icon('hammer')} ${D.projects.length} projects</span><span>${icon('library')} ${D.resources.length} vetted links</span></div>
        </div>
        <div class="hero-art">${AIEA.diagrams.hero()}</div>
      </div></section>

      <section class="container">
        <div class="card card-elev mission-preview">
          <div class="big-day"><small>${started ? 'Today' : 'Your first day'}</small>Day ${day.n}</div>
          <div style="min-width:0"><div class="tags" style="margin-bottom:6px"><span class="tag tag-cyan">${ui.modLabel(day.module)} ${esc(day.module.short)}</span><span class="tag">${icon('clock')}${AIEA.plan.fmtMin(day.min)}</span>${day.items.length > 1 ? `<span class="tag">${day.items.length} tasks</span>` : ''}</div>
            <h3 class="mb-0">${esc(firstTitle)}</h3>
            <div class="row mt-1 text-sm muted"><span>${icon('flame')} ${act.streak} day streak</span><span>${icon('trophy')} ${jr.pct}% job-ready</span><span>${icon('route')} ${esc(path.name)} · ${AIEA.plan.fmtMin(plan.budget)}/day</span></div></div>
          <a class="btn btn-primary" href="#/today">${icon('arrowRight')} Open mission</a>
        </div>
      </section>

      <section class="section container">
        <div class="section-head"><div><span class="eyebrow">${icon('compass')} How it works</span><h2>Stop guessing what to learn next</h2></div></div>
        <div class="how">
          <div class="how-step"><div class="card-icon">${icon('clock')}</div><h3>Pick your pace</h3><p>30 min to 3 h a day. The plan resizes itself.</p></div>
          <div class="how-step"><div class="card-icon">${icon('target')}</div><h3>Do today’s mission</h3><p>Learn → watch one vetted link → practice → done.</p></div>
          <div class="how-step"><div class="card-icon">${icon('hammer')}</div><h3>Build real projects</h3><p>Build days are scheduled right after each module.</p></div>
          <div class="how-step"><div class="card-icon">${icon('trophy')}</div><h3>Become job-ready</h3><p>Portfolio, deployed capstone and interview stories.</p></div>
        </div>
      </section>

      <section class="section container" id="paths" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">${icon('route')} Starting point</span><h2>Where are you starting from?</h2></div></div>
        <div class="grid grid-4">${Object.values(D.paths).map(p => `
          <button class="card card-link path-pick" data-path="${p.id}" aria-pressed="${p.id === path.id}" style="text-align:left;${p.id === path.id ? 'border-color:var(--cyan);background:color-mix(in srgb,var(--cyan) 8%,transparent)' : ''}">
            <div class="row" style="justify-content:space-between"><div class="card-icon" style="margin:0">${icon(p.icon)}</div>${p.id === path.id ? `<span class="status-dot active">Active</span>` : ''}</div>
            <h3 class="mt-2">${esc(p.name)}</h3><p class="text-sm mb-0">${esc(p.audience)}</p>
            <div class="tags mt-1"><span class="tag">${icon('clock')}${esc(p.duration)}</span></div>
          </button>`).join('')}</div>
      </section>

      <section class="section container" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">${icon('map')} The journey</span><h2>10 stages to job-ready</h2></div><a class="btn" href="#/roadmap">Roadmap ${icon('arrowRight')}</a></div>
        <div class="stage-strip">${D.stages.map(stageTile).join('')}</div>
      </section>

      <section class="section container" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">${icon('trophy')} Job-ready checklist</span><h2>What employers look for — ${jr.pct}% there</h2></div></div>
        <div class="jr-grid">${jr.items.map(x => `<a class="jr-item${x.pct === 100 ? ' full' : ''}" href="${x.href}">${icon(x.pct === 100 ? 'checkCircle' : x.icon)}<span>${esc(x.label)}<div class="progress progress-sm"><span style="width:${x.pct}%"></span></div></span><output>${x.pct}%</output></a>`).join('')}</div>
      </section>

      <section class="section container" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">${icon('network')} Skill map</span><h2>How the skills connect</h2></div></div>
        <div class="skillmap-wrap"><div class="panel skillmap" id="skillmap">${skillMapSvg()}</div><div id="skill-panel">${skillPanel(null)}</div></div>
      </section>

      <section class="section container" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">${icon('hammer')} Portfolio</span><h2>Projects you’ll build</h2></div><a class="btn" href="#/projects">All ${D.projects.length} ${icon('arrowRight')}</a></div>
        <div class="grid grid-3">${['p02', 'p04', 'p12'].map(id => AIEA.ui.projectCard(D.projectById[id])).join('')}</div>
      </section>`;
    },
    mount(root) {
      root.querySelectorAll('.path-pick').forEach(b => b.addEventListener('click', () => {
        AIEA.store.setPath(b.dataset.path);
        ui.toast(`Active path: ${D.paths[b.dataset.path].name}`);
      }));
      const map = root.querySelector('#skillmap');
      const select = id => {
        map.classList.toggle('has-focus', !!id);
        map.querySelectorAll('.sm-node').forEach(n => n.classList.toggle('on', n.dataset.skill === id || D.skillEdges.some(e => e.includes(id) && e.includes(n.dataset.skill))));
        map.querySelectorAll('.sm-edge').forEach(l => l.classList.toggle('on', l.dataset.a === id || l.dataset.b === id));
        root.querySelector('#skill-panel').innerHTML = skillPanel(id);
      };
      map.addEventListener('click', e => { const n = e.target.closest('.sm-node'); if (n) select(n.dataset.skill); });
      map.addEventListener('keydown', e => { const n = e.target.closest('.sm-node'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(n.dataset.skill); } });
    }
  };
})();
