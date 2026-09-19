import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, tick, stats, changeClass, spawnEnemy, receiveItem, equipWarehouseItem, unequipItem, upgradeGear, enterBoss, travel, serialize, restore, settleRealTime, preferBeast, feedBeast, beastStats, beastForm, beastLevelCap, beastXpNeeded, beastAdvanceCost, petEggChance, startIncubation, restAtCampfire, upgradeTalent, gearMaterialCost, STEP_MS, SUMMON_MS, BEAST_REVIVE_MS, PET_HATCH_MS, BOSS_HATCH_MS, MAX_OFFLINE_MS, BOSS_DISCOVERY_KILLS, BOSS_DISCOVERY_CHANCE, MONSTERS, ZONES, CLASSES, PET_SKILLS } from '../src/engine.js';
import { CLASS_GEAR, BLUEPRINTS, TALENTS, talentPoints, talentAvailable, craftingCost, DEFAULT_SALVAGE_RULE, matchesSalvageRule } from '../src/progression.js';
import { craft } from '../src/engine.js';
import { addPet, victory } from './pet-fixtures.mjs';

function durableEnemy(s) {
  spawnEnemy(s); s.enemy.hp = s.enemy.maxHp = 1000000; s.enemy.attack = 1;
}
function field(s, pet) {
  s.petFormation = [pet.id]; s.formationIndex = 0;
  s.activeBeast = s.preferredBeast = pet.id; s.summonCooldown = 0;
}
function knockOut(s, pet) {
  durableEnemy(s); field(s, pet); pet.hp = 1; s.enemy.attack = 100000;
  s.heroCooldown = STEP_MS * 2; s.petCooldown = STEP_MS * 2; s.enemyCooldown = 0; tick(s);
}

test('every profession can select a pet, and the hero and pet attack on independent clocks', () => {
  for (const profession of CLASSES) {
    const s = newGame(1000); s.level = 20; changeClass(s, profession.id);
    assert.equal(Object.keys(s.beasts).length, 0, 'changing profession never gives a free pet');
    const pet = addPet(s); durableEnemy(s); assert.equal(preferBeast(s, pet.id).ok, true);
    for (let i=0; i<3; i++) tick(s);
    assert.equal(s.activeBeast, pet.id); assert.ok(s.enemy.hp < s.enemy.maxHp, 'hero attacks while summoning');
    s.heroCooldown=0; s.petCooldown=STEP_MS*2; s.enemyCooldown=STEP_MS*2;
    const before=s.enemy.hp;tick(s);assert.equal(s.event.type,'hero');assert.ok(s.enemy.hp<before);
    s.heroCooldown=STEP_MS*2;s.petCooldown=0;s.enemyCooldown=STEP_MS*2;
    const second=s.enemy.hp;tick(s);assert.equal(s.event.type,'beast');assert.ok(s.enemy.hp<second);
    assert.ok(restore(serialize(s),s.lastTick));
  }
});

test('ordinary and boss eggs hatch at exact real-hour deadlines regardless of speed, pause and reload', () => {
  assert.equal(PET_HATCH_MS,3600000);assert.equal(BOSS_HATCH_MS,14400000);
  for(const [species,duration] of [['mushroom',PET_HATCH_MS],['mushroomKing',BOSS_HATCH_MS]])for(const speed of [1,2]) {
    let s=newGame(1000);s.running=false;s.speed=speed;s.eggs[species]=2;
    assert.equal(startIncubation(s,species,1000).ok,true);assert.equal(s.eggs[species],1);
    const deadline=s.incubators[0].hatchAt;
    advance(s,deadline-1);assert.equal(Object.keys(s.beasts).length,0);
    s=restore(serialize(s),deadline-1);assert.ok(s);advance(s,deadline);
    const pet=Object.values(s.beasts)[0];assert.equal(pet.species,species);assert.equal(pet.level,1);
    assert.equal(pet.skills.length,MONSTERS[species].boss?2:1);assert.equal(s.incubators.length,0);
    assert.equal(s.activeBeast,null);assert.equal(s.preferredBeast,null);
    for(const iv of Object.values(pet.traits))assert.ok(iv>=80&&iv<=120);
    const once=serialize(s);settleRealTime(s,deadline);assert.equal(serialize(s),once);
    assert.deepEqual(restore(serialize(s),deadline),s);
  }
});

test('three incubation slots consume eggs atomically; duplicate species retain separate random individuals', () => {
  const s=newGame(1000);s.eggs.slime=4;
  assert.equal(startIncubation(s,'missing',1000).ok,false);
  assert.equal(startIncubation(s,'slime',999).ok,false);
  for(let i=0;i<3;i++)assert.equal(startIncubation(s,'slime',1000).ok,true);
  const before=serialize(s);assert.equal(startIncubation(s,'slime',1000).ok,false);assert.equal(serialize(s),before);
  settleRealTime(s,1000+PET_HATCH_MS);const pets=Object.values(s.beasts);
  assert.equal(pets.length,3);assert.equal(new Set(pets.map(p=>p.id)).size,3);
  assert.ok(new Set(pets.map(p=>JSON.stringify(p.traits))).size>1);
  assert.equal(s.eggs.slime,1);assert.ok(restore(serialize(s),s.lastTick));
});

test('egg drop is very rare for normal monsters and bosses and is available to all professions', () => {
  assert.equal(petEggChance(newGame(1000)),.002);assert.equal(petEggChance(newGame(1000),true),.005);
  for(const boss of [false,true]) {
    let drops=0, winningSeed=0;
    for(let seed=1;seed<=3000;seed++) {
      const s=newGame(1000);s.seed=seed;victory(s,boss?'mushroomKing':'mushroom',boss);
      assert.equal(Object.keys(s.beasts).length,0);
      if(Object.values(s.eggs).some(n=>n>0)){drops++;winningSeed=seed;}
    }
    assert.ok(drops>0&&drops<60,`rare egg count: ${drops}`);
    for(const profession of CLASSES) {
      const s=newGame(1000);s.level=20;changeClass(s,profession.id);s.seed=winningSeed;
      // Force the same combat attributes and random stream across professions.
      s.heroClass=profession.id;victory(s,boss?'mushroomKing':'mushroom',boss);
      assert.equal(s.eggs[boss?'mushroomKing':'mushroom'],1);
    }
  }
});

test('only rostered pets can replace a fallen pet, and recovery takes one real hour', () => {
  assert.equal(BEAST_REVIVE_MS,3600000);
  for(const speed of [1,2]) {
    let s=newGame(1000);s.speed=speed;const first=addPet(s),spare=addPet(s,'slime');
    const hp=s.hp;knockOut(s,first);const deadline=first.reviveAt;
    assert.equal(s.hp,hp);assert.equal(s.activeBeast,null);assert.equal(s.preferredBeast,null);assert.equal(s.summonCooldown,0);
    s.enemy.attack=1;tick(s);assert.equal(s.activeBeast,null);assert.equal(s.summonCooldown,0);
    assert.equal(preferBeast(s,first.id).ok,false);assert.equal(preferBeast(s,spare.id).ok,true);
    for(let i=0;i<3;i++)tick(s);assert.equal(s.activeBeast,spare.id);
    s.running=false;advance(s,deadline-1);assert.equal(first.hp,0);
    s=restore(serialize(s),deadline-1);assert.ok(s);advance(s,deadline);
    assert.equal(s.beasts[first.id].reviveAt,0);assert.equal(s.activeBeast,spare.id);
    assert.equal(s.beasts[first.id].hp,beastStats(s,first.id).maxHp);
    assert.equal(preferBeast(s,first.id).ok,true);assert.equal(s.preferredBeast,first.id);
    const again=serialize(s);settleRealTime(s,deadline);assert.equal(serialize(s),again);
  }
});

test('hatching and recovery settle after an absence longer than the combat cap', () => {
  const s=newGame(1000),pet=addPet(s);knockOut(s,pet);s.running=false;s.eggs.crabKing=1;
  startIncubation(s,'crabKing',1000);advance(s,1000+MAX_OFFLINE_MS*4);
  assert.equal(s.incubators.length,0);assert.equal(Object.keys(s.beasts).length,2);
  assert.equal(pet.reviveAt,0);assert.ok(pet.hp>0);assert.equal(s.activeBeast,null);assert.equal(s.preferredBeast,null);
});

test('combat levels independently reach 100; only the deployed living pet receives experience', () => {
  const s=newGame(1000),pet=addPet(s),reserve=addPet(s,'herb');field(s,pet);
  for(let i=0;i<3;i++)victory(s);assert.equal(pet.level,2);assert.equal(pet.xp,0);assert.equal(reserve.xp,0);
  pet.level=99;pet.xp=beastXpNeeded(99)-1;victory(s);assert.equal(pet.level,100);assert.equal(pet.xp,0);
  victory(s);assert.equal(pet.level,100);assert.equal(pet.xp,0);assert.equal(pet.growth,0);assert.equal(beastLevelCap(pet),100);
  knockOut(s,pet);victory(s);assert.equal(pet.xp,0);assert.equal(reserve.xp,0);
  assert.ok(restore(serialize(s),s.lastTick));
});

test('every species evolves five times at level one, changes appearance each time and preserves death deadlines', () => {
  for(const species of Object.keys(MONSTERS)) {
    const s=newGame(1000),pet=addPet(s,species),forms=new Set([beastForm(pet).id]);
    pet.hp=0;pet.reviveAt=s.lastTick+BEAST_REVIVE_MS;const deadline=pet.reviveAt;
    for(let growth=0;growth<5;growth++) {
      const cost=beastAdvanceCost(species,growth),beforeStats=beastStats(s,pet.id),before=serialize(s);
      assert.equal(feedBeast(s,pet.id).ok,false);assert.equal(serialize(s),before);
      Object.assign(s.materials,cost);assert.equal(feedBeast(s,pet.id).ok,true);forms.add(beastForm(pet).id);
      assert.ok(beastStats(s,pet.id).attack>beforeStats.attack);assert.ok(beastStats(s,pet.id).maxHp>beforeStats.maxHp);
      assert.equal(pet.hp,0);assert.equal(pet.reviveAt,deadline);assert.equal(pet.level,1);
      for(const key of Object.keys(cost))assert.equal(s.materials[key],0);
    }
    assert.equal(forms.size,6);assert.equal(feedBeast(s,pet.id).ok,false);assert.ok(restore(serialize(s),s.lastTick));
  }
});

test('armed tamer deals full damage and buffs its pet; profession gear enforces ownership', () => {
  const s=newGame(1000);changeClass(s,'tamer');const pet=addPet(s);field(s,pet);durableEnemy(s);
  const before=beastStats(s,pet.id);s.heroCooldown=0;s.petCooldown=STEP_MS*2;s.enemyCooldown=STEP_MS*2;tick(s);
  assert.equal(s.event.type,'hero');assert.ok(s.event.amount>=10);assert.ok(s.petBuffMs>0);
  assert.ok(beastStats(s,pet.id).attack>before.attack);assert.ok(beastStats(s,pet.id).defense>before.defense);assert.ok(beastStats(s,pet.id).speed>before.speed);
  s.gold=10000;Object.assign(s.materials,gearMaterialCost(s,'weapon'));const attack=stats(s).attack;
  assert.equal(upgradeGear(s,'weapon').ok,true);assert.ok(stats(s).attack>attack);
  for(const gear of CLASS_GEAR) {
    const x=newGame(1000);const item={id:x.nextItemId++,slot:gear.slot,level:10,quality:2,affix:0,bossZone:-1,count:1,classGearId:gear.id};
    const owner=gear.heroClass==='knight'?'tamer':'knight';changeClass(x,owner);
    assert.equal(receiveItem(x,item),false);const unchanged=serialize(x);
    assert.equal(equipWarehouseItem(x,item.id).ok,false);assert.equal(serialize(x),unchanged);
    x.level=20;changeClass(x,gear.heroClass);assert.equal(equipWarehouseItem(x,item.id).ok,true);
    assert.equal(x.equipped[gear.slot].classGearId,gear.id);assert.ok(restore(serialize(x),x.lastTick));
  }
});

test('profession blueprints craft restricted gear with working effects and preserve them through saves', () => {
  for(const b of BLUEPRINTS.filter(b=>b.classGearId)) {
    const s=newGame(1000),gear=CLASS_GEAR.find(g=>g.id===b.classGearId);s.level=20;changeClass(s,gear.heroClass);
    s.blueprints.push(b.id);const cost=craftingCost(s,b);s.gold=cost.gold;s.inventory[b.ingredient]=cost.ingredient;Object.assign(s.materials,cost.materials);
    assert.equal(craft(s,b.id).ok,true);assert.equal(s.equipped[b.slot].classGearId,gear.id);
    for(const [key,n] of Object.entries(gear.stats))assert.ok(stats(s)[key]>=n);
    const copy=restore(serialize(s),s.lastTick);assert.ok(copy);assert.deepEqual(copy.equipped,s.equipped);
  }
});

test('automatic salvage protects profession gear by default, and class retreat stops automatic boss retries', () => {
  const s=newGame(1000), item={id:s.nextItemId++,slot:'weapon',level:1,quality:0,affix:0,bossZone:-1,count:1,classGearId:'tamer-whip'};
  s.autoSalvage={...DEFAULT_SALVAGE_RULE,enabled:true};
  assert.equal(matchesSalvageRule(s,item),false);receiveItem(s,item);assert.equal(s.warehouse.length,1);
  s.autoSalvage.includeSpecial=true;assert.equal(matchesSalvageRule(s,item),true);
  s.bossRooms[0]=true;s.autoBoss=true;enterBoss(s);changeClass(s,'tamer');
  assert.equal(s.autoBoss,false);assert.equal(s.inBoss,false);assert.equal(s.bossRooms[0],true);
});

test('pet skills affect damage, healing, mitigation, speed and reflection', () => {
  for(const skill of PET_SKILLS) {
    let triggered=false;
    for(let seed=1;seed<250&&!triggered;seed++) {
      const a=newGame(1000),pet=addPet(a);pet.skills=[skill.id];field(a,pet);durableEnemy(a);a.seed=seed;
      a.hp=50;pet.hp=50;a.heroCooldown=STEP_MS*2;a.petCooldown=0;a.enemyCooldown=STEP_MS*2;
      if(['guard','thorns'].includes(skill.id)){a.enemy.attack=30;a.enemyCooldown=0;a.petCooldown=STEP_MS*2;}
      const b=structuredClone(a);b.beasts[pet.id].skills=[];
      tick(a);tick(b);
      triggered=skill.id==='burst'?a.enemy.hp<b.enemy.hp:skill.id==='drain'||skill.id==='guard'?pet.hp>b.beasts[pet.id].hp:skill.id==='mend'?a.hp>b.hp:skill.id==='swift'?beastStats(a,pet.id).speed>beastStats(b,pet.id).speed:a.enemy.hp<b.enemy.hp;
    }
    assert.ok(triggered,skill.id);
  }
});

test('boss encounters are rarer and stronger; auto challenge is opt-in and stops after failure or retreat', () => {
  assert.equal(BOSS_DISCOVERY_KILLS,24);assert.equal(BOSS_DISCOVERY_CHANCE,.025);
  const s=newGame(1000);s.bossRooms[0]=true;s.phase='travel';s.wait=1;tick(s);assert.equal(s.inBoss,false);
  s.autoBoss=true;s.phase='travel';s.wait=1;tick(s);assert.equal(s.inBoss,true);assert.equal(s.enemy.maxHp,420);assert.equal(s.enemy.attack,26);
  assert.equal(travel(s,0).ok,true);assert.equal(s.autoBoss,false);assert.equal(s.bossRooms[0],true);
  s.autoBoss=true;enterBoss(s);s.hp=1;s.enemyCooldown=0;s.heroCooldown=STEP_MS*2;tick(s);
  assert.equal(s.phase,'rest');assert.equal(s.autoBoss,false);assert.equal(s.bossRooms[0],true);
  assert.ok(restore(serialize(s),s.lastTick));
});

test('boss heavy strikes and low-health rage measurably increase damage', () => {
  const base=newGame(1000);base.level=100;base.hp=stats(base).maxHp;base.bossRooms[0]=true;enterBoss(base);base.enemy.attack=100;base.seed=11;
  base.heroCooldown=STEP_MS*2;base.enemyCooldown=0;
  const normal=structuredClone(base),heavy=structuredClone(base),rage=structuredClone(base);
  heavy.round=4;rage.enemy.hp=Math.floor(rage.enemy.maxHp*.3);
  tick(normal);tick(heavy);tick(rage);
  assert.ok(heavy.hp<normal.hp);assert.ok(rage.hp<normal.hp);
});

test('campfire restores hero and all living pets once, without resurrecting dead pets', () => {
  const s=newGame(1000),pet=addPet(s),reserve=addPet(s,'slime'),dead=addPet(s,'herb');
  s.hp=20;pet.hp=10;reserve.hp=12;dead.hp=0;dead.reviveAt=1000+BEAST_REVIVE_MS;
  const before={kills:s.kills,xp:s.xp,gold:s.gold};s.phase='travel';s.wait=1;s.seed=1978;tick(s);
  assert.equal(s.journeyEvent.kind,'campfire');assert.ok(s.hp>20);assert.ok(pet.hp>10);assert.ok(reserve.hp>12);assert.equal(dead.hp,0);
  assert.deepEqual({kills:s.kills,xp:s.xp,gold:s.gold},before);
  s.running=false;const copy=restore(serialize(s),s.lastTick);assert.ok(copy);const health=Object.values(copy.beasts).map(p=>p.hp);
  advance(copy,5000);assert.deepEqual(Object.values(copy.beasts).map(p=>p.hp),health);assert.equal(copy.hp,s.hp);
});

test('talent branches enforce multiple prerequisites, level gates, and profession specialization', () => {
  assert.ok(TALENTS.length>=30);assert.equal(new Set(TALENTS.map(t=>t.branch)).size,5);
  const s=newGame(1000);s.level=100;
  assert.equal(upgradeTalent(s,'execution').ok,false);
  for(const id of ['might','precision','siphon','ferocity'])for(let i=0;i<3;i++)assert.equal(upgradeTalent(s,id).ok,true);
  assert.equal(upgradeTalent(s,'execution').ok,false);
  for(let i=0;i<3;i++)assert.equal(upgradeTalent(s,'bossHunter').ok,true);
  assert.equal(upgradeTalent(s,'execution').ok,true);assert.ok(stats(s).execute>0);
  assert.equal(upgradeTalent(s,'tamerTraining').ok,false);assert.equal(upgradeTalent(s,'knightTraining').ok,true);
  s.level=20;assert.equal(talentAvailable(s,TALENTS.find(t=>t.id==='execution')),false);
  s.level=100;assert.ok(restore(serialize(s),1000));
});

test('legacy contracts preserve growth, level and enhancement, migrate recovery once, and require manual replacement', () => {
  for(const version of [6,7]) {
    const s=newGame(1000);s.version=version;const pet=addPet(s,'mushroomKing','mushroomKing');
    pet.level=version===7?20:1;pet.growth=3;pet.rank=2;pet.crystals=9;pet.hp=0;
    pet.reviveAt=s.lastTick+(version===6?60:10)*60000;s.preferredBeast=pet.id;
    delete pet.traits;delete pet.skills;delete pet.species;
    const loaded=restore(serialize(s),1000);assert.ok(loaded);const migrated=loaded.beasts.mushroomKing;
    assert.equal(loaded.version,9);assert.equal(migrated.reviveAt,1000+BEAST_REVIVE_MS);
    assert.equal(migrated.growth,3);assert.equal(migrated.rank,2);assert.equal(migrated.crystals,9);assert.equal(migrated.level,pet.level);
    assert.equal(loaded.preferredBeast,null);assert.deepEqual(restore(serialize(loaded),1000),loaded);
  }
});

test('new save fields reject forged incubators, traits, skills, pet ids and wrong-class equipment', () => {
  const s=newGame(1000),pet=addPet(s);s.eggs.mushroom=1;startIncubation(s,'mushroom',1000);
  const mutations=[
    x=>x.eggs.mushroom=-1,x=>x.eggs.fake=1,x=>x.incubators[0].hatchAt--,
    x=>x.incubators.push({...x.incubators[0]}),x=>x.nextPetId=1,x=>x.petBuffMs=6001,
    x=>x.autoBoss='yes',x=>x.beasts[pet.id].traits.attack=121,x=>x.beasts[pet.id].skills=['fake'],
    x=>x.beasts[pet.id].skills=['guard','guard'],x=>x.beasts[pet.id].level=101,x=>x.beasts[pet.id].growth=6,
    x=>x.beasts[pet.id].hp=0,x=>x.activeBeast='missing',x=>x.preferredBeast='missing',
    x=>x.equipped.weapon={id:x.nextItemId++,slot:'weapon',level:1,quality:0,affix:0,bossZone:-1,count:1,classGearId:'tamer-whip'},
  ];
  assert.ok(restore(serialize(s),1000));
  for(const mutate of mutations){const copy=structuredClone(s);mutate(copy);assert.equal(restore(serialize(copy),1000),null,mutate.toString());}
});

test('foreground and offline simulation agree through summoning, buffs, hatching and deaths', () => {
  const a=newGame(1000);changeClass(a,'tamer');const pet=addPet(a);preferBeast(a,pet.id);a.eggs.slime=1;startIncubation(a,'slime',1000);
  const b=structuredClone(a),end=1000+PET_HATCH_MS+5000;
  for(let now=2000;now<end;now+=1000)advance(a,now);advance(a,end);advance(b,end);
  assert.deepEqual(a,b);assert.ok(restore(serialize(a),end));
});
