/* 노블365 – 화면 동작 (메뉴, 탭, 진료중 표시, 공지 팝업). 내용은 미리 만들어진 HTML에 들어 있습니다. */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* 모바일 메뉴 */
  var dr = $('.drawer'), bg = $('.burger');
  function setDrawer(open) {
    if (!dr) return;
    dr.hidden = !open; document.documentElement.classList.toggle('lock', open);
    if (bg) bg.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var c = $('.close', dr); if (c) c.focus(); } else if (bg) bg.focus();
  }
  if (bg) bg.addEventListener('click', function () { setDrawer(true); });
  if (dr) {
    $('.dim', dr).addEventListener('click', function () { setDrawer(false); });
    $('.close', dr).addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dr.hidden) setDrawer(false); });
  }

  /* 탭 (진료 안내, 리뷰) */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(t) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); var x = tabs[(i + n + tabs.length) % tabs.length]; select(x); x.focus(); }
      });
    });
  });

  /* 지금 진료중 표시 (한국 시간 기준) */
  function days(label) {
    if (/평일|월\s*~\s*금/.test(label)) return [1, 2, 3, 4, 5];
    if (/주말|토\s*[·,~]\s*일/.test(label)) return [6, 0];
    if (/토/.test(label)) return [6];
    if (/일요일|공휴일/.test(label)) return [0];
    return null;
  }
  $$('.open-now').forEach(function (el) {
    var hours; try { hours = JSON.parse(el.getAttribute('data-hours')); } catch (e) { return; }
    var now = new Date(Date.now() + 9 * 3600 * 1000), dow = now.getUTCDay(), min = now.getUTCHours() * 60 + now.getUTCMinutes();
    var known = false, open = false, lunch = false;
    hours.forEach(function (h) {
      var m = /(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/.exec(h[1] || ''); if (!m) return;
      var s = +m[1] * 60 + +m[2], e = +m[3] * 60 + +m[4];
      if (/점심/.test(h[0])) { if (min >= s && min < e) lunch = true; return; }
      var d = days(h[0] || ''); if (d && d.indexOf(dow) > -1) { known = true; if (min >= s && min < e) open = true; }
    });
    if (!known) return;
    el.textContent = open ? (lunch ? '점심시간' : '지금 진료중') : '진료시간 외';
    el.className = 'open-now ' + (open && !lunch ? 'is-open' : 'is-closed');
  });

  /* 만족도 조사 QR */
  var qr = $('#qr');
  if (qr) window.addEventListener('load', function () {
    if (window.QRCode) new window.QRCode(qr, { text: qr.getAttribute('data-url'), width: 180, height: 180, colorDark: '#0d2440' });
  });

  /* 스크롤 등장 효과 (기본은 보이는 상태) */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var els = $$('.reveal'); document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); else io.observe(el); });
  }

  /* 공지 팝업 – content/notices.json 을 바로 읽어서 띄웁니다 */
  if (document.body.getAttribute('data-page') === 'privacy') return;
  fetch('content/notices.json?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (n) {
    var today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10), hidden = {};
    try { hidden = JSON.parse(localStorage.getItem('noble_pop_hide') || '{}'); } catch (e) {}
    var list = (n.notices || []).filter(function (x) {
      if (!x.popup) return false;
      if (x.popup_start && today < String(x.popup_start).slice(0, 10)) return false;
      if (x.popup_end && today > String(x.popup_end).slice(0, 10)) return false;
      var key = (x.id || x.title) + '|' + (x.date || ''), closed = '';
      try { closed = sessionStorage.getItem('noble_pop_closed_' + key); } catch (e) {}
      return hidden[key] !== today && !closed;
    });
    if (!list.length) return;
    var img = function (s) { return String(s).replace(/^\//, ''); };
    var wrap = document.createElement('div');
    wrap.className = 'pop-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', '병원 공지');
    wrap.innerHTML = list.map(function (x, i) {
      return '<div class="pop" data-i="' + i + '">' +
        (x.image ? (x.link ? '<a href="' + esc(x.link) + '">' : '') + '<img class="pop-img" src="' + esc(img(x.image)) + '" alt="' + esc(x.title) + '">' + (x.link ? '</a>' : '') : '') +
        ((x.title || x.body) ? '<div class="pop-bd"><p class="pop-tag">NOTICE</p><h3>' + esc(x.title) + '</h3><p class="pop-txt">' + esc(x.body).replace(/\n/g, '<br>') + '</p>' +
          (x.link ? '<a class="pop-link" href="' + esc(x.link) + '">자세히 보기</a>' : '') + '</div>' : '') +
        '<div class="pop-ft"><button type="button" data-act="today">오늘 하루 보지 않기</button><button type="button" data-act="close">닫기</button></div></div>';
    }).join('');
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]');
      if (!b) { if (e.target === wrap) wrap.remove(); return; }
      var box = b.closest('.pop'), x = list[+box.getAttribute('data-i')], key = (x.id || x.title) + '|' + (x.date || '');
      if (b.getAttribute('data-act') === 'today') { hidden[key] = today; try { localStorage.setItem('noble_pop_hide', JSON.stringify(hidden)); } catch (err) {} }
      try { sessionStorage.setItem('noble_pop_closed_' + key, '1'); } catch (err) {}
      box.remove(); if (!wrap.querySelector('.pop')) wrap.remove();
    });
  }).catch(function () {});
})();
