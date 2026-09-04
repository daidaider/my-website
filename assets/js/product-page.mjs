import { SHOP_URL } from './shop-config.mjs';

export function getShopState(url) {
  try {
    const parsed = new URL(url);
    const valid = parsed.protocol === 'https:' && parsed.hostname.endsWith('7-11.com.tw');
    return valid ? { enabled: true, label: '前往賣貨便購買', href: parsed.href } : { enabled: false, label: '賣貨便即將開放', href: null };
  } catch {
    return { enabled: false, label: '賣貨便即將開放', href: null };
  }
}

export function renderShopActions(pageDocument, state) {
  pageDocument.querySelectorAll('[data-shop-action]').forEach((root) => {
    if (state.enabled) {
      const link = pageDocument.createElement('a');
      link.className = 'ecology-button';
      link.href = state.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = state.label;
      root.replaceChildren(link);
    } else {
      const button = pageDocument.createElement('button');
      button.className = 'ecology-button';
      button.type = 'button';
      button.disabled = true;
      button.textContent = state.label;
      root.replaceChildren(button);
    }
  });
}

if (typeof document !== 'undefined') renderShopActions(document, getShopState(SHOP_URL));
