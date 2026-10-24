/* Today (daily mission) and Plan (week-by-week schedule) */
window.AIEA = window.AIEA || {};
AIEA.views = AIEA.views || {};

(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc, S = () => AIEA.store, P = () => AIEA.plan;
  const PACES = [[30, '30 min'], [60, '1 h'], [90, '1.5 h'], [120, '2 h'], [180, '3 h']];

  function paceBar() {
    const st = S().state;
    return `<div class="pace-bar">
      <div class="pace-group"><span class="pace-label">${icon('clock')} Daily time</span><div class="segmented" role="group" aria-label="Daily study time">${PACES.map(([v, l]) => `<button data-pace="${v}" aria-pressed="${st.pace === v}">${l}</button>`).join('')}</div></div>
      <div class="pace-group"><span class="pace-label">${icon('grid')} Days / week</span><div class="segmented" role="group" aria-label="Study days per week">${[5, 6, 7].map(n => `<button data-dpw="${n}" aria-pressed="${st.daysPerWeek === n}">${n}</button>`).join('')}</div></div>
      <div class="pace-group"><span class="pace-label">${icon('route')} Path</span><div class="segmented" role="group" aria-label="Learning path">${Object.values(D.paths).map(p => `<button data-path="${p.id}" aria-pressed="${st.path === p.id}">${esc(p.name.replace(' 12-week', ''))}</button>`).join('')}</div></div>
    </div>`;
  }
  function bindPace(root) {
    root.querySelectorAll('[data-pace]').forEach(b => b.addEventListener('click', () => { S().setPace(+b.dataset.pace); ui.toast('Plan re-sized — your progress is kept'); }));
    root.querySelectorAll('[data-dpw]').forEach(b => b.addEventListener('click', () => S().setDaysPerWeek(+b.dataset.dpw)));
    root.querySelectorAll('.pace-bar [data-path]').forEach(b => b.addEventListener('click', () => { S().setPath(b.dataset.path); ui.toast(`Path: ${D.paths[b.dataset.path].name}`); }));
  }

  function itemTitle(it) {
    const base = it.type === 'topic' ? `${it.topic.num} ${it.topic.title}` : `${it.project.title}: ${it.project.milestones[it.ms][0]}`;
    return base + (it.parts > 1 ? ` · part ${it.part}/${it.parts}` : '');
  }

  function missionCard(it, i) {
    const done = P().itemDone(it);
    const isBuild = it.type === 'build';
    const res = P().resourceFor(it);
    const lessonHref = isBuild ? `#/projects/${it.project.id}` : `#/curriculum/${it.module.id}/${it.topic.idx + 1}`;
    const steps = isBuild
      ? [`<a class="step" href="#/projects/${it.project.id}"><span class="step-n">1</span>${icon('blueprint')}<span>Read the brief</span></a>`,
         `<span class="step"><span class="step-n">2</span>${icon('code')}<span>Build: ${esc(it.project.milestones[it.ms][1])}</span></span>`,
         `<a class="step" href="#/projects/${it.project.id}"><span class="step-n">3</span>${icon('checkCircle')}<span>Check criteria</span></a>`]
      : [`<a class="step" href="${lessonHref}"><span class="step-n">1</span>${icon('book')}<span>Learn</span></a>`,
         res ? ui.ext(res.url, `<span class="step-n">2</span>${icon(D.resourceTypes[res.type].icon)}<span>${res.type === 'video' ? 'Watch' : 'Read'}: ${esc(res.title.length > 34 ? res.title.slice(0, 32) + '…' : res.title)}</span>`, 'step') : '',
         `<a class="step" href="${lessonHref}?section=exercise"><span class="step-n">3</span>${icon('dumbbell')}<span>Practice</span></a>`];
    const label = it.part < it.parts ? 'Done for today' : (isBuild ? 'Milestone done' : 'Topic done');
    return `<article class="mission${done ? ' done' : ''}">
      <div class="mission-icon ${isBuild ? 'build' : ''}">${icon(done ? 'checkCircle' : isBuild ? 'hammer' : it.topic.lesson ? 'sparkles' : 'book')}</div>
      <div class="mission-body">
        <div class="mission-meta"><span class="tag ${isBuild ? 'tag-amber' : 'tag-cyan'}">${isBuild ? 'Build' : 'Learn'}${it.review ? ' · review' : ''}</span><span class="tag">${ui.modLabel(it.module)} ${esc(it.module.short)}</span><span class="tag">${icon('clock')}${P().fmtMin(it.min)}</span></div>
        <h3><a href="${lessonHref}">${esc(itemTitle(it))}</a></h3>
        <div class="steps">${steps.join('')}</div>
      </div>
      <button class="btn mission-btn ${done ? 'is-done' : 'btn-primary'}" data-item="${i}" aria-pressed="${done}">${icon(done ? 'check' : 'circle')}<span>${done ? 'Done' : label}</span></button>
    </article>`;
  }

  function logCard(date) {
    const l = S().getLog(date) || { text: '', minutes: 0 };
    return `<section class="panel"><div class="panel-title">${icon('note')} What did I learn today?</div>
      <textarea class="textarea" id="log-text" rows="4" placeholder="3 bullet points: what you learned, what confused you, what’s next." aria-label="Daily learning log">${esc(l.text)}</textarea>
      <div class="row mt-1"><span class="text-sm muted">Time studied</span><div class="chips" role="group" aria-label="Minutes studied">${[15, 30, 60, 90, 120, 180].map(m => `<button class="chip" data-min="${m}" aria-pressed="${l.minutes === m}">${m < 60 ? m + 'm' : m / 60 + 'h'}</button>`).join('')}</div></div>
      <div class="row mt-2"><button class="btn btn-primary btn-sm" id="log-save">${icon('check')} Save today’s log</button><span class="text-sm muted" id="log-status" aria-live="polite">${S().getLog(date) ? 'Saved ✓' : ''}</span><span class="spacer"></span><a class="text-sm" href="#/progress?section=journal">All entries</a></div></section>`;
  }

  function suggestFor(text) {
    const stop = new Set(['what', 'when', 'where', 'which', 'with', 'from', 'that', 'this', 'does', 'about', 'into', 'your', 'have', 'learn', 'should', 'using', 'there', 'their', 'than', 'then', 'more', 'some', 'like', 'they', 'will']);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stop.has(w));
    if (!words.length) return null;
    let best = null, score = 0;
    D.allTopics.forEach(t => { const hay = (t.title + ' ' + t.summary).toLowerCase(); const s = words.filter(w => hay.includes(w)).length; if (s > score) { score = s; best = t; } });
    return best;
  }
  function parkingCard() {
    const list = S().state.parking;
    return `<section class="panel"><div class="panel-title">${icon('bookmark')} Parking lot</div>
      <p class="text-sm muted">Saw something shiny? Park it here instead of opening a new tutorial.</p>
      <form class="row" id="park-form" style="flex-wrap:nowrap"><input class="search-input" id="park-input" maxlength="300" placeholder="e.g. “What is MCP?”" aria-label="Topic to park"><button class="btn btn-sm" type="submit">${icon('arrowRight')} Park</button></form>
      <ul class="park-list">${list.slice(0, 6).map(x => { const t = suggestFor(x.text); return `<li><span>${esc(x.text)}${t ? `<small>Covered in <a href="#/curriculum/${t.module.id}/${t.idx + 1}">${t.num} ${esc(t.title)}</a></small>` : ''}</span><button class="icon-btn" data-unpark="${x.id}" aria-label="Remove ${esc(x.text)}">${icon('x')}</button></li>`; }).join('') || `<li class="muted text-sm">Empty — nice focus.</li>`}</ul></section>`;
  }

  /** Which day to show: ?day=N, else the day finished today (until midnight), else the first unfinished day. */
  function resolveDay(plan, query) {
    const cur = P().currentIndex(plan);
    const live = Math.min(cur, plan.length - 1);
    if (query.day) return { idx: Math.min(Math.max(parseInt(query.day, 10) - 1, 0), plan.length - 1), live, cur };
    const f = S().state.finished;
    if (f && f.date === S().today()) {
      const fi = plan.findIndex(d => d.items.some(it => it.key === f.key));
      if (fi !== -1 && fi === cur - 1 && P().dayDone(plan[fi])) return { idx: fi, live: fi, cur };
    }
    return { idx: live, live, cur };
  }

  AIEA.views.today = {
    title: () => 'Today',
    render(params, query) {
      const plan = P().build();
      const { idx, live, cur } = resolveDay(plan, query);
      const finished = cur >= plan.length;
      const day = plan[idx];
      const viewingOther = idx !== live;
      const act = ui.activity();
      const jr = ui.jobReady();
      const donePct = Math.round(Math.min(cur, plan.length) / plan.length * 100);
      const dayComplete = P().dayDone(day);
      const upcoming = plan.slice(idx + 1, idx + 5);

      return `<div class="container">
        <section class="today-hero">
          <div>
            <span class="eyebrow">${icon('target')} Week ${day.week} · Day ${day.dayOfWeek} of ${plan.dpw}</span>
            <h1>${finished && !viewingOther ? 'Plan complete' : `Day ${day.n}`}<span class="muted" style="font-size:.45em;font-weight:600"> / ${plan.length}</span></h1>
            <div class="row"><span class="stage-chip" style="background:${ui.stageColor(day.stage.tone)}">${icon(day.stage.icon)} Stage ${day.stage.n}</span><span class="muted">${esc(day.stage.title)}</span></div>
            <div class="progress mt-2" style="max-width:520px"><span style="width:${donePct}%"></span></div>
            <div class="text-sm muted mt-1">${Math.min(cur, plan.length)} of ${plan.length} days done · ≈ ${plan.weeks} weeks at ${P().fmtMin(plan.budget)}/day, ${plan.dpw} days/week</div>
          </div>
          <div class="hero-stats">
            <div class="hstat"><span class="hstat-icon" style="color:var(--amber)">${icon('flame')}</span><b>${act.streak}</b><small>day streak</small></div>
            <div class="hstat"><span class="hstat-icon">${icon('clock')}</span><b>${P().fmtMin(day.min)}</b><small>today</small></div>
            <div class="hstat"><span class="hstat-icon" style="color:var(--green)">${icon('trophy')}</span><b>${jr.pct}%</b><small>job-ready</small></div>
          </div>
        </section>

        ${paceBar()}

        <section class="mt-3">
          <div class="row" style="justify-content:space-between">
            <h2 class="mb-0">${viewingOther ? `Day ${day.n} mission` : 'Today’s mission'}</h2>
            <div class="row">${idx > 0 ? `<a class="btn btn-sm btn-ghost" href="#/today?day=${idx}" aria-label="Previous day">${icon('chevronLeft')}</a>` : ''}
              ${viewingOther ? `<a class="btn btn-sm" href="#/today">${icon('target')} Back to today</a>` : ''}
              ${idx < plan.length - 1 ? `<a class="btn btn-sm btn-ghost" href="#/today?day=${idx + 2}" aria-label="Next day">${icon('chevronRight')}</a>` : ''}
              <a class="btn btn-sm" href="#/plan">${icon('list')} Full plan</a></div>
          </div>
          <div class="missions mt-2">${day.items.map(missionCard).join('')}</div>
          ${dayComplete ? `<div class="celebrate mt-2">${icon('trophy')}<div><b>Day ${day.n} complete!</b><span>Write your log below, then rest — or keep the momentum.</span></div>${idx + 1 < plan.length ? `<a class="btn btn-primary" href="#/today?day=${idx + 2}">Start Day ${idx + 2} ${icon('arrowRight')}</a>` : ''}</div>` : ''}
        </section>

        <section class="rules mt-3" aria-label="Focus rules">
          <div class="rule">${icon('target')}<b>One mission a day</b></div>
          <div class="rule">${icon('library')}<b>Only today’s links</b></div>
          <div class="rule">${icon('bookmark')}<b>Park distractions</b></div>
          <div class="rule">${icon('note')}<b>Log what you learned</b></div>
        </section>

        <div class="grid grid-2 mt-3">${logCard(S().today())}${parkingCard()}</div>

        ${upcoming.length ? `<section class="mt-4"><h2>Coming up</h2><div class="day-tiles">${upcoming.map(d => `<a class="day-tile" href="#/today?day=${d.n}"><span class="day-n">Day ${d.n}</span><b>${esc(itemTitle(d.items[0]))}</b>${d.items.length > 1 ? `<small>+${d.items.length - 1} more</small>` : ''}<span class="tag">${icon('clock')}${P().fmtMin(d.min)}</span></a>`).join('')}</div></section>` : ''}
      </div>`;
    },
    mount(root, params, query) {
      const plan = P().build();
      const { idx } = resolveDay(plan, query);
      const day = plan[idx];
      bindPace(root);
      root.querySelectorAll('[data-item]').forEach(b => b.addEventListener('click', () => {
        const it = day.items[+b.dataset.item];
        if (P().itemDone(it)) P().undoItem(it); else { P().completeItem(it); ui.toast(it.part < it.parts ? 'Nice — continue tomorrow' : 'Done! Great work'); }
        if (P().dayDone(day)) S().setFinished(day.items[0].key);
        AIEA.rerender();
      }));
      let minutes = (S().getLog(S().today()) || {}).minutes || 0;
      root.querySelectorAll('[data-min]').forEach(c => c.addEventListener('click', () => {
        minutes = minutes === +c.dataset.min ? 0 : +c.dataset.min;
        root.querySelectorAll('[data-min]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.min === minutes));
      }));
      root.querySelector('#log-save').addEventListener('click', () => {
        S().setLog(S().today(), root.querySelector('#log-text').value, minutes);
        root.querySelector('#log-status').textContent = 'Saved ✓';
        ui.toast('Today’s log saved');
      });
      root.querySelector('#park-form').addEventListener('submit', e => {
        e.preventDefault();
        const v = root.querySelector('#park-input').value.trim();
        if (!v) return;
        S().addParking(v); ui.toast('Parked — back to today’s mission'); AIEA.rerender();
      });
      root.querySelectorAll('[data-unpark]').forEach(b => b.addEventListener('click', () => { S().removeParking(b.dataset.unpark); AIEA.rerender(); }));
    }
  };

  // ───────── Plan (week by week)
  const openWeeks = new Set();
  function dayRows(plan, w) {
    return plan.filter(d => d.week === w).map(d => {
      const done = P().dayDone(d);
      return `<a class="day-row${done ? ' done' : ''}" href="#/today?day=${d.n}"><span class="t-status${done ? ' done' : ''}" aria-hidden="true">${done ? icon('check') : ''}</span>
        <span class="day-n">Day ${d.n}</span><span class="day-items">${d.items.map(it => `<span class="${it.type === 'build' ? 'build' : ''}">${it.type === 'build' ? icon('hammer') : ''}${esc(itemTitle(it))}</span>`).join('')}</span>
        <span class="t-meta">${P().fmtMin(d.min)}</span><span class="sr-only">${done ? 'completed' : ''}</span></a>`;
    }).join('');
  }

  AIEA.views.plan = {
    title: () => 'Plan',
    render() {
      const plan = P().build();
      const cur = P().currentIndex(plan);
      const curWeek = (plan[Math.min(cur, plan.length - 1)] || {}).week || 1;
      if (!openWeeks.size) openWeeks.add(curWeek);
      const months = (plan.weeks / 4.35).toFixed(1);
      const weeks = [];
      for (let w = 1; w <= plan.weeks; w++) {
        const days = plan.filter(d => d.week === w);
        const done = days.filter(P().dayDone).length;
        const mods = [...new Set(days.map(d => d.module))];
        const builds = days.some(d => d.items.some(i => i.type === 'build'));
        const open = openWeeks.has(w);
        weeks.push(`<li class="week${w === curWeek ? ' current' : ''}${done === days.length ? ' complete' : ''}">
          <button class="week-btn" data-week="${w}" aria-expanded="${open}" aria-controls="wk-${w}">
            ${icon('chevronRight', 'chev')}<span class="wk-num">W${w}</span>
            <span class="wk-title"><b>${mods.map(m => esc(m.short)).join(' · ')}</b><small>${days.length} days${builds ? ' · includes build days' : ''}${w === curWeek ? ' · you are here' : ''}</small></span>
            <span class="stage-dot" style="background:${ui.stageColor(days[0].stage.tone)}" title="Stage ${days[0].stage.n}"></span>
            <span class="wk-prog"><span class="progress progress-sm"><span style="width:${Math.round(done / days.length * 100)}%"></span></span><small>${done}/${days.length}</small></span>
          </button>
          <div class="week-days" id="wk-${w}" ${open ? '' : 'hidden'}>${open ? dayRows(plan, w) : ''}</div></li>`);
      }
      return `<div class="container">
        <header class="page-hero"><span class="eyebrow">${icon('list')} Your plan</span><h1>Day by day, week by week</h1>
          <div class="plan-stats">
            <div><b>${plan.length}</b><small>study days</small></div><div><b>${plan.weeks}</b><small>weeks</small></div><div><b>≈${months}</b><small>months</small></div><div><b>${D.projects.filter(p => Object.values(P().BUILD_AFTER).flat().includes(p.id)).length}</b><small>projects built</small></div>
          </div></header>
        ${paceBar()}
        <div class="row mt-3" style="justify-content:space-between"><a class="btn btn-primary" href="#/today">${icon('target')} Go to today (Day ${Math.min(cur + 1, plan.length)})</a>
          <div class="row"><button class="btn btn-ghost btn-sm" id="wk-expand">Expand all</button><button class="btn btn-ghost btn-sm" id="wk-collapse">Collapse all</button></div></div>
        <ol class="weeks mt-2">${weeks.join('')}</ol>
        ${plan.optional.length ? `<div class="callout info mt-3">${icon('sparkles')}<div><p><b>After the plan:</b> optional specialisations — ${plan.optional.map(m => `<a href="#/curriculum/${m.id}">${esc(m.title)}</a>`).join(', ')}.</p></div></div>` : ''}
      </div>`;
    },
    mount(root) {
      const plan = P().build();
      bindPace(root);
      root.querySelectorAll('[data-week]').forEach(b => b.addEventListener('click', () => {
        const w = +b.dataset.week, panel = root.querySelector('#wk-' + w);
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open); panel.hidden = !open;
        if (open) { openWeeks.add(w); if (!panel.innerHTML) panel.innerHTML = dayRows(plan, w); } else openWeeks.delete(w);
      }));
      root.querySelector('#wk-expand').addEventListener('click', () => { for (let w = 1; w <= plan.weeks; w++) openWeeks.add(w); AIEA.rerender(); });
      root.querySelector('#wk-collapse').addEventListener('click', () => { openWeeks.clear(); openWeeks.add(-1); AIEA.rerender(); });
      const cur = root.querySelector('.week.current');
      if (cur && window.scrollY === 0) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
    }
  };
})();
