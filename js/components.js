/* Shared UI helpers and components (string templates + delegated handlers). */
window.AIEA = window.AIEA || {};

(function () {
  const D = AIEA.data;
  const S = () => AIEA.store;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = AIEA.icon;

  // ───────── Toast
  function toast(msg, err) {
    let region = document.querySelector('.toast-region');
    if (!region) { region = document.createElement('div'); region.className = 'toast-region'; region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite'); document.body.appendChild(region); }
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = icon(err ? 'alert' : 'checkCircle') + '<span></span>';
    t.querySelector('span').textContent = msg;
    region.appendChild(t);
    setTimeout(() => t.remove(), err ? 6000 : 2600);
  }

  // ───────── Modal (focus-trapped, Esc to cancel)
  function modal({ title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, iconName = 'info', onConfirm }) {
    const prev = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">${icon(iconName)} ${esc(title)}</h2><div class="modal-body">${body}</div>
      <div class="row"><button class="btn btn-ghost" data-act="cancel">${esc(cancelLabel)}</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${esc(confirmLabel)}</button></div></div>`;
    document.body.appendChild(wrap);
    const focusables = () => [...wrap.querySelectorAll('button, input, a[href], textarea, select')];
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); prev && prev.focus && prev.focus(); };
    const onKey = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => {
      if (e.target === wrap) return close();
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'ok') { try { onConfirm && onConfirm(wrap); } finally { close(); } } else close();
    });
    wrap.querySelector('[data-act="ok"]').focus();
  }

  // ───────── External links: confirm before leaving
  function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return null; } }
  function ext(url, text, cls) {
    return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-external class="ext ${cls || ''}" title="Opens ${esc(hostOf(url) || 'external site')} in a new tab">${text}${icon('external')}<span class="sr-only"> (opens external site in new tab)</span></a>`;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-external]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = a.getAttribute('href');
    const host = hostOf(url);
    if (!host || !/^https?:/i.test(url)) { e.preventDefault(); toast('This link looks invalid and was blocked.', true); return; }
    if (S().state.skipLeaveConfirm) return; // allow native navigation
    e.preventDefault();
    modal({
      title: 'Leaving the Academy', iconName: 'logOut', confirmLabel: 'Open ' + host,
      body: `<p>You are about to open an external site in a new tab:</p><p><code>${esc(url)}</code></p><p class="text-sm muted">External content is maintained by its publisher and may change.</p><label class="toggle"><input type="checkbox" class="skip-leave"> Don’t ask again on this device</label>`,
      onConfirm: w => {
        if (w.querySelector('.skip-leave').checked) S().setSkipLeave(true);
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win) toast('Your browser blocked the new tab. Allow pop-ups or use Ctrl/Cmd-click.', true);
      }
    });
  });

  // ───────── Progress math (always derived from stored completion data)
  function moduleProgress(m) {
    const total = m.topicList.length;
    const done = m.topicList.filter(t => S().isDone(t.id)).length;
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function stageProgress(stage) {
    let done = 0, total = 0;
    stage.modules.forEach(id => { const p = moduleProgress(D.moduleById[id]); done += p.done; total += p.total; });
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function overall() {
    const total = D.allTopics.length;
    const done = D.allTopics.filter(t => S().isDone(t.id)).length;
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function stageStatus(stage) {
    const p = stageProgress(stage);
    if (p.total && p.done === p.total) return 'done';
    if (p.done > 0) return 'active';
    return 'todo';
  }
  function statusLabel(st) { return st === 'done' ? 'Completed' : st === 'active' ? 'In progress' : 'Not started'; }
  function currentPath() { return D.paths[S().state.path] || D.paths.intermediate; }
  function emphasisOf(mid, path) { return (path || currentPath()).emphasis[mid] || 'core'; }
  function estHours(m, path) {
    path = path || currentPath();
    const e = emphasisOf(m.id, path);
    const f = e === 'light' ? 0.45 : 1;
    return Math.max(2, Math.round(m.hours * path.multiplier * f));
  }
  function fmtHours(h) { return h >= 1 ? `${h} h` : `${Math.round(h * 60)} min`; }
  function emphasisTag(e) {
    if (e === 'core') return `<span class="tag tag-cyan">${icon('target')}Core</span>`;
    if (e === 'light') return `<span class="tag tag-blue">${icon('eye')}Review</span>`;
    return `<span class="tag tag-violet">${icon('sparkles')}Optional</span>`;
  }
  function diffTag(d) { const t = { Beginner: 'green', Intermediate: 'blue', Advanced: 'violet' }[d] || 'blue'; return `<span class="tag tag-${t}">${esc(d)}</span>`; }
  function stageColor(tone) { return { cyan: 'linear-gradient(135deg,#06b6d4,#3b82f6)', blue: 'linear-gradient(135deg,#3b82f6,#6366f1)', violet: 'linear-gradient(135deg,#8b5cf6,#6366f1)', green: 'linear-gradient(135deg,#10b981,#06b6d4)', amber: 'linear-gradient(135deg,#f59e0b,#ef4444)', rose: 'linear-gradient(135deg,#f43f5e,#8b5cf6)' }[tone] || 'var(--grad)'; }

  /** Next recommended topic: first incomplete topic in core/review modules (in order), else any. */
  function nextTopic() {
    const path = currentPath();
    const ordered = D.modules.filter(m => emphasisOf(m.id, path) !== 'optional');
    for (const m of ordered) for (const t of m.topicList) if (!S().isDone(t.id)) return t;
    return D.allTopics.find(t => !S().isDone(t.id)) || null;
  }

  /** Activity days (local dates) from real completions, check-ins and daily log → streak + heat map. */
  function localDay(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function activity(daysBack) {
    daysBack = daysBack || 28;
    const st = S().state, days = {};
    const add = (d, n) => { if (d) days[d] = (days[d] || 0) + (n || 1); };
    Object.values(st.completed).forEach(iso => { const d = new Date(iso); if (!isNaN(d)) add(localDay(d)); });
    Object.values(st.milestones).forEach(iso => { const d = new Date(iso); if (!isNaN(d)) add(localDay(d)); });
    Object.entries(st.checkins || {}).forEach(([d, n]) => add(d, n));
    Object.keys(st.log || {}).forEach(d => add(d));
    const today = new Date(); today.setHours(12, 0, 0, 0);
    let streak = 0; const d = new Date(today);
    if (!days[localDay(d)]) d.setDate(d.getDate() - 1); // streak survives until end of today
    while (days[localDay(d)]) { streak++; d.setDate(d.getDate() - 1); }
    let best = 0, run = 0; const sorted = Object.keys(days).sort();
    sorted.forEach((k, i) => { const prev = sorted[i - 1]; const gap = prev ? Math.round((new Date(k) - new Date(prev)) / 864e5) : 0; run = gap === 1 ? run + 1 : 1; best = Math.max(best, run); });
    const heat = [];
    for (let i = daysBack - 1; i >= 0; i--) { const x = new Date(today); x.setDate(x.getDate() - i); const k = localDay(x); heat.push({ date: k, n: days[k] || 0 }); }
    const minutes = Object.values(st.log || {}).reduce((a, l) => a + (l.minutes || 0), 0);
    return { streak, best, heat, activeDays: sorted.length, minutes, todayActive: !!days[localDay(today)] };
  }

  /** Job-ready checklist, derived only from real progress. */
  function jobReady() {
    const mods = ids => { let d = 0, t = 0; ids.forEach(id => { const p = moduleProgress(D.moduleById[id]); d += p.done; t += p.total; }); return t ? d / t : 0; };
    const proj = id => { const p = D.projectById[id]; return p.milestones.filter((_, i) => S().isMilestone(`${id}:${i}`)).length / p.milestones.length; };
    const done = D.projects.filter(p => proj(p.id) === 1).length;
    const items = [
      { label: 'Python & backend APIs', icon: 'code', pct: (mods(['m01', 'm02']) * 3 + proj('p01')) / 4, href: '#/curriculum/m01' },
      { label: 'LLM apps & structured output', icon: 'brain', pct: (mods(['m05', 'm06']) * 2 + proj('p02') + proj('p03')) / 4, href: '#/curriculum/m05' },
      { label: 'RAG system with citations', icon: 'database', pct: (mods(['m07', 'm08']) * 2 + proj('p04')) / 3, href: '#/projects/p04' },
      { label: 'Controlled AI agent', icon: 'bot', pct: (mods(['m09', 'm10']) * 2 + proj('p08')) / 3, href: '#/projects/p08' },
      { label: 'Evaluation suite', icon: 'gauge', pct: (mods(['m11']) + proj('p10')) / 2, href: '#/projects/p10' },
      { label: 'Production & security', icon: 'shield', pct: mods(['m12', 'm13']), href: '#/curriculum/m12' },
      { label: 'Deployed capstone', icon: 'rocket', pct: proj('p12'), href: '#/projects/p12' },
      { label: '3+ portfolio projects', icon: 'trophy', pct: Math.min(1, done / 3), href: '#/projects' }
    ].map(x => Object.assign(x, { pct: Math.round(x.pct * 100) }));
    return { items, pct: Math.round(items.reduce((a, b) => a + b.pct, 0) / items.length) };
  }
  function skillEarned(s) { return s.modules.every(id => { const p = moduleProgress(D.moduleById[id]); return p.total && p.done === p.total; }); }

  // ───────── Resource rendering
  function costTag(r) {
    if (r.cost === 'Free') return `<span class="tag tag-green">Free</span>`;
    if (r.cost) return `<span class="tag tag-amber">${esc(r.cost)}</span>`;
    return `<span class="tag" title="Pricing not verified — check the provider">Check provider</span>`;
  }
  function resourceCard(r, query) {
    const T = D.resourceTypes[r.type];
    const hl = s => query ? esc(s).replace(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>') : esc(s);
    const mods = r.modules.map(id => `<a class="tag" href="#/curriculum/${id}">M${String(D.moduleById[id].num).padStart(2, '0')}</a>`).join('');
    const bm = S().isBookmarked(r.id);
    return `<article class="card res-card" data-res="${r.id}">
      <div class="res-top"><div class="res-type" style="color:var(--${T.tone})">${icon(T.icon)}</div>
        <div style="min-width:0;flex:1"><h3>${hl(r.title)}</h3><div class="publisher">${hl(r.publisher)}</div></div>
        <button class="icon-btn" data-bookmark="${r.id}" aria-pressed="${bm}" aria-label="${bm ? 'Remove bookmark' : 'Bookmark'}: ${esc(r.title)}">${icon(bm ? 'bookmarkFill' : 'bookmark')}</button></div>
      <p>${hl(r.desc)}</p>
      <div class="tags"><span class="tag">${esc(T.label)}</span>${diffTag(r.difficulty)}${costTag(r)}${r.duration ? `<span class="tag">${icon('clock')}${esc(r.duration)}</span>` : ''}</div>
      <div class="tags">${mods}</div>
      <div class="res-actions"><span class="verified">${icon('checkCircle')}Link checked ${esc(r.checked)}</span><span class="spacer"></span>${ext(r.url, 'Open', 'btn btn-sm')}</div>
    </article>`;
  }
  function resourceMini(r, tier) {
    if (!r) return '';
    const T = D.resourceTypes[r.type];
    return `<div class="res-mini"><div class="res-type" style="color:var(--${T.tone})">${icon(T.icon)}</div><div style="min-width:0;flex:1">
      ${tier ? `<div class="tier">${esc(tier)}</div>` : ''}<b>${ext(r.url, esc(r.title))}</b><small>${esc(r.publisher)} · ${esc(T.label)}${r.cost === 'Free' ? ' · Free' : ''}</small></div>
      <button class="icon-btn" data-bookmark="${r.id}" aria-pressed="${S().isBookmarked(r.id)}" aria-label="Bookmark ${esc(r.title)}">${icon(S().isBookmarked(r.id) ? 'bookmarkFill' : 'bookmark')}</button></div>`;
  }
  // Bookmark toggle (delegated, updates every matching button in place)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-bookmark]');
    if (!b) return;
    const id = b.dataset.bookmark;
    const on = S().toggleBookmark(id);
    document.querySelectorAll(`[data-bookmark="${id}"]`).forEach(x => { x.setAttribute('aria-pressed', on); x.innerHTML = icon(on ? 'bookmarkFill' : 'bookmark'); });
    toast(on ? 'Saved to your resources' : 'Removed from saved resources');
  });

  // ───────── Knowledge check
  function quiz(q, key, legend) {
    const prev = S().state.quiz[key];
    return `<form class="quiz" data-quiz="${esc(key)}" data-answer="${q.answer}">
      <fieldset><legend>${esc(legend ? legend + ' ' : '')}${esc(q.q)}</legend>
      ${q.options.map((o, i) => `<label class="quiz-opt"><input type="radio" name="${esc(key)}" value="${i}"> <span>${esc(o)}</span></label>`).join('')}</fieldset>
      <div class="row"><button class="btn btn-sm" type="submit">${icon('check')}Check answer</button>${prev ? `<span class="text-sm muted">Last attempt: ${prev.correct ? 'correct' : 'incorrect'}</span>` : ''}</div>
      <div class="quiz-feedback" hidden aria-live="polite" data-why="${esc(q.why)}"></div></form>`;
  }
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-quiz]');
    if (!f) return;
    e.preventDefault();
    const sel = f.querySelector('input[type=radio]:checked');
    const fb = f.querySelector('.quiz-feedback');
    fb.hidden = false;
    if (!sel) { fb.className = 'quiz-feedback'; fb.textContent = 'Choose an answer first.'; return; }
    const ans = +f.dataset.answer, ok = +sel.value === ans;
    f.querySelectorAll('.quiz-opt').forEach((l, i) => { l.classList.remove('correct', 'wrong'); if (i === ans) l.classList.add('correct'); else if (l.contains(sel)) l.classList.add('wrong'); });
    fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'no');
    fb.textContent = (ok ? 'Correct. ' : 'Not quite. ') + fb.dataset.why;
    S().recordQuiz(f.dataset.quiz, ok);
  });

  function emptyState(iconName, title, text, action) {
    return `<div class="empty-state">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action || ''}</div>`;
  }
  function modLabel(m) { return 'M' + String(m.num).padStart(2, '0'); }

  AIEA.ui = { esc, toast, modal, ext, hostOf, moduleProgress, stageProgress, overall, stageStatus, statusLabel, currentPath, emphasisOf, estHours, fmtHours, emphasisTag, diffTag, stageColor, nextTopic, activity, jobReady, localDay, skillEarned, resourceCard, resourceMini, quiz, emptyState, modLabel, costTag };
  AIEA.toast = toast;
})();
