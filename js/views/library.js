/* Resource library, project gallery/detail and technology stack explorer */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc, S = () => AIEA.store;

  // ═════════ Project card (also used on Home)
  function milestoneProgress(p) {
    const done = p.milestones.filter((_, i) => S().isMilestone(`${p.id}:${i}`)).length;
    return { done, total: p.milestones.length, pct: Math.round(done / p.milestones.length * 100) };
  }
  ui.milestoneProgress = milestoneProgress;
  ui.projectCard = function (p) {
    const mp = milestoneProgress(p);
    return `<a class="card card-link proj-card" href="#/projects/${p.id}">
      <div class="proj-art">${AIEA.diagrams.flow(p.flow, null, { bare: true })}</div>
      <div class="proj-body"><div class="row" style="justify-content:space-between"><span class="proj-num">PROJECT ${String(p.num).padStart(2, '0')}</span>${ui.diffTag(p.difficulty)}</div>
        <h3>${esc(p.title)}</h3><p class="mb-0">${esc(p.summary)}</p>
        <div class="tags">${p.tech.slice(0, 5).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="card-foot"><span class="text-sm muted">${icon('clock')} ${esc(p.duration)}</span><span class="spacer"></span><span class="text-sm muted">${mp.done}/${mp.total} milestones</span></div>
        <div class="progress progress-sm"><span style="width:${mp.pct}%"></span></div></div></a>`;
  };

  // ═════════ Resources
  const R = { q: '', types: new Set(), tags: new Set(), difficulty: '', cost: '', module: '', saved: false };

  function filteredResources() {
    const q = R.q.toLowerCase();
    return D.resources.filter(r => {
      if (q && !(r.title + ' ' + r.publisher + ' ' + r.desc).toLowerCase().includes(q)) return false;
      if (R.types.size && !R.types.has(r.type)) return false;
      if (R.tags.size && !r.tags.some(t => R.tags.has(t))) return false;
      if (R.difficulty && r.difficulty !== R.difficulty) return false;
      if (R.cost === 'free' && r.cost !== 'Free') return false;
      if (R.cost === 'unknown' && r.cost) return false;
      if (R.module && !r.modules.includes(R.module)) return false;
      if (R.saved && !S().isBookmarked(r.id)) return false;
      return true;
    });
  }
  const anyResFilter = () => R.q || R.types.size || R.tags.size || R.difficulty || R.cost || R.module || R.saved;

  function resultsHtml() {
    const list = filteredResources();
    return `<p class="result-count" aria-live="polite">${list.length} of ${D.resources.length} resources</p>` +
      (list.length ? `<div class="grid grid-3">${list.map(r => ui.resourceCard(r, R.q)).join('')}</div>`
        : ui.emptyState(R.saved ? 'bookmark' : 'search', R.saved && !Object.keys(S().state.bookmarks).length ? 'No saved resources yet' : 'No resources match', R.saved && !Object.keys(S().state.bookmarks).length ? 'Use the bookmark button on any resource card to save it here.' : 'Try removing a filter or searching for a broader term.', '<button class="btn" data-res-reset>Reset filters</button>'));
  }

  AIEA.views.resources = {
    title: () => 'Resource Library',
    render(params, query) {
      if (query.q !== undefined) R.q = query.q;
      if (query.tag && D.resourceTags[query.tag]) { R.tags = new Set([query.tag]); }
      if (query.module && D.moduleById[query.module]) R.module = query.module;
      const count = (fn) => D.resources.filter(fn).length;
      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('library')} Resource library</span><h1>Genuine resources, verified links</h1>
          <p class="lead">${D.resources.length} hand-picked resources — official documentation, university courses, papers, repositories and interactive tutorials. Every link was checked on ${esc(D.CHECKED_ON)}; pricing is shown only when clear from the provider.</p></header>
        <div class="toolbar mt-2">
          <div class="search-wrap toolbar-wide">${icon('search')}<input class="search-input" type="search" id="res-q" placeholder="Search title, publisher or description" value="${esc(R.q)}" aria-label="Search resources"></div>
          <label class="field" for="res-diff">Difficulty<select class="select" id="res-diff"><option value="">Any</option>${['Beginner', 'Intermediate', 'Advanced'].map(d => `<option ${R.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="field" for="res-cost">Cost<select class="select" id="res-cost"><option value="">Any</option><option value="free" ${R.cost === 'free' ? 'selected' : ''}>Free</option><option value="unknown" ${R.cost === 'unknown' ? 'selected' : ''}>Check provider</option></select></label>
          <label class="field" for="res-mod">Module<select class="select" id="res-mod"><option value="">All modules</option>${D.modules.map(m => `<option value="${m.id}" ${R.module === m.id ? 'selected' : ''}>${ui.modLabel(m)} ${esc(m.short)}</option>`).join('')}</select></label>
          <label class="toggle toolbar-auto"><input type="checkbox" id="res-saved" ${R.saved ? 'checked' : ''}> Saved only (${Object.keys(S().state.bookmarks).length})</label>
        </div>
        <div class="mt-2"><div class="text-sm muted mb-0" style="margin-bottom:8px">Topic</div><div class="chips" role="group" aria-label="Filter by topic">${Object.entries(D.resourceTags).map(([k, v]) => `<button class="chip" data-tag="${k}" aria-pressed="${R.tags.has(k)}">${esc(v)} <span class="count">${count(r => r.tags.includes(k))}</span></button>`).join('')}</div></div>
        <div class="mt-2"><div class="text-sm muted" style="margin-bottom:8px">Resource type</div><div class="chips" role="group" aria-label="Filter by type">${Object.entries(D.resourceTypes).map(([k, v]) => `<button class="chip" data-type="${k}" aria-pressed="${R.types.has(k)}">${icon(v.icon)}${esc(v.label)} <span class="count">${count(r => r.type === k)}</span></button>`).join('')}</div></div>
        <div class="row mt-2"><button class="btn btn-ghost btn-sm" data-res-reset ${anyResFilter() ? '' : 'disabled'}>${icon('refresh')} Reset all filters</button></div>
        <div id="res-results">${resultsHtml()}</div></div>`;
    },
    mount(root) {
      const refresh = () => { root.querySelector('#res-results').innerHTML = resultsHtml(); root.querySelectorAll('[data-res-reset]').forEach(b => { b.disabled = !anyResFilter(); }); };
      const q = root.querySelector('#res-q');
      let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { R.q = q.value.trim(); refresh(); }, 120); });
      root.querySelector('#res-diff').addEventListener('change', e => { R.difficulty = e.target.value; refresh(); });
      root.querySelector('#res-cost').addEventListener('change', e => { R.cost = e.target.value; refresh(); });
      root.querySelector('#res-mod').addEventListener('change', e => { R.module = e.target.value; refresh(); });
      root.querySelector('#res-saved').addEventListener('change', e => { R.saved = e.target.checked; refresh(); });
      root.firstElementChild.addEventListener('click', e => {
        const tag = e.target.closest('[data-tag]'), type = e.target.closest('[data-type]');
        if (tag) { const k = tag.dataset.tag; R.tags.has(k) ? R.tags.delete(k) : R.tags.add(k); tag.setAttribute('aria-pressed', R.tags.has(k)); refresh(); }
        if (type) { const k = type.dataset.type; R.types.has(k) ? R.types.delete(k) : R.types.add(k); type.setAttribute('aria-pressed', R.types.has(k)); refresh(); }
        if (e.target.closest('[data-res-reset]')) { R.q = ''; R.types.clear(); R.tags.clear(); R.difficulty = ''; R.cost = ''; R.module = ''; R.saved = false; history.replaceState(null, '', '#/resources'); AIEA.rerender(); }
      });
    },
    onChange(change, root) {
      if (change.type === 'bookmarks' && R.saved) root.querySelector('#res-results').innerHTML = resultsHtml();
      const lbl = root.querySelector('#res-saved'); if (lbl) lbl.parentElement.lastChild.textContent = ` Saved only (${Object.keys(S().state.bookmarks).length})`;
    }
  };

  // ═════════ Projects
  let projDiff = '';
  function projectDetail(p) {
    const mp = milestoneProgress(p);
    const i = D.projects.indexOf(p), prev = D.projects[i - 1], next = D.projects[i + 1];
    return `<div class="container">
      <nav class="breadcrumbs mt-3" aria-label="Breadcrumb"><a href="#/projects">Projects</a>${icon('chevronRight')}<span>Project ${p.num}</span></nav>
      <header class="lesson-head"><span class="eyebrow">${icon('folder')} Project ${String(p.num).padStart(2, '0')}</span><h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p>
        <div class="tags mt-2">${ui.diffTag(p.difficulty)}<span class="tag">${icon('clock')}${esc(p.duration)}</span>${p.tech.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="row mt-2"><span class="text-sm muted">Prerequisite modules:</span>${p.prereqs.map(id => { const m = D.moduleById[id], pr = ui.moduleProgress(m); return `<a class="tag ${pr.pct === 100 ? 'tag-green' : ''}" href="#/curriculum/${id}">${pr.pct === 100 ? icon('check') : ''}${ui.modLabel(m)} ${esc(m.short)} · ${pr.pct}%</a>`; }).join('')}</div></header>
      <section class="lesson-section"><h2>${icon('blueprint')} Architecture &amp; data flow</h2>${AIEA.diagrams.flow(p.flow, 'Main components and how data flows between them')}<p class="mt-2">${esc(p.architecture)}</p></section>
      <div class="compare">
        <div class="panel"><h4>${icon('flask')} Prototype</h4><ul class="check-list">${p.prototype.map(x => `<li>${icon('circle')}<span>${esc(x)}</span></li>`).join('')}</ul><p class="text-sm muted mb-0 mt-1">Fine for learning and demos — not for real users.</p></div>
        <div class="panel" style="border-color:color-mix(in srgb,var(--green) 45%,transparent)"><h4>${icon('shield')} Production-ready</h4><ul class="check-list">${p.production.map(x => `<li>${icon('checkCircle')}<span>${esc(x)}</span></li>`).join('')}</ul><p class="text-sm muted mb-0 mt-1">What this project’s acceptance criteria require.</p></div>
      </div>
      <div class="grid grid-2 mt-3">
        <section class="panel"><div class="panel-title">${icon('list')} Features to implement</div><ul class="check-list">${p.features.map(f => `<li>${icon('arrowRight')}<span>${esc(f)}</span></li>`).join('')}</ul></section>
        <section class="panel"><div class="panel-title">${icon('trophy')} Milestones <span class="spacer"></span><span class="text-sm muted" id="ms-count">${mp.done}/${mp.total}</span></div>
          <div class="progress progress-sm" style="margin-bottom:12px"><span id="ms-bar" style="width:${mp.pct}%"></span></div>
          <ul class="milestones">${p.milestones.map(([t, d], i) => { const k = `${p.id}:${i}`, on = S().isMilestone(k); return `<li><label class="milestone${on ? ' done' : ''}"><input type="checkbox" data-ms="${k}" ${on ? 'checked' : ''}><span><b>${i + 1}. ${esc(t)}</b><small>${esc(d)}</small></span></label></li>`; }).join('')}</ul></section>
      </div>
      <div class="grid grid-2 mt-2">
        <section class="panel"><div class="panel-title">${icon('checkCircle')} Acceptance criteria</div><ul class="check-list">${p.acceptance.map(a => `<li>${icon('check')}<span>${esc(a)}</span></li>`).join('')}</ul></section>
        <section class="panel"><div class="panel-title">${icon('flask')} Testing strategy</div><p>${esc(p.testing)}</p><div class="panel-title mt-2">${icon('rocket')} Deployment goal</div><p class="mb-0">${esc(p.deployment)}</p></section>
      </div>
      <section class="panel mt-2"><div class="panel-title">${icon('sparkles')} Extension challenges</div><div class="tags">${p.extensions.map(x => `<span class="tag tag-violet">${esc(x)}</span>`).join('')}</div></section>
      <nav class="pager mt-3" aria-label="Project navigation">${prev ? `<a href="#/projects/${prev.id}"><small>${icon('chevronLeft')} Previous project</small><b>${esc(prev.title)}</b></a>` : '<span class="disabled"><small>Previous</small><b>—</b></span>'}${next ? `<a class="next" href="#/projects/${next.id}"><small>Next project ${icon('chevronRight')}</small><b>${esc(next.title)}</b></a>` : '<span class="disabled next"><small>Next</small><b>—</b></span>'}</nav>
    </div>`;
  }

  AIEA.views.projects = {
    title: params => params[0] && D.projectById[params[0]] ? D.projectById[params[0]].title : 'Projects',
    render(params) {
      if (params[0]) {
        const p = D.projectById[params[0]];
        return p ? projectDetail(p) : `<div class="container section">${ui.emptyState('folder', 'Project not found', 'That project does not exist.', '<a class="btn" href="#/projects">All projects</a>')}</div>`;
      }
      const list = D.projects.filter(p => !projDiff || p.difficulty === projDiff);
      const totalMs = D.projects.reduce((s, p) => s + p.milestones.length, 0);
      const doneMs = D.projects.reduce((s, p) => s + milestoneProgress(p).done, 0);
      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('folder')} Projects &amp; portfolio</span><h1>Twelve projects, prototype to production</h1>
          <p class="lead">Each project lists features, milestones, acceptance criteria, a testing strategy and a deployment goal — plus a clear line between a prototype and a production-ready build.</p></header>
        <div class="row mt-2" style="justify-content:space-between"><div class="segmented" role="group" aria-label="Filter by difficulty">${['', 'Beginner', 'Intermediate', 'Advanced'].map(d => `<button data-diff="${d}" aria-pressed="${projDiff === d}">${d || 'All'} <span class="muted">${d ? D.projects.filter(p => p.difficulty === d).length : D.projects.length}</span></button>`).join('')}</div>
          <span class="text-sm muted">${doneMs}/${totalMs} milestones completed</span></div>
        <div class="grid grid-2 mt-3">${list.map(ui.projectCard).join('')}</div></div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => { projDiff = b.dataset.diff; AIEA.rerender(); }));
      root.querySelectorAll('[data-ms]').forEach(cb => cb.addEventListener('change', () => {
        S().toggleMilestone(cb.dataset.ms, cb.checked);
        cb.closest('.milestone').classList.toggle('done', cb.checked);
        const p = D.projectById[cb.dataset.ms.split(':')[0]], mp = milestoneProgress(p);
        root.querySelector('#ms-count').textContent = `${mp.done}/${mp.total}`;
        root.querySelector('#ms-bar').style.width = mp.pct + '%';
        if (mp.done === mp.total && cb.checked) ui.toast(`All milestones for “${p.title}” complete!`);
      }));
    }
  };

  // ═════════ Technology stack
  let tierFilter = '';
  let openTech = null;
  function techDetail(t) {
    const tierLabel = { core: 'Core technology', alternative: 'Alternative / situational', specialization: 'Specialisation' }[t.tier];
    return `<div class="tech-detail" id="tech-detail" role="region" aria-label="${esc(t.name)} details"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(t.name)}</h3><span class="tag tier-${t.tier}">${tierLabel}</span></div>
      <dl><div><dt>What it does</dt><dd>${esc(t.what)}</dd></div><div><dt>Why an AI engineer uses it</dt><dd>${esc(t.why)}</dd></div>
      <div><dt>Prerequisites</dt><dd>${esc(t.prereqs)}</dd></div><div><dt>When to use it</dt><dd>${esc(t.when)}</dd></div>
      <div><dt>When not to use it</dt><dd>${esc(t.whenNot)}</dd></div><div><dt>Related modules</dt><dd class="tags">${t.modules.map(id => `<a class="tag tag-cyan" href="#/curriculum/${id}">${ui.modLabel(D.moduleById[id])} ${esc(D.moduleById[id].short)}</a>`).join('')}</dd></div></dl>
      ${t.docs ? ui.ext(t.docs, 'Official documentation', 'btn btn-sm') : `<p class="text-sm muted mb-0">${esc(t.docsNote || '')}</p>`}</div>`;
  }

  AIEA.views.stack = {
    title: () => 'Technology Stack',
    render(params, query) {
      if (query.t) openTech = query.t;
      const tiers = [['', 'All'], ['core', 'Core'], ['alternative', 'Alternatives'], ['specialization', 'Specialisation']];
      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('layers')} Technology stack explorer</span><h1>The tools, grouped by purpose</h1>
          <p class="lead">Not every tool is mandatory. <b class="tier-core">Core</b> tools appear in most AI engineering work; <b class="tier-alternative">alternatives</b> fit specific situations; <b class="tier-specialization">specialisation</b> tools matter for particular branches. Select a tool for details.</p></header>
        <div class="segmented mt-2" role="group" aria-label="Filter by tier">${tiers.map(([v, l]) => `<button data-tier="${v}" aria-pressed="${tierFilter === v}">${l}</button>`).join('')}</div>
        <div class="mt-4">${D.stack.map(g => {
          const items = g.items.filter(t => !tierFilter || t.tier === tierFilter);
          if (!items.length) return '';
          return `<section class="stack-group"><div class="stack-group-head"><div class="card-icon">${icon(g.icon)}</div><div><h2>${esc(g.title)}</h2><p>${esc(g.desc)}</p></div></div>
            <div class="tech-grid">${items.map(t => `<button class="tech-btn" data-tech="${esc(t.name)}" aria-expanded="${openTech === t.name}"><span class="tech-mono">${esc(t.mono)}</span><span style="min-width:0"><b>${esc(t.name)}</b><small class="tier-${t.tier}">${t.tier === 'core' ? 'Core' : t.tier === 'alternative' ? 'Alternative' : 'Specialisation'}</small></span></button>${openTech === t.name ? techDetail(t) : ''}`).join('')}</div></section>`;
        }).join('')}</div></div>`;
    },
    mount(root, params, query) {
      root.querySelectorAll('[data-tier]').forEach(b => b.addEventListener('click', () => { tierFilter = b.dataset.tier; AIEA.rerender(); }));
      root.querySelectorAll('[data-tech]').forEach(b => b.addEventListener('click', () => {
        openTech = openTech === b.dataset.tech ? null : b.dataset.tech;
        AIEA.rerender();
        const again = root.querySelector(`[data-tech="${CSS.escape(b.dataset.tech)}"]`);
        again && again.focus({ preventScroll: true });
      }));
      if (query.t) { const d = root.querySelector('#tech-detail'); d && setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); }
    }
  };
})();
