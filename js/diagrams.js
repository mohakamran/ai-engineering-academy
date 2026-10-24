/* SVG diagrams and interactive demos.
   - flow(spec): column-based architecture renderer producing a horizontal SVG
     (desktop) and a vertical SVG (mobile) so text stays legible at any width.
   - registry: named concept diagrams referenced by curriculum data.
   - demos: small interactive widgets (cosine, tokenizer, temperature, chunker).
   Colours come from CSS classes so both themes work. */
window.AIEA = window.AIEA || {};

(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let uid = 0;

  function markerDefs(id) {
    return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-arrow"/></marker></defs>`;
  }

  function nodeSvg(n, x, y, w, h) {
    const [, label, sub, tone] = n;
    return `<g class="d-node t-${tone || 'none'}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11"/>` +
      `<text class="d-label" x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 4)}" text-anchor="middle">${esc(label)}</text>` +
      (sub ? `<text class="d-sub" x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle">${esc(sub)}</text>` : '') + '</g>';
  }

  function parseEdges(spec) {
    if (spec.edges) {
      return spec.edges.map(e => {
        const dashed = e.includes('~>');
        const [a, b] = e.split(dashed ? '~>' : '>');
        return { a: a.trim(), b: b.trim(), dashed };
      });
    }
    const out = [];
    for (let i = 0; i < spec.cols.length - 1; i++) {
      spec.cols[i].forEach(n => spec.cols[i + 1].forEach(m => out.push({ a: n[0], b: m[0], dashed: false })));
    }
    return out;
  }

  function layout(spec, vertical) {
    const W = vertical ? 150 : 152, H = 54, pad = 14;
    const gapMain = vertical ? 40 : 48, gapCross = vertical ? 14 : 18;
    const cols = spec.cols;
    const maxCross = Math.max(...cols.map(c => c.length));
    const pos = {};
    let width, height;
    if (!vertical) {
      width = pad * 2 + cols.length * W + (cols.length - 1) * gapMain;
      height = pad * 2 + maxCross * H + (maxCross - 1) * gapCross + 24;
      cols.forEach((col, ci) => {
        const colH = col.length * H + (col.length - 1) * gapCross;
        const y0 = (height - colH) / 2;
        col.forEach((n, ri) => { pos[n[0]] = { x: pad + ci * (W + gapMain), y: y0 + ri * (H + gapCross), w: W, h: H, c: ci }; });
      });
    } else {
      width = pad * 2 + maxCross * W + (maxCross - 1) * gapCross + 40;
      height = pad * 2 + cols.length * H + (cols.length - 1) * gapMain;
      cols.forEach((row, ri) => {
        const rowW = row.length * W + (row.length - 1) * gapCross;
        const x0 = (width - rowW) / 2;
        row.forEach((n, ci) => { pos[n[0]] = { x: x0 + ci * (W + gapCross), y: pad + ri * (H + gapMain), w: W, h: H, c: ri }; });
      });
    }
    return { pos, width, height };
  }

  function edgePath(p, q, vertical, height, width) {
    if (!vertical) {
      if (q.c > p.c) {
        const x1 = p.x + p.w, y1 = p.y + p.h / 2, x2 = q.x - 2, y2 = q.y + q.h / 2, mx = (x1 + x2) / 2;
        return `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
      }
      if (q.c === p.c) { // same column: vertical connector on the right
        const x = p.x + p.w, y1 = p.y + p.h / 2, y2 = q.y + q.h / 2;
        return `M${x} ${y1}C${x + 30} ${y1} ${x + 30} ${y2} ${x + 2} ${y2}`;
      }
      // back edge: loop below
      const x1 = p.x + p.w / 2, y1 = p.y + p.h, x2 = q.x + q.w / 2, y2 = q.y + q.h + 2, low = Math.min(height - 4, Math.max(y1, y2) + 26);
      return `M${x1} ${y1}C${x1} ${low} ${x2} ${low} ${x2} ${y2}`;
    }
    if (q.c > p.c) {
      const x1 = p.x + p.w / 2, y1 = p.y + p.h, x2 = q.x + q.w / 2, y2 = q.y - 2, my = (y1 + y2) / 2;
      return `M${x1} ${y1}C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
    }
    if (q.c === p.c) {
      const y = p.y + p.h / 2, x1 = p.x + p.w, x2 = q.x;
      return x2 > x1 ? `M${x1} ${y}L${x2 - 2} ${y}` : `M${p.x} ${y}L${q.x + q.w + 2} ${q.y + q.h / 2}`;
    }
    const x1 = p.x + p.w, y1 = p.y + p.h / 2, x2 = q.x + q.w + 2, y2 = q.y + q.h / 2, right = Math.min(width - 4, Math.max(x1, x2) + 30);
    return `M${x1} ${y1}C${right} ${y1} ${right} ${y2} ${x2} ${y2}`;
  }

  function flowSvg(spec, vertical, label) {
    const { pos, width, height } = layout(spec, vertical);
    const mid = 'arr' + (++uid);
    let edges = '';
    parseEdges(spec).forEach(e => {
      const p = pos[e.a], q = pos[e.b];
      if (!p || !q) return;
      edges += `<path class="d-edge${e.dashed ? ' dash' : ''}" d="${edgePath(p, q, vertical, height, width)}" marker-end="url(#${mid})"/>`;
    });
    let nodes = '';
    spec.cols.forEach(col => col.forEach(n => { const p = pos[n[0]]; nodes += nodeSvg(n, p.x, p.y, p.w, p.h); }));
    return `<svg class="${vertical ? 'd-v' : 'd-h'}" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" style="max-width:${Math.round(width * (vertical ? 1.05 : 1.12))}px;margin:0 auto" role="img" aria-label="${esc(label)}">${markerDefs(mid)}${edges}${nodes}</svg>`;
  }

  function describe(spec) {
    return spec.cols.map(c => c.map(n => n[1]).join(' + ')).join(' → ');
  }

  /** Public: render a flow spec as a responsive <figure>. */
  function flow(spec, caption, opts) {
    const label = (caption ? caption + ': ' : '') + describe(spec);
    const bare = opts && opts.bare;
    return `<figure class="diagram flow"${bare ? ' style="border:0;padding:0;background:transparent"' : ''}>${flowSvg(spec, false, label)}${flowSvg(spec, true, label)}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }

  function figure(svg, caption, label) {
    return `<figure class="diagram"><svg viewBox="${svg.vb}" role="img" aria-label="${esc(label || caption)}">${svg.body}</svg>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }

  // ───────────────── Bespoke illustrations
  function hero() {
    ++uid;
    const nodes = [
      { x: 280, y: 52, l: 'LLMs', s: 'hosted · open-weight', t: 'violet', icon: 'brain' },
      { x: 460, y: 150, l: 'Tools & APIs', s: 'functions · MCP', t: 'amber', icon: 'plug' },
      { x: 448, y: 320, l: 'Vector index', s: 'embeddings', t: 'blue', icon: 'scan' },
      { x: 112, y: 320, l: 'Database', s: 'docs · state', t: 'green', icon: 'database' },
      { x: 100, y: 150, l: 'Users', s: 'web · mobile · API', t: 'cyan', icon: 'users' },
      { x: 280, y: 395, l: 'Evals & monitoring', s: 'quality · cost', t: 'rose', icon: 'gauge' }
    ];
    const cx = 280, cy = 215;
    let lines = '', dots = '', boxes = '';
    nodes.forEach((n, i) => {
      lines += `<path id="hp${uid}-${i}" d="M${cx} ${cy}L${n.x} ${n.y}" class="d-edge dash"/>`;
      dots += `<circle r="3.5" class="flow-dot"><animateMotion dur="${2.6 + i * 0.35}s" repeatCount="indefinite" ${i % 2 ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}><mpath href="#hp${uid}-${i}"/></animateMotion></circle>`;
      boxes += `<g class="d-node t-${n.t}"><rect x="${n.x - 84}" y="${n.y - 24}" width="168" height="48" rx="12"/>` +
        `<g transform="translate(${n.x - 76} ${n.y - 10}) scale(0.85)" class="s-${n.t}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${AIEA.ICONS[n.icon]}</g>` +
        `<text class="d-label" x="${n.x + 12}" y="${n.y - 2}" text-anchor="middle">${n.l}</text><text class="d-sub" x="${n.x + 12}" y="${n.y + 13}" text-anchor="middle">${n.s}</text></g>`;
    });
    const core = `<g><circle cx="${cx}" cy="${cy}" r="70" fill="url(#hg${uid})" opacity=".18" class="pulse"/>` +
      `<circle cx="${cx}" cy="${cy}" r="54" class="s-cyan" fill="var(--bg-elev)" stroke-width="2"/>` +
      `<text x="${cx}" y="${cy - 6}" text-anchor="middle" class="d-title">Your AI</text><text x="${cx}" y="${cy + 12}" text-anchor="middle" class="d-title">application</text>` +
      `<text x="${cx}" y="${cy + 30}" text-anchor="middle" class="d-muted">orchestration</text></g>`;
    const defs = `<defs><radialGradient id="hg${uid}"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>`;
    return `<svg viewBox="0 0 560 430" role="img" aria-label="Illustration: an AI application at the centre connected to users, LLMs, tools and APIs, a vector index, a database, and evaluation and monitoring.">${defs}${lines}${dots}${core}${boxes}</svg>`;
  }

  function vectors(a = 25, b = 65, lenB = 1) {
    const cx = 60, cy = 230, R = 170;
    const ax = cx + R * Math.cos(a * Math.PI / 180), ay = cy - R * Math.sin(a * Math.PI / 180);
    const bx = cx + R * lenB * Math.cos(b * Math.PI / 180), by = cy - R * lenB * Math.sin(b * Math.PI / 180);
    const arcR = 50, a1 = Math.min(a, b), a2 = Math.max(a, b);
    const p1 = [cx + arcR * Math.cos(a1 * Math.PI / 180), cy - arcR * Math.sin(a1 * Math.PI / 180)];
    const p2 = [cx + arcR * Math.cos(a2 * Math.PI / 180), cy - arcR * Math.sin(a2 * Math.PI / 180)];
    const mid = 'varr' + (++uid);
    return {
      vb: '0 0 320 260',
      body: `<defs><marker id="${mid}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="d-cyan"/></marker><marker id="${mid}b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="d-violet"/></marker></defs>` +
        `<line x1="${cx - 40}" y1="${cy}" x2="310" y2="${cy}" class="d-line"/><line x1="${cx}" y1="${cy + 20}" x2="${cx}" y2="10" class="d-line"/>` +
        `<path d="M${p1[0]} ${p1[1]}A${arcR} ${arcR} 0 0 0 ${p2[0]} ${p2[1]}" fill="none" class="s-amber" stroke-width="2"/>` +
        `<text x="${cx + 58}" y="${cy - 18}" class="d-muted">θ = ${Math.abs(b - a)}°</text>` +
        `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" class="s-cyan" stroke-width="3" marker-end="url(#${mid}a)"/>` +
        `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" class="s-violet" stroke-width="3" marker-end="url(#${mid}b)"/>` +
        `<text x="${ax + 6}" y="${ay}" class="d-title" style="fill:var(--cyan)">a</text><text x="${bx + 6}" y="${by}" class="d-title" style="fill:var(--violet)">b</text>`
    };
  }

  function gradient() {
    const f = x => 0.012 * (x - 300) * (x - 300) + 40;
    let d = ''; for (let x = 40; x <= 560; x += 8) d += (d ? 'L' : 'M') + x + ' ' + (260 - f(x) * 0.9 + 40);
    const steps = [70, 150, 205, 242, 266, 281, 290];
    let dots = '', arrows = '';
    steps.forEach((x, i) => {
      const y = 260 - f(x) * 0.9 + 40;
      dots += `<circle cx="${x}" cy="${y}" r="${i === steps.length - 1 ? 7 : 5}" class="${i === steps.length - 1 ? 'd-green' : 'd-cyan'}"/>`;
      if (i < steps.length - 1) { const x2 = steps[i + 1], y2 = 260 - f(x2) * 0.9 + 40; arrows += `<path d="M${x} ${y}Q${(x + x2) / 2} ${Math.min(y, y2) - 18} ${x2} ${y2}" class="d-edge dash" />`; }
    });
    return { vb: '0 0 600 320', body: `<path d="${d}" fill="none" class="s-violet" stroke-width="2.5"/>${arrows}${dots}<text x="40" y="24" class="d-title">Loss L(θ)</text><text x="300" y="312" class="d-muted" text-anchor="middle">parameter θ →</text><text x="74" y="${260 - f(70) * 0.9 + 26}" class="d-muted">start</text><text x="300" y="${260 - f(290) * 0.9 + 70}" class="d-muted" text-anchor="middle">minimum</text><text x="420" y="70" class="d-text">θ ← θ − η · ∇L(θ)</text>` };
  }

  function neuralNet() {
    const layers = [3, 5, 5, 2], X = [70, 230, 390, 540], names = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
    let lines = '', nodes = '', labels = '';
    const ys = layers.map(n => Array.from({ length: n }, (_, i) => 160 + (i - (n - 1) / 2) * 52));
    for (let l = 0; l < layers.length - 1; l++) ys[l].forEach(y1 => ys[l + 1].forEach(y2 => { lines += `<line x1="${X[l]}" y1="${y1}" x2="${X[l + 1]}" y2="${y2}" class="d-line" opacity=".7"/>`; }));
    ys.forEach((col, l) => {
      col.forEach(y => { nodes += `<circle cx="${X[l]}" cy="${y}" r="15" fill="var(--bg-elev)" class="${['s-cyan', 's-violet', 's-violet', 's-green'][l]}" stroke-width="2.5"/>`; });
      labels += `<text x="${X[l]}" y="312" text-anchor="middle" class="d-muted">${names[l]}</text>`;
    });
    return { vb: '0 0 610 325', body: lines + nodes + labels + '<text x="305" y="22" text-anchor="middle" class="d-text">forward pass → · ← backpropagation (gradients)</text>' };
  }

  function embeddingSpace() {
    const groups = [
      { c: 'd-cyan', label: 'Billing', pts: [[120, 90, 'refund request'], [160, 120, 'money back'], [100, 140, 'invoice copy'], [150, 70, 'charged twice']] },
      { c: 'd-violet', label: 'Login', pts: [[420, 90, 'reset password'], [460, 130, "can't log in"], [400, 140, '2FA code'], [470, 80, 'locked out']] },
      { c: 'd-green', label: 'Shipping', pts: [[270, 250, 'where is my order'], [320, 280, 'tracking number'], [230, 290, 'late delivery'], [300, 230, 'change address']] }
    ];
    let b = '';
    groups.forEach(g => {
      const cx = g.pts.reduce((s, p) => s + p[0], 0) / 4, cy = g.pts.reduce((s, p) => s + p[1], 0) / 4;
      b += `<ellipse cx="${cx}" cy="${cy}" rx="88" ry="62" class="d-group"/><text x="${cx}" y="${cy - 66}" text-anchor="middle" class="d-group-label">${g.label}</text>`;
      g.pts.forEach(p => { b += `<circle cx="${p[0]}" cy="${p[1]}" r="6" class="${g.c}"/><text x="${p[0] + 9}" y="${p[1] + 4}" class="d-muted">${p[2]}</text>`; });
    });
    b += `<circle cx="440" cy="250" r="7" class="d-amber"/><text x="450" y="254" class="d-text">query: "forgot my password"</text><path d="M440 243L432 140" class="d-edge dash"/>`;
    return { vb: '0 0 600 340', body: b };
  }

  function tokens() {
    const toks = ['The', ' capital', ' of', ' France', ' is'], ids = [791, 6864, 315, 9822, 374];
    let b = '', x = 20;
    toks.forEach((t, i) => {
      const w = 22 + t.length * 9;
      b += `<rect x="${x}" y="40" width="${w}" height="34" rx="8" fill="var(--bg-elev)" class="${['s-cyan', 's-violet', 's-green', 's-amber', 's-blue'][i]}" stroke-width="1.5"/><text x="${x + w / 2}" y="62" text-anchor="middle" class="d-text" style="white-space:pre">${esc(t.replace(' ', '␣'))}</text>`;
      b += `<text x="${x + w / 2}" y="100" text-anchor="middle" class="d-muted">${ids[i]}</text><line x1="${x + w / 2}" y1="104" x2="${x + w / 2}" y2="124" class="d-line"/>`;
      b += `<rect x="${x + w / 2 - 22}" y="128" width="44" height="14" rx="3" class="d-violet" opacity=".35"/>`;
      x += w + 10;
    });
    b += `<text x="20" y="24" class="d-title">text → tokens → IDs → embedding vectors</text><text x="20" y="170" class="d-muted">IDs shown are illustrative; each tokenizer has its own vocabulary.</text>`;
    return { vb: '0 0 520 180', body: b };
  }

  function chunking() {
    let b = '<text x="20" y="22" class="d-title">Document split into overlapping chunks</text>';
    for (let i = 0; i < 14; i++) b += `<rect x="${20 + i * 38}" y="40" width="34" height="18" rx="3" fill="var(--surface-3)"/>`;
    const chunks = [[0, 5, 'd-cyan'], [4, 9, 'd-violet'], [8, 13, 'd-green']];
    chunks.forEach(([s, e, c], i) => {
      b += `<rect x="${20 + s * 38}" y="${72 + i * 30}" width="${(e - s + 1) * 38 - 4}" height="22" rx="5" class="${c}" opacity=".3"/><text x="${24 + s * 38}" y="${88 + i * 30}" class="d-text">chunk ${i + 1}</text>`;
    });
    b += `<rect x="${20 + 4 * 38}" y="66" width="34" height="78" rx="3" fill="none" class="s-amber" stroke-dasharray="3 3"/><rect x="${20 + 8 * 38}" y="96" width="34" height="78" rx="3" fill="none" class="s-amber" stroke-dasharray="3 3"/><text x="${20 + 4 * 38}" y="190" class="d-muted">overlap</text>`;
    return { vb: '0 0 560 200', body: b };
  }

  function indexTradeoffs() {
    const items = [['Flat (exact)', 100, 20, 30, 'd-green'], ['HNSW', 96, 90, 80, 'd-violet'], ['IVF', 90, 75, 45, 'd-blue'], ['IVF + quantised', 85, 85, 15, 'd-amber']];
    let b = '<text x="20" y="22" class="d-title">Illustrative trade-offs (relative, not benchmarks)</text>';
    const metrics = ['Recall', 'Speed at scale', 'Memory use'];
    metrics.forEach((m, mi) => { b += `<text x="${190 + mi * 130}" y="50" class="d-muted">${m}</text>`; });
    items.forEach((it, i) => {
      const y = 70 + i * 40;
      b += `<text x="20" y="${y + 14}" class="d-text">${it[0]}</text>`;
      [it[1], it[2], it[3]].forEach((v, mi) => { b += `<rect x="${190 + mi * 130}" y="${y}" width="110" height="18" rx="4" fill="var(--surface-3)"/><rect x="${190 + mi * 130}" y="${y}" width="${v * 1.1}" height="18" rx="4" class="${it[4]}" opacity=".75"/>`; });
    });
    return { vb: '0 0 600 240', body: b };
  }

  function evalPyramid() {
    const tiers = [['Unit tests', 'parsing · validation · routing', 'd-cyan', 520], ['Integration tests', 'API + DB + fake model', 'd-blue', 420], ['Model evaluations', 'datasets · metrics · judges', 'd-violet', 320], ['Human review', 'experts · sampled traffic', 'd-amber', 220]];
    let b = '';
    tiers.forEach((t, i) => {
      const y = 230 - i * 52, w = t[3], x = 300 - w / 2;
      b += `<rect x="${x}" y="${y}" width="${w}" height="44" rx="10" class="${t[2]}" opacity=".22"/><rect x="${x}" y="${y}" width="${w}" height="44" rx="10" fill="none" class="${t[2].replace('d-', 's-')}"/><text x="300" y="${y + 19}" text-anchor="middle" class="d-title">${t[0]}</text><text x="300" y="${y + 35}" text-anchor="middle" class="d-muted">${t[1]}</text>`;
    });
    b += '<text x="590" y="250" text-anchor="end" class="d-muted">many · fast · cheap</text><text x="590" y="88" text-anchor="end" class="d-muted">few · slow · costly</text>';
    return { vb: '0 0 600 285', body: b };
  }

  function sampling() {
    const toks = [['Paris', .82], ['a', .06], ['the', .05], ['located', .03], ['Lyon', .02], ['…', .02]];
    let b = '<text x="20" y="22" class="d-title">“The capital of France is …”  next-token probabilities</text>';
    toks.forEach((t, i) => { const y = 40 + i * 30; b += `<text x="20" y="${y + 15}" class="d-text">${t[0]}</text><rect x="110" y="${y}" width="${t[1] * 440}" height="20" rx="4" class="${i ? 'd-violet' : 'd-cyan'}" opacity=".75"/><text x="${118 + t[1] * 440}" y="${y + 15}" class="d-muted">${Math.round(t[1] * 100)}%</text>`; });
    b += '<text x="20" y="232" class="d-muted">Illustrative values. Temperature reshapes this distribution before a token is sampled.</text>';
    return { vb: '0 0 600 245', body: b };
  }

  function lora() {
    return {
      vb: '0 0 600 230',
      body: `<rect x="30" y="40" width="170" height="150" rx="10" fill="var(--surface-3)" class="s-blue"/><text x="115" y="110" text-anchor="middle" class="d-title">W (frozen)</text><text x="115" y="130" text-anchor="middle" class="d-muted">d × d</text>` +
        `<text x="230" y="122" class="d-title">+</text>` +
        `<rect x="270" y="40" width="30" height="150" rx="6" class="d-violet" opacity=".5"/><text x="285" y="210" text-anchor="middle" class="d-muted">B (d × r)</text>` +
        `<rect x="320" y="100" width="170" height="30" rx="6" class="d-cyan" opacity=".5"/><text x="405" y="150" text-anchor="middle" class="d-muted">A (r × d)</text>` +
        `<text x="520" y="110" class="d-text">trainable</text><text x="520" y="128" class="d-muted">r ≪ d</text><text x="30" y="24" class="d-title">LoRA: W′ = W + B·A</text>`
    };
  }

  function branches() {
    const items = [['A', 'Fine-tuning', 'd-violet'], ['B', 'Multimodal', 'd-cyan'], ['C', 'Local models', 'd-green'], ['D', 'ML engineering', 'd-amber'], ['E', 'Advanced agents', 'd-rose']];
    let b = `<g class="d-node t-blue"><rect x="210" y="16" width="180" height="48" rx="12"/><text x="300" y="45" text-anchor="middle" class="d-label">Core curriculum</text></g>`;
    items.forEach((it, i) => {
      const x = 20 + i * 116;
      b += `<path d="M300 64C300 110 ${x + 50} 100 ${x + 50} 150" class="d-edge dash"/><circle cx="${x + 50}" cy="160" r="20" class="${it[2]}" opacity=".85"/><text x="${x + 50}" y="166" text-anchor="middle" class="d-title" style="fill:#fff">${it[0]}</text><text x="${x + 50}" y="202" text-anchor="middle" class="d-text">${it[1]}</text>`;
    });
    b += '<text x="300" y="232" text-anchor="middle" class="d-muted">Choose one or two branches — none are mandatory.</text>';
    return { vb: '0 0 600 245', body: b };
  }

  function capstone() {
    const steps = ['Problem', 'Requirements', 'Architecture', 'Build', 'Evaluate', 'Secure', 'Deploy', 'Present'];
    let b = '<line x1="40" y1="70" x2="560" y2="70" class="d-line" stroke-width="3"/>';
    steps.forEach((s, i) => { const x = 40 + i * (520 / 7); b += `<circle cx="${x}" cy="70" r="11" fill="var(--bg-elev)" class="${i === steps.length - 1 ? 's-green' : 's-cyan'}" stroke-width="3"/><text x="${x}" y="${i % 2 ? 108 : 42}" text-anchor="middle" class="d-text">${s}</text>`; });
    return { vb: '0 0 600 125', body: b };
  }

  function careerRoles() {
    return {
      vb: '0 0 600 250',
      body: `<circle cx="230" cy="110" r="90" class="d-cyan" opacity=".14"/><circle cx="370" cy="110" r="90" class="d-violet" opacity=".14"/><circle cx="300" cy="170" r="90" class="d-green" opacity=".14"/>` +
        `<text x="170" y="80" text-anchor="middle" class="d-title">Software</text><text x="170" y="96" text-anchor="middle" class="d-muted">APIs · systems</text>` +
        `<text x="430" y="80" text-anchor="middle" class="d-title">ML / LLMs</text><text x="430" y="96" text-anchor="middle" class="d-muted">models · evals</text>` +
        `<text x="300" y="232" text-anchor="middle" class="d-title">Product</text><text x="300" y="246" text-anchor="middle" class="d-muted">users · outcomes</text>` +
        `<text x="300" y="132" text-anchor="middle" class="d-title" style="fill:var(--cyan)">AI engineer</text>`
    };
  }

  // ───────────────── Registry
  const F = (cols, edges) => ({ cols, edges });
  const reg = {
    appArch: () => flow(F([[['u', 'Client', 'web · mobile', 'cyan']], [['api', 'API layer', 'auth · validation', 'blue']], [['orc', 'Orchestration', 'prompts · tools · retries', 'violet']], [['m', 'Model APIs', 'LLMs · embeddings', 'amber'], ['d', 'Data', 'DB · vectors · files', 'green']], [['obs', 'Observability', 'traces · cost · evals', 'rose']]], ['u>api', 'api>orc', 'orc>m', 'orc>d', 'm~>obs', 'd~>obs']), 'Layers of a typical AI application'),
    pythonService: () => flow(F([[['in', 'Input', 'request · file', 'cyan']], [['val', 'Validate', 'Pydantic', 'violet']], [['logic', 'Core logic', 'pure functions', 'blue']], [['out', 'Output', 'JSON · log', 'green']]]), 'A small, testable Python service'),
    structuredOutput: () => flow(F([[['p', 'Prompt + schema', 'JSON Schema', 'cyan']], [['llm', 'Model', 'constrained output', 'violet']], [['v', 'Validate', 'Pydantic', 'blue']], [['ok', 'Typed object', 'safe to use', 'green'], ['err', 'Repair / reject', 'retry once', 'rose']]], ['p>llm', 'llm>v', 'v>ok', 'v>err', 'err~>llm']), 'Structured output with validation and repair'),
    asyncFlow: () => flow(F([[['loop', 'Event loop', 'asyncio', 'violet']], [['a', 'Model call', 'awaiting…', 'blue'], ['b', 'Vector search', 'awaiting…', 'blue'], ['c', 'DB query', 'awaiting…', 'blue']], [['g', 'gather()', 'all results', 'green']]]), 'Concurrent I/O: one process, many in-flight requests'),
    evalPyramid: () => figure(evalPyramid(), 'Testing layers for AI systems'),
    apiRequest: () => flow(F([[['c', 'Client', 'HTTP request', 'cyan']], [['mw', 'Middleware', 'auth · rate limit · logs', 'rose']], [['r', 'Route', 'schema validation', 'blue']], [['svc', 'Service', 'domain logic', 'violet']], [['db', 'Database', 'transaction', 'green'], ['ext', 'External API', 'timeout + retry', 'amber']]]), 'Request lifecycle in a backend service'),
    retries: () => flow(F([[['call', 'Call', 'with timeout', 'blue']], [['ok', 'Success', '2xx', 'green'], ['tr', 'Transient', 'timeout · 429 · 5xx', 'amber'], ['perm', 'Permanent', '400 · 401 · 404', 'rose']], [['wait', 'Backoff + jitter', '1s · 2s · 4s', 'violet'], ['fail', 'Fail fast', 'clear error', 'rose']]], ['call>ok', 'call>tr', 'call>perm', 'tr>wait', 'perm>fail', 'wait~>call']), 'Retry only what can succeed on retry'),
    secrets: () => flow(F([[['sm', 'Secrets manager', 'or env vars', 'violet']], [['app', 'Server process', 'loads at startup', 'blue']], [['prov', 'Model provider', 'scoped key', 'amber'], ['no', 'Never in', 'client · Git · logs', 'rose']]], ['sm>app', 'app>prov', 'app~>no']), 'Where secrets live — and where they never go'),
    mlLifecycle: () => flow(F([[['data', 'Data', 'collect · label', 'cyan']], [['feat', 'Features', 'clean · split', 'blue']], [['train', 'Train', 'fit model', 'violet']], [['eval', 'Evaluate', 'val/test metrics', 'amber']], [['dep', 'Deploy', 'inference', 'green']], [['mon', 'Monitor', 'drift · errors', 'rose']]], ['data>feat', 'feat>train', 'train>eval', 'eval>dep', 'dep>mon', 'mon~>data']), 'The machine learning lifecycle'),
    vectors: () => figure(vectors(), 'Cosine similarity depends only on the angle θ', 'Two vectors a and b from the origin with the angle between them highlighted'),
    gradient: () => figure(gradient(), 'Gradient descent steps toward the minimum of the loss', 'A U-shaped loss curve with successive steps descending to the minimum'),
    splits: () => flow(F([[['all', 'Dataset', 'all examples', 'cyan']], [['tr', 'Train', 'fit model + preprocessing', 'blue'], ['va', 'Validation', 'tune choices', 'violet'], ['te', 'Test', 'final, once', 'green']]]), 'Fit only on training data; touch the test set once'),
    neuralNet: () => figure(neuralNet(), 'A small fully-connected neural network', 'Four layers of neurons: 3 inputs, two hidden layers of 5, and 2 outputs, fully connected'),
    trainingLoop: () => flow(F([[['b', 'Batch', 'DataLoader', 'cyan']], [['f', 'Forward', 'predictions', 'blue']], [['l', 'Loss', 'compare to labels', 'amber']], [['bk', 'Backward', 'gradients', 'violet']], [['s', 'Step', 'update weights', 'green']]], ['b>f', 'f>l', 'l>bk', 'bk>s', 's~>b']), 'One iteration of a training loop'),
    pretrainedLadder: () => flow(F([[['p', 'Prompting', 'minutes · no training', 'cyan']], [['r', 'RAG', 'add knowledge', 'blue']], [['fe', 'Embeddings + head', 'small training', 'violet']], [['ft', 'Fine-tuning', 'change behaviour', 'amber']], [['sc', 'From scratch', 'rarely justified', 'rose']]]), 'Escalate only when the simpler option fails — cost and effort increase left to right'),
    transformer: () => flow(F([[['t', 'Tokens', 'IDs', 'cyan']], [['e', 'Embeddings', '+ position', 'blue']], [['att', 'Self-attention', 'mix context', 'violet'], ['ff', 'Feed-forward', 'per token', 'violet']], [['x', '× N blocks', 'residual + norm', 'amber']], [['o', 'Logits', 'next-token probs', 'green']]], ['t>e', 'e>att', 'att>ff', 'ff>x', 'x>o']), 'Decoder-only transformer, simplified'),
    tokens: () => figure(tokens(), 'Tokenization turns text into IDs, then vectors', 'Five tokens of the sentence The capital of France is, each with an ID and an embedding'),
    sampling: () => figure(sampling(), 'Next-token distribution', 'Bar chart: Paris 82 percent, other tokens small'),
    grounding: () => flow(F([[['q', 'Question', '', 'cyan']], [['ret', 'Retrieve', 'authoritative sources', 'blue']], [['llm', 'Model', 'answer from context', 'violet']], [['cite', 'Cited answer', 'verifiable', 'green'], ['abs', '“Not found”', 'when unsupported', 'amber']]]), 'Grounding and abstention reduce hallucinations'),
    promptStack: () => flow(F([[['sys', 'System', 'role · rules · format', 'violet']], [['ctx', 'Context', 'retrieved docs (untrusted)', 'amber']], [['ex', 'Examples', 'few-shot', 'blue']], [['usr', 'User input', 'task (untrusted)', 'cyan']], [['out', 'Output', 'schema', 'green']]]), 'Anatomy of a prompt — higher layers take precedence'),
    toolCall: () => flow(F([[['u', 'User', 'question', 'cyan']], [['m', 'Model', 'requests tool', 'violet']], [['app', 'Your code', 'validate + execute', 'blue']], [['t', 'Tool', 'API · DB', 'amber'], ['ans', 'Model', 'final answer from result', 'green']]], ['u>m', 'm>app', 'app>t', 't~>app', 'app>ans']), 'Tool calling: the model proposes, your code executes'),
    trustBoundaries: () => flow(F([[['user', 'User input', 'untrusted', 'rose'], ['docs', 'Documents / web', 'untrusted', 'rose']], [['gate', 'Trust boundary', 'authz · filters · validation', 'amber']], [['llm', 'Model', 'may be manipulated', 'violet']], [['tools', 'Scoped tools', 'least privilege', 'blue'], ['out', 'Validated output', 'before render/act', 'green']]], ['user>gate', 'docs>gate', 'gate>llm', 'llm>tools', 'llm>out']), 'Trust boundaries: treat inputs as data, constrain what the model can do'),
    embeddingSpace: () => figure(embeddingSpace(), 'Similar meanings cluster together in embedding space (2-D projection)', 'Scatter of support phrases in three clusters: billing, login and shipping, with a query landing near login'),
    hybrid: () => flow(F([[['q', 'Query', '', 'cyan']], [['bm', 'BM25', 'exact terms', 'blue'], ['vec', 'Vector', 'meaning', 'violet']], [['rrf', 'Fusion', 'RRF', 'amber']], [['rr', 'Rerank', 'optional', 'green']]]), 'Hybrid search fuses keyword and vector rankings'),
    indexTradeoffs: () => figure(indexTradeoffs(), 'Vector index trade-offs (illustrative)', 'Relative recall, speed and memory for flat, HNSW, IVF and quantised IVF indexes'),
    ragPipeline: () => flow(F([[['src', 'Documents', 'PDF · HTML · MD', 'cyan'], ['q', 'User question', 'online', 'cyan']], [['parse', 'Parse + chunk', 'clean · metadata', 'blue'], ['rw', 'Rewrite query', 'optional', 'blue']], [['idx', 'Embed + index', 'vectors + BM25', 'violet'], ['eq', 'Embed query', 'same model', 'violet']], [['ret', 'Hybrid retrieve', 'permission filters', 'amber']], [['rr', 'Rerank + assemble', 'context budget', 'amber']], [['gen', 'Generate', 'cited answer', 'green']]], ['src>parse', 'parse>idx', 'q>rw', 'rw>eq', 'idx~>ret', 'eq>ret', 'ret>rr', 'rr>gen']), 'RAG: offline ingestion (top lane) feeds the online query path (bottom lane)'),
    chunking: () => figure(chunking(), 'Chunk size and overlap', 'A document split into three chunks with overlapping regions'),
    rerank: () => flow(F([[['q', 'Query', '', 'cyan']], [['r', 'Retrieve', 'top-50 · fast', 'blue']], [['ce', 'Cross-encoder', 'score pairs', 'violet']], [['k', 'Top-5', 'to the model', 'green']]]), 'Retrieve broadly, rerank precisely'),
    citations: () => flow(F([[['ctx', 'Context', '[S1] [S2] [S3]', 'blue']], [['llm', 'Model', 'cites per claim', 'violet']], [['chk', 'Citation check', 'IDs exist? support?', 'amber']], [['ui', 'UI', 'linked sources', 'green']]]), 'Verifiable citations'),
    ragFailures: () => flow(F([[['m', 'Missing content', 'not in corpus', 'rose'], ['p', 'Parsing', 'garbled text', 'rose']], [['c', 'Chunking', 'split answers', 'amber'], ['r', 'Retrieval miss', 'not in top-k', 'amber']], [['x', 'Context', 'truncated · buried', 'violet'], ['g', 'Generation', 'ignores context', 'violet']]], ['m>c', 'p>c', 'c>x', 'r>x', 'r>g', 'c>g']), 'Where RAG fails — diagnose by stage'),
    agentLoop: () => flow(F([[['goal', 'Goal', 'task + state', 'cyan']], [['think', 'Model', 'choose action', 'violet']], [['act', 'Tool call', 'validated', 'blue']], [['obs', 'Observation', 'result', 'amber']], [['done', 'Done?', 'answer · cap · approval', 'green']]], ['goal>think', 'think>act', 'act>obs', 'obs>done', 'obs~>think']), 'Agent loop with explicit stopping conditions'),
    workflowVsAgent: () => flow(F([[['call', 'Single call', 'simplest', 'green']], [['chain', 'Chain', 'fixed steps', 'blue']], [['wf', 'Workflow', 'explicit branches', 'violet']], [['agent', 'Agent', 'model-driven loop', 'amber']]]), 'Autonomy spectrum: cost, latency and risk rise left to right'),
    hitl: () => flow(F([[['agent', 'Agent', 'proposes action', 'violet']], [['pause', 'Interrupt', 'checkpoint state', 'amber']], [['human', 'Human', 'approve · edit · reject', 'cyan']], [['resume', 'Resume', 'execute or stop', 'green'], ['audit', 'Audit log', 'who · what · when', 'blue']]]), 'Human-in-the-loop approval'),
    langgraph: () => flow(F([[['start', 'START', '', 'cyan']], [['draft', 'draft', 'node', 'violet']], [['review', 'review', 'node', 'blue']], [['approve', 'approve', 'interrupt', 'amber']], [['end', 'END', '', 'green']]], ['start>draft', 'draft>review', 'review~>draft', 'review>approve', 'approve>end']), 'A LangGraph state graph with a conditional revise loop'),
    layers: () => flow(F([[['ui', 'Interface', 'API · UI', 'cyan']], [['dom', 'Domain logic', 'your code, framework-free', 'green']], [['ports', 'Interfaces', 'LLM · Retriever · Store', 'violet']], [['ad', 'Adapters', 'SDKs · frameworks', 'amber']]]), 'Keep frameworks at the edges'),
    evalLoop: () => flow(F([[['ds', 'Dataset', 'cases + references', 'cyan']], [['run', 'Run system', 'version X', 'blue']], [['score', 'Score', 'metrics · judges', 'violet']], [['an', 'Analyse', 'failures', 'amber']], [['ch', 'Change', 'prompt · retrieval', 'green']]], ['ds>run', 'run>score', 'score>an', 'an>ch', 'ch~>run', 'an~>ds']), 'The evaluation loop'),
    judge: () => flow(F([[['a', 'Answer', '+ question', 'cyan']], [['rub', 'Rubric', 'criteria · scale', 'blue']], [['j', 'LLM judge', 'both orderings', 'violet']], [['cal', 'Calibrate', 'vs human labels', 'amber']]]), 'Calibrated model-as-judge'),
    ciEval: () => flow(F([[['pr', 'Pull request', 'prompt change', 'cyan']], [['unit', 'Unit tests', 'fast', 'blue']], [['ev', 'Eval subset', 'thresholds', 'violet']], [['ok', 'Merge', 'pass', 'green'], ['no', 'Block', 'regression', 'rose']]]), 'Regression evaluation in CI'),
    deployment: () => flow(F([[['git', 'Git push', '', 'cyan']], [['ci', 'CI', 'tests · evals · build', 'blue']], [['reg', 'Registry', 'image', 'violet']], [['stg', 'Staging', 'smoke tests', 'amber']], [['prod', 'Production', 'monitored', 'green']]], ['git>ci', 'ci>reg', 'reg>stg', 'stg>prod', 'prod~>stg']), 'From commit to monitored production'),
    observability: () => flow(F([[['req', 'Request', 'trace ID', 'cyan']], [['ret', 'Retrieval span', 'latency · hits', 'blue'], ['llm', 'Model span', 'tokens · cost', 'violet'], ['tool', 'Tool span', 'errors', 'amber']], [['dash', 'Dashboards', 'p95 · $ · errors', 'green'], ['alert', 'Alerts', 'budgets · SLOs', 'rose']]]), 'Tracing and cost attribution'),
    promptInjection: () => flow(F([[['att', 'Attacker', 'plants text', 'rose']], [['doc', 'Web page / PDF', 'hidden instructions', 'rose']], [['rag', 'Retrieved', 'enters context', 'amber']], [['llm', 'Model', 'may follow it', 'violet']], [['lim', 'Limited tools', 'damage contained', 'green']]]), 'Indirect prompt injection path — and where to contain it'),
    dataLifecycle: () => flow(F([[['req', 'Delete request', 'user / tenant', 'cyan']], [['job', 'Deletion job', 'idempotent', 'violet']], [['db', 'Database', '', 'blue'], ['files', 'Object storage', '', 'blue'], ['vec', 'Vector index', '', 'blue']], [['ver', 'Verify', 'search returns nothing', 'green']]]), 'Deletion must reach every derived store'),
    branches: () => figure(branches(), 'Optional specialisation branches', 'Core curriculum branching into five optional specialisations A to E'),
    lora: () => figure(lora(), 'Low-rank adaptation', 'Frozen weight matrix W plus the product of two small trainable matrices B and A'),
    capstone: () => figure(capstone(), 'Capstone milestones', 'Timeline: problem, requirements, architecture, build, evaluate, secure, deploy, present'),
    careerRoles: () => figure(careerRoles(), 'Where the AI engineer sits', 'Venn diagram of software, ML/LLMs and product with AI engineer at the intersection')
  };

  // ───────────────── Interactive demos
  const demos = {
    cosine(el) {
      el.innerHTML = `<div class="panel demo"><div class="panel-title">${AIEA.icon('hand')} Try it: cosine similarity</div>
        <div class="grid grid-2"><div class="cos-svg"></div><div class="stack">
        <div class="range-row"><label for="cosA">Angle of a</label><input id="cosA" type="range" min="0" max="180" value="25"><output>25°</output></div>
        <div class="range-row"><label for="cosB">Angle of b</label><input id="cosB" type="range" min="0" max="180" value="65"><output>65°</output></div>
        <div class="range-row"><label for="cosL">Length of b</label><input id="cosL" type="range" min="30" max="100" value="100"><output>1.00</output></div>
        <div class="stat"><span class="stat-label">cosine similarity</span><span class="stat-value cos-val">—</span><span class="stat-sub cos-note"></span></div></div></div></div>`;
      const [a, b, l] = ['#cosA', '#cosB', '#cosL'].map(s => el.querySelector(s));
      const update = () => {
        const A = +a.value, B = +b.value, L = +l.value / 100;
        a.nextElementSibling.textContent = A + '°'; b.nextElementSibling.textContent = B + '°'; l.nextElementSibling.textContent = L.toFixed(2);
        const v = vectors(A, B, L); el.querySelector('.cos-svg').innerHTML = `<svg viewBox="${v.vb}" role="img" aria-label="Vectors a and b">${v.body}</svg>`;
        const c = Math.cos((B - A) * Math.PI / 180);
        el.querySelector('.cos-val').textContent = c.toFixed(3);
        el.querySelector('.cos-note').textContent = c > 0.8 ? 'Very similar direction' : c > 0.3 ? 'Somewhat related' : c > -0.3 ? 'Roughly unrelated (orthogonal)' : 'Opposing directions';
      };
      [a, b, l].forEach(i => i.addEventListener('input', update)); update();
    },
    tokenizer(el) {
      el.innerHTML = `<div class="panel demo"><div class="panel-title">${AIEA.icon('hand')} Try it: how text splits into tokens</div>
        <label class="field">Text<textarea class="textarea tok-in" rows="3">Tokenization isn't always intuitive: GPT-style models split rarewords into pieces!</textarea></label>
        <div class="token-out" aria-live="polite"></div><div class="row text-sm muted tok-stats"></div>
        <p class="text-sm muted mb-0">${AIEA.icon('info')} Illustrative only — this demo uses simple rules. Real tokenizers use learned vocabularies (e.g. BPE); use <a href="https://tiktokenizer.vercel.app/" data-external>Tiktokenizer</a> for exact counts.</p></div>`;
      const inp = el.querySelector('.tok-in');
      const run = () => {
        const text = inp.value.slice(0, 2000);
        const raw = text.match(/ ?[A-Za-z]+|\s*\d{1,3}|\s+|[^\sA-Za-z\d]/g) || [];
        const toks = [];
        raw.forEach(t => {
          const lead = t.startsWith(' ') ? ' ' : ''; const core = lead ? t.slice(1) : t;
          if (/^[A-Za-z]+$/.test(core) && core.length > 7) {
            const parts = core.match(/.{1,5}/g); parts.forEach((p, i) => toks.push((i === 0 ? lead : '') + p));
          } else toks.push(t);
        });
        el.querySelector('.token-out').innerHTML = toks.map(t => `<span>${esc(t.replace(/ /g, '·'))}</span>`).join('');
        const words = (text.trim().match(/\S+/g) || []).length;
        el.querySelector('.tok-stats').innerHTML = `<span>${text.length} characters</span><span>·</span><span>${words} words</span><span>·</span><span><b>${toks.length}</b> illustrative tokens</span>`;
      };
      inp.addEventListener('input', run); run();
    },
    temperature(el) {
      const logits = [['Paris', 6.0], ['a', 3.2], ['the', 3.0], ['located', 2.4], ['beautiful', 1.6], ['Lyon', 1.1]];
      el.innerHTML = `<div class="panel demo"><div class="panel-title">${AIEA.icon('hand')} Try it: temperature reshapes probabilities</div>
        <div class="range-row"><label for="tempR">Temperature</label><input id="tempR" type="range" min="10" max="200" value="100"><output>1.00</output></div>
        <p class="text-sm muted mb-0">Next token after “The capital of France is” — illustrative logits.</p>
        <div class="bar-list"></div></div>`;
      const r = el.querySelector('#tempR');
      const run = () => {
        const T = +r.value / 100; r.nextElementSibling.textContent = T.toFixed(2);
        const ex = logits.map(([, z]) => Math.exp(z / T)); const s = ex.reduce((a, b) => a + b, 0);
        el.querySelector('.bar-list').innerHTML = logits.map(([t], i) => { const p = ex[i] / s; return `<div class="bar-row"><span>${t}</span><div class="bar"><span style="width:${(p * 100).toFixed(1)}%"></span></div><output>${(p * 100).toFixed(1)}%</output></div>`; }).join('');
      };
      r.addEventListener('input', run); run();
    },
    chunker(el) {
      const text = 'Refunds are available within 30 days of purchase. To request a refund, open the billing page and select the order. Refunds are issued to the original payment method. Processing takes five to seven business days. Annual plans are refunded pro rata after the first 30 days. Gift cards cannot be refunded. Contact support if your bank shows a pending charge after ten days. Enterprise contracts follow the terms in the signed agreement.';
      const words = text.split(' ');
      el.innerHTML = `<div class="panel demo"><div class="panel-title">${AIEA.icon('hand')} Try it: chunk size and overlap</div>
        <div class="range-row"><label for="chS">Chunk size</label><input id="chS" type="range" min="8" max="40" value="20"><output>20</output></div>
        <div class="range-row"><label for="chO">Overlap</label><input id="chO" type="range" min="0" max="10" value="4"><output>4</output></div>
        <div class="stack ch-out"></div><p class="text-sm muted mb-0">Sizes are in words for readability; real pipelines usually measure tokens.</p></div>`;
      const s = el.querySelector('#chS'), o = el.querySelector('#chO');
      const run = () => {
        const size = +s.value; let ov = Math.min(+o.value, size - 1);
        s.nextElementSibling.textContent = size; o.nextElementSibling.textContent = ov;
        const out = []; for (let i = 0; i < words.length; i += size - ov) { out.push([i, Math.min(i + size, words.length)]); if (i + size >= words.length) break; }
        el.querySelector('.ch-out').innerHTML = `<div class="text-sm muted">${out.length} chunks</div>` + out.map(([a, b], k) => {
          const prevEnd = k > 0 ? out[k - 1][1] : a;
          const html = words.slice(a, b).map((w, j) => (a + j < prevEnd && k > 0) ? `<mark>${esc(w)}</mark>` : esc(w)).join(' ');
          return `<div class="note-item text-sm"><b class="tag tag-cyan">chunk ${k + 1}</b> ${html}</div>`;
        }).join('');
      };
      [s, o].forEach(i => i.addEventListener('input', run)); run();
    }
  };

  AIEA.diagrams = {
    flow, hero,
    has: key => !!reg[key],
    get: key => (reg[key] ? reg[key]() : '')
  };
  AIEA.demos = demos;
})();
