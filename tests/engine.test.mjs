import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, stats, STEP_MS, MAX_OFFLINE_MS, serialize, restore, upgradeGear, gearCost, gearMaterialCost, recipeCost, cook, travel, changeClass, claimAchievement, ZONES } from '../src/engine.js';

test('many foreground ticks and one offline catch-up produce the same game',()=>{
  const a=newGame(1000),b=newGame(1000);
  for(let now=1250;now<=601000;now+=250)advance(a,now);
  advance(b,601000);
  assert.deepEqual(a,b);
  assert.ok(a.kills>=5&&a.kills<20);
  assert.ok(a.level>=1&&a.level<=2);
  assert.equal(a.unlockedZone,0);
  assert.equal(a.inBoss,false);
});
test('paused time never gives rewards, including after reload',()=>{
  const s=newGame(1000);s.running=false;
  advance(s,10000000);
  assert.equal(s.gold,120);assert.equal(s.kills,0);assert.equal(s.lastTick,10000000);
  const loaded=restore(serialize(s),20000000);advance(loaded,20000000);assert.equal(loaded.kills,0);
});
test('offline rewards are capped to eight hours',()=>{
  const a=newGame(1000),b=newGame(1000);
  advance(a,1000+MAX_OFFLINE_MS);advance(b,1000+MAX_OFFLINE_MS*3);
  assert.equal(a.gold,b.gold);assert.equal(a.kills,b.kills);assert.equal(a.level,b.level);
  assert.ok(b.lastTick>MAX_OFFLINE_MS*2);
  assert.ok(b.hp>=0&&b.hp<=stats(b).maxHp);
});
test('2x speed simulates twice as many turns and preserves the remainder',()=>{
  const a=newGame(1000),b=newGame(1000);b.speed=2;
  advance(a,1000+STEP_MS*100);advance(b,1000+STEP_MS*50);
  assert.equal(a.kills,b.kills);assert.equal(a.gold,b.gold);assert.equal(a.enemy.hp,b.enemy.hp);
  const c=newGame(1000);assert.equal(advance(c,1500),0);assert.equal(advance(c,1950),1);assert.equal(c.lastTick,1950);
});
test('gear purchases charge exact prices and cannot overdraw',()=>{
  const s=newGame();const before=stats(s).attack;const cost=gearCost(s,'weapon');
  s.gold=cost;Object.assign(s.materials,gearMaterialCost(s,'weapon'));
  assert.equal(upgradeGear(s,'weapon').ok,true);assert.equal(s.gold,0);assert.equal(stats(s).attack,before+4);
  assert.equal(s.materials.ore,0);assert.equal(s.materials.thread,0);
  const gold=s.gold;assert.equal(upgradeGear(s,'weapon').ok,false);assert.equal(s.gold,gold);assert.equal(upgradeGear(s,'unknown').ok,false);
});
test('recipes consume ingredients once per upgrade and have a maximum',()=>{
  const s=newGame();const attack=stats(s).attack;
  assert.equal(cook(s,'butter').ok,false);s.inventory.butter=500;const cost=recipeCost(s,'butter');
  assert.equal(cook(s,'butter').ok,true);assert.equal(s.inventory.butter,500-cost);assert.equal(stats(s).attack,attack+3);
  for(let i=1;i<5;i++)assert.equal(cook(s,'butter').ok,true);
  const before=s.inventory.butter;assert.equal(cook(s,'butter').ok,false);assert.equal(s.inventory.butter,before);
});
test('locked travel and classes stay locked, achievements cannot be claimed twice',()=>{
  const s=newGame();assert.equal(travel(s,1).ok,false);assert.equal(travel(s,-1).ok,false);assert.equal(changeClass(s,'mage').ok,false);
  s.unlockedZone=1;assert.equal(travel(s,1).ok,true);assert.equal(s.zone,1);assert.equal(s.wave,0);
  s.kills=1;assert.equal(claimAchievement(s,'first').ok,true);assert.equal(s.gold,160);assert.equal(claimAchievement(s,'first').ok,false);assert.equal(s.gold,160);
});
test('valid saves round-trip and malformed saves recover safely',()=>{
  const s=newGame(1000);advance(s,180000);assert.deepEqual(restore(serialize(s),180000),s);
  for(const raw of ['no','null','{}',JSON.stringify({...s,zone:99}),JSON.stringify({...s,gear:{weapon:-4}}),JSON.stringify({...s,enemy:{id:'no'}})])assert.equal(restore(raw,180000),null);
});
test('unattended exploration discovers a boss room but never enters it automatically',()=>{
  const s=newGame(0);advance(s,MAX_OFFLINE_MS);
  assert.equal(s.unlockedZone,0);assert.equal(s.zone,0);
  assert.equal(s.bossRooms[0],true);assert.equal(s.inBoss,false);
  assert.equal(s.discovered[ZONES[0].boss],undefined);
  assert.ok(s.totalIngredients>100);assert.ok(s.level>=4&&s.level<10);
  assert.ok(s.logs.length<=45);
});
