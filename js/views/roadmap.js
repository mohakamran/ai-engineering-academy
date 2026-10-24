/* Learning roadmap: path switcher, filters, stage timeline, accelerated weekly plan */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc;
  const blankFilters = () => ({ difficulty: '', category: '', duration: '', format: '', prereq: '', project: false });
  let F = blankFilters();

  const FORMAT_LABELS = { reading: 'Reading', video: 'Video', interactive: 'Interactive', project: 'Project-based' };
  const PREREQ_LABELS = { none: 'No programming needed', basic: 'Basic programming', solid: 'Solid programming' };

  function matches(m) {
    const h = ui.estHours(m);
    if (F.difficulty && m.difficulty !== F.difficulty) return false;
    if (F.category && m.category !== F.category) return false;
    if (F.duration === 'short' && h >= 15) return false;
    if (F.duration === 'medium' && (h < 15 || h > 30)) return false;
    if (F.duration === 'long' && h <= 30) return false;
    if (F.format && !m.formats.includes(F.format)) return false;
    if (F.prereq && m.prereqLevel !== F.prereq) return false;
    if (F.project && !m.projectId) return false;
    return true;
  }
  const activeFilters = () => Object.values(F).some(Boolean);

  function select(id, label, value, opts) {
    return `<label class="field" for="${id}">${label}<select class="select" id="${id}" data-filter="${id.replace('f-', '')}"><option value="">Any</option>${opts.map(([v, l]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  }

  function modulePill(m) {
    const p = ui.moduleProgress(m), e = ui.emphasisOf(m.id);
    return `<a class="mod-pill${matches(m) ? '' : ' dim'}" href="#/curriculum/${m.id}" ${matches(m) ? '' : 'aria-label="' + esc(m.title) + ' (filtered out)"'}>
      <span class="mod-num">${ui.modLabel(m)}</span>
      <span class="mod-txt"><b>${esc(m.title)}</b><small>${ui.fmtHours(ui.estHours(m))} · ${esc(m.difficulty)} · ${p.done}/${p.total} done</small></span>
      ${ui.emphasisTag(e)}</a>`;
  }

  function stageCard(st) {
    const mods = st.modules.map(id => D.moduleById[id]);
    const anyMatch = mods.some(matches);
    const status = ui.stageStatus(st), sp = ui.stageProgress(st);
    const hours = mods.reduce((s, m) => s + ui.estHours(m), 0);
    const diffs = [...new Set(mods.map(m => m.difficulty))].join(' → ');
    const tech = [...new Set(mods.flatMap(m => m.tech))].slice(0, 8);
    const outcomes = mods.flatMap(m => m.outcomes.slice(0, 2)).slice(0, 4);
    const optional = mods.every(m => ui.emphasisOf(m.id) === 'optional' || m.optional);
    return `<li class="tl-item${anyMatch ? '' : ' dim'}" id="stage-${st.n}">
      <div class="tl-node" style="background:${ui.stageColor(st.tone)}">${icon(st.icon)}</div>
      <article class="card tl-card">
        <div class="tl-head"><div><span class="eyebrow" style="margin:0">Stage ${st.n}${optional ? ' · optional specialisation' : ''}</span><h3>${esc(st.title)}</h3><p class="muted mb-0">${esc(st.desc)}</p></div>
          <div class="stack" style="align-items:flex-end;gap:6px"><span class="status-dot ${status}">${ui.statusLabel(status)}</span><span class="text-sm muted">${sp.done}/${sp.total} topics</span></div></div>
        <div class="progress progress-sm mt-1"><span style="width:${sp.pct}%"></span></div>
        <div class="tl-facts">
          <div class="fact"><b>Estimated time</b><span>~${hours} h</span></div>
          <div class="fact"><b>Difficulty</b><span>${esc(diffs)}</span></div>
          <div class="fact"><b>Prerequisites</b><span>${st.requires.length ? st.requires.map(r => `<a href="#/roadmap?stage=${r}" data-stage-link="${r}">Stage ${r}</a>`).join(', ') : 'None — start here'}</span></div>
          <div class="fact"><b>Modules</b><span>${mods.length}</span></div>
        </div>
        <div class="tags">${tech.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <h4 class="mt-2">Learning outcomes</h4>
        <ul class="outcomes">${outcomes.map(o => `<li>${icon('checkCircle')}<span>${esc(o)}</span></li>`).join('')}</ul>
        <div class="tl-modules">${mods.map(modulePill).join('')}</div>
        <div class="card-foot"><a class="btn btn-sm btn-primary" href="#/curriculum/${mods[0].id}">${icon('book')} Open modules</a>${mods.filter(m => m.projectId).map(m => `<a class="btn btn-sm" href="#/projects/${m.projectId}">${icon('folder')} ${esc(D.projectById[m.projectId].title)}</a>`).join('')}</div>
      </article></li>`;
  }

  function weeksView(path) {
    return `<div class="callout mt-2">${icon('alert')}<div><p><b>Accelerated foundation.</b> Twelve weeks at roughly two hours a day covers the core of applied AI engineering for experienced developers. Advanced specialisation (Module 14) and deeper production experience require additional study.</p></div></div>
      <div class="week-grid mt-2">${path.weeks.map(w => {
        const mods = w.modules.map(id => D.moduleById[id]);
        const done = mods.reduce((s, m) => s + ui.moduleProgress(m).done, 0), total = mods.reduce((s, m) => s + ui.moduleProgress(m).total, 0);
        return `<article class="week-card"><span class="wk">WEEK ${String(w.w).padStart(2, '0')}</span><h4>${esc(w.title)}</h4>
          <ul>${w.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <div class="text-sm">${icon('target')} <b>Deliverable:</b> ${esc(w.deliverable)}</div>
          <div class="tags">${mods.map(m => `<a class="tag tag-cyan" href="#/curriculum/${m.id}">${ui.modLabel(m)} ${esc(m.short)}</a>`).join('')}</div>
          <div class="progress progress-sm"><span style="width:${total ? Math.round(done / total * 100) : 0}%"></span></div><span class="text-sm muted">${done}/${total} topics in these modules</span></article>`;
      }).join('')}</div>`;
  }

  AIEA.views.roadmap = {
    title: () => 'Roadmap',
    render(params, query) {
      const path = ui.currentPath();
      const visible = D.modules.filter(matches).length;
      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('map')} Learning roadmap</span><h1>Your route to AI engineering</h1>
          <p class="lead">Ten stages, sixteen modules. Foundations first, then retrieval, agents, evaluation and production. Select a path to adjust emphasis and pacing — your completed topics are kept regardless.</p></header>

        <div class="segmented mt-2" role="group" aria-label="Learning path">${Object.values(D.paths).map(p => `<button data-path="${p.id}" aria-pressed="${p.id === path.id}">${icon(p.icon)}${esc(p.name)}</button>`).join('')}</div>

        <section class="panel mt-2"><div class="grid grid-2">
          <div><div class="panel-title">${icon(path.icon)} ${esc(path.name)} path</div><p>${esc(path.focus)}</p>
            <div class="tags"><span class="tag tag-cyan">${icon('clock')}${esc(path.duration)}</span><span class="tag">${esc(path.pace)}</span><span class="tag">${esc(path.audience)}</span></div></div>
          <div><div class="panel-title">${icon('info')} Tips for this path</div><ul class="outcomes">${path.tips.map(t => `<li>${icon('arrowRight')}<span>${esc(t)}</span></li>`).join('')}</ul></div>
        </div></section>

        ${path.weeks ? `<section class="mt-4"><h2>12-week schedule</h2>${weeksView(path)}</section>` : ''}

        <section class="mt-4">
          <div class="section-head"><div><h2>Stage timeline</h2><p>Filter modules to find what fits. Filtered-out modules are dimmed, not hidden, so dependencies stay visible.</p></div></div>
          <form class="toolbar" id="rm-filters" onsubmit="return false" aria-label="Roadmap filters">
            ${select('f-difficulty', 'Difficulty', F.difficulty, [['Beginner', 'Beginner'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']])}
            ${select('f-category', 'Topic category', F.category, Object.entries(D.categories))}
            ${select('f-duration', 'Estimated duration', F.duration, [['short', 'Under 15 h'], ['medium', '15–30 h'], ['long', 'Over 30 h']])}
            ${select('f-format', 'Learning format', F.format, Object.entries(FORMAT_LABELS))}
            ${select('f-prereq', 'Programming prerequisite', F.prereq, Object.entries(PREREQ_LABELS))}
            <label class="toggle toolbar-auto"><input type="checkbox" id="f-project" ${F.project ? 'checked' : ''}> Has gallery project</label>
            <button class="btn btn-ghost toolbar-auto" type="button" id="f-reset" ${activeFilters() ? '' : 'disabled'}>${icon('refresh')} Reset</button>
          </form>
          <div class="row mt-2" style="justify-content:space-between"><p class="result-count" style="margin:0" aria-live="polite">${visible} of ${D.modules.length} modules match</p>
            <div class="legend"><span>${ui.emphasisTag('core')} essential on this path</span><span>${ui.emphasisTag('light')} skim / reference</span><span>${ui.emphasisTag('optional')} optional specialisation</span></div></div>
          ${visible === 0 ? ui.emptyState('filter', 'No modules match these filters', 'Try removing a filter — e.g. duration or format.', '<button class="btn" id="f-reset-2">Reset filters</button>') : ''}
          <ol class="timeline" style="list-style:none;padding:0">${D.stages.map(stageCard).join('')}</ol>
        </section></div>`;
    },
    mount(root, params, query) {
      root.querySelectorAll('[data-path]').forEach(b => b.addEventListener('click', () => { AIEA.store.setPath(b.dataset.path); ui.toast(`Active path: ${D.paths[b.dataset.path].name}`); }));
      root.querySelectorAll('[data-filter]').forEach(s => s.addEventListener('change', () => { F[s.dataset.filter] = s.value; AIEA.views.roadmap._focus = s.id; AIEA.rerender(); }));
      const pj = root.querySelector('#f-project');
      pj.addEventListener('change', () => { F.project = pj.checked; AIEA.views.roadmap._focus = pj.id; AIEA.rerender(); });
      root.querySelectorAll('#f-reset, #f-reset-2').forEach(b => b.addEventListener('click', () => { F = blankFilters(); AIEA.rerender(); }));
      // keep focus on the control that triggered a re-render
      if (AIEA.views.roadmap._focus) { const el = root.querySelector('#' + AIEA.views.roadmap._focus); el && el.focus(); AIEA.views.roadmap._focus = null; }
      if (query.stage) {
        const el = root.querySelector('#stage-' + parseInt(query.stage, 10));
        if (el) setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.querySelector('.tl-card').style.borderColor = 'var(--cyan)'; }, 60);
      }
    },
    softNav(root, params, query) {
      if (!query.stage) return false;
      const el = root.querySelector('#stage-' + parseInt(query.stage, 10));
      if (!el) return false;
      root.querySelectorAll('.tl-card').forEach(c => { c.style.borderColor = ''; });
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.querySelector('.tl-card').style.borderColor = 'var(--cyan)';
      return true;
    }
  };
})();
