/* Local, device-specific progress store backed by localStorage.
   Every read/write is guarded: private browsing, blocked storage or quota
   errors fall back to in-memory state so the site keeps working. */
window.AIEA = window.AIEA || {};

AIEA.store = (function () {
  const KEY = 'aiea.progress.v1';
  const listeners = new Set();
  let persistent = true;

  function blank() {
    return {
      version: 1,
      path: 'beginner',
      pace: 90,        // study minutes per day
      daysPerWeek: 6,
      theme: null,
      completed: {},   // topicId -> ISO timestamp
      milestones: {},  // 'p04:2' -> ISO timestamp
      bookmarks: {},   // resourceId -> ISO timestamp
      notes: {},       // topicId -> text
      quiz: {},        // quizKey -> { correct: bool, at }
      parts: {},       // itemKey -> number of parts finished (long topics split over days)
      log: {},         // 'YYYY-MM-DD' -> { text, minutes }
      checkins: {},    // 'YYYY-MM-DD' -> count of part check-ins
      parking: [],     // [{ id, text, at }]
      finished: null,  // { date, key } — the day finished today stays on screen until tomorrow
      lastTopic: null,
      skipLeaveConfirm: false
    };
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return blank();
      const parsed = JSON.parse(raw);
      return sanitize(parsed);
    } catch (e) {
      persistent = false;
      return blank();
    }
  }

  /** Accept only known keys with the right shapes (also used for imports). */
  function sanitize(obj) {
    const base = blank();
    if (!obj || typeof obj !== 'object') return base;
    const paths = ['beginner', 'intermediate', 'advanced', 'accelerated'];
    if (paths.includes(obj.path)) base.path = obj.path;
    if (obj.theme === 'light' || obj.theme === 'dark') base.theme = obj.theme;
    if ([30, 60, 90, 120, 180].includes(obj.pace)) base.pace = obj.pace;
    if ([5, 6, 7].includes(obj.daysPerWeek)) base.daysPerWeek = obj.daysPerWeek;
    if (obj.parts && typeof obj.parts === 'object') Object.entries(obj.parts).forEach(([k, v]) => { if (Number.isInteger(v) && v > 0 && v < 50) base.parts[k] = v; });
    if (obj.checkins && typeof obj.checkins === 'object') Object.entries(obj.checkins).forEach(([k, v]) => { if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isInteger(v)) base.checkins[k] = v; });
    if (obj.log && typeof obj.log === 'object') Object.entries(obj.log).forEach(([k, v]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === 'object') base.log[k] = { text: String(v.text || '').slice(0, 5000), minutes: Math.max(0, Math.min(1440, parseInt(v.minutes, 10) || 0)) };
    });
    if (Array.isArray(obj.parking)) base.parking = obj.parking.filter(x => x && typeof x.text === 'string').slice(0, 200).map(x => ({ id: String(x.id || Math.random().toString(36).slice(2)), text: x.text.slice(0, 300), at: String(x.at || '') }));
    ['completed', 'milestones', 'bookmarks'].forEach(k => {
      if (obj[k] && typeof obj[k] === 'object') {
        Object.entries(obj[k]).forEach(([id, v]) => { if (typeof id === 'string' && id.length < 40) base[k][id] = typeof v === 'string' ? v : new Date().toISOString(); });
      }
    });
    if (obj.notes && typeof obj.notes === 'object') {
      Object.entries(obj.notes).forEach(([id, v]) => { if (typeof v === 'string' && v.trim()) base.notes[id] = v.slice(0, 20000); });
    }
    if (obj.quiz && typeof obj.quiz === 'object') {
      Object.entries(obj.quiz).forEach(([id, v]) => { if (v && typeof v.correct === 'boolean') base.quiz[id] = { correct: v.correct, at: String(v.at || '') }; });
    }
    if (typeof obj.lastTopic === 'string') base.lastTopic = obj.lastTopic;
    if (obj.finished && typeof obj.finished.key === 'string') base.finished = { date: String(obj.finished.date), key: obj.finished.key };
    base.skipLeaveConfirm = !!obj.skipLeaveConfirm;
    return base;
  }

  let state = load();

  function save() {
    if (!persistent) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      persistent = false;
      AIEA.toast && AIEA.toast('Progress could not be saved on this device (storage unavailable). Changes last until you close the tab.', true);
    }
  }

  function emit(change) { listeners.forEach(fn => { try { fn(change); } catch (e) { console.error(e); } }); }
  function now() { return new Date().toISOString(); }
  function localDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function toggleIn(map, id, on) {
    const want = on === undefined ? !state[map][id] : on;
    if (want) state[map][id] = now(); else delete state[map][id];
    save(); emit({ type: map, id });
    return want;
  }

  return {
    get state() { return state; },
    isPersistent: () => persistent,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    setPath(p) { state.path = p; save(); emit({ type: 'path' }); },
    setPace(min) { state.pace = min; save(); emit({ type: 'path' }); },
    setDaysPerWeek(n) { state.daysPerWeek = n; save(); emit({ type: 'path' }); },
    today: () => localDate(new Date()),
    partsDone: key => state.parts[key] || 0,
    markPart(key, part) {
      state.parts[key] = Math.max(state.parts[key] || 0, part);
      const d = localDate(new Date()); state.checkins[d] = (state.checkins[d] || 0) + 1;
      save(); emit({ type: 'completed', id: key });
    },
    unmarkPart(key, part) { state.parts[key] = Math.min(state.parts[key] || 0, part - 1); if (!state.parts[key]) delete state.parts[key]; save(); emit({ type: 'completed', id: key }); },
    setFinished(key) { state.finished = key ? { date: localDate(new Date()), key } : null; save(); },
    getLog: d => state.log[d] || null,
    setLog(d, text, minutes) {
      if (!text.trim() && !minutes) delete state.log[d]; else state.log[d] = { text: text.slice(0, 5000), minutes: minutes || 0 };
      save(); emit({ type: 'log', id: d });
    },
    addParking(text) { state.parking.unshift({ id: Math.random().toString(36).slice(2, 10), text: text.slice(0, 300), at: now() }); save(); emit({ type: 'parking' }); },
    removeParking(id) { state.parking = state.parking.filter(x => x.id !== id); save(); emit({ type: 'parking' }); },
    setTheme(t) { state.theme = t; save(); },
    setLastTopic(id) { state.lastTopic = id; save(); },
    setSkipLeave(v) { state.skipLeaveConfirm = !!v; save(); },

    isDone: id => !!state.completed[id],
    toggleTopic: (id, on) => toggleIn('completed', id, on),
    isMilestone: key => !!state.milestones[key],
    toggleMilestone: (key, on) => toggleIn('milestones', key, on),
    isBookmarked: id => !!state.bookmarks[id],
    toggleBookmark: (id, on) => toggleIn('bookmarks', id, on),

    getNote: id => state.notes[id] || '',
    setNote(id, text) {
      if (text && text.trim()) state.notes[id] = text.slice(0, 20000); else delete state.notes[id];
      save(); emit({ type: 'notes', id });
    },
    recordQuiz(key, correct) { state.quiz[key] = { correct, at: now() }; save(); emit({ type: 'quiz', id: key }); },

    reset() {
      const theme = state.theme;
      state = blank(); state.theme = theme;
      save(); emit({ type: 'reset' });
    },
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text); // throws on invalid JSON; caller handles
      if (!parsed || parsed.version !== 1) throw new Error('Not an Academy progress file (missing version 1).');
      const theme = state.theme;
      state = sanitize(parsed); state.theme = theme;
      save(); emit({ type: 'reset' });
    }
  };
})();
