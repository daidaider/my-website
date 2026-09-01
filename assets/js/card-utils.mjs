export function findCardById(cards, id) {
  return cards.find((card) => card.id === id) ?? null;
}

export function filterCardsByCategory(cards, category) {
  return category === '全部' ? cards : cards.filter((card) => card.category === category);
}

export function rarityStars(rarity) {
  return `${'★'.repeat(rarity)}${'☆'.repeat(5 - rarity)}`;
}

export function getCardIdFromSearch(search) {
  const id = new URLSearchParams(search).get('id');
  return id && /^\d{3}$/.test(id) ? id : null;
}
