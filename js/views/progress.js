/* Progress & learning analytics — every number is derived from stored completion data. */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc, S = () => AIEA.store;

  /** Merge daily log entries with the topics actually completed each day. */
  function journalEntries() {
    const st = S().state, byDay = {};
    Object.entries(st.completed).forEach(([id, iso]) => { const t = D.topicById[id]; const d = new Date(iso); if (!t || isNaN(d)) return; const k = ui.localDay(d); (byDay[k] = byDay[k] || { topics: [] }).topics.push(t); });
    Object.entries(st.log).forEach(([k, l]) => { byDay[k] = Object.assign(byDay[k] || { topics: [] }, l); });
    return Object.keys(byDay).sort().reverse().map(k => {
      const d = new Date(k + 'T12:00:00');
      return { date: k, label: d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), text: byDay[k].text || '', minutes: byDay[k].minutes || 0, topics: byDay[k].topics };
    });
  }
  function journalMarkdown() {
    const lines = ['# My AI Engineering learning journal', ''];
    journalEntries().forEach(j => {
      lines.push(`## ${j.date}${j.minutes ? ` · ${AIEA.plan.fmtMin(j.minutes)}` : ''}`, '');
      j.topics.forEach(t => lines.push(`- [x] ${t.num} ${t.title}`));
      if (j.topics.length) lines.push('');
      if (j.text) lines.push(j.text, '');
    });
    return lines.join('\n');
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  AIEA.views.progress = {
    title: () => 'Progress',
    render() {
      const st = S().state;
      const o = ui.overall();
      const act = ui.activity(84);
      const jr = ui.jobReady();
      const plan = AIEA.plan.build();
      const curDay = Math.min(AIEA.plan.currentIndex(plan) + 1, plan.length);
      const journal = journalEntries();
      const path = ui.currentPath();
      const modsDone = D.modules.filter(m => { const p = ui.moduleProgress(m); return p.done === p.total; }).length;
      const msTotal = D.projects.reduce((s, p) => s + p.milestones.length, 0);
      const msDone = Object.keys(st.milestones).length;
      const quizzes = Object.values(st.quiz);
      const quizOk = quizzes.filter(q => q.correct).length;
      const next = ui.nextTopic();
      const notes = Object.entries(st.notes).filter(([id]) => D.topicById[id]);
      const saved = Object.keys(st.bookmarks).map(id => D.resourceById[id]).filter(Boolean);
      const projectsStarted = D.projects.filter(p => ui.milestoneProgress(p).done > 0);
      const fresh = o.done === 0 && msDone === 0 && !notes.length && !saved.length && !quizzes.length && !journal.length;
      const maxHeat = Math.max(1, ...act.heat.map(h => h.n));

      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('chart')} Progress &amp; analytics</span><h1>Your learning progress</h1>
          <p class="lead">Calculated only from what you have actually marked complete on this device. ${S().isPersistent() ? 'Progress is saved in this browser’s local storage — it is device-specific and not synced.' : '<b>Storage is unavailable in this browser session, so progress will be lost when the tab closes.</b>'}</p></header>

        ${fresh ? `<div class="callout info mt-2">${icon('info')}<div><p><b>Nothing tracked yet.</b> Complete a topic, tick a project milestone, answer a knowledge check or save a resource, and your dashboard will fill in. <a href="${next ? `#/curriculum/${next.module.id}/${next.idx + 1}` : '#/curriculum'}">Start with the first lesson →</a></p></div></div>` : ''}

        <section class="grid grid-2 mt-3">
          <div class="card card-elev"><div class="row" style="gap:22px;flex-wrap:nowrap">
            <div class="ring" style="--p:${o.pct}"><span>${o.pct}%<small>complete</small></span></div>
            <div><h3>${o.done} of ${o.total} topics</h3><p class="mb-0">Active path: <a href="#/roadmap"><b>${esc(path.name)}</b></a> · ${esc(path.duration)}</p>
              <div class="segmented mt-2" role="group" aria-label="Change learning path">${Object.values(D.paths).map(p => `<button class="btn-sm" data-path="${p.id}" aria-pressed="${p.id === path.id}">${esc(p.name.replace(' 12-week', ''))}</button>`).join('')}</div></div></div></div>
          <div class="card card-elev"><span class="eyebrow">${icon('play')} Next recommended lesson</span>
            ${next ? `<h3>${esc(next.num)} ${esc(next.title)}</h3><p>${esc(next.summary)}</p><a class="btn btn-primary" href="#/curriculum/${next.module.id}/${next.idx + 1}">${icon('arrowRight')} Continue</a>` : `<h3>Everything complete</h3><p>Every topic is marked complete. Keep polishing your capstone.</p>`}</div>
        </section>

        <section class="kpi-grid mt-2">
          <div class="card stat"><span class="stat-label">${icon('layers')} Modules completed</span><span class="stat-value">${modsDone}<span class="muted" style="font-size:1rem">/${D.modules.length}</span></span></div>
          <div class="card stat"><span class="stat-label">${icon('checkCircle')} Topics completed</span><span class="stat-value">${o.done}<span class="muted" style="font-size:1rem">/${o.total}</span></span></div>
          <div class="card stat"><span class="stat-label">${icon('trophy')} Project milestones</span><span class="stat-value">${msDone}<span class="muted" style="font-size:1rem">/${msTotal}</span></span></div>
          <div class="card stat"><span class="stat-label">${icon('question')} Knowledge checks</span><span class="stat-value">${quizOk}<span class="muted" style="font-size:1rem">/${quizzes.length}</span></span><span class="stat-sub">correct of attempted</span></div>
          <div class="card stat"><span class="stat-label">${icon('flame')} Current streak</span><span class="stat-value">${act.streak}</span><span class="stat-sub">best: ${act.best} day${act.best === 1 ? '' : 's'}</span></div>
          <div class="card stat"><span class="stat-label">${icon('target')} Plan day</span><span class="stat-value">${curDay}<span class="muted" style="font-size:1rem">/${plan.length}</span></span><span class="stat-sub"><a href="#/today">open today’s mission</a></span></div>
          <div class="card stat"><span class="stat-label">${icon('clock')} Time logged</span><span class="stat-value">${AIEA.plan.fmtMin(act.minutes)}</span><span class="stat-sub">${journal.length} journal entr${journal.length === 1 ? 'y' : 'ies'}</span></div>
        </section>

        <section class="grid grid-2 mt-3">
          <div class="panel"><div class="panel-title">${icon('map')} Roadmap progress by stage</div>
            <div class="stage-bars">${D.stages.map(s => { const p = ui.stageProgress(s); return `<div class="stage-bar"><a href="#/roadmap?stage=${s.n}">${s.n}. ${esc(s.title)}</a><div class="progress"><span style="width:${p.pct}%"></span></div><output>${p.pct}%</output></div>`; }).join('')}</div></div>
          <div class="panel"><div class="panel-title">${icon('activity')} Activity — last 12 weeks</div>
            <div class="heat wide" role="img" aria-label="${act.heat.filter(h => h.n).length} active days in the last 12 weeks">${act.heat.map(h => `<span class="${h.n ? 'l' + Math.min(3, Math.ceil(h.n / maxHeat * 3)) : ''}" title="${h.date}: ${h.n} activit${h.n === 1 ? 'y' : 'ies'}"></span>`).join('')}</div>
            <p class="text-sm muted mt-1">Each square is a day — topics, milestones, check-ins and journal entries count.</p>
            <div class="panel-title mt-2">${icon('target')} Skills mastered</div>
            <div class="skill-badges">${D.skills.map(s => { const ok = ui.skillEarned(s); return `<span class="skill-badge${ok ? '' : ' locked'}" title="${ok ? 'Earned' : 'Complete ' + s.modules.map(id => ui.modLabel(D.moduleById[id])).join(' + ')}">${icon(ok ? 'checkCircle' : 'lock')}${esc(s.label)}</span>`; }).join('')}</div>
            <p class="text-sm muted mt-1 mb-0">A skill is earned when every topic in its modules is complete.</p></div>
        </section>

        <section class="panel mt-3"><div class="panel-title">${icon('trophy')} Job readiness <span class="spacer"></span><b>${jr.pct}%</b></div>
          <div class="jr-grid">${jr.items.map(x => `<a class="jr-item${x.pct === 100 ? ' full' : ''}" href="${x.href}">${icon(x.pct === 100 ? 'checkCircle' : x.icon)}<span>${esc(x.label)}<div class="progress progress-sm"><span style="width:${x.pct}%"></span></div></span><output>${x.pct}%</output></a>`).join('')}</div></section>

        <section class="panel mt-3" id="sec-journal"><div class="panel-title">${icon('note')} Learning journal <span class="spacer"></span>${journal.length ? `<button class="btn btn-sm" id="pg-md">${icon('download')} Export as Markdown</button>` : ''}</div>
          ${journal.length ? `<div class="stack">${journal.slice(0, 30).map(j => `<div class="note-item"><div class="row" style="justify-content:space-between"><b>${esc(j.label)}</b><span class="text-sm muted">${j.minutes ? icon('clock') + ' ' + AIEA.plan.fmtMin(j.minutes) : ''}</span></div>${j.topics.length ? `<div class="tags mt-1">${j.topics.map(t => `<a class="tag tag-green" href="#/curriculum/${t.module.id}/${t.idx + 1}">${icon('check')}${t.num} ${esc(t.title)}</a>`).join('')}</div>` : ''}${j.text ? `<p>${esc(j.text)}</p>` : ''}</div>`).join('')}</div>` : ui.emptyState('note', 'No journal entries yet', 'Each day, write 2–3 lines on the Today page about what you learned.', '<a class="btn btn-sm" href="#/today">Go to Today</a>')}</section>

        ${st.parking.length ? `<section class="panel mt-3"><div class="panel-title">${icon('bookmark')} Parking lot (${st.parking.length})</div><div class="tags">${st.parking.map(x => `<span class="tag">${esc(x.text)}</span>`).join('')}</div><p class="text-sm muted mt-1 mb-0">Revisit these once you reach the related module.</p></section>` : ''}

        <section class="panel mt-3"><div class="panel-title">${icon('list')} Modules</div>
          <div class="tl-modules">${D.modules.map(m => { const p = ui.moduleProgress(m); return `<a class="mod-pill" href="#/curriculum/${m.id}"><span class="mod-num">${ui.modLabel(m)}</span><span class="mod-txt"><b>${esc(m.title)}</b><small>${p.done}/${p.total} topics</small><div class="progress progress-sm mt-1"><span style="width:${p.pct}%"></span></div></span>${ui.emphasisTag(ui.emphasisOf(m.id))}</a>`; }).join('')}</div></section>

        <section class="grid grid-2 mt-3">
          <div class="panel"><div class="panel-title">${icon('folder')} Project milestones</div>
            ${projectsStarted.length ? `<div class="stack">${projectsStarted.map(p => { const mp = ui.milestoneProgress(p); return `<a class="mod-pill" href="#/projects/${p.id}"><span class="mod-num">P${String(p.num).padStart(2, '0')}</span><span class="mod-txt"><b>${esc(p.title)}</b><small>${mp.done}/${mp.total} milestones</small><div class="progress progress-sm mt-1"><span style="width:${mp.pct}%"></span></div></span></a>`; }).join('')}</div>` : ui.emptyState('folder', 'No milestones yet', 'Open a project and tick milestones as you finish them.', '<a class="btn btn-sm" href="#/projects">Browse projects</a>')}</div>
          <div class="panel"><div class="panel-title">${icon('bookmark')} Saved resources (${saved.length})</div>
            ${saved.length ? `<div class="stack">${saved.map(r => ui.resourceMini(r)).join('')}</div>` : ui.emptyState('bookmark', 'No saved resources', 'Bookmark resources in the library or inside lessons.', '<a class="btn btn-sm" href="#/resources">Open library</a>')}</div>
        </section>

        <section class="panel mt-3"><div class="panel-title">${icon('note')} Study notes (${notes.length})</div>
          ${notes.length ? `<div class="grid grid-2">${notes.map(([id, text]) => { const t = D.topicById[id]; return `<div class="note-item"><a href="#/curriculum/${t.module.id}/${t.idx + 1}"><b>${t.num} ${esc(t.title)}</b></a><p>${esc(text.length > 400 ? text.slice(0, 400) + '…' : text)}</p></div>`; }).join('')}</div>` : ui.emptyState('note', 'No notes yet', 'Every lesson has a notes box that saves automatically.', '')}</section>

        <section class="panel mt-3"><div class="panel-title">${icon('hardDrive')} Your data</div>
          <p class="text-sm">Everything is stored locally in this browser (<code>localStorage</code>). Nothing is sent to a server. Export a backup to move progress to another device or browser.</p>
          <div class="row"><button class="btn" id="pg-export">${icon('download')} Export progress</button>
            <label class="btn" for="pg-import" tabindex="0" id="pg-import-label">${icon('upload')} Import progress</label><input type="file" id="pg-import" accept="application/json,.json" class="sr-only">
            ${st.skipLeaveConfirm ? `<button class="btn btn-ghost" id="pg-leave">${icon('logOut')} Re-enable “leaving site” confirmation</button>` : ''}
            <span class="spacer"></span><button class="btn btn-danger" id="pg-reset">${icon('trash')} Reset all progress</button></div></section>
      </div>`;
    },
    mount(root, params, query) {
      const md = root.querySelector('#pg-md');
      md && md.addEventListener('click', () => { try { download(`learning-journal-${S().today()}.md`, journalMarkdown(), 'text/markdown'); ui.toast('Journal exported'); } catch (e) { ui.toast('Export failed: ' + e.message, true); } });
      if (query && query.section) { const el = root.querySelector('#sec-' + query.section); el && setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
      root.querySelectorAll('[data-path]').forEach(b => b.addEventListener('click', () => { S().setPath(b.dataset.path); ui.toast(`Active path: ${D.paths[b.dataset.path].name}`); }));
      root.querySelector('#pg-export').addEventListener('click', () => {
        try {
          const blob = new Blob([S().exportJSON()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `ai-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          ui.toast('Progress exported');
        } catch (e) { ui.toast('Export failed: ' + e.message, true); }
      });
      const lbl = root.querySelector('#pg-import-label');
      lbl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); root.querySelector('#pg-import').click(); } });
      root.querySelector('#pg-import').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { ui.toast('That file is too large to be a progress export.', true); return; }
        const reader = new FileReader();
        reader.onload = () => {
          ui.modal({
            title: 'Replace current progress?', iconName: 'upload', confirmLabel: 'Import', danger: true,
            body: '<p>Importing will replace all progress, notes and bookmarks stored in this browser with the contents of the file.</p>',
            onConfirm: () => {
              try { S().importJSON(String(reader.result)); ui.toast('Progress imported'); }
              catch (err) { ui.toast('Import failed: ' + (err.message || 'invalid file'), true); }
            }
          });
        };
        reader.onerror = () => ui.toast('Could not read that file.', true);
        reader.readAsText(file);
        e.target.value = '';
      });
      const leave = root.querySelector('#pg-leave');
      leave && leave.addEventListener('click', () => { S().setSkipLeave(false); ui.toast('Confirmation re-enabled'); AIEA.rerender(); });
      root.querySelector('#pg-reset').addEventListener('click', () => ui.modal({
        title: 'Reset all progress?', iconName: 'alert', confirmLabel: 'Yes, reset everything', danger: true,
        body: `<p>This permanently deletes, from this browser:</p><ul><li>${ui.overall().done} completed topics</li><li>${Object.keys(S().state.milestones).length} project milestones</li><li>${Object.keys(S().state.notes).length} notes and ${Object.keys(S().state.bookmarks).length} bookmarks</li><li>knowledge-check history</li></ul><p class="text-sm muted">Consider exporting a backup first. This cannot be undone.</p>`,
        onConfirm: () => { S().reset(); ui.toast('Progress reset'); }
      }));
    },
    onChange(change) { if (change.type === 'bookmarks') AIEA.rerender(); }
  };
})();
