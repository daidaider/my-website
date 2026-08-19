const test = require('node:test');
const assert = require('node:assert/strict');

global.document = {
  body: { dataset: {} },
  querySelector: () => null,
  querySelectorAll: () => []
};

const { renderOrchardMap } = require('../app.js');

test('在同一張地圖上為每個有座標的紅棗園建立標記與資訊視窗', () => {
  const calls = { maps: 0, markers: [], bounds: null, order: [] };
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
    tileLayer() { return { addTo(target) { assert.equal(target, map); } }; },
    marker(position) {
      const marker = {
        position,
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
  assert.match(calls.markers[0].popup, /甲紅棗園/);
  assert.match(calls.markers[0].popup, /Google 地圖導航/);
  assert.match(calls.markers[1].popup, /園區 FB/);
  assert.deepEqual(calls.bounds.positions, [[24.47, 120.82], [24.49, 120.81]]);
  assert.deepEqual(calls.order, ['invalidateSize', 'fitBounds']);
});
