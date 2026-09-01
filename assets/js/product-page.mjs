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

if (typeof document !== 'undefined') {
  const root = document.querySelector('#shop-action');
  const state = getShopState(SHOP_URL);
  if (state.enabled) {
    const link = document.createElement('a');
    link.className = 'ecology-button';
    link.href = state.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = state.label;
    root.replaceChildren(link);
  } else {
    const button = document.createElement('button');
    button.className = 'ecology-button';
    button.type = 'button';
    button.disabled = true;
    button.textContent = state.label;
    root.replaceChildren(button);
  }
}
