import test from 'node:test';
import assert from 'node:assert/strict';

import { CARD_DATA } from '../assets/js/card-data.mjs';
import {
  filterCardsByCategory,
  findCardById,
  getCardIdFromSearch,
  rarityStars,
  cardSpriteStyle,
} from '../assets/js/card-utils.mjs';
import { buildCardViewModel } from '../assets/js/card-page.mjs';
import { getShopState, renderShopActions } from '../assets/js/product-page.mjs';

test('拒絕重複或格式錯誤的卡片編號', () => {
  const ids = CARD_DATA.map((card) => card.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^\d{3}$/.test(id)));
});

test('拒絕超出一至五星的稀有度', () => {
  assert.ok(CARD_DATA.every((card) => card.rarity >= 1 && card.rarity <= 5));
});

test('能以三位數編號查到卡片，未知編號回傳 null', () => {
  assert.equal(findCardById(CARD_DATA, '001')?.nameZh, '綠繡眼');
  assert.equal(findCardById(CARD_DATA, '999'), null);
});

test('分類篩選只回傳指定類別', () => {
  const birds = filterCardsByCategory(CARD_DATA, '鳥類');
  assert.ok(birds.length > 0);
  assert.ok(birds.every((card) => card.category === '鳥類'));
  assert.equal(filterCardsByCategory(CARD_DATA, '全部').length, CARD_DATA.length);
});

test('稀有度固定輸出五格星號', () => {
  assert.equal(rarityStars(1), '★☆☆☆☆');
  assert.equal(rarityStars(5), '★★★★★');
});

test('只接受網址中的三位數卡片編號', () => {
  assert.equal(getCardIdFromSearch('?id=001'), '001');
  assert.equal(getCardIdFromSearch(''), null);
  assert.equal(getCardIdFromSearch('?id=abc'), null);
});

test('掃描網址建立正確的卡片畫面模型', () => {
  const result = buildCardViewModel('?id=001');
  assert.equal(result.status, 'ok');
  assert.equal(result.card.nameZh, '綠繡眼');
});

test('缺少或不存在的卡片編號建立錯誤狀態', () => {
  assert.deepEqual(buildCardViewModel(''), { status: 'error', message: '網址缺少卡片編號' });
  assert.deepEqual(buildCardViewModel('?id=999'), { status: 'error', message: '找不到這張卡片' });
});

test('沒有賣貨便網址時維持停用狀態', () => {
  assert.deepEqual(getShopState(''), { enabled: false, label: '賣貨便即將開放', href: null });
});

test('只有 HTTPS 賣貨便網址能啟用購買連結', () => {
  assert.equal(getShopState('https://myship.7-11.com.tw/example').enabled, true);
  assert.equal(getShopState('javascript:alert(1)').enabled, false);
});

test('每個商品都顯示尚未開放的賣貨便按鈕', () => {
  const roots = [{}, {}].map(() => ({ replaceChildren(element) { this.element = element; } }));
  const fakeDocument = {
    querySelectorAll: () => roots,
    createElement: (tagName) => ({ tagName }),
  };
  renderShopActions(fakeDocument, getShopState(''));
  assert.deepEqual(roots.map(({ element }) => ({ tagName: element.tagName, disabled: element.disabled, label: element.textContent })), [
    { tagName: 'button', disabled: true, label: '賣貨便即將開放' },
    { tagName: 'button', disabled: true, label: '賣貨便即將開放' },
  ]);
});

test('每種生物都有唯一且合法的實體卡位置', () => {
  const positions = CARD_DATA.map((card) => `${card.sheet}-${card.column}-${card.row}`);
  assert.equal(new Set(positions).size, CARD_DATA.length);
  assert.ok(CARD_DATA.every((card) => card.sheet >= 1 && card.sheet <= 4));
  assert.ok(CARD_DATA.every((card) => card.column >= 0 && card.column <= 3));
  assert.ok(CARD_DATA.every((card) => card.row >= 0 && card.row <= 1));
});

test('實體卡使用精準裁切後的獨立圖片', () => {
  assert.deepEqual(cardSpriteStyle({ id: '001' }), {
    backgroundImage: 'url("assets/cards/card-001.jpg")',
    backgroundPosition: 'center',
  });
  assert.deepEqual(cardSpriteStyle({ id: '030' }), {
    backgroundImage: 'url("assets/cards/card-030.jpg")',
    backgroundPosition: 'center',
  });
});
