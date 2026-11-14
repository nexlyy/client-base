// обработчики
const ACT = {}, CH = {}, IN = {}, FORM = {};
const DR0 = () => ({id: null, tab: 'over', del: false, actDel: null, last: null, lang: null});
const lsFilters = () => lsSet('filters', {seg: S.f.seg, st: S.f.st, city: S.f.city, tag: S.f.tag, sort: S.f.sort, mode: S.f.mode});
const go = v => { if (location.hash === '#' + v) route(); else location.hash = v; };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const pkOrder = id => P.PACKAGES.findIndex(p => p.id === id);
const normUrl = s => { s = String(s || '').trim(); if (!s) return ''; return safeUrl(/^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '')); };
function stripNulls(o) {
  if (!isObj(o)) return o;
  const out = {};
  for (const k of Object.keys(o)) { const v = o[k]; if (v == null) continue; out[k] = isObj(v) ? stripNulls(v) : v; }
  return out;
}
function applyCfg() { CFG = deepMerge(clone(P.DEFAULTS), stripNulls(clone(S.setDoc || {}))); }
const docsOf = snap => (snap && snap.docs ? snap.docs : []).map(d => { let x = {}; try { x = clone(d.data()) || {}; } catch (_) {} x.id = d.id; return x; });
function resync(col) {
  col = col || 'leads';
  const key = {leads: 'leads', outings: 'outings'}[col];
  if (!S.db || !key) return;
  try { S.db.collection(col).get().then(snap => { S[key] = docsOf(snap); scheduleRender(); }, () => {}); } catch (_) {}
}
function saveAct(id, patch) {
  if (!canEdit()) return Promise.resolve(false);
  return enqueue('activity/' + id, () => withRetry(() => S.db.collection('activity').doc(id).update(patch))).then(() => true, e => { onWriteError(e); return false; });
}
function planDate() {
  const d = new Date();
  if (d.getDay() >= 1 && d.getDay() <= 5 && d.getHours() < 16) return today();
  do d.setDate(d.getDate() + 1); while (d.getDay() === 0 || d.getDay() === 6);
  return ymd(d);
}

// карточка лида
function openDrawer(id, tab, opener) {
  commitActive();
  const last = S.dr.id ? S.dr.last : (opener ? focusKey(opener) : '');
  S.dr = Object.assign(DR0(), {id, tab: tab || 'over', last});
  S.form = {type: 'visit', text: '', date: today()};
  render();
  const c = $('#dr-close'); if (c) c.focus({preventScroll: true});
}
function closeDrawer() {
  if (!S.dr.id) return;
  commitActive();
  const back = S.dr.last;
  S.dr = DR0();
  render();
  if (back) { let el = null; try { el = document.querySelector(back); } catch (_) {} if (el) el.focus({preventScroll: true}); }
}
ACT.open = b => openDrawer(b.dataset.id, 'over', b);
ACT['close-dr'] = () => closeDrawer();
ACT['dr-tab'] = b => { S.dr.tab = b.dataset.v; S.dr.del = false; S.dr.actDel = null; render(); };
ACT['dr-lang'] = b => { S.dr.lang = b.dataset.v; render(); };
ACT['new-lead'] = b => {
  if (!guard()) return;
  commitActive();
  S.dr = Object.assign(DR0(), {id: 'new', last: focusKey(b)});
  S.nf.dupOk = false;
  render();
  const n = $('#nf-name'); if (n) n.focus();
};

// Поля карточки сохраняются при уходе из поля и через 1,5 с после паузы в наборе.
const lfTimers = {};
function lfValue(el) {
  const f = el.dataset.lf;
  if (el.type === 'checkbox') return el.checked;
  const v = el.value;
  if (f === 'value') return v === '' ? null : Math.max(0, Math.round(+v || 0));
  if (f === 'priority') return +v || 3;
  return el.tagName === 'TEXTAREA' ? v.replace(/\s+$/, '') : v.trim();
}
function leadFieldChange(el, id) {
  id = id || S.dr.id;
  const f = el.dataset.lf, k = id + '/' + f;
  if (lfTimers[k]) { clearTimeout(lfTimers[k].t); delete lfTimers[k]; }
  const l = leadById(id);
  if (!l) return;
  if (!canEdit()) return;
  let v = lfValue(el);
  if ((f === 'site' || f === 'maps') && v) { const u = normUrl(v); if (!u) { toast('Ссылка должна начинаться с https://', true); return; } v = u; if (el.value !== v) el.value = v; }
  const cur = l[f] == null ? (typeof v === 'boolean' ? false : (f === 'value' ? null : '')) : l[f];
  if (cur === v) return;
  if (f === 'name' && !v) { toast('Название не может быть пустым.', true); el.value = l.name || ''; return; }
  const patch = {[f]: v};
  if (f === 'consent' && v && !l.consentDate) patch.consentDate = today();
  Object.assign(l, patch);
  saveLead(id, patch).then(ok => { if (!ok) resync(); });
  if (el.type === 'checkbox') render();
  else if (['segment', 'priority', 'value', 'nextDate', 'name', 'city', 'address', 'kind', 'rating'].includes(f)) scheduleRender();
}
function lfDebounce(el) {
  const id = S.dr.id, f = el.dataset.lf, k = id + '/' + f;
  if (!leadById(id)) return;
  if (lfTimers[k]) clearTimeout(lfTimers[k].t);
  lfTimers[k] = {el, id, t: setTimeout(() => { delete lfTimers[k]; if (f === 'name' && !el.value.trim()) return; leadFieldChange(el, id); }, 1500)};
}
function flushLf() { Object.keys(lfTimers).forEach(k => { const x = lfTimers[k]; leadFieldChange(x.el, x.id); }); }

function settingChange(el) {
  const path = el.dataset.set;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.type === 'number') v = el.value === '' ? null : Math.max(0, Math.round(+el.value || 0));
  else v = el.value.trim();
  if (/^cases\./.test(path) && v) { const u = normUrl(v); if (!u) { toast('Ссылка должна начинаться с https://', true); return; } v = u; }
  if (path === 'profile.portfolio' && v) { const u = normUrl(v); if (u) v = u; }
  const cur = getPath(CFG, path);
  const curN = cur === undefined ? (el.type === 'number' ? null : (el.type === 'checkbox' ? false : '')) : cur;
  if (curN === v) return;
  if (!guard()) return;
  S.setDoc = deepMerge(clone(S.setDoc || {}), nestPatch(path, v));
  applyCfg();
  saveSettings(nestPatch(path, v)).then(ok => { if (ok) toast('Сохранено'); });
  scheduleRender();
}
function commitActive() {
  const a = document.activeElement;
  if (!a || !a.dataset) return;
  if (a.dataset.lf) leadFieldChange(a, S.dr.id);
  else if (a.dataset.set) settingChange(a);
  else if (a.dataset.ch === 'run-how') CH['run-how'](a);
}

async function changeStatus(l, to, src) {
  if (!guard()) { render(); return false; }
  const from = stOf(l);
  if (from === to) return true;
  const extra = {};
  if (to === 'lost' && (l.next || l.nextDate)) { extra.next = ''; extra.nextDate = ''; }
  const p = setStatus(Object.assign({}, l), to, extra);
  Object.assign(l, extra, {status: to});
  if (to === 'won') l.wonAt = today();
  if (from === 'won') l.wonAt = '';
  if (to === 'lost') { l.lostAt = today(); l.lostFrom = from; }
  if (from === 'lost') { l.lostReason = ''; l.lostAt = ''; }
  render();
  const ok = await p;
  if (!ok) { resync(); return false; }
  if (to === 'won') {
    toast(+l.value ? 'Новый клиент! ' + fmtZl(l.value) + ' в выручке месяца.' : 'Новый клиент! Впиши сумму сделки в карточке, чтобы она попала в выручку.');
    if (src !== 'drawer' && !+l.value) openDrawer(l.id, 'over');
  } else if (to === 'lost') {
    toast('Отказ записан. Укажи причину в карточке: из причин складывается статистика.');
    if (src !== 'drawer') openDrawer(l.id, 'over');
  } else toast('«' + (l.name || 'Лид') + '» → ' + stT(to));
  return true;
}
ACT.advance = b => { const l = leadById(b.dataset.id); const nx = l && NEXT_ST[stOf(l)]; if (nx) changeStatus(l, nx, 'board'); };
CH['lead-status'] = el => { const l = leadById(S.dr.id); if (l) changeStatus(l, el.value, 'drawer'); };

const LINK_TAGS = ['insta', 'fb', 'aggregator', 'rented', 'oldsite', 'deaddomain'];
ACT.tag = async b => {
  const l = leadById(S.dr.id); if (!l || !guard()) return;
  const t = b.dataset.tag, cur = tagsOf(l);
  let tags;
  if (cur.includes(t)) tags = cur.filter(x => x !== t);
  else {
    tags = cur.concat(t);
    if (t === 'nosite') tags = tags.filter(x => !LINK_TAGS.includes(x));
    if (LINK_TAGS.includes(t)) tags = tags.filter(x => x !== 'nosite');
  }
  tags.sort((a, c) => P.TAG_ORDER.indexOf(a) - P.TAG_ORDER.indexOf(c));
  l.tags = tags; render();
  if (!(await saveLead(l.id, {tags}))) resync();
};
ACT.pk = async b => {
  const l = leadById(S.dr.id); if (!l || !guard()) return;
  const id = b.dataset.pk, cur = Array.isArray(l.packages) ? l.packages.filter(pkById) : [];
  const packages = (cur.includes(id) ? cur.filter(x => x !== id) : cur.concat(id)).sort((a, c) => pkOrder(a) - pkOrder(c));
  l.packages = packages; render();
  if (!(await saveLead(l.id, {packages}))) resync();
};
ACT['site-tags'] = async () => {
  const l = leadById(S.dr.id); if (!l || !guard()) return;
  const auto = tagsFromSite(l.site);
  const tags = tagsOf(l).filter(t => !SITE_TAGS.includes(t) && !(auto.includes('nosite') && LINK_TAGS.includes(t))).concat(auto)
    .sort((a, c) => P.TAG_ORDER.indexOf(a) - P.TAG_ORDER.indexOf(c));
  l.tags = tags; render();
  if (await saveLead(l.id, {tags})) toast(auto.length ? 'По ссылке: ' + auto.map(t => P.TAGS[t].t).join(', ') + '.' : 'Ссылка ведёт на собственный сайт, теги ссылки сняты.');
  else resync();
};
ACT['lead-del'] = () => { S.dr.del = true; render(); const y = $('[data-act="lead-del-yes"]'); if (y) y.focus(); };
ACT['lead-del-no'] = () => { S.dr.del = false; render(); };
ACT['lead-del-yes'] = async () => {
  const id = S.dr.id, l = leadById(id); if (!l || !guard()) return;
  const name = l.name || 'Лид';
  const acts = actsOf(id).map(a => a.id);
  const pls = plans().filter(o => (o.leads || []).includes(id));
  S.dr = DR0();
  S.leads = S.leads.filter(x => x.id !== id);
  S.acts = S.acts.filter(a => a.leadId !== id);
  render();
  if (!(await delDoc('leads', id))) { resync(); return; }
  for (const o of pls) saveOuting(o.id, {leads: (o.leads || []).filter(x => x !== id)});
  await Promise.all(acts.map(aid => delDoc('activity', aid)));
  toast('«' + name + '» удалён вместе с историей.');
};
ACT['act-del'] = b => { S.dr.actDel = b.dataset.id; render(); const y = $('[data-act="act-del-yes"]'); if (y) y.focus(); };
ACT['act-del-no'] = () => { S.dr.actDel = null; render(); };
ACT['act-del-yes'] = async b => {
  const id = b.dataset.id;
  S.dr.actDel = null;
  S.acts = S.acts.filter(a => a.id !== id);
  render();
  if (await delDoc('activity', id)) toast('Запись удалена.');
};
FORM.act = async () => {
  const l = leadById(S.dr.id); if (!l || !guard()) return;
  const type = S.form.type || 'note', text = String(S.form.text || '').trim(), date = S.form.date || today();
  if (!text && type === 'note') { toast('Напиши, что было.', true); const t = $('#af-text'); if (t) t.focus(); return; }
  const id = await addAct({leadId: l.id, type, text, date});
  if (!id) return;
  if (!S.acts.some(a => a.id === id)) S.acts.unshift({id, leadId: l.id, type, text, date, created: nowIso()});
  S.form.text = '';
  if (['visit', 'talk', 'call', 'meeting', 'msg'].includes(type) && stOf(l) === 'new') await changeStatus(l, 'contact', 'drawer');
  else { render(); toast('Добавлено в историю.'); }
};
ACT.copy = b => { const el = document.getElementById(b.dataset.src); if (el) copyText(el.textContent.trim(), 'Скопировано', b); };

// сегодня и база
ACT['due-done'] = async b => {
  const l = leadById(b.dataset.id); if (!l || !guard()) return;
  const what = String(l.next || '').trim();
  Object.assign(l, {next: '', nextDate: ''});
  render();
  addAct({leadId: l.id, type: 'note', text: 'Сделано' + (what ? ': ' + what : '')});
  if (await saveLead(l.id, {next: '', nextDate: ''})) toast(stOf(l) === 'new' ? 'Отмечено.' : 'Отмечено. Задай следующий шаг в карточке, чтобы лид не потерялся.');
  else resync();
};
ACT.snooze = async b => {
  const l = leadById(b.dataset.id); if (!l || !guard()) return;
  const d = addDays(today(), 2);
  l.nextDate = d; render();
  if (await saveLead(l.id, {nextDate: d})) toast('Перенесено на ' + fmtD(d) + '.'); else resync();
};
ACT['f-st'] = b => { S.f.st = b.dataset.v; lsFilters(); render(); };
ACT['f-mode'] = b => { S.f.mode = b.dataset.v; lsFilters(); render(); };
CH.f = el => { S.f[el.dataset.k] = el.value; lsFilters(); render(); };
IN['f-q'] = el => { S.f.q = el.value; const host = $('#base-list'); if (host) host.innerHTML = baseList(); };
ACT.csv = () => exportCsv();
ACT.json = () => exportJson();
ACT['go-offer'] = b => {
  const l = leadById(b.dataset.id);
  S.kp.lead = l ? l.id : ''; S.kp.pk = null; S.kp.num = '';
  if (l) S.kp.lang = leadLang(l);
  S.dr = DR0();
  go('offer');
};
ACT['go-demo'] = b => {
  S.demo.lead = b.dataset.id; S.demo.style = ''; S.demo.layout = ''; S.demo.lang = 'pl';
  S.dr = DR0();
  go('demo');
};

// быстрое добавление
function buildLead(f, src) {
  const cat = P.CATS.find(c => c.id === f.cat) || null;
  let tags = Array.from(new Set(tagsFromSite(f.site).concat(f.extra || [])));
  if (tags.some(t => LINK_TAGS.includes(t))) tags = tags.filter(t => t !== 'nosite');
  tags.sort((a, c) => P.TAG_ORDER.indexOf(a) - P.TAG_ORDER.indexOf(c));
  const seg = P.SEG[f.seg] ? f.seg : (cat ? cat.seg : 'other');
  const lead = {
    name: String(f.name || '').trim(), kind: String(f.kind || (cat ? cat.t : '')).trim(), segment: seg,
    city: String(f.city || '').trim(), address: String(f.address || '').trim(), rating: String(f.rating || '').trim(),
    site: normUrl(f.site), maps: normUrl(f.maps), lang: !!f.lang, tags,
    status: 'new', priority: tags.includes('chain') ? 3 : 2, next: '', nextDate: '', notes: '', packages: [],
    now: tags.filter(t => P.TAGS[t].d).map(t => P.TAGS[t].t).join(', '), pitch: '', cat: f.cat || '',
    source: src === 'hunt' ? 'Google Maps' : 'Вручную'
  };
  lead.pitch = suggestPk(lead).map(id => pkById(id).n.ru).join(', ');
  return lead;
}
FORM['new-lead'] = async form => {
  if (!guard()) return;
  const ctx = form.dataset.ctx, nf = S.nf;
  const err = $('#nf-err');
  const showErr = t => { if (err) { err.textContent = t; err.hidden = false; } };
  const name = String(nf.name || '').trim();
  if (!name) { showErr('Впиши название.'); const n = $('#nf-name'); if (n) n.focus(); return; }
  const city = String(nf.city || '').trim();
  const dup = S.leads.find(l => norm(l.name) === norm(name) && (!city || !l.city || norm(l.city) === norm(city)));
  if (dup && !nf.dupOk) { nf.dupOk = true; showErr('«' + dup.name + '» уже есть в базе' + (dup.city ? ' (' + dup.city + ')' : '') + '. Нажми «Добавить в базу» ещё раз, если это другое место.'); return; }
  const data = buildLead(Object.assign({}, nf, {name, city}), ctx === 'hunt' ? 'hunt' : 'manual');
  const btn = form.querySelector('[type=submit]'); if (btn) btn.disabled = true;
  let id = null;
  try { id = await addLead(data); } catch (e) { onWriteError(e); if (btn) btn.disabled = false; return; }
  if (!leadById(id)) S.leads.push(Object.assign({}, data, {id, created: nowIso(), updated: nowIso()}));
  S.nf = Object.assign({}, nf, {name: '', kind: nf.cat ? nf.kind : '', address: '', rating: '', site: '', maps: '', lang: false, extra: [], dupOk: false});
  toast('«' + name + '» в базе, оценка ' + score(data) + '.');
  if (ctx === 'dr') openDrawer(id, 'over');
  else { render(); const n = $('#nf-name'); if (n) n.focus(); }
};
ACT['nf-tag'] = b => {
  const t = b.dataset.tag, x = S.nf.extra, i = x.indexOf(t);
  if (i >= 0) x.splice(i, 1); else x.push(t);
  b.setAttribute('aria-pressed', String(i < 0));
};
CH['nf-cat'] = el => {
  const prev = P.CATS.find(c => c.id === S.nf.cat), c = P.CATS.find(x => x.id === el.value);
  S.nf.cat = el.value;
  if (c) { S.nf.seg = c.seg; if (!S.nf.kind || (prev && S.nf.kind === prev.t)) S.nf.kind = c.t; }
  render();
};
IN['nf-site'] = () => { const a = $('#nf-auto'); if (a) a.innerHTML = autoTagsHtml(S.nf.site); };

// охота
ACT['hunt-city'] = b => {
  S.hunt.city = b.dataset.v; lsSet('huntCity', S.hunt.city);
  const c = P.CITIES.find(x => x.id === S.hunt.city); if (c) S.nf.city = c.n;
  S.hunt.rows = null;
  render();
};
ACT['hunt-mark'] = b => {
  if (!guard()) return;
  const k = b.dataset.k, v = (CFG.hunt || {})[k] ? null : today();
  S.setDoc = deepMerge(clone(S.setDoc || {}), {hunt: {[k]: v}});
  applyCfg(); render();
  saveSettings({hunt: {[k]: v}});
};
const MAPS_RE = /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|(www\.)?google\.[a-z.]+\/maps)/i;
const URL_RE = /^(https?:\/\/|www\.)|^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i;
function parsePaste(text, cityName) {
  const seen = new Set();
  return String(text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(line => {
    const parts = line.split(/\t|;/).map(s => s.trim());
    const r = {name: parts.shift() || '', address: '', rating: '', site: '', maps: ''};
    for (const p of parts) {
      if (!p) continue;
      if (MAPS_RE.test(p)) { if (!r.maps) r.maps = p; }
      else if (URL_RE.test(p)) { if (!r.site) r.site = p; }
      else if (/^\d[.,]\d/.test(p) && !r.rating) r.rating = p;
      else if (!r.address) r.address = p;
    }
    const key = norm(r.name);
    r.bad = !r.name;
    r.dup = !r.bad && (seen.has(key) || S.leads.some(l => norm(l.name) === key && (!l.city || norm(l.city) === norm(cityName))));
    seen.add(key);
    return r;
  });
}
ACT['hunt-parse'] = () => {
  const city = (P.CITIES.find(c => c.id === S.hunt.city) || P.CITIES[0]).n;
  S.hunt.rows = parsePaste(S.hunt.paste, city);
  if (!S.hunt.rows.length) { S.hunt.rows = null; toast('Вставь хотя бы одну строку.', true); }
  render();
};
ACT['hunt-import'] = async () => {
  if (!guard() || S.hunt.busy) return;
  const rows = (S.hunt.rows || []).filter(r => !r.dup && !r.bad);
  if (!rows.length) return;
  const city = (P.CITIES.find(c => c.id === S.hunt.city) || P.CITIES[0]).n;
  const cat = P.CATS.find(c => c.id === S.hunt.pasteCat) || P.CATS[0];
  S.hunt.busy = true; render();
  let n = 0;
  for (const r of rows) {
    const data = buildLead({name: r.name, address: r.address, rating: r.rating, site: r.site, maps: r.maps, city, cat: cat.id, seg: cat.seg, kind: cat.t, lang: false, extra: []}, 'hunt');
    try { const id = await addLead(data); n++; if (!leadById(id)) S.leads.push(Object.assign({}, data, {id})); }
    catch (e) { onWriteError(e); break; }
  }
  S.hunt.busy = false; S.hunt.rows = null; S.hunt.paste = '';
  render();
  toast('Добавлено в базу: ' + n + '.');
};
ACT['hunt-clear'] = () => { S.hunt.rows = null; S.hunt.paste = ''; render(); };

// выход
ACT['plan-add'] = async b => {
  const id = b.dataset.id;
  if (!guard()) return;
  if (inPlan(id)) { toast('Уже в выходе.'); return; }
  const pl = curPlan();
  if (pl) {
    const leads = (pl.leads || []).concat(id);
    pl.leads = leads; render();
    if (await saveOuting(pl.id, {leads})) toast('Добавлено в выход ' + rel(pl.date) + (leads.length > 5 ? '. Мест уже ' + leads.length + ': для одного выхода много.' : '.'));
    else resync('outings');
  } else {
    const date = planDate();
    const nid = await newOuting({date, leads: [id]});
    if (!nid) return;
    if (!S.outings.some(o => o.id === nid)) S.outings.push({id: nid, date, leads: [id], done: false, results: {}, created: nowIso()});
    render();
    toast('Создан выход на ' + fmtD(date) + ', место добавлено.');
  }
};
ACT['plan-new'] = async () => {
  const date = planDate();
  const id = await newOuting({date});
  if (!id) return;
  if (!S.outings.some(o => o.id === id)) S.outings.push({id, date, leads: [], done: false, results: {}, created: nowIso()});
  render();
  toast('Выход создан на ' + fmtD(date) + '.');
};
ACT['plan-rm'] = async b => {
  const o = S.outings.find(x => x.id === b.dataset.id); if (!o || !guard()) return;
  const leads = (o.leads || []).filter(x => x !== b.dataset.lead);
  o.leads = leads; render();
  if (!(await saveOuting(o.id, {leads}))) resync('outings');
};
ACT['plan-del'] = b => { S.plan.del = b.dataset.id; render(); const y = $('[data-act="plan-del-yes"]'); if (y) y.focus(); };
ACT['plan-del-no'] = () => { S.plan.del = null; render(); };
ACT['plan-del-yes'] = async b => {
  const id = b.dataset.id;
  S.plan.del = null;
  S.outings = S.outings.filter(o => o.id !== id);
  render();
  if (await delDoc('outings', id)) toast('Выход удалён.'); else resync('outings');
};
CH['plan-date'] = async el => {
  const o = S.outings.find(x => x.id === el.dataset.id); if (!o || !el.value || !guard()) return;
  o.date = el.value;
  if (await saveOuting(o.id, {date: el.value})) scheduleRender(); else resync('outings');
};
CH['plan-city'] = el => { S.plan.city = el.value; render(); };

ACT['run-start'] = b => {
  const o = S.outings.find(x => x.id === b.dataset.id); if (!o || !guard()) return;
  const stops = (o.leads || []).filter(leadById);
  const first = stops.findIndex(id => !(o.results || {})[id]);
  S.run = {id: o.id, i: first < 0 ? stops.length : first, lostFor: null, notes: {}, how: {}, lang: null};
  for (const a of S.acts) if (a.outingId === o.id && a.type === 'visit' && a.text) S.run.notes[a.leadId] = a.text;
  if (S.view !== 'outing') go('outing'); else { render(); window.scrollTo(0, 0); }
};
function runSaveNotes() {
  const o = S.outings.find(x => x.id === S.run.id); if (!o || !canEdit()) return;
  for (const [lid, text] of Object.entries(S.run.notes)) {
    const t = String(text || '').trim();
    const va = S.acts.find(a => a.type === 'visit' && a.outingId === o.id && a.leadId === lid);
    if (va && (va.text || '') !== t) { va.text = t; saveAct(va.id, {text: t}); }
  }
}
ACT['run-go'] = b => { runSaveNotes(); S.run.i = +b.dataset.v; S.run.lostFor = null; S.run.lang = null; render(); window.scrollTo(0, 0); };
ACT['run-exit'] = () => { runSaveNotes(); S.run.id = null; render(); };
ACT['run-lang'] = b => { S.run.lang = b.dataset.v; render(); };
ACT['run-finish'] = async () => {
  const o = S.outings.find(x => x.id === S.run.id); if (!o || !guard()) return;
  runSaveNotes();
  const n = Object.keys(o.results || {}).length, all = (o.leads || []).length;
  S.run.id = null;
  o.done = true; o.doneAt = today();
  render();
  if (await saveOuting(o.id, {done: true, doneAt: today()})) toast('Выход завершён: отмечено ' + n + ' из ' + all + '.');
  else resync('outings');
};
const RES_RULE = {
  absent: {next: 'Зайти ещё раз и застать владельца', days: 2},
  talked: {status: 'contact', next: 'Вернуться с примером', days: 7},
  interested: {status: 'talk', next: 'Показать черновик сайта', days: 3},
  refused: {status: 'lost'}
};
async function runResult(id, r) {
  const o = S.outings.find(x => x.id === S.run.id), l = leadById(id), rule = RES_RULE[r];
  if (!o || !l || !rule || !guard()) return;
  const prev = (o.results || {})[id];
  const notes = String(S.run.notes[id] || '').trim();
  const was = stOf(l);
  // Каким лид был до первой отметки в этом выходе. От этого снимка считаем и при исправлении:
  // нажали «Интересно!» вместо «Поговорили» — статус и шаг вернутся к правильным, а не застрянут на ошибке.
  const saved = (o.base || {})[id];
  const snap = saved || (prev ? null : {status: was, next: String(l.next || ''), nextDate: l.nextDate || ''});
  let base, bNext, bDate;
  if (snap) {
    base = snap.status in P.RANK ? snap.status : 'new';
    bNext = String(snap.next || '').trim(); bDate = snap.nextDate || '';
  } else { // снимка нет: считаем от текущего состояния
    base = prev === 'refused' && was === 'lost' ? (l.lostFrom in P.RANK && l.lostFrom !== 'lost' ? l.lostFrom : 'new') : was;
    bNext = String(l.next || '').trim(); bDate = l.nextDate || '';
  }
  let to = base;
  if (r === 'refused') to = 'lost';
  else if (rule.status && P.RANK[rule.status] > P.RANK[base]) to = rule.status;
  const d = rule.days ? addDays(today(), rule.days) : '';
  let extra;
  if (r === 'refused') extra = {next: '', nextDate: '', lostFrom: base !== 'lost' ? base : (l.lostFrom || 'new')};
  else if (bNext && (!rule.status || P.RANK[base] > P.RANK[rule.status])) {
    // Шаг, назначенный до визита, остаётся: «не застали» его не отменяет, а лида, который уже дальше по воронке, не откатываем к общему шагу.
    extra = {next: bNext, nextDate: r === 'absent' ? (bDate > d ? bDate : d) : (bDate > today() ? bDate : d)};
  } else extra = {next: rule.next, nextDate: d};
  const p = setStatus(Object.assign({}, l), to, extra, {outingId: o.id});
  Object.assign(l, extra, {status: to});
  if (to === 'lost' && was !== 'lost') l.lostAt = today();
  if (was === 'lost' && to !== 'lost') { l.lostReason = ''; l.lostAt = ''; }
  o.results = Object.assign({}, o.results || {}, {[id]: r});
  const opatch = {results: {[id]: r}};
  if (!saved && snap) { o.base = Object.assign({}, o.base || {}, {[id]: snap}); opatch.base = {[id]: snap}; }
  S.run.lostFor = r === 'refused' ? id : null;
  render();
  saveOuting(o.id, opatch);
  if (!(await p)) { resync(); return; }
  const va = S.acts.find(a => a.type === 'visit' && a.outingId === o.id && a.leadId === id);
  if (va) { va.result = r; va.text = notes; await saveAct(va.id, {result: r, text: notes}); }
  else {
    const aid = await addAct({leadId: id, type: 'visit', result: r, text: notes, outingId: o.id});
    if (aid && !S.acts.some(a => a.id === aid)) S.acts.unshift({id: aid, leadId: id, type: 'visit', result: r, text: notes, outingId: o.id, date: today(), created: nowIso()});
  }
  const head = {absent: 'Не застали.', talked: 'Познакомились.', interested: 'Есть интерес!'}[r];
  toast(r === 'refused' ? 'Отказ записан. Выбери причину.' : head + ' Дальше: «' + extra.next + '», ' + rel(extra.nextDate) + '.');
}
ACT['run-res'] = b => runResult(b.dataset.id, b.dataset.v);
ACT['run-lost'] = async b => {
  const l = leadById(b.dataset.id); if (!l || !guard()) return;
  const reason = b.dataset.v;
  l.lostReason = reason; S.run.lostFor = null; render();
  if (await saveLead(l.id, {lostReason: reason})) toast('Причина отказа: ' + ((P.LOST.find(x => x.k === reason) || {}).t || '') + '.');
  else resync();
};
CH['run-consent'] = async el => {
  const l = leadById(el.dataset.id); if (!l) return;
  if (!guard()) { render(); return; }
  const v = el.checked, patch = {consent: v};
  if (v) {
    patch.consentDate = l.consentDate || today();
    patch.consentHow = String(S.run.how[l.id] != null ? S.run.how[l.id] : (l.consentHow || '')).trim();
  }
  Object.assign(l, patch); render();
  if (await saveLead(l.id, patch)) toast(v ? 'Согласие на связь отмечено: этому месту теперь можно писать.' : 'Согласие снято.');
  else resync();
};
CH['run-how'] = async el => {
  const l = leadById(el.dataset.id); if (!l) return;
  const v = el.value.trim();
  S.run.how[l.id] = v;
  if (l.consent && v !== (l.consentHow || '') && canEdit()) { l.consentHow = v; if (!(await saveLead(l.id, {consentHow: v}))) resync(); }
};

// скрипты, КП, демо, итоги, справка
ACT['scr-lang'] = b => { S.scr.lang = b.dataset.v; render(); };
CH['scr-lead'] = el => { S.scr.lead = el.value; const l = leadById(el.value); if (l) S.scr.lang = leadLang(l); render(); };

ACT['kp-lang'] = b => { S.kp.lang = b.dataset.v; S.kp.num = ''; render(); };
CH['kp-lead'] = el => { S.kp.lead = el.value; S.kp.pk = null; S.kp.num = ''; const l = leadById(el.value); if (l) S.kp.lang = leadLang(l); render(); };
CH['kp-pk'] = el => {
  const id = el.value, pk = Array.isArray(S.kp.pk) ? S.kp.pk.filter(x => x !== id) : [];
  if (el.checked) pk.push(id);
  S.kp.pk = pk.sort((a, c) => pkOrder(a) - pkOrder(c));
  S.kp.num = '';
  kpUpdate();
};
IN['kp-upd'] = debounce(() => kpUpdate(), 200);
ACT['kp-dl'] = async () => {
  const o = kpOpts();
  if (!o.name) { toast('Впиши название заведения или выбери лида.', true); return; }
  await saveFile('KP-' + slug(o.name) + '-' + o.date + '.html', kpFile(o, buildKp(o)));
};
ACT['kp-copy'] = b => {
  const o = kpOpts();
  if (!o.name) { toast('Впиши название заведения или выбери лида.', true); return; }
  copyText(buildKp(o).text, 'Текст КП скопирован', b);
};
ACT['kp-log'] = async () => {
  const o = kpOpts(), l = o.lead;
  if (!l || !guard()) return;
  if (!o.pk.length) { toast('Отметь хотя бы один пакет.', true); return; }
  const b = buildKp(o);
  const names = o.pk.map(pkById).filter(Boolean).map(p => p.n.ru).join(', ');
  const st = stOf(l);
  const to = st === 'won' ? 'won' : (P.RANK[st] < 3 ? 'offer' : st);
  const extra = {packages: o.pk.slice(), next: 'Узнать решение по ' + o.number, nextDate: addDays(today(), 4)};
  if (!(+l.value) && b.once) extra.value = b.once;
  const aid = await addAct({leadId: l.id, type: 'offer', text: o.number + ' · ' + names + (b.once ? ' · от ' + fmtZl(b.once) : '') + (b.monthly ? ' + ' + fmtZl(b.monthly) + '/мес' : '') + ' · ' + P.LANG_NAME[o.lang]});
  if (!aid) return;
  if (!S.acts.some(a => a.id === aid)) S.acts.unshift({id: aid, leadId: l.id, type: 'offer', date: today(), created: nowIso(), text: o.number});
  S.kp.num = o.number;
  const p = setStatus(Object.assign({}, l), to, extra);
  Object.assign(l, extra, {status: to});
  if (st === 'lost') { l.lostReason = ''; l.lostAt = ''; }
  render();
  if (await p) toast(o.number + ' записано. Через 4 дня напомню узнать решение.'); else resync();
};

CH['demo-lead'] = el => { S.demo.lead = el.value; S.demo.style = ''; S.demo.layout = ''; render(); };
CH['demo-style'] = el => { S.demo.style = el.value; S.demo.layout = ''; render(); };
ACT['demo-layout'] = b => { S.demo.layout = b.dataset.v; render(); };
ACT['demo-dev'] = b => { S.demo.dev = b.dataset.v; render(); };
ACT['demo-lang'] = b => { S.demo.lang = b.dataset.v; render(); };
ACT['demo-full'] = () => { S.demo.full = true; render(); };
ACT['demo-close'] = () => { S.demo.full = false; render(); const b = $('button[data-act="demo-full"]'); if (b) b.focus({preventScroll: true}); };
ACT['demo-dl'] = async () => { const cfg = demoCfg(); await saveFile('demo-' + slug(cfg.name) + '.html', demoFile(cfg)); };
IN['demo-upd'] = debounce(() => mountDemo(), 200);

ACT['stats-table'] = () => { S.stats.table = !S.stats.table; render(); };
ACT.scrollto = b => { const el = document.getElementById(b.dataset.to); if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'}); };

// выгрузка
function csvCell(v) { const s = Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function exportCsv() {
  const cols = [
    ['Название', l => l.name], ['Статус', l => stT(stOf(l))], ['Оценка', l => score(l)], ['Сегмент', l => P.SEG[segOf(l)]],
    ['Что за место', l => l.kind], ['Город', l => l.city], ['Адрес', l => l.address], ['Рейтинг', l => l.rating],
    ['Теги', l => tagsOf(l).map(t => P.TAGS[t].t)], ['Пакеты', l => (Array.isArray(l.packages) ? l.packages : []).map(pkById).filter(Boolean).map(p => p.n.ru)],
    ['Сумма, zł', l => l.value == null ? '' : l.value], ['Следующий шаг', l => l.next], ['Когда', l => l.nextDate],
    ['Кто решает', l => l.decider], ['Согласие на связь', l => l.consent ? 'да' + (l.consentDate ? ', ' + l.consentDate : '') + (l.consentHow ? ', ' + l.consentHow : '') : 'нет'],
    ['Причина отказа', l => stOf(l) === 'lost' ? ((P.LOST.find(x => x.k === l.lostReason) || {}).t || '') : ''],
    ['Google Maps', l => l.maps], ['Сайт', l => l.site], ['Сейчас', l => l.now], ['Предложить', l => l.pitch], ['Заметки', l => l.notes],
    ['Создан', l => String(l.created || '').slice(0, 10)], ['Обновлён', l => String(l.updated || '').slice(0, 10)]
  ];
  const list = S.leads.slice().sort((a, b) => score(b) - score(a));
  const rows = [cols.map(c => c[0])].concat(list.map(l => cols.map(c => c[1](l))));
  saveFile('klienty-' + today() + '.csv', '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n'));
}
function exportJson() {
  const data = {app: 'client-base', version: 2, exported: nowIso(), leads: S.leads, activity: S.acts, outings: S.outings, settings: S.setDoc || {}};
  saveFile('client-base-backup-' + today() + '.json', JSON.stringify(data, null, 2));
}

// Claude-помощник
const aiCtl = {};
const AI_RULES = 'Правила: не выдумывай цифры, проценты, отзывы и факты, которых нет в данных. Не обещай рост выручки или заказов в цифрах. Фразы от первого лица пиши без глаголов прошедшего времени, чтобы не выдать пол автора: «делаю», «могу показать», а не «сделал» или «сделала». Не предлагай писать или звонить владельцу без его согласия: в Польше коммерческие сообщения и звонки без согласия запрещены (art. 398 PKE). Без markdown-заголовков и вступлений.';
function leadBrief(l) {
  const acts = actsOf(l.id).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);
  const pks = leadPk(l).map(pkById).filter(Boolean);
  const c = caseOf(P.SEG_CASE[segOf(l)]);
  return [
    'Название: ' + (l.name || '—'),
    'Что за место: ' + (l.kind || P.SEG[segOf(l)]),
    'Город и адрес: ' + (leadPlace(l) || '—'),
    'Рейтинг и отзывы в Google: ' + (l.rating || 'нет данных'),
    'Статус: ' + stT(stOf(l)),
    'Что видно в карточке Google: ' + (tagsOf(l).map(t => P.TAGS[t].t + ' (' + P.TAGS[t].hint + ')').join('; ') || 'ничего особенного'),
    l.now ? 'Заметка «сейчас»: ' + l.now : '',
    l.notes ? 'Заметки: ' + l.notes : '',
    l.decider ? 'Кто решает: ' + l.decider : '',
    'Что можно предложить: ' + pks.map(p => { const pc = priceOf(p); return p.n.ru + ' (от ' + pc.from + ' до ' + pc.to + ' zł' + (p.unit === 'month' ? ' в месяц' : '') + '): ' + p.d.ru; }).join('; '),
    c ? 'Готовая работа, которую можно показать на телефоне: ' + c.name + (c.url ? ' (' + c.url + ')' : '') + '. ' + c.d.ru : '',
    'Владелец говорит по-украински или по-русски: ' + (l.lang ? 'да' : 'нет или неизвестно'),
    'История: ' + (acts.length ? acts.map(a => a.date + ' ' + (P.ACT[a.type] || a.type) + (a.result ? ' (' + (P.RESULT[a.result] || a.result) + ')' : '') + (a.text ? ': ' + a.text : '')).join('; ') : 'контактов ещё не было')
  ].filter(Boolean).join('\n');
}
function aiPrompt(key) {
  const intro = 'Ты помогаешь веб-разработчику из Катовице, который продаёт сайты и Telegram-ботов малому бизнесу в Силезии на личных визитах.\n\n';
  if (key === 'scr') {
    const q = String(S.scr.q || '').trim(); if (!q) return '';
    const l = leadById(S.scr.lead);
    return intro + 'Ситуация на визите или слова владельца: «' + q + '»\n\n'
      + (l ? 'Данные о заведении:\n' + leadBrief(l) + '\n\n' : '')
      + 'Пакеты и цены: ' + P.PACKAGES.map(p => { const pc = priceOf(p); return p.n.ru + ' ' + pc.from + '–' + pc.to + ' zł' + (p.unit === 'month' ? ' в месяц' : ''); }).join('; ') + '\n\n'
      + 'Дай два варианта ответа владельцу на языке: ' + P.LANG_NAME[S.scr.lang] + '. Каждый 1–3 предложения, вежливо и без давления, с конкретным следующим шагом: показать пример, прийти с черновиком, договориться о времени или спросить разрешение написать. После вариантов одной строкой по-русски объясни, почему так.\n' + AI_RULES;
  }
  if (key.indexOf('lead-') === 0) {
    const l = leadById(key.slice(5)); if (!l) return '';
    const lang = S.dr.lang || leadLang(l);
    return intro + 'Данные о заведении:\n' + leadBrief(l) + '\n\n'
      + 'Подготовь заход для визита. Фразы для владельца пиши на языке: ' + P.LANG_NAME[lang] + ', пояснения для меня по-русски.\n'
      + '1) Первая фраза у двери, 2–3 предложения.\n2) Проблема заведения одной фразой, с опорой на данные карточки.\n3) Два вопроса, чтобы владелец сам рассказал, где теряет гостей или время.\n4) Чем закончить визит: конкретный следующий шаг.\n' + AI_RULES;
  }
  return '';
}
function updAi(key) {
  const st = S.ai[key] || {};
  const out = document.getElementById('ai-out-' + key);
  if (!out) return;
  out.textContent = st.text || '';
  const note = document.getElementById('ai-note-' + key);
  if (note) { note.textContent = st.note || ''; note.hidden = !st.note; note.classList.toggle('warn', !!st.warn); }
  const box = out.closest('.ai');
  if (!box) return;
  box.querySelectorAll('[data-act]').forEach(b => {
    const a = b.dataset.act;
    if (a === 'ai-ask' && !b.dataset.fresh) { b.disabled = !!st.busy; b.textContent = st.text && !st.busy ? 'Спросить снова' : 'Спросить'; }
    else if (a === 'ai-ask') b.hidden = !!st.busy || !st.text;
    else if (a === 'ai-stop') b.hidden = !st.busy;
    else if (a === 'ai-copy') b.hidden = !!st.busy || !st.text;
  });
}
async function aiRun(key, fresh) {
  if (!S.sample) return;
  const st = S.ai[key] || (S.ai[key] = {});
  if (st.busy) return;
  const prompt = aiPrompt(key);
  if (!prompt) {
    Object.assign(st, {note: 'Сначала опиши ситуацию в поле выше.', warn: true}); updAi(key);
    const q = document.getElementById('ai-q-' + key); if (q) q.focus();
    return;
  }
  const ctl = new AbortController(); aiCtl[key] = ctl;
  Object.assign(st, {busy: true, text: '', note: 'Думаю…', warn: false}); updAi(key);
  const opts = {signal: ctl.signal, modelTier: 'default', onText: ({text}) => { if (aiCtl[key] !== ctl) return; st.text = text; st.note = ''; updAi(key); }};
  if (fresh) opts.cache = false;
  try {
    const r = await S.sample(prompt, opts);
    st.text = (r && r.text) || st.text;
    st.note = r && r.truncated ? 'Ответ обрезан по длине.' : ''; st.warn = false;
    if (!st.text) { st.note = 'Пустой ответ. Попробуй ещё раз.'; st.warn = true; }
  } catch (e) {
    const c = e && e.code;
    if (e && e.text && !st.text) st.text = e.text;
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) {
      S.sample = null; st.busy = false; aiCtl[key] = null;
      toast(c === 'not_granted' ? 'Без разрешения подсказки Claude не работают. Остальное работает как обычно.' : 'Подсказки Claude в этом окне недоступны.', true);
      render();
      return;
    }
    const stopped = c === 'cancelled' || (e && e.name === 'AbortError');
    st.warn = !stopped;
    st.note = stopped ? 'Остановлено.' : c === 'rate_limited' ? 'Слишком много запросов подряд. Подожди минуту.' : c === 'refused' ? 'Claude не стал отвечать на такой запрос. Переформулируй.' : c === 'prompt_too_large' ? 'Слишком длинный запрос: сократи заметки в карточке.' : c === 'session_expired' ? 'Сессия устарела: обнови страницу.' : 'Ответ не пришёл. Попробуй ещё раз.';
  } finally {
    if (aiCtl[key] === ctl) { st.busy = false; aiCtl[key] = null; updAi(key); }
  }
}
ACT['ai-ask'] = b => aiRun(b.dataset.k, !!b.dataset.fresh);
ACT['ai-stop'] = b => { const c = aiCtl[b.dataset.k]; if (c) c.abort(); };
ACT['ai-copy'] = b => { const st = S.ai[b.dataset.k]; if (st && st.text) copyText(st.text, 'Ответ скопирован', b); };

// подсказки
let tipFor = null;
function showTip(el) {
  const t = el.getAttribute('data-tip'); if (!t) return;
  const tip = $('#tip');
  tip.textContent = t; tip.hidden = false; tipFor = el;
  const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, vw = document.documentElement.clientWidth;
  const x = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2));
  let y = r.top - h - 8; if (y < 8) y = r.bottom + 8;
  tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
}
function hideTip() { const t = $('#tip'); if (t && !t.hidden) t.hidden = true; tipFor = null; }
const tipTarget = e => (e.target && e.target.closest) ? e.target.closest('[data-tip]') : null;

// перетаскивание на доске
let dragId = null;
function endDrag() {
  dragId = null;
  $$('.bc.dragging').forEach(x => x.classList.remove('dragging'));
  $$('.col.drop').forEach(x => x.classList.remove('drop'));
  ptrAt = 0; setTimeout(flush, 0);
}

// маршрут
function route() {
  let h = '';
  try { h = decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (_) {}
  let anchor = '';
  if (ALIAS[h]) { anchor = ALIAS[h][1]; h = ALIAS[h][0]; }
  if (!VIEWS.includes(h)) h = 'today';
  const changed = S.view !== h;
  if (changed) {
    commitActive();
    S.dr = DR0(); S.demo.full = false; S.plan.del = null;
    S.view = h;
  }
  hideTip();
  render();
  if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView({block: 'start'}); }
  else if (changed) window.scrollTo(0, 0);
}

// события
function wire() {
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || b.disabled || b.closest('[inert]')) return;
    const f = ACT[b.dataset.act];
    if (!f) return;
    if (b.tagName === 'A') e.preventDefault();
    hideTip();
    f(b, e);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (!el || !el.dataset) return;
    if (el.dataset.bind) {
      setPath(S, el.dataset.bind, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.bind === 'form.type') render();
    }
    if (el.dataset.lf) leadFieldChange(el, S.dr.id);
    if (el.dataset.set) settingChange(el);
    if (el.dataset.ch && CH[el.dataset.ch]) CH[el.dataset.ch](el, e);
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (!el || !el.dataset) return;
    if (el.dataset.bind && el.type !== 'checkbox') setPath(S, el.dataset.bind, el.value);
    if (el.dataset.in && IN[el.dataset.in]) IN[el.dataset.in](el, e);
    if (el.dataset.lf && el.type !== 'checkbox' && el.tagName !== 'SELECT') lfDebounce(el);
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const h = f && f.dataset && FORM[f.dataset.form];
    if (h) h(f, e);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    hideTip();
    if (S.demo.full) { e.preventDefault(); ACT['demo-close'](); return; }
    if (S.dr.id) {
      e.preventDefault();
      if (S.dr.del || S.dr.actDel) { S.dr.del = false; S.dr.actDel = null; render(); return; }
      closeDrawer();
      return;
    }
    if (S.plan.del) { S.plan.del = null; render(); }
  });
  document.addEventListener('pointerdown', () => { ptrAt = Date.now(); }, true);
  const up = () => { if (dragId) return; ptrAt = 0; setTimeout(flush, 0); };
  document.addEventListener('pointerup', up, true);
  document.addEventListener('pointercancel', up, true);
  document.addEventListener('focusout', () => { hideTip(); setTimeout(flush, 0); });
  document.addEventListener('pointerover', e => { const el = tipTarget(e); if (el === tipFor) return; if (el) showTip(el); else hideTip(); });
  document.addEventListener('focusin', e => { const el = tipTarget(e); if (el) showTip(el); });
  window.addEventListener('scroll', hideTip, true);
  window.addEventListener('resize', hideTip);
  document.addEventListener('dragstart', e => {
    const c = e.target && e.target.closest ? e.target.closest('.bc[draggable="true"]') : null;
    if (!c) return;
    dragId = c.dataset.id; ptrAt = Date.now(); hideTip();
    c.classList.add('dragging');
    try { e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; } catch (_) {}
  });
  document.addEventListener('drag', () => { if (dragId) ptrAt = Date.now(); });
  document.addEventListener('dragover', e => {
    if (!dragId) return;
    ptrAt = Date.now();
    const col = e.target && e.target.closest ? e.target.closest('.col[data-col]') : null;
    $$('.col.drop').forEach(x => { if (x !== col) x.classList.remove('drop'); });
    if (!col) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
    col.classList.add('drop');
  });
  document.addEventListener('drop', e => {
    const col = e.target && e.target.closest ? e.target.closest('.col[data-col]') : null;
    if (!col || !dragId) return;
    e.preventDefault();
    const l = leadById(dragId), to = col.dataset.col;
    endDrag();
    if (l && stOf(l) !== to) changeStatus(l, to, 'board');
  });
  document.addEventListener('dragend', () => { if (dragId) endDrag(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { flushLf(); commitActive(); runSaveNotes(); } });
  window.addEventListener('hashchange', route);
  $('#scrim').addEventListener('click', () => closeDrawer());
}

// запуск
function useCap(name) {
  try {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return Promise.resolve(null);
    return Promise.resolve(c.use(name)).catch(() => null);
  } catch (_) { return Promise.resolve(null); }
}
async function boot() {
  wire();
  route();
  const timer = setTimeout(() => { S.timeout = true; scheduleRender(); }, 10000);
  useCap('downloads').then(d => { if (d) { S.dl = d; scheduleRender(); } });
  useCap('sample').then(s => { if (s) { S.sample = s; scheduleRender(); } });
  useCap('user').then(async u => {
    if (!u || typeof u.can !== 'function') return;
    try { const c = await u.can('data.write'); S.canWrite = c; if (c === false) { S.readOnly = true; scheduleRender(); } } catch (_) {}
  });
  const db = await useCap('db');
  if (!db) { clearTimeout(timer); S.dbState = 'none'; S.timeout = false; scheduleRender(); return; }
  S.db = db; S.dbState = 'ok';
  const onErr = e => { const c = e && e.code; S.err = c === 'revoked' ? 'revoked' : (c || 'error'); scheduleRender(); };
  try {
    db.collection('leads').onSnapshot(snap => {
      S.leads = docsOf(snap); S.got.leads = true;
      S.cached = !!(snap && snap.metadata && snap.metadata.fromCache);
      if (S.err && S.err !== 'revoked') S.err = '';
      clearTimeout(timer); S.timeout = false;
      scheduleRender();
    }, onErr);
    const onActs = snap => { S.acts = docsOf(snap); S.got.acts = true; scheduleRender(); };
    let actQ = null;
    try { actQ = db.collection('activity').orderBy('created', 'desc').limit(1000); } catch (_) { actQ = null; }
    if (actQ) actQ.onSnapshot(onActs, () => db.collection('activity').onSnapshot(onActs, onErr));
    else db.collection('activity').onSnapshot(onActs, onErr);
    db.collection('outings').onSnapshot(snap => {
      S.outings = docsOf(snap); S.got.outings = true;
      if (S.run.id && !S.outings.some(o => o.id === S.run.id)) S.run.id = null;
      scheduleRender();
    }, onErr);
    db.collection('settings').doc('main').onSnapshot(d => {
      const ex = d ? (typeof d.exists === 'function' ? d.exists() : !!d.exists) : false;
      S.setExists = ex; S.setDoc = ex ? clone(d.data()) : null; S.got.settings = true;
      applyCfg(); scheduleRender();
    }, onErr);
  } catch (e) { onErr(e); }
  scheduleRender();
}
boot();
