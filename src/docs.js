// Коммерческое предложение
// Бумага всегда светлая: это документ для печати и для владельца, а не часть интерфейса.
const KP_FONTS = 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Unbounded:wght@600;700&display=swap';
const KP_CSS = `
.kp{font-family:"Golos Text",system-ui,-apple-system,"Segoe UI",sans-serif;color:#141922;background:#FFFFFF;line-height:1.5;font-size:14px;padding:40px 44px 36px;max-width:820px;margin:0 auto}
.kp *{box-sizing:border-box}
.kp .top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;padding-bottom:18px;border-bottom:3px solid #141922}
.kp .brand{font:700 15px/1.2 "Unbounded","Golos Text",sans-serif;display:flex;align-items:center;gap:8px}
.kp .mark{width:14px;height:14px;border-radius:3px;background:linear-gradient(#E3B100 50%,#1E4FD6 50%)}
.kp .about{color:#5A6474;font-size:12.5px;margin-top:4px;max-width:36ch}
.kp .meta{font:500 12px/1.6 "JetBrains Mono",ui-monospace,monospace;color:#5A6474;text-align:right}
.kp h1{font:700 26px/1.15 "Unbounded","Golos Text",sans-serif;margin:24px 0 4px;letter-spacing:-.01em}
.kp .to{font-size:16px;margin:0}
.kp .to small{display:block;color:#5A6474;font-size:13px}
.kp h2{font:600 11.5px/1 "Golos Text",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#5A6474;margin:28px 0 10px}
.kp ul.issues{margin:0;padding-left:18px;display:grid;gap:6px}
.kp table{width:100%;border-collapse:collapse}
.kp td{padding:11px 0;border-bottom:1px solid #DADFE7;vertical-align:top}
.kp td + td{padding-left:16px}
.kp td b{display:block;font-size:15px}
.kp td small{color:#5A6474;font-size:13px}
.kp td.p{white-space:nowrap;text-align:right;font:500 13.5px/1.4 "JetBrains Mono",ui-monospace,monospace}
.kp td.p small{display:block;font-family:"Golos Text",sans-serif}
.kp tr.tot td{border-bottom:0;padding-top:14px}
.kp tr.tot td:first-child{font-weight:600}
.kp tr.tot td.p{font-size:16px;font-weight:500;color:#141922}
.kp .cases{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.kp .cases b{font-weight:600}
.kp .cases a{color:#1E4FD6;word-break:break-all}
.kp ol.proc{margin:0;padding-left:20px;display:grid;gap:4px}
.kp .own{margin:0;white-space:pre-wrap}
.kp .note{color:#5A6474;font-size:12.5px;margin:14px 0 0}
.kp .foot{display:flex;flex-wrap:wrap;gap:6px 26px;margin-top:28px;padding-top:14px;border-top:1px solid #DADFE7;font-size:13px}
.kp .foot a{color:#1E4FD6}
@media (max-width:600px){.kp{padding:24px 18px}.kp .meta{text-align:left}.kp h1{font-size:21px}.kp td.p{white-space:normal}}
@page{size:A4;margin:14mm}
@media print{.kp{padding:0;max-width:none}}
`;
const NUM_LOC = {pl: 'pl-PL', en: 'en-GB', ua: 'uk-UA', ru: 'ru-RU'};
function kpMoney(n, lang) { return Math.round(+n || 0).toLocaleString(NUM_LOC[lang] || 'pl-PL').replace(/\s/g, ' ') + ' zł'; }
function kpDate(s, lang) { const d = parseYmd(s); try { return d.toLocaleDateString(NUM_LOC[lang] || 'pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}); } catch (_) { return s; } }

function buildKp(o) {
  // o: {lead, name, city, address, pk: [ids], lang, note, number, date}
  const L = P.KP[o.lang] || P.KP.pl, lang = o.lang;
  const l = o.lead || null;
  const pr = CFG.profile;
  const issues = l ? tagsOf(l).map(t => P.TAGS[t].d && P.TAGS[t].d[lang]).filter(Boolean) : [];
  const pks = (o.pk || []).map(pkById).filter(Boolean);
  let once = 0, monthly = 0;
  const rows = pks.map(p => {
    const pc = priceOf(p);
    if (p.unit === 'month') monthly += pc.from; else once += pc.from;
    const price = L.from + ' ' + kpMoney(pc.from, lang) + (p.unit === 'month' ? ' / ' + L.month : '');
    const time = p.days ? `<small>${esc(L.time)}: ${esc(p.days)} ${esc(L.days)}</small>` : '';
    return `<tr><td><b>${esc(p.n[lang] || p.n.pl)}</b><small>${esc(p.d[lang] || p.d.pl)}</small></td><td class="p">${esc(price)}${time}</td></tr>`;
  }).join('');
  const caseIds = Array.from(new Set(pks.flatMap(p => p.cases)));
  if (!caseIds.length) caseIds.push(P.SEG_CASE[l ? segOf(l) : 'horeca']);
  const cases = caseIds.map(caseOf).filter(Boolean).map(c => `<li><b>${esc(c.name)}</b>${c.url ? ` · <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : ''}<br>${esc(c.d[lang] || c.d.pl)}</li>`).join('');
  const valid = addDays(o.date, 14);
  const name = o.name || (l && l.name) || '…';
  const place = l ? leadPlace(l) : [o.address, o.city].filter(Boolean).join(', ');
  const portfolio = safeUrl(pr.portfolio);
  const contacts = [
    portfolio ? `<a href="${esc(portfolio)}" target="_blank" rel="noopener">${esc(portfolio.replace(/^https?:\/\//, ''))}</a>` : '',
    pr.phone ? esc(pr.phone) : '',
    pr.email ? esc(pr.email) : ''
  ].filter(Boolean).join('<span aria-hidden="true">·</span>');
  const html = `<article class="kp" lang="${lang === 'ua' ? 'uk' : lang}">
  <div class="top">
    <div><div class="brand"><span class="mark"></span>${esc(pr.brand || 'syncae')}</div>${pr.about ? `<div class="about">${esc(pr.about)}</div>` : ''}</div>
    <div class="meta">${esc(L.no)} ${esc(o.number)}<br>${esc(L.date)}: ${esc(kpDate(o.date, lang))}<br>${esc(L.valid)}: ${esc(kpDate(valid, lang))}</div>
  </div>
  <h1>${esc(L.title)}</h1>
  <p class="to">${esc(L.for)}: <b>${esc(name)}</b>${place ? `<small>${esc(place)}</small>` : ''}</p>
  ${issues.length ? `<h2>${esc(L.issues)}</h2><ul class="issues">${issues.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
  ${o.note ? `<h2>${esc(L.scope)}</h2><p class="own">${esc(o.note)}</p>` : ''}
  ${pks.length ? `${o.note ? '' : `<h2>${esc(L.scope)}</h2>`}<table>${rows}
    ${once ? `<tr class="tot"><td>${esc(L.total)}</td><td class="p">${esc(L.from)} ${esc(kpMoney(once, lang))}</td></tr>` : ''}
    ${monthly ? `<tr class="tot"><td>${esc(L.monthly)}</td><td class="p">${esc(L.from)} ${esc(kpMoney(monthly, lang))}</td></tr>` : ''}
  </table>` : ''}
  <p class="note">${esc(L.note)} ${esc(L.validNote)}</p>
  ${cases ? `<h2>${esc(L.cases)}</h2><ul class="cases">${cases}</ul>` : ''}
  <h2>${esc(L.process)}</h2><ol class="proc">${L.proc.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  <div class="foot"><b>${esc(L.contact)}</b>${contacts || esc(pr.brand || 'syncae')}</div>
</article>`;
  const lines = [
    L.title + ' · ' + o.number, L.for + ': ' + name + (place ? ', ' + place : ''), '',
    issues.length ? L.issues + ':\n' + issues.map(t => '— ' + t).join('\n') + '\n' : '',
    o.note ? o.note + '\n' : '',
    pks.length ? L.scope + ':\n' + pks.map(p => { const pc = priceOf(p); return '— ' + (p.n[lang] || p.n.pl) + ': ' + L.from + ' ' + kpMoney(pc.from, lang).replace(/ /g, ' ') + (p.unit === 'month' ? ' / ' + L.month : ''); }).join('\n') : '',
    once ? L.total + ': ' + L.from + ' ' + kpMoney(once, lang).replace(/ /g, ' ') : '',
    monthly ? L.monthly + ': ' + L.from + ' ' + kpMoney(monthly, lang).replace(/ /g, ' ') : '',
    '', L.note + ' ' + L.validNote,
    caseIds.map(caseOf).filter(Boolean).map(c => c.name + (c.url ? ' — ' + c.url : '')).join('\n'),
    '', [pr.brand, portfolio, pr.phone, pr.email].filter(Boolean).join(' · ')
  ];
  return {html, text: lines.filter((s, i, a) => !(s === '' && a[i - 1] === '')).join('\n').trim(), once, monthly};
}
function kpFile(o, built) {
  const title = (P.KP[o.lang] || P.KP.pl).title + ' · ' + (o.name || (o.lead && o.lead.name) || '');
  return `<!doctype html>
<html lang="${o.lang === 'ua' ? 'uk' : o.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${KP_FONTS}">
<style>body{margin:0;background:#EEF1F5}${KP_CSS}@media screen{.kp{margin:24px auto;box-shadow:0 6px 30px rgba(20,25,34,.12)}}</style>
</head><body>
${built.html}
</body></html>`;
}

// Демо-сайт
const DEMO_CSS = `
.d{--fd:system-ui;--fb:system-ui;container-type:inline-size;font-family:var(--fb),system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;font-size:15px;min-height:100%}
.d *{box-sizing:border-box}
.d a{color:inherit}
.d-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 22px;background:var(--bg);border-bottom:1px solid var(--line)}
.d-logo{font-family:var(--fd),serif;font-weight:var(--dw);font-size:19px;line-height:1.1;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.d-nav{display:flex;gap:18px;font-size:14px}
.d-nav a{text-decoration:none;color:var(--muted)}
.d-nav a:hover{color:var(--ink)}
.d-lang{display:flex;gap:2px;flex:none}
.d-lang button{appearance:none;border:1px solid var(--line);background:transparent;color:var(--muted);font:600 12px/1 var(--fb),sans-serif;padding:6px 8px;border-radius:6px;cursor:pointer}
.d-lang button[aria-pressed="true"]{color:var(--accInk);background:var(--acc);border-color:var(--acc)}
.d-hero{padding:64px 22px 44px;max-width:1040px;margin:0 auto}
.d-greet{display:inline-flex;gap:8px;align-items:center;padding:5px 12px;border:1px solid var(--line);border-radius:99px;font-size:13px;color:var(--muted);background:var(--card)}
.d-greet b{color:var(--ink);font-weight:600}
.d-h1{font-family:var(--fd),serif;font-weight:var(--dw);font-size:clamp(38px,8cqi,76px);line-height:1;letter-spacing:-.015em;margin:18px 0 12px;overflow-wrap:anywhere}
.d-tag{font-size:19px;color:var(--muted);margin:0 0 26px;max-width:40ch}
.d-cta{display:flex;flex-wrap:wrap;gap:10px}
.d-btn{display:inline-flex;align-items:center;background:var(--acc);color:var(--accInk);border:1px solid var(--acc);border-radius:999px;padding:13px 22px;font:600 15px/1 var(--fb),sans-serif;text-decoration:none;cursor:pointer}
.d-btn.alt{background:transparent;color:var(--ink);border-color:var(--ink)}
.d-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:0 22px 44px;max-width:1040px;margin:0 auto}
.d-info div{border-top:2px solid var(--ink);padding-top:10px;min-width:0;overflow-wrap:anywhere}
.d-info b{display:block;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:2px}
.d-sec{border-top:1px solid var(--line)}
.d-in{padding:48px 22px;max-width:1040px;margin:0 auto}
.d-h2{font-family:var(--fd),serif;font-weight:var(--dw);font-size:clamp(28px,5cqi,40px);line-height:1.05;margin:0 0 8px;letter-spacing:-.01em}
.d-note{font-size:13px;color:var(--muted);margin:0 0 20px;max-width:60ch}
.d-menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 36px}
.d-item{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:13px 0;border-bottom:1px dashed var(--line)}
.d-item b{font-weight:600}
.d-item span{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink)}
.d-ex{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:2px 5px;margin-left:8px;white-space:nowrap}
.d-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:end;max-width:760px}
.d-form label{display:grid;gap:5px;font-size:13px;color:var(--muted);min-width:0}
.d-form input,.d-form select{font:inherit;font-size:15px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:11px 12px;width:100%;min-width:0}
.d-form .d-btn{justify-content:center}
.d-ok{margin:14px 0 0;padding:12px 14px;border-radius:10px;background:var(--card);border:1px solid var(--acc);max-width:760px}
.d-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;counter-reset:s;list-style:none;padding:0;margin:0 0 28px}
.d-steps li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.d-steps li::before{counter-increment:s;content:counter(s);display:block;font-family:var(--fd),serif;font-weight:var(--dw);font-size:28px;line-height:1;color:var(--acc);margin-bottom:8px}
.d-foot{border-top:1px solid var(--line);padding:26px 22px 40px;font-size:13px;color:var(--muted);text-align:center}
.d-foot a{color:var(--ink)}
@container (max-width:640px){
  .d-nav{display:none}
  .d-hero{padding:40px 18px 32px}
  .d-info{grid-template-columns:minmax(0,1fr);padding:0 18px 32px}
  .d-in{padding:36px 18px}
  .d-menu{grid-template-columns:minmax(0,1fr)}
  .d-form{grid-template-columns:repeat(2,minmax(0,1fr))}
  .d-steps{grid-template-columns:minmax(0,1fr)}
  .d-top{padding:12px 16px}
}
`;
function styleById(id) { return P.STYLES.find(s => s.id === id) || null; }
function guessStyle(l) {
  if (!l) return 'korean';
  // Сначала «что за место», потом название: хинкальная с «Chin…» в названии иначе ушла бы в китайский стиль.
  for (const field of [l.kind, l.name, l.now]) {
    const hay = norm(field);
    if (!hay) continue;
    // norm() срезает диакритику, а с ней и «й» → «и», поэтому ключи вроде «корей» сверяем ещё и с исходным текстом.
    const raw = String(field).toLowerCase();
    for (const s of P.STYLES) if (s.kw) { const re = new RegExp(s.kw, 'i'); if (re.test(raw) || re.test(hay)) return s.id; }
  }
  return P.SEG_STYLE[segOf(l)] || 'general';
}
function demoCfg() {
  const d = S.demo, l = leadById(d.lead);
  const styleId = d.style || guessStyle(l);
  const st = styleById(styleId) || P.STYLES[0];
  const layout = d.layout || (l ? (segOf(l) === 'horeca' ? 'r' : 's') : st.layout);
  const cityName = l ? (l.city || '') : d.city;
  return {l, st, layout, name: (l && l.name) || d.name || 'Twoja nazwa', city: cityName, cityO: cityObj(cityName), address: l ? leadPlace(l) : d.city, rating: l ? parseRating(l.rating) : {rating: 0, reviews: 0}, maps: l ? (safeUrl(l.maps) || mapsSearch(l)) : ''};
}
function demoVars(st) {
  const c = st.c;
  return `--bg:${c.bg};--card:${c.card};--ink:${c.ink};--muted:${c.muted};--line:${c.line};--acc:${c.acc};--accInk:${c.accInk};--fd:"${st.fd}";--fb:"${st.fb}";--dw:${st.dw}`;
}
function demoFontUrl(st) { return 'https://fonts.googleapis.com/css2?family=' + st.font + '&display=swap'; }
function buildDemo(cfg, lang) {
  const T = P.DEMO[lang] || P.DEMO.pl, st = cfg.st, r = cfg.layout === 'r';
  const loc = cfg.cityO ? cfg.cityO.loc : (cfg.city ? 'w ' + cfg.city : 'na Śląsku');
  const tag = (st.tag[lang] || st.tag.pl).replace('{loc}', loc).replace('{city}', cfg.city || 'Silesia');
  const rt = cfg.rating.rating ? cfg.rating.rating.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' ★' + (cfg.rating.reviews ? ' · ' + cfg.rating.reviews : '') : '';
  const price = it => (r ? '' : T.from + ' ') + Math.round(it[2]).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB') + ' zł' + (it[3] || '');
  const items = st.items.map(it => `<div class="d-item"><b>${esc(lang === 'pl' ? it[0] : it[1])}</b><span>${esc(price(it))}</span></div>`).join('');
  const brand = esc(CFG.profile.brand || 'syncae');
  const pf = safeUrl(CFG.profile.portfolio);
  const greet = st.greet ? `<span class="d-greet"><b lang="${esc(st.gl.toLowerCase())}">${esc(st.greet)}</b>${esc(lang === 'pl' ? 'Zapraszamy' : 'Welcome')}</span>` : '';
  const form = r
    ? `<label>${esc(T.date)}<input type="date"></label><label>${esc(T.time)}<input type="time" value="19:00"></label><label>${esc(T.people)}<select><option>2</option><option>3</option><option>4</option><option>5+</option></select></label><button class="d-btn" type="submit">${esc(T.send)}</button>`
    : `<label>${esc(T.service)}<select>${st.items.map(it => `<option>${esc(lang === 'pl' ? it[0] : it[1])}</option>`).join('')}</select></label><label>${esc(T.name)}<input autocomplete="off"></label><label>${esc(T.phone)}<input inputmode="tel" autocomplete="off"></label><button class="d-btn" type="submit">${esc(T.send)}</button>`;
  return `<div class="d" style='${demoVars(st)}'>
  <header class="d-top"><div class="d-logo">${esc(cfg.name)}</div>
    <nav class="d-nav"><a href="#d-menu">${esc(r ? T.menu : T.services)}</a><a href="#d-book">${esc(r ? T.book : T.ask)}</a><a href="#d-contact">${esc(T.contact)}</a></nav>
    <div class="d-lang"><button type="button" data-dl="pl" aria-pressed="${lang === 'pl'}">PL</button><button type="button" data-dl="en" aria-pressed="${lang === 'en'}">EN</button></div>
  </header>
  <section class="d-hero">${greet}
    <h1 class="d-h1">${esc(cfg.name)}</h1>
    <p class="d-tag">${esc(tag)}</p>
    <div class="d-cta"><a class="d-btn" href="#d-book">${esc(r ? T.ctaBook : T.ctaAsk)}</a><a class="d-btn alt" href="#d-menu">${esc(r ? T.ctaMenu : T.ctaPrices)}</a></div>
  </section>
  <div class="d-info">
    <div><b>${esc(T.address)}</b>${esc(cfg.address || cfg.city || '—')}</div>
    <div><b>${esc(T.hours)}</b>${esc(r ? T.hoursR : T.hoursS)} <span class="d-ex">${esc(T.example)}</span></div>
    <div><b>${esc(T.rating)}</b>${esc(rt || '—')}</div>
  </div>
  <section class="d-sec" id="d-menu"><div class="d-in">
    <h2 class="d-h2">${esc(r ? T.menu : T.services)}</h2>
    <p class="d-note">${esc(r ? T.sampleR : T.sampleS)}</p>
    <div class="d-menu">${items}</div>
  </div></section>
  <section class="d-sec" id="d-book"><div class="d-in">
    <h2 class="d-h2">${esc(r ? T.book : T.how)}</h2>
    ${r ? '' : `<ol class="d-steps">${T.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`}
    <form class="d-form" data-demo-form>${form}</form>
    <p class="d-ok" data-demo-ok hidden>${esc(r ? T.okR : T.okS)}</p>
  </div></section>
  <section class="d-sec" id="d-contact"><div class="d-in">
    <h2 class="d-h2">${esc(T.contact)}</h2>
    <p style="margin:0 0 16px">${esc(cfg.address || cfg.city || '')}</p>
    ${cfg.maps ? `<a class="d-btn alt" href="${esc(cfg.maps)}" target="_blank" rel="noopener">${esc(T.route)}</a>` : ''}
  </div></section>
  <footer class="d-foot">${esc(T.foot)} ${pf ? `<a href="${esc(pf)}" target="_blank" rel="noopener">${brand}</a>` : brand}</footer>
</div>`;
}
function demoFile(cfg) {
  const pl = buildDemo(cfg, 'pl'), en = buildDemo(cfg, 'en');
  const script = '<scr' + `ipt>
(function(){
  var w=document.getElementById('w');
  function set(l){w.querySelectorAll('[data-l]').forEach(function(x){x.hidden=x.getAttribute('data-l')!==l;});document.documentElement.lang=l;}
  w.addEventListener('click',function(e){
    var b=e.target.closest('[data-dl]');if(b){e.preventDefault();set(b.getAttribute('data-dl'));return;}
    var a=e.target.closest('a[href^="#"]');if(a){var box=a.closest('[data-l]');var t=box&&box.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}}
  });
  w.addEventListener('submit',function(e){e.preventDefault();var ok=e.target.parentNode.querySelector('[data-demo-ok]');if(ok)ok.hidden=false;});
})();
</scr` + 'ipt>';
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(cfg.name)}</title>
<link rel="stylesheet" href="${demoFontUrl(cfg.st)}">
<style>html,body{margin:0;padding:0}[hidden]{display:none!important}${DEMO_CSS}</style>
</head><body><div id="w"><div data-l="pl">${pl}</div><div data-l="en" hidden>${en}</div></div>
${script}
</body></html>`;
}
const loadedFonts = new Set();
function ensureFont(url) {
  if (loadedFonts.has(url)) return;
  loadedFonts.add(url);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
function mountShadow(host, css, html, onEvent) {
  if (!host) return null;
  const root = host.shadowRoot || host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>:host{display:block}[hidden]{display:none!important}${css}</style>${html}`;
  if (onEvent && !host.__wired) {
    host.__wired = true;
    root.addEventListener('click', e => onEvent('click', e, root));
    root.addEventListener('submit', e => onEvent('submit', e, root));
  }
  return root;
}
