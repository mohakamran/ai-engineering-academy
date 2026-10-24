/* Curriculum explorer: module accordion sidebar + module overview / lesson viewer */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc, S = () => AIEA.store;
  const expanded = new Set();
  let search = '', hideDone = false, sidebarCollapsed = true;

  // ───────── Route helpers
  function resolve(params) {
    const m = D.moduleById[params[0]];
    if (!m) return null;
    const n = parseInt(params[1], 10);
    const topic = Number.isFinite(n) ? m.topicList[n - 1] : null;
    if (params[1] && !topic) return null;
    return { m, topic };
  }
  const dur = min => min < 60 ? `${min}m` : `${Math.floor(min / 60)}h${min % 60 ? ' ' + (min % 60) + 'm' : ''}`;
  const topicHref = t => `#/curriculum/${t.module.id}/${t.idx + 1}`;

  function neighbors(t) {
    const i = D.allTopics.indexOf(t);
    return { prev: D.allTopics[i - 1] || null, next: D.allTopics[i + 1] || null };
  }

  // ───────── Sidebar
  function hl(text) {
    if (!search) return esc(text);
    const re = new RegExp('(' + search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return esc(text).replace(re, '<mark>$1</mark>');
  }

  function sidebarList(cur) {
    const q = search.toLowerCase();
    let shown = 0;
    const items = D.modules.map(m => {
      const modHit = !q || m.title.toLowerCase().includes(q) || m.short.toLowerCase().includes(q);
      let topics = m.topicList.filter(t => !q || modHit || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q));
      if (hideDone) topics = topics.filter(t => !S().isDone(t.id));
      if (q && !modHit && !topics.length) return '';
      if (hideDone && !topics.length && !modHit) return '';
      shown++;
      const open = expanded.has(m.id) || (q && topics.length > 0) || (cur && cur.m === m);
      const p = ui.moduleProgress(m);
      const e = ui.emphasisOf(m.id);
      const isCurModule = cur && cur.m === m && !cur.topic;
      return `<li>
        <button class="acc-btn" aria-expanded="${!!open}" aria-controls="acc-${m.id}" data-acc="${m.id}" id="accb-${m.id}">
          ${icon('chevronRight', 'chev')}<span class="mod-num">${String(m.num).padStart(2, '0')}</span>
          <span class="acc-title">${hl(m.title)}<small>${ui.fmtHours(ui.estHours(m))} · ${e === 'core' ? 'Core' : e === 'light' ? 'Review' : 'Optional'} · ${p.done}/${p.total}</small></span>
          <span class="mini-ring" data-ring="${m.id}" style="--p:${p.pct}" role="img" aria-label="${p.pct}% complete"></span>
        </button>
        <div class="acc-panel" id="acc-${m.id}" role="region" aria-labelledby="accb-${m.id}" ${open ? '' : 'hidden'}>
          <ul class="topic-list">
            <li><a class="topic-link special" href="#/curriculum/${m.id}" ${isCurModule ? 'aria-current="page"' : ''}>${icon('compass')}<span>Overview</span></a></li>
            ${topics.map(t => `<li><a class="topic-link" href="${topicHref(t)}" data-topic="${t.id}" ${cur && cur.topic === t ? 'aria-current="page"' : ''}>
              <span class="t-status${S().isDone(t.id) ? ' done' : ''}" aria-hidden="true">${S().isDone(t.id) ? icon('check') : ''}</span>
              <span>${t.num} ${hl(t.title)}${t.lesson ? ` <span class="sr-only">(full lesson)</span>${icon('sparkles')}` : ''}<span class="sr-only">${S().isDone(t.id) ? ' — completed' : ''}</span></span>
              <span class="t-meta">${dur(t.minutes)}</span></a></li>`).join('')}
            ${q ? '' : `<li><a class="topic-link special" href="#/curriculum/${m.id}?section=assessment">${icon('question')}<span>${m.num}.${m.topicList.length + 1} Practical assessment</span></a></li>
            <li><a class="topic-link special" href="#/curriculum/${m.id}?section=resources">${icon('library')}<span>Learning resources</span></a></li>
            <li><a class="topic-link special" href="#/curriculum/${m.id}?section=project">${icon('folder')}<span>Project assignment</span></a></li>`}
          </ul></div></li>`;
    }).join('');
    return shown ? `<ul class="accordion">${items}</ul>` : ui.emptyState('search', 'No matching topics', `Nothing matches “${search}”. Try another keyword or clear the search.`, '<button class="btn btn-sm" data-clear-search>Clear search</button>');
  }

  function sidebar(cur) {
    const path = ui.currentPath();
    return `<aside class="sidebar${sidebarCollapsed ? ' collapsed' : ''}" aria-label="Curriculum modules">
      <button class="btn sidebar-toggle" aria-expanded="${!sidebarCollapsed}" aria-controls="sidebar-body" id="sb-toggle">${icon('list')} Modules &amp; topics <span class="muted">(${D.modules.length})</span>${icon(sidebarCollapsed ? 'chevronDown' : 'x')}</button>
      <div class="sidebar-body" id="sidebar-body">
        <div class="search-wrap">${icon('search')}<input class="search-input" type="search" id="sb-search" placeholder="Search modules & topics" value="${esc(search)}" aria-label="Search modules and topics"></div>
        <div class="row mt-1" style="justify-content:space-between"><label class="toggle text-sm" style="min-height:34px"><input type="checkbox" id="sb-hide" ${hideDone ? 'checked' : ''}> Hide completed</label>
          <button class="btn btn-ghost btn-sm" id="sb-collapse">Collapse all</button></div>
        <p class="path-note">${icon('route')} Emphasis for the <a href="#/roadmap">${esc(path.name)}</a> path. ${icon('sparkles')} = full interactive lesson.</p>
        <div id="sb-list">${sidebarList(cur)}</div>
      </div></aside>`;
  }

  // ───────── Module overview
  function kitHtml(m) {
    const k = m.kit;
    return `<div class="stack">${ui.resourceMini(D.resourceById[k.primary], 'Primary resource')}${ui.resourceMini(D.resourceById[k.practical], 'Practical tutorial')}${ui.resourceMini(D.resourceById[k.advanced], 'Optional advanced')}</div>`;
  }

  function moduleView(m) {
    const p = ui.moduleProgress(m), e = ui.emphasisOf(m.id);
    const proj = m.projectId ? D.projectById[m.projectId] : null;
    return `
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/curriculum">Curriculum</a>${icon('chevronRight')}<span>Module ${m.num}</span></nav>
      <header class="lesson-head"><span class="eyebrow">${icon(m.icon)} Module ${String(m.num).padStart(2, '0')}${m.optional ? ' · Optional branches' : ''}</span>
        <h1>${esc(m.title)}</h1><p>${esc(m.summary)}</p>
        <div class="tags mt-2">${ui.diffTag(m.difficulty)}${ui.emphasisTag(e)}<span class="tag">${icon('clock')}~${ui.fmtHours(ui.estHours(m))} on ${esc(ui.currentPath().name)} path</span><span class="tag">${esc(D.categories[m.category])}</span><span class="tag">${m.topicList.length} topics</span></div>
        <div class="row mt-2"><div class="progress" style="flex:1;max-width:340px"><span style="width:${p.pct}%"></span></div><span class="text-sm muted">${p.done}/${p.total} topics complete</span></div>
      </header>
      <div class="grid grid-2">
        <section class="panel"><div class="panel-title">${icon('target')} Why this module matters</div><p class="mb-0">${esc(m.why)}</p>
          ${m.deps.length ? `<h4 class="mt-2">Builds on</h4><div class="tags">${m.deps.map(id => { const d = D.moduleById[id]; const dp = ui.moduleProgress(d); return `<a class="tag ${dp.pct === 100 ? 'tag-green' : ''}" href="#/curriculum/${id}">${dp.pct === 100 ? icon('check') : ''}${ui.modLabel(d)} ${esc(d.short)} · ${dp.pct}%</a>`; }).join('')}</div>` : ''}</section>
        <section class="panel"><div class="panel-title">${icon('checkCircle')} Learning outcomes</div><ul class="outcomes">${m.outcomes.map(o => `<li>${icon('checkCircle')}<span>${esc(o)}</span></li>`).join('')}</ul>
          <h4 class="mt-2">Core technologies</h4><div class="tags">${m.tech.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></section>
      </div>
      <section class="lesson-section mt-3"><h2>${icon('image')} Visual overview</h2>${AIEA.diagrams.get(m.diagram)}</section>
      <section class="lesson-section"><h2>${icon('list')} Topics</h2>
        <div class="grid grid-3">${m.topicList.map(t => `<a class="card card-link" href="${topicHref(t)}" style="padding:16px">
          <div class="row" style="justify-content:space-between"><span class="text-sm" style="font-family:var(--mono);color:var(--cyan)">${t.num}</span>${S().isDone(t.id) ? `<span class="tag tag-green">${icon('check')}Done</span>` : t.lesson ? `<span class="tag tag-violet">${icon('sparkles')}Full lesson</span>` : `<span class="tag">${t.minutes} min</span>`}</div>
          <h4 class="mt-1" style="margin-bottom:4px">${esc(t.title)}</h4><p class="text-sm mb-0">${esc(t.summary)}</p></a>`).join('')}</div></section>
      <section class="lesson-section" id="sec-resources"><h2>${icon('library')} Learning resources</h2>
        <div class="grid grid-2"><div><h4>Study kit</h4>${kitHtml(m)}</div>
        <div><h4>More for this module</h4><div class="stack">${m.resources.slice(0, 6).map(id => ui.resourceMini(D.resourceById[id])).join('')}</div>
        <a class="btn btn-sm mt-1" href="#/resources?module=${m.id}">All resources for Module ${m.num} ${icon('arrowRight')}</a></div></div></section>
      <section class="lesson-section" id="sec-project"><h2>${icon('folder')} Project assignment</h2>
        <div class="panel exercise"><h3>${esc(m.project.title)}</h3><p>${esc(m.project.brief)}</p>
        ${proj ? `<a class="btn btn-primary btn-sm" href="#/projects/${proj.id}">${icon('folder')} Open “${esc(proj.title)}” with milestones</a>` : `<p class="text-sm muted mb-0">Track this assignment in your own repository; add notes on any topic page.</p>`}</div></section>
      <section class="lesson-section" id="sec-assessment"><h2>${icon('question')} Practical assessment</h2>
        <div class="panel"><p class="muted">Check your understanding of the whole module. Answers are recorded on this device.</p>
        <div class="stack">${m.check.map((q, i) => ui.quiz(q, `${m.id}-check-${i}`, `Q${i + 1}.`)).join('<hr style="border:0;border-top:1px dashed var(--border);width:100%">')}</div></div></section>
      <div class="pager mt-3">${m.num > 0 ? `<a href="#/curriculum/${D.modules[m.num - 1].id}"><small>${icon('chevronLeft')} Previous module</small><b>${esc(D.modules[m.num - 1].title)}</b></a>` : '<span class="disabled"><small>Start</small><b>—</b></span>'}
        <a class="next" href="${topicHref(m.topicList[0])}"><small>Start module ${icon('chevronRight')}</small><b>${m.topicList[0].num} ${esc(m.topicList[0].title)}</b></a></div>`;
  }

  // ───────── Lesson view
  function lessonView(m, t) {
    const L = t.lesson;
    const { prev, next } = neighbors(t);
    const done = S().isDone(t.id);
    const modQ = m.check[t.idx % m.check.length];
    const sections = [];

    const head = `
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/curriculum">Curriculum</a>${icon('chevronRight')}<a href="#/curriculum/${m.id}">Module ${m.num}: ${esc(m.short)}</a>${icon('chevronRight')}<span>${t.num}</span></nav>
      <header class="lesson-head"><span class="eyebrow">${icon(m.icon)} Topic ${t.num} · ${L ? 'Full lesson' : 'Study guide'}</span>
        <h1>${esc(t.title)}</h1><p>${esc(L ? L.overview : t.summary)}</p>
        <div class="tags mt-2"><span class="tag">${icon('clock')}~${t.minutes} min</span>${ui.diffTag(m.difficulty)}${ui.emphasisTag(ui.emphasisOf(m.id))}<span class="tag ${done ? 'tag-green' : ''}" id="status-tag">${done ? icon('check') + 'Completed' : 'Not completed'}</span></div>
      </header>`;

    if (L) {
      sections.push(['why', 'Why it matters', 'target', `<p>${esc(L.why)}</p>`]);
      sections.push(['prereq', 'Prerequisites', 'gitBranch', `<ul class="outcomes">${L.prereqs.map(p => `<li>${icon('arrowRight')}<span>${esc(p)}</span></li>`).join('')}</ul>`]);
      sections.push(['objectives', 'Learning objectives', 'checkCircle', `<ol class="objectives">${L.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ol>`]);
      sections.push(['visual', 'Visual explanation', 'image', AIEA.diagrams.get(L.diagram || m.diagram) + (L.demo ? `<div class="mt-2" data-demo="${L.demo}"></div>` : '')]);
      sections.push(['concepts', 'Key concepts', 'puzzle', `<div class="concepts">${L.concepts.map(([k, v]) => `<div class="concept"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`]);
      sections.push(['exercise', 'Practical exercise', 'dumbbell', `<div class="panel exercise"><h3>${esc(L.exercise.task)}</h3><ol class="objectives">${L.exercise.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>${L.exercise.code ? `<pre class="mt-2"><code>${esc(L.exercise.code)}</code></pre>` : ''}</div>`]);
      sections.push(['docs', 'Related documentation & reading', 'library', `<div class="grid grid-2"><div><h4>For this topic</h4><div class="stack">${L.resources.map(id => ui.resourceMini(D.resourceById[id])).join('')}</div></div><div><h4>Module study kit</h4>${kitHtml(m)}</div></div>`]);
      sections.push(['check', 'Knowledge check', 'question', `<div class="panel">${ui.quiz(L.quiz, t.id + '-quiz')}</div>`]);
    } else {
      const prevInModule = m.topicList[t.idx - 1];
      sections.push(['why', 'Why it matters', 'target', `<p>${esc(t.summary)} ${esc(m.why)}</p>`]);
      sections.push(['prereq', 'Prerequisites', 'gitBranch', `<ul class="outcomes">${prevInModule ? `<li>${icon('arrowRight')}<span>Previous topic: <a href="${topicHref(prevInModule)}">${prevInModule.num} ${esc(prevInModule.title)}</a></span></li>` : ''}${m.deps.map(id => `<li>${icon('arrowRight')}<span><a href="#/curriculum/${id}">Module ${D.moduleById[id].num}: ${esc(D.moduleById[id].title)}</a></span></li>`).join('') || (prevInModule ? '' : `<li>${icon('arrowRight')}<span>None — this is a starting point.</span></li>`)}</ul>`]);
      sections.push(['objectives', 'Study objectives', 'checkCircle', `<ol class="objectives"><li>Explain “${esc(t.title)}” in your own words in under 150 words.</li><li>Find where it appears in the primary resource below and work through that section.</li><li>Apply it in a small, runnable example or in the module project.</li></ol>`]);
      sections.push(['visual', 'Visual context', 'image', AIEA.diagrams.get(m.diagram)]);
      sections.push(['exercise', 'Hands-on exercise', 'dumbbell', `<div class="panel exercise"><h3>Apply it in “${esc(m.project.title)}”</h3><p>${esc(m.project.brief)}</p><p class="text-sm muted mb-0">Identify where ${esc(t.title.toLowerCase())} shows up in this project, implement that piece, and record what you learned in the notes below.</p></div>`]);
      sections.push(['docs', 'Learning resources', 'library', `<p class="text-sm muted">This topic uses the module’s shared study kit: a primary resource, a practical tutorial and an optional advanced resource.</p>${kitHtml(m)}`]);
      sections.push(['check', 'Self-check', 'question', `<div class="panel">${ui.quiz(modQ, `${m.id}-check-${t.idx % m.check.length}`, 'Module check:')}</div>`]);
    }

    sections.push(['notes', 'Your notes', 'note', `<label class="field" for="note-${t.id}">Saved automatically in this browser only — don’t store passwords, API keys or personal data.<textarea class="textarea" id="note-${t.id}" data-note="${t.id}" placeholder="What did you learn? What will you try next?">${esc(S().getNote(t.id))}</textarea></label><div class="text-sm muted mt-1" id="note-status" aria-live="polite"></div>`]);

    const body = sections.map(([id, title, ic, html]) => `<section class="lesson-section" id="ls-${id}"><h2>${icon(ic)} ${esc(title)}</h2>${html}</section>`).join('');
    const mp = ui.moduleProgress(m);
    const side = `<aside class="side-card hide-sm"><div class="panel"><div class="panel-title">${icon('list')} On this page</div>
        <ul class="topic-list" style="border:0;padding:0">${sections.map(([id, title]) => `<li><a class="topic-link" href="#ls-${id}" data-jump="ls-${id}">${esc(title)}</a></li>`).join('')}</ul></div>
      <div class="panel mt-2"><div class="panel-title">${icon('chart')} Module progress</div><div class="progress"><span id="side-prog" style="width:${mp.pct}%"></span></div><p class="text-sm muted mt-1 mb-0" id="side-prog-txt">${mp.done}/${mp.total} topics complete</p></div></aside>`;

    return `${head}<div class="lesson-grid two"><div>${body}
      <div class="complete-bar"><div><b>Finished this topic?</b><div class="text-sm muted">Marking complete updates your roadmap, skills and dashboard.</div></div>
        <button class="btn complete-btn" data-complete="${t.id}" aria-pressed="${done}">${icon(done ? 'checkCircle' : 'circle')}<span>${done ? 'Completed' : 'Mark as complete'}</span></button></div>
      <nav class="pager" aria-label="Topic navigation">
        ${prev ? `<a href="${topicHref(prev)}"><small>${icon('chevronLeft')} Previous</small><b>${prev.num} ${esc(prev.title)}</b></a>` : '<span class="disabled"><small>Previous</small><b>—</b></span>'}
        ${next ? `<a class="next" href="${topicHref(next)}"><small>Next ${icon('chevronRight')}</small><b>${next.num} ${esc(next.title)}</b></a>` : '<span class="disabled next"><small>Next</small><b>End of curriculum</b></span>'}
      </nav></div>${side}</div>`;
  }

  // ───────── Mount helpers
  function mountMain(root, cur, query) {
    const lesson = root.querySelector('.lesson');
    lesson.querySelectorAll('[data-demo]').forEach(el => { const fn = AIEA.demos[el.dataset.demo]; if (fn) fn(el); });
    const ta = lesson.querySelector('[data-note]');
    if (ta) {
      let tmr;
      ta.addEventListener('input', () => {
        clearTimeout(tmr);
        lesson.querySelector('#note-status').textContent = 'Saving…';
        tmr = setTimeout(() => { S().setNote(ta.dataset.note, ta.value); lesson.querySelector('#note-status').textContent = S().isPersistent() ? 'Saved on this device' : 'Saved for this session only'; }, 450);
      });
    }
    lesson.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const el = document.getElementById(a.dataset.jump); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    const cb = lesson.querySelector('[data-complete]');
    cb && cb.addEventListener('click', () => {
      const on = S().toggleTopic(cb.dataset.complete);
      ui.toast(on ? 'Topic marked complete' : 'Marked as not complete');
    });
    if (cur.topic) S().setLastTopic(cur.topic.id);
    if (query && query.section) {
      const el = lesson.querySelector('#sec-' + query.section) || lesson.querySelector('#ls-' + query.section);
      el && setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  function bindSidebar(root) {
    const sb = root.querySelector('.sidebar');
    sb.querySelector('#sb-toggle').addEventListener('click', () => {
      sidebarCollapsed = !sidebarCollapsed;
      sb.classList.toggle('collapsed', sidebarCollapsed);
      const t = sb.querySelector('#sb-toggle');
      t.setAttribute('aria-expanded', !sidebarCollapsed);
      t.lastElementChild.outerHTML = icon(sidebarCollapsed ? 'chevronDown' : 'x');
    });
    const input = sb.querySelector('#sb-search');
    input.addEventListener('input', () => { search = input.value.trim(); refreshSidebar(root); });
    sb.querySelector('#sb-hide').addEventListener('change', e => { hideDone = e.target.checked; refreshSidebar(root); });
    sb.querySelector('#sb-collapse').addEventListener('click', () => { expanded.clear(); sb.querySelectorAll('.acc-btn').forEach(b => { b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; }); });
    sb.addEventListener('click', e => {
      const b = e.target.closest('[data-acc]');
      if (b) {
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open);
        document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
        if (open) expanded.add(b.dataset.acc); else expanded.delete(b.dataset.acc);
        return;
      }
      if (e.target.closest('[data-clear-search]')) { search = ''; input.value = ''; refreshSidebar(root); input.focus(); return; }
      if (e.target.closest('.topic-link') && window.matchMedia('(max-width: 999px)').matches) {
        sidebarCollapsed = true; sb.classList.add('collapsed'); sb.querySelector('#sb-toggle').setAttribute('aria-expanded', 'false');
      }
    });
    // Arrow-key navigation between accordion headers
    sb.addEventListener('keydown', e => {
      const b = e.target.closest('.acc-btn'); if (!b) return;
      const all = [...sb.querySelectorAll('.acc-btn')], i = all.indexOf(b);
      if (e.key === 'ArrowDown' && all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
      if (e.key === 'ArrowUp' && all[i - 1]) { e.preventDefault(); all[i - 1].focus(); }
      if (e.key === 'Home') { e.preventDefault(); all[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); all[all.length - 1].focus(); }
    });
  }

  let curRef = null;
  function refreshSidebar(root) { const list = root.querySelector('#sb-list'); if (list) list.innerHTML = sidebarList(curRef); }

  function mainHtml(cur) { return `<div class="lesson" id="lesson">${cur.topic ? lessonView(cur.m, cur.topic) : moduleView(cur.m)}</div>`; }

  AIEA.views.curriculum = {
    title(params) { const c = resolve(params); return c ? (c.topic ? c.topic.title : 'Module ' + c.m.num + ': ' + c.m.title) : 'Curriculum'; },
    render(params) {
      if (!params.length) {
        const last = S().state.lastTopic && D.topicById[S().state.lastTopic];
        const t = last || ui.nextTopic() || D.allTopics[0];
        location.replace(t && last ? topicHref(t) : `#/curriculum/${(t || D.allTopics[0]).module.id}`);
        return '';
      }
      const cur = resolve(params);
      if (!cur) return `<div class="container section">${ui.emptyState('book', 'Topic not found', 'That module or topic does not exist.', '<a class="btn btn-primary" href="#/curriculum/m00">Go to Module 0</a>')}</div>`;
      curRef = cur;
      expanded.add(cur.m.id);
      return `<div class="container"><div class="explorer">${sidebar(cur)}${mainHtml(cur)}</div></div>`;
    },
    mount(root, params, query) {
      if (!curRef || !root.querySelector('.explorer')) return;
      bindSidebar(root);
      mountMain(root, curRef, query);
      const active = root.querySelector('.sidebar .topic-link[aria-current="page"]');
      if (active && window.matchMedia('(min-width: 1000px)').matches) {
        const sb = root.querySelector('.sidebar');
        sb.scrollTop = active.offsetTop - sb.clientHeight / 3;
      }
    },
    softNav(root, params, query) {
      const cur = resolve(params);
      if (!cur || !root.querySelector('.explorer')) return false;
      curRef = cur;
      expanded.add(cur.m.id);
      root.querySelector('#lesson').outerHTML = mainHtml(cur);
      refreshSidebar(root);
      mountMain(root, cur, query);
      document.title = this.title(params) + ' · AI Engineering Academy';
      if (!query.section) window.scrollTo(0, 0);
      const h1 = root.querySelector('#lesson h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      const active = root.querySelector('.sidebar .topic-link[aria-current="page"]');
      if (active && window.matchMedia('(min-width: 1000px)').matches) active.scrollIntoView({ block: 'nearest' });
      return true;
    },
    onChange(change, root) {
      if (change.type !== 'completed' || !curRef) return;
      refreshSidebar(root);
      const t = D.topicById[change.id];
      const btn = root.querySelector(`[data-complete="${change.id}"]`);
      if (btn) {
        const on = S().isDone(change.id);
        btn.setAttribute('aria-pressed', on);
        btn.innerHTML = icon(on ? 'checkCircle' : 'circle') + `<span>${on ? 'Completed' : 'Mark as complete'}</span>`;
        const tag = root.querySelector('#status-tag');
        if (tag) { tag.className = 'tag' + (on ? ' tag-green' : ''); tag.innerHTML = on ? icon('check') + 'Completed' : 'Not completed'; }
      }
      if (t) {
        const mp = ui.moduleProgress(t.module);
        const sp = root.querySelector('#side-prog'), st = root.querySelector('#side-prog-txt');
        if (sp) sp.style.width = mp.pct + '%';
        if (st) st.textContent = `${mp.done}/${mp.total} topics complete`;
        if (mp.pct === 100 && S().isDone(change.id)) ui.toast(`Module ${t.module.num} complete — well done!`);
      }
    }
  };
})();
