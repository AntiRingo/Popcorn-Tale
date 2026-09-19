// Item data stays compact in saves. Exact duplicates stack in the warehouse.
export const EQUIPMENT_SLOTS = [
  { id: 'weapon', name: '武器', starter: '餐叉长剑', icon: 'sword', bonus: '攻击 +4' },
  { id: 'shield', name: '防具', starter: '平底锅盾', icon: 'shield', bonus: '防御 +2' },
  { id: 'charm', name: '护符', starter: '玉米护符', icon: 'heart', bonus: '生命 +25' },
  { id: 'ring', name: '戒指', starter: '麦穗指环', icon: 'spark', bonus: '速度 +3' },
];
export const QUALITIES = [
  { name: '普通', color: '#7d8873', multiplier: 1 },
  { name: '精良', color: '#4f855b', multiplier: 1.4 },
  { name: '稀有', color: '#527ca1', multiplier: 2 },
  { name: '史诗', color: '#9461ad', multiplier: 2.8 },
  { name: '传说', color: '#af7b29', multiplier: 3.8 },
];
export const STAT_LABELS = { attack: '攻击', maxHp: '生命', defense: '防御', crit: '暴击', speed: '速度', luck: '幸运', dodge: '闪避', lifesteal: '生命偷取', critDamage: '暴击伤害', bossDamage: '首领伤害', damageReduction: '伤害减免', healing: '治疗效果', petAttack: '宠物攻击', petHp: '宠物生命', petDefense: '宠物防御', petSpeed: '宠物速度', petXp: '宠物经验', campHealing: '篝火恢复', xpBonus: '战斗经验', goldBonus: '金币收益', execute: '斩杀增伤', thorns: '反伤', buffPower: '鼓舞强度' };
export const PERCENT_STATS = ['crit', 'dodge', 'lifesteal', 'critDamage', 'bossDamage', 'damageReduction', 'healing', 'petAttack', 'petHp', 'petDefense', 'petXp', 'campHealing', 'xpBonus', 'goldBonus', 'execute', 'thorns', 'buffPower'];
export const CLASS_GEAR = [
  { id: 'knight-fork', heroClass: 'knight', slot: 'weapon', name: '守誓餐叉', effect: '格挡反击：受到攻击时反弹 15% 伤害', stats: { defense: 6, thorns: .15 } },
  { id: 'knight-plate', heroClass: 'knight', slot: 'shield', name: '黄油壁垒', effect: '坚壁：受到的伤害降低 12%', stats: { damageReduction: .12 } },
  { id: 'ranger-bow', heroClass: 'ranger', slot: 'weapon', name: '盐风长弓', effect: '鹰眼：暴击率 +8%，暴击伤害 +30%', stats: { crit: .08, critDamage: .3 } },
  { id: 'ranger-cloak', heroClass: 'ranger', slot: 'shield', name: '逐浪披风', effect: '疾行：速度 +20，闪避 +8%', stats: { speed: 20, dodge: .08 } },
  { id: 'mage-staff', heroClass: 'mage', slot: 'weapon', name: '焦糖星杖', effect: '破界：对首领造成的伤害提高 25%', stats: { bossDamage: .25 } },
  { id: 'mage-robe', heroClass: 'mage', slot: 'shield', name: '沸糖法袍', effect: '余烬：敌人低于 30% 生命时伤害提高 30%', stats: { execute: .3 } },
  { id: 'cleric-staff', heroClass: 'cleric', slot: 'weapon', name: '香草祈愿杖', effect: '祈愿：治疗效果提高 40%，宠物生命 +15%', stats: { healing: .4, petHp: .15 } },
  { id: 'cleric-vest', heroClass: 'cleric', slot: 'shield', name: '晨露祭衣', effect: '庇护：减伤 8%，篝火恢复额外 +10% 最大生命', stats: { damageReduction: .08, campHealing: .1 } },
  { id: 'tamer-whip', heroClass: 'tamer', slot: 'weapon', name: '共鸣驯兽鞭', effect: '共鸣：宠物攻击 +20%，鼓舞额外增加 15% 攻击', stats: { petAttack: .2, buffPower: .15 } },
  { id: 'tamer-coat', heroClass: 'tamer', slot: 'shield', name: '伙伴守护衣', effect: '同心：宠物生命 +25%，防御 +20%', stats: { petHp: .25, petDefense: .2 } },
];
export const classGear = item => CLASS_GEAR.find(g => g.id === item?.classGearId);
export const canEquip = (heroClass, item) => !item?.classGearId || classGear(item)?.heroClass === heroClass;
export const BOSS_PREFIXES = ['菇王', '盐晶', '黑椒', '焦糖', '烈焰', '香草'];
export const MATERIALS = [
  { id: 'ore', name: '餐具矿石', note: '打造武器与防具' },
  { id: 'thread', name: '玉米纤维', note: '编织护符与戒指' },
  { id: 'essence', name: '风味精华', note: '分解稀有及以上装备，用于高阶强化' },
  ...['黄油菌核', '盐晶王钳', '黑椒之心', '焦糖王印', '烈焰椒核', '香草灵种'].map((name, i) => ({ id: `boss${i}`, name, note: `${BOSS_PREFIXES[i]}首领专属` })),
];
export const TALENTS = [
  { id: 'might', name: '酥脆锋芒', branch: '锋芒', stat: 'attack', bonus: 3, max: 5 },
  { id: 'precision', name: '破壳一击', branch: '锋芒', stat: 'crit', bonus: .02, max: 5, parent: 'might', required: 3 },
  { id: 'siphon', name: '美味汲取', branch: '锋芒', stat: 'lifesteal', bonus: .02, max: 5, parent: 'precision', required: 3 },
  { id: 'vitality', name: '饱满生命', branch: '守护', stat: 'maxHp', bonus: 20, max: 5 },
  { id: 'resilience', name: '坚韧外壳', branch: '守护', stat: 'defense', bonus: 2, max: 5, parent: 'vitality', required: 3 },
  { id: 'evasion', name: '轻盈闪身', branch: '守护', stat: 'dodge', bonus: .02, max: 5, parent: 'resilience', required: 3 },
  { id: 'haste', name: '轻快步伐', branch: '奇遇', stat: 'speed', bonus: 6, max: 5 },
  { id: 'fortune', name: '幸运口袋', branch: '奇遇', stat: 'luck', bonus: 8, max: 5, parent: 'haste', required: 3 },
  { id: 'ferocity', name: '碎壳连击', branch: '锋芒', stat: 'critDamage', bonus: .08, max: 5, parent: 'precision', required: 3 },
  { id: 'bossHunter', name: '巨兽猎手', branch: '锋芒', stat: 'bossDamage', bonus: .06, max: 5, parent: 'siphon', required: 3, level: 15 },
  { id: 'execution', name: '终幕盛宴', branch: '锋芒', stat: 'execute', bonus: .12, max: 3, parents: ['ferocity', 'bossHunter'], required: 3, level: 25 },
  { id: 'bulwark', name: '不屈壁垒', branch: '守护', stat: 'damageReduction', bonus: .025, max: 5, parent: 'resilience', required: 3 },
  { id: 'renewal', name: '香气回流', branch: '守护', stat: 'healing', bonus: .08, max: 5, parent: 'evasion', required: 3, level: 15 },
  { id: 'retribution', name: '荆棘外壳', branch: '守护', stat: 'thorns', bonus: .08, max: 3, parents: ['bulwark', 'renewal'], required: 3, level: 25 },
  { id: 'scholar', name: '旅途心得', branch: '奇遇', stat: 'xpBonus', bonus: .04, max: 5, parent: 'haste', required: 3 },
  { id: 'prosperity', name: '满载而归', branch: '奇遇', stat: 'goldBonus', bonus: .06, max: 5, parent: 'fortune', required: 3 },
  { id: 'campcraft', name: '温暖余烬', branch: '奇遇', stat: 'campHealing', bonus: .04, max: 5, parent: 'scholar', required: 3 },
  { id: 'wayfarer', name: '风味大师', branch: '奇遇', stat: 'luck', bonus: 15, max: 3, parents: ['prosperity', 'campcraft'], required: 3, level: 25 },
  { id: 'bond', name: '并肩之约', branch: '羁绊', stat: 'petAttack', bonus: .05, max: 5 },
  { id: 'nurture', name: '细心照料', branch: '羁绊', stat: 'petHp', bonus: .06, max: 5, parent: 'bond', required: 3 },
  { id: 'training', name: '实战教学', branch: '羁绊', stat: 'petXp', bonus: .1, max: 5, parent: 'bond', required: 3 },
  { id: 'petArmor', name: '共生甲壳', branch: '羁绊', stat: 'petDefense', bonus: .08, max: 5, parent: 'nurture', required: 3 },
  { id: 'packHaste', name: '追风伙伴', branch: '羁绊', stat: 'petSpeed', bonus: 6, max: 5, parent: 'training', required: 3 },
  { id: 'soulBond', name: '灵魂共鸣', branch: '羁绊', stat: 'petAttack', bonus: .12, max: 3, parents: ['petArmor', 'packHaste'], required: 3, level: 25 },
  ...[
    ['knight', '盾墙训练', 'defense', 3, '骑士誓约', 'damageReduction', .04],
    ['ranger', '猎风训练', 'speed', 8, '百步穿杨', 'critDamage', .12],
    ['mage', '熬糖秘术', 'attack', 5, '星火燎原', 'bossDamage', .08],
    ['cleric', '香草祝福', 'healing', .1, '生命赞歌', 'petHp', .1],
    ['tamer', '鼓舞训练', 'buffPower', .05, '兽群领袖', 'petAttack', .1],
  ].flatMap(([heroClass, name, stat, bonus, master, masterStat, masterBonus]) => [
    { id: `${heroClass}Training`, name, branch: '专精', heroClass, stat, bonus, max: 5, level: 5 },
    { id: `${heroClass}Mastery`, name: master, branch: '专精', heroClass, stat: masterStat, bonus: masterBonus, max: 5, parent: `${heroClass}Training`, required: 3, level: 15 },
  ]),
];
export const BLUEPRINTS = [
  ...EQUIPMENT_SLOTS.map((slot, i) => ({ id: `craft-${slot.id}`, name: ['秘银餐叉', '坚果锅盾', '暖阳护符', '风语指环'][i], slot: slot.id, bossZone: -1, quality: 2, affix: i, ingredient: ['butter', 'salt', 'herb', 'pepper'][i] })),
  ...BOSS_PREFIXES.map((prefix, i) => ({ id: `boss-craft-${i}`, name: `${prefix}的${['王叉', '巨盾', '灵符', '王戒', '炎刃', '灵符'][i]}`, slot: ['weapon', 'shield', 'charm', 'ring', 'weapon', 'charm'][i], bossZone: i, quality: 3, affix: i % 4, ingredient: ['butter', 'salt', 'pepper', 'caramel', 'chili', 'herb'][i] })),
  ...CLASS_GEAR.map((gear, i) => ({ id: `class-craft-${gear.id}`, name: gear.name, slot: gear.slot, classGearId: gear.id, bossZone: -1, quality: 2, affix: i % 4, ingredient: ['butter', 'salt', 'caramel', 'herb', 'pepper'][Math.floor(i / 2)] })),
];
export function itemStats(item) {
  if (!item) return {};
  const power = (1 + item.level * .28) * QUALITIES[item.quality].multiplier;
  const result = item.slot === 'weapon' ? { attack: Math.round(power * 3) }
    : item.slot === 'shield' ? { defense: Math.round(power * 1.8), maxHp: Math.round(power * 5) }
    : item.slot === 'charm' ? { maxHp: Math.round(power * 14), luck: Math.round(power * 2) }
    : { speed: Math.round(power * 2), luck: Math.round(power * 3) };
  const affix = ['crit', 'dodge', 'lifesteal', 'luck'][item.affix];
  result[affix] = (result[affix] || 0) + (affix === 'luck' ? Math.round(power * 2) : Math.round(Math.min(.15, power * .004) * 1000) / 1000);
  if (item.bossZone >= 0) {
    const special = ['lifesteal', 'defense', 'crit', 'speed', 'attack', 'dodge'][item.bossZone];
    result[special] = (result[special] || 0) + (PERCENT_STATS.includes(special) ? .04 : Math.round(power * 2));
  }
  for (const [key, value] of Object.entries(classGear(item)?.stats || {})) result[key] = (result[key] || 0) + value;
  return result;
}
export function itemName(item) {
  if (classGear(item)) return classGear(item).name;
  const blueprint = BLUEPRINTS.find(b => b.id === item.blueprintId);
  if (blueprint) return blueprint.name;
  const slot = EQUIPMENT_SLOTS.find(x => x.id === item.slot);
  return `${item.bossZone >= 0 ? BOSS_PREFIXES[item.bossZone] + '·' : ['锐意', '轻盈', '汲取', '幸运'][item.affix] + '·'}${slot.starter}`;
}
export function itemScore(item) {
  const weights = { attack: 4, defense: 5, maxHp: .35, crit: 180, speed: 2, luck: 1.5, dodge: 220, lifesteal: 240 };
  return Math.round(Object.entries(itemStats(item)).reduce((sum, [key, value]) => sum + value * (weights[key] || 160), 0) * 10) / 10;
}
export const talentPoints = s => s.level - Object.values(s.talents).reduce((sum, rank) => sum + rank, 0);
export function talentAvailable(s, talent) {
  return talentPoints(s) > 0 && (s.talents[talent.id] || 0) < talent.max && talentUnlocked(s, talent);
}
export function talentUnlocked(s, talent) {
  return (!talent.heroClass || talent.heroClass === s.heroClass) && s.level >= (talent.level || 1) && (talent.parents || (talent.parent ? [talent.parent] : [])).every(id => (s.talents[id] || 0) >= talent.required);
}
export function craftingCost(s, blueprint) {
  const level = Math.min(40, Math.max(1, s.level));
  return { level, gold: 260 + level * 45, materials: { ore: 18 + Math.floor(level * 1.5), thread: 12 + Math.floor(level), ...(blueprint.bossZone >= 0 ? { [`boss${blueprint.bossZone}`]: 7, essence: 3 } : {}) }, ingredient: 12 + Math.floor(level / 4) };
}

export const FIELD_TASKS = {
  quarry: { name: '采集晶矿', duration: 5 * 60000, icon: 'spark', description: '小径旁露出一簇晶矿，花花停下来慢慢开采。', materials: { ore: 6, thread: 2 }, gold: 0 },
  repair: { name: '修复林间营地', duration: 5 * 60000, icon: 'shield', description: '修补风雨中的营地，旅人会留下谢礼。', materials: { ore: 3, thread: 6 }, gold: 45 },
  rescue: { name: '照料迷途精灵', duration: 5 * 60000, icon: 'heart', description: '为受伤的精灵包扎，守候它慢慢恢复精神。', materials: { essence: 2, thread: 4 }, gold: 0 },
};
export function fieldTaskRewards(task) {
  const definition = FIELD_TASKS[task.kind];
  return { gold: definition.gold * (task.zone + 1), materials: Object.fromEntries(Object.entries(definition.materials).map(([id, amount]) => [id, amount + (id === 'essence' ? Math.floor(task.zone / 2) : task.zone)])) };
}

export function salvageRewards(item) {
  const primary = ['weapon', 'shield'].includes(item.slot) ? 'ore' : 'thread';
  const secondary = primary === 'ore' ? 'thread' : 'ore';
  const amount = (item.quality + 1) * (1 + Math.floor(item.level / 10));
  return { [primary]: amount, [secondary]: Math.max(1, Math.floor(amount / 3)), ...(item.quality >= 2 ? { essence: item.quality - 1 } : {}), ...(item.bossZone >= 0 ? { [`boss${item.bossZone}`]: 1 } : {}) };
}
export const MAX_PENDING_ORDERS = 20;
export const DELIVERY_HISTORY_LIMIT = 20;
export const FLYER_REFRESH_MS = 30 * 60 * 1000;
export function flyerProducts(flyer) {
  const { level, zone, id } = flyer;
  const oreAmount = [6, 8, 10][(id - 1) % 3], threadAmount = [10, 6, 8][(id - 1) % 3];
  const weapon = id % 2 ? 'weapon' : 'shield', accessory = Math.floor((id - 1) / 2) % 2 ? 'charm' : 'ring';
  return [
    { id: 'ore', name: '餐具矿石包', price: oreAmount * (25 + zone * 5), delay: 120000, materials: { ore: oreAmount } },
    { id: 'thread', name: '玉米纤维包', price: threadAmount * (25 + zone * 5), delay: 120000, materials: { thread: threadAmount } },
    { id: 'essence', name: '风味精华瓶', price: 360 + zone * 60, delay: 300000, materials: { essence: 2 } },
    { id: 'weapon', name: weapon === 'weapon' ? '精良餐叉长剑' : '精良平底锅盾', price: 400 + level * 60, delay: 300000, item: { slot: weapon, level, quality: 1, affix: zone % 4, bossZone: -1 } },
    { id: 'accessory', name: accessory === 'ring' ? '稀有麦穗指环' : '稀有玉米护符', price: 650 + level * 80, delay: 600000, item: { slot: accessory, level, quality: 2, affix: (zone + 1) % 4, bossZone: -1 } },
  ];
}
export const orderProduct = order => flyerProducts({ id: order.flyerId, level: order.level, zone: order.zone }).find(p => p.id === order.productId);
export const DEFAULT_SALVAGE_RULE = { enabled: false, maxQuality: 1, maxLevel: 10, slots: ['weapon', 'shield', 'charm', 'ring'], includeSpecial: false };
export function validSalvageRule(rule) {
  return !!rule && typeof rule.enabled === 'boolean' && Number.isInteger(rule.maxQuality) && rule.maxQuality >= 0 && rule.maxQuality <= 4 && Number.isInteger(rule.maxLevel) && rule.maxLevel >= 1 && rule.maxLevel <= 100 && Array.isArray(rule.slots) && rule.slots.length > 0 && new Set(rule.slots).size === rule.slots.length && rule.slots.every(id => EQUIPMENT_SLOTS.some(s => s.id === id)) && typeof rule.includeSpecial === 'boolean';
}
export function matchesSalvageRule(s, item) {
  const rule = s.autoSalvage;
  return rule.enabled && !item.locked && item.quality <= rule.maxQuality && item.level <= rule.maxLevel && rule.slots.includes(item.slot) && (rule.includeSpecial || (item.bossZone < 0 && !item.blueprintId && !item.classGearId));
}
export const JOURNEY_EVENTS = {
  campfire: { name: '篝火营地', icon: 'heart', description: '在温暖的篝火旁休息，角色与所有存活宠物恢复 35% 最大生命；阵亡宠物仍需等待复活。' },
  cache: { name: '林间拾荒', icon: 'bag', description: '沿着香气寻找散落的物资，有时满载而归，有时空手而回。' },
  hazard: { name: '小径险情', icon: 'shield', description: '一阵落石打破了宁静，轻巧的身手也许能避开危险。' },
  flyer: { name: '收到传单', icon: 'book', description: '一张商店传单飘进背包，可以订购上面的商品，由邮差送到营地。' },
  spring: { name: '林间歇脚', icon: 'heart', description: '找一片柔软的草地坐下，让疲惫随着微风散去。' },
};
