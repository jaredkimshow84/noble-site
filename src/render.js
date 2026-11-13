/* 노블365 홈페이지 렌더러 – content/*.json 을 완성된 HTML 페이지로 만듭니다.
   build.js(배포 시 자동 실행)가 이 파일로 모든 페이지를 미리 만들어 둡니다. */
(function (root) {
  'use strict';
  var Icons = (typeof module !== 'undefined' && module.exports) ? require('./icons.js') : root.NobleIcons;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function linkify(s) { return nl(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function img(src) { return src ? String(src).replace(/^\//, '') : ''; }
  function tel(n) { return 'tel:' + String(n || '').replace(/[^0-9+]/g, ''); }
  function cHref(c, i) { return 'clinic-' + c + (i ? '-' + i : '') + '.html'; }
  function fixLink(u) {
    if (!u) return '#';
    var m = /^\/?clinic\.html\?c=([\w-]+)(?:&(?:amp;)?i=([\w-]+))?/.exec(u);
    return m ? cHref(m[1], m[2]) : u;
  }
  function find(D, cid, iid) {
    var c = D.clinics.categories.filter(function (x) { return x.id === cid; })[0];
    return { c: c, i: c && iid ? c.items.filter(function (x) { return x.id === iid; })[0] : null };
  }
  var SPINE_SPOT = { neck: 'neck', shoulder: 'shoulder', elbow: 'elbow', wrist: 'wrist', back: 'back', hip: 'hip', knee: 'knee', ankle: 'ankle' };

  /* ---------------- 공통 레이아웃 ---------------- */
  function nav(D, active) {
    var menu = [{ t: '병원소개', h: 'about.html', k: 'about', sub: [
      ['병원소개', 'about.html'], ['양한방 통합 의료진', 'doctors.html'], ['병원 둘러보기', 'about.html#gallery'],
      ['오시는길 · 진료시간', 'location.html'], ['비급여 진료비용', 'nonpay.html'], ['환자의 권리와 의무', 'rights.html'],
      ['환자 만족도 조사', 'survey.html'], ['방문자 리뷰', 'reviews.html']] }];
    D.clinics.categories.forEach(function (c) {
      menu.push({ t: c.title, h: cHref(c.id), k: 'c-' + c.id, sub: c.items.map(function (i) { return [i.title, cHref(c.id, i.id)]; }) });
    });
    menu.push({ t: '공지사항', h: 'notices.html', k: 'notices', sub: [] });
    return menu;
  }
  function header(D, active) {
    var S = D.site, menu = nav(D, active), t0 = S.phones && S.phones[0] ? S.phones[0].number : '';
    var gnb = menu.map(function (m) {
      return '<li class="' + (m.k === active ? 'on' : '') + '"><a href="' + m.h + '">' + esc(m.t) + '</a>' +
        (m.sub.length ? '<div class="sub"><div class="sub-in">' + m.sub.map(function (s) { return '<a href="' + s[1] + '">' + esc(s[0]) + '</a>'; }).join('') + '</div></div>' : '') + '</li>';
    }).join('');
    var dr = menu.map(function (m) {
      return '<details' + (m.k === active ? ' open' : '') + '><summary><a href="' + m.h + '">' + esc(m.t) + '</a></summary>' +
        (m.sub.length ? '<ul>' + m.sub.map(function (s) { return '<li><a href="' + s[1] + '">' + esc(s[0]) + '</a></li>'; }).join('') + '</ul>' : '') + '</details>';
    }).join('');
    return '<a class="skip" href="#main">본문 바로가기</a>' +
      '<header class="hd"><div class="wrap hd-in">' +
      '<a class="logo" href="./"><img src="images/logo.svg" alt="" width="40" height="37"><span><b>' + esc(S.name_short) + '</b><small>' + esc(S.name) + '</small></span></a>' +
      '<nav class="gnb-wrap" aria-label="주 메뉴"><ul class="gnb">' + gnb + '</ul></nav>' +
      '<a class="hd-tel" href="' + tel(t0) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>' + esc(t0) + '</a>' +
      '<button class="burger" type="button" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div></header>' +
      '<div class="drawer" hidden><div class="dim"></div><aside class="panel" aria-label="전체 메뉴"><div class="panel-hd"><a class="logo" href="./"><img src="images/logo.svg" alt="" width="34" height="31"><span><b>' + esc(S.name_short) + '</b></span></a><button class="close" type="button" aria-label="메뉴 닫기">×</button></div>' + dr +
      '<a class="btn btn-gold block" href="' + tel(t0) + '">전화 상담 ' + esc(t0) + '</a></aside></div>';
  }
  function footer(D) {
    var S = D.site, t0 = S.phones && S.phones[0] ? S.phones[0].number : '';
    var sns = (S.sns || []).filter(function (s) { return s.url; }).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>'; }).join('');
    return '<footer class="ft"><div class="wrap ft-in">' +
      '<div class="ft-brand"><img src="images/logo.svg" alt="" width="44" height="40"><div><b>' + esc(S.name) + '</b><span>' + esc(S.name_en) + '</span></div></div>' +
      '<div class="ft-cols"><div><h4>진료시간</h4><ul>' + (S.hours || []).map(function (h) { return '<li><span>' + esc(h.label) + '</span>' + esc(h.time) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>연락처</h4><ul>' + (S.phones || []).map(function (p) { return '<li><span>' + esc(p.label) + '</span><a href="' + tel(p.number) + '">' + esc(p.number) + '</a></li>'; }).join('') +
      (S.fax ? '<li><span>팩스</span>' + esc(S.fax) + '</li>' : '') + '</ul></div>' +
      '<div><h4>바로가기</h4><p class="ft-links"><a href="location.html">오시는길</a><a href="notices.html">공지사항</a><a href="nonpay.html">비급여 진료비용</a><a href="rights.html">환자의 권리와 의무</a><a href="survey.html">만족도 조사</a><a href="reviews.html">방문자 리뷰</a>' + sns + '</p></div></div>' +
      '<div class="ft-legal"><p>' + esc(S.address) + '<br>대표자 ' + esc(S.ceo) + ' · 사업자등록번호 ' + (S.biz_numbers || []).map(function (b) { return esc(b.label) + ' ' + esc(b.number); }).join(' · ') + '</p>' +
      '<p><a href="privacy.html"><b>개인정보처리방침</b></a> · © ' + new Date().getFullYear() + ' ' + esc(S.name) + '</p></div>' +
      '</div></footer>' +
      ((S.kakao_chat_url || S.naver_talk_url) ? '<div class="chat-fab" aria-label="채팅 상담">' +
        (S.kakao_chat_url ? '<a class="kk" href="' + esc(S.kakao_chat_url) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.6 21l4-2.6c.8.1 1.6.2 2.4.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg><span>카톡 상담</span></a>' : '') +
        (S.naver_talk_url ? '<a class="nt" href="' + esc(S.naver_talk_url) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4z"/></svg><span>네이버 톡톡</span></a>' : '') + '</div>' : '') +
      '<nav class="quick" aria-label="빠른 메뉴"><a class="q-tel" href="' + tel(t0) + '">' + qi('tel') + '전화하기</a><a href="location.html">' + qi('pin') + '오시는길</a><a href="location.html#hours">' + qi('clock') + '진료시간</a><a href="nonpay.html">' + qi('won') + '비급여</a></nav>';
  }
  function qi(n) {
    var P = { tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
      pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', won: '<path d="M4 7l3 10 3-8 2 0 3 8 3-10M3 11h18M3 14h18"/>' };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>';
  }

  function page(D, o) {
    var S = D.site, url = S.domain ? 'https://' + S.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') + '/' : '';
    var title = o.title ? o.title + ' | ' + S.name : S.name + ' | ' + (S.seo_suffix || '용인 기흥 양한방 협진');
    var desc = o.desc || S.seo_description || (S.name + ' · ' + S.address);
    var ld = {
      '@context': 'https://schema.org', '@type': 'MedicalClinic', name: S.name, telephone: S.phones && S.phones[0] ? S.phones[0].number : '',
      address: { '@type': 'PostalAddress', streetAddress: S.address, addressLocality: '용인시 기흥구', addressRegion: '경기도', addressCountry: 'KR' },
      openingHours: ['Mo-Fr 09:00-20:00', 'Sa-Su 09:00-16:00'], url: url || undefined
    };
    return '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n' +
      (url ? '<link rel="canonical" href="' + url + (o.file === 'index.html' ? '' : o.file) + '">\n' : '') +
      '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + esc(S.name) + '">\n<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:image" content="' + (url || '') + 'images/og.png">\n' +
      '<meta name="theme-color" content="#0d2440">\n<link rel="icon" href="images/favicon.svg" type="image/svg+xml">\n' +
      '<link rel="preload" href="fonts/PretendardVariable.subset.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="css/style.css">\n' +
      '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n</head>\n' +
      '<body data-page="' + o.key + '">\n' + header(D, o.active || o.key) + '\n<main id="main">\n' + o.body + '\n</main>\n' + footer(D) +
      (o.scripts || '') + '\n<script src="js/app.js" defer></script>\n</body>\n</html>\n';
  }
  function subHero(crumbs, title, desc, ill) {
    return '<section class="sub-hero"><div class="wrap sub-hero-in"><div class="sh-text"><nav class="crumb" aria-label="현재 위치"><a href="./">홈</a>' +
      crumbs.map(function (c) { return '<span>›</span>' + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : esc(c[0])); }).join('') +
      '</nav><h1>' + esc(title) + '</h1>' + (desc ? '<p>' + esc(desc) + '</p>' : '') + '</div>' +
      (ill ? '<div class="sh-ill">' + ill + '</div>' : '') + '</div></section>';
  }
  function hoursTable(S) {
    return '<table class="hours"><tbody>' + (S.hours || []).map(function (h) {
      return '<tr><th scope="row">' + esc(h.label) + '</th><td><b>' + esc(h.time) + '</b>' + (h.note ? '<small>' + esc(h.note) + '</small>' : '') + '</td></tr>';
    }).join('') + '</tbody></table>';
  }
  function hoursData(S) { return esc(JSON.stringify((S.hours || []).map(function (h) { return [h.label, h.time]; }))); }
  function docRow(d, brief) {
    var c = (d.career || []).filter(Boolean);
    return '<li class="doc"><div class="doc-hd"><span class="doc-mono" aria-hidden="true">' + esc((d.name || '').slice(0, 1)) + '</span><div><h3>' + esc(d.name) + ' <small>' + esc(d.title) + '</small></h3>' +
      '<p class="doc-meta"><span class="pill">' + esc(d.group) + '</span>' + (d.days ? '<span class="pill gold">진료일 ' + esc(d.days) + '</span>' : '') + '</p></div></div>' +
      (!brief && c.length ? '<ul class="doc-career">' + c.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
  }
  function galItem(p) {
    return '<figure class="gal-item">' + (p.image ? '<img src="' + esc(img(p.image)) + '" alt="' + esc(p.caption) + '" loading="lazy" decoding="async">' : '<div class="gal-empty">사진 준비중</div>') +
      '<figcaption>' + esc(p.caption) + '</figcaption></figure>';
  }
  function ctaBand(S) {
    var t0 = S.phones && S.phones[0] ? S.phones[0].number : '';
    return '<section class="cta-band"><div class="wrap cta-in"><div><h2>궁금한 점은 편하게 문의하세요</h2><p>1년 365일 진료 · 평일 저녁 8시까지 · ' + esc(S.address) + '</p></div>' +
      '<div class="cta-btns"><a class="btn btn-gold" href="' + tel(t0) + '">전화 상담 ' + esc(t0) + '</a><a class="btn btn-line-w" href="location.html">오시는길</a></div></div></section>';
  }
  function section(s) {
    var h = '<section class="blk reveal"><h2>' + esc(s.heading) + '</h2>' + (s.text ? '<p class="blk-txt">' + nl(s.text) + '</p>' : '');
    var it = s.items || [];
    if (it.length) {
      if (s.style === 'check') h += '<ul class="checks">' + it.map(function (i) { return '<li><span class="ck" aria-hidden="true"></span><div><b>' + esc(i.title) + '</b>' + (i.desc ? '<span>' + esc(i.desc) + '</span>' : '') + '</div></li>'; }).join('') + '</ul>';
      else if (s.style === 'steps') h += '<ol class="steps">' + it.map(function (i, n) { return '<li><span class="no">' + (n + 1 < 10 ? '0' : '') + (n + 1) + '</span><div><b>' + esc(i.title) + '</b>' + (i.desc ? '<span>' + esc(i.desc) + '</span>' : '') + '</div></li>'; }).join('') + '</ol>';
      else if (s.style === 'faq') h += '<div class="faq">' + it.map(function (i) { return '<details><summary>' + esc(i.title) + '</summary><p>' + nl(i.desc) + '</p></details>'; }).join('') + '</div>';
      else h += '<div class="cards">' + it.map(function (i) { return '<div class="tcard"><h3>' + esc(i.title) + '</h3>' + (i.desc ? '<p>' + esc(i.desc) + '</p>' : '') + '</div>'; }).join('') + '</div>';
    }
    return h + '</section>';
  }
  function short(t, n) { t = t || ''; return t.length > n ? t.slice(0, n) + '…' : t; }

  /* ---------------- 페이지 ---------------- */
  var P = {};

  P.home = function (D) {
    var S = D.site, H = D.home, t0 = S.phones && S.phones[0] ? S.phones[0].number : '';
    var cats = D.clinics.categories;
    var body =
      '<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap hero-in">' +
      '<div class="hero-text">' + (S.hero_badge ? '<p class="badge">' + esc(S.hero_badge) + '</p>' : '') +
      '<h1>' + nl(S.hero_title) + '</h1><p class="lead">' + esc(S.hero_sub) + '</p>' +
      '<div class="hero-cta"><a class="btn btn-gold" href="' + tel(t0) + '">전화 상담</a><a class="btn btn-line-w" href="doctors.html">의료진 소개</a><a class="btn btn-line-w" href="location.html">오시는길</a></div>' +
      '<p class="hero-en">' + esc(S.name_en) + '</p></div>' +
      '<div class="hero-map"><p class="hm-title">어디가 불편하세요?</p><p class="hm-sub">부위를 누르면 진료 안내로 이동합니다</p>' +
      Icons.bodyMap(function (k) { return cHref('spine', SPINE_SPOT[k]); }) + '</div>' +
      '</div></section>' +

      '<section class="info-strip"><div class="wrap info-in">' +
      '<div class="info-card"><div class="ic-hd"><h2>진료시간</h2><span class="open-now" data-hours="' + hoursData(S) + '"></span></div>' + hoursTable(S) +
      (S.hours_notice ? '<p class="note">' + nl(S.hours_notice) + '</p>' : '') + '</div>' +
      '<div class="info-card"><div class="ic-hd"><h2>전화 상담</h2></div><a class="big-tel" href="' + tel(t0) + '">' + esc(t0) + '</a>' +
      (S.phones || []).slice(1).map(function (p) { return '<p class="sub-tel">' + esc(p.label) + ' <a href="' + tel(p.number) + '">' + esc(p.number) + '</a></p>'; }).join('') +
      '<p class="note">평일 09:00~20:00 · 주말·공휴일 09:00~16:00<br>원하시는 원장님이 있으면 접수 시 말씀해 주세요.</p></div>' +
      '<div class="info-card"><div class="ic-hd"><h2>오시는 길</h2></div><p class="addr">' + esc(S.address) + '</p>' +
      (S.parking ? '<p class="note">' + nl(S.parking) + '</p>' : '') +
      '<p class="map-links">' + (S.naver_map ? '<a class="nv" href="' + esc(S.naver_map) + '" target="_blank" rel="noopener">네이버 지도</a>' : '') + (S.kakao_map ? '<a class="kk" href="' + esc(S.kakao_map) + '" target="_blank" rel="noopener">카카오맵</a>' : '') + '</p></div>' +
      '</div></section>' +

      '<section class="sec ctabs-sec"><div class="wrap"><div class="sec-hd left"><p class="eyebrow">CLINIC</p><h2>진료 안내</h2><p>궁금한 진료 분야를 눌러 보세요.</p></div>' +
      '<div class="ctabs" role="tablist" aria-label="진료 분야">' + cats.map(function (c, i) {
        return '<button type="button" role="tab" id="ct-' + c.id + '" aria-controls="cp-' + c.id + '" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '">' + Icons.icon('cat-' + c.id, 'sm') + '<span>' + esc(c.title) + '</span></button>';
      }).join('') + '</div>' +
      cats.map(function (c, i) {
        return '<div class="cpanel" role="tabpanel" id="cp-' + c.id + '" aria-labelledby="ct-' + c.id + '"' + (i ? ' hidden' : '') + '>' +
          '<div class="cp-head"><div><h3>' + esc(c.title) + '</h3><p>' + esc(c.intro) + '</p></div><a class="btn btn-navy sm" href="' + cHref(c.id) + '">전체 보기</a></div>' +
          '<div class="cp-grid">' + c.items.map(function (it) {
            return '<a class="cp-item" href="' + cHref(c.id, it.id) + '">' + Icons.icon(it.id, 'md') + '<b>' + esc(it.title) + '</b>' + (it.subtitle ? '<small>' + esc(it.subtitle) + '</small>' : '') + '</a>';
          }).join('') + '</div></div>';
      }).join('') + '</div></section>' +

      '<section class="sec soft"><div class="wrap"><div class="sec-hd"><p class="eyebrow">WHY NOBLE 365</p><h2>노블365가 다른 이유</h2></div><div class="why">' +
      (S.strengths || []).map(function (s, i) {
        var ic = ['cat-nonsurgical', 'pulse', 'inpatient'][i] || 'prolo';
        return '<div class="why-item reveal">' + Icons.icon(ic, 'md') + '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>';
      }).join('') + '</div></div></section>' +

      '<section class="sec"><div class="wrap"><div class="sec-hd"><p class="eyebrow">BEST 5</p><h2>' + esc(H.best5_title) + '</h2><p>' + esc(H.best5_sub) + '</p></div>' +
      '<ol class="best5">' + (H.best5 || []).map(function (b, i) {
        var id = (fixLink(b.link).match(/clinic-[\w]+-([\w-]+)\.html/) || [])[1];
        return '<li class="reveal"><a href="' + esc(fixLink(b.link)) + '"><span class="rank">' + (i + 1) + '</span>' + Icons.icon(id || 'prolo', 'md') + '<div class="b5t"><b>' + esc(b.title) + '</b><span>' + esc(b.sub) + '</span></div><p>' + esc(b.desc) + '</p></a></li>';
      }).join('') + '</ol>' +
      '<div class="promises">' + (H.promises || []).map(function (p) { return '<div><b>' + esc(p.title) + '</b><span>' + esc(p.desc) + '</span></div>'; }).join('') + '</div></div></section>' +

      '<section class="sec soft"><div class="wrap"><div class="sec-hd"><p class="eyebrow">DOCTORS</p><h2>양한방 통합 의료진</h2>' + (D.doctors.intro ? '<p>' + esc(D.doctors.intro) + '</p>' : '') + '</div>' +
      '<ul class="doc-grid">' + D.doctors.doctors.filter(function (x) { return x.group !== '의료기사'; }).map(function (d) { return docRow(d, true); }).join('') + '</ul>' +
      (H.cooperation ? '<p class="coop">' + esc(H.cooperation) + '</p>' : '') +
      '<p class="more"><a class="btn btn-navy" href="doctors.html">의료진 약력 보기</a></p></div></section>' +

      '<section class="sec"><div class="wrap"><div class="sec-hd"><p class="eyebrow">TOUR</p><h2>병원 둘러보기</h2></div><div class="gal home-gal">' +
      (D.gallery.photos || []).filter(function (p) { return p.image; }).slice(0, 5).map(galItem).join('') +
      '</div><p class="more"><a class="btn btn-navy" href="about.html#gallery">시설 더 보기</a></p></div></section>' +
      ctaBand(S);
    return page(D, { key: 'home', file: 'index.html', body: body });
  };

  P.about = function (D) {
    var S = D.site, G = D.gallery;
    var body = subHero([['병원소개']], '병원소개', S.hero_sub, Icons.icon('cat-nonsurgical', 'xl')) +
      '<section class="sec"><div class="wrap narrow"><div class="sec-hd"><p class="eyebrow">ABOUT</p><h2>' + esc(S.about_title || S.name) + '</h2><p>' + esc(S.about_lead || '') + '</p></div>' +
      (S.about_photo ? '<img class="about-photo" src="' + esc(img(S.about_photo)) + '" alt="">' : '') +
      '<div class="about-grid">' + (S.about_sections || []).map(function (a, i) {
        return '<div class="about-item reveal">' + Icons.icon(['pulse', 'manual', 'cat-nonsurgical', 'growth'][i] || 'prolo', 'md') + '<h3>' + esc(a.title) + '</h3><p>' + esc(a.desc) + '</p></div>';
      }).join('') + '</div></div></section>' +
      '<section class="sec soft"><div class="wrap"><div class="why">' + (S.strengths || []).map(function (s, i) {
        return '<div class="why-item reveal">' + Icons.icon(['cat-nonsurgical', 'pulse', 'inpatient'][i] || 'prolo', 'md') + '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>';
      }).join('') + '</div></div></section>' +
      '<section class="sec" id="gallery"><div class="wrap"><div class="sec-hd"><p class="eyebrow">TOUR</p><h2>병원 둘러보기</h2><p>' + esc(G.intro || '') + '</p></div><div class="gal">' +
      (G.photos || []).map(galItem).join('') + '</div></div></section>' + ctaBand(S);
    return page(D, { key: 'about', file: 'about.html', title: '병원소개', body: body });
  };

  P.doctors = function (D) {
    var docs = D.doctors.doctors.filter(function (x) { return x.group !== '의료기사'; });
    var body = subHero([['병원소개', 'about.html'], ['의료진']], '양한방 통합 의료진', D.doctors.intro, Icons.icon('pulse', 'xl')) +
      '<section class="sec"><div class="wrap narrow"><p class="notice-box">진료를 빠르게 받으실 수 있도록 의료진이 배정됩니다. 원하시는 의료진을 지정하실 수 있으나, 지정 진료는 대기 시간이 길어질 수 있습니다. 진료 요일은 사정에 따라 바뀔 수 있으니 방문 전 전화로 확인해 주세요.</p>' +
      '<ul class="doc-list">' + docs.map(function (d) { return docRow(d, false); }).join('') + '</ul></div></section>' + ctaBand(D.site);
    return page(D, { key: 'doctors', active: 'about', file: 'doctors.html', title: '양한방 통합 의료진', body: body });
  };

  function clinicNav(c, curId) {
    return '<nav class="subnav" aria-label="' + esc(c.title) + ' 세부 메뉴"><div class="wrap subnav-in"><a href="' + cHref(c.id) + '"' + (curId ? '' : ' aria-current="page"') + '>전체</a>' +
      c.items.map(function (i) { return '<a href="' + cHref(c.id, i.id) + '"' + (i.id === curId ? ' aria-current="page"' : '') + '>' + esc(i.title) + '</a>'; }).join('') + '</div></nav>';
  }
  function aside(D, c, curId) {
    var S = D.site, t0 = S.phones && S.phones[0] ? S.phones[0].number : '';
    return '<aside class="side"><div class="side-card"><h3>진료시간</h3>' + hoursTable(S) + '<a class="btn btn-gold block" href="' + tel(t0) + '">전화 상담 ' + esc(t0) + '</a></div>' +
      '<div class="side-card"><h3>' + esc(c.title) + '</h3><ul class="side-list">' + c.items.map(function (i) {
        return '<li><a href="' + cHref(c.id, i.id) + '"' + (i.id === curId ? ' aria-current="page"' : '') + '>' + esc(i.title) + '</a></li>';
      }).join('') + '</ul></div></aside>';
  }
  P.clinicCat = function (D, cid) {
    var c = find(D, cid).c;
    var body = subHero([[c.title]], c.title, c.summary, Icons.icon('cat-' + c.id, 'xl')) + clinicNav(c, null) +
      '<section class="sec"><div class="wrap"><p class="cat-intro">' + esc(c.intro) + '</p><div class="cat-grid">' + c.items.map(function (i) {
        return '<a class="cat-card reveal" href="' + cHref(c.id, i.id) + '">' + Icons.icon(i.id, 'lg') + '<div><h2>' + esc(i.title) + '</h2>' + (i.subtitle ? '<small>' + esc(i.subtitle) + '</small>' : '') + '<p>' + esc(short(i.intro, 70)) + '</p></div></a>';
      }).join('') + '</div></div></section>' + ctaBand(D.site);
    return page(D, { key: 'c-' + c.id, file: cHref(c.id), title: c.title, desc: c.title + ' – ' + c.intro, body: body });
  };
  P.clinicItem = function (D, cid, iid) {
    var f = find(D, cid, iid), c = f.c, it = f.i;
    var idx = c.items.indexOf(it), prev = c.items[idx - 1], next = c.items[idx + 1];
    var body = subHero([[c.title, cHref(c.id)], [it.title]], it.title, it.subtitle || c.title, Icons.icon(it.id, 'xl')) + clinicNav(c, it.id) +
      '<div class="wrap detail"><article class="detail-main"><p class="detail-intro">' + esc(it.intro) + '</p>' +
      (it.sections || []).map(section).join('') +
      '<nav class="pager" aria-label="이전 다음 진료">' + (prev ? '<a href="' + cHref(c.id, prev.id) + '"><small>이전</small>' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a class="nx" href="' + cHref(c.id, next.id) + '"><small>다음</small>' + esc(next.title) + '</a>' : '<span></span>') + '</nav>' +
      '</article>' + aside(D, c, it.id) + '</div>' + ctaBand(D.site);
    return page(D, { key: 'c-' + c.id, file: cHref(c.id, it.id), title: it.title + (it.subtitle ? ' (' + it.subtitle + ')' : ''), desc: it.title + ' – ' + short(it.intro, 120), body: body });
  };

  P.location = function (D) {
    var S = D.site, q = encodeURIComponent(S.address.replace(/\(.*?\)/g, ''));
    var body = subHero([['병원소개', 'about.html'], ['오시는길 · 진료시간']], '오시는길 · 진료시간', S.address, Icons.icon('accident-guide', 'xl')) +
      '<section class="sec"><div class="wrap loc">' +
      '<div class="loc-media"><img class="loc-photo" src="images/photos/building.jpg" alt="용인메디컬센터 건물 외관" loading="lazy"><div class="map"><iframe title="병원 위치 지도" loading="lazy" src="https://maps.google.com/maps?q=' + q + '&z=16&output=embed"></iframe></div></div>' +
      '<div><dl class="info-list"><dt>주소</dt><dd>' + esc(S.address) + '</dd>' +
      (S.phones || []).map(function (p) { return '<dt>' + esc(p.label) + '</dt><dd><a href="' + tel(p.number) + '">' + esc(p.number) + '</a></dd>'; }).join('') +
      (S.fax ? '<dt>팩스</dt><dd>' + esc(S.fax) + '</dd>' : '') + (S.parking ? '<dt>주차</dt><dd>' + nl(S.parking) + '</dd>' : '') + '</dl>' +
      '<p class="map-links">' + (S.naver_map ? '<a class="nv" href="' + esc(S.naver_map) + '" target="_blank" rel="noopener">네이버 지도</a>' : '') + (S.kakao_map ? '<a class="kk" href="' + esc(S.kakao_map) + '" target="_blank" rel="noopener">카카오맵</a>' : '') + '</p>' +
      '<div class="info-card" id="hours"><div class="ic-hd"><h2>진료시간</h2><span class="open-now" data-hours="' + hoursData(S) + '"></span></div>' + hoursTable(S) + (S.hours_notice ? '<p class="note">' + nl(S.hours_notice) + '</p>' : '') + '</div>' +
      '</div></div></section>';
    return page(D, { key: 'location', active: 'about', file: 'location.html', title: '오시는길 · 진료시간', body: body });
  };

  P.notices = function (D) {
    var list = (D.notices.notices || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var body = subHero([['공지사항']], '공지사항', '병원 소식과 진료 일정 변경을 알려드립니다.', Icons.icon('inpatient', 'xl')) +
      '<section class="sec"><div class="wrap narrow">' + (list.length ? '<div class="nlist">' + list.map(function (x, i) {
        return '<details' + (i ? '' : ' open') + '><summary><span>' + esc(x.title) + '</span><time>' + esc(x.date) + '</time></summary><div class="nbody">' + linkify(x.body) +
          (x.image ? '<img src="' + esc(img(x.image)) + '" alt="" loading="lazy">' : '') + (x.link ? '<p><a class="more-link" href="' + esc(x.link) + '">자세히 보기</a></p>' : '') + '</div></details>';
      }).join('') + '</div>' : '<p class="empty">등록된 공지사항이 없습니다.</p>') + '</div></section>';
    return page(D, { key: 'notices', file: 'notices.html', title: '공지사항', body: body });
  };

  P.nonpay = function (D) {
    var N = D.nonpay;
    var body = subHero([['병원소개', 'about.html'], ['비급여 진료비용']], '비급여 진료비용 안내', N.intro, Icons.icon('prp', 'xl')) +
      '<section class="sec"><div class="wrap narrow"><p class="posted">게시일 ' + esc(N.posted_date) + ' · 국민건강보험법 제45조에 따른 게시</p>' +
      (N.groups || []).map(function (g) {
        return '<div class="fee-grp"><h2>' + esc(g.title) + '</h2><table class="fee"><thead><tr><th scope="col">항목</th><th scope="col">비고</th><th scope="col">비용</th></tr></thead><tbody>' +
          (g.items || []).map(function (i) { return '<tr><td>' + esc(i.name) + '</td><td>' + esc(i.detail) + '</td><td class="pr">' + esc(i.price) + '</td></tr>'; }).join('') + '</tbody></table></div>';
      }).join('') + (N.notes ? '<div class="notice-box"><b>안내사항</b><p>' + nl(N.notes) + '</p></div>' : '') + '</div></section>';
    return page(D, { key: 'nonpay', active: 'about', file: 'nonpay.html', title: '비급여 진료비용 안내', body: body });
  };

  P.rights = function (D) {
    var R = [['환자의 권리', [
      ['진료받을 권리', '환자는 자신의 건강보호와 증진을 위하여 적절한 보건의료서비스를 받을 권리를 갖고, 성별·나이·종교·신분 및 경제적 사정 등을 이유로 건강에 관한 권리를 침해받지 아니하며, 의료인은 정당한 사유 없이 진료를 거부하지 못한다.'],
      ['알권리 및 자기결정권', '환자는 담당 의사·간호사 등으로부터 질병 상태, 치료 방법, 의학적 연구 대상 여부, 장기이식 여부, 부작용 등 예상 결과 및 진료 비용에 관하여 충분한 설명을 듣고 자세히 물어볼 수 있으며, 이에 관한 동의 여부를 결정할 권리를 가진다.'],
      ['비밀을 보호받을 권리', '환자는 진료와 관련된 신체상·건강상의 비밀과 사생활의 비밀을 침해받지 아니하며, 의료인과 의료기관은 환자의 동의를 받거나 범죄 수사 등 법률에서 정한 경우 외에는 비밀을 누설·발표하지 못한다.'],
      ['상담·조정을 신청할 권리', '환자는 의료서비스 관련 분쟁이 발생한 경우, 한국의료분쟁조정중재원 등에 상담 및 조정 신청을 할 수 있다.']]],
      ['환자의 의무', [
        ['의료인에 대한 신뢰·존중 의무', '환자는 자신의 건강 관련 정보를 의료인에게 정확히 알리고, 의료인의 치료 계획을 신뢰하고 존중하여야 한다.'],
        ['부정한 방법으로 진료를 받지 않을 의무', '환자는 진료 전에 본인의 신분을 밝혀야 하고, 다른 사람의 명의로 진료를 받는 등 거짓이나 부정한 방법으로 진료를 받지 아니한다.']]],
      ['기타', [['의료인의 의무', '의료인은 환자에게 최선의 의료서비스를 제공하기 위하여 노력하여야 하며, 환자의 권리를 존중하여야 한다.'],
        ['고충 상담', '진료와 관련된 불편 사항은 원무과(031-308-8800)로 말씀해 주시면 신속히 처리하겠습니다.']]]];
    var body = subHero([['병원소개', 'about.html'], ['환자의 권리와 의무']], '환자의 권리와 의무', '「의료법」 제4조 제3항 및 같은 법 시행규칙 제1조의3에 따라 게시합니다.', Icons.icon('manual', 'xl')) +
      '<section class="sec"><div class="wrap narrow">' + R.map(function (g) {
        return '<section class="blk"><h2>' + esc(g[0]) + '</h2><ol class="steps">' + g[1].map(function (r, n) { return '<li><span class="no">0' + (n + 1) + '</span><div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div></li>'; }).join('') + '</ol></section>';
      }).join('') + '</div></section>';
    return page(D, { key: 'rights', active: 'about', file: 'rights.html', title: '환자의 권리와 의무', body: body });
  };

  P.survey = function (D) {
    var H = D.home, url = H.survey_url;
    var body = subHero([['병원소개', 'about.html'], ['환자 만족도 조사']], '환자 만족도 조사', '소중한 의견이 더 나은 진료와 서비스로 이어집니다.', Icons.icon('diet', 'xl')) +
      '<section class="sec"><div class="wrap narrow center"><p class="lead-dark">' + esc(H.survey_intro) + '</p>' +
      (url ? '<a class="btn btn-gold lg" href="' + esc(url) + '" target="_blank" rel="noopener">설문 참여하기</a><div id="qr" class="qr" data-url="' + esc(url) + '"></div><p class="muted">대기실에서는 휴대폰 카메라로 QR코드를 스캔해 주세요.</p>'
        : '<p class="empty">설문 준비 중입니다. 접수창구에 비치된 QR코드로 참여해 주세요.</p>') +
      '<ol class="sv-steps"><li>카메라 실행</li><li>QR 스캔</li><li>설문 제출</li><li>완료 화면 제시</li></ol>' +
      '<div class="notice-box left"><b>개인정보 안내</b><p>' + esc(H.survey_privacy) + '</p></div></div></section>';
    return page(D, { key: 'survey', active: 'about', file: 'survey.html', title: '환자 만족도 조사', body: body,
      scripts: url ? '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script>' : '' });
  };

  P.reviews = function (D) {
    var R = D.reviews, cl = R.clinics || [];
    var body = subHero([['병원소개', 'about.html'], ['방문자 리뷰']], '방문자 리뷰', R.intro, Icons.icon('postpartum', 'xl')) +
      '<section class="sec"><div class="wrap"><div class="pill-tabs" role="tablist">' + cl.map(function (c, i) {
        return '<button type="button" role="tab" id="rt' + i + '" aria-controls="rp' + i + '" aria-selected="' + (i ? 'false' : 'true') + '">' + esc(c.name) + '</button>';
      }).join('') + '</div>' + cl.map(function (c, i) {
        var list = c.reviews || [];
        return '<div role="tabpanel" id="rp' + i + '" aria-labelledby="rt' + i + '"' + (i ? ' hidden' : '') + '>' +
          (list.length ? '<div class="rv-grid">' + list.map(function (v) {
            return '<figure class="rv"><blockquote>' + nl(v.text) + '</blockquote><figcaption>' + ((v.tags || []).length ? '<span class="rv-tags">' + v.tags.map(function (t) { return '<i>' + esc(t) + '</i>'; }).join('') + '</span>' : '') + (v.date ? '<time>' + esc(v.date) + '</time>' : '') + '</figcaption></figure>';
          }).join('') + '</div>' : '<p class="empty">리뷰를 준비하고 있습니다.</p>') +
          (c.naver_url ? '<p class="more"><a class="btn btn-naver" href="' + esc(c.naver_url) + '" target="_blank" rel="noopener">네이버에서 ' + esc(c.name) + ' 리뷰 전체 보기</a></p>' : '') + '</div>';
      }).join('') + (R.notice ? '<p class="muted center">' + esc(R.notice) + '</p>' : '') + '</div></section>';
    return page(D, { key: 'reviews', active: 'about', file: 'reviews.html', title: '방문자 리뷰', body: body });
  };

  P.privacy = function (D) {
    var body = subHero([['개인정보처리방침']], '개인정보처리방침', '', '') +
      '<section class="sec"><div class="wrap narrow prose"><p>노블365의원 · 노블경희한의원(이하 \'병원\')은 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>' +
      '<h2>1. 수집하는 개인정보</h2><p>본 홈페이지는 회원가입, 온라인 예약 등 개인정보를 입력받는 기능을 운영하지 않으며, 별도의 개인정보를 수집하지 않습니다. 진료와 관련된 개인정보는 내원 시 「의료법」 등 관계 법령에 따라 처리됩니다.</p>' +
      '<h2>2. 쿠키 등의 사용</h2><p>홈페이지는 팝업 \'오늘 하루 보지 않기\' 기능을 위해 이용자의 브라우저에 설정값만 저장하며, 개인을 식별할 수 있는 정보는 저장하지 않습니다.</p>' +
      '<h2>3. 개인정보 보호책임자</h2><p>성명: ' + esc(D.site.privacy_officer || '(담당자명 입력)') + ' · 연락처: 031-308-8800</p>' +
      '<h2>4. 시행일</h2><p>본 방침은 2026년 11월 9일부터 시행합니다.</p></div></section>';
    return page(D, { key: 'privacy', file: 'privacy.html', title: '개인정보처리방침', body: body });
  };

  /* 전체 페이지 목록 */
  function all(D) {
    var out = { 'index.html': P.home(D), 'about.html': P.about(D), 'doctors.html': P.doctors(D), 'location.html': P.location(D),
      'notices.html': P.notices(D), 'nonpay.html': P.nonpay(D), 'rights.html': P.rights(D), 'survey.html': P.survey(D),
      'reviews.html': P.reviews(D), 'privacy.html': P.privacy(D) };
    D.clinics.categories.forEach(function (c) {
      out[cHref(c.id)] = P.clinicCat(D, c.id);
      c.items.forEach(function (i) { out[cHref(c.id, i.id)] = P.clinicItem(D, c.id, i.id); });
    });
    return out;
  }

  var api = { all: all, pages: P, cHref: cHref, esc: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NobleRender = api;
})(this);
