/* 노블365 일러스트 세트 – 64x64 듀오톤 라인 일러스트
   클래스: s = 네이비 선, a = 골드 강조, b = 하늘색 면, w = 흰 면+선 */
(function (root) {
  var I = {
    /* ---------- 척추·관절 (부위) ---------- */
    neck: '<circle class="b" cx="32" cy="32" r="28"/><circle class="w" cx="32" cy="13" r="7"/><path class="s" d="M22 50c2-7 6-10 10-10s8 3 10 10"/><rect class="w" x="28" y="22" width="8" height="4" rx="2"/><rect class="w" x="28" y="28" width="8" height="4" rx="2"/><rect class="a" x="28" y="34" width="8" height="4" rx="2"/><circle class="ring" cx="32" cy="36" r="9"/>',
    shoulder: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M14 22h22"/><path class="s" d="M44 26l-6 24"/><path class="s" d="M14 22c-2 6-1 14 2 20"/><circle class="a" cx="41" cy="24" r="6"/><circle class="ring" cx="41" cy="24" r="10"/><path class="s" d="M36 22c3-3 7-3 10 0"/>',
    elbow: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M14 20l18 18"/><path class="s" d="M32 38l16-6"/><circle class="a" cx="32" cy="38" r="5"/><circle class="ring" cx="32" cy="38" r="9"/><path class="s" d="M48 32l4-3m-4 3l4 2"/>',
    wrist: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M32 54V36"/><path class="s" d="M24 30v-12m5 10V14m5 14V15m5 15v-9"/><path class="s" d="M24 30c0 6 4 8 8 8s7-2 7-9"/><path class="s" d="M24 26l-4-4"/><rect class="a" x="27" y="40" width="10" height="4" rx="2"/><circle class="ring" cx="32" cy="42" r="9"/>',
    back: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="27" y="10" width="10" height="6" rx="2.5"/><rect class="w" x="27" y="18" width="10" height="6" rx="2.5"/><rect class="w" x="27" y="26" width="10" height="6" rx="2.5"/><rect class="a" x="27" y="34" width="10" height="6" rx="2.5"/><path class="s" d="M18 46c4 6 10 8 14 8s10-2 14-8"/><path class="s" d="M32 42v6"/><circle class="ring" cx="32" cy="37" r="10"/>',
    hip: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M14 22c4 10 10 14 18 14s14-4 18-14"/><path class="s" d="M22 36l-2 18m24-18l2 18"/><circle class="a" cx="22" cy="35" r="4.5"/><circle class="w" cx="42" cy="35" r="4.5"/><circle class="ring" cx="22" cy="35" r="9"/>',
    knee: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M26 8v18c0 3 2 5 6 5s6-2 6-5V8"/><path class="s" d="M26 56V40c0-3 2-5 6-5s6 2 6 5v16"/><ellipse class="a" cx="32" cy="33" rx="5" ry="3.6"/><circle class="ring" cx="32" cy="33" r="10"/>',
    ankle: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M28 8v28"/><path class="s" d="M36 8v24"/><path class="s" d="M28 36c0 6 2 10 8 12h12c3 0 4 4 0 4H24c-4 0-4-6-2-10"/><circle class="a" cx="35" cy="38" r="4"/><circle class="ring" cx="35" cy="38" r="9"/>',

    /* ---------- 검사 ---------- */
    blood: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M24 12h16"/><path class="w" d="M27 12v34a5 5 0 0 0 10 0V12"/><path class="a" d="M27.5 30h9v16a4.5 4.5 0 0 1-9 0z"/><path class="a" d="M46 22c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z"/>',
    xray: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="14" y="14" width="36" height="36" rx="5"/><path class="a" d="M24 25a3 3 0 1 1 4-3l8 8a3 3 0 1 1 3 4 3 3 0 1 1-4 3l-8-8a3 3 0 1 1-3-4z"/><path class="s" d="M18 44h8"/>',
    ultrasound: '<circle class="b" cx="32" cy="32" r="28"/><path class="w" d="M18 14h10l2 14h-14z"/><path class="s" d="M23 28v10c0 4 3 6 6 6"/><path class="a" d="M34 36a8 8 0 0 1 8 8M34 30a14 14 0 0 1 14 14" style="fill:none;stroke:var(--ill-gold);stroke-width:2.6;stroke-linecap:round"/>',
    pulse: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M10 40h44"/><path class="s" d="M22 24v10m6-12v12m6-10v10"/><path class="a" d="M10 48h10l4-6 5 10 5-14 4 10h16" style="fill:none;stroke:var(--ill-gold);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"/>',

    /* ---------- 비수술 치료 ---------- */
    prolo: '<circle class="b" cx="32" cy="32" r="28"/><g transform="rotate(-45 32 32)"><rect class="w" x="26" y="14" width="12" height="26" rx="2"/><rect class="a" x="27.5" y="26" width="9" height="12.5" rx="1"/><path class="s" d="M32 40v12M24 14h16M32 8v6"/></g><path class="a" d="M47 14l1.6 3.4L52 19l-3.4 1.6L47 24l-1.6-3.4L42 19l3.4-1.6z"/>',
    nerveblock: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="16" y="14" width="12" height="7" rx="3"/><rect class="w" x="16" y="24" width="12" height="7" rx="3"/><rect class="a" x="16" y="34" width="12" height="7" rx="3"/><rect class="w" x="16" y="44" width="12" height="7" rx="3"/><path class="s" d="M52 14L32 36"/><path class="s" d="M48 12l6 6"/><circle class="ring" cx="24" cy="37" r="8"/>',
    carm: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M42 14a20 20 0 1 0 0 36" style="stroke-width:5"/><rect class="w" x="38" y="10" width="10" height="8" rx="2"/><rect class="w" x="38" y="46" width="10" height="8" rx="2"/><path class="a" d="M43 20v24" style="fill:none;stroke:var(--ill-gold);stroke-width:2.4;stroke-dasharray:3 3"/>',
    prp: '<circle class="b" cx="32" cy="32" r="28"/><path class="w" d="M24 10h16v38a8 8 0 0 1-16 0z"/><path class="a" d="M24.8 18h14.4v12H24.8z"/><path class="s" d="M24.8 30h14.4"/><path d="M24.8 31h14.4v17a7.2 7.2 0 0 1-14.4 0z" fill="#e8b4b4"/><path class="s" d="M24 10h16v38a8 8 0 0 1-16 0z"/><path class="s" d="M21 10h22"/>',
    kneeinj: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M20 8v16c0 3 2 5 6 5s6-2 6-5V8"/><path class="s" d="M20 56V40c0-3 2-5 6-5s6 2 6 5v16"/><ellipse class="a" cx="26" cy="32" rx="4" ry="3"/><g transform="rotate(35 46 30)"><rect class="w" x="42" y="18" width="8" height="18" rx="1.5"/><path class="s" d="M46 36v8M41 18h10"/></g>',
    painprogram: '<circle class="b" cx="32" cy="32" r="28"/><path class="a" d="M24 10l-8 22h9l-4 18 16-24h-9l6-16z"/><path class="s" d="M46 30v24M36 42h20M39 35l14 14M53 35L39 49"/>',
    eswt: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="10" y="26" width="22" height="12" rx="6"/><path class="s" d="M32 32h4"/><path class="a" d="M42 24a12 12 0 0 1 0 16M48 19a19 19 0 0 1 0 26" style="fill:none;stroke:var(--ill-gold);stroke-width:2.6;stroke-linecap:round"/>',
    manual: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M12 46h40"/><rect class="w" x="14" y="40" width="36" height="6" rx="3"/><path class="s" d="M18 34c4-6 10-8 14-6l6 4"/><path class="s" d="M46 34c-4-6-10-8-14-6"/><path class="a" d="M26 20c0-4 3-6 6-6s6 2 6 6" style="fill:none;stroke:var(--ill-gold);stroke-width:2.6;stroke-linecap:round"/>',
    acupuncture: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M12 48c8-4 32-4 40 0"/><path class="s" d="M22 44V20M32 43V14M42 44V20"/><circle class="a" cx="22" cy="18" r="3"/><circle class="a" cx="32" cy="12" r="3"/><circle class="a" cx="42" cy="18" r="3"/>',
    pharmaco: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="14" y="22" width="14" height="24" rx="3"/><rect class="a" x="15.5" y="32" width="11" height="12.5" rx="1.5"/><path class="s" d="M14 22h14M18 16h6v6"/><path class="s" d="M48 14L36 34"/><path class="a" d="M38 42c2 3 3 5 3 6a3 3 0 0 1-6 0c0-1 1-3 3-6z"/>',
    chuna: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="26" y="12" width="12" height="7" rx="3"/><rect class="w" x="27" y="22" width="12" height="7" rx="3"/><rect class="a" x="25" y="32" width="12" height="7" rx="3"/><rect class="w" x="26" y="42" width="12" height="7" rx="3"/><path class="s" d="M12 36h8m-3-3l3 3-3 3M52 36h-8m3-3l-3 3 3 3"/>',
    moxa: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M14 50h36"/><path class="w" d="M24 50l8-18 8 18z"/><path class="a" d="M29 39h6l2.5 6h-11z"/><path class="s" d="M30 26c-3-4 3-6 0-10M36 24c-3-4 3-6 0-10" style="stroke-width:1.8"/>',
    cupping: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M10 46h44"/><path class="w" d="M14 46v-8a8 8 0 0 1 16 0v8"/><path class="w" d="M34 46v-12a8 8 0 0 1 16 0v12"/><path class="a" d="M17 46v-6a5 5 0 0 1 10 0v6z"/><path class="s" d="M38 22h8"/>',

    /* ---------- 입원·교통사고 ---------- */
    'inpatient-plan': '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M10 46V20M10 38h44v8M54 38v-6a6 6 0 0 0-6-6H28v12"/><circle class="a" cx="19" cy="31" r="5"/><path class="s" d="M44 14h6m-3-3v6"/>',
    inpatient: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="12" y="14" width="40" height="36" rx="5"/><path class="s" d="M12 24h40"/><rect class="a" x="28" y="30" width="8" height="16" rx="1.5"/><rect class="a" x="24" y="34" width="16" height="8" rx="1.5"/><circle class="s" cx="18" cy="19" r=".5"/>',
    'accident-guide': '<circle class="b" cx="32" cy="32" r="28"/><path class="w" d="M12 40v-6l5-10a4 4 0 0 1 4-2h22a4 4 0 0 1 4 2l5 10v6z"/><path class="s" d="M12 34h40"/><circle class="a" cx="20" cy="42" r="5"/><circle class="a" cx="44" cy="42" r="5"/><path class="s" d="M24 28h16"/>',

    /* ---------- 특수 클리닉 ---------- */
    growth: '<circle class="b" cx="32" cy="32" r="28"/><path class="s" d="M44 10v44M44 16h5M44 24h3M44 32h5M44 40h3M44 48h5"/><circle class="a" cx="26" cy="20" r="5"/><path class="s" d="M26 26v16m-6-10l6-4 6 4M21 52l5-10 5 10"/><path class="a" d="M14 22l4-6 4 6z"/>',
    diet: '<circle class="b" cx="32" cy="32" r="28"/><rect class="w" x="14" y="18" width="36" height="32" rx="8"/><path class="s" d="M22 30a10 10 0 0 1 20 0"/><path class="a" d="M32 30l5-6" style="fill:none;stroke:var(--ill-gold);stroke-width:2.8;stroke-linecap:round"/><circle class="a" cx="32" cy="30" r="2.5"/>',
    immunity: '<circle class="b" cx="32" cy="32" r="28"/><path class="w" d="M22 10h20v22a10 10 0 0 1-20 0z"/><path class="a" d="M23 22h18v10a9 9 0 0 1-18 0z"/><path class="s" d="M32 42v6c0 4 4 6 8 6"/><path class="s" d="M28 14h8"/>',
    postpartum: '<circle class="b" cx="32" cy="32" r="28"/><circle class="w" cx="26" cy="20" r="6"/><path class="s" d="M14 52c0-10 5-18 12-18s12 8 12 18"/><circle class="a" cx="38" cy="38" r="5"/><path class="a" d="M46 16c-2-3-7-2-7 2 0 3 7 7 7 7s7-4 7-7c0-4-5-5-7-2z"/>',

    /* ---------- 대분류 ---------- */
    'cat-spine': null, 'cat-exam': null, 'cat-nonsurgical': null, 'cat-accident': null, 'cat-special': null
  };
  I['cat-spine'] = I.back; I['cat-exam'] = I.ultrasound; I['cat-nonsurgical'] = I.prolo;
  I['cat-accident'] = I['accident-guide']; I['cat-special'] = I.growth; I['cat-iv'] = I.immunity;
  I.nutrition = I.immunity; I.prf = I.prp;
  I.immunity = I.immunity; I.diet = I.diet;

  function icon(id, cls) {
    var body = I[id] || I.prolo;
    return '<svg class="ill ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* 메인 화면 인체 일러스트 + 부위 바로가기 */
  var SPOTS = [
    ['neck', '목', 150, 100, 'r'], ['shoulder', '어깨', 100, 124, 'l'], ['elbow', '팔꿈치', 81, 206, 'l'],
    ['wrist', '손목', 68, 282, 'l'], ['back', '허리', 150, 246, 'r'], ['hip', '고관절', 176, 300, 'r'],
    ['knee', '무릎', 122, 408, 'l'], ['ankle', '발목', 180, 494, 'r']
  ];
  function bodyMap(hrefFor) {
    var s = '<svg class="bodymap" viewBox="0 0 300 540" role="img" aria-label="부위별 진료 바로가기">' +
      '<defs><linearGradient id="bmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity=".7"/></linearGradient></defs>' +
      '<g class="fig">' +
      '<ellipse cx="150" cy="50" rx="29" ry="33"/>' +
      '<rect x="137" y="78" width="26" height="26" rx="9"/>' +
      '<path d="M104 108h92c10 0 16 6 16 16l-6 176c-36 10-76 10-112 0L88 124c0-10 6-16 16-16z"/>' +
      '<path class="limb" d="M98 122L81 206 68 284"/><path class="limb" d="M202 122l17 84 13 78"/>' +
      '<path class="leg" d="M126 296l-4 112-2 90"/><path class="leg" d="M174 296l4 112 2 90"/>' +
      '<ellipse cx="66" cy="300" rx="11" ry="14"/><ellipse cx="234" cy="300" rx="11" ry="14"/>' +
      '<ellipse cx="112" cy="510" rx="20" ry="9"/><ellipse cx="190" cy="510" rx="20" ry="9"/>' +
      '</g>' +
      '<path class="spine" d="M150 108v186"/>';
    SPOTS.forEach(function (p) {
      var tx = p[4] === 'l' ? p[2] - 16 : p[2] + 16, anchor = p[4] === 'l' ? 'end' : 'start';
      var w = p[1].length * 15 + 18, rx = p[4] === 'l' ? tx - w + 6 : tx - 6;
      s += '<a class="spot" href="' + hrefFor(p[0]) + '" aria-label="' + p[1] + ' 진료 안내">' +
        '<circle class="pulse" cx="' + p[2] + '" cy="' + p[3] + '" r="9"/><circle class="dot" cx="' + p[2] + '" cy="' + p[3] + '" r="7"/>' +
        '<rect class="tag" x="' + rx + '" y="' + (p[3] - 13) + '" width="' + w + '" height="26" rx="13"/>' +
        '<text x="' + tx + '" y="' + (p[3] + 5) + '" text-anchor="' + anchor + '">' + p[1] + '</text></a>';
    });
    return s + '</svg>';
  }

  var api = { icon: icon, bodyMap: bodyMap, has: function (id) { return !!I[id]; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NobleIcons = api;
})(this);
