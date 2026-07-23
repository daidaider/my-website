const SHEETS = {
  orchards: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSFlzdqDK8om4K8c8-WnEE32VTBbeoWvUx32HUv_jj23pVz8dVVyUHffbD2B0m9wJT0zT-1f-H4X-4/pub?gid=0&single=true&output=csv',
  attractions: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSFlzdqDK8om4K8c8-WnEE32VTBbeoWvUx32HUv_jj23pVz8dVVyUHffbD2B0m9wJT0zT-1f-H4X-4/pub?gid=1574629393&single=true&output=csv'
};

const parseCsv = (text) => {
  const rows = []; let row = []; let cell = ''; let quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') { if (quote && text[i + 1] === '"') { cell += char; i += 1; } else quote = !quote; }
    else if (char === ',' && !quote) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quote) { if (char === '\r' && text[i + 1] === '\n') i += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
};

const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const cleanUrl = (value = '') => (value.match(/https?:\/\/[^\s,]+/) || [])[0] || '';
const mapUrl = (map, address, name) => cleanUrl(map) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;
const phoneUrl = phone => `tel:${phone.replace(/[^+\d]/g, '')}`;

const orchardRows = rows => rows.slice(1).filter(row => row[0]).map(row => ({ name: row[0], phone: row[1], map: row[2], detail: row[3], social: row[4], note: row[5] }));
const attractionRows = rows => {
  let type = '';
  return rows.slice(1).map(row => { type = row[0] || type; return { type, name: row[1], address: row[2], map: row[3], feature: row[5], closed: row[6], hours: row[7], phone: row[8], social: row[9] }; }).filter(item => item.name && item.type);
};

function renderCard(item, page) {
  const isOrchard = page === 'orchards';
  const title = escapeHtml(item.name);
  const map = mapUrl(item.map, item.address, item.name);
  const detail = isOrchard ? [item.detail, item.note].filter(Boolean).join('・') : item.feature;
  const rows = isOrchard ? [detail && `<p class="place-info">${escapeHtml(detail)}</p>`] : [item.address && `<p class="place-info">${escapeHtml(item.address)}</p>`, item.phone && `<p class="place-info"><strong>電話：</strong><a href="${phoneUrl(item.phone)}">${escapeHtml(item.phone)}</a></p>`, item.hours && `<p class="place-info"><strong>營業時間：</strong>${escapeHtml(item.hours)}</p>`, item.closed && `<p class="place-info"><strong>公休日：</strong>${escapeHtml(item.closed)}</p>`, detail && `<p class="place-info">${escapeHtml(detail)}</p>`];
  const actions = [`<a class="place-action" href="${map}" target="_blank" rel="noopener">Google 地圖</a>`];
  const social = cleanUrl(item.social); if (social) actions.push(`<a class="place-action" href="${social}" target="_blank" rel="noopener">${isOrchard ? '園區 FB' : '更多資訊'}</a>`);
  return `<article class="place-card"><p class="place-type">${isOrchard ? '紅棗園' : escapeHtml(item.type)}</p><h3><a href="${map}" target="_blank" rel="noopener">${title}</a></h3>${isOrchard && item.phone ? `<p class="place-info"><strong>電話：</strong><a href="${phoneUrl(item.phone)}">${escapeHtml(item.phone)}</a></p>` : ''}${rows.filter(Boolean).join('')}<div class="place-actions">${actions.join('')}</div></article>`;
}

async function loadPage() {
  const page = document.body.dataset.page; if (!page) return;
  const list = document.querySelector('#card-list'); const counter = document.querySelector('#result-count');
  try {
    const response = await fetch(SHEETS[page]); if (!response.ok) throw new Error('資料讀取失敗');
    const data = page === 'orchards' ? orchardRows(parseCsv(await response.text())) : attractionRows(parseCsv(await response.text()));
    let selected = page === 'attractions' ? '景點' : '';
    const draw = () => { const filtered = page === 'attractions' ? data.filter(item => item.type === selected) : data; counter.textContent = `共 ${filtered.length} 筆`; list.innerHTML = filtered.length ? filtered.map(item => renderCard(item, page)).join('') : '<p class="error-message">目前沒有符合的資料。</p>'; };
    document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
      selected = button.dataset.filter;
      document.querySelectorAll('.filter-button').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      draw();
    }));
    draw();
  } catch (error) { list.innerHTML = '<p class="error-message">暫時無法載入資料，請稍後再試。</p>'; counter.textContent = ''; }
}
loadPage();
