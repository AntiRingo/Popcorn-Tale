import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, stats, tick, advance, restore, serialize, receiveItem, salvageItem, salvageMatching, toggleItemLock, setAutoSalvage, discardFlyer, gearCost, gearMaterialCost, upgradeGear, xpNeeded, lootChances, travel, STEP_MS, MAX_OFFLINE_MS, REVIVE_MS, JOURNEY_MIN_TICKS, JOURNEY_MAX_TICKS, JOURNEY_EVENT_TICKS } from '../src/engine.js';
import { DEFAULT_SALVAGE_RULE, salvageRewards, matchesSalvageRule, craftingCost, BLUEPRINTS } from '../src/progression.js';

const item = (s, values={}) => ({ id:s.nextItemId++,slot:'weapon',level:1,quality:0,affix:0,bossZone:-1,count:1,...values });
function spare(s,values={}) { const x=item(s,values);s.warehouse.push(x);return x; }
function enable(s,values={}) { assert.equal(setAutoSalvage(s,{...DEFAULT_SALVAGE_RULE,slots:[...DEFAULT_SALVAGE_RULE.slots],enabled:true,...values}).ok,true); }
function eventAt(seed,hp=50) {
  const s=newGame(1000);s.hp=hp;s.phase='travel';s.wait=1;s.seed=seed;
  s.lastTick+=STEP_MS;tick(s);return s;
}

test('strengthening charges both currencies atomically and higher ranks require essence',()=>{
  const s=newGame(1000);s.gold=10000;
  const before=serialize(s);assert.equal(upgradeGear(s,'weapon').ok,false);assert.equal(serialize(s),before);
  for(const slot of ['weapon','shield','charm','ring']) {
    const cost=gearMaterialCost(s,slot);Object.assign(s.materials,cost);const gold=s.gold,price=gearCost(s,slot);
    assert.equal(upgradeGear(s,slot).ok,true);assert.equal(s.gold,gold-price);
    for(const key of Object.keys(cost))assert.equal(s.materials[key],0);
  }
  s.gear.weapon=5;const cost=gearMaterialCost(s,'weapon');assert.ok(cost.essence>0);
  Object.assign(s.materials,cost);s.materials.essence--;
  const unchanged=serialize(s);assert.equal(upgradeGear(s,'weapon').ok,false);assert.equal(serialize(s),unchanged);
  s.materials.essence++;const gold=s.gold,price=gearCost(s,'weapon');
  assert.equal(upgradeGear(s,'weapon').ok,true);assert.equal(s.gold,gold-price);assert.equal(s.materials.essence,0);
});

test('manual recycling handles a stack precisely and never consumes equipped or locked items',()=>{
  const s=newGame(1000);receiveItem(s,item(s,{quality:3}));
  const x=spare(s,{quality:2,level:20,count:3}),reward=salvageRewards(x);
  assert.equal(salvageItem(s,s.equipped.weapon.id).ok,false);
  toggleItemLock(s,x.id);assert.equal(salvageItem(s,x.id).ok,false);toggleItemLock(s,x.id);
  for(const count of [0,-1,4,1.5,NaN])assert.equal(salvageItem(s,x.id,count).ok,false);
  assert.equal(salvageItem(s,x.id).ok,true);assert.equal(x.count,2);
  for(const [key,n] of Object.entries(reward))assert.equal(s.materials[key],n);
  assert.equal(salvageItem(s,x.id,2).ok,true);assert.equal(s.warehouse.length,0);assert.equal(s.salvaged,3);
  for(const [key,n] of Object.entries(reward))assert.equal(s.materials[key],n*3);
  const saved=serialize(s);assert.equal(salvageItem(s,x.id).ok,false);assert.equal(serialize(s),saved);
  assert.deepEqual(restore(saved,1000),s);
});

test('auto recycling equips upgrades first and applies all configured filters to spares',()=>{
  const s=newGame(1000);enable(s,{maxQuality:1,maxLevel:5,slots:['weapon']});
  const starter=item(s);receiveItem(s,starter);assert.equal(s.equipped.weapon.id,starter.id);assert.equal(s.salvaged,0);
  const upgrade=item(s,{quality:2,level:10});receiveItem(s,upgrade);
  assert.equal(s.equipped.weapon.id,upgrade.id);assert.equal(s.salvaged,1);
  receiveItem(s,item(s));assert.equal(s.salvaged,2);
  for(const x of [item(s,{level:6}),item(s,{quality:2}),item(s,{bossZone:0}),item(s,{blueprintId:'craft-weapon',quality:2}),item(s,{locked:true})]){
    assert.equal(matchesSalvageRule(s,x),false);receiveItem(s,x);
  }
  const shield=spare(s,{slot:'shield'});assert.equal(matchesSalvageRule(s,shield),false);
  assert.equal(s.salvaged,2);
  const poorBoss=item(s,{bossZone:0});enable(s,{maxQuality:4,maxLevel:100,includeSpecial:true});
  assert.equal(matchesSalvageRule(s,poorBoss),true);
  assert.equal(matchesSalvageRule(s,{...poorBoss,locked:true}),false);
});

test('saving a rule never silently consumes existing warehouse contents; bulk action follows saved rules',()=>{
  const s=newGame(1000),normal=spare(s,{count:3}),locked=spare(s,{locked:true}),boss=spare(s,{bossZone:0}),crafted=spare(s,{quality:2,blueprintId:'craft-weapon'});
  enable(s,{maxQuality:4,maxLevel:100});assert.equal(s.warehouse.length,4);assert.equal(s.salvaged,0);
  assert.equal(salvageMatching(s).ok,true);assert.equal(s.salvaged,3);
  assert.deepEqual(s.warehouse.map(x=>x.id),[locked.id,boss.id,crafted.id]);
  assert.equal(salvageMatching(s).ok,false);
  enable(s,{maxQuality:4,maxLevel:100,includeSpecial:true});salvageMatching(s);
  assert.deepEqual(s.warehouse.map(x=>x.id),[locked.id]);assert.equal(s.salvaged,5);
  assert.ok(s.materials.boss0>0);assert.ok(normal.count===0);
});

test('invalid recycling rules leave settings intact',()=>{
  const s=newGame(1000),before=serialize(s);
  for(const value of [{slots:[]},{slots:['weapon','weapon']},{maxLevel:0},{maxLevel:101},{maxQuality:5},{enabled:'yes'},{includeSpecial:1},{slots:['bad']}]){
    assert.equal(setAutoSalvage(s,{...DEFAULT_SALVAGE_RULE,...value}).ok,false);assert.equal(serialize(s),before);
  }
});

test('new travel intervals last about twenty seconds and travel cannot bypass them',()=>{
  const s=newGame(1000);s.enemy.hp=1;s.heroCooldown=0;s.enemyCooldown=STEP_MS*2;tick(s);
  assert.equal(s.phase,'travel');assert.ok(s.wait>=JOURNEY_MIN_TICKS&&s.wait<=JOURNEY_MAX_TICKS);
  const wait=s.wait;for(let i=0;i<wait-1;i++)tick(s);assert.equal(s.phase,'travel');assert.equal(s.wait,1);
  assert.equal(travel(s,0).ok,true);assert.equal(s.phase,'travel');assert.ok(s.wait>=JOURNEY_MIN_TICKS);
});

test('noncombat events gather, fail, hurt, evade, heal and receive flyers without counting kills',()=>{
  for(const [seed,kind] of [[1973,'cache'],[1972,'cache'],[1974,'hazard'],[1976,'flyer'],[1975,'hazard'],[1978,'campfire'],[1977,'spring']]) {
    const s=eventAt(seed);assert.equal(s.journeyEvent.kind,kind);assert.equal(s.phase,'event');assert.equal(s.wait,JOURNEY_EVENT_TICKS);
    assert.equal(s.kills,0);assert.equal(s.zoneKills[0],0);assert.equal(s.xp,0);assert.equal(s.journeyCount,1);
    assert.deepEqual(restore(serialize(s),s.lastTick),s);
  }
  assert.deepEqual(eventAt(1973).journeyEvent.materials,{});
  const cache=eventAt(1972);for(const [id,n] of Object.entries(cache.journeyEvent.materials))assert.equal(cache.materials[id],n);
  assert.ok(eventAt(1974).hp<50);assert.equal(eventAt(1975).hp,50);assert.ok(eventAt(1978).hp>50);assert.ok(eventAt(1976).flyer);
});

test('event rewards resolve exactly once across reloads and paused time',()=>{
  const s=eventAt(1972),materials=structuredClone(s.materials);s.running=false;
  advance(s,s.lastTick+100000);assert.equal(s.wait,JOURNEY_EVENT_TICKS);assert.deepEqual(s.materials,materials);
  const restored=restore(serialize(s),s.lastTick);restored.running=true;
  advance(restored,restored.lastTick+STEP_MS*JOURNEY_EVENT_TICKS);
  assert.equal(restored.phase,'travel');assert.ok(restored.wait>=JOURNEY_MIN_TICKS);assert.equal(restored.journeyCount,1);assert.deepEqual(restored.materials,materials);
});

test('an event can kill the hero and uses the same one-hour resurrection and one-time loss',()=>{
  const s=eventAt(1974,1);assert.equal(s.phase,'rest');assert.equal(s.hp,0);assert.equal(s.gold,108);assert.equal(s.reviveAt,s.lastTick+REVIVE_MS);
  const loaded=restore(serialize(s),s.lastTick);assert.ok(loaded);
  advance(loaded,loaded.reviveAt-1);assert.equal(loaded.gold,108);assert.equal(loaded.hp,0);
  advance(loaded,loaded.reviveAt);assert.equal(loaded.hp,stats(loaded).maxHp);assert.equal(loaded.journeyEvent,null);
});

test('flyer keeps its stock until refresh and supports discarding',()=>{
  const s=eventAt(1976),x=spare(s,{count:2,locked:true}),offer=structuredClone(s.flyer);
  advance(s,s.lastTick+5*60000);
  assert.deepEqual(s.flyer,offer);assert.equal(x.count,2);
  assert.ok(restore(serialize(s),s.lastTick));
  assert.equal(discardFlyer(s,offer.id).ok,true);assert.equal(s.flyer,null);
  assert.equal(discardFlyer(s,offer.id).ok,false);
});

test('auto recycling and journey events stay deterministic between foreground and offline play',()=>{
  const a=newGame(1000);enable(a,{maxQuality:2,maxLevel:100});for(const slot of ['weapon','shield','charm','ring'])receiveItem(a,item(a,{slot,quality:4,level:20}));const b=structuredClone(a);
  for(let now=1250;now<=3601000;now+=250)advance(a,now);advance(b,3601000);
  assert.deepEqual(a,b);assert.ok(a.salvaged>0);assert.ok(a.journeyCount>0);assert.ok(restore(serialize(a),a.lastTick));
});

test('v2 migration retains items, resources, progress and death losses while adding safe defaults',()=>{
  const s=eventAt(1974,1);s.version=2;s.level=7;s.xp=24;s.materials.ore=33;
  s.reviveAt=s.lastTick+10*60000;
  const x=spare(s,{quality:2});
  delete s.materials.essence;delete s.deathLoss.materials.essence;
  for(const key of ['autoSalvage','salvaged','inventoryRevision','journeyCount','journeyEvent','nextFlyerId','flyer'])delete s[key];
  const loaded=restore(serialize(s),s.lastTick);assert.ok(loaded);assert.equal(loaded.version, 9);
  assert.equal(loaded.xp,24);assert.equal(loaded.level,7);assert.equal(loaded.materials.ore,33);assert.equal(loaded.materials.essence,0);
  assert.equal(loaded.reviveAt,s.lastTick+REVIVE_MS);assert.equal(loaded.deathLoss.materials.essence,0);assert.deepEqual(loaded.warehouse,[x]);
  assert.equal(loaded.autoSalvage.enabled,false);assert.equal(loaded.flyer,null);
});

test('malformed rules, locks and event/merchant state are rejected',()=>{
  const good=eventAt(1976);spare(good);
  for(const corrupt of [s=>s.autoSalvage.slots=[],s=>s.journeyEvent.kind='fake',s=>s.journeyEvent.materials={ore:-2},s=>s.journeyEvent=null,s=>s.flyer.id=s.nextFlyerId,s=>s.flyer.zone=9,s=>s.salvaged=-1,s=>s.warehouse[0].locked='no']){
    const s=structuredClone(good);corrupt(s);assert.equal(restore(serialize(s),s.lastTick),null);
  }
});

test('economy lowers base loot and lengthens growth; recycling cannot create a crafting loop',()=>{
  assert.equal(lootChances(0).equipment,.12);assert.equal(lootChances(0).material,.30);
  for(const level of [1,5,10,20,40])assert.ok(xpNeeded(level)>(24+level*16)*2);
  for(const level of [1,20,40])for(const b of BLUEPRINTS){
    const cost=craftingCost({level},b),reward=salvageRewards({slot:b.slot,quality:b.quality,level,bossZone:b.bossZone});
    assert.ok(cost.gold>40+level*12);
    assert.ok(cost.materials.ore>reward.ore&&cost.materials.thread>reward.thread);
  }
  const s=newGame(1000);advance(s,1000+MAX_OFFLINE_MS);
  assert.ok(s.level<10);assert.ok(s.kills>100&&s.kills<500);assert.ok(s.journeyCount>20&&s.journeyCount<100);
});
