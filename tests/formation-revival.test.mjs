import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, tick, stats, spawnEnemy, changeClass, classProgress, setPetFormation, moveFormationPet, preferBeast, beastStats, enterBoss, serialize, restore, settleRealTime, startIncubation, STEP_MS, SUMMON_MS, REVIVE_MS, BEAST_REVIVE_MS, MAX_PET_FORMATION, MAX_OFFLINE_MS } from '../src/engine.js';
import { FIELD_TASKS, fieldTaskRewards } from '../src/progression.js';
import { addPet } from './pet-fixtures.mjs';

function harmlessBattle(s) {
  spawnEnemy(s); s.enemy.hp=s.enemy.maxHp=1000000; s.enemy.attack=1;
}
function summon(s) {
  harmlessBattle(s);
  for(let i=0;i<3;i++)tick(s);
}
function lethalStrike(s) {
  s.seed=1; s.enemy.attack=100000; s.heroCooldown=s.petCooldown=STEP_MS*2; s.enemyCooldown=0;
  tick(s);
  s.enemy.attack=1;
}
function killHero(s) {
  harmlessBattle(s);s.hp=1;lethalStrike(s);assert.equal(s.phase,'rest');
}
function team(s,n=5) {
  return Array.from({length:n},(_,i)=>addPet(s,['mushroom','slime','bee','crab','herb'][i]));
}

test('formation holds four distinct owned pets; edits are atomic and reordering preserves the fighter',()=>{
  const s=newGame(1000),pets=team(s),ids=pets.map(p=>p.id);
  assert.equal(MAX_PET_FORMATION,4);assert.equal(setPetFormation(s,ids.slice(0,4)).ok,true);summon(s);
  assert.equal(s.activeBeast,ids[0]);const hp=pets[0].hp,cooldown=s.petCooldown;
  for(const invalid of [ids,[ids[0],ids[0]],['missing'],null]){
    const before=serialize(s);assert.equal(setPetFormation(s,invalid).ok,false);assert.equal(serialize(s),before);
  }
  const full=serialize(s);assert.equal(preferBeast(s,ids[4]).ok,false);assert.equal(serialize(s),full);
  assert.equal(moveFormationPet(s,ids[0],1).ok,true);assert.equal(s.activeBeast,ids[0]);assert.equal(s.formationIndex,1);
  assert.equal(pets[0].hp,hp);assert.equal(s.petCooldown,cooldown);
  assert.deepEqual(restore(serialize(s),s.lastTick),s);
  assert.equal(setPetFormation(s,[ids[1],ids[2],ids[3],ids[4]]).ok,true);assert.equal(s.activeBeast,null);assert.equal(s.summonCooldown,SUMMON_MS);
  summon(s);assert.equal(s.activeBeast,ids[1]);
  setPetFormation(s,[]);assert.equal(s.activeBeast,null);assert.equal(s.summonCooldown,0);assert.equal(s.preferredBeast,null);
});

test('fallen members deploy in order, skip recovering members, wrap around and never use an unrostered pet',()=>{
  const s=newGame(1000),pets=team(s),ids=pets.map(p=>p.id);setPetFormation(s,ids.slice(0,4));summon(s);
  pets[1].hp=0;pets[1].reviveAt=s.lastTick+BEAST_REVIVE_MS;
  const hp=s.hp;lethalStrike(s);
  assert.equal(pets[0].reviveAt,s.lastTick+3600000);assert.equal(s.hp,hp);
  assert.equal(s.summonCooldown,SUMMON_MS-STEP_MS,'replacement starts immediately without discarding the remaining tick');
  assert.ok(restore(serialize(s),s.lastTick));summon(s);assert.equal(s.activeBeast,ids[2]);
  lethalStrike(s);summon(s);assert.equal(s.activeBeast,ids[3]);
  pets[0].reviveAt=0;pets[0].hp=beastStats(s,ids[0]).maxHp;
  lethalStrike(s);summon(s);assert.equal(s.activeBeast,ids[0]);
  lethalStrike(s);assert.equal(s.summonCooldown,0);assert.equal(s.activeBeast,null);
  const enemyHP=s.enemy.hp;s.heroCooldown=0;tick(s);assert.ok(s.enemy.hp<enemyHP);assert.ok(pets[4].hp>0);assert.equal(s.activeBeast,null);
  s.running=false;advance(s,s.lastTick+BEAST_REVIVE_MS);assert.equal(s.activeBeast,null);
  s.running=true;summon(s);assert.equal(s.activeBeast,ids[1],'resumes at the next formation position after recovery');
});

test('formation order and individual one-hour pet deadlines survive pause, speed, reload and class switches',()=>{
  for(const speed of [1,2]){
    let s=newGame(1000);s.speed=speed;const pets=team(s,4),ids=pets.map(p=>p.id);setPetFormation(s,ids);summon(s);lethalStrike(s);
    const deadline=pets[0].reviveAt;s.running=false;changeClass(s,'tamer');advance(s,deadline-1);
    s=restore(serialize(s),deadline-1);assert.ok(s);assert.deepEqual(s.petFormation,ids);assert.equal(s.beasts[ids[0]].hp,0);
    advance(s,deadline);assert.equal(s.beasts[ids[0]].reviveAt,0);assert.equal(s.beasts[ids[0]].hp,beastStats(s,ids[0]).maxHp);
    assert.equal(s.activeBeast,null);assert.equal(s.running,false);assert.deepEqual(restore(serialize(s),deadline),s);
  }
});

test('dead professions have independent one-hour recovery and loss records while another profession remains playable',()=>{
  assert.equal(REVIVE_MS,3600000);assert.equal(BEAST_REVIVE_MS,3600000);
  let s=newGame(1000);s.level=20;killHero(s);const knightDeadline=s.reviveAt,knightLoss=structuredClone(s.deathLoss);
  changeClass(s,'tamer');assert.ok(s.hp>0);assert.equal(s.reviveAt,0);assert.equal(s.deathLoss,null);
  s.hp=45;s.running=false;advance(s,601000);changeClass(s,'knight');assert.equal(s.hp,0);assert.equal(s.reviveAt,knightDeadline);
  changeClass(s,'tamer');assert.equal(s.hp,45);killHero(s);const tamerDeadline=s.reviveAt;
  assert.equal(tamerDeadline-knightDeadline,600000);changeClass(s,'cleric');assert.ok(s.hp>0);
  const clericHP=s.hp,gold=s.gold;
  s=restore(serialize(s),s.lastTick);assert.ok(s);advance(s,knightDeadline-1);assert.equal(s.professions.knight.hp,0);
  advance(s,knightDeadline);assert.equal(s.professions.knight.reviveAt,0);assert.ok(s.professions.knight.hp>0);
  assert.equal(s.professions.tamer.hp,0);assert.equal(s.professions.tamer.reviveAt,tamerDeadline);
  assert.equal(s.heroClass,'cleric');assert.equal(s.hp,clericHP);assert.equal(s.gold,gold);assert.deepEqual(s.professions.knight.deathLoss,knightLoss);
  advance(s,tamerDeadline);assert.equal(s.professions.tamer.reviveAt,0);assert.ok(s.professions.tamer.hp>0);
  changeClass(s,'knight');assert.equal(s.hp,stats(s).maxHp);assert.deepEqual(s.deathLoss,knightLoss);
  assert.deepEqual(restore(serialize(s),s.lastTick),s);
});

test('an inactive profession revives even while the selected profession is still dead or beyond the offline cap',()=>{
  for(const running of [true,false]){
    const s=newGame(1000);killHero(s);const deadline=s.reviveAt;changeClass(s,'tamer');s.running=false;advance(s,11000);killHero(s);s.running=running;
    advance(s,deadline);assert.equal(s.phase,'rest');assert.equal(s.hp,0);assert.equal(s.professions.knight.reviveAt,0);assert.ok(s.professions.knight.hp>0);
    changeClass(s,'knight');assert.ok(s.hp>0);s.running=false;advance(s,s.lastTick+MAX_OFFLINE_MS*2);assert.equal(s.professions.tamer.reviveAt,0);
    assert.ok(restore(serialize(s),s.lastTick));
  }
});

test('switching to a recovering class during a field task preserves its deadline and pays rewards exactly once',()=>{
  for(const reviveBeforeTask of [true,false]){
    const s=newGame(1000);killHero(s);const deadline=s.reviveAt;changeClass(s,'tamer');s.running=false;
    advance(s,deadline-(reviveBeforeTask?60000:600000));
    s.fieldTask={kind:'quarry',zone:0,startedAt:s.lastTick,finishAt:s.lastTick+FIELD_TASKS.quarry.duration,completedAt:null};s.phase='task';s.wait=0;
    const finish=s.fieldTask.finishAt,materials={...s.materials},rewards=fieldTaskRewards(s.fieldTask);
    changeClass(s,'knight');assert.equal(s.phase,'rest');assert.equal(s.fieldTask.finishAt,finish);assert.ok(restore(serialize(s),s.lastTick));
    if(reviveBeforeTask){advance(s,deadline);assert.equal(s.phase,'task');assert.equal(s.fieldTask.completedAt,null);}
    advance(s,Math.max(deadline,finish));assert.equal(s.fieldTask.completedAt,finish);assert.ok(s.hp>0);assert.notEqual(s.phase,'task');
    for(const [key,n] of Object.entries(rewards.materials))assert.equal(s.materials[key],materials[key]+n);
    const before=serialize(s);settleRealTime(s,s.lastTick);assert.equal(serialize(s),before);assert.ok(restore(serialize(s),s.lastTick));
  }
});

test('automatic boss victories retain the setting for the next discovery; hero defeat disables it and preserves the entrance',()=>{
  const s=newGame(1000);s.autoTravel=false;s.autoBoss=true;
  for(let i=0;i<2;i++){
    s.bossRooms[0]=true;s.phase='travel';s.wait=1;tick(s);assert.equal(s.inBoss,true);
    s.enemy.hp=1;s.heroCooldown=0;s.enemyCooldown=STEP_MS*2;tick(s);
    assert.equal(s.inBoss,false);assert.equal(s.autoBoss,true);assert.equal(s.bossRooms[0],false);
    assert.equal(s.discovered.mushroomKing,i+1);assert.ok(restore(serialize(s),s.lastTick));
  }
  s.bossRooms[0]=true;enterBoss(s);s.hp=1;lethalStrike(s);
  assert.equal(s.autoBoss,false);assert.equal(s.bossRooms[0],true);assert.equal(s.reviveAt,s.lastTick+REVIVE_MS);
  changeClass(s,'tamer');s.phase='travel';s.wait=1;tick(s);assert.equal(s.inBoss,false);assert.equal(s.bossRooms[0],true);
});

test('a pet death in a boss battle continues the formation without disabling automatic challenges',()=>{
  const s=newGame(1000),pets=team(s,2);setPetFormation(s,pets.map(p=>p.id));summon(s);
  s.autoBoss=true;s.bossRooms[0]=true;enterBoss(s);lethalStrike(s);
  assert.equal(s.inBoss,true);assert.equal(s.autoBoss,true);assert.ok(s.hp>0);assert.ok(s.summonCooldown>0);
});

test('v8 saves migrate original death dates once and retain the selected pet as the first formation member',()=>{
  const s=newGame(1000);s.level=20;changeClass(s,'tamer');changeClass(s,'knight');
  const pet=addPet(s);preferBeast(s,pet.id);summon(s);s.activeBeast=null;s.summonCooldown=0;killHero(s);
  s.version=8;s.reviveAt=1000+10*60000;pet.hp=0;pet.reviveAt=1000+8*3600000;s.preferredBeast=null;
  s.professions.tamer.hp=0;delete s.professions.tamer.reviveAt;delete s.professions.tamer.deathLoss;delete s.petFormation;delete s.formationIndex;
  let loaded=restore(serialize(s),1000);assert.ok(loaded);assert.equal(loaded.reviveAt,1000+REVIVE_MS);assert.equal(loaded.beasts[pet.id].reviveAt,1000+BEAST_REVIVE_MS);
  assert.equal(loaded.professions.tamer.reviveAt,0);assert.ok(loaded.professions.tamer.hp>0);assert.deepEqual(loaded.petFormation,[]);
  assert.deepEqual(restore(serialize(loaded),1000),loaded);loaded.running=false;advance(loaded,1000+REVIVE_MS);assert.ok(loaded.hp>0);assert.ok(loaded.beasts[pet.id].hp>0);
  const living=newGame(1000),selected=addPet(living);preferBeast(living,selected.id);summon(living);living.version=8;delete living.petFormation;delete living.formationIndex;
  loaded=restore(serialize(living),1000);assert.deepEqual(loaded.petFormation,[selected.id]);assert.equal(loaded.activeBeast,selected.id);
});

test('invalid formation and inactive recovery state cannot be imported',()=>{
  const s=newGame(1000);s.level=20;killHero(s);changeClass(s,'tamer');const ids=team(s).map(p=>p.id);setPetFormation(s,ids.slice(0,4));summon(s);
  const mutations=[x=>x.petFormation=ids,x=>x.petFormation=[ids[0],ids[0]],x=>x.petFormation=['missing'],x=>x.petFormation=[],x=>x.formationIndex=4,x=>x.formationIndex=1,
    x=>x.professions.knight.reviveAt=-1,x=>x.professions.knight.reviveAt=x.lastTick+REVIVE_MS+1,x=>x.professions.knight.hp=1,x=>x.professions.knight.reviveAt=0,x=>x.professions.knight.deathLoss.gold=-1];
  for(const mutate of mutations){const bad=structuredClone(s);mutate(bad);assert.equal(restore(serialize(bad),s.lastTick),null,mutate.toString());}
  assert.ok(restore(serialize(s),s.lastTick));
});

test('foreground and offline catch-up agree with a four-pet formation, hatching, and independent profession revivals',()=>{
  const a=newGame(1000);a.level=20;killHero(a);changeClass(a,'tamer');a.running=false;advance(a,11000);killHero(a);changeClass(a,'ranger');a.running=true;
  setPetFormation(a,team(a,4).map(p=>p.id));a.eggs.herb=1;startIncubation(a,'herb',a.lastTick);
  const b=structuredClone(a),end=a.lastTick+REVIVE_MS*2;
  for(let now=a.lastTick+1000;now<end;now+=1000)advance(a,now);advance(a,end);advance(b,end);
  assert.deepEqual(a,b);assert.ok(restore(serialize(a),end));
});
