// утилиты
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const safeUrl = u => { const s = String(u || '').trim(); return /^https?:\/\/\S+$/i.test(s) ? s : ''; };
const clone = o => JSON.parse(JSON.stringify(o == null ? null : o));
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
function deepMerge(t, p) {
  for (const k of Object.keys(p || {})) {
    const v = p[k];
    if (isObj(v)) t[k] = deepMerge(isObj(t[k]) ? t[k] : {}, v);
    else t[k] = v;
  }
  return t;
}
const num = (v, d) => (v === '' || v == null || isNaN(+v)) ? d : +v;
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = parseYmd(s) || new Date(); d.setDate(d.getDate() + n); return ymd(d); };
const nowIso = () => new Date().toISOString();
const dayDiff = (a, b) => Math.round(((parseYmd(a) || new Date()) - (parseYmd(b) || new Date())) / 864e5);
function weekStart(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
}
const MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MON_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WD_S = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
function fmtD(s) {
  const d = parseYmd(s) || (s ? new Date(s) : null);
  if (!d || isNaN(d)) return '';
  return d.getDate() + ' ' + MON[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
}
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
function rel(s) {
  if (!s) return '';
  const n = dayDiff(s, today());
  if (n === 0) return 'сегодня';
  if (n === 1) return 'завтра';
  if (n === -1) return 'вчера';
  if (n > 1 && n < 7) return 'через ' + n + ' ' + plural(n, 'день', 'дня', 'дней');
  if (n < -1 && n > -15) return -n + ' ' + plural(-n, 'день', 'дня', 'дней') + ' назад';
  return fmtD(s);
}
const fmtN = n => Math.round(+n || 0).toLocaleString('ru-RU');
const fmtZl = n => fmtN(n) + ' zł';
const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'lead';
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-zа-яё0-9]+/gi, ' ').trim();
const lsGet = (k, d) => { try { const v = localStorage.getItem('cb.' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem('cb.' + k, JSON.stringify(v)); } catch (_) {} };
function getPath(o, p) { return p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
function setPath(o, p, v) { const ks = p.split('.'); let t = o; for (const k of ks.slice(0, -1)) { if (!isObj(t[k])) t[k] = {}; t = t[k]; } t[ks[ks.length - 1]] = v; }
function nestPatch(p, v) { const ks = p.split('.'); const root = {}; let t = root; ks.slice(0, -1).forEach(k => { t[k] = {}; t = t[k]; }); t[ks[ks.length - 1]] = v; return root; }

// состояние
const S = {
  db: null, dbState: 'init', err: '', readOnly: false, canWrite: null, timeout: false, cached: false,
  got: {leads: false, acts: false, outings: false, settings: false},
  leads: [], acts: [], outings: [], setDoc: null, setExists: false,
  view: '',
  f: Object.assign({q: '', seg: '', st: '', city: '', tag: '', sort: 'score', mode: 'list'}, lsGet('filters', {}), {q: ''}),
  dr: {id: null, tab: 'over', del: false, actDel: null, last: null},
  form: {type: 'visit', text: '', date: ''},
  nf: {name: '', cat: '', kind: '', seg: 'horeca', city: 'Katowice', address: '', rating: '', site: '', maps: '', lang: false, extra: [], dupOk: false},
  hunt: {city: lsGet('huntCity', 'katowice'), paste: '', pasteCat: 'azja', rows: null, busy: false},
  plan: {city: '', del: null},
  run: {id: null, i: 0, lostFor: null, notes: {}, how: {}},
  scr: {lang: 'pl', lead: '', q: ''},
  kp: {lead: '', pk: null, lang: 'pl', note: '', manual: '', city: 'Katowice'},
  demo: {lead: '', style: '', layout: '', name: '', city: 'Katowice', lang: 'pl', dev: 'phone', full: false},
  stats: {table: false},
  ai: {}, sample: null, dl: null,
  pending: false
};
let CFG = clone(P.DEFAULTS);
const lang2 = () => lsGet('lang2', 'ua');

// лиды
const stOf = l => (l && P.RANK[l.status] !== undefined) ? l.status : 'new';
const stT = k => (P.STATUS.find(s => s.k === k) || P.STATUS[0]).t;
const priOf = l => [1, 2, 3].includes(+(l && l.priority)) ? +l.priority : 3;
const tagsOf = l => Array.isArray(l && l.tags) ? l.tags.filter(t => P.TAGS[t]) : [];
const segOf = l => (l && P.SEG[l.segment]) ? l.segment : 'other';
const leadById = id => S.leads.find(l => l.id === id) || null;
const isActive = l => !['won', 'lost'].includes(stOf(l));
const cityObj = c => { const n = norm(c); return P.CITIES.find(x => norm(x.n) === n || x.id === n) || null; };
function parseRating(r) {
  const s = String(r || '');
  const m = s.match(/(\d+[.,]\d+|\d+)/);
  const rating = m ? parseFloat(m[1].replace(',', '.')) : 0;
  const m2 = s.match(/[·•|/(]\s*([\d\s ]+)/);
  const reviews = m2 ? parseInt(m2[1].replace(/\D/g, ''), 10) || 0 : 0;
  return {rating: rating <= 5 ? rating : 0, reviews};
}
function score(l) {
  let s = 0;
  for (const t of tagsOf(l)) s += P.TAGS[t].w;
  const {rating, reviews} = parseRating(l.rating);
  if (reviews) s += Math.min(20, Math.round(Math.log10(reviews + 1) * 7));
  if (rating >= 4.5) s += 5;
  if (l.lang) s += 10;
  const pr = priOf(l);
  if (pr === 1) s += 15; else if (pr === 2) s += 5;
  if (segOf(l) === 'horeca') s += 5;
  return Math.max(0, Math.min(100, s));
}
const heat = n => n >= 70 ? 'hot' : n >= 45 ? 'warm' : 'cold';
const scoreBadge = l => { const n = score(l); return `<span class="sc ${heat(n)}" data-tip="Оценка лида: ${n} из 100\n${esc(scoreWhy(l))}">${n}</span>`; };
function scoreWhy(l) {
  const parts = tagsOf(l).filter(t => P.TAGS[t].w).map(t => P.TAGS[t].t + ' ' + (P.TAGS[t].w > 0 ? '+' : '') + P.TAGS[t].w);
  const {rating, reviews} = parseRating(l.rating);
  if (reviews) parts.push('отзывы +' + Math.min(20, Math.round(Math.log10(reviews + 1) * 7)));
  if (rating >= 4.5) parts.push('рейтинг +5');
  if (l.lang) parts.push('свой язык +10');
  if (priOf(l) === 1) parts.push('горячий +15'); else if (priOf(l) === 2) parts.push('тёплый +5');
  if (segOf(l) === 'horeca') parts.push('ресторан +5');
  return parts.join(', ') || 'нет сигналов';
}
function tagsFromSite(url) {
  const u = String(url || '').trim().toLowerCase();
  if (!u) return ['nosite'];
  if (/instagram\.com|instagr\.am/.test(u)) return ['insta'];
  if (/facebook\.com|fb\.com|fb\.me/.test(u)) return ['fb'];
  if (/pyszne\.pl|glovoapp|ubereats|uber\.com|wolt\.com/.test(u)) return ['aggregator'];
  if (/choiceqr|papu\.io|upmenu|wietnamskie|restaumatic/.test(u)) return ['rented'];
  return [];
}
const SITE_TAGS = ['nosite', 'insta', 'fb', 'aggregator', 'rented'];
function aggName(l) { const u = String((l && l.site) || '').toLowerCase(); for (const [re, n] of P.AGG) if (re.test(u)) return n; return ''; }
const pkById = id => P.PACKAGES.find(p => p.id === id) || null;
function priceOf(p) { const o = (CFG.prices || {})[p.id] || {}; return {from: num(o.from, p.from), to: num(o.to, p.to)}; }
function caseOf(id) { const c = P.CASES[id]; if (!c) return null; const u = safeUrl((CFG.cases || {})[id]); return Object.assign({}, c, {url: u || c.url}); }
function suggestPk(l) {
  const seg = segOf(l), t = tagsOf(l);
  if (seg !== 'horeca') return (P.SEG_PK[seg] || ['card']).slice();
  const out = ['menu'];
  if (t.includes('nobooking') || !(t.includes('aggregator') || t.includes('noorder'))) out.push('booking');
  if (t.includes('aggregator') || t.includes('noorder')) out.push('pickup');
  return out;
}
function leadPk(l) { const own = Array.isArray(l && l.packages) ? l.packages.filter(pkById) : []; return own.length ? own : suggestPk(l); }
function openerKey(l) {
  if (!l) return 'general';
  const t = tagsOf(l);
  if (segOf(l) !== 'horeca') return 'service';
  if (t.includes('aggregator')) return 'aggregator';
  if (t.includes('insta') || t.includes('fb')) return 'social';
  if (t.includes('nosite')) return 'nosite';
  if (t.includes('rented')) return 'rented';
  return 'general';
}
function caseLine(l) { const c = caseOf(P.SEG_CASE[l ? segOf(l) : 'horeca']); return c ? (c.url ? c.name + ': ' + c.url : c.name) : ''; }
function fill(text, l, lang) {
  const city = l ? cityObj(l.city) : null;
  const t = l ? tagsOf(l) : [];
  const plat = P.PLATFORM[lang] || P.PLATFORM.en;
  const vars = {
    cityLoc: city ? city.loc : 'na Śląsku',
    platform: plat[t.includes('fb') && !t.includes('insta') ? 'fb' : 'insta'],
    agg: aggName(l) || P.AGG_DEFAULT[lang] || P.AGG_DEFAULT.en,
    real: P.REAL[l && segOf(l) !== 'horeca' ? 's' : 'r'][lang] || P.REAL.r.en,
    name: (l && l.name) || '…',
    brand: CFG.profile.brand || 'syncae',
    portfolio: CFG.profile.portfolio || '',
    case: caseLine(l)
  };
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
}
const leadLang = l => (l && l.lang) ? lang2() : 'pl';
const reach = l => { const st = stOf(l); if (st === 'lost') return Math.max(1, P.RANK[l.lostFrom] || 0); return P.RANK[st]; };
const leadPlace = l => [l.address, l.city].filter(Boolean).join(', ');
const mapsSearch = l => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([l.name, leadPlace(l)].filter(Boolean).join(', '));
function routeUrl(leads) {
  const stops = leads.map(l => l.address ? leadPlace(l) : [l.name, l.city].filter(Boolean).join(', ')).filter(Boolean);
  if (!stops.length) return '';
  let u = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + encodeURIComponent(stops[stops.length - 1]);
  const wps = stops.slice(0, -1).slice(0, 9);
  if (wps.length) u += '&waypoints=' + wps.map(encodeURIComponent).join('%7C');
  return u;
}
const actsOf = id => S.acts.filter(a => a.leadId === id);
const plans = () => S.outings.filter(o => !o.done).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created).localeCompare(String(b.created)));
const curPlan = () => plans()[0] || null;
const inPlan = id => plans().some(o => (o.leads || []).includes(id));
function dueLists() {
  const t = today(), soon = addDays(t, 7);
  const act = S.leads.filter(isActive);
  const by = (a, b) => String(a.nextDate).localeCompare(String(b.nextDate)) || score(b) - score(a);
  return {
    over: act.filter(l => l.nextDate && l.nextDate < t).sort(by),
    today: act.filter(l => l.nextDate === t).sort(by),
    soon: act.filter(l => l.nextDate && l.nextDate > t && l.nextDate <= soon).sort(by),
    stuck: act.filter(l => stOf(l) !== 'new' && !l.nextDate && !String(l.next || '').trim()).sort((a, b) => score(b) - score(a))
  };
}
function weekStats(back) {
  const ws = weekStart(new Date()); ws.setDate(ws.getDate() - 7 * back);
  const a = ymd(ws), b = addDays(a, 7);
  const inW = d => d && d >= a && d < b;
  return {
    start: a,
    outings: S.outings.filter(o => o.done && inW(o.doneAt || o.date)).length,
    visits: S.acts.filter(x => x.type === 'visit' && inW(x.date)).length,
    offers: S.acts.filter(x => x.type === 'offer' && inW(x.date)).length
  };
}
function monthWon(ym) { return S.leads.filter(l => stOf(l) === 'won' && String(l.wonAt || '').startsWith(ym)).reduce((s, l) => s + (+l.value || 0), 0); }
function streak() {
  const g = +CFG.goals.visits || 1;
  let n = 0;
  for (let k = 1; k < 60; k++) { if (weekStats(k).visits >= g) n++; else break; }
  if (weekStats(0).visits >= g) n++;
  return n;
}
function kpNumber() {
  const ym = today().slice(0, 7);
  const c = S.acts.filter(a => a.type === 'offer' && String(a.date).startsWith(ym)).length;
  return 'KP/' + ym.replace('-', '/') + '/' + String(c + 1).padStart(3, '0');
}

// запись в базу
const queues = new Map();
function enqueue(key, fn) { const p = (queues.get(key) || Promise.resolve()).then(fn); queues.set(key, p.catch(() => {})); return p; }
async function withRetry(fn) {
  try { return await fn(); }
  catch (e) {
    if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 400 + Math.random() * 800)); return fn(); }
    throw e;
  }
}
const canEdit = () => !!S.db && !S.readOnly && S.err !== 'revoked';
function guard() {
  if (!S.db) { toast('База недоступна в этом окне: открой страницу на claude.ai.', true); return false; }
  if (S.readOnly) { toast('Только просмотр: изменения здесь не сохраняются.', true); return false; }
  if (S.err === 'revoked') { toast('Доступ к базе закрыт.', true); return false; }
  return true;
}
function onWriteError(e) {
  const code = e && e.code;
  if ((code === 'invalid_argument' && S.canWrite !== true) || code === 'not_granted') {
    S.readOnly = true; render();
    toast('Изменение не сохранилось: в этом окне база доступна только для чтения.', true);
  } else if (code === 'quota_exceeded') toast('База заполнена. Скачай резервную копию в «Настройках» и удали старые записи.', true);
  else if (code === 'revoked') { S.err = 'revoked'; render(); }
  else if (code === 'invalid_argument') toast('Запись не прошла: её не существует или данные неверны.', true);
  else toast('Не удалось сохранить. Попробуй ещё раз через минуту.', true);
}
function saveLead(id, patch) {
  if (!canEdit()) { guard(); return Promise.resolve(false); }
  const body = Object.assign({}, patch, {updated: nowIso()});
  return enqueue('leads/' + id, () => withRetry(() => S.db.collection('leads').doc(id).update(body))).then(() => true, e => { onWriteError(e); return false; });
}
async function addLead(data) {
  const ref = S.db.collection('leads').doc();
  const stamp = nowIso();
  await withRetry(() => ref.set(Object.assign({}, data, {created: stamp, updated: stamp})));
  return ref.id;
}
function addAct(a) {
  if (!canEdit()) return Promise.resolve(false);
  const ref = S.db.collection('activity').doc();
  const body = Object.assign({date: today()}, a, {created: nowIso()});
  return withRetry(() => ref.set(body)).then(() => ref.id, e => { onWriteError(e); return false; });
}
function delDoc(col, id) {
  if (!canEdit()) { guard(); return Promise.resolve(false); }
  return enqueue(col + '/' + id, () => withRetry(() => S.db.collection(col).doc(id).delete())).then(() => true, e => { onWriteError(e); return false; });
}
function saveOuting(id, patch) {
  if (!canEdit()) { guard(); return Promise.resolve(false); }
  return enqueue('outings/' + id, () => withRetry(() => S.db.collection('outings').doc(id).update(patch))).then(() => true, e => { onWriteError(e); return false; });
}
async function newOuting(data) {
  if (!guard()) return null;
  const ref = S.db.collection('outings').doc();
  try { await withRetry(() => ref.set(Object.assign({date: today(), leads: [], done: false, results: {}}, data, {created: nowIso()}))); return ref.id; }
  catch (e) { onWriteError(e); return null; }
}
function saveSettings(patch) {
  if (!guard()) return Promise.resolve(false);
  return enqueue('settings/main', async () => {
    const ref = S.db.collection('settings').doc('main');
    if (S.setExists) await withRetry(() => ref.update(patch));
    else { await withRetry(() => ref.set(deepMerge(clone(S.setDoc || {}), patch))); S.setExists = true; }
  }).then(() => true, e => { onWriteError(e); return false; });
}
async function setStatus(l, to, extra, meta) {
  const from = stOf(l);
  const patch = Object.assign({}, extra || {});
  if (from !== to) {
    patch.status = to;
    if (to === 'won') patch.wonAt = today();
    if (from === 'won') patch.wonAt = '';
    if (to === 'lost') { patch.lostAt = today(); patch.lostFrom = patch.lostFrom || from; }
    if (from === 'lost') { patch.lostReason = ''; patch.lostAt = ''; }
  }
  if (!Object.keys(patch).length) return true;
  const ok = await saveLead(l.id, patch);
  if (ok && from !== to) await addAct(Object.assign({leadId: l.id, type: 'status', from, to, text: stT(from) + ' → ' + stT(to)}, meta || {}));
  return ok;
}

// мелкий интерфейс
let toastT;
function toast(text, warn) {
  const el = $('#toast');
  el.textContent = text;
  el.className = 'toast' + (warn ? ' warn' : '');
  el.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.hidden = true; }, warn ? 6500 : 2800);
}
function copyText(text, okMsg, anchor) {
  const fallback = () => {
    let ta = $('#copyFallback');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'copyFallback'; ta.className = 'copy-fallback'; ta.rows = 4; ta.setAttribute('aria-label', 'Текст для копирования'); }
    const host = (anchor && anchor.closest('.say,.card,.side-form,.dr-sec,.run-card,.obj')) || $('#view');
    host.appendChild(ta);
    ta.value = text; ta.hidden = false; ta.focus(); ta.select();
    toast('Текст выделен: нажми Ctrl+C или «Копировать» в меню.');
  };
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return fallback();
    navigator.clipboard.writeText(text).then(() => toast(okMsg || 'Скопировано'), fallback);
  } catch (_) { fallback(); }
}
async function saveFile(filename, data) {
  if (!S.dl) { toast('Скачивание недоступно в этом окне.', true); return false; }
  try {
    const r = await S.dl.save({filename, data});
    toast(r && r.status === 'delivered' ? 'Файл передан: ' + filename : 'Файл сохранён: ' + filename);
    return true;
  } catch (e) {
    const c = e && e.code;
    if (c === 'declined') toast('Сохранение отменено.');
    else if (c === 'rate_limited') toast('Слишком много сохранений подряд. Подожди минуту.', true);
    else if (c === 'too_large') toast('Файл слишком большой для сохранения.', true);
    else if (['not_granted', 'capability_disabled', 'capability_removed', 'extension_not_enabled', 'rejected_extension'].includes(c)) { S.dl = null; render(); toast('Скачивание файлов в этом окне выключено.', true); }
    else toast('Файл не сохранился. Попробуй ещё раз.', true);
    return false;
  }
}

// рендер
const VIEWS = ['today', 'base', 'hunt', 'outing', 'scripts', 'offer', 'demo', 'stats', 'guide', 'prefs'];
const ALIAS = {segments: ['guide', 'g-segments'], channels: ['guide', 'g-channels'], playbook: ['guide', 'g-visit']};
const V = {}, AFTER = {};
let ptrAt = 0;
const ptrBusy = () => ptrAt && Date.now() - ptrAt < 1500;
const isTyping = () => {
  const a = document.activeElement;
  return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !/^(checkbox|radio|button)$/.test(a.type) && !!a.closest('#view,#drawer');
};
function scheduleRender() { if (isTyping() || ptrBusy()) { S.pending = true; renderChrome(); } else render(); }
function flush() { if (S.pending && !isTyping() && !ptrBusy()) render(); }

// Как найти тот же элемент после перерисовки: по id или по набору data-атрибутов.
function focusKey(a) {
  if (!a || !a.getAttribute) return '';
  const q = v => (window.CSS && CSS.escape) ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&');
  if (a.id) return '#' + q(a.id);
  const sel = ['data-act', 'data-v', 'data-id', 'data-k', 'data-tag', 'data-pk', 'data-lead', 'data-src', 'data-fresh']
    .filter(n => a.hasAttribute(n)).map(n => `[${n}="${q(a.getAttribute(n))}"]`).join('');
  return sel ? a.tagName.toLowerCase() + sel : '';
}
function render() {
  S.pending = false;
  const keep = {};
  $$('[data-keep]').forEach(el => { keep[el.dataset.keep] = [el.scrollLeft, el.scrollTop]; });
  const a = document.activeElement;
  const fid = a && a.closest && a.closest('#view,#drawer') ? focusKey(a) : '';
  renderChrome();
  const v = S.view || 'today';
  const host = $('#view');
  host.innerHTML = (V[v] || V.today)();
  if (AFTER[v]) AFTER[v]();
  renderDrawer();
  $$('[data-keep]').forEach(el => { const k = keep[el.dataset.keep]; if (k) { el.scrollLeft = k[0]; el.scrollTop = k[1]; } });
  if (fid) { let el = null; try { el = document.querySelector(fid); } catch (_) {} if (el && el !== document.activeElement) { try { el.focus({preventScroll: true}); } catch (_) {} } }
}
function renderChrome() {
  $$('#nav a').forEach(a => { if (a.dataset.v === S.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const d = S.db ? dueLists() : {over: [], today: []};
  const due = d.over.length + d.today.length;
  const nt = $('#n-today'); nt.textContent = due ? String(due) : ''; nt.className = 'n' + (d.over.length ? ' due' : '');
  $('#n-base').textContent = S.leads.length ? String(S.leads.length) : '';
  const pl = curPlan();
  $('#n-outing').textContent = pl && (pl.leads || []).length ? String(pl.leads.length) : '';
  const n = $('#sysnote');
  let t = '', warn = false;
  if (S.dbState === 'none') t = 'База открывается только на claude.ai под твоим аккаунтом. Справка, скрипты, КП и демо работают и без неё.';
  else if (S.err) { t = S.err === 'revoked' ? 'Доступ к базе для этого окна закрыт.' : 'Связь с базой прервалась. Обнови страницу чуть позже.'; warn = true; }
  else if (S.readOnly) t = 'Только просмотр: в этом окне базу менять нельзя.';
  else if (S.timeout && !S.got.leads) { t = S.leads.length ? 'База отвечает медленно, данные могут быть неполными.' : 'База пока не отвечает. Проверь интернет.'; warn = true; }
  else if (S.cached && S.leads.length) t = 'Показана сохранённая копия, жду свежие данные…';
  n.textContent = t; n.className = 'wrap sysnote' + (warn ? ' warn' : ''); n.hidden = !t;
}
const loading = () => S.dbState === 'init' || (S.dbState === 'ok' && !S.got.leads && !S.leads.length && !S.err);
function emptyBox(title, text, cls) { return `<div class="empty${cls ? ' ' + cls : ''}"><b>${esc(title)}</b>${text}</div>`; }
function noDbBox() {
  if (loading()) return emptyBox(S.timeout ? 'База пока не отвечает' : 'Загружаю базу…', S.timeout ? 'Проверь интернет. Если страница открыта не на claude.ai, база не загрузится.' : 'Лиды, история и выходы подтянутся через секунду.');
  if (S.err && !S.leads.length) return emptyBox('База недоступна', 'Попробуй открыть страницу заново чуть позже.');
  return emptyBox('База не открылась в этом окне', 'Лиды хранятся в базе страницы. Она работает, когда страница открыта на claude.ai под твоим аккаунтом. Справка, скрипты, КП и демо работают и без неё.');
}
const needDb = () => !S.db || (loading() && !S.leads.length);
const leadOptions = (sel, empty) => `<option value="">${esc(empty || '— без лида —')}</option>` + S.leads.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pl')).map(l => `<option value="${esc(l.id)}"${l.id === sel ? ' selected' : ''}>${esc(l.name || 'Без названия')}${l.city ? ' · ' + esc(l.city) : ''}</option>`).join('');
const langCtl = (act, cur, langs) => `<div class="seg-ctl" role="group" aria-label="Язык">${(langs || ['pl', 'ua', 'ru', 'en']).map(k => `<button type="button" data-act="${act}" data-v="${k}" aria-pressed="${cur === k}">${P.LANGS[k]}</button>`).join('')}</div>`;
const statusPill = l => `<span class="pill"><span class="dot s-${stOf(l)}"></span>${esc(stT(stOf(l)))}</span>`;
const tagChips = (l, max) => { const t = tagsOf(l); const shown = max ? t.slice(0, max) : t; return shown.map(k => `<span class="tg${P.TAGS[k].w < 0 ? ' neg' : ''}">${esc(P.TAGS[k].t)}</span>`).join('') + (max && t.length > max ? `<span class="tg">+${t.length - max}</span>` : ''); };
const dateSpan = s => { if (!s) return ''; const t = today(); return `<span class="date${s < t ? ' over' : s === t ? ' today' : ''}">${esc(rel(s))}</span>`; };
const cityOptions = sel => { const known = P.CITIES.map(c => c.n); const all = known.concat(S.leads.map(l => l.city).filter(c => c && !known.includes(c))); return Array.from(new Set(all)).map(c => `<option value="${esc(c)}"${c === sel ? ' selected' : ''}>${esc(c)}</option>`).join(''); };
