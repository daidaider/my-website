const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const innerPages = [
  'red-date-orchards.html',
  'other-attractions.html',
  'teaching-aids.html',
];

test('封面提供前往食農教育頁的入口卡片', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(
    html,
    /<a class="feature-card teaching-aids-card" href="teaching-aids\.html">[\s\S]*?<h2>食農教育<\/h2>[\s\S]*?<span>食農教育內容　→<\/span>[\s\S]*?<\/a>/,
  );
  assert.doesNotMatch(html, /食農教育內容準備中/);
});

test('封面三張分類卡片放大並置中排列', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const css = fs.readFileSync('home-cards.css', 'utf8');
  assert.match(html, /<link rel="stylesheet" href="home-cards\.css\?v=20260823-food-education-card" \/>/);
  assert.match(
    css,
    /\.home-cards\s*\{[^}]*max-width:\s*1240px[^}]*margin:\s*-55px auto 70px[^}]*grid-template-columns:\s*repeat\(3, 1fr\)[^}]*\}/,
  );
  assert.match(css, /\.feature-card\s*\{[^}]*min-height:\s*280px[^}]*padding:\s*34px[^}]*\}/);
});

test('每個內頁都能從主選單前往食農教育頁', () => {
  for (const page of innerPages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(
      html,
      /<nav aria-label="主選單">[\s\S]*?<a(?: class="active")? href="teaching-aids\.html">食農教育<\/a>[\s\S]*?<\/nav>/,
      `${page} 的主選單缺少食農教育連結`,
    );
  }
});

test('紅棗成長教具圖片作為封面食農教育卡片底圖', () => {
  const html = fs.readFileSync('teaching-aids.html', 'utf8');
  const css = fs.readFileSync('home-cards.css', 'utf8');
  assert.match(html, /<a class="active" href="teaching-aids\.html">食農教育<\/a>/);
  assert.match(html, /<h1>食農教育<\/h1>/);
  assert.match(
    css,
    /\.teaching-aids-card\s*\{[^}]*background-image:\s*url\("assets\/teaching-aids\/jujube-growth-board\.png"\)[^}]*\}/,
  );
  assert.doesNotMatch(html, /jujube-growth-board\.png|teaching-aid-content/);
  assert.doesNotMatch(html, /準備中|敬請期待/);
  assert.ok(fs.existsSync('assets/teaching-aids/jujube-growth-board.png'));
});
