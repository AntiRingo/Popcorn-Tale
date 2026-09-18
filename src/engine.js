import { EQUIPMENT_SLOTS, MATERIALS, TALENTS, BLUEPRINTS, itemStats, itemName, itemScore, talentAvailable, craftingCost, salvageRewards, flyerProducts, orderProduct, MAX_PENDING_ORDERS, DELIVERY_HISTORY_LIMIT, FLYER_REFRESH_MS, DEFAULT_SALVAGE_RULE, validSalvageRule, matchesSalvageRule, JOURNEY_EVENTS } from './progression.js';
import { FIELD_TASKS, fieldTaskRewards } from './progression.js';

export const SAVE_KEY = 'popcorn-tales-v1';
export const STEP_MS = 950;
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
export const REVIVE_MS = 10 * 60 * 1000;
export const BOSS_DISCOVERY_KILLS = 12;
export const JOURNEY_MIN_TICKS = 35;
export const JOURNEY_MAX_TICKS = 65;
export const JOURNEY_EVENT_CHANCE = .20;
export const JOURNEY_EVENT_TICKS = 5;
export const BEAST_REVIVE_MS = 60 * 60 * 1000;
export const SUMMON_MS = STEP_MS * 3;
export const BEAST_MAX_RANK = 20;
export const BOSS_MATURE_GROWTH = 3;
export const BOSS_MAX_GROWTH = 5;

export const INGREDIENTS = [
  { id: 'salt', name: '海盐', color: '#d4dcd4', description: '让原味变得不再平凡。' },
  { id: 'butter', name: '黄油', color: '#f0cb6c', description: '融化在舌尖的小小太阳。' },
  { id: 'pepper', name: '黑胡椒', color: '#88746b', description: '一点辛香，一点勇敢。' },
  { id: 'caramel', name: '焦糖', color: '#ca8753', description: '把旅途的苦，熬成甜。' },
  { id: 'chili', name: '辣椒', color: '#d76c53', description: '为冒险添一把火。' },
  { id: 'herb', name: '香草', color: '#8da677', description: '风里藏着森林的味道。' },
];
export const ZONES = [
  { name: '黄油森林', sub: 'BUTTERWOOD', title: '在黄油香气中醒来', description: '金色阳光穿过树叶，连风里都是黄油的香气。', ingredient: 'butter', enemies: ['mushroom', 'slime', 'bee'], boss: 'mushroomKing', color: '#779172', level: 1 },
  { name: '海盐海岸', sub: 'SALTWATER COAST', title: '海风带来一点咸', description: '拾起浪花里的晶莹，听盐粒讲述大海的故事。', ingredient: 'salt', enemies: ['slime', 'crab', 'bee'], boss: 'crabKing', color: '#799b9e', level: 4 },
  { name: '胡椒矿洞', sub: 'PEPPER HOLLOW', title: '深入辛香的秘密', description: '小心脚下，沉睡的胡椒石也会打喷嚏。', ingredient: 'pepper', enemies: ['pepper', 'bat', 'slime'], boss: 'pepperKing', color: '#79728a', level: 8 },
  { name: '焦糖丘陵', sub: 'CARAMEL HILLS', title: '把每一刻熬成甜', description: '糖浆汇成金色溪流，饼干骑士守护着古老配方。', ingredient: 'caramel', enemies: ['cookie', 'bee', 'mushroom'], boss: 'cookieKing', color: '#b88c66', level: 12 },
  { name: '辣椒火山', sub: 'CHILI VOLCANO', title: '热辣，才够尽兴', description: '红色火光里，一位勇士正在变得更加酥脆。', ingredient: 'chili', enemies: ['chili', 'bat', 'pepper'], boss: 'chiliKing', color: '#b16a59', level: 16 },
  { name: '香草秘境', sub: 'VANILLA SANCTUARY', title: '寻找属于自己的味道', description: '跨过最后一片花海，美味的答案就在这里。', ingredient: 'herb', enemies: ['herb', 'mushroom', 'bee'], boss: 'herbKing', color: '#8b9f7b', level: 20 },
];
export const MONSTERS = {
  mushroom: { name: '黄油小菇', description: '戴着黄油色小帽子，梦想成为一道配菜。', kind: 'mushroom' },
  slime: { name: '盐粒史莱姆', description: '一团软乎乎的海盐，走到哪里都亮晶晶。', kind: 'slime' },
  bee: { name: '蜂蜜飞虫', description: '把甜蜜装在口袋里，偶尔也会扎人。', kind: 'bee' },
  crab: { name: '海盐小蟹', description: '举着盐晶钳子，横着走才是它的浪漫。', kind: 'crab' },
  pepper: { name: '胡椒石怪', description: '表面沉默，内心辛辣。', kind: 'pepper' },
  bat: { name: '紫苏蝙蝠', description: '洞穴里的调香师，翅膀带着草本香。', kind: 'bat' },
  cookie: { name: '饼干卫兵', description: '虽然很酥，但从来不轻易认输。', kind: 'cookie' },
  chili: { name: '小辣椒精', description: '脾气比个头大，热情比脾气更大。', kind: 'chili' },
  herb: { name: '香草精灵', description: '森林最后一缕清香，化成了它的模样。', kind: 'herb' },
  mushroomKing: { name: '巨型黄油菇', description: '森林的守护者，帽子下藏着珍贵的黄油。', kind: 'mushroom', boss: true },
  crabKing: { name: '盐晶蟹王', description: '一对钳子能夹起整片海岸的味道。', kind: 'crab', boss: true },
  pepperKing: { name: '黑椒巨像', description: '古老矿洞中的辛香传说。', kind: 'pepper', boss: true },
  cookieKing: { name: '焦糖饼干王', description: '从烤箱到王座，它始终保持酥脆。', kind: 'cookie', boss: true },
  chiliKing: { name: '烈焰椒王', description: '它的喷嚏能点燃一整座火山。', kind: 'chili', boss: true },
  herbKing: { name: '香草贤者', description: '最好的调料，是一路走来的勇气。', kind: 'herb', boss: true },
};
export const CLASSES = [
  { id: 'knight', name: '黄油骑士', label: '均衡守护', level: 1, description: '手持餐叉与锅盖，稳稳接住每一次挑战。', attack: 1, defense: 1.25, hp: 1.15 },
  { id: 'ranger', name: '海盐游侠', label: '敏捷暴击', level: 4, description: '弓弦上的盐粒，是一闪而过的美味。', attack: 1.2, defense: 0.9, hp: 1 },
  { id: 'mage', name: '焦糖法师', label: '强力输出', level: 8, description: '挥动搅拌杖，让焦糖魔法沸腾起来。', attack: 1.4, defense: 0.75, hp: 0.9 },
  { id: 'cleric', name: '香草牧师', label: '回合治愈', level: 12, description: '用柔软的奶油与香草，为自己疗伤。', attack: 0.95, defense: 1.1, hp: 1.3 },
  { id: 'tamer', name: '驯兽师', label: '魔物契约', level: 1, description: '空手结契，让魔物伙伴守护旅途。首次转职结识黄油小菇。', attack: 1, defense: .85, hp: 1 },
];
export const RECIPES = [
  { id: 'butter', name: '经典黄油', note: '醇厚，是勇气的底味', stat: '攻击', bonus: 3 },
  { id: 'salt', name: '海盐之吻', note: '一点咸，刚刚好', stat: '生命', bonus: 20 },
  { id: 'pepper', name: '黑椒脆响', note: '让每一击都更有力', stat: '攻击', bonus: 5 },
  { id: 'caramel', name: '焦糖拥抱', note: '裹上温柔的金色铠甲', stat: '防御', bonus: 3 },
  { id: 'chili', name: '热辣心跳', note: '舌尖上的小小冒险', stat: '攻击', bonus: 7 },
  { id: 'herb', name: '香草晚风', note: '是森林，也是归途', stat: '生命', bonus: 35 },
];
export const ACHIEVEMENTS = [
  { id: 'first', name: '第一声脆响', description: '击败第一只美食魔物', goal: 1, metric: 'kills', reward: 40 },
  { id: 'gatherer', name: '口袋里的香气', description: '累计收集 30 份调料', goal: 30, metric: 'ingredients', reward: 100 },
  { id: 'hero', name: '越爆越强', description: '勇士达到 10 级', goal: 10, metric: 'level', reward: 200 },
  { id: 'hunter', name: '森林老朋友', description: '累计击败 100 只魔物', goal: 100, metric: 'kills', reward: 250 },
  { id: 'chef', name: '美味初体验', description: '研发 3 次风味配方', goal: 3, metric: 'recipes', reward: 150 },
  { id: 'traveler', name: '世界那么好吃', description: '解锁全部 6 个区域', goal: 6, metric: 'zones', reward: 500 },
];

const CLASS_FIELDS = ['level', 'xp', 'hp', 'gear', 'equipped', 'talents'];
function freshProfession() {
  return { level: 1, xp: 0, hp: 0, gear: Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, 0])), equipped: Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, null])), talents: {} };
}
export function classProgress(s, id) {
  if (id === s.heroClass) return Object.fromEntries(CLASS_FIELDS.map(key => [key, s[key]]));
  return s.professions[id] || freshProfession();
}
export const highestLevel = s => Math.max(s.level, ...Object.values(s.professions).map(p => p.level));
function stateForClass(s, id) { return id === s.heroClass ? s : { ...s, ...classProgress(s, id), heroClass: id }; }

export function stats(s) {
  const c = CLASSES.find(c => c.id === s.heroClass) || CLASSES[0];
  let attack = 12 + (s.level - 1) * 3 + (c.id === 'tamer' ? 0 : s.gear.weapon * 4);
  let defense = 3 + (s.level - 1) + s.gear.shield * 2;
  let maxHp = 100 + (s.level - 1) * 16 + s.gear.charm * 25;
  RECIPES.forEach(r => {
    const bonus = (s.recipes[r.id] || 0) * r.bonus;
    if (r.stat === '攻击') attack += bonus;
    if (r.stat === '防御') defense += bonus;
    if (r.stat === '生命') maxHp += bonus;
  });
  const result = { attack: Math.round(attack * c.attack), defense: Math.round(defense * c.defense), maxHp: Math.round(maxHp * c.hp), crit: c.id === 'ranger' ? .28 : .12, speed: 100 + (s.gear.ring || 0) * 3, luck: 0, dodge: 0, lifesteal: 0 };
  for (const [slot, item] of Object.entries(s.equipped || {})) {
    if (c.id === 'tamer' && slot === 'weapon') continue;
    for (const [key, value] of Object.entries(itemStats(item))) result[key] += value;
  }
  for (const talent of TALENTS) result[talent.stat] += (s.talents?.[talent.id] || 0) * talent.bonus;
  result.crit = Math.min(.8, result.crit);
  result.dodge = Math.min(.6, result.dodge);
  result.lifesteal = Math.min(.5, result.lifesteal);
  result.speed = Math.min(400, result.speed);
  return result;
}
export const xpNeeded = level => 90 + level * 60 + level * level * 12;
export const gearCost = (s, id) => Math.floor(200 * Math.pow(1.7, s.gear[id]));
export function gearMaterialCost(s, id) {
  const rank = s.gear[id], primary = ['weapon', 'shield'].includes(id) ? 'ore' : 'thread';
  return { [primary]: 10 + rank * 6 + rank * rank * 2, [primary === 'ore' ? 'thread' : 'ore']: 6 + rank * 4, ...(rank >= 5 ? { essence: (rank - 4) * 3 } : {}) };
}
export const recipeCost = (s, id) => 15 + (s.recipes[id] || 0) * 15;

export const beastName = id => MONSTERS[id]?.boss ? `${MONSTERS[id].name}宝宝` : MONSTERS[id]?.name || '未知契约兽';
export const contractChance = s => Math.min(.5, .2 + stats(s).luck * .001);
export const beastUpgradeCost = beast => 2 + beast.rank * 2;
export const beastReady = beast => !!beast && beast.hp > 0 && !beast.reviveAt && (!MONSTERS[beast.id].boss || beast.growth >= BOSS_MATURE_GROWTH);
export function beastStats(s, id) {
  const beast = s.beasts[id], st = stats(stateForClass(s, 'tamer')), boss = !!MONSTERS[id].boss;
  const scale = 1 + beast.rank * .12 + (boss ? beast.growth * .15 : 0);
  const sturdy = ['mushroom', 'crab', 'pepper'].includes(MONSTERS[id].kind);
  return { attack: Math.round((st.attack * (sturdy ? .7 : .84) + 3) * scale), maxHp: Math.round((st.maxHp * (sturdy ? .8 : .6) + 15) * scale), defense: Math.round((st.defense * .7 + (sturdy ? 2 : .7)) * scale), speed: st.speed, crit: st.crit, dodge: st.dodge, lifesteal: st.lifesteal };
}
export function bossFeedCost(id, growth) {
  const zone = ZONES.findIndex(z => z.boss === id);
  if (zone < 0 || growth >= BOSS_MAX_GROWTH) return null;
  const cost = { essence: 2 + growth * 2, [`boss${zone}`]: 1 + growth };
  if (growth >= BOSS_MATURE_GROWTH) {
    const other = (zone + 1) % ZONES.length;
    cost[`boss${other}`] = growth - 2;
  }
  return cost;
}
function grantBeast(s, id) {
  if (s.beasts[id]) {
    const amount = MONSTERS[id].boss ? 5 : 1;
    s.beasts[id].crystals += amount;
    addLog(s, `重复契约：${beastName(id)}晶体 +${amount}，可用于强化同种伙伴。`, 'loot');
  } else {
    s.beasts[id] = { id, rank: 0, growth: 0, crystals: 0, hp: 1, reviveAt: 0 };
    s.beasts[id].hp = beastStats(s, id).maxHp;
    s.preferredBeast ||= id;
    addLog(s, MONSTERS[id].boss ? `获得${beastName(id)}！在契约兽营地喂养稀有素材，成长至 3 阶即可出战。` : `与${beastName(id)}签订契约，新的伙伴加入了！`, 'level');
  }
  s.beastRevision++;
}
function nextBeast(s) {
  return [s.preferredBeast, ...Object.keys(s.beasts)].find(id => beastReady(s.beasts[id])) || null;
}
function prepareSummon(s) {
  if (s.heroClass !== 'tamer' || s.activeBeast || s.summonCooldown || !nextBeast(s)) return;
  s.summonCooldown = SUMMON_MS;
}
function recoverBeasts(s, now) {
  for (const beast of Object.values(s.beasts)) {
    if (!beast.reviveAt || beast.reviveAt > now) continue;
    beast.reviveAt = 0; beast.hp = beastStats(s, beast.id).maxHp; s.beastRevision++;
  }
}
export function preferBeast(s, id) {
  if (!Object.hasOwn(s.beasts, id)) return { ok: false, message: '尚未契约这只魔物。' };
  s.preferredBeast = id; s.beastRevision++;
  return { ok: true, message: '已设为优先伙伴；下次召唤时优先选择，休养中或未长大的伙伴会自动跳过。' };
}
export function upgradeBeast(s, id) {
  const beast = Object.hasOwn(s.beasts, id) && s.beasts[id];
  if (!beast || beast.rank >= BEAST_MAX_RANK) return { ok: false, message: '没有这只契约兽，或已经强化至上限。' };
  const cost = beastUpgradeCost(beast);
  if (beast.crystals < cost) return { ok: false, message: `需要 ${cost} 枚同种晶体，重复契约这只魔物即可获得。` };
  beast.crystals -= cost; beast.rank++; s.beastRevision++;
  return { ok: true, message: `${beastName(id)}强化至 +${beast.rank}，攻击、生命上限和防御提升。` };
}
export function feedBeast(s, id) {
  const beast = Object.hasOwn(s.beasts, id) && s.beasts[id];
  const cost = beast && bossFeedCost(id, beast.growth);
  if (!cost) return { ok: false, message: '只有未满成长阶数的 Boss 宝宝可以喂养。' };
  if (Object.entries(cost).some(([key, amount]) => s.materials[key] < amount)) return { ok: false, message: '稀有素材不足，击败首领或分解稀有装备继续收集。' };
  for (const [key, amount] of Object.entries(cost)) s.materials[key] -= amount;
  beast.growth++; s.beastRevision++;
  if (!beast.reviveAt && s.activeBeast !== id) beast.hp = beastStats(s, id).maxHp;
  return { ok: true, message: `${beastName(id)}成长至 ${beast.growth} 阶！${beast.growth === BOSS_MATURE_GROWTH ? '已经可以召唤出战。' : '继续陪伴它成长吧。'}` };
}

function random(s) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function addLog(s, text, type = 'normal') {
  s.logs.unshift({ text, type, time: s.lastTick });
  s.logs.length = Math.min(s.logs.length, 45);
}
function emit(s, type, amount = 0, extra = {}) {
  s.event = { id: (s.event?.id || 0) + 1, type, amount, ...extra };
}
export function spawnEnemy(s) {
  const zone = ZONES[s.zone];
  const boss = s.inBoss;
  const id = boss ? zone.boss : zone.enemies[(s.wave + s.lap) % zone.enemies.length];
  const strength = 1 + s.zone * 1.1 + Math.min(s.lap, 30) * 0.09;
  const maxHp = Math.round((boss ? 112 : 38 + s.wave * 5) * strength);
  s.enemy = { id, hp: maxHp, maxHp, attack: Math.round((boss ? 12 : 7) * strength), boss };
  s.discovered[id] ??= 0;
  s.phase = 'hero';
  s.wait = 0;
  s.journeyEvent = null;
  s.round = 1;
  s.heroCooldown = Math.round(STEP_MS * 100 / stats(s).speed);
  s.enemyCooldown = STEP_MS * 2;
  if (boss) addLog(s, `${MONSTERS[id].name}出现了！`, 'boss');
}
export function newGame(now = Date.now()) {
  const s = {
    version: 6, lastTick: now, seed: 87651, level: 1, xp: 0, gold: 120, hp: 115,
    heroClass: 'knight', zone: 0, unlockedZone: 0, wave: 0, lap: 0, kills: 0, totalIngredients: 0,
    inventory: Object.fromEntries(INGREDIENTS.map(i => [i.id, 0])), recipes: {},
    gear: { weapon: 0, shield: 0, charm: 0, ring: 0 }, running: true, speed: 1, autoTravel: true,
    equipped: { weapon: null, shield: null, charm: null, ring: null }, warehouse: [], nextItemId: 1,
    materials: Object.fromEntries(MATERIALS.map(m => [m.id, 0])), blueprints: [], talents: {},
    autoSalvage: { ...DEFAULT_SALVAGE_RULE, slots: [...DEFAULT_SALVAGE_RULE.slots] }, salvaged: 0, inventoryRevision: 0,
    journeyEvent: null, journeyCount: 0, flyer: null, nextFlyerId: 1,
    orders: [], nextOrderId: 1, shopRevision: 0,
    zoneKills: ZONES.map(() => 0), bossRooms: ZONES.map(() => false), inBoss: false,
    reviveAt: 0, deathLoss: null, heroCooldown: STEP_MS, enemyCooldown: STEP_MS * 2,
    beasts: {}, activeBeast: null, preferredBeast: null, summonCooldown: 0, beastRevision: 0,
    professions: {}, fieldTask: null,
    phase: 'hero', wait: 0, round: 1, enemy: null, discovered: {}, claimed: [], logs: [],
    questClaimed: [], sound: false, event: { id: 0, type: 'spawn' }, playedMs: 0,
  };
  spawnEnemy(s);
  addLog(s, '背上小锅盖，出发寻找世界上最美味的调料。', 'story');
  return s;
}
function gainXp(s, amount) {
  s.xp += amount;
  while (s.xp >= xpNeeded(s.level)) {
    s.xp -= xpNeeded(s.level);
    s.level++;
    s.hp = stats(s).maxHp;
    addLog(s, `升级啦！现在是 Lv.${s.level}，生命已恢复，天赋点 +1。`, 'level');
  }
}
function storeItem(s, item) {
  const same = s.warehouse.find(x => !!x.locked === !!item.locked && ['slot', 'level', 'quality', 'affix', 'bossZone', 'blueprintId'].every(key => x[key] === item[key]));
  if (same) same.count += item.count;
  else s.warehouse.push(item);
}
function grantMaterials(s, rewards, count = 1) {
  for (const [id, quantity] of Object.entries(rewards)) s.materials[id] += quantity * count;
}
function materialSummary(rewards, count = 1) {
  return Object.entries(rewards).map(([id, quantity]) => `${MATERIALS.find(m => m.id === id).name} +${quantity * count}`).join(' · ');
}
function recycleItem(s, item, count, automatic = false) {
  const rewards = salvageRewards(item);
  grantMaterials(s, rewards, count); s.salvaged += count; s.inventoryRevision++;
  addLog(s, `${automatic ? '自动分解' : '分解'}「${itemName(item)}」×${count}：${materialSummary(rewards, count)}`, 'loot');
  return rewards;
}
function keepSpare(s, item) {
  if (matchesSalvageRule(s, item)) recycleItem(s, item, item.count, true);
  else storeItem(s, item);
}
export function receiveItem(s, item) {
  const current = s.equipped[item.slot];
  const better = !(s.heroClass === 'tamer' && item.slot === 'weapon') && (!current || itemScore(item) > itemScore(current));
  if (better) {
    if (current) keepSpare(s, current);
    s.equipped[item.slot] = item;
    s.hp = Math.min(s.hp, stats(s).maxHp);
    for (const beast of Object.values(s.beasts)) beast.hp = Math.min(beast.hp, beastStats(s, beast.id).maxHp);
  } else keepSpare(s, item);
  s.inventoryRevision++;
  if (better || !matchesSalvageRule(s, item)) addLog(s, `${itemName(item)} · ${better ? '已自动装备，旧装备按仓库规则处理' : '已存入仓库'}。`, 'loot');
  return better;
}
function clampPartyHealth(s) {
  s.hp = Math.min(s.hp, stats(s).maxHp);
  for (const beast of Object.values(s.beasts)) beast.hp = Math.min(beast.hp, beastStats(s, beast.id).maxHp);
}
export function equipWarehouseItem(s, id) {
  const index = s.warehouse.findIndex(item => item.id === id), stored = s.warehouse[index];
  if (!stored) return { ok: false, message: '这件装备已不在共享仓库。' };
  if (s.heroClass === 'tamer' && stored.slot === 'weapon') return { ok: false, message: '驯兽师不能使用武器。' };
  const item = stored.count === 1 ? stored : { ...stored, id: s.nextItemId++, count: 1 };
  if (stored.count === 1) s.warehouse.splice(index, 1); else stored.count--;
  const old = s.equipped[item.slot];
  s.equipped[item.slot] = item;
  if (old) storeItem(s, old);
  clampPartyHealth(s); s.inventoryRevision++;
  return { ok: true, message: `已为${CLASSES.find(c => c.id === s.heroClass).name}装备${itemName(item)}，原装备放回共享仓库。` };
}
export function unequipItem(s, slot) {
  if (!EQUIPMENT_SLOTS.some(x => x.id === slot) || !s.equipped[slot]) return { ok: false, message: '这个栏位没有可存入仓库的装备。' };
  storeItem(s, s.equipped[slot]); s.equipped[slot] = null;
  clampPartyHealth(s); s.inventoryRevision++;
  return { ok: true, message: '装备已放回共享仓库，其他职业可以取用；栏位强化留在当前职业。' };
}
export function salvageItem(s, id, count = 1) {
  const index = s.warehouse.findIndex(item => item.id === id), item = s.warehouse[index];
  if (!item || item.locked || !Number.isSafeInteger(count) || count < 1 || count > item.count) return { ok: false, message: '只能分解仓库中未锁定的装备，数量不可超过库存。' };
  const rewards = recycleItem(s, item, count);
  item.count -= count; if (!item.count) s.warehouse.splice(index, 1);
  return { ok: true, message: `分解成功：${materialSummary(rewards, count)}` };
}
export function toggleItemLock(s, id) {
  const item = s.warehouse.find(item => item.id === id);
  if (!item) return { ok: false, message: '这件装备已不在仓库。' };
  item.locked = !item.locked; s.inventoryRevision++;
  return { ok: true, message: item.locked ? '已锁定这组装备，不会被分解。' : '已解除装备锁定。' };
}
export function setAutoSalvage(s, rule) {
  if (!validSalvageRule(rule)) return { ok: false, message: '请选择有效的品质、等级上限和至少一个装备部位。' };
  s.autoSalvage = { enabled: rule.enabled, maxQuality: rule.maxQuality, maxLevel: rule.maxLevel, slots: [...rule.slots], includeSpecial: rule.includeSpecial };
  return { ok: true, message: rule.enabled ? '规则已保存，将自动处理新入库装备；现有仓库可手动批量处理。' : '自动分解已关闭。' };
}
export function salvageMatching(s) {
  const matches = s.warehouse.filter(item => matchesSalvageRule(s, item));
  if (!matches.length) return { ok: false, message: '当前没有符合已启用规则的仓库装备。' };
  let count = 0;
  for (const item of matches) { count += item.count; salvageItem(s, item.id, item.count); }
  return { ok: true, message: `已分解 ${count} 件符合规则的装备，素材已入库。` };
}
export function lootChances(luck) {
  const value = Math.max(0, luck);
  return { equipment: Math.min(.9, .12 + value * .002), material: Math.min(.95, .30 + value * .002), blueprint: Math.min(.3, .05 + value * .0008), qualityBonus: Math.min(.32, value * .0015) };
}
function makeDrop(s, boss) {
  const roll = random(s) + lootChances(stats(s).luck).qualityBonus;
  const quality = boss ? (roll > .88 ? 4 : roll > .4 ? 3 : 2) : (roll > .97 ? 3 : roll > .8 ? 2 : roll > .45 ? 1 : 0);
  return { id: s.nextItemId++, slot: EQUIPMENT_SLOTS[Math.floor(random(s) * 4)].id, level: ZONES[s.zone].level + Math.min(15, Math.floor(s.level / 8)) + Math.floor(random(s) * 4), quality, affix: Math.floor(random(s) * 4), bossZone: boss ? s.zone : -1, count: 1 };
}
function learnBlueprint(s, id) {
  if (s.blueprints.includes(id)) { s.materials.ore += 2; return; }
  s.blueprints.push(id);
  addLog(s, `发现图纸「${BLUEPRINTS.find(b => b.id === id).name}」，可前往装备工坊制作。`, 'level');
}
function dropLoot(s, boss) {
  const chance = lootChances(stats(s).luck);
  if (boss || random(s) < chance.equipment) receiveItem(s, makeDrop(s, boss));
  if (boss || random(s) < chance.material) {
    const id = random(s) < .5 ? 'ore' : 'thread', quantity = boss ? 5 : 1 + Math.floor(random(s) * 2);
    s.materials[id] += quantity;
    addLog(s, `${MATERIALS.find(m => m.id === id).name} +${quantity}`, 'loot');
  }
  if (boss) {
    const quantity = 2 + Math.floor(random(s) * 3);
    s.materials[`boss${s.zone}`] += quantity;
    addLog(s, `${MATERIALS.find(m => m.id === `boss${s.zone}`).name} +${quantity} · 首领专属素材`, 'boss');
    learnBlueprint(s, `boss-craft-${s.zone}`);
  } else if (random(s) < chance.blueprint) {
    const unknown = BLUEPRINTS.filter(b => b.bossZone < 0 && !s.blueprints.includes(b.id));
    if (unknown.length) learnBlueprint(s, unknown[Math.floor(random(s) * unknown.length)].id);
    else s.materials.ore += 2;
  }
}
function defeatEnemy(s) {
  const enemy = s.enemy;
  const ingredient = ZONES[s.zone].ingredient;
  const quantity = enemy.boss ? 5 : 1 + (random(s) > 0.55 ? 1 : 0);
  const gold = Math.round((enemy.boss ? 45 : 10) * (1 + s.zone * 0.65));
  s.gold += gold;
  s.kills++;
  s.discovered[enemy.id] = (s.discovered[enemy.id] || 0) + 1;
  s.inventory[ingredient] += quantity;
  s.totalIngredients += quantity;
  gainXp(s, (enemy.boss ? 30 : 12) + s.zone * 8);
  addLog(s, `击败${MONSTERS[enemy.id].name}，${INGREDIENTS.find(i => i.id === ingredient).name} +${quantity} · 金币 +${gold}`, 'loot');
  dropLoot(s, enemy.boss);
  if (s.heroClass === 'tamer') {
    if (enemy.boss || random(s) < contractChance(s)) grantBeast(s, enemy.id);
    if (s.activeBeast) {
      const beast = s.beasts[s.activeBeast], maxHp = beastStats(s, beast.id).maxHp;
      beast.hp = Math.min(maxHp, beast.hp + Math.ceil(maxHp * .09));
    }
  }
  s.hp = Math.min(stats(s).maxHp, s.hp + Math.ceil(stats(s).maxHp * 0.09));
  if (enemy.boss) {
    s.inBoss = false;
    s.zoneKills[s.zone] = 0;
    if (s.zone === s.unlockedZone && s.zone < ZONES.length - 1) {
      s.unlockedZone++;
      addLog(s, `新旅途开启：${ZONES[s.unlockedZone].name}！`, 'level');
    }
    if (s.autoTravel && s.zone < s.unlockedZone && s.level >= ZONES[s.zone + 1].level) {
      s.zone++;
      s.lap = 0;
    } else s.lap++;
    s.wave = 0;
  } else {
    s.zoneKills[s.zone]++;
    if (!s.bossRooms[s.zone] && s.zoneKills[s.zone] >= BOSS_DISCOVERY_KILLS && random(s) < Math.min(.4, .14 + stats(s).luck * .001)) {
      s.bossRooms[s.zone] = true;
      addLog(s, `发现${ZONES[s.zone].name}的隐藏 Boss 房！准备好后手动进入挑战。`, 'boss');
    }
    s.wave = (s.wave + 1) % 5;
    if (s.wave === 0) {
      s.lap++;
      if (s.autoTravel && s.zone < s.unlockedZone && s.level >= ZONES[s.zone + 1].level) { s.zone++; s.lap = 0; }
    }
  }
  beginJourney(s);
  emit(s, 'victory', gold, { ingredient, quantity });
}
function beginJourney(s) {
  s.phase = 'travel'; s.journeyEvent = null;
  s.wait = JOURNEY_MIN_TICKS + Math.floor(random(s) * (JOURNEY_MAX_TICKS - JOURNEY_MIN_TICKS + 1));
}
function encounterEvent(s) {
  const roll = random(s), kind = roll < .3 ? 'cache' : roll < .5 ? 'hazard' : roll < .68 ? 'flyer' : roll < .8 ? 'spring' : 'task';
  s.journeyCount++;
  if (kind === 'task') {
    const taskKind = Object.keys(FIELD_TASKS)[Math.floor(random(s) * 3)], definition = FIELD_TASKS[taskKind];
    s.fieldTask = { kind: taskKind, zone: s.zone, startedAt: s.lastTick, finishAt: s.lastTick + definition.duration, completedAt: null };
    s.phase = 'task'; s.wait = 0; s.journeyEvent = null;
    addLog(s, `开始${definition.name}，需要现实时间 ${definition.duration / 60000} 分钟；完成后继续探索。`, 'story');
    emit(s, 'journey', 0, { kind: taskKind });
    return;
  }
  s.journeyEvent = { kind, zone: s.zone, materials: {}, damage: 0, healed: 0 };
  s.phase = 'event'; s.wait = JOURNEY_EVENT_TICKS;
  const st = stats(s), event = s.journeyEvent;
  if (kind === 'cache') {
    if (random(s) < Math.min(.95, .68 + st.luck * .001)) {
      event.materials = { [random(s) < .5 ? 'ore' : 'thread']: 2 + s.zone + Math.floor(random(s) * 4) };
      grantMaterials(s, event.materials);
      addLog(s, `林间拾荒：${materialSummary(event.materials)}。`, 'story');
    } else addLog(s, '林间拾荒：翻过落叶和空木箱，这次没有找到可用的素材。', 'story');
  } else if (kind === 'hazard') {
    event.damage = random(s) < st.dodge + .15 ? 0 : Math.min(s.hp, Math.ceil(st.maxHp * (.04 + random(s) * .06)));
    s.hp -= event.damage;
    addLog(s, event.damage ? `小径险情：被滚落的石块擦伤，生命 −${event.damage}。` : '小径险情：花花轻巧地避开了落石，毫发无伤。', 'story');
    if (!s.hp) { die(s); return; }
  } else if (kind === 'flyer') {
    if (!s.flyer) {
      s.flyer = { id: s.nextFlyerId++, zone: s.zone, level: Math.min(40, s.level), purchased: [], refreshAt: s.lastTick + FLYER_REFRESH_MS };
      s.shopRevision++;
    }
    addLog(s, '收到商店传单：可用金币订购素材和装备，邮差会按现实时间送达。传单已收好，继续冒险。', 'story');
  } else {
    event.healed = Math.min(st.maxHp - s.hp, Math.ceil(st.maxHp * .12)); s.hp += event.healed;
    addLog(s, `林间歇脚：恢复生命 ${event.healed}，又有力气出发了。`, 'story');
  }
  emit(s, 'journey', event.damage, { kind });
}
export function placeOrder(s, flyerId, productId, now = Date.now()) {
  const flyer = s.flyer, product = flyer && flyerProducts(flyer).find(p => p.id === productId);
  if (!flyer || flyer.id !== flyerId || !product || flyer.purchased.includes(productId) || now >= flyer.refreshAt) return { ok: false, message: '商品已订购或传单已更新，请查看当前传单。' };
  if (!Number.isSafeInteger(now) || now < s.lastTick) return { ok: false, message: '当前时间异常，请稍后重试。' };
  if (s.orders.filter(o => o.deliveredAt === null).length >= MAX_PENDING_ORDERS) return { ok: false, message: '配送中的订单已满，请等待邮差送达。' };
  if (s.gold < product.price) return { ok: false, message: '金币不足，继续冒险收集金币吧。' };
  s.gold -= product.price;
  flyer.purchased.push(productId);
  s.orders.push({ id: s.nextOrderId++, flyerId, productId, level: flyer.level, zone: flyer.zone, orderedAt: now, deliverAt: now + product.delay, deliveredAt: null });
  s.shopRevision++;
  addLog(s, `订购「${product.name}」，支付 ${product.price} 金币，现实时间 ${product.delay / 60000} 分钟后送达。`, 'story');
  return { ok: true, message: '订购成功，邮差送达后会自动入库。' };
}
export function discardFlyer(s, flyerId) {
  if (s.flyer?.id !== flyerId) return { ok: false, message: '这张传单已经收起。' };
  s.flyer = null; s.shopRevision++;
  return { ok: true, message: '已丢弃传单，已付款订单仍会正常送达。探索时有机会收到新传单。' };
}
export function settleDeliveries(s, now = Date.now()) {
  let delivered = 0;
  for (const order of s.orders.filter(o => o.deliveredAt === null && o.deliverAt <= now).sort((a, b) => a.deliverAt - b.deliverAt || a.id - b.id)) {
    const product = orderProduct(order), cursor = s.lastTick;
    s.lastTick = order.deliverAt;
    if (product.materials) grantMaterials(s, product.materials);
    if (product.item) receiveItem(s, { ...product.item, id: s.nextItemId++, count: 1, locked: true });
    order.deliveredAt = order.deliverAt;
    addLog(s, `订单 #${order.id} 已送达：${product.name}${product.materials ? `（${materialSummary(product.materials)}）` : '（装备已自动穿戴或锁定入库）'}。`, 'loot');
    s.lastTick = cursor;
    s.shopRevision++; delivered++;
  }
  if (delivered) {
    const history = s.orders.filter(o => o.deliveredAt !== null).sort((a, b) => b.deliveredAt - a.deliveredAt || b.id - a.id).slice(0, DELIVERY_HISTORY_LIMIT);
    const retained = new Set(history.map(o => o.id));
    s.orders = s.orders.filter(o => o.deliveredAt === null || retained.has(o.id));
  }
  return delivered;
}
export function settleRealTime(s, now = Date.now()) {
  const delivered = settleDeliveries(s, now);
  recoverBeasts(s, now);
  if (s.fieldTask && s.fieldTask.completedAt === null && s.fieldTask.finishAt <= now) {
    const task = s.fieldTask, rewards = fieldTaskRewards(task), cursor = s.lastTick;
    s.gold += rewards.gold; grantMaterials(s, rewards.materials);
    task.completedAt = task.finishAt;
    s.lastTick = task.finishAt;
    addLog(s, `${FIELD_TASKS[task.kind].name}完成：${materialSummary(rewards.materials)}${rewards.gold ? ` · 金币 +${rewards.gold}` : ''}。收拾行囊，继续探索。`, 'loot');
    s.lastTick = cursor;
    if (s.phase === 'task') beginJourney(s);
  }
  if (s.flyer && now >= s.flyer.refreshAt) {
    const rounds = Math.floor((now - s.flyer.refreshAt) / FLYER_REFRESH_MS) + 1;
    s.flyer = { id: s.nextFlyerId + rounds - 1, zone: s.zone, level: Math.min(40, s.level), purchased: [], refreshAt: s.flyer.refreshAt + rounds * FLYER_REFRESH_MS };
    s.nextFlyerId += rounds; s.shopRevision++;
  }
  return delivered;
}
function die(s) {
  const gold = Math.ceil(s.gold * .1), materials = {}, ingredients = {};
  s.gold -= gold;
  for (const [key, amount] of Object.entries(s.materials)) { materials[key] = Math.ceil(amount * .1); s.materials[key] -= materials[key]; }
  for (const [key, amount] of Object.entries(s.inventory)) { ingredients[key] = Math.ceil(amount * .1); s.inventory[key] -= ingredients[key]; }
  s.deathLoss = { gold, materials, ingredients };
  s.reviveAt = s.lastTick + REVIVE_MS;
  if (s.inBoss) s.bossRooms[s.zone] = true;
  s.inBoss = false;
  s.phase = 'rest';
  s.activeBeast = null; s.summonCooldown = 0;
  s.wait = 0;
  addLog(s, `花花倒下了，损失金币 ${gold} 与各类素材的 10%。装备、等级、强化与天赋保留，现实时间 10 分钟后复活。`, 'rest');
  emit(s, 'death');
}
function revive(s) {
  s.reviveAt = 0;
  s.hp = stats(s).maxHp;
  spawnEnemy(s);
  addLog(s, '花花已在营火旁复活，生命恢复；可继续探索或重新挑战 Boss。', 'level');
  emit(s, 'spawn');
}
function finishSummon(s) {
  s.activeBeast = nextBeast(s); s.summonCooldown = 0;
  if (s.activeBeast) {
    s.heroCooldown = STEP_MS; s.beastRevision++;
    addLog(s, `召唤${beastName(s.activeBeast)}出战，伙伴会优先承受敌人的攻击。`, 'story');
    emit(s, 'summon');
  }
}
export function tick(s) {
  if (s.phase === 'rest' || s.phase === 'task') return;
  prepareSummon(s);
  if (s.phase === 'travel' || s.phase === 'event') {
    if (s.summonCooldown) {
      s.summonCooldown = Math.max(0, s.summonCooldown - STEP_MS);
      if (!s.summonCooldown) finishSummon(s);
    }
    s.wait--;
    if (s.wait <= 0) {
      if (s.phase === 'event') beginJourney(s);
      else if (random(s) < JOURNEY_EVENT_CHANCE) encounterEvent(s);
      else { spawnEnemy(s); emit(s, 'spawn'); }
    }
    return;
  }
  // Summoning has its own clock. During the gap enemies keep attacking the tamer.
  let remaining = STEP_MS;
  const attackClock = () => s.heroClass === 'tamer' && !s.activeBeast ? Infinity : s.heroCooldown;
  const summonClock = () => s.summonCooldown || Infinity;
  while (remaining >= Math.min(attackClock(), s.enemyCooldown, summonClock())) {
    const delta = Math.min(attackClock(), s.enemyCooldown, summonClock());
    remaining -= delta;
    if (Number.isFinite(attackClock())) s.heroCooldown -= delta;
    s.enemyCooldown -= delta;
    const summoning = s.summonCooldown > 0;
    if (summoning) s.summonCooldown -= delta;
    if (summoning && !s.summonCooldown) { finishSummon(s); continue; }
    const beast = s.heroClass === 'tamer' && s.activeBeast ? s.beasts[s.activeBeast] : null;
    const st = beast ? beastStats(s, beast.id) : stats(s);
    if (attackClock() <= 0) {
      const crit = random(s) < st.crit;
      const damage = Math.min(s.enemy.hp, Math.round(st.attack * (.9 + random(s) * .2) * (crit ? 1.8 : 1)));
      s.enemy.hp -= damage;
      const healing = Math.round(damage * st.lifesteal);
      if (beast) beast.hp = Math.min(st.maxHp, beast.hp + healing);
      else s.hp = Math.min(st.maxHp, s.hp + healing + (s.heroClass === 'cleric' ? Math.ceil(st.maxHp * .045) : 0));
      emit(s, beast ? 'beast' : 'hero', damage, { crit, healing });
      s.heroCooldown = Math.round(STEP_MS * 2 * 100 / st.speed);
      if (!s.enemy.hp) { defeatEnemy(s); return; }
    } else {
      const dodged = random(s) < st.dodge;
      const damage = dodged ? 0 : Math.max(1, Math.round(s.enemy.attack * (.85 + random(s) * .3) - st.defense * .55));
      if (beast) {
        beast.hp = Math.max(0, beast.hp - damage);
        if (!beast.hp) {
          beast.reviveAt = s.lastTick + BEAST_REVIVE_MS;
          s.activeBeast = null; s.beastRevision++;
          addLog(s, `${beastName(beast.id)}倒下了，现实时间 1 小时后恢复。召唤期间花花会直接承受攻击。`, 'rest');
          prepareSummon(s);
        }
      } else s.hp = Math.max(0, s.hp - damage);
      emit(s, dodged ? 'dodge' : beast ? 'beast-hit' : 'enemy', damage, { target: beast ? 'beast' : 'hero' });
      s.enemyCooldown = STEP_MS * 2;
      s.round++;
      if (!s.hp) { die(s); return; }
    }
  }
  if (Number.isFinite(attackClock())) s.heroCooldown -= remaining;
  if (s.summonCooldown) s.summonCooldown -= remaining;
  s.enemyCooldown -= remaining;
  s.phase = attackClock() <= s.enemyCooldown ? 'hero' : 'enemy';
}
export function advance(s, now = Date.now()) {
  if (now < s.lastTick) return 0;
  if (!s.running) {
    if (s.phase === 'rest' && now >= s.reviveAt) {
      settleRealTime(s, s.reviveAt);
      s.lastTick = Math.max(s.lastTick, s.reviveAt); revive(s);
    }
    settleRealTime(s, now);
    s.lastTick = now;
    return 0;
  }
  if (now - s.lastTick > MAX_OFFLINE_MS) s.lastTick = now - MAX_OFFLINE_MS;
  settleRealTime(s, s.lastTick);
  const step = STEP_MS / s.speed;
  let count = 0;
  while (true) {
    if (s.phase === 'task') {
      if (s.fieldTask.finishAt > now) { s.lastTick = now; break; }
      s.lastTick = Math.max(s.lastTick, s.fieldTask.finishAt);
      settleRealTime(s, s.lastTick);
    }
    if (s.phase === 'rest') {
      if (s.reviveAt > now) { s.lastTick = now; break; }
      s.lastTick = Math.max(s.lastTick, s.reviveAt);
      settleRealTime(s, s.lastTick);
      revive(s);
    }
    if (s.lastTick + step > now) break;
    s.lastTick += step; settleRealTime(s, s.lastTick); tick(s); count++; s.playedMs += step;
  }
  settleRealTime(s, now);
  return count;
}
export function upgradeGear(s, id) {
  if (s.heroClass === 'tamer' && id === 'weapon') return { ok: false, message: '驯兽师以契约兽代替武器，请在契约兽营地使用晶体强化伙伴。' };
  if (!Object.hasOwn(s.gear, id)) return { ok: false, message: '没有这件装备。' };
  if (s.gear[id] >= 100) return { ok: false, message: '此栏位已强化至上限。' };
  const cost = gearCost(s, id);
  const materials = gearMaterialCost(s, id);
  if (s.gold < cost) return { ok: false, message: '金币还不够，再冒险一会儿吧。' };
  if (Object.entries(materials).some(([key, amount]) => s.materials[key] < amount)) return { ok: false, message: '强化素材不足，可以分解仓库装备或在旅途中收集。' };
  s.gold -= cost;
  for (const [key, amount] of Object.entries(materials)) s.materials[key] -= amount;
  s.gear[id]++;
  if (id === 'charm' && s.phase !== 'rest') s.hp = Math.min(stats(s).maxHp, s.hp + 25);
  return { ok: true, message: '强化成功！勇士变得更酥脆了。' };
}
export function cook(s, id) {
  if (!RECIPES.some(r => r.id === id)) return { ok: false, message: '没有找到配方。' };
  if ((s.recipes[id] || 0) >= 5) return { ok: false, message: '这个风味已经炉火纯青了。' };
  const cost = recipeCost(s, id);
  if (s.inventory[id] < cost) return { ok: false, message: `还需要 ${cost - s.inventory[id]} 份${INGREDIENTS.find(i => i.id === id).name}。` };
  s.inventory[id] -= cost;
  s.recipes[id] = (s.recipes[id] || 0) + 1;
  if (s.phase !== 'rest') s.hp = Math.min(stats(s).maxHp, s.hp + 20);
  addLog(s, `研发「${RECIPES.find(r => r.id === id).name}」Lv.${s.recipes[id]}，永久属性提升！`, 'level');
  return { ok: true, message: '美味升级！风味效果已永久生效。' };
}
export function travel(s, zone) {
  if (s.phase === 'task') return { ok: false, message: '正在处理旅途事务，完成后才能前往其他区域。' };
  if (s.phase === 'rest') return { ok: false, message: '花花正在等待复活，暂时无法旅行。' };
  if (!Number.isInteger(zone) || zone < 0 || zone > s.unlockedZone || !ZONES[zone]) return { ok: false, message: '击败前一区域的首领后解锁。' };
  if (s.inBoss) s.bossRooms[s.zone] = true;
  s.inBoss = false;
  s.zone = zone;
  s.wave = 0;
  s.lap = 0;
  beginJourney(s);
  emit(s, 'spawn');
  addLog(s, `抵达${ZONES[zone].name}。空气中有新的香气。`, 'story');
  return { ok: true, message: `下一站，${ZONES[zone].name}！` };
}
export function changeClass(s, id) {
  const c = CLASSES.find(c => c.id === id);
  if (!c || highestLevel(s) < c.level) return { ok: false, message: `任一职业达到 Lv.${c?.level || 1} 后解锁。` };
  if (s.heroClass === id) return { ok: true, message: `当前已经是${c.name}。` };
  s.professions[s.heroClass] = classProgress(s, s.heroClass);
  const incoming = s.professions[id] || freshProfession();
  delete s.professions[id];
  Object.assign(s, incoming);
  s.heroClass = id;
  s.hp = s.phase === 'rest' ? 0 : Math.min(stats(s).maxHp, s.hp || stats(s).maxHp);
  s.activeBeast = null; s.summonCooldown = 0;
  if (id === 'tamer') {
    if (!Object.keys(s.beasts).length) grantBeast(s, 'mushroom');
    if (s.phase !== 'rest') prepareSummon(s);
  }
  if (s.inBoss) s.bossRooms[s.zone] = true;
  s.inBoss = false;
  while (s.zone > 0 && ZONES[s.zone].level > s.level) s.zone--;
  if (!['rest', 'task'].includes(s.phase)) {
    s.wave = 0; s.lap = 0; beginJourney(s); emit(s, 'spawn');
  }
  s.inventoryRevision++;
  return { ok: true, message: `已切换为 Lv.${s.level} ${c.name}，恢复该职业的装备、强化与天赋。` };
}
export function enterBoss(s, zone = s.zone) {
  if (s.phase === 'task') return { ok: false, message: '请先完成当前旅途事务。' };
  if (s.phase === 'rest' || s.inBoss || !Number.isInteger(zone) || zone < 0 || zone > s.unlockedZone || !s.bossRooms[zone]) return { ok: false, message: '尚未发现可进入的 Boss 房，或当前无法挑战。' };
  if (zone !== s.zone) s.lap = 0;
  s.zone = zone; s.wave = 0; s.bossRooms[zone] = false; s.inBoss = true;
  spawnEnemy(s); emit(s, 'spawn');
  return { ok: true, message: `进入${MONSTERS[ZONES[zone].boss].name}的领地！` };
}
export function upgradeTalent(s, id) {
  const talent = TALENTS.find(t => t.id === id);
  if (!talent || !talentAvailable(s, talent)) return { ok: false, message: '天赋点不足、已达上限，或尚未满足前置天赋。' };
  s.talents[id] = (s.talents[id] || 0) + 1;
  if (talent.stat === 'maxHp' && s.phase !== 'rest') s.hp += talent.bonus;
  return { ok: true, message: `${talent.name}提升至 ${s.talents[id]} 级。` };
}
export function craft(s, id) {
  const blueprint = BLUEPRINTS.find(b => b.id === id);
  if (!blueprint || !s.blueprints.includes(id)) return { ok: false, message: '需要先从魔物身上找到这张图纸。' };
  const cost = craftingCost(s, blueprint);
  if (s.gold < cost.gold || s.inventory[blueprint.ingredient] < cost.ingredient || Object.entries(cost.materials).some(([key, quantity]) => s.materials[key] < quantity)) return { ok: false, message: '金币或素材不足，继续探索收集吧。' };
  s.gold -= cost.gold; s.inventory[blueprint.ingredient] -= cost.ingredient;
  for (const [key, quantity] of Object.entries(cost.materials)) s.materials[key] -= quantity;
  const previousSalvaged = s.salvaged;
  const equipped = receiveItem(s, { id: s.nextItemId++, slot: blueprint.slot, level: cost.level, quality: blueprint.quality, affix: blueprint.affix, bossZone: blueprint.bossZone, blueprintId: blueprint.id, count: 1 });
  return { ok: true, message: `制作成功！${equipped ? '已自动装备更好的装备。' : s.salvaged > previousSalvaged ? '成品已按自动分解规则转为素材。' : '装备已放入仓库。'}` };
}
export function achievementProgress(s, a) {
  return ({ kills: s.kills, ingredients: s.totalIngredients, level: highestLevel(s), recipes: Object.values(s.recipes).reduce((a, b) => a + b, 0), zones: s.unlockedZone + 1 })[a.metric] || 0;
}
export function claimAchievement(s, id) {
  const a = ACHIEVEMENTS.find(a => a.id === id);
  if (!a || s.claimed.includes(id) || achievementProgress(s, a) < a.goal) return { ok: false, message: '这枚徽章还在旅途前方等你。' };
  s.claimed.push(id);
  s.gold += a.reward;
  return { ok: true, message: `获得「${a.name}」徽章，金币 +${a.reward}！` };
}
export function serialize(s) { return JSON.stringify(s); }
export function restore(raw, now = Date.now()) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || ![1, 2, 3, 4, 5, 6].includes(parsed.version) || !Number.isFinite(parsed.lastTick) || parsed.lastTick < 0 || !Number.isInteger(parsed.level) || parsed.level < 1 || parsed.level > 100000 || !Number.isInteger(parsed.zone) || !ZONES[parsed.zone]) return null;
    const s = { ...newGame(now), ...parsed };
    if (parsed.version === 1) {
      s.gear = { ...s.gear, ring: 0 };
      s.wave %= 5;
      s.inBoss = false;
      if (s.phase === 'rest') { s.hp = 0; s.wait = 0; s.reviveAt = Math.min(now, s.lastTick) + REVIVE_MS; }
      else if (s.enemy?.boss) spawnEnemy(s);
      else if (s.phase === 'enemy') { s.heroCooldown = STEP_MS * 2; s.enemyCooldown = STEP_MS; }
    }
    if (parsed.version < 3) {
      s.version = 3;
      if (s.materials && !Array.isArray(s.materials)) s.materials.essence = 0;
      if (s.deathLoss?.materials) s.deathLoss.materials.essence = 0;
      s.autoSalvage = { ...DEFAULT_SALVAGE_RULE, slots: [...DEFAULT_SALVAGE_RULE.slots] };
      s.salvaged = 0; s.inventoryRevision = 0; s.journeyEvent = null; s.journeyCount = 0; s.tradeOffer = null; s.nextTradeId = 1;
      if (s.phase === 'travel') s.wait = Math.max(JOURNEY_MIN_TICKS, s.wait);
    }
    if (parsed.version < 4) {
      if (!Number.isSafeInteger(s.nextTradeId) || s.nextTradeId < 1 || (s.tradeOffer !== null && (!s.tradeOffer || !Number.isSafeInteger(s.tradeOffer.id) || s.tradeOffer.id < 1 || s.tradeOffer.id >= s.nextTradeId || !Number.isInteger(s.tradeOffer.zone) || s.tradeOffer.zone < 0 || s.tradeOffer.zone > s.unlockedZone))) return null;
      s.version = 4;
      s.flyer = s.tradeOffer ? { ...s.tradeOffer, level: Math.min(40, s.level), purchased: [], refreshAt: now + FLYER_REFRESH_MS } : null;
      s.nextFlyerId = s.nextTradeId;
      s.orders = []; s.nextOrderId = 1; s.shopRevision = 0;
      if (s.journeyEvent?.kind === 'merchant') s.journeyEvent.kind = 'flyer';
    }
    delete s.tradeOffer; delete s.nextTradeId;
    if (parsed.version < 5) {
      s.version = 5; s.beasts = {}; s.activeBeast = null; s.preferredBeast = null; s.summonCooldown = 0; s.beastRevision = 0;
    }
    if (parsed.version < 6) {
      s.version = 6; s.professions = {}; s.fieldTask = null;
      if (s.phase === 'travel') s.wait = Math.max(JOURNEY_MIN_TICKS, s.wait);
    }
    for (const k of ['gold', 'xp', 'hp', 'kills', 'totalIngredients', 'lap', 'playedMs']) if (!Number.isSafeInteger(s[k]) || s[k] < 0) return null;
    if (s.xp >= xpNeeded(s.level) || !Number.isInteger(s.seed) || s.seed < 0 || s.seed > 4294967295 || typeof s.running !== 'boolean' || typeof s.autoTravel !== 'boolean' || typeof s.sound !== 'boolean') return null;
    if (![1, 2].includes(s.speed) || !['hero', 'enemy', 'travel', 'rest', 'event', 'task'].includes(s.phase) || !CLASSES.some(c => c.id === s.heroClass)) return null;
    if (!Number.isInteger(s.wait) || s.wait < 0 || s.wait > JOURNEY_MAX_TICKS || (s.phase === 'event' && (s.wait < 1 || s.wait > JOURNEY_EVENT_TICKS)) || !Number.isSafeInteger(s.round) || s.round < 1) return null;
    if (!Number.isInteger(s.unlockedZone) || s.unlockedZone < s.zone || s.unlockedZone >= ZONES.length || !Number.isInteger(s.wave) || s.wave < 0 || s.wave > 5) return null;
    if (!s.enemy || !Object.hasOwn(MONSTERS,s.enemy.id) || !Number.isSafeInteger(s.enemy.hp) || !Number.isSafeInteger(s.enemy.maxHp) || !Number.isSafeInteger(s.enemy.attack) || s.enemy.hp < 0 || s.enemy.maxHp < 1 || s.enemy.hp > s.enemy.maxHp || s.enemy.attack < 1 || typeof s.enemy.boss !== 'boolean') return null;
    for (const { id } of EQUIPMENT_SLOTS) if (!Number.isInteger(s.gear?.[id]) || s.gear[id] < 0 || s.gear[id] > 100) return null;
    const record = value => value && typeof value === 'object' && !Array.isArray(value);
    const nonnegative = value => Number.isSafeInteger(value) && value >= 0;
    if (!record(s.professions) || Object.entries(s.professions).some(([id, p]) => id === s.heroClass || !CLASSES.some(c => c.id === id) || !record(p) || Object.keys(p).some(key => !CLASS_FIELDS.includes(key)) || !Number.isInteger(p.level) || p.level < 1 || p.level > 100000 || !nonnegative(p.xp) || p.xp >= xpNeeded(p.level) || !nonnegative(p.hp))) return null;
    if (s.fieldTask !== null) {
      const task = s.fieldTask;
      if (!record(task) || !Object.hasOwn(FIELD_TASKS, task.kind) || !Number.isInteger(task.zone) || task.zone < 0 || task.zone > s.unlockedZone || !nonnegative(task.startedAt) || task.startedAt > s.lastTick || !nonnegative(task.finishAt) || task.finishAt !== task.startedAt + FIELD_TASKS[task.kind].duration || (task.completedAt !== null && task.completedAt !== task.finishAt)) return null;
    }
    if ((s.phase === 'task') !== (s.fieldTask !== null && s.fieldTask.completedAt === null)) return null;
    if (!validSalvageRule(s.autoSalvage) || ['salvaged', 'inventoryRevision', 'journeyCount', 'shopRevision'].some(key => !nonnegative(s[key])) || !Number.isSafeInteger(s.nextFlyerId) || s.nextFlyerId < 1 || !Number.isSafeInteger(s.nextOrderId) || s.nextOrderId < 1) return null;
    if (s.journeyEvent !== null && (!record(s.journeyEvent) || !Object.hasOwn(JOURNEY_EVENTS, s.journeyEvent.kind) || !Number.isInteger(s.journeyEvent.zone) || s.journeyEvent.zone < 0 || s.journeyEvent.zone > s.unlockedZone || !nonnegative(s.journeyEvent.damage) || !nonnegative(s.journeyEvent.healed) || !record(s.journeyEvent.materials) || Object.entries(s.journeyEvent.materials).some(([id, n]) => !['ore', 'thread'].includes(id) || !nonnegative(n)))) return null;
    if (s.phase === 'event' && !s.journeyEvent) return null;
    const validFlyer = f => record(f) && Number.isSafeInteger(f.id) && f.id >= 1 && f.id < s.nextFlyerId && Number.isInteger(f.zone) && f.zone >= 0 && f.zone <= s.unlockedZone && Number.isInteger(f.level) && f.level >= 1 && f.level <= Math.min(40, highestLevel(s));
    if (s.flyer !== null && (!validFlyer(s.flyer) || !Number.isSafeInteger(s.flyer.refreshAt) || s.flyer.refreshAt < FLYER_REFRESH_MS || !Array.isArray(s.flyer.purchased) || new Set(s.flyer.purchased).size !== s.flyer.purchased.length || s.flyer.purchased.some(id => !flyerProducts(s.flyer).some(p => p.id === id)))) return null;
    if (!Array.isArray(s.orders) || s.orders.length > MAX_PENDING_ORDERS + DELIVERY_HISTORY_LIMIT) return null;
    const orderIds = new Set(), purchases = new Set();
    let pendingCount = 0, historyCount = 0;
    for (const order of s.orders) {
      if (!record(order) || !Number.isSafeInteger(order.id) || order.id < 1 || order.id >= s.nextOrderId || orderIds.has(order.id) || !validFlyer({ id: order.flyerId, zone: order.zone, level: order.level })) return null;
      const product = orderProduct(order), purchase = `${order.flyerId}:${order.productId}`;
      if (!product || purchases.has(purchase) || !nonnegative(order.orderedAt) || !nonnegative(order.deliverAt) || order.deliverAt !== order.orderedAt + product.delay || (order.deliveredAt !== null && order.deliveredAt !== order.deliverAt)) return null;
      if (s.flyer?.id === order.flyerId && (order.level !== s.flyer.level || order.zone !== s.flyer.zone || !s.flyer.purchased.includes(order.productId))) return null;
      orderIds.add(order.id); purchases.add(purchase);
      if (order.deliveredAt === null) pendingCount++; else historyCount++;
    }
    if (pendingCount > MAX_PENDING_ORDERS || historyCount > DELIVERY_HISTORY_LIMIT) return null;
    if (!record(s.materials) || MATERIALS.some(m => !nonnegative(s.materials[m.id])) || Object.keys(s.materials).some(id => !MATERIALS.some(m => m.id === id))) return null;
    const validTalents = p => record(p.talents) && !Object.entries(p.talents).some(([id, rank]) => { const t = TALENTS.find(x => x.id === id); return !t || !nonnegative(rank) || rank > t.max || (rank > 0 && t.parent && (p.talents[t.parent] || 0) < t.required); }) && Object.values(p.talents).reduce((a, b) => a + b, 0) <= p.level;
    if (!validTalents(s)) return null;
    if (!Array.isArray(s.blueprints) || new Set(s.blueprints).size !== s.blueprints.length || s.blueprints.some(id => !BLUEPRINTS.some(b => b.id === id))) return null;
    if (!Array.isArray(s.zoneKills) || s.zoneKills.length !== ZONES.length || s.zoneKills.some(n => !nonnegative(n)) || !Array.isArray(s.bossRooms) || s.bossRooms.length !== ZONES.length || s.bossRooms.some((value, i) => typeof value !== 'boolean' || (value && i > s.unlockedZone))) return null;
    if (typeof s.inBoss !== 'boolean' || (s.inBoss && (s.enemy.id !== ZONES[s.zone].boss || !s.enemy.boss || !['hero', 'enemy'].includes(s.phase)))) return null;
    if (['hero', 'enemy'].includes(s.phase) && (s.enemy.boss !== s.inBoss || s.enemy.hp === 0)) return null;
    if (!nonnegative(s.heroCooldown) || s.heroCooldown > STEP_MS * 2 || !nonnegative(s.enemyCooldown) || s.enemyCooldown > STEP_MS * 2) return null;
    if (!Number.isFinite(s.reviveAt) || s.reviveAt < 0 || (s.phase === 'rest' ? s.hp !== 0 || s.reviveAt <= 0 || s.reviveAt > s.lastTick + REVIVE_MS : s.reviveAt !== 0 || s.hp === 0)) return null;
    if (s.deathLoss !== null && (!record(s.deathLoss) || !nonnegative(s.deathLoss.gold) || !record(s.deathLoss.materials) || !record(s.deathLoss.ingredients) || MATERIALS.some(m => !nonnegative(s.deathLoss.materials[m.id])) || INGREDIENTS.some(m => !nonnegative(s.deathLoss.ingredients[m.id])))) return null;
    const ids = new Set();
    const validItem = item => {
      if (!record(item) || !Number.isSafeInteger(item.id) || item.id < 1 || ids.has(item.id) || !EQUIPMENT_SLOTS.some(slot => slot.id === item.slot) || !Number.isInteger(item.level) || item.level < 1 || item.level > 100 || !Number.isInteger(item.quality) || item.quality < 0 || item.quality > 4 || !Number.isInteger(item.affix) || item.affix < 0 || item.affix > 3 || !Number.isInteger(item.bossZone) || item.bossZone < -1 || item.bossZone >= ZONES.length || !Number.isSafeInteger(item.count) || item.count < 1) return false;
      if (item.blueprintId !== undefined && !BLUEPRINTS.some(b => b.id === item.blueprintId && b.slot === item.slot && b.bossZone === item.bossZone && b.quality === item.quality && b.affix === item.affix)) return false;
      if (item.locked !== undefined && typeof item.locked !== 'boolean') return false;
      ids.add(item.id); return true;
    };
    if (!record(s.equipped) || !Array.isArray(s.warehouse) || EQUIPMENT_SLOTS.some(slot => { const item = s.equipped[slot.id]; return item !== null && (!validItem(item) || item.slot !== slot.id || item.count !== 1); }) || s.warehouse.some(item => !validItem(item)) || !Number.isSafeInteger(s.nextItemId) || s.nextItemId < 1 || [...ids].some(id => id >= s.nextItemId)) return null;
    if (!s.recipes || typeof s.recipes !== 'object' || Array.isArray(s.recipes)) return null;
    for (const { id } of INGREDIENTS) if (!Number.isInteger(s.inventory?.[id]) || s.inventory[id] < 0 || (s.recipes?.[id] !== undefined && (!Number.isInteger(s.recipes[id]) || s.recipes[id] < 0 || s.recipes[id] > 5))) return null;
    s.inventory = Object.fromEntries(INGREDIENTS.map(i => [i.id, s.inventory[i.id]]));
    s.gear = Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, s.gear[slot.id]]));
    s.equipped = Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, s.equipped[slot.id]]));
    for (const [id, p] of Object.entries(s.professions)) {
      if (!record(p.gear) || !record(p.equipped) || !validTalents(p) || EQUIPMENT_SLOTS.some(slot => !Number.isInteger(p.gear[slot.id]) || p.gear[slot.id] < 0 || p.gear[slot.id] > 100 || (p.equipped[slot.id] !== null && (!validItem(p.equipped[slot.id]) || p.equipped[slot.id].slot !== slot.id || p.equipped[slot.id].count !== 1)))) return null;
      if ((id === 'tamer' && p.equipped.weapon !== null) || p.hp > stats(stateForClass(s, id)).maxHp) return null;
      p.gear = Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, p.gear[slot.id]]));
      p.equipped = Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, p.equipped[slot.id]]));
    }
    if ([...ids].some(id => id >= s.nextItemId)) return null;
    if (!record(s.beasts) || !nonnegative(s.beastRevision) || !nonnegative(s.summonCooldown) || s.summonCooldown > SUMMON_MS) return null;
    for (const [id, beast] of Object.entries(s.beasts)) {
      if (!Object.hasOwn(MONSTERS, id) || !record(beast) || beast.id !== id || !nonnegative(beast.rank) || beast.rank > BEAST_MAX_RANK || !nonnegative(beast.growth) || beast.growth > BOSS_MAX_GROWTH || (!MONSTERS[id].boss && beast.growth !== 0) || !nonnegative(beast.crystals) || !nonnegative(beast.hp) || !nonnegative(beast.reviveAt)) return null;
      if (parsed.version < 6) beast.hp = Math.min(beast.hp, beastStats(s, id).maxHp);
      if (beast.hp > beastStats(s, id).maxHp || (beast.reviveAt ? beast.hp !== 0 || beast.reviveAt > s.lastTick + BEAST_REVIVE_MS : beast.hp === 0)) return null;
    }
    if (s.preferredBeast !== null && !Object.hasOwn(s.beasts, s.preferredBeast)) return null;
    if (s.activeBeast !== null && (!Object.hasOwn(s.beasts, s.activeBeast) || !beastReady(s.beasts[s.activeBeast]) || s.summonCooldown > 0)) return null;
    if ((s.heroClass !== 'tamer' || s.phase === 'rest') && (s.activeBeast !== null || s.summonCooldown !== 0)) return null;
    if (s.heroClass === 'tamer' && (s.equipped.weapon !== null || !Object.keys(s.beasts).length)) return null;
    if (s.hp > stats(s).maxHp || !Array.isArray(s.claimed) || !Array.isArray(s.logs) || !s.discovered || typeof s.discovered !== 'object' || Array.isArray(s.discovered)) return null;
    s.claimed = s.claimed.filter(id => ACHIEVEMENTS.some(a => a.id === id));
    s.discovered = Object.fromEntries(Object.entries(s.discovered).filter(([id,n]) => Object.hasOwn(MONSTERS,id) && Number.isSafeInteger(n) && n >= 0));
    s.recipes = Object.fromEntries(RECIPES.filter(r => s.recipes[r.id] !== undefined).map(r => [r.id,s.recipes[r.id]]));
    s.logs = s.logs.filter(x => typeof x?.text === 'string' && Number.isFinite(x.time)).slice(0, 45).map(x => ({ text:x.text.slice(0,300), time:x.time, type:['normal','boss','story','level','loot','rest'].includes(x.type) ? x.type : 'normal' }));
    if (!s.event || !Number.isSafeInteger(s.event.id) || s.event.id < 0) s.event = { id:0, type:'spawn' };
    s.lastTick = Math.min(s.lastTick, now);
    return s;
  } catch { return null; }
}
