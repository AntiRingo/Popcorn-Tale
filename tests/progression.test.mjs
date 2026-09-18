import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, tick, stats, STEP_MS, MAX_OFFLINE_MS, REVIVE_MS, BOSS_DISCOVERY_KILLS, receiveItem, enterBoss, craft, upgradeTalent, upgradeGear, gearMaterialCost, cook, changeClass, travel, spawnEnemy, restore, serialize, ZONES, lootChances } from '../src/engine.js';
import { EQUIPMENT_SLOTS, BLUEPRINTS, TALENTS, itemName, itemScore, craftingCost, talentPoints } from '../src/progression.js';

function item(s, overrides={}) {
  return { id:s.nextItemId++, slot:'weapon', level:1, quality:0, affix:0, bossZone:-1, count:1, ...overrides };
}
function win(s) {
  s.enemy.hp=1; s.heroCooldown=0; s.enemyCooldown=STEP_MS*2; tick(s);
}
function killHero(s) {
  s.hp=1; s.enemy.attack=1000000; s.enemyCooldown=0; s.heroCooldown=STEP_MS*2;
  s.lastTick+=STEP_MS; tick(s);
  assert.equal(s.phase,'rest');
}

test('all four slots auto-equip higher scores, warehouse every spare and preserve enhancement',()=>{
  const s=newGame(1000);s.gear.weapon=7;
  for(const slot of EQUIPMENT_SLOTS) {
    const first=item(s,{slot:slot.id});receiveItem(s,first);
    const better=item(s,{slot:slot.id,level:8,quality:3});assert.ok(itemScore(better)>itemScore(first));
    assert.equal(receiveItem(s,better),true);assert.equal(s.equipped[slot.id].id,better.id);
    const tied=item(s,{slot:slot.id,level:8,quality:3});assert.equal(receiveItem(s,tied),false);
    const spare=item(s,{slot:slot.id});receiveItem(s,spare);
    assert.equal(s.warehouse.find(x=>x.id===first.id).count,2);
  }
  assert.equal(s.gear.weapon,7);
  assert.equal(s.warehouse.reduce((sum,x)=>sum+x.count,0),12);
  assert.deepEqual(restore(serialize(s),1000),s);
});

test('crafting requires a known blueprint and all resources, charges exactly once and keeps blueprint',()=>{
  const s=newGame(1000),b=BLUEPRINTS[0];s.level=12;s.gold=10000;
  assert.equal(craft(s,b.id).ok,false);
  s.blueprints.push(b.id);let before=serialize(s);
  assert.equal(craft(s,b.id).ok,false);assert.equal(serialize(s),before);
  const cost=craftingCost(s,b);
  for(const [id,n] of Object.entries(cost.materials))s.materials[id]=n*2;
  s.inventory[b.ingredient]=cost.ingredient*2;
  assert.equal(craft(s,b.id).ok,true);
  assert.equal(s.gold,10000-cost.gold);assert.equal(s.equipped.weapon.level,12);
  assert.equal(itemName(s.equipped.weapon),b.name);
  for(const [id,n] of Object.entries(cost.materials))assert.equal(s.materials[id],n);
  assert.equal(craft(s,b.id).ok,true);
  assert.equal(s.warehouse.length,1);assert.deepEqual(s.blueprints,[b.id]);
  assert.deepEqual(restore(serialize(s),1000),s);
  before=serialize(s);assert.equal(craft(s,b.id).ok,false);assert.equal(serialize(s),before);
});

test('a higher score with less health clamps current HP and remains loadable',()=>{
  const s=newGame(1000);
  receiveItem(s,item(s,{slot:'charm',level:10,quality:2,affix:3}));s.hp=stats(s).maxHp;
  const candidate=item(s,{slot:'charm',level:6,quality:2,affix:2,bossZone:1});
  assert.ok(itemScore(candidate)>itemScore(s.equipped.charm));
  receiveItem(s,candidate);assert.equal(s.hp,stats(s).maxHp);
  assert.deepEqual(restore(serialize(s),1000),s);
});

test('boss recipes require their exclusive material and produce boss gear',()=>{
  const s=newGame(1000),b=BLUEPRINTS.find(b=>b.bossZone===2);s.gold=10000;s.blueprints.push(b.id);
  const cost=craftingCost(s,b);s.inventory[b.ingredient]=cost.ingredient;
  for(const [id,n] of Object.entries(cost.materials))s.materials[id]=n;
  s.materials.boss2--;assert.equal(craft(s,b.id).ok,false);
  s.materials.boss2++;assert.equal(craft(s,b.id).ok,true);
  assert.equal(s.equipped[b.slot].bossZone,2);assert.equal(s.materials.boss2,0);
});

test('boss discovery is gated by hidden kills and persists through travel and reload',()=>{
  const s=newGame(1000);s.unlockedZone=1;s.autoTravel=false;
  for(let n=0;n<BOSS_DISCOVERY_KILLS-1;n++){win(s);spawnEnemy(s);assert.equal(s.bossRooms[0],false);}
  for(let n=0;n<100&&!s.bossRooms[0];n++){win(s);spawnEnemy(s);}
  assert.equal(s.bossRooms[0],true);assert.equal(s.enemy.boss,false);
  assert.equal(travel(s,1).ok,true);assert.equal(s.bossRooms[0],true);
  const loaded=restore(serialize(s),1000);assert.ok(loaded);
  assert.equal(loaded.bossRooms[0],true);assert.equal(enterBoss(loaded,0).ok,true);
  assert.equal(loaded.inBoss,true);assert.equal(loaded.enemy.id,ZONES[0].boss);
  assert.equal(enterBoss(loaded,0).ok,false);
});

test('each manually entered boss guarantees exclusive gear, material and blueprint and unlocks next zone',()=>{
  const s=newGame(1000);s.autoTravel=false;
  assert.equal(enterBoss(s).ok,false);
  for(let zone=0;zone<ZONES.length;zone++) {
    s.zone=zone;s.bossRooms[zone]=true;
    assert.equal(enterBoss(s,zone).ok,true);assert.equal(s.bossRooms[zone],false);
    assert.deepEqual(restore(serialize(s),1000),s);
    win(s);
    assert.equal(s.inBoss,false);assert.equal(s.bossRooms[zone],false);
    assert.ok([...Object.values(s.equipped),...s.warehouse].some(x=>x?.bossZone===zone));
    assert.ok(s.materials[`boss${zone}`]>=2);assert.ok(s.blueprints.includes(`boss-craft-${zone}`));
    assert.equal(s.unlockedZone,Math.min(zone+1,ZONES.length-1));
    assert.equal(s.zoneKills[zone],0);
    assert.deepEqual(restore(serialize(s),1000),s);
  }
});

test('retreat and boss death preserve the entrance for a manual retry',()=>{
  const s=newGame(1000);s.bossRooms[0]=true;enterBoss(s);
  assert.equal(travel(s,0).ok,true);assert.equal(s.bossRooms[0],true);assert.equal(s.inBoss,false);
  enterBoss(s);killHero(s);
  assert.equal(s.bossRooms[0],true);assert.equal(s.inBoss,false);assert.equal(enterBoss(s).ok,false);
  advance(s,s.reviveAt);assert.equal(s.enemy.boss,false);assert.equal(s.bossRooms[0],true);
  assert.equal(enterBoss(s).ok,true);
});

test('talent points follow level, parent ranks and rank caps, and improve every stat',()=>{
  const s=newGame(1000);assert.equal(talentPoints(s),1);
  assert.equal(upgradeTalent(s,'precision').ok,false);
  assert.equal(upgradeTalent(s,'might').ok,true);assert.equal(talentPoints(s),0);
  assert.equal(upgradeTalent(s,'might').ok,false);
  s.level=50;const before=stats(s);
  for(const talent of TALENTS) {
    while((s.talents[talent.id]||0)<talent.max)assert.equal(upgradeTalent(s,talent.id).ok,true);
    assert.equal(upgradeTalent(s,talent.id).ok,false);
  }
  for(const key of ['attack','maxHp','defense','crit','speed','luck','dodge','lifesteal'])assert.ok(stats(s)[key]>before[key],key);
  assert.equal(talentPoints(s),10);assert.deepEqual(restore(serialize(s),1000),s);
});

test('haste increases hero attack frequency without accelerating enemy attacks',()=>{
  const normal=newGame(1000),fast=newGame(1000);normal.level=fast.level=100;
  fast.gear.ring=34;
  for(const s of [normal,fast]){s.enemy.hp=s.enemy.maxHp=1000000;s.hp=stats(s).maxHp;}
  const enemyHp=normal.enemy.hp;
  advance(normal,20000);advance(fast,20000);
  assert.ok(enemyHp-fast.enemy.hp>(enemyHp-normal.enemy.hp)*1.6);
  assert.equal(fast.round,normal.round);
});

test('dodge negates an enemy strike and lifesteal heals from damage actually dealt',()=>{
  const s=newGame(1000);s.level=40;s.talents={vitality:3,resilience:3,evasion:5};
  s.hp=100;s.seed=12345;s.enemyCooldown=0;s.heroCooldown=STEP_MS*2;
  tick(s);assert.equal(s.event.type,'dodge');assert.equal(s.hp,100);
  s.talents={might:3,precision:3,siphon:5};s.heroCooldown=0;s.enemyCooldown=STEP_MS*2;
  s.enemy.hp=s.enemy.maxHp=10000;tick(s);
  assert.equal(s.event.type,'hero');assert.ok(s.event.healing>0);
  assert.equal(s.hp,100+Math.round(s.event.amount*.1));
  s.hp=100;s.heroCooldown=0;s.enemyCooldown=STEP_MS*2;s.enemy.hp=10;tick(s);
  assert.equal(s.hp,101+Math.ceil(stats(s).maxHp*.09));
});

test('luck raises both drop rates and the quality distribution across seeded battles',()=>{
  const ordinary=newGame(1000),lucky=newGame(1000);
  lucky.level=40;lucky.talents={haste:3,fortune:5};
  receiveItem(lucky,item(lucky,{slot:'charm',level:40,quality:4,affix:3}));
  const chance=lootChances(stats(lucky).luck),base=lootChances(0);
  for(const key of Object.keys(base))assert.ok(chance[key]>base[key]);
  function sample(s) {
    let count=0,totalQuality=0,material=0;
    // Reset equipment after each kill to isolate the chosen luck value.
    const equipped=structuredClone(s.equipped),talents=structuredClone(s.talents);
    for(let n=0;n<1500;n++){
      s.equipped=structuredClone(equipped);s.talents=talents;s.warehouse=[];
      const id=s.nextItemId;win(s);
      for(const x of [...Object.values(s.equipped),...s.warehouse].filter(x=>x&&x.id>=id)){count+=x.count;totalQuality+=x.quality*x.count;}
      spawnEnemy(s);
    }
    material=s.materials.ore+s.materials.thread;
    return {count,quality:totalQuality/count,material};
  }
  const a=sample(ordinary),b=sample(lucky);
  assert.ok(b.count>a.count*1.5);assert.ok(b.quality>a.quality+.5);assert.ok(b.material>a.material);
});

test('death loses 10% currency/materials once and preserves permanent progression',()=>{
  const s=newGame(1000);s.level=20;s.xp=7;s.gold=101;s.gear.weapon=8;s.inventory.butter=11;s.materials.ore=21;s.materials.boss0=1;
  s.talents={might:2};s.blueprints=['craft-weapon'];receiveItem(s,item(s));
  const permanent=JSON.stringify([s.level,s.xp,s.gear,s.equipped,s.warehouse,s.talents,s.blueprints]);
  killHero(s);
  assert.equal(s.gold,90);assert.equal(s.inventory.butter,9);assert.equal(s.materials.ore,18);assert.equal(s.materials.boss0,0);
  assert.equal(s.reviveAt,s.lastTick+REVIVE_MS);
  assert.equal(JSON.stringify([s.level,s.xp,s.gear,s.equipped,s.warehouse,s.talents,s.blueprints]),permanent);
  const loaded=restore(serialize(s),s.lastTick+100);assert.ok(loaded);
  advance(loaded,loaded.reviveAt-1);assert.equal(loaded.hp,0);assert.equal(loaded.gold,90);
  advance(loaded,loaded.reviveAt);assert.equal(loaded.hp,stats(loaded).maxHp);assert.equal(loaded.reviveAt,0);
});

test('revival uses ten real minutes regardless of pause, speed, reload and actions',()=>{
  for(const speed of [1,2])for(const running of [true,false]){
    const s=newGame(1000);s.level=20;s.gold=10000;s.inventory.salt=100;
    killHero(s);s.speed=speed;s.running=running;const deadline=s.reviveAt;
    assert.equal(travel(s,0).ok,false);assert.equal(enterBoss(s).ok,false);
    assert.equal(changeClass(s,'cleric').ok,true);assert.equal(s.hp,0);
    Object.assign(s.materials,gearMaterialCost(s,'charm'));
    assert.equal(upgradeGear(s,'charm').ok,true);cook(s,'salt');upgradeTalent(s,'vitality');assert.equal(s.hp,0);
    advance(s,deadline-1);assert.equal(s.hp,0);assert.equal(s.reviveAt,deadline);
    const loaded=restore(serialize(s),deadline-1);assert.ok(loaded);
    advance(loaded,deadline);assert.equal(loaded.hp,stats(loaded).maxHp);assert.equal(loaded.running,running);
    assert.equal(loaded.kills,0);assert.equal(loaded.reviveAt,0);
  }
});

test('foreground and offline catch-up agree across repeated deaths and resurrections',()=>{
  const a=newGame(1000);a.zone=a.unlockedZone=5;spawnEnemy(a);
  const b=structuredClone(a),end=1000+REVIVE_MS*3+STEP_MS*20;
  for(let now=1250;now<end;now+=250)advance(a,now);
  advance(a,end);advance(b,end);
  assert.ok(a.deathLoss);assert.deepEqual(a,b);
});

test('expired resurrection is honored even when absence exceeds offline cap',()=>{
  const s=newGame(1000);killHero(s);const deadline=s.reviveAt;
  advance(s,deadline+MAX_OFFLINE_MS*2);
  assert.ok(s.kills>0);assert.ok(s.playedMs>0);assert.notEqual(s.reviveAt,deadline);if(s.phase==='rest')assert.ok(s.reviveAt>s.lastTick);
});

test('legacy saves migrate without losing currencies, levels, recipes or enhancements',()=>{
  const s=newGame(1000);s.level=12;s.gold=456;s.gear.weapon=4;s.inventory.butter=15;s.recipes.butter=2;
  s.version=1;delete s.gear.ring;
  for(const key of ['equipped','warehouse','nextItemId','materials','blueprints','talents','zoneKills','bossRooms','inBoss','reviveAt','deathLoss','heroCooldown','enemyCooldown'])delete s[key];
  const loaded=restore(serialize(s),1000);assert.ok(loaded);
  assert.equal(loaded.version,6);assert.equal(loaded.level,12);assert.equal(loaded.gold,456);
  assert.equal(loaded.gear.weapon,4);assert.equal(loaded.inventory.butter,15);assert.equal(loaded.recipes.butter,2);
  assert.equal(talentPoints(loaded),12);assert.deepEqual(loaded.warehouse,[]);
  s.phase='rest';s.hp=0;const dead=restore(serialize(s),2000);assert.ok(dead);assert.equal(dead.reviveAt,1000+REVIVE_MS);
});

test('malformed progression saves cannot inject items, points, materials or resurrection states',()=>{
  const valid=newGame(1000);receiveItem(valid,item(valid));
  const corruptions=[
    s=>{s.equipped.weapon.quality=99;},s=>{s.equipped.weapon.slot='ring';},s=>{s.warehouse.push({...s.equipped.weapon});},
    s=>{s.nextItemId=1;},s=>{s.materials.ore=-1;},s=>{s.materials.boss0='5';},s=>{s.talents={might:2};},
    s=>{s.talents={siphon:1};},s=>{s.blueprints=['fake'];},s=>{s.bossRooms[5]=true;},s=>{s.inBoss=true;},
    s=>{s.phase='rest';s.reviveAt=10000;},s=>{s.reviveAt=10000;},s=>{s.heroCooldown=-1;},s=>{s.zoneKills=[];},
  ];
  for(const corrupt of corruptions){const s=structuredClone(valid);corrupt(s);assert.equal(restore(serialize(s),1000),null);}
});
