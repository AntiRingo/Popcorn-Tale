import { beastStats, spawnEnemy, tick, STEP_MS } from '../src/engine.js';

export function addPet(s, species = 'mushroom', id = `pet-${s.nextPetId++}`) {
  const pet = { id, species, level: 1, xp: 0, rank: 0, growth: 0, crystals: 0, hp: 1, reviveAt: 0, traits: { attack: 100, maxHp: 100, defense: 100, speed: 100 }, skills: ['guard'] };
  s.beasts[id] = pet; pet.hp = beastStats(s, id).maxHp;
  return pet;
}
export function victory(s, species = 'mushroom', boss = false) {
  spawnEnemy(s); s.enemy = { id: species, hp: 1, maxHp: 1, attack: 1, boss };
  s.inBoss = boss; s.heroCooldown = 0; s.enemyCooldown = STEP_MS * 2; tick(s);
}
