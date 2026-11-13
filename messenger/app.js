/* 노블 메신저 – 앱 동작
   데이터: Supabase (로그인, 데이터베이스, 실시간, 파일 저장, 서버 함수) */
(function () {
  'use strict';
  var CFG = window.NOBLE_CONFIG || {};
  var EMAIL_DOMAIN = 'staff.noble365.app';
  var root = document.getElementById('root');

  /* ---------------- 작은 도우미 ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(s) { return esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function initial(n) { return (n || '?').trim().slice(0, 1); }
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  function d(x) { return x instanceof Date ? x : new Date(x); }
  function hm(x) { var t = d(x), h = t.getHours(), m = t.getMinutes(); return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m; }
  function dayLabel(x) { var t = d(x); return t.getFullYear() + '년 ' + (t.getMonth() + 1) + '월 ' + t.getDate() + '일 ' + WD[t.getDay()] + '요일'; }
  function sameDay(a, b) { a = d(a); b = d(b); return a.toDateString() === b.toDateString(); }
  function shortTime(x) {
    var t = d(x), now = new Date();
    if (sameDay(t, now)) return hm(t);
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(t, y)) return '어제';
    return (t.getMonth() + 1) + '/' + t.getDate();
  }
  function ymd(x) { var t = d(x); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
  function size(n) { if (!n && n !== 0) return ''; if (n < 1024) return n + 'B'; if (n < 1048576) return (n / 1024).toFixed(0) + 'KB'; return (n / 1048576).toFixed(1) + 'MB'; }
  function mins(n) { n = +n || 0; var h = Math.floor(n / 60), m = n % 60; return h ? h + '시간' + (m ? ' ' + m + '분' : '') : m + '분'; }
  var IC = {
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.2 2.6 3.5 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.8-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.8H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.8-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.8 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.8H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M15 18l-6-6 6-6"/>', clip: '<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
    more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>', mute: '<path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
  function toast(html, onClick) {
    var el = document.createElement('div'); el.className = 'toast'; el.innerHTML = html; el.setAttribute('role', 'status');
    document.body.appendChild(el);
    var t = setTimeout(function () { el.remove(); }, 4200);
    el.addEventListener('click', function () { clearTimeout(t); el.remove(); if (onClick) onClick(); });
  }
  function errMsg(e) {
    var m = (e && (e.message || e.error_description || e.error)) || String(e);
    if (/Invalid login/i.test(m)) return '아이디 또는 비밀번호가 맞지 않습니다.';
    if (/banned/i.test(m)) return '사용이 정지된 계정입니다. 관리자에게 문의해 주세요.';
    if (/Failed to fetch|NetworkError/i.test(m)) return '인터넷 연결을 확인해 주세요.';
    return m;
  }

  /* ---------------- 설정 확인 ---------------- */
  if (!CFG.url || !CFG.anonKey) {
    root.innerHTML = '<div class="login"><div class="login-card"><div class="login-brand"><img src="../images/logo.svg" alt=""><div><b>노블 메신저</b><span>설정이 필요합니다</span></div></div>' +
      '<p class="muted">messenger/config.js 파일에 Supabase 주소(url)와 공개 키(anonKey)를 넣으면 사용할 수 있습니다. 설치 가이드를 확인해 주세요.</p></div></div>';
    return;
  }
  var sb = window.supabase.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'noble-msg-auth' } });

  /* ---------------- 상태 ---------------- */
  var S = {
    me: null, profiles: {}, rooms: [], notices: [], noticeReads: {}, pendingCount: 0,
    route: { tab: 'chats', id: null }, room: null, members: {}, messages: [], oldestLoaded: null, hasOlder: false,
    urlCache: {}, channel: null, workTab: 'new', adminMonth: ymd(new Date()).slice(0, 7), adminStatus: '전체', staffQuery: ''
  };

  /* ---------------- 로그인 ---------------- */
  function renderLogin(msg) {
    root.innerHTML = '<main class="login"><form class="login-card" id="loginForm" novalidate>' +
      '<div class="login-brand"><img src="../images/logo.svg" alt=""><div><b>노블 메신저</b><span>노블365의원 · 노블경희한의원</span></div></div>' +
      '<div class="field"><label for="lid">아이디</label><input class="input" id="lid" autocomplete="username" autocapitalize="off" spellcheck="false" required></div>' +
      '<div class="field"><label for="lpw">비밀번호</label><input class="input" id="lpw" type="password" autocomplete="current-password" required></div>' +
      '<p class="err" id="lerr">' + esc(msg || '') + '</p>' +
      '<button class="btn btn-navy block" id="lbtn">로그인</button>' +
      '<p class="muted small" style="margin-top:14px;text-align:center">계정은 본부장님(관리자)이 발급합니다.</p></form></main>';
    $('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = $('#lid').value.trim().toLowerCase(), pw = $('#lpw').value;
      if (!id || !pw) { $('#lerr').textContent = '아이디와 비밀번호를 입력해 주세요.'; return; }
      $('#lbtn').disabled = true; $('#lbtn').textContent = '로그인 중…';
      sb.auth.signInWithPassword({ email: id + '@' + EMAIL_DOMAIN, password: pw }).then(function (r) {
        if (r.error) throw r.error;
        return boot();
      }).catch(function (er) { $('#lerr').textContent = errMsg(er); $('#lbtn').disabled = false; $('#lbtn').textContent = '로그인'; });
    });
    setTimeout(function () { var i = $('#lid'); if (i) i.focus(); }, 50);
  }

  /* ---------------- 시작 ---------------- */
  function boot() {
    return sb.auth.getSession().then(function (r) {
      var ses = r.data && r.data.session;
      if (!ses) { renderLogin(); return; }
      return sb.from('profiles').select('*').order('name').then(function (p) {
        if (p.error) throw p.error;
        S.profiles = {}; (p.data || []).forEach(function (x) { S.profiles[x.id] = x; });
        S.me = S.profiles[ses.user.id];
        if (!S.me || !S.me.active) { return sb.auth.signOut().then(function () { renderLogin('메신저 사용 권한이 없는 계정입니다.'); }); }
        renderShell();
        subscribeRealtime();
        return Promise.all([loadRooms(), loadNotices(), loadPending()]).then(function () { route(); });
      });
    }).catch(function (e) { renderLogin(errMsg(e)); });
  }

  /* ---------------- 화면 틀 ---------------- */
  var TABS = [['chats', '채팅', 'chat'], ['notices', '공지', 'bell'], ['work', '근무신청', 'clock'], ['staff', '직원', 'users'], ['settings', '설정', 'gear']];
  function renderShell() {
    var tabs = TABS.slice(); if (S.me.role === 'admin') tabs.splice(4, 0, ['admin', '관리', 'shield']);
    root.innerHTML = '<div class="app" id="app"><nav class="rail" aria-label="메뉴"><img class="logo" src="../images/logo.svg" alt="노블">' +
      tabs.map(function (t) { return '<a class="tab" href="#' + t[0] + '" data-tab="' + t[0] + '">' + svg(t[2]) + '<span>' + t[1] + '</span><span class="badge" data-badge="' + t[0] + '" hidden></span></a>'; }).join('') +
      '<div class="spacer"></div></nav>' +
      '<section class="list-pane" id="list"></section><section class="main-pane" id="main"></section></div>';
  }
  function setBadges() {
    var chat = S.rooms.reduce(function (a, r) { return a + (r.muted ? 0 : r.unread); }, 0);
    var nt = S.notices.filter(function (n) { return !S.noticeReads[n.id]; }).length;
    var map = { chats: chat, notices: nt, admin: S.pendingCount, work: S.me.role === 'admin' ? S.pendingCount : 0 };
    $$('[data-badge]').forEach(function (b) { var v = map[b.getAttribute('data-badge')] || 0; b.hidden = !v; b.textContent = v > 99 ? '99+' : v; });
    try { if (navigator.setAppBadge) { var tot = chat + nt; tot ? navigator.setAppBadge(tot) : navigator.clearAppBadge(); } } catch (e) {}
  }

  /* ---------------- 라우팅 ---------------- */
  window.addEventListener('hashchange', route);
  function route() {
    if (!S.me) return;
    var h = location.hash.replace(/^#/, '') || 'chats', parts = h.split('/');
    var tab = parts[0], id = parts[1] || null;
    if (tab === 'room') { S.route = { tab: 'chats', id: id }; }
    else if (tab === 'notice') { S.route = { tab: 'notices', id: id }; }
    else { S.route = { tab: tab, id: null }; }
    var app = $('#app'); if (!app) return;
    $$('.tab').forEach(function (t) { if (t.getAttribute('data-tab') === S.route.tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    app.classList.remove('in-detail', 'in-room', 'single');
    if (S.route.tab !== 'chats' || !S.route.id) leaveRoom();
    switch (S.route.tab) {
      case 'chats': renderRoomList(); if (S.route.id) { app.classList.add('in-detail', 'in-room'); openRoom(S.route.id); } else renderPlaceholder('대화를 선택해 주세요'); break;
      case 'notices': renderNoticeList(); if (S.route.id) { app.classList.add('in-detail'); openNotice(+S.route.id); } else renderPlaceholder('공지를 선택해 주세요'); break;
      case 'work': single(); renderWork(); break;
      case 'staff': single(); renderStaff(); break;
      case 'admin': single(); if (S.me.role === 'admin') renderAdmin(); break;
      case 'settings': single(); renderSettings(); break;
      default: location.hash = '#chats';
    }
    setBadges();
  }
  function single() { var a = $('#app'); a.classList.add('in-detail', 'single'); $('#list').hidden = true; $('#main').hidden = false; }
  function unsingle() { $('#list').hidden = false; $('#main').hidden = false; }
  function renderPlaceholder(t) { $('#main').innerHTML = '<div class="empty" style="margin:auto">' + esc(t) + '</div>'; $('#main').style.justifyContent = 'center'; }
  function header(title, opts) {
    opts = opts || {};
    return '<header class="pane-hd">' + (opts.back ? '<a class="icon-btn back" href="' + opts.back + '" aria-label="뒤로">' + svg('back') + '</a>' : '') +
      '<h1>' + title + '</h1>' + (opts.right || '') + '</header>';
  }

  /* ================= 채팅 ================= */
  function loadRooms() {
    return sb.rpc('my_rooms').then(function (r) { if (r.error) throw r.error; S.rooms = r.data || []; setBadges(); });
  }
  var roomsTimer = null;
  function refreshRooms() { clearTimeout(roomsTimer); roomsTimer = setTimeout(function () { loadRooms().then(function () { if (S.route.tab === 'chats') renderRoomList(); }); }, 250); }

  function renderRoomList() {
    unsingle(); $('#main').style.justifyContent = '';
    var q = (S.roomQuery || '').trim();
    var list = S.rooms.filter(function (r) { return !q || (r.name || '').indexOf(q) > -1; });
    $('#list').innerHTML = header('채팅', { right: '<button class="icon-btn" id="newChat" aria-label="새 대화">' + svg('plus') + '</button>' }) +
      '<div class="search">' + svg('search') + '<input id="roomQ" placeholder="대화방 검색" value="' + esc(q) + '" aria-label="대화방 검색"></div>' +
      '<div class="pane-body">' + (list.length ? list.map(function (r) {
        var grp = r.type === 'group';
        return '<a class="room-item" href="#room/' + r.id + '"' + (S.route.id === r.id ? ' aria-current="true"' : '') + '>' +
          '<span class="avatar' + (grp ? ' grp' : '') + '">' + esc(grp ? '#' : initial(r.name)) + '</span>' +
          '<span class="ri-main"><span class="ri-top"><b>' + esc(r.name) + (grp ? '<small>' + r.member_count + '</small>' : '') + (r.muted ? ' <svg class="mute-ico" viewBox="0 0 24 24">' + IC.mute + '</svg>' : '') + '</b><time>' + (r.last_body != null ? shortTime(r.last_message_at) : '') + '</time></span>' +
          '<span class="ri-bot"><p>' + esc(r.last_body == null ? '새 대화방' : (grp && r.last_sender ? r.last_sender + ': ' : '') + r.last_body) + '</p>' + (r.unread ? '<span class="badge">' + (r.unread > 99 ? '99+' : r.unread) + '</span>' : '') + '</span></span></a>';
      }).join('') : '<p class="empty">' + (q ? '검색 결과가 없습니다.' : '아직 대화가 없습니다.<br>오른쪽 위 + 버튼으로 대화를 시작하세요.') + '</p>') + '</div>';
    $('#newChat').onclick = newChatSheet;
    var qi = $('#roomQ'); qi.oninput = function () { S.roomQuery = qi.value; var pos = qi.selectionStart; renderRoomList(); var n = $('#roomQ'); n.focus(); n.setSelectionRange(pos, pos); };
  }

  function others() { return Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active && p.id !== S.me.id; }); }
  function personLabel(p) { return [p.clinic !== '공통' ? p.clinic.replace('노블', '') : '', p.dept, p.title].filter(Boolean).join(' · '); }

  function newChatSheet() {
    var list = others().sort(function (a, b) { return (a.dept + a.name).localeCompare(b.dept + b.name, 'ko'); });
    var m = sheet('새 대화', '<div class="field"><label for="gname">단체방 이름 <span class="muted">(2명 이상 선택 시)</span></label><input class="input" id="gname" placeholder="예: 원무과, 물리치료실"></div>' +
      '<div class="search" style="margin:0 0 10px">' + svg('search') + '<input id="pq" placeholder="이름·부서 검색" aria-label="직원 검색"></div>' +
      '<div class="pick" id="pick">' + list.map(function (p) {
        return '<label data-s="' + esc(p.name + p.dept + p.clinic + p.title) + '"><input type="checkbox" value="' + p.id + '"><span class="avatar sm">' + esc(initial(p.name)) + '</span><span><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(personLabel(p)) + '</span></span></label>';
      }).join('') + '</div><p class="err" id="nerr"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="startChat">대화 시작</button></div>');
    $('#pq', m).oninput = function () { var q = this.value.trim(); $$('#pick label', m).forEach(function (l) { l.hidden = q && l.getAttribute('data-s').indexOf(q) < 0; }); };
    $('#startChat', m).onclick = function () {
      var ids = $$('#pick input:checked', m).map(function (i) { return i.value; });
      if (!ids.length) { $('#nerr', m).textContent = '대화할 직원을 선택해 주세요.'; return; }
      var p;
      if (ids.length === 1) p = sb.rpc('start_dm', { other: ids[0] });
      else {
        var nm = $('#gname', m).value.trim() || ids.map(function (i) { return S.profiles[i].name; }).slice(0, 3).join(', ') + (ids.length > 3 ? ' 외' : '');
        p = sb.rpc('create_group', { room_name: nm, member_ids: ids });
      }
      this.disabled = true;
      p.then(function (r) { if (r.error) throw r.error; closeSheet(m); return loadRooms().then(function () { location.hash = '#room/' + r.data; }); })
        .catch(function (e) { $('#nerr', m).textContent = errMsg(e); $('#startChat', m).disabled = false; });
    };
  }

  /* ---- 대화방 ---- */
  function leaveRoom() { S.room = null; S.messages = []; S.members = {}; }
  function openRoom(id) {
    if (S.room && S.room.id === id && $('#msgs')) return;
    var info = S.rooms.find(function (r) { return r.id === id; });
    S.room = { id: id, info: info }; S.messages = []; S.members = {}; S.hasOlder = false;
    $('#main').style.justifyContent = '';
    var title = info ? esc(info.name) + (info.type === 'group' ? '<small>' + info.member_count + '명</small>' : '') : '대화';
    $('#main').innerHTML = '<div class="chat">' + header(title, { back: '#chats', right: '<button class="icon-btn" id="roomMenu" aria-label="대화방 메뉴">' + svg('more') + '</button>' }) +
      '<div class="msgs" id="msgs" aria-live="polite"><p class="empty">불러오는 중…</p></div><div class="uploading" id="upl" hidden></div>' +
      '<form class="composer" id="composer"><label class="icon-btn" aria-label="파일 첨부" title="사진·파일 첨부">' + svg('clip') + '<input type="file" id="fileIn" multiple hidden></label>' +
      '<textarea id="txt" rows="1" placeholder="메시지 입력" aria-label="메시지 입력"></textarea><button class="send" id="sendBtn" aria-label="보내기" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20l18-8L3 4l2 7 9 1-9 1z"/></svg></button></form></div>';
    $('#roomMenu').onclick = roomMenu;
    var txt = $('#txt'), btn = $('#sendBtn');
    function grow() { txt.style.height = 'auto'; txt.style.height = Math.min(140, txt.scrollHeight) + 'px'; btn.disabled = !txt.value.trim(); }
    txt.addEventListener('input', grow);
    txt.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(min-width:861px)').matches) { e.preventDefault(); send(); }
    });
    txt.addEventListener('paste', function (e) {
      var files = Array.prototype.slice.call((e.clipboardData && e.clipboardData.files) || []);
      if (files.length) { e.preventDefault(); uploadFiles(files); }
    });
    $('#composer').addEventListener('submit', function (e) { e.preventDefault(); send(); });
    $('#fileIn').addEventListener('change', function () { uploadFiles(Array.prototype.slice.call(this.files)); this.value = ''; });
    var msgsEl = $('#msgs');
    msgsEl.addEventListener('dragover', function (e) { e.preventDefault(); });
    msgsEl.addEventListener('drop', function (e) { e.preventDefault(); uploadFiles(Array.prototype.slice.call(e.dataTransfer.files || [])); });
    function send() {
      var body = txt.value.trim(); if (!body) return;
      txt.value = ''; grow();
      postMessage({ body: body });
    }
    Promise.all([
      sb.from('room_members').select('user_id, last_read_at, muted').eq('room_id', id),
      sb.from('messages').select('*').eq('room_id', id).order('created_at', { ascending: false }).limit(60)
    ]).then(function (res) {
      if (res[0].error) throw res[0].error; if (res[1].error) throw res[1].error;
      if (!S.room || S.room.id !== id) return;
      res[0].data.forEach(function (m) { S.members[m.user_id] = m; });
      S.messages = res[1].data.reverse(); S.hasOlder = res[1].data.length === 60;
      if (!info) { loadRooms().then(function () { S.room.info = S.rooms.find(function (r) { return r.id === id; }); var h = $('#main .pane-hd h1'); if (h && S.room.info) h.innerHTML = esc(S.room.info.name); }); }
      renderMessages(true); markRead();
    }).catch(function (e) { $('#msgs').innerHTML = '<p class="empty">' + esc(errMsg(e)) + '</p>'; });
    if (window.matchMedia('(min-width:861px)').matches) setTimeout(function () { txt.focus(); }, 50);
  }

  function loadOlder() {
    if (!S.messages.length) return;
    var first = S.messages[0], el = $('#msgs'), h = el.scrollHeight;
    sb.from('messages').select('*').eq('room_id', S.room.id).lt('created_at', first.created_at).order('created_at', { ascending: false }).limit(60).then(function (r) {
      if (r.error) return;
      S.messages = r.data.reverse().concat(S.messages); S.hasOlder = r.data.length === 60;
      renderMessages(false); el.scrollTop = el.scrollHeight - h;
    });
  }

  function unreadCount(m) {
    var n = 0, t = d(m.created_at);
    Object.keys(S.members).forEach(function (u) { if (u !== m.sender_id && d(S.members[u].last_read_at) < t) n++; });
    return n;
  }

  function renderMessages(toBottom) {
    var el = $('#msgs'); if (!el) return;
    var nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    var html = S.hasOlder ? '<button class="btn btn-line sm load-older" id="older">이전 메시지 보기</button>' : '';
    if (!S.messages.length) html += '<p class="empty">첫 메시지를 보내 보세요.</p>';
    var prev = null, needUrls = [];
    S.messages.forEach(function (m) {
      if (!prev || !sameDay(prev.created_at, m.created_at)) { html += '<div class="day">' + dayLabel(m.created_at) + '</div>'; prev = null; }
      var mine = m.sender_id === S.me.id, p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
      var cont = prev && prev.sender_id === m.sender_id && (d(m.created_at) - d(prev.created_at)) < 5 * 60000;
      var content;
      if (m.deleted) content = '<div class="bubble deleted">삭제된 메시지입니다</div>';
      else if (m.file_path) {
        needUrls.push(m.file_path);
        var u = cachedUrl(m.file_path);
        if ((m.file_type || '').indexOf('image/') === 0) content = '<a class="img-msg" data-path="' + esc(m.file_path) + '" href="' + (u || '#') + '" target="_blank" rel="noopener"><img alt="' + esc(m.file_name || '사진') + '" ' + (u ? 'src="' + u + '"' : '') + ' loading="lazy"></a>';
        else content = '<a class="file-msg" data-path="' + esc(m.file_path) + '" data-dl="' + esc(m.file_name || 'file') + '" href="' + (u || '#') + '" target="_blank" rel="noopener">' + svg('file') + '<span style="min-width:0"><b>' + esc(m.file_name || '파일') + '</b><span>' + size(m.file_size) + ' · 열기</span></span></a>';
        if (m.body) content += '<div class="bubble">' + linkify(m.body) + '</div>';
      } else content = '<div class="bubble">' + linkify(m.body) + '</div>';
      var un = unreadCount(m);
      html += '<div class="msg' + (mine ? ' mine' : '') + (cont ? ' cont' : '') + '" data-id="' + m.id + '">' +
        (mine ? '' : '<span class="avatar sm">' + esc(initial(p.name)) + '</span>') +
        '<div class="col">' + (mine ? '' : '<div class="who">' + esc(p.name) + '</div>') +
        '<div class="line"><div class="col" style="gap:4px">' + content + '</div><span class="meta">' + (un ? '<span class="unread">' + un + '</span>' : '') + '<time>' + hm(m.created_at) + '</time></span>' +
        (mine && !m.deleted ? '<button class="msg-more" data-del="' + m.id + '" aria-label="메시지 삭제" title="삭제">×</button>' : '') + '</div></div></div>';
      prev = m;
    });
    el.innerHTML = html;
    var ob = $('#older'); if (ob) ob.onclick = loadOlder;
    $$('[data-del]', el).forEach(function (b) { b.onclick = function () { deleteMessage(+b.getAttribute('data-del'), b); }; });
    if (toBottom || nearBottom) el.scrollTop = el.scrollHeight;
    $$('img', el).forEach(function (im) { im.addEventListener('load', function () { if (toBottom || nearBottom) el.scrollTop = el.scrollHeight; }, { once: true }); });
    signUrls(needUrls.filter(function (p) { return !cachedUrl(p); }));
  }

  function cachedUrl(p) { var c = S.urlCache[p]; return c && c.exp > Date.now() ? c.url : null; }
  function signUrls(paths) {
    if (!paths.length) return Promise.resolve();
    return sb.storage.from('files').createSignedUrls(paths, 3600).then(function (r) {
      (r.data || []).forEach(function (x) { if (x.signedUrl) S.urlCache[x.path] = { url: x.signedUrl, exp: Date.now() + 3500 * 1000 }; });
      $$('[data-path]').forEach(function (a) {
        var u = cachedUrl(a.getAttribute('data-path')); if (!u) return;
        a.href = a.hasAttribute('data-dl') ? u + '&download=' + encodeURIComponent(a.getAttribute('data-dl')) : u;
        var im = $('img', a); if (im && !im.getAttribute('src')) im.src = u;
      });
    });
  }

  function postMessage(row) {
    var roomId = S.room.id;
    row.room_id = roomId; row.sender_id = S.me.id;
    return sb.from('messages').insert(row).select().single().then(function (r) {
      if (r.error) throw r.error;
      addMessage(r.data);
      sb.functions.invoke('push', { body: { action: 'message', message_id: r.data.id } }).catch(function () {});
      refreshRooms();
    }).catch(function (e) { toast('<b>전송 실패</b> ' + esc(errMsg(e))); });
  }
  function addMessage(m) {
    if (!S.room || m.room_id !== S.room.id) return;
    if (S.messages.some(function (x) { return x.id === m.id; })) return;
    S.messages.push(m); renderMessages(m.sender_id === S.me.id);
  }
  function deleteMessage(id, btn) {
    if (btn && !confirmInline(btn, '삭제?')) return;
    sb.from('messages').update({ deleted: true, body: '' }).eq('id', id).then(function (r) {
      if (r.error) { toast(esc(errMsg(r.error))); return; }
      var m = S.messages.find(function (x) { return x.id === id; });
      if (m) { if (m.file_path) sb.storage.from('files').remove([m.file_path]); m.deleted = true; m.body = ''; renderMessages(false); }
      refreshRooms();
    });
  }

  /* 사진은 자동으로 줄여서 올립니다 (최대 1600px, JPEG) */
  function compress(file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var max = 1600, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(function (b) { res(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82); });
    }).catch(function () { return file; });
  }
  function uploadFiles(files) {
    if (!files.length || !S.room) return;
    var roomId = S.room.id, upl = $('#upl');
    var chain = Promise.resolve();
    files.forEach(function (f, i) {
      chain = chain.then(function () {
        if (f.size > 25 * 1024 * 1024) { toast('<b>' + esc(f.name) + '</b> 25MB가 넘어 보낼 수 없습니다'); return; }
        upl.hidden = false; upl.textContent = '보내는 중… (' + (i + 1) + '/' + files.length + ') ' + f.name;
        return compress(f).then(function (ff) {
          var ext = (ff.name.match(/\.([\w]+)$/) || [, 'bin'])[1].toLowerCase();
          var path = 'room/' + roomId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
          return sb.storage.from('files').upload(path, ff, { contentType: ff.type || 'application/octet-stream', upsert: false }).then(function (r) {
            if (r.error) throw r.error;
            if (!S.room || S.room.id !== roomId) return;
            return postMessage({ body: '', file_path: path, file_name: f.name, file_size: ff.size, file_type: ff.type || 'application/octet-stream' });
          });
        }).catch(function (e) { toast('<b>파일 전송 실패</b> ' + esc(errMsg(e))); });
      });
    });
    chain.then(function () { if (upl) upl.hidden = true; });
  }

  var readTimer = null;
  function markRead() {
    if (!S.room || document.visibilityState !== 'visible') return;
    clearTimeout(readTimer);
    readTimer = setTimeout(function () {
      if (!S.room) return;
      var now = new Date().toISOString(), rid = S.room.id;
      sb.from('room_members').update({ last_read_at: now }).eq('room_id', rid).eq('user_id', S.me.id).then(function () {
        var r = S.rooms.find(function (x) { return x.id === rid; }); if (r && r.unread) { r.unread = 0; setBadges(); if (S.route.tab === 'chats') renderRoomList(); }
      });
    }, 300);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { markRead(); if (S.me) { loadRooms().then(function () { if (S.route.tab === 'chats') renderRoomList(); }); loadNotices(); } } });

  function roomMenu() {
    var info = S.room.info || {}, grp = info.type === 'group';
    var mem = Object.keys(S.members).map(function (u) { return S.profiles[u]; }).filter(Boolean);
    var m = sheet(grp ? esc(info.name) : '대화 설정',
      '<p class="muted small" style="margin-bottom:8px">참여자 ' + mem.length + '명</p><div class="chips" style="margin-bottom:16px">' + mem.map(function (p) { return '<span>' + esc(p.name) + '</span>'; }).join('') + '</div>' +
      '<div style="display:grid;gap:8px">' +
      (grp ? '<button class="btn btn-line" id="addMem">사람 추가</button><button class="btn btn-line" id="rename">방 이름 바꾸기</button>' : '') +
      '<button class="btn btn-line" id="muteBtn">' + (info.muted ? '알림 켜기' : '이 방 알림 끄기') + '</button>' +
      (grp ? '<button class="btn btn-danger" id="leave">대화방 나가기</button>' : '') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    var mb = $('#muteBtn', m);
    mb.onclick = function () {
      sb.from('room_members').update({ muted: !info.muted }).eq('room_id', S.room.id).eq('user_id', S.me.id).then(function (r) {
        if (r.error) { toast(esc(errMsg(r.error))); return; }
        info.muted = !info.muted; closeSheet(m); refreshRooms(); toast(info.muted ? '이 방 알림을 껐습니다' : '알림을 켰습니다');
      });
    };
    if (grp) {
      $('#leave', m).onclick = function () {
        if (!confirmInline(this, '정말 나가시겠어요? 한 번 더 누르면 나갑니다')) return;
        sb.from('room_members').delete().eq('room_id', S.room.id).eq('user_id', S.me.id).then(function (r) {
          if (r.error) { toast(esc(errMsg(r.error))); return; }
          closeSheet(m); loadRooms().then(function () { location.hash = '#chats'; });
        });
      };
      $('#rename', m).onclick = function () {
        closeSheet(m);
        var s2 = sheet('방 이름 바꾸기', '<div class="field"><input class="input" id="rn" value="' + esc(info.name) + '" aria-label="방 이름"></div><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="rnOk">저장</button></div>');
        $('#rnOk', s2).onclick = function () {
          var v = $('#rn', s2).value.trim(); if (!v) return;
          sb.from('rooms').update({ name: v }).eq('id', S.room.id).then(function (r) {
            if (r.error) { toast(esc(errMsg(r.error))); return; }
            closeSheet(s2); info.name = v; var h = $('#main .pane-hd h1'); if (h) h.textContent = v; refreshRooms();
          });
        };
      };
      $('#addMem', m).onclick = function () {
        closeSheet(m);
        var cand = others().filter(function (p) { return !S.members[p.id]; });
        var s3 = sheet('사람 추가', '<div class="pick">' + (cand.length ? cand.map(function (p) { return '<label><input type="checkbox" value="' + p.id + '"><span><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(personLabel(p)) + '</span></span></label>'; }).join('') : '<p class="empty">추가할 직원이 없습니다.</p>') + '</div>' +
          '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="amOk">추가</button></div>');
        $('#amOk', s3).onclick = function () {
          var ids = $$('input:checked', s3).map(function (i) { return i.value; }); if (!ids.length) return;
          sb.rpc('add_members', { r: S.room.id, member_ids: ids }).then(function (r) {
            if (r.error) { toast(esc(errMsg(r.error))); return; }
            closeSheet(s3); var rid = S.room.id; S.room = null; refreshRooms(); openRoom(rid);
          });
        };
      };
    }
  }

  /* ================= 공지 ================= */
  function loadNotices() {
    return Promise.all([
      sb.from('notices').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200),
      sb.from('notice_reads').select('notice_id').eq('user_id', S.me.id)
    ]).then(function (r) {
      S.notices = r[0].data || []; S.noticeReads = {};
      (r[1].data || []).forEach(function (x) { S.noticeReads[x.notice_id] = true; });
      setBadges(); if (S.route.tab === 'notices' && !S.route.id) renderNoticeList();
    });
  }
  function renderNoticeList() {
    unsingle(); var admin = S.me.role === 'admin';
    $('#list').innerHTML = header('공지', { right: admin ? '<button class="icon-btn" id="newNotice" aria-label="공지 쓰기">' + svg('plus') + '</button>' : '' }) +
      '<div class="pane-body">' + (S.notices.length ? S.notices.map(function (n) {
        return '<a class="notice-item" href="#notice/' + n.id + '"' + (+S.route.id === n.id ? ' style="background:#eef3fa"' : '') + '><b>' + (!S.noticeReads[n.id] ? '<span class="dot" aria-label="안 읽음"></span>' : '') + (n.pinned ? '<span class="pill gold">고정</span>' : '') + esc(n.title) + '</b>' +
          '<p>' + esc(ymd(n.created_at)) + ' · ' + esc((S.profiles[n.author_id] || {}).name || '') + ' · ' + esc(n.body.slice(0, 60)) + '</p></a>';
      }).join('') : '<p class="empty">등록된 공지가 없습니다.</p>') + '</div>';
    if (admin) $('#newNotice').onclick = function () { noticeSheet(); };
  }
  function openNotice(id) {
    var n = S.notices.find(function (x) { return x.id === id; });
    var main = $('#main'); main.style.justifyContent = '';
    if (!n) { main.innerHTML = header('공지', { back: '#notices' }) + '<p class="empty">공지를 찾을 수 없습니다.</p>'; return; }
    var admin = S.me.role === 'admin';
    main.innerHTML = header('공지', { back: '#notices', right: admin ? '<button class="btn btn-line sm" id="editN">수정</button><button class="btn btn-danger sm" id="delN">삭제</button>' : '' }) +
      '<div class="pane-body"><article class="doc"><h2>' + esc(n.title) + '</h2><p class="doc-meta">' + esc((S.profiles[n.author_id] || {}).name || '') + ' · ' + dayLabel(n.created_at) + ' ' + hm(n.created_at) + '</p>' +
      '<div class="doc-body">' + linkify(n.body) + '</div>' +
      (n.file_path ? '<p style="margin-top:14px"><a class="file-msg" data-path="' + esc(n.file_path) + '" data-dl="' + esc(n.file_name || 'file') + '" href="#" target="_blank" rel="noopener">' + svg('file') + '<span style="min-width:0"><b>' + esc(n.file_name || '첨부파일') + '</b><span>열기</span></span></a></p>' : '') +
      '</article><div id="readBox"></div></div>';
    if (n.file_path) signUrls([n.file_path]);
    if (!S.noticeReads[id]) {
      sb.from('notice_reads').insert({ notice_id: id, user_id: S.me.id }).then(function () { S.noticeReads[id] = true; setBadges(); renderNoticeList(); });
    }
    if (admin) {
      $('#editN').onclick = function () { noticeSheet(n); };
      $('#delN').onclick = function () {
        if (!confirmInline(this, '한 번 더 누르면 삭제')) return;
        sb.from('notices').delete().eq('id', id).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadNotices().then(function () { location.hash = '#notices'; }); });
      };
      sb.from('notice_reads').select('user_id').eq('notice_id', id).then(function (r) {
        var read = {}; (r.data || []).forEach(function (x) { read[x.user_id] = true; });
        var act = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active; });
        var un = act.filter(function (p) { return !read[p.id]; });
        var box = $('#readBox'); if (!box) return;
        box.innerHTML = '<section class="read-box"><h3>읽음 ' + (act.length - un.length) + ' / ' + act.length + '명</h3>' +
          (un.length ? '<p class="muted small" style="margin-bottom:6px">아직 안 읽은 직원</p><div class="chips">' + un.map(function (p) { return '<span>' + esc(p.name) + '</span>'; }).join('') + '</div>' : '<p class="muted small">모두 확인했습니다.</p>') + '</section>';
      });
    }
  }
  function noticeSheet(n) {
    var m = sheet(n ? '공지 수정' : '공지 쓰기',
      '<div class="field"><label for="nt">제목</label><input class="input" id="nt" value="' + esc(n ? n.title : '') + '"></div>' +
      '<div class="field"><label for="nb">내용</label><textarea class="input" id="nb" rows="8">' + esc(n ? n.body : '') + '</textarea></div>' +
      (n ? '' : '<div class="field"><label for="nf">첨부파일 (선택)</label><input class="input" type="file" id="nf"></div>') +
      '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="np" ' + (n && n.pinned ? 'checked' : '') + ' style="width:20px;height:20px;accent-color:var(--navy)"> 맨 위에 고정</label>' +
      (n ? '' : '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="npush" checked style="width:20px;height:20px;accent-color:var(--navy)"> 전 직원 휴대폰으로 알림 보내기</label>') +
      '<p class="err" id="ne"></p><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="nOk">' + (n ? '저장' : '등록') + '</button></div>');
    $('#nOk', m).onclick = function () {
      var t = $('#nt', m).value.trim(), b = $('#nb', m).value.trim(), pin = $('#np', m).checked;
      if (!t) { $('#ne', m).textContent = '제목을 입력해 주세요.'; return; }
      var btn = this; btn.disabled = true;
      var fileIn = $('#nf', m), f = fileIn && fileIn.files[0];
      var up = f ? compress(f).then(function (ff) {
        var path = 'notice/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ((ff.name.match(/\.(\w+)$/) || [, 'bin'])[1]);
        return sb.storage.from('files').upload(path, ff, { contentType: ff.type || 'application/octet-stream' }).then(function (r) { if (r.error) throw r.error; return { file_path: path, file_name: f.name }; });
      }) : Promise.resolve({});
      up.then(function (fx) {
        var row = Object.assign({ title: t, body: b, pinned: pin }, fx);
        if (n) return sb.from('notices').update(row).eq('id', n.id).select().single();
        row.author_id = S.me.id; return sb.from('notices').insert(row).select().single();
      }).then(function (r) {
        if (r.error) throw r.error;
        if (!n && $('#npush', m).checked) sb.functions.invoke('push', { body: { action: 'notice', notice_id: r.data.id } }).catch(function () {});
        closeSheet(m); return loadNotices().then(function () { location.hash = '#notice/' + r.data.id; route(); });
      }).catch(function (e) { $('#ne', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }

  /* ================= 근무 신청 ================= */
  var KINDS = [['초과근무', true], ['휴일근무', true], ['추가근무', true], ['연차', false], ['반차', false], ['조퇴', true], ['지각', true], ['기타', true]];
  function timeKind(k) { var x = KINDS.find(function (y) { return y[0] === k; }); return x ? x[1] : true; }
  function diffMin(a, b) { if (!a || !b) return 0; var p = a.split(':'), q = b.split(':'); var v = (+q[0] * 60 + +q[1]) - (+p[0] * 60 + +p[1]); return v < 0 ? v + 1440 : v; }

  function renderWork() {
    var admin = S.me.role === 'admin', tab = S.workTab;
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('근무 신청') + '<div class="pane-body" id="wbody">' +
      '<div class="seg" role="group" aria-label="근무 신청 메뉴"><button aria-pressed="' + (tab === 'new') + '" data-wt="new">신청하기</button><button aria-pressed="' + (tab === 'mine') + '" data-wt="mine">내 신청 내역</button>' +
      (admin ? '<button aria-pressed="' + (tab === 'all') + '" data-wt="all">전체 관리' + (S.pendingCount ? ' (' + S.pendingCount + ')' : '') + '</button>' : '') + '</div><div id="wcontent"></div></div>';
    $$('[data-wt]').forEach(function (b) { b.onclick = function () { S.workTab = b.getAttribute('data-wt'); renderWork(); }; });
    if (tab === 'new') workForm(); else if (tab === 'mine') workList(false); else workList(true);
  }
  function workForm() {
    var today = ymd(new Date());
    $('#wcontent').innerHTML = '<form class="card" id="wf" novalidate><h3>새 신청</h3>' +
      '<div class="row2"><div class="field"><label for="wk">종류</label><select class="input" id="wk">' + KINDS.map(function (k) { return '<option>' + k[0] + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="wd">날짜</label><input class="input" type="date" id="wd" value="' + today + '"></div></div>' +
      '<div class="row2" id="wtimes"><div class="field"><label for="ws">시작</label><input class="input" type="time" id="ws" step="300"></div><div class="field"><label for="we">종료</label><input class="input" type="time" id="we" step="300"></div></div>' +
      '<div class="field" id="whalf" hidden><label for="wh">반차 구분</label><select class="input" id="wh"><option>오전 반차</option><option>오후 반차</option></select></div>' +
      '<p class="sum" id="wsum" style="border-radius:10px;margin-bottom:14px">시간을 입력하면 자동 계산됩니다.</p>' +
      '<div class="field"><label for="wr">사유</label><textarea class="input" id="wr" rows="3" placeholder="예: 환자 진료 연장, 행사 준비"></textarea></div>' +
      '<p class="err" id="werr"></p><button class="btn btn-navy block" id="wok">신청하기</button></form>' +
      '<p class="muted small" style="padding:0 18px 20px">신청하면 관리자에게 알림이 가고, 승인·반려되면 알림으로 알려드립니다.</p>';
    function upd() {
      var k = $('#wk').value, tk = timeKind(k);
      $('#wtimes').hidden = !tk; $('#whalf').hidden = k !== '반차';
      var mm = tk ? diffMin($('#ws').value, $('#we').value) : (k === '반차' ? 240 : k === '연차' ? 480 : 0);
      $('#wsum').textContent = tk ? ($('#ws').value && $('#we').value ? '합계 ' + mins(mm) + ' (' + mm + '분)' : '시간을 입력하면 자동 계산됩니다.') : (k === '반차' ? '반차 · 4시간' : '연차 · 1일');
      return mm;
    }
    ['wk', 'ws', 'we'].forEach(function (i) { $('#' + i).addEventListener('input', upd); $('#' + i).addEventListener('change', upd); }); upd();
    $('#wf').addEventListener('submit', function (e) {
      e.preventDefault();
      var k = $('#wk').value, tk = timeKind(k), mm = upd();
      if (!$('#wd').value) { $('#werr').textContent = '날짜를 선택해 주세요.'; return; }
      if (tk && (!$('#ws').value || !$('#we').value)) { $('#werr').textContent = '시작·종료 시간을 입력해 주세요.'; return; }
      var row = { user_id: S.me.id, kind: k, work_date: $('#wd').value, start_time: tk ? $('#ws').value : null, end_time: tk ? $('#we').value : null, minutes: mm,
        reason: (k === '반차' ? $('#wh').value + (($('#wr').value.trim()) ? ' · ' : '') : '') + $('#wr').value.trim() };
      $('#wok').disabled = true;
      sb.from('work_requests').insert(row).select().single().then(function (r) {
        if (r.error) throw r.error;
        sb.functions.invoke('push', { body: { action: 'request', request_id: r.data.id } }).catch(function () {});
        toast('<b>신청 완료</b> 관리자 승인을 기다립니다'); loadPending(); S.workTab = 'mine'; renderWork();
      }).catch(function (er) { $('#werr').textContent = errMsg(er); $('#wok').disabled = false; });
    });
  }
  function statusPill(s) { return '<span class="pill ' + (s === '승인' ? 'ok' : s === '반려' ? 'no' : 'gold') + '">' + s + '</span>'; }
  function reqLine(r) { return esc(r.work_date) + (r.start_time ? ' · ' + r.start_time.slice(0, 5) + '~' + (r.end_time || '').slice(0, 5) : '') + (r.minutes ? ' · ' + mins(r.minutes) : ''); }

  function workList(all) {
    var box = $('#wcontent');
    var month = S.adminMonth, st = S.adminStatus;
    var q = sb.from('work_requests').select('*').order('work_date', { ascending: false }).order('created_at', { ascending: false });
    if (all) {
      var y = +month.slice(0, 4), mo = +month.slice(5, 7), end = new Date(y, mo, 0).getDate();
      q = q.gte('work_date', month + '-01').lte('work_date', month + '-' + String(end).padStart(2, '0'));
      if (st !== '전체') q = q.eq('status', st);
      box.innerHTML = '<div class="toolbar"><input class="input" type="month" id="am" value="' + month + '" aria-label="월 선택"><select class="input" id="as" aria-label="상태">' +
        ['전체', '대기', '승인', '반려'].map(function (s) { return '<option' + (s === st ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<button class="btn btn-gold sm" id="csv">' + svg('down').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2"') + ' 급여정리용 엑셀(CSV)</button></div><div id="wl"><p class="empty">불러오는 중…</p></div>';
      $('#am').onchange = function () { S.adminMonth = this.value || S.adminMonth; workList(true); };
      $('#as').onchange = function () { S.adminStatus = this.value; workList(true); };
    } else {
      q = q.eq('user_id', S.me.id).limit(100);
      box.innerHTML = '<div id="wl"><p class="empty">불러오는 중…</p></div>';
    }
    q.then(function (r) {
      if (r.error) throw r.error;
      var rows = r.data || [], wl = $('#wl'); if (!wl) return;
      if (all) {
        var tot = {}; rows.filter(function (x) { return x.status === '승인'; }).forEach(function (x) { tot[x.kind] = (tot[x.kind] || 0) + x.minutes; });
        var sum = Object.keys(tot).map(function (k) { return k + ' ' + mins(tot[k]); }).join(' · ');
        wl.innerHTML = (sum ? '<p class="sum">승인 합계: ' + esc(sum) + '</p>' : '') + (rows.length ? rows.map(function (x) {
          var p = S.profiles[x.user_id] || { name: '(퇴사자)', dept: '' };
          return '<div class="req"><div class="req-top"><b>' + esc(p.name) + ' <span class="muted small">' + esc(p.dept) + '</span> · ' + esc(x.kind) + '</b>' + statusPill(x.status) + '</div>' +
            '<p>' + reqLine(x) + '</p>' + (x.reason ? '<p>사유: ' + esc(x.reason) + '</p>' : '') + (x.review_note ? '<p>메모: ' + esc(x.review_note) + '</p>' : '') +
            '<div class="req-actions">' + (x.status !== '승인' ? '<button class="btn btn-navy sm" data-ap="' + x.id + '">승인</button>' : '') + (x.status !== '반려' ? '<button class="btn btn-danger sm" data-rj="' + x.id + '">반려</button>' : '') +
            (x.status !== '대기' ? '<button class="btn btn-line sm" data-rs="' + x.id + '">대기로 되돌리기</button>' : '') + '</div></div>';
        }).join('') : '<p class="empty">이 달 신청 내역이 없습니다.</p>');
        $$('[data-ap]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-ap'), '승인'); }; });
        $$('[data-rj]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rj'), '반려', true); }; });
        $$('[data-rs]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rs'), '대기'); }; });
        $('#csv').onclick = function () { exportCsv(rows, month); };
      } else {
        wl.innerHTML = rows.length ? rows.map(function (x) {
          return '<div class="req"><div class="req-top"><b>' + esc(x.kind) + '</b>' + statusPill(x.status) + '</div><p>' + reqLine(x) + '</p>' +
            (x.reason ? '<p>사유: ' + esc(x.reason) + '</p>' : '') + (x.review_note ? '<p>관리자 메모: ' + esc(x.review_note) + '</p>' : '') +
            (x.status === '대기' ? '<div class="req-actions"><button class="btn btn-line sm" data-cancel="' + x.id + '">신청 취소</button></div>' : '') + '</div>';
        }).join('') : '<p class="empty">신청 내역이 없습니다.</p>';
        $$('[data-cancel]', wl).forEach(function (b) {
          b.onclick = function () {
            if (!confirmInline(b, '한 번 더 누르면 취소')) return;
            sb.from('work_requests').delete().eq('id', +b.getAttribute('data-cancel')).then(function (r2) { if (r2.error) toast(esc(errMsg(r2.error))); workList(false); });
          };
        });
      }
    }).catch(function (e) { box.innerHTML = '<p class="empty">' + esc(errMsg(e)) + '</p>'; });
  }
  function review(id, status, askNote) {
    function go(note) {
      var patch = { status: status }; if (note != null) patch.review_note = note;
      sb.from('work_requests').update(patch).eq('id', id).then(function (r) {
        if (r.error) { toast(esc(errMsg(r.error))); return; }
        if (status !== '대기') sb.functions.invoke('push', { body: { action: 'request', request_id: id } }).catch(function () {});
        loadPending(); workList(true);
      });
    }
    if (!askNote) { go(null); return; }
    var m = sheet('반려 사유', '<div class="field"><textarea class="input" id="rn" rows="3" placeholder="신청자에게 보이는 메모 (선택)"></textarea></div><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-danger" id="rjOk">반려</button></div>');
    $('#rjOk', m).onclick = function () { closeSheet(m); go($('#rn', m).value.trim()); };
  }
  function exportCsv(rows, month) {
    var head = ['구분', '사업장', '성명', '부서', '직책', '날짜', '시작', '종료', '시간(분)', '시간', '사유', '상태', '처리메모'];
    var lines = [head].concat(rows.slice().sort(function (a, b) {
      var pa = S.profiles[a.user_id] || {}, pb = S.profiles[b.user_id] || {};
      return (a.kind + (pa.clinic || '') + (pa.name || '') + a.work_date).localeCompare(b.kind + (pb.clinic || '') + (pb.name || '') + b.work_date, 'ko');
    }).map(function (x) {
      var p = S.profiles[x.user_id] || {};
      return [x.kind, p.clinic || '', p.name || '', p.dept || '', p.title || '', x.work_date, (x.start_time || '').slice(0, 5), (x.end_time || '').slice(0, 5), x.minutes, mins(x.minutes), x.reason, x.status, x.review_note];
    }));
    var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = month.replace('-', '년 ') + '월 근무신청.csv'; document.body.appendChild(a); a.click(); a.remove();
  }
  function loadPending() {
    if (S.me.role !== 'admin') return Promise.resolve();
    return sb.from('work_requests').select('id', { count: 'exact', head: true }).eq('status', '대기').then(function (r) { S.pendingCount = r.count || 0; setBadges(); });
  }

  /* ================= 직원 ================= */
  function groupPeople(list) {
    var g = {};
    list.forEach(function (p) { var k = (p.clinic === '공통' ? '' : p.clinic.replace('노블', '') + ' · ') + (p.dept || '부서 미지정'); (g[k] = g[k] || []).push(p); });
    return Object.keys(g).sort(function (a, b) { return a.localeCompare(b, 'ko'); }).map(function (k) { return [k, g[k].sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); })]; });
  }
  function renderStaff() {
    var q = S.staffQuery.trim();
    var list = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active && (!q || (p.name + p.dept + p.title + p.clinic).indexOf(q) > -1); });
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('직원 <small>' + list.length + '명</small>') + '<div class="search">' + svg('search') + '<input id="sq" placeholder="이름·부서 검색" value="' + esc(q) + '" aria-label="직원 검색"></div><div class="pane-body">' +
      groupPeople(list).map(function (g) {
        return '<div class="group-hd">' + esc(g[0]) + '</div>' + g[1].map(function (p) {
          return '<button class="person" data-dm="' + p.id + '"' + (p.id === S.me.id ? ' disabled' : '') + '><span class="avatar">' + esc(initial(p.name)) + '</span><span class="grow"><b>' + esc(p.name) + (p.id === S.me.id ? ' (나)' : '') + '</b><br><span>' + esc(personLabel(p)) + '</span></span>' + (p.role === 'admin' ? '<span class="pill gold">관리자</span>' : '') + '</button>';
        }).join('');
      }).join('') + '</div>';
    var si = $('#sq'); si.oninput = function () { S.staffQuery = si.value; var pos = si.selectionStart; renderStaff(); var n = $('#sq'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-dm]').forEach(function (b) { b.onclick = function () { sb.rpc('start_dm', { other: b.getAttribute('data-dm') }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); }); }; });
  }

  /* ================= 관리 (관리자) ================= */
  var CLINICS = ['노블365의원', '노블경희한의원', '공통'];
  function adminCall(body) {
    return sb.functions.invoke('admin-users', { body: body }).then(function (r) {
      if (r.error) {
        var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { throw new Error(j.error || r.error.message); }, function () { throw r.error; });
        throw r.error;
      }
      if (r.data && r.data.error) throw new Error(r.data.error);
      return r.data;
    });
  }
  function reloadProfiles() { return sb.from('profiles').select('*').order('name').then(function (p) { S.profiles = {}; (p.data || []).forEach(function (x) { S.profiles[x.id] = x; }); }); }
  function renderAdmin() {
    var all = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; });
    var act = all.filter(function (p) { return p.active; }), off = all.filter(function (p) { return !p.active; });
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('직원 계정 관리', { right: '<button class="btn btn-navy sm" id="addUser">' + svg('plus').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.4"') + ' 계정 만들기</button>' }) +
      '<div class="pane-body"><div class="banner"><span>재직 ' + act.length + '명 · 정지 ' + off.length + '명</span>' + (S.pendingCount ? '<a class="btn btn-gold sm" href="#work" id="goPend">근무신청 대기 ' + S.pendingCount + '건</a>' : '') + '</div>' +
      groupPeople(act).map(function (g) { return '<div class="group-hd">' + esc(g[0]) + '</div>' + g[1].map(personRow).join(''); }).join('') +
      (off.length ? '<div class="group-hd">사용 정지 (퇴사)</div>' + off.map(personRow).join('') : '') + '</div>';
    function personRow(p) {
      return '<button class="person' + (p.active ? '' : ' off') + '" data-edit="' + p.id + '"><span class="avatar">' + esc(initial(p.name)) + '</span><span class="grow"><b>' + esc(p.name) + '</b> <span>' + esc(p.login_id) + '</span><br><span>' + esc(personLabel(p) || '부서 미지정') + '</span></span>' + (p.role === 'admin' ? '<span class="pill gold">관리자</span>' : '') + '</button>';
    }
    $('#addUser').onclick = function () { userSheet(); };
    var gp = $('#goPend'); if (gp) gp.onclick = function () { S.workTab = 'all'; };
    $$('[data-edit]').forEach(function (b) { b.onclick = function () { userSheet(S.profiles[b.getAttribute('data-edit')]); }; });
  }
  function userSheet(p) {
    var isNew = !p; p = p || { clinic: '노블365의원', dept: '', title: '', role: 'staff', name: '', login_id: '' };
    var m = sheet(isNew ? '직원 계정 만들기' : esc(p.name) + ' 계정',
      (isNew ? '<div class="row2"><div class="field"><label for="ui">아이디</label><input class="input" id="ui" autocapitalize="off" spellcheck="false" placeholder="영문·숫자 (예: hong01)"></div>' +
        '<div class="field"><label for="upw">초기 비밀번호</label><input class="input" id="upw" autocomplete="new-password" placeholder="8자 이상"></div></div>'
        : '<p class="muted small" style="margin-bottom:12px">아이디: <b>' + esc(p.login_id) + '</b></p>') +
      '<div class="row2"><div class="field"><label for="un">이름</label><input class="input" id="un" value="' + esc(p.name) + '"></div>' +
      '<div class="field"><label for="uc">소속</label><select class="input" id="uc">' + CLINICS.map(function (c) { return '<option' + (c === p.clinic ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row2"><div class="field"><label for="ud">부서</label><input class="input" id="ud" value="' + esc(p.dept) + '" placeholder="예: 원무, 간호, 물리치료" list="depts"></div>' +
      '<div class="field"><label for="ut">직책</label><input class="input" id="ut" value="' + esc(p.title) + '" placeholder="예: 실장, 팀장"></div></div>' +
      '<datalist id="depts">' + Array.from(new Set(Object.keys(S.profiles).map(function (k) { return S.profiles[k].dept; }).filter(Boolean))).map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>' +
      '<div class="field"><label for="ur">권한</label><select class="input" id="ur"><option value="staff"' + (p.role === 'staff' ? ' selected' : '') + '>일반 직원</option><option value="admin"' + (p.role === 'admin' ? ' selected' : '') + '>관리자 (계정 관리·공지·근무 승인)</option></select></div>' +
      '<p class="err" id="ue"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>닫기</button><button class="btn btn-navy" id="uOk">' + (isNew ? '계정 만들기' : '저장') + '</button></div>' +
      (isNew ? '' : '<hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><div style="display:grid;gap:8px">' +
        '<div class="row2"><input class="input" id="npw" placeholder="새 비밀번호 (8자 이상)" autocomplete="new-password" aria-label="새 비밀번호"><button class="btn btn-line" id="rpw">비밀번호 초기화</button></div>' +
        (p.id !== S.me.id ? '<button class="btn ' + (p.active ? 'btn-danger' : 'btn-line') + '" id="tog">' + (p.active ? '사용 정지 (퇴사 처리)' : '다시 사용하기') + '</button>' : '') + '</div>'));
    $('#uOk', m).onclick = function () {
      var body = { name: $('#un', m).value.trim(), clinic: $('#uc', m).value, dept: $('#ud', m).value.trim(), title: $('#ut', m).value.trim(), role: $('#ur', m).value };
      if (!body.name) { $('#ue', m).textContent = '이름을 입력해 주세요.'; return; }
      if (isNew) { body.action = 'create'; body.login_id = $('#ui', m).value.trim().toLowerCase(); body.password = $('#upw', m).value; }
      else { body.action = 'update'; body.id = p.id; }
      var btn = this; btn.disabled = true; $('#ue', m).textContent = '';
      adminCall(body).then(function () {
        closeSheet(m);
        if (isNew) toast('<b>' + esc(body.name) + '</b> 계정을 만들었습니다 · 아이디 ' + esc(body.login_id));
        return reloadProfiles().then(renderAdmin);
      }).catch(function (e) { $('#ue', m).textContent = errMsg(e); btn.disabled = false; });
    };
    if (!isNew) {
      $('#rpw', m).onclick = function () {
        var pw = $('#npw', m).value; if (pw.length < 8) { $('#ue', m).textContent = '새 비밀번호는 8자 이상이어야 합니다.'; return; }
        adminCall({ action: 'reset_password', id: p.id, password: pw }).then(function () { $('#npw', m).value = ''; toast('비밀번호를 바꿨습니다. 직원에게 새 비밀번호를 알려주세요.'); })
          .catch(function (e) { $('#ue', m).textContent = errMsg(e); });
      };
      var tg = $('#tog', m);
      if (tg) tg.onclick = function () {
        if (p.active && !confirmInline(tg, '한 번 더 누르면 로그인이 막힙니다')) return;
        adminCall({ action: 'set_active', id: p.id, active: !p.active }).then(function () { closeSheet(m); return reloadProfiles().then(renderAdmin); })
          .catch(function (e) { $('#ue', m).textContent = errMsg(e); });
      };
    }
  }

  /* ================= 설정 ================= */
  function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function standalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
  function pushSupported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function renderSettings() {
    var me = S.me, main = $('#main'); main.style.justifyContent = '';
    var perm = 'Notification' in window ? Notification.permission : 'unsupported';
    main.innerHTML = header('설정') + '<div class="pane-body">' +
      '<section class="card" style="margin-top:16px"><div style="display:flex;gap:12px;align-items:center"><span class="avatar">' + esc(initial(me.name)) + '</span><div><b style="font-size:17px">' + esc(me.name) + '</b><br><span class="muted small">' + esc(personLabel(me) || '') + ' · 아이디 ' + esc(me.login_id) + '</span></div></div></section>' +
      '<section class="card"><h3>휴대폰 알림</h3><div id="pushBox"></div></section>' +
      '<section class="card"><h3>앱으로 설치하기</h3>' + (standalone() ? '<p class="muted">앱으로 설치되어 있습니다. ✓</p>' :
        isIOS() ? '<p>아이폰: Safari 아래쪽 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b> → 추가. 설치한 앱을 열어야 알림을 받을 수 있습니다.</p>' :
          '<p>안드로이드(크롬): 오른쪽 위 <b>⋮</b> → <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>. PC(크롬·엣지): 주소창 오른쪽 <b>설치</b> 아이콘.</p>') + '</section>' +
      '<section class="card"><h3>비밀번호 변경</h3><form id="pwf" novalidate><div class="field"><label for="p1">새 비밀번호</label><input class="input" type="password" id="p1" autocomplete="new-password" placeholder="8자 이상"></div>' +
      '<div class="field"><label for="p2">새 비밀번호 확인</label><input class="input" type="password" id="p2" autocomplete="new-password"></div><p class="err" id="pe"></p><button class="btn btn-navy">변경하기</button></form></section>' +
      '<section class="card"><button class="btn btn-line block" id="logout">로그아웃</button></section>' +
      '<p class="muted small" style="text-align:center;padding:4px 16px 24px">노블 메신저 · 노블365의원 · 노블경희한의원</p></div>';
    renderPushBox();
    $('#pwf').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = $('#p1').value, b = $('#p2').value;
      if (a.length < 8) { $('#pe').textContent = '8자 이상 입력해 주세요.'; return; }
      if (a !== b) { $('#pe').textContent = '두 비밀번호가 다릅니다.'; return; }
      sb.auth.updateUser({ password: a }).then(function (r) { if (r.error) throw r.error; $('#p1').value = $('#p2').value = ''; $('#pe').textContent = ''; toast('비밀번호를 바꿨습니다'); })
        .catch(function (er) { $('#pe').textContent = errMsg(er); });
    });
    $('#logout').onclick = function () {
      unsubscribePush().then(function () { return sb.auth.signOut(); }).then(function () { S.me = null; if (S.channel) sb.removeChannel(S.channel); location.hash = ''; renderLogin(); });
    };
  }
  function renderPushBox() {
    var box = $('#pushBox'); if (!box) return;
    if (!pushSupported()) { box.innerHTML = '<p class="muted">' + (isIOS() && !standalone() ? '아이폰은 먼저 아래 방법으로 <b>앱으로 설치</b>한 뒤, 설치한 앱에서 알림을 켤 수 있습니다.' : '이 브라우저는 알림을 지원하지 않습니다. 크롬이나 사파리 최신 버전을 사용해 주세요.') + '</p>'; return; }
    if (Notification.permission === 'denied') { box.innerHTML = '<p class="muted">알림이 차단되어 있습니다. 휴대폰 설정 → 앱(또는 브라우저) → 알림에서 허용해 주세요.</p>'; return; }
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      box.innerHTML = sub ? '<p style="margin-bottom:10px">✓ 이 기기에서 알림을 받고 있습니다.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line sm" id="ptest">알림 확인용 메시지</button><button class="btn btn-line sm" id="poff">이 기기 알림 끄기</button></div>'
        : '<p style="margin-bottom:10px" class="muted">새 메시지·공지·근무 승인 알림을 이 기기로 받습니다.</p><button class="btn btn-gold" id="pon">알림 켜기</button>';
      var on = $('#pon'), off = $('#poff'), test = $('#ptest');
      if (on) on.onclick = function () { on.disabled = true; subscribePush().then(function () { toast('알림을 켰습니다'); renderPushBox(); }).catch(function (e) { toast(esc(errMsg(e))); renderPushBox(); }); };
      if (off) off.onclick = function () { unsubscribePush().then(renderPushBox); };
      if (test) test.onclick = function () { navigator.serviceWorker.ready.then(function (reg) { reg.showNotification('노블 메신저', { body: '알림이 정상적으로 표시됩니다.', icon: 'icons/icon-192.png' }); }); };
    });
  }
  function b64ToU8(b) { var p = '='.repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, function (c) { return c.charCodeAt(0); }); }
  function subscribePush() {
    return Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') throw new Error('알림 권한이 허용되지 않았습니다.');
      return sb.functions.invoke('push', { body: { action: 'public_key' } });
    }).then(function (r) {
      if (r.error || !r.data || !r.data.publicKey) throw new Error('알림 서버에 연결하지 못했습니다. (push 함수 설치를 확인해 주세요)');
      return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(r.data.publicKey) }); });
    }).then(function (sub) {
      var j = sub.toJSON();
      return sb.from('push_subscriptions').delete().eq('endpoint', j.endpoint).then(function () {
        return sb.from('push_subscriptions').insert({ user_id: S.me.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth });
      }).then(function (r) { if (r.error) throw r.error; });
    });
  }
  function unsubscribePush() {
    if (!pushSupported()) return Promise.resolve();
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return;
      var ep = sub.endpoint;
      return sub.unsubscribe().then(function () { return sb.from('push_subscriptions').delete().eq('endpoint', ep); });
    }).catch(function () {});
  }

  /* ================= 실시간 ================= */
  function subscribeRealtime() {
    if (S.channel) sb.removeChannel(S.channel);
    S.channel = sb.channel('noble-' + S.me.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (p) {
        var m = p.new;
        if (S.room && m.room_id === S.room.id) { addMessage(m); if (m.sender_id !== S.me.id) markRead(); }
        else if (m.sender_id !== S.me.id) {
          var r = S.rooms.find(function (x) { return x.id === m.room_id; });
          if (!r || !r.muted) {
            var who = (S.profiles[m.sender_id] || {}).name || '';
            toast('<b>' + esc(r && r.type === 'group' ? r.name + ' · ' + who : who) + '</b> ' + esc(m.body ? m.body.slice(0, 50) : '사진·파일을 보냈습니다'), function () { location.hash = '#room/' + m.room_id; });
          }
        }
        refreshRooms();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, function (p) {
        if (!S.room || p.new.room_id !== S.room.id) return;
        var i = S.messages.findIndex(function (x) { return x.id === p.new.id; }); if (i > -1) { S.messages[i] = p.new; renderMessages(false); }
        refreshRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, function (p) {
        var row = p.new && p.new.room_id ? p.new : p.old;
        if (S.room && row && row.room_id === S.room.id && p.eventType === 'UPDATE') { S.members[row.user_id] = p.new; renderMessages(false); }
        else if (row && row.user_id === S.me.id && p.eventType !== 'UPDATE') refreshRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, function (p) {
        loadNotices().then(function () {
          if (p.eventType === 'INSERT' && p.new.author_id !== S.me.id) toast('<b>📢 새 공지</b> ' + esc(p.new.title), function () { location.hash = '#notice/' + p.new.id; });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_requests' }, function (p) {
        loadPending();
        if (p.eventType === 'UPDATE' && p.new.user_id === S.me.id && p.old && p.new.status !== '대기') toast('<b>근무 신청 ' + esc(p.new.status) + '</b> ' + esc(p.new.kind + ' ' + p.new.work_date), function () { S.workTab = 'mine'; location.hash = '#work'; });
        if (S.route.tab === 'work' && S.workTab !== 'new') workList(S.workTab === 'all');
      })
      .subscribe();
  }

  /* ================= 시트(모달) ================= */
  function sheet(title, body) {
    var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', title.replace(/<[^>]+>/g, ''));
    m.innerHTML = '<div class="sheet"><div class="sheet-hd"><h2>' + title + '</h2><button class="icon-btn" data-close aria-label="닫기">' + svg('x') + '</button></div>' + body + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) closeSheet(m); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(m); });
    var f = m.querySelector('input:not([type=checkbox]):not([type=file]),textarea'); setTimeout(function () { if (f) f.focus(); }, 60);
    return m;
  }
  function closeSheet(m) { if (m && m.parentNode) m.remove(); }
  /* 확인창 대신 버튼을 두 번 누르게 함 */
  function confirmInline(btn, msg) {
    if (btn.getAttribute('data-armed')) return true;
    var orig = btn.textContent; btn.setAttribute('data-armed', '1'); btn.textContent = msg;
    setTimeout(function () { btn.removeAttribute('data-armed'); btn.textContent = orig; }, 3500);
    return false;
  }

  /* 알림을 눌러 들어온 경우 */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
    navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'open' && e.data.url) location.hash = e.data.url; });
  }
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT' && S.me) { S.me = null; renderLogin(); } });
  boot();
})();
