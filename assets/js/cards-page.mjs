import { CARD_DATA } from './card-data.mjs';
import { filterCardsByCategory, rarityStars } from './card-utils.mjs';

export function renderCardList(cards, container) {
  container.replaceChildren(...cards.map((card) => {
    const link = document.createElement('a');
    link.className = `ecology-card ecology-card--rarity-${card.rarity}`;
    link.href = `card.html?id=${encodeURIComponent(card.id)}`;
    link.setAttribute('aria-label', `${card.nameZh}，稀有度 ${card.rarity} 星`);
    link.innerHTML = '<span class="ecology-card__meta"></span><div class="ecology-card__art" aria-hidden="true"></div><h2></h2><p class="ecology-card__latin"></p><p class="ecology-card__rarity"></p>';
    link.querySelector('.ecology-card__meta').textContent = `${card.category} · ${card.id}`;
    link.querySelector('h2').textContent = card.nameZh;
    link.querySelector('.ecology-card__latin').textContent = card.scientificName;
    link.querySelector('.ecology-card__rarity').textContent = rarityStars(card.rarity);
    return link;
  }));
}

const list = typeof document === 'undefined' ? null : document.querySelector('#card-list');
if (list) {
  renderCardList(CARD_DATA, list);
  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      renderCardList(filterCardsByCategory(CARD_DATA, button.dataset.category), list);
      document.querySelectorAll('[data-category]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
}
