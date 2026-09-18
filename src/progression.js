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
export const STAT_LABELS = { attack: '攻击', maxHp: '生命', defense: '防御', crit: '暴击', speed: '速度', luck: '幸运', dodge: '闪避', lifesteal: '生命偷取' };
export const PERCENT_STATS = ['crit', 'dodge', 'lifesteal'];
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
];
export const BLUEPRINTS = [
  ...EQUIPMENT_SLOTS.map((slot, i) => ({ id: `craft-${slot.id}`, name: ['秘银餐叉', '坚果锅盾', '暖阳护符', '风语指环'][i], slot: slot.id, bossZone: -1, quality: 2, affix: i, ingredient: ['butter', 'salt', 'herb', 'pepper'][i] })),
  ...BOSS_PREFIXES.map((prefix, i) => ({ id: `boss-craft-${i}`, name: `${prefix}的${['王叉', '巨盾', '灵符', '王戒', '炎刃', '灵符'][i]}`, slot: ['weapon', 'shield', 'charm', 'ring', 'weapon', 'charm'][i], bossZone: i, quality: 3, affix: i % 4, ingredient: ['butter', 'salt', 'pepper', 'caramel', 'chili', 'herb'][i] })),
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
  return result;
}
export function itemName(item) {
  const blueprint = BLUEPRINTS.find(b => b.id === item.blueprintId);
  if (blueprint) return blueprint.name;
  const slot = EQUIPMENT_SLOTS.find(x => x.id === item.slot);
  return `${item.bossZone >= 0 ? BOSS_PREFIXES[item.bossZone] + '·' : ['锐意', '轻盈', '汲取', '幸运'][item.affix] + '·'}${slot.starter}`;
}
export function itemScore(item) {
  const weights = { attack: 4, defense: 5, maxHp: .35, crit: 180, speed: 2, luck: 1.5, dodge: 220, lifesteal: 240 };
  return Math.round(Object.entries(itemStats(item)).reduce((sum, [key, value]) => sum + value * weights[key], 0) * 10) / 10;
}
export const talentPoints = s => s.level - Object.values(s.talents).reduce((sum, rank) => sum + rank, 0);
export function talentAvailable(s, talent) {
  return talentPoints(s) > 0 && (s.talents[talent.id] || 0) < talent.max && (!talent.parent || (s.talents[talent.parent] || 0) >= talent.required);
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
  return rule.enabled && !item.locked && item.quality <= rule.maxQuality && item.level <= rule.maxLevel && rule.slots.includes(item.slot) && (rule.includeSpecial || (item.bossZone < 0 && !item.blueprintId));
}
export const JOURNEY_EVENTS = {
  cache: { name: '林间拾荒', icon: 'bag', description: '沿着香气寻找散落的物资，有时满载而归，有时空手而回。' },
  hazard: { name: '小径险情', icon: 'shield', description: '一阵落石打破了宁静，轻巧的身手也许能避开危险。' },
  flyer: { name: '收到传单', icon: 'book', description: '一张商店传单飘进背包，可以订购上面的商品，由邮差送到营地。' },
  spring: { name: '林间歇脚', icon: 'heart', description: '找一片柔软的草地坐下，让疲惫随着微风散去。' },
};
