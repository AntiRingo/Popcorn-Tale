import { SAVE_KEY, STEP_MS, MAX_OFFLINE_MS, INGREDIENTS, ZONES, MONSTERS, CLASSES, RECIPES, ACHIEVEMENTS, stats, xpNeeded, gearCost, gearMaterialCost, recipeCost, newGame, advance, upgradeGear, cook, travel, changeClass, achievementProgress, claimAchievement, serialize, restore, enterBoss, upgradeTalent, craft, salvageItem, salvageMatching, setAutoSalvage, toggleItemLock, placeOrder, discardFlyer, settleRealTime } from './engine.js';
import { EQUIPMENT_SLOTS, QUALITIES, STAT_LABELS, PERCENT_STATS, MATERIALS, TALENTS, BLUEPRINTS, itemStats, itemName, itemScore, talentPoints, talentAvailable, craftingCost, salvageRewards, flyerProducts, orderProduct, MAX_PENDING_ORDERS, matchesSalvageRule, JOURNEY_EVENTS } from './progression.js';
import { drawScene, paintArt } from './art.js';
import { beastName, beastStats, beastUpgradeCost, bossFeedCost, contractChance, preferBeast, upgradeBeast, feedBeast, BEAST_MAX_RANK, BOSS_MATURE_GROWTH, BOSS_MAX_GROWTH } from './engine.js';
import { classProgress, highestLevel, equipWarehouseItem, unequipItem } from './engine.js';
import { FIELD_TASKS, fieldTaskRewards } from './progression.js';

const icons = {
  sword: '<path d="m14 3 7-1-1 7-10 10-5-5L14 3ZM4 13l7 7M3 21l4-4"/>',
  leaf: '<path d="M20 3C9 1 2 7 5 15s17 4 15-12ZM5 20 16 8M9 14l-1-5m5 1 4 1"/>',
  book: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1v15ZM5 8h3m-3 4h3m8-4h3m-3 4h3"/>',
  map: '<path d="m2 6 6-3 8 3 6-3v15l-6 3-8-3-6 3V6Zm6-3v15m8-12v15"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M14 7h-4v10h4M8 10h7m-7 4h7"/>',
  bag: '<path d="m8 3 2 5h4l2-5H8Zm2 5C-1 15 4 22 12 21c8 1 13-6 2-13m-6 4h8m-4-2v8"/>',
  settings: '<path d="m10 2-1 3-3 1-3-1-2 4 3 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-3-2v-3l2-2-2-4-3 1-3-1-1-3z" transform="translate(1 0) scale(.9)"/><circle cx="12" cy="12" r="3"/>',
  sound: '<path d="m11 4-5 4H2v8h4l5 4V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
  mute: '<path d="m11 4-5 4H2v8h4l5 4V4Zm5 5 6 6m0-6-6 6"/>',
  window: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><rect x="12" y="12" width="7" height="5"/>',
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  heart: '<path d="M12 21 3 12C-3 4 7-1 12 6c5-7 15-2 9 6l-9 9Z"/>',
  shield: '<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7ZM20 2v4m-2-2h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  play: '<path d="m7 4 14 8-14 8V4Z"/>',
  speed: '<path d="m3 5 9 7-9 7V5Zm10 0 9 7-9 7V5Z"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0V3Zm0 2H3v3c0 3 2 5 5 5m9-8h4v3c0 3-2 5-5 5m-4 2v6m-5 0h10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  flag: '<path d="M5 22V3c5-4 10 4 15 0v10c-5 4-10-4-15 0"/>',
  download: '<path d="M12 2v13m-5-5 5 5 5-5M3 15v6h18v-6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8c0-4 8-3 6 1-1 2-3 1-3 5m0 3v1"/>',
};
function icon(name, cls='') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`; }
function art(kind, id, width=72, height=72, scale=2, extra='') { return `<canvas data-art="${kind}" data-kind="${id}" data-scale="${scale}" width="${width}" height="${height}" ${extra} aria-hidden="true"></canvas>`; }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
const number = n => Math.floor(n).toLocaleString('zh-CN');
const app = document.getElementById('app');
const modal = document.getElementById('modal');
let saved = null, storageAvailable = true;
try { saved = localStorage.getItem(SAVE_KEY); } catch { storageAvailable = false; }
let state = restore(saved) || newGame();
let view = 'adventure', bestiaryFilter='all', miniWindow=null, miniCanvas=null, soundContext=null;
let lastEvent=-1, lastLog='', lastSave=0, toastTimeout, frameRequest=0, previousFrame=0, sceneScroll=0;
let visual = { at:0, type:'spawn', monsterKind: MONSTERS[state.enemy.id].kind };
let ownsGame=true, lockRelease=null;
let offlineReport=null;
let equipmentTab='warehouse', warehouseFilter='all', warehousePage=0, lastProgression='';
const signed = value => `${value >= 0 ? '+' : '−'}${number(Math.abs(value))}`;
const statValue = (key, value) => PERCENT_STATS.includes(key) ? `${Number((value * 100).toFixed(1))}%` : number(value);
const rewardsText = (rewards, count=1) => Object.entries(rewards).map(([id,n])=>`${MATERIALS.find(m=>m.id===id).name} +${number(n*count)}`).join(' · ');
function revivalCountdown() {
  const seconds=Math.max(0,Math.ceil((state.reviveAt-Date.now())/1000));
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

const logo = `<svg class="brand-mark" viewBox="0 0 48 52" aria-hidden="true"><path fill="#bfa668" d="M13 3h9V0h10v6h8v7h5v17h-7v18H12V31H4V15h7V8h2z"/><path fill="#fff0c5" d="M14 6h10V3h6v7h8v7h5v10H8V17h6z"/><path fill="#dfbc70" d="M18 13h6v8h-6zm13 6h7v6h-7z"/><path fill="#c67452" d="M12 29h26l-4 20H16z"/><path fill="#f3deaa" d="M17 31h5l2 16h-5zm11 0h5l-2 16h-5z"/></svg>`;

function shell() {
  app.innerHTML = `<header class="topbar"><div class="topbar-inner"><a class="brand" href="#" data-action="nav" data-view="adventure">${logo}<span>爆米花<span class="brand-small">物语</span><small>POPCORN TALES</small></span></a>
    <nav class="navigation" aria-label="主导航">${[['adventure','sword','冒险旅途'],['equipment','bag','装备工坊'],['talents','spark','天赋树'],['beasts','heart','契约兽营地'],['kitchen','leaf','风味厨房'],['bestiary','book','魔物图鉴'],['map','map','旅途地图']].map(([id,ic,label])=>`<button class="nav-item ${id===view?'active':''}" data-action="nav" data-view="${id}">${icon(ic)}<span>${label}</span></button>`).join('')}</nav>
    <div class="top-tools"><div class="currency" title="金币 · 战斗中自动获得">${icon('coin')}<b data-bind="gold">120</b></div><div class="ingredient-counter" title="背包中的调料总数">${icon('bag')}<b data-bind="inventory">0</b></div><span class="tool-divider"></span><button class="icon-button sound-button" data-action="sound" title="开启音效" aria-label="开启音效">${icon('mute')}</button><button class="icon-button" data-action="settings" title="设置与存档" aria-label="设置与存档">${icon('settings')}</button></div>
    </div></header>
    <div class="page-wrap"><div class="page-intro"><div><div class="eyebrow">A LITTLE KERNEL. A BIG ADVENTURE.</div><h1>世界那么大，去尝尝吧<span class="title-dot">。</span></h1><p>从一颗原味爆米花，到独一无二的美味勇士。</p></div><div class="intro-note"><span class="live-dot"></span><span data-bind="global-status">冒险正在自动进行</span><small>把时间留给生活，把美味交给冒险。</small></div></div>
    <div class="game-layout"><aside class="sidebar" id="sidebar"></aside><main id="main-view"></main></div>
    <footer class="page-footer"><span><span class="save-dot"></span><span id="save-status">冒险进度自动保存</span><span class="footer-sep">/</span>${icon('clock')} 离线也有收获 · 最长 8 小时</span><button data-action="help">冒险指南 ${icon('help')}</button><span class="footer-sign">MADE WITH BUTTER & A LITTLE BRAVERY <span>✦</span></span></footer></div>`;
  renderSidebar(); renderView(); syncUI();
}
function renderSidebar() {
  document.getElementById('sidebar').innerHTML = `<section class="panel hero-panel"><div class="panel-top"><span class="section-label">我的勇士</span><button class="text-button" data-action="classes">换装 ${icon('chevron')}</button></div>
    <div class="hero-portrait"><div class="portrait-grid"></div><span class="portrait-spark s1">✦</span><span class="portrait-spark s2">+</span><span class="portrait-spark s3">✧</span><span class="level-tag">Lv.<b data-bind="level">1</b></span>${art('hero',state.heroClass,180,150,3.4)}<span class="portrait-shadow"></span><div class="portrait-grass"></div></div>
    <div class="hero-name"><h2>花花 <span>原味出发</span></h2><p id="class-name">${CLASSES.find(c=>c.id===state.heroClass).name}</p></div>
    <div class="hero-bars"><div class="bar-label"><span>${icon('heart')} 生命值</span><b><span data-bind="hp">115</span><em> / <span data-bind="maxHp">115</span></em></b></div><div class="meter health"><i data-bar="hp"></i></div><div class="bar-label xp-label"><span>EXP</span><b><span data-bind="xp">0</span><em> / <span data-bind="xpNeeded">40</span></em></b></div><div class="meter experience"><i data-bar="xp"></i></div></div>
    <div class="stat-grid expanded-stats">${[['attack','sword','攻击决定单次伤害'],['maxHp','heart','生命上限'],['defense','shield','防御减少受到的伤害'],['crit','spark','暴击造成 1.8 倍伤害，上限 80%'],['attackSpeed','speed','100 速度约每 1.9 秒出手；速度上限 400'],['luck','leaf','幸运提高装备、素材、图纸掉率及装备品质'],['dodge','shield','闪避敌人攻击的概率，上限 60%'],['lifesteal','heart','按实际造成的伤害回血，上限 50%']].map(([id,ic,tip])=>`<div title="${tip}">${icon(ic)}<b data-bind="${id}">0</b><span>${id==='attackSpeed'?'速度':id==='attack'&&state.heroClass==='tamer'?'契约攻击':STAT_LABELS[id]}</span></div>`).join('')}</div>
    <div class="equipment"><div class="section-label">随身装备 <button class="text-button" data-action="nav" data-view="equipment">仓库 / 制作 ${icon('chevron')}</button></div>${state.heroClass==='tamer'?'<button class="beast-sidebar-link" data-action="nav" data-view="beasts">契约召唤 · 前往伙伴营地 →</button>':''}${EQUIPMENT_SLOTS.filter(slot=>state.heroClass!=='tamer'||slot.id!=='weapon').map(({id,icon:ic,starter,bonus})=>`<div class="gear-row"><span class="gear-icon ${id}">${icon(ic)}</span><div class="gear-info"><b><span data-gear-name="${id}">${starter}</span> <small data-gear-level="${id}">+0</small></b><span>${bonus} <em>·</em> ${icon('coin')} <span data-gear-cost="${id}">150</span></span><span class="gear-materials" data-gear-materials="${id}"></span></div><button class="upgrade-button" data-action="upgrade" data-id="${id}" aria-label="强化${starter}栏位" title="消耗金币与素材强化，仅归当前职业的栏位所有">${icon('plus')}</button></div>`).join('')}<p class="equipment-note">强化归当前职业 · 替换装备保留强化</p></div>
    </section><button class="journal-card" data-action="achievements"><span class="journal-icon">${icon('book')}</span><span><strong>小小冒险，大大成就</strong><small>翻开花花的冒险手记</small></span>${icon('arrow')}</button><div class="sidebar-quote">“ 总有一种味道，<br>值得翻山越岭。 ”<span>— 花花的第一篇日记</span></div>`;
  paintArt(document.getElementById('sidebar'));
}

function heading(kicker, title, subtitle, extra='') { return `<div class="view-heading"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2><p>${subtitle}</p></div>${extra}</div>`; }
function recipeCard(r, compact=false) {
  const lv=state.recipes[r.id] || 0, cost=recipeCost(state,r.id), enough=state.inventory[r.id]>=cost;
  return `<article class="recipe-card ${compact?'compact':''}"><div class="recipe-art ${r.id}">${art('ingredient',r.id,76,68,2.2)}<span>${lv?`Lv.${lv}`:'待研发'}</span></div><div class="recipe-info"><h3>${r.name}</h3><p>${r.note}</p><span class="recipe-effect">${icon(r.stat==='生命'?'heart':r.stat==='防御'?'shield':'sword')} ${r.stat} +${r.bonus}<small> / 每级</small></span></div><div class="recipe-bottom"><span>${art('ingredient',r.id,28,28,.8)}<b data-stock="${r.id}">${state.inventory[r.id]}</b><em> / ${cost}</em></span><button class="cook-button ${enough?'ready':''}" data-action="cook" data-id="${r.id}" ${lv>=5?'disabled':''}>${lv>=5?'已满级':lv?'研发升级':'研发风味'} ${icon('plus')}</button></div></article>`;
}
function adventureView() {
  const zone=ZONES[state.zone];
  return `<section class="battle-section">${heading(`CHAPTER <span data-bind="chapter">01</span> <span class="eyebrow-sep">/</span> <span id="zone-english">${zone.sub}</span>`,`<span id="zone-name">${zone.name}</span><span class="chapter-badge">探索中</span>`,`<span id="zone-description">${zone.description}</span>`,`<button class="button mini-button" data-action="mini">${icon('window')} 小窗冒险 ${icon('arrow')}</button>`)}
    <div id="encounter-notice">${encounterNotice()}</div><div id="journey-panel">${journeyPanel()}</div><div class="battle-frame"><div class="battle-top"><div><span class="zone-number" data-bind="stage">01</span><b id="battle-location">林间小径</b><span class="battle-divider"></span><span class="wave-label">自由探索 · 自动拾取</span></div><span class="encounter-tag" data-bind="encounter-mode">野外探索</span></div>
      <div class="scene-wrap"><canvas id="battle-canvas" width="800" height="360" role="img" aria-label="爆米花勇士与美食魔物自动进行回合战斗的像素森林场景"></canvas><div class="scene-status"><span class="live-dot"></span><span data-bind="battle-status">自动战斗中</span><small>ROUND <b data-bind="round">01</b></small></div><div class="scene-weather">✦ <span id="zone-weather">黄油香气弥漫</span></div><div class="actor-label hero-label"><span>花花</span><small>Lv.<b data-bind="level">1</b></small></div><div class="actor-label enemy-label"><span id="enemy-name">黄油小菇</span><small id="enemy-hp">38 / 38</small></div><div class="travel-message" id="travel-message"></div><div class="scene-caption">THE LITTLE ADVENTURE OF A POPCORN</div></div>
      <div class="battle-controls"><div class="turn-indicator">${icon('sword')}<span data-bind="turn">花花准备出手</span><span class="auto-tag">AUTO</span></div><div class="control-actions"><button class="speed-control" data-action="speed" title="切换战斗速度">${icon('speed')} <b data-bind="speed">1</b>×</button><span></span><button class="pause-control" data-action="pause">${icon('pause')}<span data-bind="pause-label">暂停</span></button></div></div>
    </div><div id="beast-battle-strip" class="beast-battle-strip" ${state.heroClass==='tamer'?'':'hidden'}><div><b data-beast-battle-status>${beastBattleStatus()}</b><small id="beast-health-label"></small></div><button class="text-button" data-action="nav" data-view="beasts">契约兽营地 ${icon('arrow')}</button></div><div class="journey-strip"><span class="journey-leaf">${icon('leaf')}</span><p><b>美味就在下一站</b><span id="journey-tip">击败森林首领，向海盐海岸出发。</span></p><label class="switch-label"><span>自动前往新区</span><input type="checkbox" id="auto-travel" ${state.autoTravel?'checked':''}><span class="switch"></span></label></div>
    </section>
    <section class="adventure-bottom"><div class="flavor-preview"><div class="section-heading"><h3>${icon('leaf')} 今日的美味灵感</h3><button class="text-button" data-action="nav" data-view="kitchen">前往厨房 ${icon('arrow')}</button></div><div class="recipe-preview-grid">${RECIPES.slice(0,2).map(r=>recipeCard(r,true)).join('')}</div></div><section class="log-panel"><div class="section-heading"><h3>${icon('book')} 冒险见闻</h3><span class="live-label">LIVE</span></div><div id="battle-log" class="battle-log" aria-label="战斗与拾取记录"></div><div class="log-summary">今天也是满载而归的一天 <span>✦</span></div></section></section>`;
}
function kitchenView() {
  return `${heading('THE FLAVOR LAB','风味厨房<span class="chapter-badge">美味研发中</span>','把沿途收集的调料，变成属于你的独家风味。')}<div class="kitchen-banner"><span class="kitchen-pot">${art('ingredient','butter',92,76,3)}</span><div><span class="eyebrow">A RECIPE FOR ADVENTURE</span><h3>每一种风味，都让你更强大。</h3><p>调料由战斗自动收集。研发配方可永久提升属性，每种风味最高 5 级。</p></div><span class="banner-spark">✦</span></div><div class="inventory-strip">${INGREDIENTS.map(i=>`<div>${art('ingredient',i.id,44,42,1.2)}<span>${i.name}<b data-stock="${i.id}">${state.inventory[i.id]}</b></span></div>`).join('')}</div><div class="recipes-grid">${RECIPES.map(r=>recipeCard(r)).join('')}</div><p class="page-hint">${icon('leaf')} 所有已研发风味同时生效，无需装备。新调料在新的旅途区域中发现。</p>`;
}
function beastStatus(beast) {
  if (beast.reviveAt) return `休养中 · ${countdown(beast.reviveAt)} 后恢复`;
  if (MONSTERS[beast.id].boss && beast.growth < BOSS_MATURE_GROWTH) return `宝宝成长 ${beast.growth} / ${BOSS_MATURE_GROWTH} · 尚未解锁出战`;
  if (state.activeBeast === beast.id) return '正在出战 · 优先承受攻击';
  return '准备就绪 · 等待召唤';
}
function beastBattleStatus() {
  if (state.heroClass !== 'tamer') return '转职驯兽师，让伙伴一起冒险';
  if (state.phase === 'rest') return '花花正在休养，伙伴在营地等待';
  if (state.activeBeast) return `${beastName(state.activeBeast)}守护中`;
  if (state.summonCooldown) return `召唤中 · 约 ${(state.summonCooldown / state.speed / 1000).toFixed(1)} 秒 · 花花承伤`;
  return '暂无可出战伙伴 · 花花承伤，等待契约兽恢复';
}
function beastLoadoutCard() {
  return `<article class="item-card beast-slot"><div class="item-top"><span>${icon('leaf')} 契约召唤</span><b>驯兽师专属</b></div><h3>以伙伴代替武器</h3><p class="item-meta">武器与武器强化不生效</p><p class="beast-explanation">通过晶体强化伙伴，通过喂养培养 Boss 宝宝。其他职业的装备独立保管，需先放回共享仓库才能转交。</p><button class="button secondary" data-action="nav" data-view="beasts">前往契约兽营地</button></article>`;
}
function beastsView() {
  const beasts=Object.values(state.beasts);
  return `${heading('A BOND BEYOND THE BATTLE','契约兽营地','每一次契约，都是一段新的陪伴。',`<span class="collection-count"><b>${beasts.length}</b> / ${Object.keys(MONSTERS).length} 已契约</span>`)}<div class="beast-banner"><div>${art('hero','tamer',100,105,2.5)}<div><h3>空手结契，与魔物并肩</h3><p>驯兽师击败普通魔物有 ${(contractChance(state)*100).toFixed(0)}% 概率签约（基础 20%，幸运可提高）；重复契约获得 1 枚同种晶体，重复 Boss 契约获得 5 枚。</p><p>伙伴倒下后休养现实时间 1 小时；自动召唤下一只可用伙伴约需 2.85 秒（1×）。召唤期间花花承伤，无可用伙伴时等待恢复。</p></div></div><div class="beast-banner-footer"><b data-beast-battle-status>${beastBattleStatus()}</b><button class="button secondary" data-action="classes">${state.heroClass==='tamer'?'切换职业':'转职驯兽师'}</button></div></div><div class="system-note">${icon('heart')} Boss 宝宝必定随驯兽师的首领胜利加入，需用风味精华和首领专属素材喂养至 3 阶才能出战，最高 5 阶。休养期限不受暂停、倍速、转职或关闭页面影响。</div>${beasts.length?`<div class="beast-grid">${beasts.map(beast=>{
    const id=beast.id, monster=MONSTERS[id], st=beastStats(state,id), cost=bossFeedCost(id,beast.growth);
    return `<article class="beast-card ${monster.boss?'boss-baby':''} ${state.activeBeast===id?'active-beast':''}"><div class="item-top"><span>${monster.boss?'Boss 宝宝':'契约伙伴'}</span><b>${state.preferredBeast===id?'优先召唤':'自动轮换'}</b></div><div class="beast-portrait">${art('monster',monster.kind,126,100,monster.boss&&beast.growth<3?1.9:2.6,`data-boss="${!!monster.boss}"`)}${monster.boss?`<span>${beast.growth} / ${BOSS_MAX_GROWTH} 阶</span>`:''}</div><h3>${beastName(id)} <small>+${beast.rank}</small></h3><p class="beast-status" data-beast-status="${id}">${beastStatus(beast)}</p><div class="meter health beast-health"><i data-beast-bar="${id}" style="width:${beast.hp/st.maxHp*100}%"></i></div><p class="beast-hp" data-beast-hp="${id}">生命 ${beast.hp} / ${st.maxHp}</p><div class="beast-properties"><span>攻击 <b>${st.attack}</b></span><span>防御 <b>${st.defense}</b></span><span>速度 <b>${st.speed}</b></span></div><div class="beast-crystals">同种晶体 <b data-beast-crystals="${id}">${beast.crystals}</b><small>每次强化增加基础攻击、生命与防御的 12%</small></div><div class="beast-actions"><button class="button secondary" data-action="beast-prefer" data-id="${id}">${state.preferredBeast===id?'已优先':'优先召唤'}</button><button class="button" data-action="beast-upgrade" data-id="${id}">${beast.rank>=BEAST_MAX_RANK?'强化已满级':`强化 · ${beastUpgradeCost(beast)} 晶体`}</button></div>${monster.boss?`<div class="beast-feeding"><h4>${beast.growth>=BOSS_MAX_GROWTH?'已完成培养':`喂养至 ${beast.growth+1} 阶`}</h4><p>${beast.growth<BOSS_MATURE_GROWTH?'喂养至 3 阶后解锁出战，每阶提升基础属性 15%。':'已经学会战斗，还可以继续培养。'}</p>${cost?`<div class="craft-cost">${Object.entries(cost).map(([key,n])=>`<span>${MATERIALS.find(m=>m.id===key).name} <b data-material="${key}">${state.materials[key]}</b> / ${n}</span>`).join('')}</div><button class="button secondary" data-action="beast-feed" data-id="${id}">喂养稀有素材</button>`:''}</div>`:''}</article>`;
  }).join('')}</div>`:`<div class="empty-state">${icon('leaf')}<h3>第一位伙伴，正在等你。</h3><p>Lv.1 即可转职驯兽师，首次转职获得黄油小菇。用新的战斗方式，结识更多魔物朋友。</p><button class="button" data-action="classes">选择驯兽师</button></div>`}`;
}
function syncBeasts() {
  setText('[data-beast-battle-status]',beastBattleStatus());
  for (const beast of Object.values(state.beasts)) {
    const st=beastStats(state,beast.id);
    setText(`[data-beast-status="${beast.id}"]`,beastStatus(beast));
    setText(`[data-beast-hp="${beast.id}"]`,`生命 ${beast.hp} / ${st.maxHp}`);
    setText(`[data-beast-crystals="${beast.id}"]`,beast.crystals);
    document.querySelectorAll(`[data-beast-bar="${beast.id}"]`).forEach(el=>el.style.width=`${beast.hp/st.maxHp*100}%`);
  }
  const active=state.beasts[state.activeBeast];
  setText('#beast-health-label',active?`生命 ${active.hp} / ${beastStats(state,active.id).maxHp}`:'');
  const strip=document.getElementById('beast-battle-strip'); if(strip)strip.hidden=state.heroClass!=='tamer';
  document.querySelectorAll('[data-action="beast-prefer"]').forEach(el=>el.disabled=!ownsGame||state.preferredBeast===el.dataset.id);
  document.querySelectorAll('[data-action="beast-upgrade"]').forEach(el=>{const b=state.beasts[el.dataset.id];el.disabled=!ownsGame||b.rank>=BEAST_MAX_RANK||b.crystals<beastUpgradeCost(b);});
  document.querySelectorAll('[data-action="beast-feed"]').forEach(el=>{const b=state.beasts[el.dataset.id],cost=bossFeedCost(b.id,b.growth);el.disabled=!ownsGame||!cost||Object.entries(cost).some(([id,n])=>state.materials[id]<n);});
}
function bestiaryView() {
  const entries=Object.entries(MONSTERS).filter(([,m])=>bestiaryFilter==='all'||(bestiaryFilter==='boss'?m.boss:!m.boss));
  return `${heading('FRIENDS, FOES & FLAVORS','魔物图鉴','它们或许有点凶，但每一个都有自己的味道。',`<span class="collection-count"><b data-bind="discovered">0</b> / ${Object.keys(MONSTERS).length} 已遇见</span>`)}<div class="filter-tabs" aria-label="图鉴筛选">${[['all','全部魔物'],['normal','林间小怪'],['boss','区域首领']].map(([id,name])=>`<button data-action="filter" data-id="${id}" class="${id===bestiaryFilter?'selected':''}">${name}</button>`).join('')}</div><div class="bestiary-grid">${entries.map(([id,m],i)=>{const known=Object.hasOwn(state.discovered,id);return `<article class="monster-card ${known?'':'undiscovered'}" data-monster="${id}"><div class="monster-number">NO.${String(Object.keys(MONSTERS).indexOf(id)+1).padStart(2,'0')} ${m.boss?'<span>首领</span>':''}</div><div class="monster-art">${art('monster',m.kind,120,105,2.6,`data-boss="${!!m.boss}"`)}${!known?`<span class="unknown-mark">?</span>`:''}</div><h3>${known?m.name:'未知的美味'}</h3><p>${known?m.description:'继续探索，邂逅旅途中的新朋友。'}</p><div class="monster-foot">${known?`已击败 <b data-monster-count="${id}">${state.discovered[id]}</b> 次`:`${icon('lock')} 尚未发现`}</div></article>`;}).join('')}</div>`;
}
function encounterNotice() {
  if(state.phase==='rest') {
    const loss=state.deathLoss;
    const lost=loss?[...INGREDIENTS.map(m=>[m.name,loss.ingredients[m.id]]),...MATERIALS.map(m=>[m.name,loss.materials[m.id]])].filter(([,amount])=>amount>0).map(([name,amount])=>`${name} −${number(amount)}`).join(' · '):'';
    return `<div class="encounter-notice revival-notice"><span class="notice-emblem">${icon('heart')}</span><div><b>营火守候 · <span data-bind="revival-countdown">${revivalCountdown()}</span> 后复活</b><p>现实时间 10 分钟，关闭页面也会计时。等级、装备、强化和天赋已保留。</p>${loss?`<p class="loss-detail">本次损失：金币 −${number(loss.gold)}${lost?' · '+lost:''}</p>`:''}</div></div>`;
  }
  if(state.inBoss) return `<div class="encounter-notice boss-notice"><span class="notice-emblem">${icon('flag')}</span><div><b>首领挑战 · ${MONSTERS[ZONES[state.zone].boss].name}</b><p>胜利必掉首领专属装备、素材与制作图纸。</p></div><button class="button secondary" data-action="travel" data-id="${state.zone}">撤回野外</button></div>`;
  if(state.bossRooms[state.zone]) return `<div class="encounter-notice boss-notice"><span class="notice-emblem">${icon('flag')}</span><div><b>发现隐藏 Boss 房！</b><p>${MONSTERS[ZONES[state.zone].boss].name}正在等待挑战。入口会保留，可准备好后再来。</p></div><button class="button" data-action="boss" data-id="${state.zone}">进入 Boss 房 ${icon('arrow')}</button></div>`;
  return `<div class="encounter-notice"><span class="notice-emblem">${icon('map')}</span><div><b>林间藏着新的奇遇</b><p>持续击败当前区域的魔物，有机会发现隐藏 Boss 房，发现后可手动进入。</p></div></div>`;
}
function journeyPanel() {
  const event=state.phase==='event'?state.journeyEvent:null, flyer=state.flyer;
  let html='';
  if(state.fieldTask) {
    const task=state.fieldTask, meta=FIELD_TASKS[task.kind], rewards=fieldTaskRewards(task), pending=task.completedAt===null;
    html+=`<div class="encounter-notice field-task ${pending?'':'task-complete'}"><span class="notice-emblem">${icon(meta.icon)}</span><div><b>${pending?'正在处理':'已完成'} · ${meta.name}</b><p>${meta.description}</p><p>${pending?`现实时间 ${meta.duration/60000} 分钟 · 剩余 <strong data-task-countdown>${countdown(task.finishAt)}</strong>。完成后继续探索，暂停、倍速和关闭页面不改变期限。`:'事务谢礼已自动入库，收拾行囊继续探索。'}</p><p class="event-outcome">${pending?'完成后获得':'已获得'}：${rewardsText(rewards.materials)}${rewards.gold?` · 金币 +${rewards.gold}`:''}</p>${pending?'<div class="task-progress"><i data-task-progress></i></div>':''}</div></div>`;
  }
  if(event && (event.kind!=='flyer'||!flyer)) {
    const meta=JOURNEY_EVENTS[event.kind];
    const outcome=event.kind==='cache'?(Object.keys(event.materials).length?rewardsText(event.materials):'这次没有找到可用素材。'):event.kind==='hazard'?(event.damage?`生命 −${number(event.damage)}`:'成功避开危险，没有受伤。'):event.kind==='spring'?`生命 +${number(event.healed)}`:'稍作停留，继续旅途。';
    html+=`<div class="encounter-notice journey-event"><span class="notice-emblem">${icon(meta.icon)}</span><div><b>旅途奇遇 · ${meta.name}</b><p>${meta.description}</p><p class="event-outcome">${outcome}</p></div></div>`;
  }
  const pending=state.orders.filter(o=>o.deliveredAt===null).length;
  html+=`<div class="encounter-notice flyer-notice"><span class="notice-emblem">${icon('book')}</span><div><b>${flyer?'收到一张商店传单':'营地邮局'}</b><p>${flyer?`素材、装备和饰品可用金币订购。下次刷新 <span data-flyer-countdown></span>。`:'探索时有机会收到商品传单。'}${pending?` ${pending} 笔订单配送中。`:' 到期自动送达，不影响挂机。'}</p></div><button class="button" data-action="flyer-open">${flyer?'查看传单与订单':'查看订单'}</button></div>`;
  return html;
}
function salvageSettingsDialog() {
  const r=state.autoSalvage;
  showModal(`<div class="eyebrow">A SECOND LIFE FOR EVERY TREASURE</div><h2>自动分解规则</h2><p class="modal-subtitle">同时满足下方所有条件的入库装备会被分解；更高评分装备始终优先穿戴，锁定装备始终保留。</p><div class="salvage-form"><label class="check-setting"><input id="salvage-enabled" type="checkbox" ${r.enabled?'checked':''}>开启自动分解</label><div class="rule-fields"><label>品质上限<select id="salvage-quality">${QUALITIES.map((q,i)=>`<option value="${i}" ${r.maxQuality===i?'selected':''}>${q.name}及以下</option>`).join('')}</select></label><label>装备等级上限<input id="salvage-level" type="number" min="1" max="100" value="${r.maxLevel}"></label></div><fieldset><legend>适用部位（至少选择一个）</legend>${EQUIPMENT_SLOTS.map(slot=>`<label class="check-setting"><input name="salvage-slot" type="checkbox" value="${slot.id}" ${r.slots.includes(slot.id)?'checked':''}>${slot.name}</label>`).join('')}</fieldset><label class="check-setting"><input id="salvage-special" type="checkbox" ${r.includeSpecial?'checked':''}>包含首领专属和图纸制作装备</label><p class="setting-note">保存后处理新获得和换装后入库的装备。现有仓库保持原样，可使用「分解匹配项」批量处理。</p></div><button class="button" data-action="salvage-save">保存规则</button>`);
}
function countdown(deadline) {
  const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
function productDescription(product) {
  return product.materials?rewardsText(product.materials):`Lv.${product.item.level} · ${QUALITIES[product.item.quality].name} · ${Object.entries(itemStats(product.item)).map(([key,value])=>`${STAT_LABELS[key]} +${statValue(key,value)}`).join(' / ')}`;
}
function flyerContent() {
  const flyer=state.flyer, pending=state.orders.filter(o=>o.deliveredAt===null).sort((a,b)=>a.deliverAt-b.deliverAt), arrived=state.orders.filter(o=>o.deliveredAt!==null).sort((a,b)=>b.deliveredAt-a.deliveredAt||b.id-a.id);
  const orderRow=o=>{const p=orderProduct(o);return `<article class="delivery-row"><span class="delivery-icon">${icon(o.deliveredAt===null?'clock':'check')}</span><div><b>#${o.id} · ${p.name}</b><p>${productDescription(p)}</p><small>支付 ${number(p.price)} 金币 · ${o.deliveredAt===null?'预计':'已于'} ${new Date(o.deliverAt).toLocaleString('zh-CN',{hour12:false})}${o.deliveredAt===null?' 送达':' 送达入库'}</small></div><strong ${o.deliveredAt===null?`data-delivery-countdown="${o.deliverAt}"`:''}>${o.deliveredAt===null?countdown(o.deliverAt):'已送达'}</strong></article>`;};
  return `<div class="flyer-heading"><h3>本期传单</h3>${flyer?`<span>刷新倒计时 <b data-flyer-countdown></b></span>`:''}</div>${flyer?`<p class="flyer-note">每 30 分钟轮换商品并补货，每款每期限订 1 份；装备等级按刷新时的角色等级确定，最高 Lv.40。</p><div class="flyer-grid">${flyerProducts(flyer).map(p=>`<article class="flyer-card"><div class="item-top"><span>${icon(p.item?EQUIPMENT_SLOTS.find(s=>s.id===p.item.slot).icon:'bag')} ${p.item?'装备订购':'素材补给'}</span><b>现实 ${p.delay/60000} 分钟</b></div><h3>${p.name}</h3><p>${productDescription(p)}</p><button class="button" data-action="order" data-id="${p.id}" data-flyer="${flyer.id}">${flyer.purchased.includes(p.id)?'本期已订购':`订购 · ${number(p.price)} 金币`}</button></article>`).join('')}</div><button class="text-button discard-flyer" data-action="flyer-discard" data-id="${flyer.id}">丢弃本张传单，等待新的奇遇</button>`:`<p class="flyer-note">还没有商品传单，继续探索小径就有机会收到。</p>`}<div class="flyer-heading"><h3>配送中 · ${pending.length}/${MAX_PENDING_ORDERS}</h3><span>现实时间，到期自动入库</span></div>${pending.length?pending.map(orderRow).join(''):'<p class="flyer-note">暂无配送中的订单。</p>'}${arrived.length?`<div class="flyer-heading"><h3>最近送达</h3><span>保留最近 20 笔</span></div>${arrived.map(orderRow).join('')}`:''}`;
}
function flyerDialog() {
  showModal(`<div class="eyebrow">A LITTLE PARCEL ON ITS WAY</div><h2>传单与营地邮局</h2><p class="modal-subtitle">付款后由邮差配送；暂停、倍速和离线不改变送达时间。装备到货后优先自动穿戴，并锁定保护，可在仓库解锁后分解。</p><p class="flyer-balance">现有金币 <b data-bind="gold">${number(state.gold)}</b></p><div id="flyer-shop" data-revision="${state.shopRevision}">${flyerContent()}</div>`,true);
  modal.classList.add('flyer-dialog');
}
function syncFlyer() {
  const shop=document.getElementById('flyer-shop');
  if(modal.open&&shop&&shop.dataset.revision!==String(state.shopRevision)) {
    shop.innerHTML=flyerContent();shop.dataset.revision=state.shopRevision;
  }
  document.querySelectorAll('[data-flyer-countdown]').forEach(el=>el.textContent=state.flyer?countdown(state.flyer.refreshAt):'—');
  document.querySelectorAll('[data-delivery-countdown]').forEach(el=>el.textContent=`剩余 ${countdown(Number(el.dataset.deliveryCountdown))}`);
  const pending=state.orders.filter(o=>o.deliveredAt===null).length;
  document.querySelectorAll('[data-action="order"]').forEach(el=>{
    const p=state.flyer&&flyerProducts(state.flyer).find(p=>p.id===el.dataset.id), bought=state.flyer?.purchased.includes(el.dataset.id);
    el.disabled=!ownsGame||!p||state.flyer.id!==Number(el.dataset.flyer)||bought||state.gold<p.price||pending>=MAX_PENDING_ORDERS||Date.now()>=state.flyer.refreshAt;
    if(p)el.textContent=bought?'本期已订购':`${state.gold<p.price?'金币不足':'订购'} · ${number(p.price)} 金币`;
  });
  document.querySelectorAll('[data-action="flyer-discard"]').forEach(el=>el.disabled=!ownsGame);
}
function itemCard(item, slot, equipped=false) {
  const quality=item?QUALITIES[item.quality]:QUALITIES[0];
  const properties=item?Object.entries(itemStats(item)).map(([key,value])=>`<span>${STAT_LABELS[key]} <b>+${statValue(key,value)}</b></span>`).join(''):'<span>击败魔物或制作装备，自动替换初始装备。</span>';
  return `<article class="item-card ${equipped?'equipped-card':''}" style="--rarity:${quality.color}"><div class="item-top"><span>${icon(slot.icon)} ${slot.name}</span><b>${item?quality.name:'初始'}</b></div><h3>${item?itemName(item):slot.starter}</h3><p class="item-meta">${item?`Lv.${item.level} · 评分 ${itemScore(item)}`:'尚未获得掉落装备'}${equipped?` · 强化 +${state.gear[slot.id]}`:item.count>1?` · ×${number(item.count)}`:''}</p><div class="item-properties">${properties}</div><div class="item-footer">${item?.bossZone>=0?`${icon('flag')} ${ZONES[item.bossZone].name}专属`:equipped?'更高综合评分自动穿戴':item.locked?'已锁定':'仓库保管中'}${equipped?`<span class="equipped-badge">已穿戴</span>`:''}</div>${equipped&&item?`<button class="text-button unequip-button" data-action="unequip-item" data-id="${slot.id}">放回共享仓库</button>`:''}${!equipped&&item?`<div class="salvage-yield">每件分解：${rewardsText(salvageRewards(item))}</div><div class="item-actions"><button class="button" data-action="equip-item" data-id="${item.id}">装备 1 件</button><button class="button secondary" data-action="item-lock" data-id="${item.id}" ${ownsGame?'':'disabled'}>${icon('lock')} ${item.locked?'解锁':'锁定'}</button><button class="button secondary" data-action="salvage" data-id="${item.id}" ${item.locked||!ownsGame?'disabled':''}>分解 1 件</button>${item.count>1?`<button class="text-button" data-action="salvage-stack" data-id="${item.id}" ${item.locked||!ownsGame?'disabled':''}>分解整组 ×${number(item.count)}</button>`:''}</div>`:''}</article>`;
}
function materialInventory() {
  return `<div class="material-grid">${MATERIALS.map(m=>`<div title="${m.note}"><span>${m.name}</span><b data-material="${m.id}">${number(state.materials[m.id])}</b></div>`).join('')}</div>`;
}
function enhancementContent() {
  return `<div class="system-note">${icon('spark')} 每次强化消耗金币与素材；从 +5 继续强化时，还需分解稀有装备获得的风味精华。强化永久保留在栏位中。</div>${materialInventory()}<div class="blueprint-grid enhancement-grid">${EQUIPMENT_SLOTS.filter(slot=>state.heroClass!=='tamer'||slot.id!=='weapon').map(slot=>{
    const cost=gearMaterialCost(state,slot.id), rank=state.gear[slot.id];
    return `<article class="blueprint-card"><div class="item-top"><span>${icon(slot.icon)} ${slot.name}强化</span><b>+${rank}</b></div><h3>${state.equipped[slot.id]?itemName(state.equipped[slot.id]):slot.starter}</h3><p>本次提升 ${slot.bonus}</p><div class="craft-cost">${Object.entries(cost).map(([id,n])=>`<span>${MATERIALS.find(m=>m.id===id).name} <b data-material="${id}">${number(state.materials[id])}</b> / ${number(n)}</span>`).join('')}<span>金币 <b data-bind="gold">${number(state.gold)}</b> / ${number(gearCost(state,slot.id))}</span></div><button class="button" data-action="upgrade" data-id="${slot.id}">${rank>=100?'已满级':`强化至 +${rank+1}`}</button></article>`;
  }).join('')}</div>`;
}
function salvageRuleSummary() {
  const r=state.autoSalvage;
  return r.enabled?`${QUALITIES[r.maxQuality].name}及以下 · Lv.${r.maxLevel}及以下 · ${r.slots.map(id=>EQUIPMENT_SLOTS.find(s=>s.id===id).name).join(' / ')}${r.includeSpecial?' · 包含首领与制作装备':' · 保留首领与制作装备'}`:'尚未开启；设置品质、等级和部位，让闲置战利品自动变成素材。';
}
function warehouseContent() {
  const list=state.warehouse.filter(item=>warehouseFilter==='all'||item.slot===warehouseFilter).sort((a,b)=>itemScore(b)-itemScore(a));
  const pages=Math.max(1,Math.ceil(list.length/24)); warehousePage=Math.min(warehousePage,pages-1);
  const count=state.warehouse.filter(item=>matchesSalvageRule(state,item)).reduce((sum,item)=>sum+item.count,0);
  return `<div class="salvage-banner"><div><b>自动分解 · ${state.autoSalvage.enabled?'已开启':'已关闭'}</b><p>${salvageRuleSummary()}</p><small>先自动穿戴更好的装备，再分解落选装备。锁定装备始终保留。</small></div><div class="salvage-controls"><button class="button secondary" data-action="salvage-settings">设置规则</button><button class="button secondary" data-action="salvage-matching" ${count&&ownsGame?'':'disabled'}>分解匹配项 · ${number(count)} 件</button></div></div>${materialInventory()}<div class="filter-tabs warehouse-filters">${[['all','全部'],...EQUIPMENT_SLOTS.map(s=>[s.id,s.name])].map(([id,label])=>`<button class="${warehouseFilter===id?'selected':''}" data-action="warehouse-filter" data-id="${id}">${label}</button>`).join('')}</div>${list.length?`<div class="item-grid warehouse-grid">${list.slice(warehousePage*24,warehousePage*24+24).map(item=>itemCard(item,EQUIPMENT_SLOTS.find(slot=>slot.id===item.slot))).join('')}</div><div class="warehouse-pagination"><button class="button secondary" data-action="warehouse-page" data-id="${warehousePage-1}" ${warehousePage===0?'disabled':''}>上一页</button><span>${warehousePage+1} / ${pages} 页 · 同属性装备自动堆叠</span><button class="button secondary" data-action="warehouse-page" data-id="${warehousePage+1}" ${warehousePage===pages-1?'disabled':''}>下一页</button></div>`:`<div class="empty-state">${icon('bag')}<h3>留一点空间，装下旅途的惊喜。</h3><p>未被穿戴或自动分解的装备会放在这里。已累计分解 ${number(state.salvaged)} 件装备（含手动与自动分解）。</p></div>`}`;
}
function craftingContent() {
  return `<div class="material-grid">${MATERIALS.map(m=>`<div title="${m.note}"><span>${m.name}</span><b data-material="${m.id}">${number(state.materials[m.id])}</b></div>`).join('')}</div><div class="blueprint-grid">${BLUEPRINTS.map(b=>{
    const known=state.blueprints.includes(b.id), cost=craftingCost(state,b), slot=EQUIPMENT_SLOTS.find(s=>s.id===b.slot);
    const preview={slot:b.slot,level:cost.level,quality:b.quality,affix:b.affix,bossZone:b.bossZone};
    return `<article class="blueprint-card ${known?'':'unknown-blueprint'}"><div class="item-top"><span>${icon('book')} ${b.bossZone>=0?'首领图纸':'制作图纸'}</span><b style="color:${QUALITIES[b.quality].color}">${QUALITIES[b.quality].name}</b></div><h3>${b.name}</h3><p>${slot.name} · Lv.${cost.level} · 成品评分 ${itemScore(preview)}</p><div class="item-properties">${Object.entries(itemStats(preview)).map(([key,value])=>`<span>${STAT_LABELS[key]} <b>+${statValue(key,value)}</b></span>`).join('')}</div><div class="craft-cost">${Object.entries(cost.materials).map(([key,quantity])=>`<span>${MATERIALS.find(m=>m.id===key).name} <b data-material="${key}">${number(state.materials[key])}</b> / ${quantity}</span>`).join('')}<span>${INGREDIENTS.find(i=>i.id===b.ingredient).name} <b data-stock="${b.ingredient}">${number(state.inventory[b.ingredient])}</b> / ${cost.ingredient}</span><span>金币 ${cost.gold}</span></div><button class="button ${known?'':'secondary'}" data-action="craft" data-id="${b.id}" ${known?'':'disabled'}>${known?'制作装备':`${icon('lock')} ${b.bossZone>=0?'击败对应首领获得':'击败普通魔物获得'}`}</button></article>`;
  }).join('')}</div><p class="page-hint">图纸永久保留，可反复制作。成品等级随角色提升，最高 Lv.40；更好的成品会自动穿戴。</p>`;
}
function equipmentView() {
  const total=state.warehouse.reduce((sum,item)=>sum+item.count,0);
  return `${heading('LITTLE TREASURES, BIG POSSIBILITIES','装备工坊','当前职业独立穿戴，闲置装备放进所有职业共享的仓库。')}<div class="system-note">${icon('check')} 按攻击、生存与特殊属性的综合评分自动换装；同分保留当前装备。栏位强化归当前职业；仓库装备可手动穿戴，其他职业正在使用的装备不会被替换或分解。</div><div class="section-heading"><h3>${icon('shield')} 正在穿戴</h3><span class="muted-caption">${state.heroClass==='tamer'?'契约兽 · 防具 · 两件饰品':'武器 · 防具 · 两件饰品'}</span></div><div class="item-grid loadout-grid">${EQUIPMENT_SLOTS.map(slot=>state.heroClass==='tamer'&&slot.id==='weapon'?beastLoadoutCard():itemCard(state.equipped[slot.id],slot,true)).join('')}</div><div class="filter-tabs equipment-tabs">${[['warehouse',`装备仓库 · ${number(total)}`],['upgrade','装备强化'],['craft',`图纸制作 · ${state.blueprints.length}/${BLUEPRINTS.length}`]].map(([id,label])=>`<button class="${equipmentTab===id?'selected':''}" data-action="equipment-tab" data-id="${id}">${label}</button>`).join('')}</div>${equipmentTab==='warehouse'?warehouseContent():equipmentTab==='upgrade'?enhancementContent():craftingContent()}`;
}
function talentsView() {
  return `${heading('GROW IN YOUR OWN WAY','天赋树','每升一级获得 1 点天赋，按自己的节奏培养花花。',`<span class="talent-points">可用天赋点 <b data-bind="talent-points">${talentPoints(state)}</b></span>`)}<div class="system-note">${icon('spark')} 每个职业独立获得与分配天赋点。初始赠送 1 点，每次提升消耗 1 点，前置达到 3 级解锁下一层。</div><div class="talent-tree">${['锋芒','守护','奇遇'].map((branch,i)=>`<section class="talent-branch branch-${i}"><div class="branch-heading">${icon(['sword','shield','leaf'][i])}<h3>${branch}</h3><p>${['把每一击变得更有力量','让每一步走得更加稳健','更轻快的步伐，更多的收获'][i]}</p></div>${TALENTS.filter(t=>t.branch===branch).map(t=>{
    const rank=state.talents[t.id]||0, parent=TALENTS.find(x=>x.id===t.parent);
    return `${parent?'<div class="talent-connector">↓</div>':''}<article class="talent-node ${rank?'learned':''}"><span class="talent-tier">${rank} / ${t.max}</span><h3>${t.name}</h3><p>每级${STAT_LABELS[t.stat]} +${statValue(t.stat,t.bonus)}</p><div class="talent-ranks">${Array.from({length:t.max},(_,n)=>`<i class="${n<rank?'filled':''}"></i>`).join('')}</div><small>${parent?`前置：${parent.name} ${t.required} 级`:'基础天赋 · 可直接学习'}</small><button class="button secondary" data-action="talent" data-id="${t.id}" ${talentAvailable(state,t)?'':'disabled'}>${rank===t.max?'已满级':`学习 · 1 点`}</button></article>`;
  }).join('')}</section>`).join('')}</div>`;
}
function mapView() {
  return `${heading('THE WORLD IS DELICIOUS','旅途地图','探索途中发现隐藏首领，亲手开启下一段旅途。')}<div class="world-route">${ZONES.map((z,i)=>{const locked=i>state.unlockedZone;return `<article class="zone-card ${locked?'locked':''} ${i===state.zone?'current':''}" style="--zone-color:${z.color}"><div class="zone-card-art zone-${i}"><div class="map-mountains"></div><span class="zone-pin">${icon(locked?'lock':i===state.zone?'flag':'check')}</span>${art('ingredient',z.ingredient,74,76,2)}</div><div class="zone-card-body"><div class="eyebrow">CHAPTER 0${i+1} <span>建议 Lv.${z.level}</span></div><h3>${z.name}</h3><p>${z.title}</p><div class="zone-card-bottom"><button class="text-button" data-action="travel" data-id="${i}" ${locked||['rest','task'].includes(state.phase)?'disabled':''}>${locked?'尚未解锁':i===state.zone?'正在探索':'前往探索'} ${icon(locked?'lock':'arrow')}</button></div>${state.bossRooms[i]?`<button class="button map-boss-button" data-action="boss" data-id="${i}" ${['rest','task'].includes(state.phase)||state.inBoss?'disabled':''}>${icon('flag')} 进入 Boss 房</button>`:`<p class="map-boss-hint">${state.inBoss&&state.zone===i?'正在挑战首领':locked?'击败前一区域首领后解锁':'探索中有机会发现 Boss 房'}</p>`}</div></article>`;}).join('')}</div><p class="page-hint">${icon('flag')} Boss 房需要手动进入。击败首领解锁下一站；发现的入口会保留，离线期间也不会自动进入。</p>`;
}
function renderView() {
  lastProgression=progressionKey();
  document.querySelectorAll('.nav-item').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);el.setAttribute('aria-current',el.dataset.view===view?'page':'false');});
  const target=document.getElementById('main-view');
  target.innerHTML=({adventure:adventureView,equipment:equipmentView,talents:talentsView,beasts:beastsView,kitchen:kitchenView,bestiary:bestiaryView,map:mapView}[view] || adventureView)();
  paintArt(target); lastLog=''; syncUI();
}
function setText(selector, value) { document.querySelectorAll(selector).forEach(el=>{if(el.textContent!==String(value)) el.textContent=value;}); }
function progressionKey() {
  if(view==='beasts') return `${view}|${state.heroClass}|${state.beastRevision}|${JSON.stringify(stats(state))}`;
  if(view==='equipment') return `${view}|${state.heroClass}|${state.nextItemId}|${state.inventoryRevision}|${JSON.stringify(state.autoSalvage)}|${state.level}|${state.blueprints.join(',')}|${Object.values(state.gear).join(',')}`;
  if(view==='talents') return `${view}|${state.heroClass}|${state.level}|${JSON.stringify(state.talents)}`;
  if(view==='map') return `${view}|${state.zone}|${state.unlockedZone}|${state.bossRooms.join(',')}|${state.inBoss}|${state.phase==='rest'}|${state.phase==='task'}`;
  return view;
}
function syncUI() {
  const st=stats(state), zone=ZONES[state.zone], total=Object.values(state.inventory).reduce((a,b)=>a+b,0);
  const resting=state.phase==='rest';
  const values={ gold:number(state.gold), inventory:number(total), level:state.level, hp:state.hp, maxHp:st.maxHp, xp:state.xp, xpNeeded:xpNeeded(state.level), attack:st.attack, defense:st.defense, crit:statValue('crit',st.crit), attackSpeed:st.speed, luck:st.luck, dodge:statValue('dodge',st.dodge), lifesteal:statValue('lifesteal',st.lifesteal), 'talent-points':talentPoints(state), 'revival-countdown':revivalCountdown(), 'encounter-mode':state.inBoss?'首领领地':'野外探索', chapter:String(state.zone+1).padStart(2,'0'), stage:`区域 0${state.zone+1}`, round:String(state.round).padStart(2,'0'), speed:state.speed, 'pause-label':state.running?'暂停':'继续', 'battle-status':!ownsGame?'另一窗口正在冒险':resting?'等待复活':!state.running?'休息一下':state.phase==='travel'?'寻找下一位对手':'自动战斗中', 'global-status':!ownsGame?'已在另一窗口继续冒险':resting?`复活倒计时 ${revivalCountdown()}`:state.running?'冒险正在自动进行':'冒险已暂停', turn:resting?`复活倒计时 ${revivalCountdown()}`:state.phase==='travel'?'拾起战利品，继续前行':state.phase==='hero'?'花花准备出手':'魔物准备出手', discovered:Object.keys(state.discovered).length };
  const notice=document.getElementById('encounter-notice'), noticeKey=`${resting}|${state.reviveAt}|${state.inBoss}|${state.bossRooms[state.zone]}|${state.zone}`;
  if(notice && notice.dataset.key!==noticeKey){notice.innerHTML=encounterNotice();notice.dataset.key=noticeKey;}
  const journey=document.getElementById('journey-panel'),journeyKey=`${state.phase==='event'}|${state.journeyCount}|${state.shopRevision}|${resting}|${state.fieldTask?.startedAt}|${state.fieldTask?.completedAt}`;
  if(journey&&journey.dataset.key!==journeyKey){journey.innerHTML=journeyPanel();journey.dataset.key=journeyKey;}
  if(state.phase==='travel')values.turn='沿着小径，慢慢探索';
  if(state.phase==='event'){
    values['battle-status']=!ownsGame?'另一窗口正在冒险':!state.running?'奇遇暂停中':'旅途奇遇中';
    values.turn=`${JOURNEY_EVENTS[state.journeyEvent.kind].name} · 稍作停留`;
  }
  if(state.phase==='task'){values['battle-status']=!ownsGame?'另一窗口正在冒险':'正在处理旅途事务';if(ownsGame)values['global-status']='花花正在忙碌，事务按现实时间处理';values.turn=`${FIELD_TASKS[state.fieldTask.kind].name} · 完成后继续探索`;}
  if(['travel','event','rest','task'].includes(state.phase))values.round='—';
  if(state.heroClass==='tamer'&&['hero','enemy'].includes(state.phase))values.turn=state.activeBeast?`${beastName(state.activeBeast)}并肩作战`:beastBattleStatus();
  Object.entries(values).forEach(([key,value])=>setText(`[data-bind="${key}"]`,value));
  document.querySelectorAll('[data-bar="hp"]').forEach(el=>el.style.width=`${Math.max(0,state.hp/st.maxHp*100)}%`);
  document.querySelectorAll('[data-bar="xp"]').forEach(el=>el.style.width=`${state.xp/xpNeeded(state.level)*100}%`);
  document.querySelectorAll('[data-stock]').forEach(el=>el.textContent=number(state.inventory[el.dataset.stock]));
  document.querySelectorAll('[data-material]').forEach(el=>el.textContent=number(state.materials[el.dataset.material]));
  document.querySelectorAll('[data-gear-name]').forEach(el=>{const slot=EQUIPMENT_SLOTS.find(x=>x.id===el.dataset.gearName),item=state.equipped[slot.id];el.textContent=item?itemName(item):slot.starter;el.style.color=item?QUALITIES[item.quality].color:'';});
  document.querySelectorAll('[data-gear-level]').forEach(el=>el.textContent=`+${state.gear[el.dataset.gearLevel]}`);
  document.querySelectorAll('[data-gear-cost]').forEach(el=>el.textContent=number(gearCost(state,el.dataset.gearCost)));
  document.querySelectorAll('[data-gear-materials]').forEach(el=>el.textContent=Object.entries(gearMaterialCost(state,el.dataset.gearMaterials)).map(([id,n])=>`${MATERIALS.find(m=>m.id===id).name} ${number(state.materials[id])}/${number(n)}`).join(' · '));
  document.querySelectorAll('[data-action="upgrade"]').forEach(el=>{const cost=gearMaterialCost(state,el.dataset.id);el.disabled=!ownsGame||(state.heroClass==='tamer'&&el.dataset.id==='weapon')||state.gear[el.dataset.id]>=100||state.gold<gearCost(state,el.dataset.id)||Object.entries(cost).some(([id,n])=>state.materials[id]<n);el.title=`消耗金币 ${number(gearCost(state,el.dataset.id))}，${Object.entries(cost).map(([id,n])=>`${MATERIALS.find(m=>m.id===id).name} ${number(n)}`).join('、')}`;});
  document.querySelectorAll('[data-action="talent"]').forEach(el=>el.disabled=!ownsGame||!talentAvailable(state,TALENTS.find(t=>t.id===el.dataset.id)));
  document.querySelectorAll('[data-action="craft"]').forEach(el=>{const b=BLUEPRINTS.find(b=>b.id===el.dataset.id),cost=craftingCost(state,b);el.disabled=!ownsGame||!state.blueprints.includes(b.id)||state.gold<cost.gold||state.inventory[b.ingredient]<cost.ingredient||Object.entries(cost.materials).some(([key,n])=>state.materials[key]<n);});
  document.querySelectorAll('[data-action="boss"]').forEach(el=>el.disabled=!ownsGame||resting||state.phase==='task'||state.inBoss||!state.bossRooms[Number(el.dataset.id)]);
  document.querySelectorAll('[data-action="cook"]').forEach(el=>el.classList.toggle('ready',state.inventory[el.dataset.id]>=recipeCost(state,el.dataset.id)));
  document.querySelectorAll('[data-wave]').forEach(el=>{el.classList.toggle('complete',Number(el.dataset.wave)<state.wave);el.classList.toggle('current',Number(el.dataset.wave)===state.wave);});
  document.querySelectorAll('[data-monster-count]').forEach(el=>el.textContent=state.discovered[el.dataset.monsterCount] || 0);
  setText('#zone-name',zone.name);setText('#zone-english',zone.sub);setText('#zone-description',zone.description);
  setText('#enemy-name',MONSTERS[state.enemy.id].name);setText('#enemy-hp',`${state.enemy.hp} / ${state.enemy.maxHp}`);
  setText('#zone-weather',`${INGREDIENTS.find(x=>x.id===zone.ingredient).name}香气弥漫`);
  setText('#battle-location',state.inBoss?'首领的领地':['林间小径','潮汐浅滩','矿洞深处','金色丘陵','熔岩小径','香草花海'][state.zone]);
  setText('#journey-tip',state.zone===5?'在秘境中收集香草，研发你的最终风味。':`击败区域首领，向${ZONES[state.zone+1].name}出发。`);
  const travelMessage=document.getElementById('travel-message');
  if(travelMessage) { travelMessage.textContent=state.phase==='travel'?'沿着小径，发现旅途中的惊喜':state.phase==='event'?`${JOURNEY_EVENTS[state.journeyEvent.kind].name} · 旅途中也有新故事`:state.phase==='task'?`${FIELD_TASKS[state.fieldTask.kind].name} · 正在用心处理`:resting?`营火守候 · ${revivalCountdown()} 后复活`:'';travelMessage.classList.toggle('visible',['travel','rest','event','task'].includes(state.phase)); }
  document.querySelector('.enemy-label')?.classList.toggle('hidden',['travel','rest','event','task'].includes(state.phase));
  const pause=document.querySelector('.pause-control'); if(pause) { const svg=pause.querySelector('svg'); if(svg) svg.outerHTML=icon(state.running?'pause':'play'); }
  document.querySelectorAll('.live-dot').forEach(el=>el.classList.toggle('paused',!state.running));
  document.querySelectorAll('.sound-button').forEach(el=>{el.innerHTML=icon(state.sound?'sound':'mute');el.setAttribute('title',state.sound?'关闭音效':'开启音效');el.setAttribute('aria-label',state.sound?'关闭音效':'开启音效');});
  const log=document.getElementById('battle-log'), key=state.logs.map(x=>x.text+x.time).join('|');
  if(log && key!==lastLog) {
    log.innerHTML=state.logs.slice(0,4).map(l=>`<div class="log-item ${l.type}"><span class="log-bullet"></span><p>${escapeHTML(l.text)}</p><time>${new Date(l.time).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})}</time></div>`).join('');lastLog=key;
  }
  document.querySelectorAll('[data-achievement-progress]').forEach(el=>{const a=ACHIEVEMENTS.find(a=>a.id===el.dataset.achievementProgress);el.textContent=`${Math.min(a.goal,achievementProgress(state,a))} / ${a.goal}`;});
  document.querySelectorAll('[data-action="claim"]').forEach(el=>{const a=ACHIEVEMENTS.find(a=>a.id===el.dataset.id);el.disabled=state.claimed.includes(a.id)||achievementProgress(state,a)<a.goal;});
  if(state.fieldTask?.completedAt===null){setText('[data-task-countdown]',countdown(state.fieldTask.finishAt));document.querySelectorAll('[data-task-progress]').forEach(el=>el.style.width=`${Math.min(100,Math.max(0,(Date.now()-state.fieldTask.startedAt)/(state.fieldTask.finishAt-state.fieldTask.startedAt)*100))}%`);}
  document.querySelectorAll('[data-action="equip-item"]').forEach(el=>{const item=state.warehouse.find(x=>x.id===Number(el.dataset.id));el.disabled=!ownsGame||!item||(state.heroClass==='tamer'&&item.slot==='weapon');});
  document.querySelectorAll('[data-action="unequip-item"]').forEach(el=>el.disabled=!ownsGame);
  syncFlyer();syncBeasts();syncMini();
}

function save() {
  if(!ownsGame) return;
  try { localStorage.setItem(SAVE_KEY,serialize(state)); storageAvailable=true;setText('#save-status','冒险进度自动保存'); }
  catch { storageAvailable=false;setText('#save-status','存储不可用 · 请在设置中导出存档'); }
}
function notify(text) {
  const toast=document.getElementById('toast'); toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),3500);
}
function showModal(content,wide=false) {
  modal.className=wide?'wide':'';
  modal.innerHTML=`<button class="modal-close icon-button" data-action="close" aria-label="关闭">${icon('close')}</button>${content}`;
  if(!modal.open) modal.showModal();paintArt(modal);syncUI();
}
function classDialog() {
  showModal(`<div class="eyebrow">FIVE PATHS, ONE SHARED JOURNEY</div><h2>选择你的职业旅途</h2><p class="modal-subtitle">每个职业独立保存等级、经验、穿戴装备、栏位强化与天赋。金币、素材、图纸、风味和仓库共享。任一职业达到要求即可永久解锁新职业。</p><p class="class-switch-note">转职后恢复该职业的成长，重新开始探索；等级不足时返回较低等级的区域。休养和现实事务的期限保持不变。</p><div class="class-grid">${CLASSES.map(c=>{
    const p=classProgress(state,c.id),locked=highestLevel(state)<c.level;
    return `<article class="class-card ${state.heroClass===c.id?'selected':''}">${art('hero',c.id,120,142,3)}<h3>${c.name} <small>Lv.${p.level}</small></h3><span>${c.label}</span><p>${c.description}</p><div class="class-progress">经验 ${number(p.xp)} / ${number(xpNeeded(p.level))}<br>装备 ${Object.values(p.equipped).filter(Boolean).length} 件 · 强化合计 +${Object.values(p.gear).reduce((a,b)=>a+b,0)}</div><button class="button ${state.heroClass===c.id?'secondary':''}" data-action="class" data-id="${c.id}" ${locked?'disabled':''}>${state.heroClass===c.id?'当前职业':locked?`任一职业 Lv.${c.level} 解锁`:`切换为${c.name}`}</button></article>`;
  }).join('')}</div>`,true);
}
function achievementsDialog() {
  showModal(`<div class="eyebrow">THE LITTLE ADVENTURE JOURNAL</div><h2>每一步，都值得记录。</h2><p class="modal-subtitle">已击败 ${number(state.kills)} 只魔物 · 已收集 ${number(state.totalIngredients)} 份调料</p><div class="achievement-list">${ACHIEVEMENTS.map(a=>{const claimed=state.claimed.includes(a.id),ready=achievementProgress(state,a)>=a.goal;return `<div class="achievement-row ${ready?'earned':''}"><span class="achievement-medal">${icon(claimed?'check':'trophy')}</span><div><h3>${a.name}</h3><p>${a.description} <b data-achievement-progress="${a.id}">${Math.min(a.goal,achievementProgress(state,a))} / ${a.goal}</b></p></div><button class="button secondary" data-action="claim" data-id="${a.id}" ${claimed||!ready?'disabled':''}>${claimed?'已领取':`${icon('coin')} ${a.reward}`}</button></div>`;}).join('')}</div>`);
}
function settingsDialog() {
  showModal(`<div class="eyebrow">MAKE YOURSELF AT HOME</div><h2>旅途小设置</h2><p class="modal-subtitle">按你喜欢的节奏，慢慢成为更美味的自己。</p><div class="setting-row"><div><b>战斗音效</b><p>轻柔的像素打击音，默认关闭</p></div><button class="button secondary sound-button" data-action="sound" aria-label="切换音效">${icon(state.sound?'sound':'mute')}</button></div><div class="setting-row"><div><b>本地存档</b><p>${storageAvailable?'每 5 秒自动保存，也可手动备份。':'浏览器存储不可用，请导出备份。'}</p></div><button class="button secondary" data-action="save">立即保存</button></div><div class="setting-row"><div><b>带着花花去别处</b><p>通过存档文件在不同浏览器之间迁移</p></div><div class="setting-buttons"><button class="button secondary" data-action="export">${icon('download')} 导出</button><button class="button secondary" data-action="import">导入</button></div></div><div class="setting-note">${icon('clock')} 页面在后台时继续按真实时间结算。浏览器休眠或关闭后，重回冒险可领取最长 8 小时的离线收获。</div>`);
}
function helpDialog() {
  showModal(`<div class="eyebrow">YOUR FIRST LITTLE ADVENTURE</div><h2>欢迎来到爆米花物语</h2><p class="modal-subtitle">花花是一颗原味爆米花。它相信世界上一定有一种调料，能让自己变得独一无二。</p><div class="help-steps"><p><b>01 · 放心出发</b>战斗自动进行，击败魔物获得经验、金币、调料、素材、装备和图纸。更高评分的装备自动穿戴，多余装备存入仓库。</p><p><b>02 · 越来越美味</b>装备工坊中可按图纸制作武器、防具、护符和戒指；强化同时消耗金币与素材，并随栏位保留。闲置装备可单件或整组分解；自动分解可筛选品质、等级和部位，锁定装备始终保留。职业等级、经验、装备、强化和天赋独立保存；共享仓库可手动取用装备。新职业从 Lv.1 开始，天赋初始赠送 1 点，每次升级再得 1 点；厨房风味对所有职业永久生效。</p><p><b>03 · 去更远的地方</b>持续击败区域魔物，有机会发现隐藏 Boss 房。入口会保留，必须手动进入；胜利获得专属装备、素材和图纸，并解锁下一站。</p><p><b>04 · 属于你的战斗方式</b>速度越高出手越快；幸运提高掉率与品质；闪避可躲开攻击；生命偷取按实际造成的伤害恢复生命。装备与天赋都能提升这些属性。</p><p><b>05 · 倒下后，再出发</b>死亡后扣除 10% 金币与各类素材（向上取整），保留等级、装备、图纸、天赋和强化。现实时间 10 分钟后自动满血复活；暂停、倍速和刷新不影响倒计时。</p><p><b>06 · 小径上的新故事</b>战斗与事件之间会经过较长的探索，可能采到素材、意外受伤、休息恢复或收到传单。探索不显示剩余时间。采集晶矿、修复营地、照料精灵需要现实时间 3、5、10 分钟，处理期间停止遇怪，到期自动发放谢礼并继续探索。可手动花金币订购传单商品，按现实时间配送并自动入库。传单每 30 分钟刷新补货，已付款订单不受影响；查看传单和等待配送都不会中断挂机。</p><p><b>07 · 把冒险装进小窗</b>点击「小窗冒险」打开独立观战窗口。支持画中画的浏览器可置顶；其余浏览器打开普通小窗口。暂停时不积累离线收益。</p><p><b>08 · 和魔物成为伙伴</b>Lv.1 可选择驯兽师，首次转职赠送黄油小菇；不使用武器，由契约兽攻击并优先承伤。普通魔物基础签约概率 20%，重复契约变成同种晶体，可在营地强化。伙伴倒下后现实时间 1 小时恢复，自动换召期间花花承伤。驯兽师击败首领必得 Boss 宝宝，喂养风味精华与首领素材至 3 阶才能出战。</p></div><button class="button" data-action="close">准备好了，继续冒险 ${icon('arrow')}</button>`);
}
function showOfflineReport() {
  if(!offlineReport) return;
  const r=offlineReport;offlineReport=null;
  showModal(`<div class="offline-icon">${art('hero',state.heroClass,120,125,3)}</div><div class="eyebrow">WELCOME BACK, LITTLE ADVENTURER</div><h2>花花的离线冒险记录。</h2><p class="modal-subtitle">花花又冒险了 ${r.minutes} 分钟${r.capped?'（按最多 8 小时结算）':''}，所有收益和死亡损失均已结算。</p><div class="offline-rewards"><div>${icon('coin')}<b>${signed(r.gold)}</b><span>金币</span></div><div>${icon('bag')}<b>${signed(r.ingredients)}</b><span>调料</span></div><div>${icon('sword')}<b>${number(r.kills)}</b><span>击败魔物</span></div></div><p class="offline-level">${r.level>0?`还升了 ${r.level} 级！现在是 Lv.${state.level}。`:'收获已自动放进背包。'}</p><button class="button" data-action="close">满载而归，继续冒险 ${icon('arrow')}</button>`);
}
function sound(type) {
  if(!state.sound || document.hidden || !soundContext) return;
  const osc=soundContext.createOscillator(),gain=soundContext.createGain();osc.connect(gain);gain.connect(soundContext.destination);
  osc.type='triangle';const t=soundContext.currentTime;osc.frequency.setValueAtTime(type==='victory'?660:type==='hero'?310:160,t);osc.frequency.exponentialRampToValueAtTime(type==='victory'?880:100,t+.10);gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.14);osc.start(t);osc.stop(t+.15);
}

function miniHTML() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>花花的小窗冒险 · 爆米花物语</title><style>*{box-sizing:border-box}body{margin:0;background:#253d32;color:#eee6ce;font:13px 'Microsoft YaHei',sans-serif}header,footer{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;gap:12px}header b{color:#f3d283}header span{font-size:11px;color:#b7c5a7}canvas{width:100%;display:block;image-rendering:pixelated}footer{padding:11px 16px}button{background:#e8cb84;border:0;border-radius:4px;padding:7px 13px;color:#394d3b;cursor:pointer;font:inherit}#mini-status{font-size:11px;color:#c7cbb1}.progress{height:3px;background:#586c4c}.progress i{display:block;height:100%;background:#d8bd73}</style></head><body><header><b>✦ 花花的小窗冒险</b><span id="mini-zone"></span></header><canvas id="mini-scene" width="800" height="360" aria-label="自动战斗场景"></canvas><div class="progress"><i id="mini-health"></i></div><footer><span id="mini-status"></span><button id="mini-pause">暂停</button><button id="mini-return">返回</button></footer></body></html>`;
}
async function openMini() {
  if(miniWindow && !miniWindow.closed) { miniWindow.focus();return; }
  try {
    if('documentPictureInPicture' in window) {
      miniWindow=await window.documentPictureInPicture.requestWindow({width:520,height:330});
    } else {
      miniWindow=window.open('','popcorn-adventure-window','popup=yes,width=540,height=350,resizable=yes');
    }
    if(!miniWindow) {notify('小窗未能打开，请允许此页面弹出窗口后重试。');return;}
    miniWindow.document.open();miniWindow.document.write(miniHTML());miniWindow.document.close();
    miniCanvas=miniWindow.document.getElementById('mini-scene');
    miniWindow.document.getElementById('mini-pause').addEventListener('click',()=>handleAction('pause'));
    miniWindow.document.getElementById('mini-return').addEventListener('click',()=>{window.focus();miniWindow.close();});
    miniWindow.addEventListener('pagehide',()=>{miniCanvas=null;miniWindow=null;});
    syncMini();
    const miniLoop=()=>{if(!miniWindow || miniWindow.closed)return;drawMini();miniWindow.requestAnimationFrame(miniLoop);};
    miniWindow.requestAnimationFrame(miniLoop);
    notify('小窗已开启，花花会继续自动冒险。');
  } catch {notify('当前浏览器暂时无法打开画中画，请尝试 Chrome 或 Edge。');}
}
function syncMini() {
  if(!miniWindow || miniWindow.closed) {miniCanvas=null;return;}
  const d=miniWindow.document;
  d.getElementById('mini-zone').textContent=`${ZONES[state.zone].name} · ${state.inBoss?'首领领地':'野外探索'}`;
  d.getElementById('mini-status').textContent=state.phase==='rest'?`复活倒计时 ${revivalCountdown()}`:state.phase==='task'?`${FIELD_TASKS[state.fieldTask.kind].name} · 剩余 ${countdown(state.fieldTask.finishAt)}`:`Lv.${state.level} · 生命 ${state.hp}/${stats(state).maxHp} · ${number(state.gold)} 金币`;
  d.getElementById('mini-pause').textContent=state.running?'暂停':'继续';
  d.getElementById('mini-health').style.width=`${state.hp/stats(state).maxHp*100}%`;
}
function drawMini() { if(miniCanvas && miniWindow && !miniWindow.closed) drawScene(miniCanvas,state,performance.now(),{...visual,scroll:sceneScroll,monsterKind:MONSTERS[state.enemy.id].kind}); }

async function handleAction(action, id, target) {
  const mutations=['equip-item','unequip-item','beast-prefer','beast-upgrade','beast-feed','upgrade','cook','travel','class','claim','pause','speed','import','craft','talent','boss','salvage','salvage-stack','salvage-matching','item-lock','salvage-save','order','flyer-discard'];
  if(!ownsGame && mutations.includes(action)) {notify('冒险已在另一个窗口运行，请在那个窗口操作。');return;}
  if(ownsGame) advance(state);
  let result;
  switch(action) {
    case 'nav': view=target?.dataset.view || 'adventure';renderView();break;
    case 'upgrade': result=upgradeGear(state,id);break;
    case 'equip-item': result=equipWarehouseItem(state,Number(id));break;
    case 'unequip-item': result=unequipItem(state,id);break;
    case 'beast-prefer': result=preferBeast(state,id);break;
    case 'beast-upgrade': result=upgradeBeast(state,id);break;
    case 'beast-feed': result=feedBeast(state,id);break;
    case 'salvage': result=salvageItem(state,Number(id));break;
    case 'salvage-stack': result=salvageItem(state,Number(id),state.warehouse.find(item=>item.id===Number(id))?.count);break;
    case 'salvage-matching': result=salvageMatching(state);break;
    case 'item-lock': result=toggleItemLock(state,Number(id));break;
    case 'salvage-settings': salvageSettingsDialog();break;
    case 'salvage-save': {
      result=setAutoSalvage(state,{enabled:document.getElementById('salvage-enabled').checked,maxQuality:Number(document.getElementById('salvage-quality').value),maxLevel:Number(document.getElementById('salvage-level').value),slots:[...document.querySelectorAll('input[name="salvage-slot"]:checked')].map(input=>input.value),includeSpecial:document.getElementById('salvage-special').checked});
      if(result.ok)modal.close();break;
    }
    case 'flyer-open': flyerDialog();break;
    case 'flyer-discard': result=discardFlyer(state,Number(id));break;
    case 'order': result=placeOrder(state,Number(target.dataset.flyer),id);break;
    case 'equipment-tab': equipmentTab=id;renderView();break;
    case 'warehouse-filter': warehouseFilter=id;warehousePage=0;renderView();break;
    case 'warehouse-page': warehousePage=Math.max(0,Number(id));renderView();break;
    case 'craft': result=craft(state,id);if(result.ok)renderView();break;
    case 'talent': result=upgradeTalent(state,id);if(result.ok)renderView();break;
    case 'boss': result=enterBoss(state,Number(id));if(result.ok){view='adventure';renderView();}break;
    case 'cook': result=cook(state,id);if(result.ok) renderView();break;
    case 'travel': result=travel(state,Number(id));if(result.ok) {view='adventure';renderView();}break;
    case 'class': result=changeClass(state,id);if(result.ok) {renderSidebar();classDialog();}break;
    case 'claim': result=claimAchievement(state,id);if(result.ok) achievementsDialog();break;
    case 'pause': state.running=!state.running;state.lastTick=Date.now();notify(state.running?'背上小锅盖，继续冒险！':'已暂停冒险，花花在等你。');break;
    case 'speed': state.speed=state.speed===1?2:1;state.lastTick=Date.now();notify(`战斗速度已设为 ${state.speed}×`);break;
    case 'filter': bestiaryFilter=id;renderView();break;
    case 'classes': classDialog();break;
    case 'achievements': achievementsDialog();break;
    case 'settings': settingsDialog();break;
    case 'help': helpDialog();break;
    case 'close': modal.close();break;
    case 'mini': await openMini();break;
    case 'sound': {
      state.sound=!state.sound;
      if(state.sound) {try {soundContext ||= new (window.AudioContext || window.webkitAudioContext)();await soundContext.resume();sound('victory');}catch{state.sound=false;notify('当前浏览器无法播放音效。');}}
      break;
    }
    case 'save': save();notify(storageAvailable?'存档保存好了，下次见。':'本地存储不可用，请使用导出存档。');break;
    case 'export': {
      const blob=new Blob([serialize(state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`爆米花物语-Lv${state.level}-存档.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('存档已导出，记得保管好这份美味。');break;
    }
    case 'import': {
      const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
      input.addEventListener('change',async()=>{
        const file=input.files?.[0];input.remove();if(!file)return;
        if(file.size>32_000_000){notify('这个存档太大了，请选择有效的游戏存档。');return;}
        try {const imported=restore(await file.text());if(!imported){notify('无法读取存档，请选择爆米花物语导出的 JSON 文件。');return;}
          showModal(`<div class="eyebrow">CONTINUE ANOTHER ADVENTURE</div><h2>接续这段旅途？</h2><p class="modal-subtitle">即将载入 Lv.${imported.level} 的勇士，位于${ZONES[imported.zone].name}。当前进度将被替换。</p><button class="button" id="confirm-import">载入这份存档</button><button class="button secondary" data-action="close">保留当前进度</button>`);
          document.getElementById('confirm-import').onclick=()=>{if(!ownsGame)return;state=imported;state.lastTick=Date.now();settleRealTime(state,state.lastTick);lastEvent=-1;save();modal.close();shell();notify('旅途接上了，欢迎回来。');};
        }catch{notify('读取失败，请重试。');}
      },{once:true});input.addEventListener('cancel',()=>input.remove(),{once:true});input.hidden=true;document.body.append(input);input.click();break;
    }
  }
  if(result) notify(result.message);
  if(lastProgression!==progressionKey())renderView();
  syncUI();save();
}
document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;event.preventDefault();handleAction(target.dataset.action,target.dataset.id,target);});
document.addEventListener('change',event=>{if(event.target.id==='auto-travel'){if(!ownsGame){event.target.checked=state.autoTravel;return;}state.autoTravel=event.target.checked;save();notify(state.autoTravel?'达到建议等级后，会自动踏上新的旅途。':'会留在当前区域，慢慢收集调料。');}});

modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
window.addEventListener('keydown',event=>{if(event.code==='Space'&&!modal.open&&!['INPUT','BUTTON','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();handleAction('pause');}});

function pulse() {
  if(ownsGame) {
    const oldDiscovered=Object.keys(state.discovered).length;
    advance(state);
    if((view==='bestiary'&&Object.keys(state.discovered).length!==oldDiscovered)||lastProgression!==progressionKey())renderView();
    if(state.event.id!==lastEvent){lastEvent=state.event.id;visual={...state.event,at:performance.now(),monsterKind:MONSTERS[state.enemy.id].kind};sound(state.event.type);}
    if(Date.now()-lastSave>5000){save();lastSave=Date.now();}
  }
  syncUI();
  if(document.hidden) drawMini();
}
function animate(time) {
  const delta=Math.min(50,time-previousFrame);previousFrame=time;
  if(state.running && state.phase==='travel')sceneScroll+=delta*.035*state.speed;
  if(!document.hidden){const canvas=document.getElementById('battle-canvas');if(canvas)drawScene(canvas,state,time,{...visual,scroll:sceneScroll,monsterKind:MONSTERS[state.enemy.id].kind});}
  frameRequest=requestAnimationFrame(animate);
}
// A worker provides a background heartbeat; elapsed wall time remains authoritative
// even if a browser suspends the worker, timers, or the entire computer.
let clockWorker=null;
function startClock() {
  try {
    const url=URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),250)'],{type:'text/javascript'}));
    clockWorker=new Worker(url);URL.revokeObjectURL(url);clockWorker.onmessage=pulse;
    clockWorker.onerror=()=>{clockWorker?.terminate();clockWorker=null;};
  } catch { /* The main timer is also a safe fallback for local file mode. */ }
  setInterval(pulse,1000);
}
document.addEventListener('visibilitychange',()=>{pulse();save();});
window.addEventListener('pagehide',()=>{if(ownsGame){advance(state);save();}miniWindow?.close();lockRelease?.();});
window.addEventListener('storage',event=>{if(event.key===SAVE_KEY&&!ownsGame){const updated=restore(event.newValue);if(updated){const needsRender=updated.zone!==state.zone||updated.heroClass!==state.heroClass||Object.keys(updated.discovered).length!==Object.keys(state.discovered).length;state=updated;if(needsRender){renderSidebar();renderView();}else if(lastProgression!==progressionKey())renderView();syncUI();}}});

function beginOwnedGame() {
  const fresh=(()=>{try{return restore(localStorage.getItem(SAVE_KEY));}catch{return null;}})();
  if(fresh)state=fresh;
  const old={gold:state.gold,level:state.level,kills:state.kills,ingredients:Object.values(state.inventory).reduce((a,b)=>a+b,0)};
  const elapsed=Date.now()-state.lastTick;
  advance(state);
  if(elapsed>60000 && state.running)offlineReport={minutes:Math.floor(Math.min(elapsed,MAX_OFFLINE_MS)/60000),gold:state.gold-old.gold,level:state.level-old.level,kills:state.kills-old.kills,ingredients:Object.values(state.inventory).reduce((a,b)=>a+b,0)-old.ingredients,capped:elapsed>MAX_OFFLINE_MS};
  ownsGame=true;save();shell();showOfflineReport();
}
async function start() {
  shell();startClock();frameRequest=requestAnimationFrame(animate);
  if(navigator.locks) {
    ownsGame=false;
    navigator.locks.request('popcorn-tales-owner',{ifAvailable:true},async lock=>{
      if(lock){beginOwnedGame();await new Promise(resolve=>lockRelease=resolve);}
      else {
        syncUI();notify('已连接到另一个冒险窗口，进度会自动同步。');
        navigator.locks.request('popcorn-tales-owner',async()=>{beginOwnedGame();await new Promise(resolve=>lockRelease=resolve);});
      }
    }).catch(()=>beginOwnedGame());
  } else beginOwnedGame();
}
start();
