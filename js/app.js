/* App shell: navigation, theme, global search and hash router.
   Views live in js/views/* and register as AIEA.views[name] = { render(params, query), mount?(root, params, query), onChange?(change, root) }. */
(function () {
  const D = AIEA.data, ui = AIEA.ui, icon = AIEA.icon, esc = ui.esc;
  const main = document.getElementById('main');

  const NAV = [
    ['today', '#/today', 'Today', 'target'],
    ['plan', '#/plan', 'Plan', 'list'],
    ['roadmap', '#/roadmap', 'Roadmap', 'map'],
    ['curriculum', '#/curriculum', 'Lessons', 'book'],
    ['projects', '#/projects', 'Projects', 'hammer'],
    ['resources', '#/resources', 'Resources', 'library'],
    ['progress', '#/progress', 'Progress', 'chart']
  ];
  const MOBILE_EXTRA = [['home', '#/', 'Home', 'home'], ['stack', '#/stack', 'Tech stack', 'layers']];

  // ───────── Static chrome
  document.getElementById('brand-mark').innerHTML = icon('graduation');
  document.getElementById('brand-mark-2').innerHTML = icon('graduation');
  document.getElementById('gs-icon').outerHTML = icon('search');
  document.getElementById('checked-on').textContent = D.CHECKED_ON;
  document.getElementById('primary-nav').innerHTML = NAV.map(n => `<a href="${n[1]}" data-nav="${n[0]}">${icon(n[3])}${n[2]}</a>`).join('');
  document.getElementById('mobile-nav').innerHTML = [MOBILE_EXTRA[0], ...NAV, MOBILE_EXTRA[1]].map(n => `<a href="${n[1]}" data-nav="${n[0]}">${icon(n[3])}${n[2]}</a>`).join('');

  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = open => {
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.innerHTML = icon(open ? 'x' : 'menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  setMenu(false);
  menuBtn.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
  mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileNav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

  // Theme
  const themeBtn = document.getElementById('theme-btn');
  const paintTheme = () => {
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    themeBtn.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    AIEA.store.setTheme(next);
    paintTheme();
  });
  paintTheme();

  // ───────── Global search
  const gs = document.getElementById('global-search');
  const gsInput = document.getElementById('gs-input');
  const gsResults = document.getElementById('gs-results');
  const searchBtn = document.getElementById('search-btn');
  searchBtn.innerHTML = icon('search');
  searchBtn.addEventListener('click', () => { gs.classList.toggle('open'); if (gs.classList.contains('open')) gsInput.focus(); });

  const index = [];
  D.modules.forEach(m => {
    index.push({ g: 'Modules', title: `Module ${m.num} — ${m.title}`, sub: m.summary, href: `#/curriculum/${m.id}`, text: (m.title + ' ' + m.summary + ' ' + m.tech.join(' ')).toLowerCase(), ic: m.icon });
    m.topicList.forEach(t => index.push({ g: 'Topics', title: `${t.num} ${t.title}`, sub: `${m.short} · ${t.summary}`, href: `#/curriculum/${m.id}/${t.idx + 1}`, text: (t.title + ' ' + t.summary).toLowerCase(), ic: t.lesson ? 'sparkles' : 'circle' }));
  });
  D.resources.forEach(r => index.push({ g: 'Resources', title: r.title, sub: `${r.publisher} · ${D.resourceTypes[r.type].label}`, href: `#/resources?q=${encodeURIComponent(r.title)}`, text: (r.title + ' ' + r.publisher + ' ' + r.desc).toLowerCase(), ic: D.resourceTypes[r.type].icon }));
  D.projects.forEach(p => index.push({ g: 'Projects', title: p.title, sub: `${p.difficulty} · ${p.duration}`, href: `#/projects/${p.id}`, text: (p.title + ' ' + p.summary + ' ' + p.tech.join(' ')).toLowerCase(), ic: 'folder' }));
  D.stack.forEach(g => g.items.forEach(t => index.push({ g: 'Technologies', title: t.name, sub: t.what, href: `#/stack?t=${encodeURIComponent(t.name)}`, text: (t.name + ' ' + t.what).toLowerCase(), ic: g.icon })));

  function runSearch(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) { gsResults.hidden = true; gsInput.setAttribute('aria-expanded', 'false'); return; }
    const terms = q.split(/\s+/);
    const hits = index.filter(i => terms.every(t => i.text.includes(t) || i.title.toLowerCase().includes(t)));
    const groups = {};
    hits.forEach(h => { (groups[h.g] = groups[h.g] || []).push(h); });
    const order = ['Modules', 'Topics', 'Projects', 'Technologies', 'Resources'];
    let html = '';
    order.forEach(g => {
      if (!groups[g]) return;
      html += `<h4>${g} <span class="muted">(${groups[g].length})</span></h4>` + groups[g].slice(0, 5).map(h => `<a href="${h.href}">${icon(h.ic)}<span><span>${esc(h.title)}</span><small>${esc(h.sub.length > 90 ? h.sub.slice(0, 88) + '…' : h.sub)}</small></span></a>`).join('');
    });
    gsResults.innerHTML = html || `<div class="empty">No matches for “${esc(q)}”. Try a broader term such as “rag”, “pydantic” or “security”.</div>`;
    gsResults.hidden = false;
    gsInput.setAttribute('aria-expanded', 'true');
  }
  gsInput.addEventListener('input', () => runSearch(gsInput.value));
  gsInput.addEventListener('focus', () => runSearch(gsInput.value));
  gsInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { gsResults.hidden = true; gsInput.blur(); gs.classList.remove('open'); }
    if (e.key === 'ArrowDown') { const f = gsResults.querySelector('a'); if (f) { e.preventDefault(); f.focus(); } }
    if (e.key === 'Enter') { const f = gsResults.querySelector('a'); if (f) { e.preventDefault(); location.hash = f.getAttribute('href'); } }
  });
  gsResults.addEventListener('keydown', e => {
    const links = [...gsResults.querySelectorAll('a')], i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i < links.length - 1) { e.preventDefault(); links[i + 1].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? links[i - 1] : gsInput).focus(); }
    if (e.key === 'Escape') { gsResults.hidden = true; gsInput.focus(); }
  });
  gsResults.addEventListener('click', e => { if (e.target.closest('a')) { gsResults.hidden = true; gsInput.value = ''; gs.classList.remove('open'); } });
  document.addEventListener('click', e => { if (!gs.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) { gsResults.hidden = true; } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); gs.classList.add('open'); gsInput.focus(); }
  });

  // ───────── Router
  let current = null;
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    return { name: parts[0] || 'home', params: parts.slice(1), query };
  }

  function render(opts) {
    const { name, params, query } = parseHash();
    const view = AIEA.views[name];
    document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (!view) {
      main.innerHTML = `<div class="container section">${ui.emptyState('compass', 'Page not found', 'That address does not match any page in the Academy.', '<a class="btn btn-primary" href="#/">Go to the dashboard</a>')}</div>`;
      current = null; return;
    }
    try {
      const out = view.render(params, query);
      main.innerHTML = `<div class="view-enter">${out}</div>`;
      current = { view, name, params, query };
      view.mount && view.mount(main, params, query);
      const title = view.title ? view.title(params, query) : null;
      document.title = (title ? title + ' · ' : '') + 'AI Engineering Academy';
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="container section">${ui.emptyState('alert', 'Something went wrong', 'This view failed to load. Try refreshing; your progress is safe.', '<a class="btn" href="#/">Back to dashboard</a>')}</div>`;
    }
    if (!(opts && opts.keepScroll)) {
      window.scrollTo(0, 0);
      if (opts && opts.focus) main.focus({ preventScroll: true });
    }
  }

  let lastName = null;
  window.addEventListener('hashchange', () => {
    const { name } = parseHash();
    const sameView = name === lastName && AIEA.views[name] && AIEA.views[name].softNav;
    lastName = name;
    if (sameView && AIEA.views[name].softNav(main, parseHash().params, parseHash().query)) return;
    render({ focus: true });
  });

  AIEA.store.subscribe(change => {
    if (!current) return;
    if (change.type === 'path' || change.type === 'reset') return render({ keepScroll: true });
    current.view.onChange && current.view.onChange(change, main);
  });

  AIEA.rerender = () => render({ keepScroll: true });
  lastName = parseHash().name;
  render();

  if (!AIEA.store.isPersistent()) setTimeout(() => ui.toast('Browser storage is unavailable — progress will not persist after you close this tab.', true), 600);
})();
