// Заглушка window.claude для локальной проверки: база в памяти, скачивание в window.__saved, Claude отвечает тестовым текстом.
// Из консоли: __mock.fail = 'unavailable' (следующая запись упадёт с этим кодом), __mock.latency = 400.
// При загрузке: ?nodb открывает страницу без базы, ?ro в режиме «только просмотр».
(function () {
  const qs = new URLSearchParams(location.search);
  const M = window.__mock = Object.assign({noDb: qs.has('nodb'), readOnly: qs.has('ro'), fail: '', latency: 40, writes: 0}, window.__mock || {});
  const cl = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const freeze = o => { if (o && typeof o === 'object') { Object.freeze(o); Object.values(o).forEach(freeze); } return o; };
  const err = (code, message) => Object.assign(new Error(message || code), {code});
  const store = window.__store = {};
  const col = name => store[name] || (store[name] = new Map());
  let seq = 0;
  const newId = () => 'm' + Date.now().toString(36) + (++seq).toString(36);
  const subs = new Set();
  const notify = name => setTimeout(() => { subs.forEach(s => { if (s.col === name) s.fire(); }); }, 5);
  function merge(t, p) {
    for (const k of Object.keys(p)) {
      const v = p[k];
      if (isObj(v) && isObj(t[k])) merge(t[k], v);
      else t[k] = cl(v);
    }
    return t;
  }
  async function write(fn) {
    await new Promise(r => setTimeout(r, M.latency));
    if (M.fail) { const c = M.fail; M.fail = ''; throw err(c); }
    M.writes++;
    fn();
  }
  const docSnap = (name, id) => {
    const m = col(name);
    if (!m.has(id)) return {id, exists: false, data: () => undefined, metadata: {fromCache: false, hasPendingWrites: false}};
    const d = freeze(cl(m.get(id)));
    return {id, exists: true, data: () => d, metadata: {fromCache: false, hasPendingWrites: false}};
  };
  function cmp(a, op, b) {
    switch (op) {
      case '==': return a === b; case '!=': return a !== b;
      case '<': return a < b; case '<=': return a <= b; case '>': return a > b; case '>=': return a >= b;
      case 'in': return Array.isArray(b) && b.includes(a);
      case 'array-contains': return Array.isArray(a) && a.includes(b);
      default: throw err('invalid_argument', 'op ' + op);
    }
  }
  function run(q) {
    let rows = [...col(q.col).entries()].map(([id, data]) => ({id, data}));
    q.where.forEach(([f, op, v]) => { rows = rows.filter(r => cmp(r.data[f], op, v)); });
    if (q.order) {
      const [f, dir] = q.order, s = dir === 'desc' ? -1 : 1;
      rows.sort((a, b) => {
        const x = a.data[f], y = b.data[f];
        if (x === undefined && y === undefined) return 0;
        if (x === undefined) return 1;
        if (y === undefined) return -1;
        return (x < y ? -1 : x > y ? 1 : 0) * s;
      });
    }
    if (q.lim) rows = rows.slice(0, q.lim);
    const docs = rows.map(r => docSnap(q.col, r.id));
    return {docs, size: docs.length, empty: !docs.length, metadata: {fromCache: false, hasPendingWrites: false}, docChanges: () => []};
  }
  function query(q) {
    return {
      where: (f, op, v) => query(Object.assign({}, q, {where: q.where.concat([[f, op, v]])})),
      orderBy: (f, dir) => query(Object.assign({}, q, {order: [f, dir || 'asc']})),
      limit: n => { if (!(n >= 1 && n <= 1000)) throw err('invalid_argument', 'limit'); return query(Object.assign({}, q, {lim: n})); },
      get: async () => run(q),
      onSnapshot(next, error) {
        const s = {col: q.col, fire: () => { try { next(run(q)); } catch (e) { console.error('snapshot handler', e); if (error) error(e); } }};
        subs.add(s); setTimeout(s.fire, M.latency);
        return () => subs.delete(s);
      }
    };
  }
  function docRef(name, id) {
    return {
      id,
      get: async () => docSnap(name, id),
      set: data => write(() => { col(name).set(id, cl(data)); notify(name); }),
      update: patch => write(() => {
        const m = col(name);
        if (!m.has(id)) throw err('invalid_argument', 'document does not exist');
        m.set(id, merge(cl(m.get(id)), patch)); notify(name);
      }),
      delete: () => write(() => { col(name).delete(id); notify(name); }),
      onSnapshot(next) {
        const s = {col: name, fire: () => next(docSnap(name, id))};
        subs.add(s); setTimeout(s.fire, M.latency);
        return () => subs.delete(s);
      }
    };
  }
  const db = {
    collection: name => Object.assign(query({col: name, where: [], order: null, lim: 0}), {doc: id => docRef(name, id || newId())}),
    doc: path => { const p = path.split('/'); return docRef(p[0], p[1]); }
  };

  // Данные: лиды из seed.js плюс немного истории за прошлую неделю, чтобы «Сегодня» и «Итоги» было на чем проверить.
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  (window.__SEED || []).forEach(l => { const x = cl(l); const id = x.id; delete x.id; col('leads').set(id, x); });
  if (col('leads').size) {
    const ids = [...col('leads').keys()];
    const iso = n => new Date(Date.now() + n * 864e5).toISOString();
    col('outings').set('o-past', {date: day(-6), leads: ids.slice(0, 3), done: true, doneAt: day(-6), results: {[ids[0]]: 'talked', [ids[1]]: 'absent', [ids[2]]: 'interested'}, created: iso(-7)});
    col('activity').set('a1', {leadId: ids[0], type: 'visit', result: 'talked', text: 'Владелец бывает после 15:00', date: day(-6), outingId: 'o-past', created: iso(-6)});
    col('activity').set('a2', {leadId: ids[1], type: 'visit', result: 'absent', text: '', date: day(-6), outingId: 'o-past', created: iso(-6)});
    col('activity').set('a3', {leadId: ids[2], type: 'visit', result: 'interested', text: 'Хотят меню на английском', date: day(-6), outingId: 'o-past', created: iso(-6)});
    const patch = (id, p) => col('leads').set(id, Object.assign(col('leads').get(id), p));
    patch(ids[0], {status: 'contact', next: 'Вернуться с примером', nextDate: day(1)});
    patch(ids[1], {next: 'Зайти ещё раз и застать владельца', nextDate: day(-2)});
    patch(ids[2], {status: 'talk', next: 'Показать черновик сайта', nextDate: day(0)});
  }

  window.__saved = [];
  window.__prompts = [];
  const sample = async (input, opts) => {
    opts = opts || {};
    window.__prompts.push({input, opts: {cache: opts.cache, modelTier: opts.modelTier}});
    const text = 'Тестовый ответ.\n1) Dzień dobry! Mogę w minutę pokazać, jak wyglądałaby Państwa strona z menu?\n2) Rozumiem. Za 2–3 dni mogę przyjść ze szkicem.\nПочему так: короткий вопрос и конкретный следующий шаг.';
    let acc = '';
    for (const part of text.match(/[\s\S]{1,8}/g)) {
      await new Promise(r => setTimeout(r, 12));
      if (opts.signal && opts.signal.aborted) throw Object.assign(err('cancelled'), {text: acc});
      acc += part;
      if (opts.onText) opts.onText({text: acc, delta: part});
    }
    return {text: acc, truncated: false};
  };
  sample.json = async () => ({});
  sample.limits = async () => ({images: false});

  window.claude = {
    use: async name => {
      await new Promise(r => setTimeout(r, 30));
      if (name === 'db') return M.noDb ? null : db;
      if (name === 'user') return {can: async () => (M.readOnly ? false : true), canEdit: () => true, isOwner: () => true};
      if (name === 'downloads') return {save: async ({filename, data}) => { window.__saved.push({filename, size: String(data).length, data: String(data)}); return {status: 'saved'}; }};
      if (name === 'sample') return sample;
      return null;
    }
  };
})();
