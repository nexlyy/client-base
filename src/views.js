// общие куски
const RES_LABEL = {absent: 'Нет на месте', refused: 'Отказ', talked: 'Поговорили', interested: 'Интересно!'};
const sayBox = (title, text, id, extra) => `<div class="say"><header><b>${esc(title)}</b><button type="button" class="btn small" data-act="copy" data-src="${id}">Копировать</button></header><p id="${id}">${esc(text)}</p>${extra || ''}</div>`;
const segOptions = sel => Object.entries(P.SEG).map(([k, t]) => `<option value="${k}"${sel === k ? ' selected' : ''}>${esc(t)}</option>`).join('');
const dis = () => canEdit() ? '' : ' disabled';
const leadBtn = l => `<button type="button" class="t lnk" data-act="open" data-id="${esc(l.id)}">${esc(l.name || 'Без названия')}</button>`;
const citiesDatalist = id => `<datalist id="${id}">${P.CITIES.map(c => `<option value="${esc(c.n)}">`).join('')}</datalist>`;
function eventsHtml() {
  const t = today();
  const ev = P.EVENTS.filter(e => e.date >= t);
  if (!ev.length) return '<p class="muted">Ближайших встреч в списке нет. Новые ищи на сайтах Grant Thornton, Advantage Austria и в группах местного бизнеса.</p>';
  return ev.map(e => {
    const d = parseYmd(e.date), n = dayDiff(e.date, t);
    const when = n === 0 ? 'сегодня' : n === 1 ? 'завтра' : 'через ' + n + ' ' + plural(n, 'день', 'дня', 'дней');
    return `<div class="datec"><span class="d">${WD_S[d.getDay()]}, ${d.getDate()} ${MON_G[d.getMonth()]} · ${when}</span><span class="w">${esc(e.time)} · ${esc(e.place)}</span><p>${esc(e.t)}. ${esc(e.note)}</p><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.link)} ↗</a></div>`; }).join('');
}

// Сегодня
V.today = () => {
  const d = new Date(), g = CFG.goals, wk = weekStats(0), ym = today().slice(0, 7);
  const won = monthWon(ym), sk = S.db ? streak() : 0;
  const meter = (lbl, v, goal, money) => {
    const pct = goal ? Math.min(100, Math.round(v / goal * 100)) : 0;
    return `<div class="meter"><span class="lbl">${esc(lbl)}</span><span class="val">${money ? fmtZl(v) : v} <small>из ${money ? fmtZl(goal) : goal}</small></span><div class="prog${goal && v >= goal ? ' done' : ''}" role="progressbar" aria-label="${esc(lbl)}" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${v}"><span style="width:${pct}%"></span></div></div>`;
  };
  const head = `<div class="today-h"><p class="eyebrow">${esc(WD[d.getDay()])} · неделя ${isoWeek(d)}</p><h1>${d.getDate()} ${MON_G[d.getMonth()]}</h1>
    <p class="streak">${sk ? `Серия: <b>${sk}</b> ${plural(sk, 'неделя', 'недели', 'недель')} подряд с планом по визитам.` : `План недели: ${g.outings} ${plural(g.outings, 'выход', 'выхода', 'выходов')}, ${g.visits} ${plural(g.visits, 'визит', 'визита', 'визитов')}, ${g.offers} КП.`}</p></div>`;
  const meters = `<div class="meters">${meter('Выходы за неделю', wk.outings, +g.outings || 0)}${meter('Визиты за неделю', wk.visits, +g.visits || 0)}${meter('КП за неделю', wk.offers, +g.offers || 0)}${meter('Выручка за месяц', won, +g.month || 0, true)}</div>`;
  let left;
  if (needDb()) left = `<div class="card"><h2>Дела</h2>${noDbBox()}</div>`;
  else {
    const due = dueLists();
    const row = (l, kind) => `<li class="row">${scoreBadge(l)}<div class="main">${leadBtn(l)}<div class="s">${esc(l.next || (kind === 'stuck' ? 'Следующий шаг не задан' : 'Шаг без описания'))}${l.nextDate ? ' · ' + dateSpan(l.nextDate) : ''}</div></div><div class="acts">${kind === 'stuck'
      ? `<button type="button" class="btn small" data-act="open" data-id="${esc(l.id)}">Задать шаг</button>`
      : `<button type="button" class="btn small" data-act="due-done" data-id="${esc(l.id)}"${dis()}>Сделано</button><button type="button" class="btn small ghost" data-act="snooze" data-id="${esc(l.id)}"${dis()}>+2 дня</button>`}</div></li>`;
    const grp = (t, list, kind, cls) => list.length ? `<p class="grp-t${cls ? ' ' + cls : ''}">${esc(t)} · ${list.length}</p><ul class="rows">${list.map(l => row(l, kind)).join('')}</ul>` : '';
    const body = grp('Просрочено', due.over, 'due', 'hot') + grp('Сегодня', due.today, 'due') + grp('На этой неделе', due.soon, 'due') + grp('В работе без следующего шага', due.stuck.slice(0, 8), 'stuck');
    left = `<div class="card"><h2>Дела</h2>${body || emptyBox(S.leads.length ? 'На сегодня дел нет' : 'База пуста', S.leads.length ? 'Возьми места из подборки справа и спланируй выход.' : 'Добавь первых лидов во вкладке <a href="#hunt">«Охота»</a>.', 'small')}</div>`;
  }
  let picks = '';
  if (!needDb()) {
    const top = S.leads.filter(l => stOf(l) === 'new' && !inPlan(l.id)).sort((a, b) => score(b) - score(a)).slice(0, 5);
    picks = `<div class="card"><div class="card-h"><h2>С кого начать</h2><a href="#base" class="muted" style="font-size:13px">вся база →</a></div>${top.length
      ? `<ul class="rows">${top.map(l => `<li class="row">${scoreBadge(l)}<div class="main">${leadBtn(l)}<div class="s">${esc([l.kind, l.city].filter(Boolean).join(' · '))}</div><div class="tags" style="margin-top:4px">${tagChips(l, 2)}</div></div><div class="acts"><button type="button" class="btn small" data-act="plan-add" data-id="${esc(l.id)}"${dis()}>В выход</button></div></li>`).join('')}</ul>`
      : emptyBox('Новых лидов нет', 'Найди новые места во вкладке <a href="#hunt">«Охота»</a>.', 'small')}</div>`;
  }
  let plan = '';
  if (!needDb()) {
    const pl = curPlan();
    if (pl) {
      const st = (pl.leads || []).map(leadById).filter(Boolean);
      const url = routeUrl(st);
      plan = `<div class="card"><div class="card-h"><h2>Выход ${esc(rel(pl.date))}</h2><span class="date">${esc(fmtD(pl.date))}</span></div>${st.length
        ? `<ol class="stops">${st.map(l => `<li><div class="main"><b>${esc(l.name)}</b><div class="muted" style="font-size:13px">${esc(leadPlace(l) || l.kind || '')}</div></div></li>`).join('')}</ol>`
        : '<p class="muted" style="margin:0">Пока пусто.</p>'}<div class="btns" style="margin-top:12px">${url ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Маршрут ↗</a>` : ''}<button type="button" class="btn primary" data-act="run-start" data-id="${esc(pl.id)}"${st.length && canEdit() ? '' : ' disabled'}>Начать выход</button><a class="btn ghost" href="#outing">План</a></div></div>`;
    } else plan = `<div class="card"><h2>Выход</h2><p class="muted" style="margin:0 0 12px">Не запланирован. Возьми 4–5 мест рядом и иди в будний день с 15:00 до 17:00.</p><a class="btn" href="#outing">Спланировать</a></div>`;
  }
  const events = `<div class="card"><h2>Ближайшие встречи</h2><div class="dates" style="grid-template-columns:minmax(0,1fr)">${eventsHtml()}</div></div>`;
  return head + meters + `<div class="cols"><div class="stack">${left}</div><div class="stack">${plan}${picks}${events}</div></div>`;
};

// База
function baseFiltered() {
  const f = S.f, q = norm(f.q);
  const list = S.leads.filter(l => {
    const st = stOf(l);
    if (f.st === 'active' ? !['contact', 'talk', 'offer'].includes(st) : (f.st && st !== f.st)) return false;
    if (f.seg && segOf(l) !== f.seg) return false;
    if (f.city && norm(l.city) !== norm(f.city)) return false;
    if (f.tag && !tagsOf(l).includes(f.tag)) return false;
    if (f.call) { const c = callState(l); if (f.call === 'none' ? c : !c || c.last !== f.call) return false; }
    if (q &&!norm([l.name, l.kind, l.city, l.address, l.now, l.pitch, l.next, l.notes, l.decider].join(' ')).includes(q)) return false;
    return true;
  });
  const rank = l => stOf(l) === 'lost' ? 2 : stOf(l) === 'won' ? 1 : 0;
  const sorters = {
    score: (a, b) => rank(a) - rank(b) || score(b) - score(a),
    next: (a, b) => (a.nextDate ? 0 : 1) - (b.nextDate ? 0 : 1) || String(a.nextDate || '').localeCompare(String(b.nextDate || '')) || score(b) - score(a),
    updated: (a, b) => String(b.updated || '').localeCompare(String(a.updated || '')),
    name: (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pl')
  };
  return list.sort(sorters[f.sort] || sorters.score);
}
function leadCard(l) {
  const st = stOf(l);
  const meta = [l.kind, leadPlace(l), l.rating ? '★ ' + l.rating : ''].filter(Boolean).map(esc).join(' · ');
  return `<button type="button" class="lc${st === 'lost' ? ' is-lost' : ''}${st === 'won' ? ' is-won' : ''}" data-act="open" data-id="${esc(l.id)}">
    <span class="lc-h"><span><h3>${esc(l.name || 'Без названия')}</h3>${meta ? `<span class="meta" style="display:block">${meta}</span>` : ''}</span>${scoreBadge(l)}</span>
    <span class="tags">${statusPill(l)}${callChip(l)}${tagChips(l, 3)}${l.lang ? '<span class="tg lang">свой язык</span>' : ''}${l.consent ? '<span class="tg ok">согласие</span>' : ''}</span>
    <span class="nx"><span>${l.next ? esc(l.next) : `<span class="muted">${st === 'new' ? 'Пока без визита' : st === 'won' || st === 'lost' ? 'Закрыт' : 'Следующий шаг не задан'}</span>`}</span>${dateSpan(l.nextDate)}</span>
  </button>`;
}
const NEXT_ST = {new: 'contact', contact: 'talk', talk: 'offer', offer: 'won'};
function boardHtml(list) {
  return `<div class="board-wrap" data-keep="board"><div class="board">${P.STATUS.map(s => {
    const items = list.filter(l => stOf(l) === s.k);
    return `<section class="col" data-col="${s.k}" aria-label="${esc(s.t)}"><div class="col-h"><span class="dot s-${s.k}"></span>${esc(s.t)}<span class="c">${items.length}</span></div>${items.map(l => {
      const nx = NEXT_ST[stOf(l)];
      return `<div class="bc" draggable="${canEdit()}" data-id="${esc(l.id)}">${leadBtn(l)}<div class="tags">${callChip(l)}${tagChips(l, 2)}</div><div class="f">${scoreBadge(l)}${dateSpan(l.nextDate)}${nx && canEdit() ? `<button type="button" class="btn small ghost" data-act="advance" data-id="${esc(l.id)}" data-tip="Перевести в «${esc(stT(nx))}»" aria-label="Перевести ${esc(l.name || '')} в «${esc(stT(nx))}»">→</button>` : ''}</div></div>`;
    }).join('') || '<p class="muted" style="font-size:13px;margin:4px 2px">Пусто</p>'}</section>`;
  }).join('')}</div></div>`;
}
function baseList() {
  const total = S.leads.length;
  if (!total) return emptyBox('База пуста', 'Добавь первого лида кнопкой «Добавить лида» или во вкладке <a href="#hunt">«Охота»</a>.');
  const list = baseFiltered();
  const shown = `<p class="shown">${list.length === total ? 'Всего лидов: ' + total : 'Показано ' + list.length + ' из ' + total}${S.f.mode === 'board' && canEdit() ? ' · карточки можно перетаскивать между колонками' : ''}</p>`;
  if (S.f.mode === 'board') return shown + boardHtml(list);
  if (!list.length) return shown + emptyBox('Ничего не нашлось', 'Сними фильтры или измени поиск.');
  return shown + `<div class="ll">${list.map(leadCard).join('')}</div>`;
}
V.base = () => {
  const head = `<div class="vh"><div><h1>База</h1><p class="sub">Заведения и фирмы, которым нужен сайт или бот. Карточка открывает все поля, заход для визита и историю.</p></div><div class="btns">${S.dl && S.leads.length ? '<button type="button" class="btn" data-act="csv">Скачать CSV</button>' : ''}<button type="button" class="btn primary" data-act="new-lead"${dis()}>Добавить лида</button></div></div>`;
  if (needDb()) return head + noDbBox();
  const f = S.f, total = S.leads.length;
  const counts = {}; P.STATUS.forEach(s => { counts[s.k] = 0; }); S.leads.forEach(l => { counts[stOf(l)]++; });
  const bar = P.STATUS.filter(s => counts[s.k]).map(s => `<span class="s-${s.k}" style="flex-grow:${counts[s.k]}" data-tip="${esc(s.t)}: ${counts[s.k]} из ${total}"></span>`).join('');
  const activeN = S.leads.filter(l => ['contact', 'talk', 'offer'].includes(stOf(l))).length;
  const chips = [`<button type="button" class="chip" data-act="f-st" data-v="" aria-pressed="${!f.st}">Все<span class="c">${total}</span></button>`,
    `<button type="button" class="chip" data-act="f-st" data-v="active" aria-pressed="${f.st === 'active'}">В работе<span class="c">${activeN}</span></button>`]
    .concat(P.STATUS.map(s => `<button type="button" class="chip" data-act="f-st" data-v="${s.k}" aria-pressed="${f.st === s.k}"><span class="dot s-${s.k}"></span>${esc(s.t)}<span class="c">${counts[s.k]}</span></button>`)).join('');
  const cities = Array.from(new Set(S.leads.map(l => l.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl'));
  const sel = (k, label, opts) => `<select id="f-${k}" data-ch="f" data-k="${k}" aria-label="${esc(label)}">${opts}</select>`;
  const tools = `<div class="tools">
    <input type="search" id="f-q" data-in="f-q" value="${esc(f.q)}" placeholder="Поиск: название, адрес, заметки" aria-label="Поиск по базе">
    ${sel('seg', 'Сегмент', '<option value="">Все сегменты</option>' + Object.entries(P.SEG).map(([k, t]) => `<option value="${k}"${f.seg === k ? ' selected' : ''}>${esc(t)}</option>`).join(''))}
    ${sel('city', 'Город', '<option value="">Все города</option>' + cities.map(c => `<option value="${esc(c)}"${f.city === c ? ' selected' : ''}>${esc(c)}</option>`).join(''))}
    ${sel('tag', 'Тег', '<option value="">Любой тег</option>' + P.TAG_ORDER.map(t => `<option value="${t}"${f.tag === t ? ' selected' : ''}>${esc(P.TAGS[t].t)}</option>`).join(''))}
    ${sel('call', 'Звонки', P.CALL_FILTER.map(([k, t]) => `<option value="${k}"${f.call === k ? ' selected' : ''}>${esc(t)}</option>`).join(''))}
    ${sel('sort', 'Сортировка', [['score', 'По оценке'], ['next', 'По следующему шагу'], ['updated', 'По обновлению'], ['name', 'По названию']].map(([k, t]) => `<option value="${k}"${f.sort === k ? ' selected' : ''}>${t}</option>`).join(''))}
    <span class="spacer"></span>
    <div class="seg-ctl" role="group" aria-label="Вид"><button type="button" data-act="f-mode" data-v="list" aria-pressed="${f.mode !== 'board'}">Список</button><button type="button" data-act="f-mode" data-v="board" aria-pressed="${f.mode === 'board'}">Доска</button></div>
  </div>`;
  // Чипы под полосой и есть её легенда: та же точка цвета, название и число.
  return head + `<div class="pipe"><div class="pipebar" role="img" aria-label="${esc(P.STATUS.map(s => s.t + ' ' + counts[s.k]).join(', '))}">${bar}</div><div class="chips" role="group" aria-label="Фильтр по статусу">${chips}</div></div>${tools}<div id="base-list">${baseList()}</div>`;
};

// карточка лида
function renderDrawer() {
  const dr = $('#drawer'), sc = $('#scrim');
  let html = '';
  if (S.dr.id === 'new') html = `<div class="dr-head" style="padding-bottom:14px"><div class="dr-top"><h2 id="drawerTitle">Новый лид</h2><button type="button" class="btn small ghost" id="dr-close" data-act="close-dr" aria-label="Закрыть">✕</button></div></div><div class="dr-body">${quickForm('dr')}</div>`;
  else if (S.dr.id) { const l = leadById(S.dr.id); if (l) html = drawerHtml(l); else S.dr.id = null; }
  dr.hidden = !html; sc.hidden = !html;
  dr.innerHTML = html;
  $('#view').inert = !!html;
  $('.apptop').inert = !!html || !!S.demo.full;
  document.documentElement.classList.toggle('lock', !!html || !!S.demo.full);
}
function drawerHtml(l) {
  const st = stOf(l), tab = S.dr.tab;
  const meta = [l.kind, leadPlace(l), l.rating ? '★ ' + l.rating : ''].filter(Boolean).map(esc).join(' · ');
  const n = actsOf(l.id).length;
  const maps = safeUrl(l.maps), site = safeUrl(l.site);
  return `<div class="dr-head">
    <div class="dr-top"><div style="min-width:0"><h2 id="drawerTitle">${esc(l.name || 'Без названия')}</h2>${meta ? `<p class="meta">${meta}</p>` : ''}</div><div class="btns" style="flex:none;flex-wrap:nowrap">${scoreBadge(l)}<button type="button" class="btn small ghost" id="dr-close" data-act="close-dr" aria-label="Закрыть">✕</button></div></div>
    <div class="btns">
      <select id="dr-status" data-ch="lead-status" aria-label="Статус"${dis()}>${P.STATUS.map(s => `<option value="${s.k}"${s.k === st ? ' selected' : ''}>${esc(s.t)}</option>`).join('')}</select>
      <span class="seg-ctl" role="group" aria-label="Итог звонка"><button type="button" data-act="call-res" data-v="reached"${dis()}>Дозвон</button><button type="button" data-act="call-res" data-v="noanswer"${dis()}>Недозвон</button></span>${callChip(l)}
      ${inPlan(l.id) ? '<span class="tg ok">в выходе</span>' : `<button type="button" class="btn small" data-act="plan-add" data-id="${esc(l.id)}"${dis()}>В выход</button>`}
      <button type="button" class="btn small" data-act="go-offer" data-id="${esc(l.id)}">КП</button>
      <button type="button" class="btn small" data-act="go-demo" data-id="${esc(l.id)}">Демо</button>
      <a class="btn small" href="${esc(maps || mapsSearch(l))}" target="_blank" rel="noopener">${maps ? 'Google Maps' : 'Найти на карте'} ↗</a>
      ${site ? `<a class="btn small" href="${esc(site)}" target="_blank" rel="noopener">Их страница ↗</a>` : ''}
    </div>
    <div class="dr-tabs" role="tablist" aria-label="Разделы карточки">${[['over', 'Обзор'], ['pitch', 'Заход'], ['hist', 'История' + (n ? ' · ' + n : '')]].map(([k, t]) => `<button type="button" role="tab" id="dr-tab-${k}" data-act="dr-tab" data-v="${k}" aria-selected="${tab === k}">${esc(t)}</button>`).join('')}</div>
  </div>
  <div class="dr-body" data-keep="dr-${esc(l.id)}-${tab}" role="tabpanel" aria-labelledby="dr-tab-${tab}">${tab === 'pitch' ? drPitch(l) : tab === 'hist' ? drHist(l) : drOver(l)}</div>`;
}
function drOver(l) {
  const ro = !canEdit();
  const fld = (f, label, o) => {
    o = o || {};
    const v = l[f] == null ? '' : l[f];
    const id = 'lf-' + f, cls = 'field' + (o.full ? ' full' : '');
    if (o.type === 'textarea') return `<label class="${cls}"><span>${label}</span><textarea id="${id}" data-lf="${f}" rows="${o.rows || 2}" placeholder="${esc(o.ph || '')}"${ro ? ' readonly' : ''}>${esc(v)}</textarea></label>`;
    if (o.type === 'select') return `<label class="${cls}"><span>${label}</span><select id="${id}" data-lf="${f}"${ro ? ' disabled' : ''}>${o.options}</select></label>`;
    return `<label class="${cls}"><span>${label}</span><input id="${id}" data-lf="${f}" type="${o.type || 'text'}" value="${esc(v)}" placeholder="${esc(o.ph || '')}"${o.list ? ` list="${o.list}"` : ''}${o.type === 'number' ? ' min="0" step="100" inputmode="numeric"' : ''} autocomplete="off"${ro ? ' readonly' : ''}></label>`;
  };
  const tags = tagsOf(l), pks = Array.isArray(l.packages) ? l.packages : [];
  const sugg = suggestPk(l).map(id => pkById(id).n.ru).join(', ');
  const tagBtns = P.TAG_ORDER.map(t => `<button type="button" class="tg" data-act="tag" data-tag="${t}" aria-pressed="${tags.includes(t)}" data-tip="${esc(P.TAGS[t].hint)} · ${P.TAGS[t].w > 0 ? '+' : ''}${P.TAGS[t].w}"${ro ? ' disabled' : ''}>${esc(P.TAGS[t].t)}</button>`).join('');
  const pkBtns = P.PACKAGES.map(p => `<button type="button" class="tg" data-act="pk" data-pk="${p.id}" aria-pressed="${pks.includes(p.id)}"${ro ? ' disabled' : ''}>${esc(p.n.ru)}</button>`).join('');
  const del = S.dr.del
    ? `<span class="confirm">Удалить «${esc(l.name || 'лид')}» вместе с историей? <button type="button" class="btn small danger" data-act="lead-del-yes">Удалить</button><button type="button" class="btn small ghost" data-act="lead-del-no">Отмена</button></span>`
    : `<button type="button" class="btn small ghost" data-act="lead-del"${dis()}>Удалить лида</button>`;
  return `<div class="dr-sec"><h3>Следующий шаг</h3><div class="form-grid">
      ${fld('next', 'Что сделать', {full: true, ph: 'Например: зайти в среду в 15:30 с черновиком'})}
      ${fld('nextDate', 'Когда', {type: 'date'})}
      ${fld('value', 'Сумма сделки, zł', {type: 'number'})}
    </div></div>
    ${stOf(l) === 'lost' ? `<div class="dr-sec"><h3>Отказ</h3><div class="form-grid">${fld('lostReason', 'Причина', {type: 'select', options: '<option value="">— не указана —</option>' + P.LOST.map(x => `<option value="${x.k}"${l.lostReason === x.k ? ' selected' : ''}>${esc(x.t)}</option>`).join('')})}<p class="muted" style="margin:0;font-size:13px;align-self:end">Отказ ${l.lostAt ? esc(fmtD(l.lostAt)) : ''}${l.lostFrom ? ' на этапе «' + esc(stT(l.lostFrom)) + '»' : ''}</p></div></div>` : ''}
    <div class="dr-sec"><h3>Что у них не так</h3><div class="tags">${tagBtns}</div>
      <div class="btns"><button type="button" class="btn small" data-act="site-tags"${dis()}>Определить по ссылке «Witryna»</button><span class="muted" style="font-size:12.5px">оценка считается из тегов, отзывов и приоритета</span></div></div>
    <div class="dr-sec"><h3>Что предложить</h3><div class="tags">${pkBtns}</div><p class="muted" style="margin:0;font-size:13px">${pks.length ? 'Эти пакеты подставятся в КП.' : 'Не выбрано. По сегменту и тегам подходит: ' + esc(sugg) + '.'}</p></div>
    <div class="dr-sec"><h3>Связь</h3><div class="form-grid">
      ${fld('decider', 'Кто решает и когда бывает', {full: true, ph: 'Например: владелец, после 15:00, кроме понедельника'})}
      <label class="check full"><input type="checkbox" id="lf-lang" data-lf="lang"${l.lang ? ' checked' : ''}${ro ? ' disabled' : ''}> Владелец говорит по-украински или по-русски</label>
      <label class="check full"><input type="checkbox" id="lf-consent" data-lf="consent"${l.consent ? ' checked' : ''}${ro ? ' disabled' : ''}> Согласие на связь получено (можно писать и звонить)</label>
      ${l.consent ? fld('consentDate', 'Дата согласия', {type: 'date'}) + fld('consentHow', 'Как и куда писать', {ph: 'WhatsApp +48…, почта'}) : ''}
    </div></div>
    <div class="dr-sec"><h3>Карточка</h3><div class="form-grid">
      ${fld('name', 'Название', {full: true})}
      ${fld('kind', 'Что за место', {ph: 'Корейская кухня'})}
      ${fld('segment', 'Сегмент', {type: 'select', options: segOptions(segOf(l))})}
      ${fld('city', 'Город', {list: 'dl-cities'})}
      ${fld('address', 'Адрес')}
      ${fld('rating', 'Рейтинг и отзывы', {ph: '4,6 · 616'})}
      ${fld('priority', 'Приоритет', {type: 'select', options: [1, 2, 3].map(p => `<option value="${p}"${priOf(l) === p ? ' selected' : ''}>${P.PRI[p]}</option>`).join('')})}
      ${fld('maps', 'Ссылка на Google Maps', {full: true, ph: 'https://'})}
      ${fld('site', 'Ссылка из «Witryna»', {full: true, ph: 'пусто, если сайта нет'})}
    </div>${citiesDatalist('dl-cities')}</div>
    <div class="dr-sec"><h3>Заметки</h3><div class="form-grid">
      ${fld('now', 'Сейчас (что не так)', {type: 'textarea', full: true})}
      ${fld('pitch', 'Предложить', {type: 'textarea', full: true})}
      ${fld('notes', 'Заметки', {type: 'textarea', full: true, rows: 3, ph: 'Что ответили, о чём договорились'})}
    </div><p class="muted" style="margin:0;font-size:12.5px">${l.source ? 'Источник: ' + esc(l.source) + ' · ' : ''}${l.created ? 'создан ' + esc(fmtD(l.created)) : ''}${l.updated ? ' · обновлён ' + esc(fmtD(l.updated)) : ''}</p></div>
    <div class="dr-sec">${del}</div>`;
}
const caseLink = c => c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)} ↗</a>` : `<b>${esc(c.name)}</b>`;
function objDetails(keys, l, lang, prefix) {
  return keys.map(k => P.OBJ.find(o => o.k === k)).filter(Boolean).map(o => `<details class="obj"><summary>${esc(o.q)}</summary><div class="in"><p id="${prefix}-${o.k}">${esc(fill(o[lang], l, lang))}</p>${o.tip ? `<p class="muted" style="font-size:13px">${esc(o.tip)}</p>` : ''}<div><button type="button" class="btn small" data-act="copy" data-src="${prefix}-${o.k}">Копировать</button></div></div></details>`).join('');
}
function drPitch(l) {
  const lang = S.dr.lang || leadLang(l);
  const op = P.OPENERS[openerKey(l)];
  const diag = tagsOf(l).map(t => P.TAGS[t].d && P.TAGS[t].d[lang]).filter(Boolean);
  const c = caseOf(P.SEG_CASE[segOf(l)]);
  const pks = leadPk(l).map(pkById).filter(Boolean);
  const objKeys = Array.from(new Set(tagsOf(l).map(t => P.TAG_OBJ[t]).filter(Boolean).concat(['price', 'think', 'time']))).slice(0, 4);
  return `<div class="btns">${langCtl('dr-lang', lang)}<span class="muted" style="font-size:13px">${l.lang ? 'владелец говорит по-украински или по-русски' : 'по умолчанию польский'}</span></div>
    ${sayBox('Вход · ' + op.t, fill(op[lang], l, lang), 'dp-open')}
    ${diag.length ? sayBox('Проблема одной фразой', diag[0], 'dp-diag', diag.length > 1 ? `<p class="muted" style="font-size:13.5px">Ещё: ${esc(diag.slice(1).join(' '))}</p>` : '') : '<div class="say"><header><b>Проблема</b></header><p class="muted">Теги не отмечены. Отметь во вкладке «Обзор», что видно в карточке Google, и здесь появится фраза.</p></div>'}
    ${c ? `<div class="say"><header><b>Что показать на телефоне</b></header><p>${caseLink(c)}</p><p class="muted" style="font-size:13.5px">${esc(c.d.ru)}</p><p style="font-size:13.5px">Или открой <button type="button" class="btn small" data-act="go-demo" data-id="${esc(l.id)}">демо их сайта</button></p></div>` : ''}
    <div class="say"><header><b>Что предложить</b></header><ul class="rows">${pks.map(p => { const pc = priceOf(p); return `<li class="row"><div class="main"><b>${esc(p.n.ru)}</b><div class="s">${esc(p.d.ru)}</div></div><span class="mono nowrap" style="font-size:13px">от ${fmtZl(pc.from)}${p.unit === 'month' ? '/мес' : ''}</span></li>`; }).join('')}</ul></div>
    <div class="dr-sec"><h3>Скорее всего услышишь</h3>${objDetails(objKeys, l, lang, 'dpo')}</div>
    <div class="dr-sec"><h3>По ходу разговора</h3>${['absent', 'close', 'consent'].map(k => sayBox(P.LINES[k].t, fill(P.LINES[k][lang], l, lang), 'dpl-' + k)).join('')}</div>
    ${aiBox('lead-' + l.id, 'Свой заход от Claude', 'Claude соберёт вход в разговор по данным этой карточки и подскажет, чем закончить визит.', '')}`;
}
function drHist(l) {
  const acts = actsOf(l.id).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.created || '').localeCompare(String(a.created || '')));
  const types = ['visit', 'talk', 'call', 'msg', 'meeting', 'note'];
  const label = a => a.type === 'status' ? (a.text || 'Статус') : (P.ACT[a.type] || 'Запись') + (a.result ? ' · ' + (P.RESULT[a.result] || a.result) : '');
  const form = canEdit() ? `<form data-form="act" class="say" style="gap:10px" novalidate>
      <div class="form-grid"><label class="field"><span>Что было</span><select id="af-type" data-bind="form.type">${types.map(t => `<option value="${t}"${S.form.type === t ? ' selected' : ''}>${esc(P.ACT[t])}</option>`).join('')}</select></label>
      <label class="field"><span>Когда</span><input id="af-date" type="date" data-bind="form.date" value="${esc(S.form.date || today())}"></label>
      ${S.form.type === 'call' ? `<label class="field"><span>Итог звонка</span><select id="af-res" data-bind="form.res">${['reached', 'noanswer'].map(k => `<option value="${k}"${(S.form.res || 'reached') === k ? ' selected' : ''}>${esc(P.RESULT[k])}</option>`).join('')}</select></label>` : ''}</div>
      <label class="field"><span>Подробности</span><textarea id="af-text" data-bind="form.text" rows="2" placeholder="Что сказали, о чём договорились">${esc(S.form.text)}</textarea></label>
      ${['call', 'msg'].includes(S.form.type) && !l.consent ? '<p class="ai-note warn">Звонить и писать с предложением можно только после согласия на связь.</p>' : ''}
      <div class="btns"><button type="submit" class="btn primary">Добавить в историю</button></div></form>` : '';
  const items = acts.map(a => `<li><span class="date d">${esc(fmtD(a.date))}</span><div><div class="k">${esc(label(a))}</div>${a.text && a.type !== 'status' ? `<div class="x">${esc(a.text)}</div>` : ''}</div><div>${canEdit() ? (S.dr.actDel === a.id
    ? `<span class="confirm"><button type="button" class="btn small danger" data-act="act-del-yes" data-id="${esc(a.id)}">Удалить</button><button type="button" class="btn small ghost" data-act="act-del-no">Нет</button></span>`
    : `<button type="button" class="btn small ghost" data-act="act-del" data-id="${esc(a.id)}" aria-label="Удалить запись">✕</button>`) : ''}</div></li>`).join('');
  return form + (acts.length ? `<ol class="tl">${items}</ol>` : emptyBox('Истории пока нет', 'Визиты, разговоры, КП и смены статуса будут появляться здесь сами.', 'small'));
}

// быстрая форма лида
function autoTagsHtml(site) {
  const t = tagsFromSite(site);
  return 'Теги по ссылке: ' + (t.length ? t.map(k => `<span class="tg">${esc(P.TAGS[k].t)}</span>`).join('') : '<span>похоже на собственный сайт</span>');
}
function quickForm(ctx) {
  const f = S.nf;
  const extra = ['nobooking', 'noorder', 'nolang', 'oldsite', 'deaddomain', 'budget', 'chain'];
  return `<form data-form="new-lead" data-ctx="${ctx}" class="side-form" novalidate>
    <div class="form-grid">
      <label class="field full"><span>Название *</span><input id="nf-name" data-bind="nf.name" value="${esc(f.name)}" autocomplete="off" required></label>
      <label class="field"><span>Категория</span><select id="nf-cat" data-ch="nf-cat"><option value="">— своя —</option>${P.CATS.map(c => `<option value="${c.id}"${f.cat === c.id ? ' selected' : ''}>${esc(c.t)}</option>`).join('')}</select></label>
      <label class="field"><span>Что за место</span><input id="nf-kind" data-bind="nf.kind" value="${esc(f.kind)}" placeholder="Корейская кухня" autocomplete="off"></label>
      <label class="field"><span>Сегмент</span><select id="nf-seg" data-bind="nf.seg">${segOptions(f.seg)}</select></label>
      <label class="field"><span>Город</span><input id="nf-city" data-bind="nf.city" value="${esc(f.city)}" list="dl-cities-nf" autocomplete="off">${citiesDatalist('dl-cities-nf')}</label>
      <label class="field full"><span>Адрес</span><input id="nf-address" data-bind="nf.address" value="${esc(f.address)}" placeholder="Dworcowa 3" autocomplete="off"></label>
      <label class="field"><span>Рейтинг и отзывы</span><input id="nf-rating" data-bind="nf.rating" value="${esc(f.rating)}" placeholder="4,6 · 616" autocomplete="off"></label>
      <label class="field"><span>Ссылка из «Witryna»</span><input id="nf-site" data-bind="nf.site" data-in="nf-site" value="${esc(f.site)}" placeholder="пусто, если сайта нет" autocomplete="off"></label>
      <div class="full autotags" id="nf-auto" aria-live="polite">${autoTagsHtml(f.site)}</div>
      <label class="field full"><span>Ссылка на карточку в Google Maps</span><input id="nf-maps" data-bind="nf.maps" value="${esc(f.maps)}" placeholder="https://maps.app.goo.gl/…" autocomplete="off"></label>
      <div class="field full"><span>Что ещё видно в карточке</span><div class="tags">${extra.map(t => `<button type="button" class="tg" data-act="nf-tag" data-tag="${t}" aria-pressed="${f.extra.includes(t)}" data-tip="${esc(P.TAGS[t].hint)}">${esc(P.TAGS[t].t)}</button>`).join('')}</div></div>
      <label class="check full"><input type="checkbox" id="nf-lang" data-bind="nf.lang"${f.lang ? ' checked' : ''}> Владелец говорит по-украински или по-русски</label>
    </div>
    <p class="ai-note warn" id="nf-err" role="alert" hidden></p>
    <div class="btns"><button type="submit" class="btn primary"${dis()}>Добавить в базу</button>${ctx === 'dr' ? '<button type="button" class="btn ghost" data-act="close-dr">Отмена</button>' : ''}</div>
  </form>`;
}

// Охота
V.hunt = () => {
  const city = P.CITIES.find(c => c.id === S.hunt.city) || P.CITIES[0];
  const H = CFG.hunt || {};
  const cov = id => P.CATS.filter(c => H[id + '__' + c.id]).length;
  const head = `<div class="vh"><div><h1>Охота</h1><p class="sub">Открываешь категорию в Google Maps, за 30 секунд оцениваешь карточку и сразу заносишь в базу. Проверенные категории отмечай, чтобы не ходить по кругу.</p></div></div>`;
  const cities = `<div class="cities" role="group" aria-label="Город" style="margin-bottom:16px">${P.CITIES.map(c => `<button type="button" class="chip" data-act="hunt-city" data-v="${c.id}" aria-pressed="${c.id === city.id}">${esc(c.n)}<span class="c">${cov(c.id)}/${P.CATS.length}</span></button>`).join('')}</div>`;
  const cats = P.CATS.map(c => {
    const key = city.id + '__' + c.id, d = H[key];
    const url = 'https://www.google.com/maps/search/' + encodeURIComponent(c.q + ' ' + city.n);
    const n = S.leads.filter(l => l.cat === c.id && norm(l.city) === norm(city.n)).length;
    return `<div class="cat${d ? ' done' : ''}"><div class="nm">${esc(c.t)}<small>«${esc(c.q)}» · ${esc(P.SEG[c.seg])}${n ? ' · в базе ' + n : ''}</small></div><div class="btns"><a class="btn small" href="${esc(url)}" target="_blank" rel="noopener">Открыть ↗</a><button type="button" class="btn small${d ? '' : ' ghost'}" data-act="hunt-mark" data-k="${key}" aria-pressed="${!!d}" data-tip="${d ? 'Проверено ' + esc(fmtD(d)) + '. Нажми, чтобы снять отметку' : 'Отметить категорию проверенной'}"${dis()}>${d ? '✓ ' + esc(fmtD(d)) : 'Отметить'}</button></div></div>`;
  }).join('');
  const rows = S.hunt.rows;
  const okRows = rows ? rows.filter(r => !r.dup && !r.bad) : [];
  const preview = rows ? `<div class="tbl-wrap" style="margin-top:10px"><table class="prev"><thead><tr><th>Название</th><th>Адрес</th><th>Теги</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.name || '—')}</td><td>${esc(r.address)}</td><td>${tagsFromSite(r.site).map(t => esc(P.TAGS[t].t)).join(', ') || '—'}</td><td>${r.bad ? 'нет названия' : r.dup ? 'уже в базе' : ''}</td></tr>`).join('')}</tbody></table></div>` : '';
  const paste = `<div class="card"><h2>Вставить списком</h2><p class="muted" style="margin:0 0 10px;font-size:13.5px">Одна строка — одно место: название; адрес; рейтинг; ссылка из «Witryna»; ссылка на карточку. Разделитель — точка с запятой или табуляция. Город берётся из выбранного выше: ${esc(city.n)}.</p>
    <div class="side-form"><label class="field"><span>Категория для всех строк</span><select id="hp-cat" data-bind="hunt.pasteCat">${P.CATS.map(c => `<option value="${c.id}"${S.hunt.pasteCat === c.id ? ' selected' : ''}>${esc(c.t)}</option>`).join('')}</select></label>
    <textarea id="hp-text" data-bind="hunt.paste" rows="5" placeholder="Pierogarnia Pod Kogutem; Mariacka 10; 4,5 · 320; ; https://maps.app.goo.gl/…">${esc(S.hunt.paste)}</textarea>
    <div class="btns"><button type="button" class="btn" data-act="hunt-parse">Разобрать</button>${rows ? `<button type="button" class="btn primary" data-act="hunt-import"${okRows.length && canEdit() && !S.hunt.busy ? '' : ' disabled'}>${S.hunt.busy ? 'Добавляю…' : 'Добавить ' + okRows.length}</button><button type="button" class="btn ghost" data-act="hunt-clear">Очистить</button>` : ''}</div></div>${preview}</div>`;
  const right = `<div class="stack"><div class="card"><h2>Быстро добавить</h2>${needDb() ? noDbBox() : quickForm('hunt')}</div>
    <div class="card"><h2>30 секунд на карточку</h2><ol class="checklist">${P.CHECK.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
    ${needDb() ? '' : paste}</div>`;
  return head + cities + `<div class="cols"><div class="card"><div class="card-h"><h2>Категории · ${esc(city.n)}</h2><span class="mono muted" style="font-size:12.5px">${cov(city.id)} из ${P.CATS.length} проверено</span></div>${cats}</div>${right}</div>`;
};

// Выход
function planCard(o) {
  const st = (o.leads || []).map(leadById).filter(Boolean);
  const url = routeUrl(st), res = o.results || {};
  return `<div class="card"><div class="card-h"><h2>Выход ${esc(rel(o.date))}</h2><input type="date" id="pd-${esc(o.id)}" data-ch="plan-date" data-id="${esc(o.id)}" value="${esc(o.date || '')}" aria-label="Дата выхода"${dis()}></div>
    ${st.length ? `<ol class="stops">${st.map(l => `<li><div class="main">${leadBtn(l)}<div class="muted" style="font-size:13px">${esc(leadPlace(l) || l.kind || '')}</div></div>${res[l.id] ? `<span class="res-badge">${esc(P.RESULT[res[l.id]])}</span>` : ''}<button type="button" class="btn small ghost" data-act="plan-rm" data-id="${esc(o.id)}" data-lead="${esc(l.id)}" aria-label="Убрать ${esc(l.name || '')} из выхода"${dis()}>✕</button></li>`).join('')}</ol>` : '<p class="muted" style="margin:0">Пока пусто: добавь места из списка «Кого взять».</p>'}
    ${st.length > 5 ? '<p class="ai-note warn" style="margin-top:8px">Больше пяти мест за выход тяжело. Оставь 4–5 ближайших.</p>' : ''}
    <div class="btns" style="margin-top:12px">${url ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Маршрут пешком ↗</a>` : ''}<button type="button" class="btn primary" data-act="run-start" data-id="${esc(o.id)}"${st.length && canEdit() ? '' : ' disabled'}>Начать выход</button>
    ${S.plan.del === o.id ? `<span class="confirm">Удалить выход? <button type="button" class="btn small danger" data-act="plan-del-yes" data-id="${esc(o.id)}">Удалить</button><button type="button" class="btn small ghost" data-act="plan-del-no">Отмена</button></span>` : `<button type="button" class="btn small ghost" data-act="plan-del" data-id="${esc(o.id)}"${dis()}>Удалить</button>`}</div>
    ${st.length > 3 ? '<p class="ai-note" style="margin-top:8px">Мобильный браузер может показать в Google Maps не все точки. Тогда открой маршрут в приложении.</p>' : ''}</div>`;
}
V.outing = () => {
  if (S.run.id) return runView();
  const head = `<div class="vh"><div><h1>Выход</h1><p class="sub">Собери 4–5 мест рядом, пройди маршрут пешком и отмечай результат прямо у двери. Статусы и следующие шаги заполнятся сами.</p></div></div>`;
  if (needDb()) return head + noDbBox();
  const ps = plans();
  const planHtml = ps.length ? ps.map(planCard).join('') : `<div class="card"><h2>План</h2>${emptyBox('Выход не запланирован', 'Добавь места из списка «Кого взять» или кнопкой «В выход» на главной.', 'small')}<div class="btns" style="margin-top:12px"><button type="button" class="btn" data-act="plan-new"${dis()}>Создать пустой выход</button></div></div>`;
  const cnt = {};
  S.leads.filter(l => stOf(l) === 'new').forEach(l => { const c = l.city || '—'; cnt[c] = (cnt[c] || 0) + 1; });
  const cities = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
  const city = S.plan.city && (S.plan.city === '*' || cnt[S.plan.city] || S.leads.some(l => l.city === S.plan.city)) ? S.plan.city : (cities[0] || '*');
  const cand = S.leads.filter(l => ['new', 'contact', 'talk'].includes(stOf(l)) && !inPlan(l.id) && (city === '*' || (l.city || '—') === city)).sort((a, b) => score(b) - score(a)).slice(0, 20);
  const right = `<div class="card"><div class="card-h"><h2>Кого взять</h2><select id="pl-city" data-ch="plan-city" aria-label="Город"><option value="*"${city === '*' ? ' selected' : ''}>Все города</option>${cities.map(c => `<option value="${esc(c)}"${c === city ? ' selected' : ''}>${esc(c)} · ${cnt[c]}</option>`).join('')}</select></div>
    ${cand.length ? `<ul class="rows">${cand.map(l => `<li class="row">${scoreBadge(l)}<div class="main">${leadBtn(l)}<div class="s">${esc(l.address || l.kind || '')}${stOf(l) !== 'new' ? ' · ' + esc(stT(stOf(l))) : ''}</div></div><div class="acts"><button type="button" class="btn small" data-act="plan-add" data-id="${esc(l.id)}"${dis()}>В выход</button></div></li>`).join('')}</ul>` : emptyBox('Некого добавить', 'Все подходящие лиды этого города уже в плане. Новых ищи в «Охоте».', 'small')}</div>`;
  const done = S.outings.filter(o => o.done).sort((a, b) => String(b.doneAt || b.date).localeCompare(String(a.doneAt || a.date))).slice(0, 8);
  const hist = done.length ? `<div class="card"><h2>Прошедшие выходы</h2><ul class="rows">${done.map(o => {
    const c = {}; Object.values(o.results || {}).forEach(v => { c[v] = (c[v] || 0) + 1; });
    const n = (o.leads || []).length;
    return `<li class="row"><div class="main"><b>${esc(fmtD(o.doneAt || o.date))}</b><div class="s">${n} ${plural(n, 'место', 'места', 'мест')} · ${Object.keys(RES_LABEL).filter(k => c[k]).map(k => P.RESULT[k].toLowerCase() + ': ' + c[k]).join(', ') || 'без отметок'}</div></div></li>`;
  }).join('')}</ul></div>` : '';
  return head + `<div class="cols"><div class="stack">${planHtml}${hist}</div><div class="stack">${right}</div></div>`;
};
function runView() {
  const o = S.outings.find(x => x.id === S.run.id);
  if (!o) { S.run.id = null; return V.outing(); }
  const stops = (o.leads || []).map(leadById).filter(Boolean);
  const res = o.results || {}, n = stops.length;
  const i = S.run.i = Math.max(0, Math.min(S.run.i, n));
  const dots = stops.map((l, k) => `<button type="button" data-act="run-go" data-v="${k}" class="${res[l.id] ? 'r-' + res[l.id] : ''}" aria-current="${k === i ? 'step' : 'false'}" aria-label="${k + 1}. ${esc(l.name || '')}${res[l.id] ? ': ' + esc(P.RESULT[res[l.id]]) : ''}" data-tip="${esc(l.name || '')}${res[l.id] ? '\n' + esc(P.RESULT[res[l.id]]) : ''}">${k + 1}</button>`).join('')
    + `<button type="button" data-act="run-go" data-v="${n}" aria-current="${i === n ? 'step' : 'false'}" aria-label="Итог выхода" data-tip="Итог выхода">✓</button>`;
  const top = `<div class="run-top"><div><p class="eyebrow">Выход · ${esc(fmtD(o.date))} · ${Object.keys(res).length} из ${n} отмечено</p><div class="dots">${dots}</div></div><button type="button" class="btn ghost" data-act="run-exit">Пауза</button></div>`;
  if (i === n) {
    const c = {}; stops.forEach(l => { const r = res[l.id]; if (r) c[r] = (c[r] || 0) + 1; });
    const left = stops.filter(l => !res[l.id]).length;
    return `<div class="run">${top}<div class="run-card"><h2>Итог выхода</h2>
      <div class="results">${Object.keys(RES_LABEL).map(k => `<div class="kpi"><div class="lbl">${esc(RES_LABEL[k])}</div><div class="val">${c[k] || 0}</div></div>`).join('')}</div>
      <ul class="rows">${stops.map((l, k) => `<li class="row"><div class="main"><button type="button" class="t lnk" data-act="run-go" data-v="${k}">${esc(l.name)}</button><div class="s">${esc(l.next || '')}${l.nextDate ? ' · ' + dateSpan(l.nextDate) : ''}</div></div><span class="res-badge">${res[l.id] ? esc(P.RESULT[res[l.id]]) : 'не отмечено'}</span></li>`).join('')}</ul>
      ${left ? `<p class="ai-note warn">Не отмечено мест: ${left}. После завершения они вернутся в список «Кого взять».</p>` : ''}
      <div class="btns"><button type="button" class="btn primary" data-act="run-finish"${dis()}>Завершить выход</button><button type="button" class="btn" data-act="run-exit">Вернуться к плану</button></div></div></div>`;
  }
  const l = stops[i];
  const lang = S.run.lang || leadLang(l);
  const op = P.OPENERS[openerKey(l)];
  const diag = tagsOf(l).map(t => P.TAGS[t].d && P.TAGS[t].d[lang]).filter(Boolean)[0];
  const c = caseOf(P.SEG_CASE[segOf(l)]);
  const r = res[l.id];
  const how = S.run.how[l.id] != null ? S.run.how[l.id] : (l.consentHow || '');
  const meta = [l.kind, leadPlace(l), l.rating ? '★ ' + l.rating : ''].filter(Boolean).map(esc).join(' · ');
  const go = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + encodeURIComponent(l.address ? leadPlace(l) : [l.name, l.city].filter(Boolean).join(', '));
  return `<div class="run">${top}<div class="run-card">
    <div class="lc-h"><div style="min-width:0"><h2>${esc(l.name || 'Без названия')}</h2>${meta ? `<p class="meta" style="margin:6px 0 0;font:400 12.5px/1.45 var(--f-mono);color:var(--muted)">${meta}</p>` : ''}</div>${scoreBadge(l)}</div>
    <div class="tags">${statusPill(l)}${tagChips(l)}${l.lang ? '<span class="tg lang">свой язык</span>' : ''}${l.decider ? `<span class="tg">${esc(l.decider)}</span>` : ''}${r ? `<span class="res-badge">${esc(P.RESULT[r])}</span>` : ''}</div>
    <div class="btns"><a class="btn small" href="${esc(go)}" target="_blank" rel="noopener">Как дойти ↗</a>${safeUrl(l.maps) ? `<a class="btn small" href="${esc(safeUrl(l.maps))}" target="_blank" rel="noopener">Карточка ↗</a>` : ''}<button type="button" class="btn small" data-act="go-demo" data-id="${esc(l.id)}">Демо их сайта</button>${langCtl('run-lang', lang)}</div>
    ${sayBox('Вход', fill(op[lang], l, lang), 'r-open')}
    ${diag ? sayBox('Проблема одной фразой', diag, 'r-diag') : ''}
    ${c ? `<div class="say"><header><b>Покажи на телефоне</b></header><p>${caseLink(c)} · ${esc(c.d.ru)}</p></div>` : ''}
    <details class="obj"><summary>Владельца нет, «подумаю», согласие на связь</summary><div class="in">${['absent', 'close', 'consent'].map(k => `<p><b>${esc(P.LINES[k].t)}.</b> ${esc(fill(P.LINES[k][lang], l, lang))}</p>`).join('')}</div></details>
    <label class="field"><span>Что сказали</span><textarea id="run-notes" data-bind="run.notes.${esc(l.id)}" rows="2" placeholder="Кто решает, когда бывает, что ответили">${esc(S.run.notes[l.id] || '')}</textarea></label>
    <div class="results" role="group" aria-label="Результат визита">${Object.keys(RES_LABEL).map(k => `<button type="button" class="btn${r === k ? ' sel' : ''}" data-act="run-res" data-v="${k}" data-id="${esc(l.id)}"${dis()}>${esc(RES_LABEL[k])}</button>`).join('')}</div>
    ${S.run.lostFor === l.id ? `<div class="say"><header><b>Почему отказ?</b></header><div class="chips">${P.LOST.map(x => `<button type="button" class="chip" data-act="run-lost" data-v="${x.k}" data-id="${esc(l.id)}">${esc(x.t)}</button>`).join('')}</div></div>` : ''}
    <div class="form-grid"><label class="check"><input type="checkbox" id="run-consent" data-ch="run-consent" data-id="${esc(l.id)}"${l.consent ? ' checked' : ''}${dis()}> Согласие на связь получено</label><input id="run-how" data-bind="run.how.${esc(l.id)}" data-ch="run-how" data-id="${esc(l.id)}" value="${esc(how)}" placeholder="Как: WhatsApp, почта, телефон" aria-label="Способ связи"></div>
    <div class="btns" style="justify-content:space-between"><button type="button" class="btn ghost" data-act="run-go" data-v="${i - 1}"${i === 0 ? ' disabled' : ''}>← Назад</button><button type="button" class="btn" data-act="run-go" data-v="${i + 1}">${i === n - 1 ? 'К итогу →' : 'Дальше →'}</button></div>
  </div></div>`;
}

// Скрипты
const aiOn = () => !!S.sample && CFG.aiEnabled !== false;
function aiBox(key, title, hint, bind) {
  if (!aiOn()) return '';
  const st = S.ai[key] || {};
  const val = bind ? (getPath(S, bind) || '') : '';
  return `<div class="ai" data-ai="${key}"><div class="card-h" style="margin:0"><h2>${esc(title)}</h2><span class="muted" style="font-size:12.5px">ответ расходует твой лимит Claude</span></div>
    ${bind ? `<textarea id="ai-q-${key}" data-bind="${bind}" rows="2" placeholder="${esc(hint)}">${esc(val)}</textarea>` : `<p class="ai-note">${esc(hint)}</p>`}
    <div class="btns"><button type="button" class="btn primary" data-act="ai-ask" data-k="${key}"${st.busy ? ' disabled' : ''}>${st.text ? 'Спросить снова' : 'Спросить'}</button><button type="button" class="btn" data-act="ai-ask" data-k="${key}" data-fresh="1"${st.busy || !st.text ? ' hidden' : ''}>Другой вариант</button><button type="button" class="btn ghost" data-act="ai-stop" data-k="${key}"${st.busy ? '' : ' hidden'}>Стоп</button><button type="button" class="btn ghost" data-act="ai-copy" data-k="${key}"${!st.busy && st.text ? '' : ' hidden'}>Копировать</button></div>
    <div class="ai-out" id="ai-out-${key}" aria-live="polite">${esc(st.text || '')}</div>
    <p class="ai-note${st.warn ? ' warn' : ''}" id="ai-note-${key}"${st.note ? '' : ' hidden'}>${esc(st.note || '')}</p></div>`;
}
V.scripts = () => {
  const lang = S.scr.lang, l = leadById(S.scr.lead);
  const head = `<div class="vh"><div><h1>Скрипты</h1><p class="sub">Фразы для визита, ответы на возражения и сообщения после согласия, на четырёх языках. Выбери лида, и в текст подставятся его город, проблема и подходящий кейс.</p></div></div>`;
  const tools = `<div class="tools" style="margin-bottom:6px">${langCtl('scr-lang', lang)}<select id="scr-lead" data-ch="scr-lead" aria-label="Лид">${leadOptions(S.scr.lead, '— подставить лида —')}</select>${l ? `<span class="tg${l.consent ? ' ok' : ' warn'}">${l.consent ? 'согласие есть' + (l.consentDate ? ' · ' + esc(fmtD(l.consentDate)) : '') : 'согласия на связь нет'}</span>` : ''}</div>`;
  const rec = openerKey(l);
  const order = l ? [rec].concat(Object.keys(P.OPENERS).filter(k => k !== rec)) : Object.keys(P.OPENERS);
  const openers = order.map((k, idx) => sayBox((l && idx === 0 ? 'Для этого лида · ' : '') + P.OPENERS[k].t, fill(P.OPENERS[k][lang], l, lang), 'so-' + k)).join('');
  const lines = ['absent', 'close', 'consent'].map(k => sayBox(P.LINES[k].t, fill(P.LINES[k][lang], l, lang), 'sl-' + k)).join('');
  const blocked = l && !l.consent;
  const follow = P.FOLLOW.map(f => `<div class="say lock"><header><b>${esc(f.t)}</b>${blocked ? '<span class="tg warn">нужно согласие</span>' : `<button type="button" class="btn small" data-act="copy" data-src="sf-${f.k}">Копировать</button>`}</header><p id="sf-${f.k}">${esc(fill(f[lang], l, lang))}</p></div>`).join('');
  const ai = aiBox('scr', 'Подсказка от Claude', 'Что сказал владелец или в чём затык? Например: «сын обещал сделать сайт бесплатно».', 'scr.q');
  return head + tools
    + `<h2 class="sec-t">Вход в разговор</h2><div class="scr-grid">${openers}</div>`
    + `<h2 class="sec-t">По ходу разговора</h2><div class="scr-grid">${lines}</div>`
    + `<h2 class="sec-t">Возражения</h2><div class="scr-grid" style="align-items:start">${objDetails(P.OBJ.map(o => o.k), l, lang, 'ob')}</div>`
    + (ai ? `<h2 class="sec-t">Если разговор ушёл в сторону</h2>${ai}` : '')
    + `<h2 class="sec-t">После визита</h2><div class="warnbox" style="margin-bottom:12px">Эти сообщения можно отправлять только тем, кто сам дал согласие на связь: оставил номер или почту и разрешил написать. Иначе это коммерческое сообщение без согласия, а его запрещает art. 398 PKE.</div><div class="scr-grid">${follow}</div>`;
};

// КП
function kpOpts() {
  const k = S.kp, l = leadById(k.lead);
  return {lead: l, name: l ? l.name : k.manual.trim(), address: '', city: '', pk: k.pk || [], lang: k.lang, note: k.note.trim(), number: k.num || kpNumber(), date: today()};
}
const kpBuilt = () => buildKp(kpOpts());
function kpUpdate() { const host = $('#kp-host'); if (host) mountShadow(host, KP_CSS, kpBuilt().html); }
V.offer = () => {
  const k = S.kp, l = leadById(k.lead);
  if (!Array.isArray(k.pk)) k.pk = l ? leadPk(l) : ['menu'];
  const head = `<div class="vh"><div><h1>КП</h1><p class="sub">Предложение на языке владельца: что не так сейчас, что сделать, сколько стоит и примеры работ. Скачай и распечатай или покажи с телефона.</p></div></div>`;
  const pkList = P.PACKAGES.map(p => { const pc = priceOf(p); return `<label class="pk-item"><input type="checkbox" data-ch="kp-pk" value="${p.id}"${k.pk.includes(p.id) ? ' checked' : ''}><span><b>${esc(p.n.ru)}</b><small>${esc(p.d.ru)}</small></span><span class="p">от ${fmtZl(pc.from)}${p.unit === 'month' ? '/мес' : ''}</span></label>`; }).join('');
  const left = `<div class="side-form">
    <label class="field"><span>Для кого</span><select id="kp-lead" data-ch="kp-lead">${leadOptions(k.lead, '— без лида, впишу сам —')}</select></label>
    ${l ? '' : `<label class="field"><span>Название заведения или фирмы</span><input id="kp-manual" data-bind="kp.manual" data-in="kp-upd" value="${esc(k.manual)}" autocomplete="off"></label>`}
    <div class="field"><span>Язык</span>${langCtl('kp-lang', k.lang)}</div>
    <div class="field"><span>Пакеты</span><div class="pk-list">${pkList}</div></div>
    <label class="field"><span>Своя строка в начале (необязательно)</span><textarea id="kp-note" data-bind="kp.note" data-in="kp-upd" rows="3" placeholder="Например: старт до конца месяца, меню на трёх языках">${esc(k.note)}</textarea></label>
    ${l && !l.consent ? '<div class="warnbox">У этого лида нет согласия на связь. КП печатай или показывай с телефона при встрече, письмом не отправляй.</div>' : ''}
    <div class="btns">${S.dl ? '<button type="button" class="btn" data-act="kp-dl">Скачать .html</button>' : ''}<button type="button" class="btn" data-act="kp-copy">Копировать текст</button><button type="button" class="btn primary" data-act="kp-log"${l && canEdit() ? '' : ' disabled'}>КП передано</button></div>
    <p class="ai-note">«КП передано» записывает предложение в историю лида, ставит статус «КП передано», пакеты, сумму и шаг «узнать решение» через 4 дня. Номер этого КП: <span class="mono">${esc(k.num || kpNumber())}</span>${k.num ? ' (уже записан в историю)' : ''}. Цены пакетов меняются в «Настройках».</p>
  </div>`;
  return head + `<div class="cols wide-r"><div class="card">${left}</div><div class="paper"><div id="kp-host"></div></div></div>`;
};
AFTER.offer = () => { ensureFont(KP_FONTS); kpUpdate(); };

// Демо
V.demo = () => {
  const d = S.demo, cfg = demoCfg();
  const head = `<div class="vh"><div><h1>Демо</h1><p class="sub">Черновик сайта для владельца прямо на визите. Название, город, адрес и рейтинг берутся из карточки, стиль подбирается по кухне или виду услуг.</p></div>${S.run.id ? '<a class="btn" href="#outing">← Вернуться к выходу</a>' : ''}</div>`;
  const auto = styleById(guessStyle(cfg.l));
  const left = `<div class="side-form">
    <label class="field"><span>Для кого</span><select id="dm-lead" data-ch="demo-lead">${leadOptions(d.lead, '— без лида, впишу сам —')}</select></label>
    ${cfg.l ? '' : `<label class="field"><span>Название</span><input id="dm-name" data-bind="demo.name" data-in="demo-upd" value="${esc(d.name)}" placeholder="Twoja nazwa" autocomplete="off"></label><label class="field"><span>Город</span><input id="dm-city" data-bind="demo.city" data-in="demo-upd" value="${esc(d.city)}" list="dl-cities-dm" autocomplete="off">${citiesDatalist('dl-cities-dm')}</label>`}
    <label class="field"><span>Стиль</span><select id="dm-style" data-ch="demo-style"><option value="">Авто: ${esc(auto ? auto.t : '')}</option>${P.STYLES.map(s => `<option value="${s.id}"${d.style === s.id ? ' selected' : ''}>${esc(s.t)}</option>`).join('')}</select></label>
    <div class="field"><span>Тип страницы</span><div class="seg-ctl" role="group" aria-label="Тип страницы"><button type="button" data-act="demo-layout" data-v="r" aria-pressed="${cfg.layout === 'r'}">Ресторан: меню и бронь</button><button type="button" data-act="demo-layout" data-v="s" aria-pressed="${cfg.layout === 's'}">Услуги: прайс и заявка</button></div></div>
    <div class="btns"><button type="button" class="btn primary" data-act="demo-full">Во весь экран</button>${S.dl ? '<button type="button" class="btn" data-act="demo-dl">Скачать .html</button>' : ''}</div>
    <p class="ai-note">Блюда, услуги, цены и часы работы в демо примерные и помечены так на самой странице. Внизу подпись: демо подготовил ${esc(CFG.profile.brand || 'syncae')}. Скачанный файл открывается на телефоне без интернета, только шрифты подтягиваются из сети.</p>
  </div>`;
  const stage = `<div class="stage${d.full ? ' full' : ''}" id="dm-stage" data-dev="${d.dev}"${d.full ? ' role="dialog" aria-modal="true" aria-label="Демо во весь экран"' : ''}><div class="stage-bar"><div class="seg-ctl" role="group" aria-label="Экран"><button type="button" data-act="demo-dev" data-v="phone" aria-pressed="${d.dev === 'phone'}">Телефон</button><button type="button" data-act="demo-dev" data-v="desk" aria-pressed="${d.dev === 'desk'}">Компьютер</button></div><div class="btns">${langCtl('demo-lang', d.lang, ['pl', 'en'])}${d.full ? '<button type="button" class="btn" id="dm-close" data-act="demo-close">Закрыть</button>' : ''}</div></div><div class="stage-host" id="dm-host" data-keep="demo"></div></div>`;
  return head + `<div class="cols wide-r"><div class="card">${left}</div>${stage}</div>`;
};
function mountDemo() {
  const host = $('#dm-host');
  if (!host) return;
  const cfg = demoCfg();
  ensureFont(demoFontUrl(cfg.st));
  mountShadow(host, DEMO_CSS, buildDemo(cfg, S.demo.lang), demoEvent);
}
function demoEvent(type, e, root) {
  if (type === 'submit') { e.preventDefault(); const ok = root.querySelector('[data-demo-ok]'); if (ok) ok.hidden = false; return; }
  const b = e.target.closest('[data-dl]');
  if (b) { e.preventDefault(); S.demo.lang = b.getAttribute('data-dl'); render(); return; }
  const a = e.target.closest('a[href^="#"]');
  if (a) { e.preventDefault(); const t = root.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({behavior: 'smooth', block: 'start'}); }
}
AFTER.demo = () => { mountDemo(); document.documentElement.classList.toggle('lock', !!S.demo.full || !!S.dr.id); if (S.demo.full) { const c = $('#dm-close'); if (c && !c.contains(document.activeElement)) c.focus({preventScroll: true}); } };

// Итоги
function weekChart(weeks, goal) {
  const W = 640, H = 230, ml = 30, mr = 10, mt = 18, mb = 30;
  const maxV = Math.max(goal, ...weeks.map(w => w.visits), 1);
  const step = maxV <= 5 ? 1 : maxV <= 12 ? 2 : maxV <= 30 ? 5 : 10;
  const top = Math.ceil(maxV * 1.12 / step) * step;
  const iw = W - ml - mr, ih = H - mt - mb, bw = iw / weeks.length;
  const y = v => mt + ih - v / top * ih;
  let g = '';
  for (let v = 0; v <= top; v += step) g += `<line class="gl" x1="${ml}" x2="${W - mr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${ml - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
  const bars = weeks.map((w, i) => {
    const x = ml + i * bw, bx = x + bw * 0.22, bwid = bw * 0.56, v = w.visits;
    const yt = y(v), y0 = y(0), r = Math.min(4, (y0 - yt));
    const path = v ? `M${bx.toFixed(1)},${y0} V${(yt + r).toFixed(1)} Q${bx.toFixed(1)},${yt.toFixed(1)} ${(bx + r).toFixed(1)},${yt.toFixed(1)} H${(bx + bwid - r).toFixed(1)} Q${(bx + bwid).toFixed(1)},${yt.toFixed(1)} ${(bx + bwid).toFixed(1)},${(yt + r).toFixed(1)} V${y0} Z` : '';
    const end = addDays(w.start, 6);
    const tip = `${fmtD(w.start)} – ${fmtD(end)}: ${v} ${plural(v, 'визит', 'визита', 'визитов')}${goal ? (v >= goal ? '\nцель выполнена' : '\nдо цели ' + (goal - v)) : ''}`;
    return `<rect class="hit" x="${x.toFixed(1)}" y="${mt}" width="${bw.toFixed(1)}" height="${ih}" data-tip="${esc(tip)}" tabindex="0" aria-label="${esc(tip.replace(/\n/g, ', '))}"/>${path ? `<path class="bar" d="${path}"/>` : ''}<text class="ax" x="${(x + bw / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle">${i === weeks.length - 1 ? 'эта' : esc(fmtD(w.start))}</text>`;
  }).join('');
  const goalLine = goal ? `<line class="goal" x1="${ml}" x2="${W - mr}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}"/><text class="goal-l" x="${W - mr}" y="${(y(goal) - 6).toFixed(1)}" text-anchor="end">цель ${goal}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Визиты по неделям за 8 недель${goal ? ', цель ' + goal + ' в неделю' : ''}">${g}${bars}${goalLine}</svg>`;
}
function hbars(rows, unit) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return `<div class="hbars">${rows.map(([t, v, sub]) => `<div class="hbar"><span class="lb">${esc(t)}</span><span class="tr"><span style="width:${(v / max * 100).toFixed(1)}%" data-tip="${esc(t)}: ${v}${unit ? ' ' + unit : ''}${sub ? '\n' + esc(sub) : ''}"></span></span><span class="v">${v}${sub ? ` <small>${esc(sub.split(' ')[0])}</small>` : ''}</span></div>`).join('')}</div>`;
}
V.stats = () => {
  const head = `<div class="vh"><div><h1>Итоги</h1><p class="sub">Сколько мест в работе, на каком шаге они отваливаются и сколько визитов в неделю получается на самом деле.</p></div></div>`;
  if (needDb()) return head + noDbBox();
  const L = S.leads, total = L.length;
  const work = L.filter(l => ['contact', 'talk', 'offer'].includes(stOf(l))).length;
  const won = L.filter(l => stOf(l) === 'won');
  const touched = L.filter(l => stOf(l) !== 'new').length;
  const conv = touched ? Math.round(won.length / touched * 100) : 0;
  const revenue = won.reduce((s, l) => s + (+l.value || 0), 0);
  const pipeVal = L.filter(l => ['talk', 'offer'].includes(stOf(l))).reduce((s, l) => s + (+l.value || 0), 0);
  const kpis = [
    ['Лидов в базе', fmtN(total), L.filter(l => stOf(l) === 'new').length + ' ещё не трогали'],
    ['В работе', fmtN(work), 'контакт, разговор, КП'],
    ['Клиентов', fmtN(won.length), 'с начала работы'],
    ['Конверсия', conv + '%', won.length + ' из ' + touched + ' после контакта'],
    ['Выручка', fmtZl(revenue), 'в этом месяце ' + fmtZl(monthWon(today().slice(0, 7)))],
    ['В воронке', fmtZl(pipeVal), 'сумма у «Обсуждаем» и «КП»']
  ].map(([a, b, c]) => `<div class="kpi"><div class="lbl">${esc(a)}</div><div class="val" title="${esc(b)}">${esc(b)}</div><div class="sub">${esc(c)}</div></div>`).join('');
  const stages = [['Все лиды', 0], ['Познакомились', 1], ['Обсуждаем', 2], ['КП передано', 3], ['Клиент', 4]];
  const fv = stages.map(([t, r]) => [t, r === 0 ? total : L.filter(l => reach(l) >= r).length]);
  const funnel = hbars(fv.map(([t, v], i) => [t, v, i && fv[i - 1][1] ? Math.round(v / fv[i - 1][1] * 100) + '% от предыдущего шага' : '']));
  const weeks = []; for (let k = 7; k >= 0; k--) weeks.push(weekStats(k));
  const goal = +CFG.goals.visits || 0;
  const weekBlock = S.stats.table
    ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Неделя</th><th class="n">Визиты</th><th class="n">Выходы</th><th class="n">КП</th></tr></thead><tbody>${weeks.slice().reverse().map(w => `<tr><td>${esc(fmtD(w.start))} – ${esc(fmtD(addDays(w.start, 6)))}</td><td class="n">${w.visits}</td><td class="n">${w.outings}</td><td class="n">${w.offers}</td></tr>`).join('')}</tbody></table></div>`
    : weekChart(weeks, goal);
  const lost = L.filter(l => stOf(l) === 'lost');
  const lr = P.LOST.map(x => [x.t, lost.filter(l => l.lostReason === x.k).length]).concat([['Не указана', lost.filter(l => !P.LOST.some(x => x.k === l.lostReason)).length]]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const segRows = Object.keys(P.SEG).map(k => {
    const ls = L.filter(l => segOf(l) === k);
    if (!ls.length) return '';
    const w = ls.filter(l => stOf(l) === 'won');
    return `<tr><td>${esc(P.SEG[k])}</td><td class="n">${ls.length}</td><td class="n">${ls.filter(l => ['contact', 'talk', 'offer'].includes(stOf(l))).length}</td><td class="n">${w.length}</td><td class="n">${fmtZl(w.reduce((s, l) => s + (+l.value || 0), 0))}</td><td class="n">${Math.round(ls.reduce((s, l) => s + score(l), 0) / ls.length)}</td></tr>`;
  }).join('');
  return head + `<div class="kpis">${kpis}</div>
    <div class="cols even"><div class="card"><h2>Воронка</h2>${funnel}<p class="ai-note" style="margin-top:10px">Отказ после визита считается как «познакомились»: разговор был.</p></div>
    <div class="card"><div class="card-h"><h2>Визиты по неделям</h2><button type="button" class="btn small ghost" data-act="stats-table" aria-pressed="${S.stats.table}">${S.stats.table ? 'График' : 'Таблица'}</button></div>${weekBlock}</div></div>
    <div class="cols even" style="margin-top:16px"><div class="card"><h2>Почему отказывают</h2>${lr.length ? hbars(lr) : emptyBox('Отказов пока нет', 'Когда отметишь отказ в выходе или в карточке, здесь появятся причины.', 'small')}</div>
    <div class="card"><h2>По сегментам</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Сегмент</th><th class="n">Лидов</th><th class="n">В работе</th><th class="n">Клиентов</th><th class="n">Выручка</th><th class="n">Оценка</th></tr></thead><tbody>${segRows}</tbody></table></div></div></div>`;
};

// Справка
V.guide = () => $('#tpl-guide').innerHTML;
AFTER.guide = () => {
  const ev = $('[data-slot="events"]'); if (ev) ev.innerHTML = eventsHtml();
  const st = $('[data-slot="steps"]'); if (st) st.innerHTML = P.STEPS.map(s => `<li><span>${esc(s)}</span></li>`).join('');
};

// Настройки
V.prefs = () => {
  const ro = !canEdit(), pr = CFG.profile, g = CFG.goals;
  const head = `<div class="vh"><div><h1>Настройки</h1><p class="sub">Подпись в КП и демо, цели недели, цены пакетов и ссылки на кейсы. Изменения сохраняются сразу.</p></div></div>`;
  const inp = (path, label, val, o) => { o = o || {}; return `<label class="field${o.full ? ' full' : ''}"><span>${esc(label)}</span><input id="st-${path.replace(/\./g, '-')}" data-set="${path}" type="${o.type || 'text'}" value="${esc(val == null ? '' : val)}" placeholder="${esc(o.ph || '')}"${o.type === 'number' ? ' min="0" inputmode="numeric"' : ''} autocomplete="off"${ro ? ' readonly' : ''}></label>`; };
  const prices = P.PACKAGES.map(p => { const o = (CFG.prices || {})[p.id] || {}; return `<tr><td>${esc(p.n.ru)}${p.note ? `<div class="muted" style="font-size:12px;white-space:normal">${esc(p.note)}</div>` : ''}</td><td><input id="pr-${p.id}-from" data-set="prices.${p.id}.from" type="number" min="0" inputmode="numeric" value="${esc(o.from == null ? '' : o.from)}" placeholder="${p.from}" aria-label="${esc(p.n.ru)}: от"${ro ? ' readonly' : ''} style="width:96px"></td><td><input id="pr-${p.id}-to" data-set="prices.${p.id}.to" type="number" min="0" inputmode="numeric" value="${esc(o.to == null ? '' : o.to)}" placeholder="${p.to}" aria-label="${esc(p.n.ru)}: до"${ro ? ' readonly' : ''} style="width:96px"></td><td class="muted">${p.unit === 'month' ? 'в месяц' : 'разово'}</td></tr>`; }).join('');
  const cases = Object.entries(P.CASES).map(([id, c]) => inp('cases.' + id, c.name, (CFG.cases || {})[id] || '', {ph: c.url || 'ссылки пока нет'})).join('');
  const aiState = S.sample ? (CFG.aiEnabled !== false ? 'включён' : 'выключен') : 'недоступен в этом окне';
  return head + `<div class="cols even">
    <div class="stack"><div class="card"><h2>Подпись</h2><div class="form-grid">${inp('profile.brand', 'Имя или бренд', pr.brand)}${inp('profile.portfolio', 'Портфолио', pr.portfolio, {ph: 'https://'})}${inp('profile.about', 'Строка под именем в КП (на польском)', pr.about, {full: true})}${inp('profile.phone', 'Телефон для КП', pr.phone, {ph: '+48 …'})}${inp('profile.email', 'Почта для КП', pr.email)}</div><p class="ai-note" style="margin-top:10px">Телефон и почта попадают только в КП, которое ты сам скачиваешь.</p></div>
    <div class="card"><h2>Цели</h2><div class="form-grid">${inp('goals.outings', 'Выходов в неделю', g.outings, {type: 'number'})}${inp('goals.visits', 'Визитов в неделю', g.visits, {type: 'number'})}${inp('goals.offers', 'КП в неделю', g.offers, {type: 'number'})}${inp('goals.month', 'Выручка за месяц, zł', g.month, {type: 'number'})}</div></div>
    <div class="card"><h2>Claude-помощник</h2><label class="check"><input type="checkbox" id="st-ai" data-set="aiEnabled"${CFG.aiEnabled !== false ? ' checked' : ''}${ro ? ' disabled' : ''}> Показывать подсказки Claude в «Скриптах» и в карточке лида</label><p class="ai-note" style="margin-top:8px">Сейчас: ${esc(aiState)}. Каждый ответ расходует лимит твоего аккаунта Claude, при первом вопросе браузер попросит разрешение.</p></div>
    <div class="card"><h2>Данные</h2><p class="muted" style="margin:0 0 10px">Лидов: ${S.leads.length}, записей в истории: ${S.acts.length}, выходов: ${S.outings.length}.</p><div class="btns">${S.dl ? `<button type="button" class="btn" data-act="csv"${S.leads.length ? '' : ' disabled'}>Лиды в CSV</button><button type="button" class="btn" data-act="json"${S.db ? '' : ' disabled'}>Резервная копия .json</button>` : '<span class="muted">Скачивание недоступно в этом окне.</span>'}</div></div></div>
    <div class="stack"><div class="card"><h2>Цены пакетов, zł</h2><p class="ai-note" style="margin:0 0 10px">Пустое поле — цена по умолчанию (серым). В КП попадает «от».</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Пакет</th><th>От</th><th>До</th><th></th></tr></thead><tbody>${prices}</tbody></table></div></div>
    <div class="card"><h2>Ссылки на кейсы</h2><div class="form-grid">${cases}</div><p class="ai-note" style="margin-top:10px">Пустое поле — ссылка по умолчанию. Эти ссылки идут в КП, скрипты и сообщения.</p></div></div>
  </div>`;
};
