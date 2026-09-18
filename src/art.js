import { MONSTERS, beastStats } from './engine.js';

const PALETTE = {
  outline: '#343d37', cream: '#fff0c5', pale: '#fff8df', gold: '#eac66d', ochre: '#b28b4e',
  skin: '#e7be82', brown: '#735947', red: '#af6048', darkred: '#7d4840', steel: '#839d99', steelLight: '#b1c6b9',
  green: '#809764', darkgreen: '#526e51', purple: '#796393', purpleLight: '#ad90b1', white: '#ede8d3',
};
function box(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function polygon(ctx, points, color) {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
}

export function drawHero(ctx, x, y, scale = 3, heroClass = 'knight', frame = 0, facing = 1) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale * facing, scale);
  const p = PALETTE;
  const r = (x, y, w, h, c) => box(ctx, x, y, w, h, p[c] || c);
  const step = frame ? 1 : 0;
  r(-7, -12, 5, 10, 'darkred'); r(-9, -9, 4, 7, 'red'); r(-8, -4, 5, 2, 'darkred');
  r(-5, -5, 4, 5 - step, 'outline'); r(2, -5, 4, 5, 'outline');
  r(-6 - step, -1, 5, 2, 'brown'); r(2 + step, -1, 5, 2, 'brown');
  r(-6, -14, 13, 10, 'outline'); r(-4, -14, 9, 9, heroClass === 'mage' ? 'purple' : heroClass === 'ranger' ? 'green' : heroClass === 'cleric' ? 'white' : 'steel');
  r(-3, -13, 3, 6, heroClass === 'cleric' ? 'gold' : 'steelLight');
  r(-5, -6, 11, 2, 'brown'); r(-1, -6, 3, 2, 'gold');
  r(-7, -24, 14, 10, 'outline'); r(-5, -24, 12, 8, 'skin');
  r(-6, -23, 2, 4, 'ochre'); r(-4, -23, 11, 5, 'cream');
  r(-2, -20, 2, 2, 'outline'); r(4, -20, 2, 2, 'outline'); r(1, -16, 3, 1, 'brown');
  r(-6, -16, 12, 3, 'red'); r(-7, -14, 4, 3, 'darkred');
  // Each head is a popped corn kernel: irregular, bright, and outlined.
  r(-7, -27, 14, 5, 'ochre'); r(-9, -26, 4, 4, 'ochre'); r(-4, -30, 8, 8, 'ochre');
  r(-6, -27, 12, 4, 'cream'); r(-8, -25, 4, 2, 'pale'); r(-3, -29, 6, 6, 'pale');
  r(4, -26, 4, 4, 'cream'); r(-4, -25, 2, 3, 'gold'); r(1, -27, 2, 2, 'gold');
  if (heroClass === 'knight') {
    r(-8, -22, 3, 8, 'steel'); r(-8, -22, 2, 4, 'steelLight');
    r(7, -13, 4, 6, 'skin'); r(10, -17, 2, 13, 'brown'); r(8, -10, 7, 2, 'gold');
    r(11, -27, 2, 17, 'steelLight'); r(10, -25, 1, 12, 'steel'); r(10, -28, 1, 3, 'white'); r(13, -28, 1, 5, 'white');
    r(-12, -14, 8, 10, 'outline'); r(-11, -15, 6, 12, 'steel'); r(-10, -13, 4, 8, 'steelLight'); r(-9, -11, 2, 4, 'gold');
  } else if (heroClass === 'ranger') {
    r(-6, -27, 14, 2, 'darkgreen'); r(-2, -29, 7, 2, 'green'); r(4, -31, 1, 3, 'red');
    r(7, -13, 4, 4, 'skin'); r(12, -21, 2, 3, 'ochre'); r(14, -18, 2, 13, 'ochre'); r(12, -5, 2, 3, 'ochre');
    r(11, -18, 1, 13, 'white'); r(7, -12, 12, 1, 'brown'); r(18, -13, 2, 3, 'steelLight');
  } else if (heroClass === 'mage') {
    r(-10, -24, 20, 3, 'purple'); r(-6, -30, 12, 6, 'purple'); r(-3, -34, 7, 5, 'purple'); r(-1, -37, 3, 4, 'purple');
    r(-5, -26, 11, 2, 'gold'); r(1, -31, 2, 3, 'gold'); r(-5, -10, 11, 7, 'purple');
    r(9, -22, 2, 23, 'ochre'); r(7, -26, 6, 6, 'gold'); r(8, -27, 4, 6, 'purpleLight'); r(9, -25, 2, 3, 'pale');
  } else if (heroClass === 'tamer') {
    r(-5, -14, 10, 8, 'green'); r(-5, -7, 11, 2, 'brown');
    r(-8, -26, 16, 2, 'darkgreen'); r(-6, -29, 12, 3, 'green');
    r(4, -31, 2, 5, 'gold'); r(6, -31, 3, 2, 'green');
    r(-10, -13, 4, 5, 'skin'); r(7, -14, 4, 4, 'skin');
    r(-11, -7, 5, 5, 'brown'); r(-10, -6, 3, 2, 'gold');
    r(0, -13, 2, 3, 'gold');
  } else {
    r(-6, -29, 12, 7, 'white'); r(-4, -33, 8, 5, 'white'); r(-1, -36, 3, 4, 'white');
    r(-1, -32, 2, 7, 'gold'); r(-3, -30, 6, 2, 'gold'); r(-6, -24, 12, 2, 'gold');
    r(10, -25, 2, 26, 'ochre'); r(7, -24, 8, 3, 'gold'); r(9, -27, 4, 9, 'gold'); r(10, -25, 2, 5, 'pale');
  }
  ctx.restore();
}

export function drawMonster(ctx, x, y, scale = 3, kind = 'mushroom', frame = 0, boss = false) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale, scale);
  const r = (x, y, w, h, color) => box(ctx, x, y, w, h, color);
  const p = PALETTE, d = p.outline;
  const bounce = frame ? -1 : 0;
  ctx.translate(0, bounce);
  if (kind === 'mushroom') {
    r(-6, -12, 13, 11, d); r(-4, -13, 10, 11, '#eed6a0'); r(-4, -3, 4, 3, '#bda56b'); r(3, -3, 5, 3, '#bda56b');
    r(-13, -20, 26, 9, '#725a3d'); r(-10, -25, 20, 5, '#725a3d'); r(-5, -28, 11, 4, '#725a3d');
    r(-11, -20, 22, 7, '#d7a54d'); r(-8, -24, 17, 7, '#e7c16a'); r(-3, -26, 8, 6, '#f0d788');
    r(-8, -21, 4, 3, '#fff0b9'); r(4, -20, 4, 3, '#fff0b9'); r(-1, -16, 4, 2, '#fff0b9');
    r(-3, -10, 2, 3, d); r(3, -10, 2, 3, d); r(0, -6, 2, 1, '#b18b62');
  } else if (kind === 'slime') {
    r(-13, -4, 27, 4, '#527b78'); r(-14, -10, 27, 6, '#527b78'); r(-10, -17, 22, 10, '#527b78'); r(-5, -20, 12, 6, '#527b78');
    r(-11, -10, 23, 7, '#a5c4ad'); r(-8, -15, 18, 7, '#c5d9bc'); r(-3, -18, 8, 7, '#dfe4c9');
    r(-6, -14, 4, 3, '#f5f1d8'); r(-7, -7, 2, 3, d); r(4, -7, 2, 3, d); r(-2, -4, 3, 1, '#769e88');
    r(1, -23, 3, 5, '#f9edce'); r(-1, -21, 7, 2, '#f9edce');
  } else if (kind === 'bee') {
    r(-10, -26 - frame * 2, 8, 9, '#c8dbd1'); r(4, -28 + frame * 2, 8, 10, '#e5e6cf');
    r(-11, -18, 23, 13, d); r(-13, -15, 25, 7, d); r(-9, -17, 18, 11, '#e8bd56');
    r(-4, -17, 4, 11, '#715d3f'); r(5, -17, 3, 11, '#715d3f'); r(-10, -14, 2, 3, d); r(-15, -12, 3, 2, '#f5e5a3');
  } else if (kind === 'crab') {
    r(-10, -15, 21, 11, '#a26e54'); r(-8, -14, 17, 8, '#dba177'); r(-5, -18, 3, 6, '#dba177'); r(4, -18, 3, 6, '#dba177');
    r(-4, -18, 2, 3, d); r(4, -18, 2, 3, d); r(-14, -11, 5, 3, '#dba177'); r(10, -11, 5, 3, '#dba177');
    r(-19, -18, 7, 10, '#dfe2c7'); r(-20, -19, 3, 6, '#f5f0d4'); r(14, -18, 7, 10, '#dfe2c7'); r(19, -20, 3, 6, '#f5f0d4');
    [-10, -4, 4, 10].forEach(v => { r(v, -5, 3, 4, '#ba805f'); r(v - 1, -2, 4, 2, '#ba805f'); });
  } else if (kind === 'bat') {
    polygon(ctx, [[-3,-17],[-18,-25],[-17,-12],[-11,-15],[-6,-8],[0,-12]], '#64546f');
    polygon(ctx, [[3,-17],[18,-25],[17,-12],[11,-15],[6,-8],[0,-12]], '#64546f');
    r(-5,-22,10,17,'#9785a0'); r(-5,-25,3,5,'#9785a0'); r(3,-25,3,5,'#9785a0'); r(-3,-17,2,3,'#f6d68c'); r(2,-17,2,3,'#f6d68c');
  } else if (kind === 'pepper') {
    r(-10, -22, 20, 20, d); r(-13, -17, 26, 12, d); r(-8, -25, 15, 22, '#827a70');
    r(-10, -18, 9, 11, '#a19a82'); r(2, -20, 7, 15, '#615e59'); r(-5, -15, 3, 3, '#edbe70'); r(4, -15, 3, 3, '#edbe70');
    r(-12, -4, 8, 5, '#595b51'); r(4, -4, 8, 5, '#595b51'); r(-3, -23, 4, 3, '#b1a38d');
  } else if (kind === 'cookie') {
    r(-8, -26, 17, 12, '#775440'); r(-10, -22, 21, 7, '#775440'); r(-7, -25, 15, 10, '#d5a66b');
    r(-6, -14, 13, 10, '#d5a66b'); r(-13, -13, 8, 4, '#d5a66b'); r(5, -13, 8, 4, '#d5a66b');
    r(-7, -5, 5, 6, '#d5a66b'); r(3, -5, 5, 6, '#d5a66b'); r(-4, -21, 2, 2, d); r(4, -21, 2, 2, d);
    r(-1, -16, 4, 1, '#fff0c5'); r(0,-12,2,2,'#725b41'); r(0,-7,2,2,'#725b41'); r(-6,-26,3,3,'#f1d0a0');
  } else if (kind === 'chili') {
    r(-3,-31,3,7,'#6b8954'); r(-2,-29,7,3,'#6b8954'); r(-6,-25,13,6,'#5c6042');
    r(-8,-22,17,14,'#964938'); r(-6,-22,13,12,'#d76b46'); r(-3,-12,10,7,'#c4543b'); r(1,-6,7,4,'#c4543b'); r(6,-4,5,2,'#c4543b');
    r(-5,-21,3,6,'#f29962'); r(-5,-16,2,3,d); r(3,-16,2,3,d); r(-1,-11,3,1,'#f5d78e');
  } else {
    r(-4,-22,9,19,'#c0cca3'); r(-7,-18,15,9,'#a2b683'); r(-3,-14,2,3,d); r(3,-14,2,3,d);
    polygon(ctx,[[-1,-21],[-14,-26],[-10,-32],[-1,-27],[3,-36],[8,-31],[4,-24],[15,-28],[16,-22],[5,-18]],'#78966d');
    r(-6,-4,5,4,'#67815e'); r(3,-4,5,4,'#67815e'); r(1,-29,2,8,'#cad494');
  }
  if (boss) {
    r(-8,-34,17,4,'#bd9049'); r(-8,-38,3,5,'#edce6d'); r(-1,-40,3,7,'#edce6d'); r(6,-38,3,5,'#edce6d'); r(-6,-34,13,2,'#ffe7a1');
  }
  ctx.restore();
}

export function drawIngredient(ctx, x, y, scale, id) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  const r = (x,y,w,h,c) => box(ctx,x,y,w,h,c);
  const color = { salt:'#cedad0', butter:'#e8bc57', pepper:'#87786c', caramel:'#c28b59', chili:'#cc6e4c', herb:'#8da475' }[id] || '#e8bc57';
  if (id === 'butter') {
    r(-11,4,23,3,'#9e9c7e'); r(-9,-5,18,10,'#af853b'); r(-9,-7,16,10,color); r(-9,-7,16,3,'#ffe39b'); r(-9,-4,3,6,'#f6d97b'); r(7,-4,2,7,'#c49b48');
  } else if (id === 'chili' || id === 'herb') {
    drawMonster(ctx,0,11,0.65,id,0);
  } else {
    r(-6,-11,12,4,'#80694f'); r(-5,-7,10,3,'#bbc3ad'); r(-9,-4,18,16,'#6e7866'); r(-7,-4,14,14,'#dce0c3'); r(-6,1,12,8,color); r(-4,-3,2,7,'#faf1d6'); r(-5,5,10,4,'#eee3bf'); r(-2,6,4,2,'#9c8c65');
  }
  ctx.restore();
}

const THEMES = [
  { sky:'#d4dbac', light:'#f3e8b8', far:'#a3b68a', mid:'#779773', leaves:'#446e56', bright:'#62855e', bark:'#485b45', grass:'#83934f', dirt:'#796c47', floor:'#414d37' },
  { sky:'#c3d9d1', light:'#f7ecd0', far:'#9fbcad', mid:'#769e94', leaves:'#527f72', bright:'#88a984', bark:'#61796b', grass:'#a5b883', dirt:'#b1a480', floor:'#818b6b' },
  { sky:'#99969d', light:'#c2bbba', far:'#858391', mid:'#686d7b', leaves:'#515e66', bright:'#7b8080', bark:'#535a57', grass:'#82836a', dirt:'#767067', floor:'#444b4e' },
  { sky:'#e2d3a3', light:'#fae7ba', far:'#bdb58b', mid:'#aa976d', leaves:'#7a8055', bright:'#a69b64', bark:'#7f684b', grass:'#b49e5b', dirt:'#9a7951', floor:'#675a3c' },
  { sky:'#d9b19a', light:'#f5cc9f', far:'#b69c88', mid:'#9b806f', leaves:'#775f57', bright:'#9e795c', bark:'#62554e', grass:'#aa8758', dirt:'#936b51', floor:'#584d43' },
  { sky:'#d3d9bc', light:'#f5eacb', far:'#afb995', mid:'#8b9f7e', leaves:'#607f65', bright:'#8a9b72', bark:'#596d54', grass:'#a4ad71', dirt:'#8b805b', floor:'#4f6147' },
];
function tree(ctx,x,y,size,theme,foreground=false) {
  const s=size; const t=theme;
  box(ctx,x-3*s,y,6*s,90*s,t.bark); box(ctx,x-2*s,y,2*s,90*s,foreground?'#65714c':t.mid);
  box(ctx,x-13*s,y+15*s,12*s,3*s,t.bark); box(ctx,x+2*s,y+31*s,12*s,3*s,t.bark);
  [[-19,-8,37,9],[-25,0,49,12],[-30,11,61,13],[-24,24,52,12],[-17,34,34,7]].forEach(([a,b,c,d],i)=>box(ctx,x+a*s,y+b*s,c*s,d*s,i%2?t.leaves:t.bright));
  box(ctx,x-18*s,y+1*s,15*s,3*s,t.bright); box(ctx,x+3*s,y+14*s,20*s,4*s,t.bright);
}
function tinyMushroom(ctx,x,y,color) {
  box(ctx,x,y-4,2,5,'#d5cba1'); box(ctx,x-3,y-7,8,4,color); box(ctx,x-1,y-9,4,2,color); box(ctx,x-1,y-7,2,1,'#f3dda6');
}
export function drawScene(canvas, s, time = 0, visual = {}) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const w = 400, h = 180;
  if (canvas.width !== 800 || canvas.height !== 360) { canvas.width=800; canvas.height=360; }
  ctx.imageSmoothingEnabled = false; ctx.save(); ctx.scale(2,2);
  const theme = THEMES[s.zone] || THEMES[0];
  box(ctx,0,0,w,h,theme.sky);
  box(ctx,0,0,w,35,theme.light);
  // Stepped distant hills and layers of scrolling woodland.
  polygon(ctx,[[0,78],[20,78],[20,69],[45,69],[45,57],[69,57],[69,48],[100,48],[100,55],[120,55],[120,73],[159,73],[159,57],[188,57],[188,43],[221,43],[221,54],[248,54],[248,75],[282,75],[282,62],[311,62],[311,45],[345,45],[345,61],[378,61],[378,76],[400,76],[400,145],[0,145]],theme.far);
  const scroll = visual.scroll || 0;
  if (s.zone === 0 || s.zone === 5) {
  for(let i=0;i<15;i++) {
    const tx = i*34 - 15 - (scroll * .3) % 34;
    box(ctx,tx,26+(i%4)*9,4,116,theme.mid);
    box(ctx,tx-8,44+(i%4)*9,20,7,theme.far);
    box(ctx,tx+2,74,10,3,theme.mid);
  }
  ctx.globalAlpha=.21;
  polygon(ctx,[[203,0],[233,0],[170,141],[122,141]],'#fff8cf');
  polygon(ctx,[[274,0],[286,0],[249,142],[225,142]],'#fff8cf');
  ctx.globalAlpha=1;
  tree(ctx,18-(scroll*.4)%80,-15,1.32,theme,true); tree(ctx,456-(scroll*.4)%80,-4,1.08,theme,true);
  tree(ctx,69,7,.65,theme); tree(ctx,339,27,.60,theme);
  // Canopy at the edge leaves room for the sunlit clearing.
  box(ctx,0,0,88,12,theme.leaves); box(ctx,0,9,55,9,theme.leaves); box(ctx,310,0,90,9,theme.leaves); box(ctx,354,9,46,10,theme.leaves);
  box(ctx,91,0,24,5,theme.bright); box(ctx,282,0,35,5,theme.bright);
  // Small stepped clusters keep the canopy leafy, not a flat silhouette.
  for(let i=0;i<21;i++) {
    const xx=(i*47)%400, yy=(i*13)%37;
    if(xx<65||xx>345)box(ctx,xx,yy,5+i%7,2,theme.bright);
  }
  if(s.zone===5) {
    for(let i=0;i<24;i++) {
      const xx=(i*31-scroll*.4+4000)%400, yy=110+i%19;
      box(ctx,xx,yy,1,7,'#758766');box(ctx,xx-2,yy-2,5,3,i%2?'#dec6b9':'#f3e7c2');
    }
  }
  } else if(s.zone===1) {
    box(ctx,0,68,400,60,'#96b8ac');box(ctx,0,87,400,41,'#82aaa0');box(ctx,0,106,400,22,'#aac5b0');
    for(let i=0;i<26;i++) {
      const xx=(i*51 + (s.running?time/450:0)-scroll*.2+4000)%420-10;
      box(ctx,xx,74+i*17%52,8+i%14,1,i%3?'#cbdac0':'#e8e6c9');
    }
    polygon(ctx,[[22,70],[22,60],[33,60],[33,39],[39,39],[39,31],[45,31],[45,70]],'#f2ecce');
    box(ctx,34,58,13,4,'#96a78d');box(ctx,37,38,7,6,'#9ba788');box(ctx,18,70,42,5,'#738b77');
    box(ctx,357,44,4,86,'#78836b');box(ctx,353,36,12,13,'#78836b');
    polygon(ctx,[[358,37],[331,34],[321,43],[344,42],[357,40],[377,27],[390,33],[372,37]],'#789677');
    box(ctx,359,50,2,68,'#96a27c');
  } else if(s.zone===2) {
    box(ctx,0,0,400,25,'#4e5960');box(ctx,0,22,35,83,'#5a6269');box(ctx,365,13,35,115,'#545e64');
    for(let i=0;i<12;i++) {
      const x=i*38-(scroll*.25)%38;
      polygon(ctx,[[x,20],[x+17,20],[x+10,36+(i*17)%35]],i%2?'#657079':'#596570');
    }
    [[40,124,20],[327,129,25],[357,119,11],[15,130,13]].forEach(([x,y,sz])=>{
      polygon(ctx,[[x-sz/3,y],[x-sz/3,y-sz*.7],[x,y-sz],[x+sz/3,y-sz*.65],[x+sz/3,y]],'#b5b6c2');
      box(ctx,x-1,y-sz+4,2,sz-4,'#dcddcf');
    });
    box(ctx,63,72,3,27,'#756849');box(ctx,62,73,6,8,'#d7a765');box(ctx,64,70,3,8,'#f6d590');
    ctx.globalAlpha=.09;box(ctx,40,61,52,47,'#f8df9f');ctx.globalAlpha=1;
  } else if(s.zone===3) {
    for(let i=0;i<6;i++) {
      const xx=(i*91-scroll*.4+900)%500-40;
      box(ctx,xx,63,7,71,'#a28052');box(ctx,xx-15,44,36,18,'#c39b60');box(ctx,xx-22,58,49,14,'#b18d58');
      box(ctx,xx-10,42,25,6,'#e0bb7d');box(ctx,xx+13,68,4,10,'#bb9358');box(ctx,xx-14,67,3,6,'#c7a066');
    }
    box(ctx,225,109,42,4,'#d2b67e');box(ctx,219,113,54,4,'#dec690');box(ctx,229,117,33,5,'#d6b776');
  } else if(s.zone===4) {
    polygon(ctx,[[65,118],[112,38],[134,38],[199,118]],'#8e7267');
    polygon(ctx,[[112,38],[134,38],[143,51],[130,48],[124,55],[118,46],[107,48]],'#d49b6d');
    box(ctx,120,12,8,16,'#b69b88');box(ctx,126,4,14,13,'#c2a58d');
    polygon(ctx,[[230,128],[267,72],[280,72],[324,128]],'#94796c');
    box(ctx,0,124,400,5,'#c8986c');
    for(let i=0;i<12;i++){const xx=(i*41-scroll*.5+800)%400;box(ctx,xx,128,12,2,i%2?'#e8ae76':'#b7805c');}
  }
  polygon(ctx,[[0,130],[24,130],[24,126],[49,126],[49,129],[93,129],[93,126],[135,126],[135,130],[183,130],[183,127],[226,127],[226,130],[285,130],[285,126],[326,126],[326,129],[364,129],[364,125],[400,125],[400,153],[0,153]],theme.grass);
  box(ctx,0,142,400,38,theme.dirt); box(ctx,0,144,400,3,'#ad9862'); box(ctx,0,159,400,21,theme.floor);
  for(let i=0;i<60;i++) {
    const xx=(i*47+11-scroll+40000)%400, yy=146+(i*11)%33;
    box(ctx,xx,yy,3+(i%4),2, i%3 ? theme.dirt : '#a79965');
    if(i%2===0) { box(ctx,xx,135-(i%7),1,5,theme.leaves); box(ctx,xx-2,134-(i%7),2,2,theme.bright); }
  }
  // Little signs of a world beyond the battle.
  tinyMushroom(ctx,48,139,'#c8a05d'); tinyMushroom(ctx,55,142,'#d2b16b'); tinyMushroom(ctx,363,138,'#c8a05d');
  box(ctx,82,115,3,25,'#796847'); box(ctx,71,116,26,10,'#9b8355'); box(ctx,73,117,21,7,'#b19b67'); box(ctx,77,120,13,1,'#675e43'); box(ctx,86,118,1,5,'#675e43');
  box(ctx,318,130,19,7,'#7f8767'); box(ctx,321,126,12,5,'#929879'); box(ctx,320,130,6,2,'#abb08b');
  const animAge = Math.max(0,time-(visual.at || 0));
  const attackDuration=s.speed===2?390:550;
  const kick = animAge < attackDuration ? Math.pow(Math.sin(animAge/attackDuration*Math.PI),.7) : 0;
  const walk = s.phase==='travel' && s.running;
  const frame = Math.floor(time/(walk ? 180 : 550))%2;
  const ranged=s.heroClass!=='knight';
  const hx=142 + (visual.type==='hero'?kick*(ranged?5:103):0);
  const pet=s.heroClass==='tamer'&&s.activeBeast?s.beasts[s.activeBeast]:null;
  const px=202+(visual.type==='beast'?kick*60:0);
  const ex=280 - (visual.type==='enemy'?kick*100:visual.type==='beast-hit'?kick*52:0);
  ctx.globalAlpha=.18; box(ctx,hx-19,141,37,4,'#283d2e');
  if(!['travel','event','task'].includes(s.phase)) box(ctx,ex-22,141,44,4,'#283d2e'); ctx.globalAlpha=1;
  if(s.phase==='rest') {
    drawHero(ctx,hx,139,1.65,s.heroClass,0);
    box(ctx,hx+30,138,10,4,'#796145'); box(ctx,hx+33,131,5,9,'#d5934e'); box(ctx,hx+34,128+frame,3,10,'#f3cf75');
  } else drawHero(ctx,hx,140,1.65,s.heroClass,walk||kick>0?frame:0);
  if(pet && s.phase!=='rest') {
    const maxHp=beastStats(s,pet.id).maxHp;
    ctx.globalAlpha=.18;box(ctx,px-17,141,34,4,'#283d2e');ctx.globalAlpha=1;
    if(visual.type==='beast-hit'&&kick>.9)ctx.globalAlpha=.55;
    drawMonster(ctx,px,142,1.35,MONSTERS[pet.id].kind,frame,!!MONSTERS[pet.id].boss);
    ctx.globalAlpha=1;
    box(ctx,px-17,93,34,3,'#4c6758');box(ctx,px-17,93,34*pet.hp/maxHp,3,'#b8d68d');
    ctx.fillStyle='#e4efc9';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText('契约伙伴',px,88);
  } else if(s.heroClass==='tamer'&&s.summonCooldown&&s.phase!=='rest') {
    ctx.strokeStyle='#d2deb0';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(202,138,19,5,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e4efc9';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText('召唤中…',202,117);
    for(let i=0;i<3;i++)box(ctx,187+i*13,128-Math.round((time/90+i*7)%17),2,2,'#e2e9b8');
  }
  if(!['travel','rest','event','task'].includes(s.phase) && s.enemy.hp>0) {
    const bob=s.running ? Math.round(Math.sin(time/380)*1.4) : 0;
    const kind=visual.monsterKind || 'mushroom';
    if(['hero','beast'].includes(visual.type) && kick>.92) ctx.globalAlpha=.55;
    drawMonster(ctx,ex,141+bob,s.enemy.boss?2:1.6,kind,frame,s.enemy.boss);
    ctx.globalAlpha=1;
    const bw=s.enemy.boss?40:29;
    box(ctx,ex-bw/2,76,bw,3,'#637758'); box(ctx,ex-bw/2,76,Math.max(0,bw*s.enemy.hp/s.enemy.maxHp),3,'#e6b265');
  }
  if((s.phase==='event' && s.journeyEvent) || s.phase==='task') {
    const kind=s.phase==='task'?s.fieldTask.kind:s.journeyEvent.kind;
    if(kind==='cache') {
      box(ctx,ex-15,124,30,18,'#8b6644');box(ctx,ex-17,121,34,7,'#b79456');box(ctx,ex-2,122,4,11,'#f1d780');
      box(ctx,ex-11,130,22,2,'#604c35');
    } else if(kind==='flyer') {
      box(ctx,ex-16,106,32,35,'#c4ac77');box(ctx,ex-14,104,28,34,'#fff1c9');
      box(ctx,ex-9,110,18,5,'#839268');box(ctx,ex-9,119,11,2,'#b7a780');box(ctx,ex-9,124,18,2,'#b7a780');
      box(ctx,ex+4,118,5,4,'#dbac62');box(ctx,ex-5,130,14,3,'#d4ba84');
    } else if(kind==='repair') {
      polygon(ctx,[[ex-28,139],[ex,103],[ex+28,139]],'#87956c');
      polygon(ctx,[[ex-10,139],[ex,116],[ex+10,139]],'#54634a');
      box(ctx,ex+18,130,17,5,'#a98557');box(ctx,ex+24,124,4,15,'#c3ad76');
    } else if(kind==='rescue') {
      box(ctx,ex-24,139,48,4,'#879565');box(ctx,ex-18,134,36,5,'#d4c08b');
      drawMonster(ctx,ex,136,1.1,'herb',frame,false);
      box(ctx,ex+18,115,7,3,'#e7d8a8');box(ctx,ex+20,113,3,7,'#e7d8a8');
    } else if(kind==='hazard'||kind==='quarry') {
      box(ctx,ex-15,128,28,15,'#878b7d');box(ctx,ex-8,123,16,8,'#a7a793');box(ctx,ex+17,136,10,7,'#939681');
    } else {
      box(ctx,ex-21,135,42,8,'#779b97');box(ctx,ex-14,132,28,5,'#b1c4af');box(ctx,ex-7,133,14,2,'#e5e6c5');
    }
  }
  if(ranged && visual.type==='hero' && animAge<attackDuration) {
    const projectileX=164+Math.min(1,animAge/(attackDuration*.55))*111;
    const color=s.heroClass==='ranger'?'#f4df9b':s.heroClass==='mage'?'#d7b5d7':'#eae5ba';
    box(ctx,projectileX,106,7,2,color);box(ctx,projectileX+5,104,2,6,color);
    if(s.heroClass!=='ranger'){ctx.globalAlpha=.3;box(ctx,projectileX-7,105,11,4,color);ctx.globalAlpha=1;}
  }
  if(animAge<650 && ['hero','beast','beast-hit','enemy','victory','dodge'].includes(visual.type)) {
    const target=visual.type==='beast-hit'||visual.type==='dodge'&&visual.target==='beast'?202:['enemy','dodge'].includes(visual.type)?hx:ex;
    ctx.globalAlpha=Math.min(1,(650-animAge)/250);
    ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle=visual.type==='victory'?'#fff1b0':visual.type==='enemy'?'#f7c9a4':'#fff3d0';
    ctx.strokeStyle='#556146'; ctx.lineWidth=2;
    const text=visual.type==='dodge'?'MISS':visual.type==='victory'?`+${visual.amount} G`:`${visual.crit?'✦ ':''}${visual.amount}`;
    ctx.strokeText(text,target,83-animAge/65); ctx.fillText(text,target,83-animAge/65); ctx.globalAlpha=1;
    if(visual.type==='hero' && kick>.9) { box(ctx,ex-17,110,29,2,'#fff3c8'); box(ctx,ex+2,97,2,24,'#fff3c8'); }
  }
  if(visual.healing>0 && animAge<650) {
    ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle='#d5efab';
    ctx.fillText(`+${visual.healing} HP`,visual.type==='beast'?px:hx,90-animAge/70);
  }
  for(let i=0;i<10;i++) {
    const px=(i*43+time/170*(i%2?1:-1)+4000)%400;
    const py=29+(i*29)%95+Math.sin(time/1300+i)*5;
    ctx.globalAlpha=.35+(Math.sin(time/800+i)+1)*.2; box(ctx,px,py,i%3?1:2,1,'#fff3bc');
  }
  ctx.globalAlpha=1;
  // Close foliage frames the foreground in chunky silhouettes.
  for(let i=0;i<15;i++) { const xx=(i*37)%400; box(ctx,xx,171-i%5,3,10,theme.leaves); box(ctx,xx-3,174-i%5,9,3,theme.leaves); }
  ctx.restore();
}

export function paintArt(root=document) {
  root.querySelectorAll('canvas[data-art]').forEach(canvas => {
    const ctx=canvas.getContext('2d'); const kind=canvas.dataset.art;
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
    if(kind==='hero') drawHero(ctx,canvas.width/2,canvas.height*.84,Number(canvas.dataset.scale || 3),canvas.dataset.kind || 'knight');
    else if(kind==='ingredient') drawIngredient(ctx,canvas.width/2,canvas.height/2,Number(canvas.dataset.scale || 2),canvas.dataset.kind);
    else drawMonster(ctx,canvas.width/2,canvas.height*.85,Number(canvas.dataset.scale || 2),canvas.dataset.kind,0,canvas.dataset.boss==='true');
  });
}
