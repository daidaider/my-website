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
  assert.equal(slides.length, 6);
  assert.equal(dots.length, 6);
});
