import { CARD_DATA } from './card-data.mjs';
import { cardSpriteStyle, filterCardsByCategory } from './card-utils.mjs';

const cardImageStyles = typeof document === 'undefined' ? null : document.createElement('link');
if (cardImageStyles) {
  cardImageStyles.rel = 'stylesheet';
  cardImageStyles.href = 'card-images.css';
  document.head.append(cardImageStyles);
}

export function renderCardList(cards, container) {
  container.replaceChildren(...cards.map((card) => {
    const link = document.createElement('a');
    link.className = 'ecology-card';
    link.href = `card.html?id=${encodeURIComponent(card.id)}`;
    link.setAttribute('aria-label', `${card.nameZh}，稀有度 ${card.rarity} 星`);
    link.innerHTML = '<div class="ecology-card__image" role="img"></div>';
    const image = link.querySelector('.ecology-card__image');
    Object.assign(image.style, cardSpriteStyle(card));
    image.setAttribute('aria-label', `${card.nameZh}實體卡`);
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
