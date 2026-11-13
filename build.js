/* 노블365 홈페이지 빌드 – content/*.json → dist/ (완성된 HTML)
   GitHub에 저장(관리자 페이지 저장 포함)할 때마다 자동으로 실행됩니다. 직접 실행: node build.js */
'use strict';
var fs = require('fs'), path = require('path');
var R = require('./src/render.js');
var ROOT = __dirname, OUT = path.join(ROOT, 'dist');

function readJSON(n) { return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', n + '.json'), 'utf8')); }
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(function (e) {
    var s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  });
}

var D = {};
['site', 'clinics', 'doctors', 'gallery', 'home', 'nonpay', 'reviews', 'notices'].forEach(function (n) { D[n] = readJSON(n); });

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
['css', 'js', 'fonts', 'images', 'admin', 'content', 'src'].forEach(function (d) { copyDir(path.join(ROOT, d), path.join(OUT, d)); });

var pages = R.all(D);
Object.keys(pages).forEach(function (f) { fs.writeFileSync(path.join(OUT, f), pages[f]); });

/* 예전 주소(clinic.html?c=..&i=..) → 새 주소로 이동 */
fs.writeFileSync(path.join(OUT, 'clinic.html'), '<!doctype html><meta charset="utf-8"><title>이동 중</title><script>var q=new URLSearchParams(location.search),c=q.get("c")||"spine",i=q.get("i");location.replace("clinic-"+c+(i?"-"+i:"")+".html");</script>');

var domain = (D.site.domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
var base = domain ? 'https://' + domain + '/' : '';
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /admin/\n' + (base ? 'Sitemap: ' + base + 'sitemap.xml\n' : ''));
if (base) {
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Object.keys(pages).filter(function (f) { return f !== 'privacy.html'; }).map(function (f) { return '  <url><loc>' + base + (f === 'index.html' ? '' : f) + '</loc></url>'; }).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(OUT, 'CNAME'), domain + '\n');
}
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('빌드 완료: ' + Object.keys(pages).length + '개 페이지 → dist/');
