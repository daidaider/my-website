const test = require('node:test');
const assert = require('node:assert/strict');

global.document = {
  body: { dataset: {} },
  querySelector: () => null,
  querySelectorAll: () => []
};

const { renderOrchardMap, renderAttractionMap, renderOrchardCards } = require('../app.js');

test('在同一張地圖上為每個有座標的紅棗園建立標記與資訊視窗', () => {
  const calls = { maps: 0, markers: [], bounds: null, order: [], icons: [], tileUrl: '' };
  const map = {
    invalidateSize() { calls.order.push('invalidateSize'); },
    fitBounds(bounds) { calls.order.push('fitBounds'); calls.bounds = bounds; },
    setView() { throw new Error('有標記時不應使用預設中心'); }
  };
  const leaflet = {
    map(container) {
      calls.maps += 1;
      assert.equal(container.id, 'orchard-map');
      return map;
    },
    tileLayer(url) { calls.tileUrl = url; return { addTo(target) { assert.equal(target, map); } }; },
    divIcon(options) { calls.icons.push(options); return { options }; },
    marker(position, options) {
      const marker = {
        position,
        icon: options?.icon,
        popup: '',
        addTo(target) { assert.equal(target, map); calls.markers.push(marker); return marker; },
        bindPopup(content) { marker.popup = content; return marker; }
      };
      return marker;
    },
    latLngBounds(positions) { return { positions, pad: value => ({ positions, padding: value }) }; }
  };
  const orchards = [
    { name: '甲紅棗園', phone: '0912-345-678', map: 'https://maps.example/a', social: '', lat: 24.47, lng: 120.82 },
    { name: '乙紅棗園', phone: '', map: 'https://maps.example/b', social: 'https://facebook.example/b', lat: 24.49, lng: 120.81 },
    { name: '缺少座標', phone: '', map: '', social: '' }
  ];

  renderOrchardMap({ id: 'orchard-map', replaceChildren() {} }, orchards, leaflet);

  assert.equal(calls.maps, 1);
  assert.equal(calls.markers.length, 2);
  assert.deepEqual(calls.markers.map(marker => marker.position), [[24.47, 120.82], [24.49, 120.81]]);
  assert.equal(calls.icons.length, 1);
  assert.match(calls.tileUrl, /tile\.openstreetmap\.org/i);
  assert.equal(calls.icons[0].className, 'jujube-map-icon');
  assert.match(calls.icons[0].html, /jujube-pin-fruit/);
  assert.ok(calls.markers.every(marker => marker.icon === calls.markers[0].icon));
  assert.match(calls.markers[0].popup, /甲紅棗園/);
  assert.match(calls.markers[0].popup, /Google 地圖導航/);
  assert.match(calls.markers[1].popup, /園區 FB/);
  assert.deepEqual(calls.bounds.positions, [[24.47, 120.82], [24.49, 120.81]]);
  assert.deepEqual(calls.order, ['invalidateSize', 'fitBounds']);
});

test('其他景點與美食顯示在同一張地圖上', () => {
  const calls = { markers: [], bounds: null };
  const map = { invalidateSize() {}, fitBounds(bounds) { calls.bounds = bounds; }, setView() {} };
  const leaflet = {
    map() { return map; },
    tileLayer() { return { addTo() {} }; },
    divIcon(options) { return { options }; },
    marker(position, options) {
      const marker = { position, options, popup: '', addTo() { calls.markers.push(marker); return marker; }, bindPopup(content) { marker.popup = content; return marker; } };
      return marker;
    },
    latLngBounds(positions) { return { positions, pad: value => ({ positions, padding: value }) }; }
  };
  const places = [
    { type: '景點', name: '甲景點', address: '甲地址', map: 'https://maps.example/a', lat: 24.47, lng: 120.82 },
    { type: '美食', name: '乙餐廳', address: '乙地址', map: 'https://maps.example/b', lat: 24.49, lng: 120.81 }
  ];

  renderAttractionMap({ replaceChildren() {} }, places, leaflet);

  assert.equal(calls.markers.length, 2);
  assert.match(calls.markers[0].popup, /甲景點/);
  assert.match(calls.markers[1].popup, /乙餐廳/);
  assert.notDeepEqual(calls.markers[0].options.icon, calls.markers[1].options.icon);
  assert.deepEqual(calls.bounds.positions, [[24.47, 120.82], [24.49, 120.81]]);
});

test('紅棗園地圖下方恢復一園一格的卡片', () => {
  const container = { innerHTML: '' };
  const counter = { textContent: '' };
  const orchards = [
    { name: '甲紅棗園', phone: '0912-345-678', map: 'https://maps.example/a', detail: '入園採果', social: '', note: '' },
    { name: '乙紅棗園', phone: '', map: 'https://maps.example/b', detail: '', social: '', note: '友善耕作' }
  ];

  renderOrchardCards(container, counter, orchards, '友善');

  assert.doesNotMatch(container.innerHTML, /甲紅棗園/);
  assert.match(container.innerHTML, /乙紅棗園/);
  assert.match(container.innerHTML, /place-card--orchard/);
  assert.equal(counter.textContent, '共 1 筆');
});
