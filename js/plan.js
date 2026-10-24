/* Daily plan engine: turns the curriculum (topics + project milestones) into
   a day-by-day schedule sized to the learner's daily time budget.
   Progress is stored per topic / milestone, so changing pace or path re-packs
   the days without losing anything. */
window.AIEA = window.AIEA || {};

(function () {
  const D = AIEA.data, S = () => AIEA.store;

  // Projects scheduled right after the module that prepares you for them.
  const BUILD_AFTER = { m01: ['p01'], m05: ['p02'], m06: ['p03'], m07: ['p06'], m08: ['p04'], m09: ['p08'], m10: ['p09'], m11: ['p10'], m13: ['p11'], m15: ['p12'] };
  // p05 (RAG assistant) and p07 (support assistant) stay in the gallery as stretch projects.

  const round5 = n => Math.max(5, Math.round(n / 5) * 5);
  function projectHours(p) { const nums = (p.duration.match(/\d+/g) || ['10']).map(Number); return nums.reduce((a, b) => a + b, 0) / nums.length; }

  function rawItems(path) {
    const items = [];
    D.modules.forEach(m => {
      const e = path.emphasis[m.id] || 'core';
      if (e === 'optional') return;
      const f = path.multiplier * (e === 'light' ? 0.45 : 1);
      m.topicList.forEach(t => items.push({ type: 'topic', key: t.id, topic: t, module: m, min: round5(t.minutes * f), review: e === 'light' }));
      (BUILD_AFTER[m.id] || []).forEach(pid => {
        const p = D.projectById[pid];
        const per = projectHours(p) * 60 * (path.projectFactor || 0.4) / p.milestones.length;
        p.milestones.forEach((ms, i) => items.push({ type: 'build', key: `${pid}:${i}`, project: p, ms: i, module: m, min: round5(per) }));
      });
    });
    return items;
  }

  let cache = { sig: null, plan: null };
  function build() {
    const st = S().state;
    const path = D.paths[st.path] || D.paths.beginner;
    const budget = st.pace, dpw = st.daysPerWeek;
    const sig = [path.id, budget, dpw].join('|');
    if (cache.sig === sig) return cache.plan;

    // split long items into parts that each fit roughly one day
    const units = [];
    rawItems(path).forEach(it => {
      if (it.min > budget * 1.25) {
        const parts = Math.ceil(it.min / budget);
        for (let p = 1; p <= parts; p++) units.push(Object.assign({}, it, { part: p, parts, min: round5(it.min / parts) }));
      } else units.push(Object.assign({}, it, { part: 1, parts: 1 }));
    });

    // pack units into days
    const days = [];
    let cur = [], used = 0;
    const close = () => { if (cur.length) { days.push(cur); cur = []; used = 0; } };
    units.forEach(u => {
      if (u.parts > 1) { close(); days.push([u]); return; }
      if (cur.length && used + u.min > Math.max(budget * 1.15, budget + 15)) close();
      if (cur.length && cur[0].module !== u.module && used > budget * 0.5) close(); // start modules on a fresh day when sensible
      cur.push(u); used += u.min;
    });
    close();

    const plan = days.map((items, i) => {
      const stage = D.stages.find(s => s.modules.includes(items[0].module.id));
      return { n: i + 1, week: Math.floor(i / dpw) + 1, dayOfWeek: (i % dpw) + 1, items, min: items.reduce((s, x) => s + x.min, 0), module: items[0].module, stage };
    });
    plan.optional = D.modules.filter(m => (path.emphasis[m.id] || 'core') === 'optional');
    plan.weeks = Math.ceil(plan.length / dpw);
    plan.path = path; plan.budget = budget; plan.dpw = dpw;
    cache = { sig, plan };
    return plan;
  }

  function itemDone(it) {
    const full = it.type === 'topic' ? S().isDone(it.key) : S().isMilestone(it.key);
    if (full) return true;
    return it.part < it.parts && S().partsDone(it.key) >= it.part;
  }
  const dayDone = day => day.items.every(itemDone);
  function currentIndex(plan) { const i = plan.findIndex(d => !dayDone(d)); return i === -1 ? plan.length : i; }

  /** Primary "watch/read" resource for an item — one vetted link, nothing else. */
  function resourceFor(it) {
    if (it.type === 'build') return null;
    const L = it.topic.lesson;
    return D.resourceById[(L && L.resources[0]) || it.module.kit.primary];
  }

  function completeItem(it) {
    if (it.part < it.parts) { S().markPart(it.key, it.part); return; }
    if (it.type === 'topic') S().toggleTopic(it.key, true); else S().toggleMilestone(it.key, true);
  }
  function undoItem(it) {
    if (it.part < it.parts) { S().unmarkPart(it.key, it.part); return; }
    if (it.type === 'topic') S().toggleTopic(it.key, false); else S().toggleMilestone(it.key, false);
  }

  function fmtMin(min) { if (min < 60) return `${min} min`; const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}m` : `${h}h`; }

  AIEA.plan = { build, itemDone, dayDone, currentIndex, resourceFor, completeItem, undoItem, fmtMin, BUILD_AFTER };
})();
