const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

test('Leaflet 樣式的完整性雜湊必須符合實際下載內容', async () => {
  const html = fs.readFileSync('red-date-orchards.html', 'utf8');
  const tag = html.match(/<link[^>]+leaflet\.css[^>]+>/)?.[0] || '';
  const url = tag.match(/href="([^"]+)"/)?.[1];
  const declared = tag.match(/integrity="sha256-([^"]+)"/)?.[1];
  assert.ok(url && declared, 'Leaflet 樣式需包含網址與完整性雜湊');

  const response = await fetch(url);
  assert.equal(response.ok, true);
  const actual = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('base64');
  assert.equal(declared, actual);
});
