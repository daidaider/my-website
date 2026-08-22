const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const innerPages = [
  'red-date-orchards.html',
  'other-attractions.html',
  'teaching-aids.html',
];

test('封面提供前往教具頁的入口卡片', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(
    html,
    /<a class="feature-card teaching-aids-card" href="teaching-aids\.html">[\s\S]*?<h2>教具<\/h2>[\s\S]*?<\/a>/,
  );
});

test('每個內頁都能從主選單前往教具頁', () => {
  for (const page of innerPages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(
      html,
      /<nav aria-label="主選單">[\s\S]*?<a(?: class="active")? href="teaching-aids\.html">教具<\/a>[\s\S]*?<\/nav>/,
      `${page} 的主選單缺少教具連結`,
    );
  }
});

test('教具頁標示目前所在頁面與準備中狀態', () => {
  const html = fs.readFileSync('teaching-aids.html', 'utf8');
  assert.match(html, /<a class="active" href="teaching-aids\.html">教具<\/a>/);
  assert.match(html, /<h1>教具<\/h1>/);
  assert.match(html, /內容準備中/);
});
