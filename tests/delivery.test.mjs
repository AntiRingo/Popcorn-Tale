import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, tick, placeOrder, discardFlyer, settleRealTime, restore, serialize, receiveItem, STEP_MS, MAX_OFFLINE_MS } from '../src/engine.js';
import { flyerProducts, orderProduct, FLYER_REFRESH_MS, MAX_PENDING_ORDERS, DELIVERY_HISTORY_LIMIT } from '../src/progression.js';

function shop(now=1000) {
  const s=newGame(now);s.gold=100000;
  s.flyer={id:s.nextFlyerId++,level:1,zone:0,purchased:[],refreshAt:now+FLYER_REFRESH_MS};
  return s;
}
function order(s,id,now=s.lastTick) {
  assert.equal(placeOrder(s,s.flyer.id,id,now).ok,true);
  return s.orders.at(-1);
}

test('ordering charges the displayed price once, reserves stock, and never grants early',()=>{
  const s=shop(),p=flyerProducts(s.flyer)[0],gold=s.gold,o=order(s,p.id);
  assert.equal(s.gold,gold-p.price);assert.equal(s.materials.ore,0);
  assert.equal(o.deliverAt,1000+p.delay);assert.deepEqual(orderProduct(o),p);
  const saved=serialize(s);
  for(const [flyerId,id,now] of [[s.flyer.id,p.id,1000],[s.flyer.id+1,'thread',1000],[s.flyer.id,'unknown',1000],[s.flyer.id,'thread',999],[s.flyer.id,'thread',NaN]]) {
    assert.equal(placeOrder(s,flyerId,id,now).ok,false);assert.equal(serialize(s),saved);
  }
  s.gold=0;const poor=serialize(s);assert.equal(placeOrder(s,s.flyer.id,'thread',1000).ok,false);assert.equal(serialize(s),poor);
  assert.deepEqual(restore(serialize(s),1000),s);
});

test('deliveries use the exact wall-clock deadline at 1x, 2x and while paused',()=>{
  for(const [speed,running] of [[1,true],[2,true],[1,false],[2,false]]) {
    const s=shop();s.speed=speed;s.running=running;
    // Avoid combat changing resources during this clock test.
    s.enemy.attack=1;s.enemy.hp=s.enemy.maxHp=10000000;s.hp=115;
    const o=order(s,'ore');
    advance(s,o.deliverAt-1);assert.equal(s.materials.ore,0);assert.equal(o.deliveredAt,null);
    advance(s,o.deliverAt);assert.equal(s.materials.ore,6);assert.equal(o.deliveredAt,o.deliverAt);
    const gold=s.gold;advance(s,o.deliverAt+1);assert.equal(s.materials.ore,6);assert.equal(s.gold,gold);
    assert.ok(restore(serialize(s),o.deliverAt+1));
  }
});

test('parcels deliver during death and do not revive or consume another payment',()=>{
  const s=shop(),o=order(s,'accessory');
  s.hp=1;s.enemy.attack=10000;s.heroCooldown=STEP_MS*2;s.enemyCooldown=0;
  s.lastTick+=STEP_MS;tick(s);assert.equal(s.phase,'rest');const reviveAt=s.reviveAt,gold=s.gold;
  assert.ok(o.deliverAt<reviveAt);
  advance(s,o.deliverAt);assert.equal(s.phase,'rest');assert.equal(s.hp,0);assert.equal(s.reviveAt,reviveAt);
  assert.equal(s.gold,gold);assert.equal(s.equipped.ring.quality,2);assert.equal(s.equipped.ring.locked,true);
  assert.ok(restore(serialize(s),o.deliverAt));
  s.running=false;advance(s,reviveAt);assert.notEqual(s.phase,'rest');assert.equal(s.running,false);
});

test('paid gear keeps the advertised stats after level changes and stays safe from auto salvage',()=>{
  const s=shop();s.autoSalvage={enabled:true,maxQuality:4,maxLevel:100,slots:['weapon','shield','ring','charm'],includeSpecial:true};
  const o=order(s,'weapon'),advertised=structuredClone(orderProduct(o).item);
  receiveItem(s,{id:s.nextItemId++,slot:'weapon',level:40,quality:4,affix:0,bossZone:-1,count:1});
  s.level=20;s.running=false;advance(s,o.deliverAt);
  assert.equal(s.salvaged,0);assert.equal(s.warehouse.length,1);
  for(const [key,value] of Object.entries(advertised))assert.equal(s.warehouse[0][key],value);
  assert.equal(s.warehouse[0].locked,true);
});

test('reloading, importing and repeated settlement never duplicate delivered goods',()=>{
  let s=shop();s.running=false;const o=order(s,'ore');
  s=restore(serialize(s),o.deliverAt);advance(s,o.deliverAt);
  assert.equal(s.materials.ore,6);assert.equal(s.orders[0].deliveredAt,o.deliverAt);
  s=restore(serialize(s),o.deliverAt+10000);advance(s,o.deliverAt+10000);settleRealTime(s,o.deliverAt+20000);
  assert.equal(s.materials.ore,6);assert.equal(s.orders.length,1);
});

test('flyer stock and contents refresh every real half hour without changing paid orders',()=>{
  for(const speed of [1,2]) {
    const s=shop();s.running=false;s.speed=speed;const original=structuredClone(s.flyer),p=orderProduct(order(s,'accessory'));
    advance(s,original.refreshAt-1);assert.equal(s.flyer.id,original.id);assert.deepEqual(s.flyer.purchased,['accessory']);
    advance(s,original.refreshAt);assert.equal(s.flyer.id,original.id+1);assert.deepEqual(s.flyer.purchased,[]);
    assert.equal(s.flyer.refreshAt,original.refreshAt+FLYER_REFRESH_MS);
    assert.notDeepEqual(flyerProducts(s.flyer),flyerProducts(original));
    assert.deepEqual(orderProduct(s.orders[0]),p);assert.equal(s.equipped.ring.quality,p.item.quality);
    const saved=serialize(s);assert.equal(placeOrder(s,original.id,'ore',original.refreshAt).ok,false);assert.equal(serialize(s),saved);
    order(s,'ore',original.refreshAt);assert.equal(s.orders.length,2);
  }
});

test('refresh deadlines survive reload, stock cannot be bought after expiration, and repeat events do not reset time',()=>{
  let s=shop();s.running=false;const deadline=s.flyer.refreshAt;
  const saved=serialize(s);assert.equal(placeOrder(s,s.flyer.id,'ore',deadline).ok,false);assert.equal(serialize(s),saved);
  s=restore(saved,deadline-1);advance(s,deadline-1);assert.equal(s.flyer.refreshAt,deadline);
  s.running=true;s.phase='travel';s.wait=1;s.seed=1976;tick(s);
  assert.equal(s.journeyEvent.kind,'flyer');assert.equal(s.flyer.refreshAt,deadline);
  advance(s,deadline);assert.equal(s.flyer.refreshAt,deadline+FLYER_REFRESH_MS);
});

test('offline refresh and delivery are not limited by the eight-hour combat cap',()=>{
  for(const running of [false,true]) {
    const s=shop();s.running=running;const o=order(s,'weapon'),firstRefresh=s.flyer.refreshAt;
    const now=1000+MAX_OFFLINE_MS*4;
    advance(s,now);assert.equal(s.orders.find(x=>x.id===o.id).deliveredAt,o.deliverAt);
    assert.equal(s.flyer.id,1+Math.floor((now-1000)/FLYER_REFRESH_MS));
    assert.equal(s.flyer.refreshAt,firstRefresh+Math.floor((now-1000)/FLYER_REFRESH_MS)*FLYER_REFRESH_MS);
    assert.ok(restore(serialize(s),now));
  }
});

test('foreground and offline results agree across shipments, refreshes, battles and deaths',()=>{
  for(const speed of [1,2]) {
    const a=shop();a.speed=speed;for(const p of flyerProducts(a.flyer))order(a,p.id);
    const b=structuredClone(a),until=1000+2*FLYER_REFRESH_MS+1307;
    for(let now=1250;now<until;now+=250)advance(a,now);
    advance(a,until);advance(b,until);assert.deepEqual(a,b);
  }
});

test('discarding a flyer leaves paid parcels intact, and waiting for orders never blocks exploration',()=>{
  const s=shop(),o=order(s,'ore');assert.equal(discardFlyer(s,s.flyer.id).ok,true);assert.equal(s.flyer,null);
  advance(s,o.deliverAt+60000);assert.equal(o.deliveredAt,o.deliverAt);assert.ok(s.kills>0);assert.ok(s.playedMs>0);
});

test('v3 merchant offers migrate to flyers without consuming gear or materials',()=>{
  const s=shop();s.version=3;s.tradeOffer={id:4,zone:0};s.nextTradeId=5;s.phase='event';s.wait=3;s.journeyEvent={kind:'merchant',zone:0,damage:0,healed:0,materials:{}};
  for(const key of ['flyer','nextFlyerId','orders','nextOrderId','shopRevision'])delete s[key];
  const loaded=restore(serialize(s),9000);assert.ok(loaded);assert.equal(loaded.version, 9);
  assert.deepEqual(loaded.flyer,{id:4,zone:0,level:1,purchased:[],refreshAt:9000+FLYER_REFRESH_MS});
  assert.equal(loaded.journeyEvent.kind,'flyer');assert.equal(loaded.gold,s.gold);assert.deepEqual(loaded.materials,s.materials);assert.deepEqual(loaded.orders,[]);
  assert.equal('tradeOffer' in loaded,false);assert.deepEqual(restore(serialize(loaded),9000),loaded);
});

test('malformed shipping data, stock and refresh timestamps are rejected',()=>{
  const base=shop();order(base,'ore');
  for(const corrupt of [s=>s.flyer.refreshAt=-1,s=>s.flyer.refreshAt=Infinity,s=>s.flyer.purchased=['ore','ore'],s=>s.flyer.purchased=[],s=>s.orders[0].deliverAt--,s=>s.orders[0].orderedAt=-1,s=>s.orders[0].deliveredAt=1,s=>s.orders[0].productId='fake',s=>s.orders[0].level=0,s=>s.orders[0].zone=4,s=>s.orders[0].id=s.nextOrderId,s=>s.orders.push({...s.orders[0]}),s=>s.orders=null,s=>s.nextOrderId=0,s=>s.shopRevision=-1]) {
    const s=structuredClone(base);corrupt(s);assert.equal(restore(serialize(s),1000),null);
  }
});

test('delivered history stays bounded while new orders continue to settle',()=>{
  const s=shop();s.running=false;
  for(let round=0;round<7;round++) {
    for(const p of flyerProducts(s.flyer))order(s,p.id);
    advance(s,s.flyer.refreshAt);
    assert.ok(s.orders.length<=DELIVERY_HISTORY_LIMIT);
    assert.ok(restore(serialize(s),s.lastTick));
  }
  assert.equal(s.orders.length,DELIVERY_HISTORY_LIMIT);
  assert.equal(s.orders.filter(o=>o.deliveredAt===null).length,0);
});

test('shipping queue capacity rejects purchases without charging or reserving stock',()=>{
  const s=shop();
  // Independent flyers may be received after discarding a prior sheet.
  for(let n=0;n<MAX_PENDING_ORDERS;n++) {
    order(s,'ore');discardFlyer(s,s.flyer.id);
    s.flyer={id:s.nextFlyerId++,zone:0,level:1,purchased:[],refreshAt:1000+FLYER_REFRESH_MS};
  }
  const saved=serialize(s);assert.equal(placeOrder(s,s.flyer.id,'ore',1000).ok,false);assert.equal(serialize(s),saved);
  assert.ok(restore(saved,1000));
  s.running=false;advance(s,121000);assert.equal(s.materials.ore,158);assert.equal(s.orders.length,20);
  assert.equal(placeOrder(s,s.flyer.id,'ore',121000).ok,true);
});
