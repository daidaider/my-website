const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('時程規劃包含 8/18 食農教育與對應輪播按鈕', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const slides = html.match(/data-schedule-slide/g) || [];
  const dots = html.match(/role="tab"/g) || [];

  assert.match(html, /datetime="2026-08-18"/);
  assert.match(html, />食農教育</);
  assert.match(html, /assets\/schedule\/food-education-0818\.jpg/);
  assert.equal(slides.length, 7);
  assert.equal(dots.length, 7);
});

test('時程規劃將第二張改為迷因競賽並新增 8/28 白龍記者會', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const slides = html.match(/data-schedule-slide/g) || [];
  const dots = html.match(/role="tab"/g) || [];

  assert.match(html, /<time datetime="2026-07-24" data-end-date="2026-08-10">7\/24－8\/10<\/time><h3>迷因競賽<\/h3>/);
  assert.match(html, /assets\/schedule\/bailong-press-0828\.jpg/);
  assert.match(html, /<time datetime="2026-08-28">8\/28<\/time><h3>白龍記者會<\/h3>/);
  assert.match(html, /aria-label="顯示迷因競賽"/);
  assert.match(html, /aria-label="顯示白龍記者會"/);
  assert.equal(slides.length, 7);
  assert.equal(dots.length, 7);
});
