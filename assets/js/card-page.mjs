import { CARD_DATA } from './card-data.mjs';
import { findCardById, getCardIdFromSearch, rarityStars } from './card-utils.mjs';

export function buildCardViewModel(search) {
  const id = getCardIdFromSearch(search);
  if (!id) return { status: 'error', message: '網址缺少卡片編號' };
  const card = findCardById(CARD_DATA, id);
  return card ? { status: 'ok', card } : { status: 'error', message: '找不到這張卡片' };
}

function render() {
  const root = document.querySelector('#card-detail');
  const result = buildCardViewModel(window.location.search);
  if (result.status === 'error') {
    root.innerHTML = '<section class="ecology-error" role="alert"><p class="eyebrow">Card not found</p><h1></h1><p>請重新掃描卡片上的 QR Code，或回到圖鑑選擇卡片。</p><a class="ecology-button" href="cards.html">返回卡片圖鑑</a></section>';
    root.querySelector('h1').textContent = result.message;
    return;
  }
  const { card } = result;
  const setAll = (selector, value) => root.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
  root.querySelector('[data-card-id]').textContent = `CARD ${card.id}`;
  root.querySelector('[data-category]').textContent = card.category;
  setAll('[data-name-zh]', card.nameZh);
  root.querySelector('[data-name-en]').textContent = card.nameEn;
  setAll('[data-scientific-name]', card.scientificName);
  root.querySelector('[data-rarity]').textContent = rarityStars(card.rarity);
  root.querySelector('[data-rarity]').setAttribute('aria-label', `稀有度 ${card.rarity} 星，共五顆星`);
  root.querySelector('[data-rarity-label]').textContent = card.rarityLabel;
  setAll('[data-description-zh]', card.descriptionZh);
  root.querySelector('[data-description-en]').textContent = card.descriptionEn;
  const protection = root.querySelector('[data-protection]');
  protection.textContent = card.protectionStatus;
  protection.hidden = !card.protectionStatus;
}

if (typeof document !== 'undefined') render();
