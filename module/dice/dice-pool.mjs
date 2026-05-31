import { FOURSTAT } from "../config.mjs";

export function groupDice(faces) {
  const groups = new Map();
  for (const face of faces) {
    if (!groups.has(face)) groups.set(face, []);
    groups.get(face).push(face);
  }
  return [...groups.entries()]
    .map(([face, dice]) => ({ face, count: dice.length, sum: dice.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.sum - a.sum || b.face - a.face);
}

export async function rollStatPool({ actor, stat, statValue, traitBonus = 0, threshold = 4, label = "" }) {
  const numDice = Math.max(1, (statValue ?? 0) + (traitBonus ?? 0));
  const formula = `${numDice}d${FOURSTAT.diceFace}`;
  const roll = new Roll(formula);
  await roll.evaluate();

  const faces = roll.dice[0].results.map(r => r.result);
  const groups = groupDice(faces);
  const best = groups[0] ?? { face: 0, count: 0, sum: 0 };
  const total = best.sum;
  const success = total >= threshold;
  const margin = total - threshold;
  const stressDice = success ? 0 : Math.max(1, Math.abs(margin));

  const content = await renderTemplate("systems/4-stat-dg/templates/chat/stat-roll.hbs", {
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    label,
    stat,
    statLabel: game.i18n.localize(FOURSTAT.stats[stat] ?? stat),
    numDice,
    threshold,
    faces,
    groups,
    best,
    total,
    success,
    margin,
    stressDice
  });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label || game.i18n.format("FOURSTAT.Roll.Flavor", { stat: game.i18n.localize(FOURSTAT.stats[stat] ?? stat) }),
    content,
    flags: {
      "4-stat-dg": {
        kind: "stat-roll",
        stat,
        threshold,
        total,
        success,
        stressDice,
        actorId: actor?.id ?? null
      }
    }
  });

  return { roll, faces, groups, best, total, success, margin, stressDice };
}

export async function rollStress({ actor, dicePool }) {
  const numDice = Math.max(0, dicePool ?? 0);
  if (numDice === 0) {
    ui.notifications?.info(game.i18n.localize("FOURSTAT.Stress.NoneToRoll"));
    return null;
  }

  const formula = `${numDice}d${FOURSTAT.diceFace}`;
  const roll = new Roll(formula);
  await roll.evaluate();

  const faces = roll.dice[0].results.map(r => r.result);
  const ones = faces.filter(f => f === 1).length;
  const effectKey = Math.min(ones, 3);
  const effectLabel = game.i18n.localize(FOURSTAT.stressEffects[effectKey]);
  const gainsPermanent = ones >= 2;

  const content = await renderTemplate("systems/4-stat-dg/templates/chat/stress-roll.hbs", {
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    numDice,
    faces,
    ones,
    effectKey,
    effectLabel,
    gainsPermanent
  });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: game.i18n.localize("FOURSTAT.Stress.RollFlavor"),
    content,
    flags: {
      "4-stat-dg": {
        kind: "stress-roll",
        ones,
        effectKey,
        gainsPermanent,
        actorId: actor?.id ?? null
      }
    }
  });

  return { roll, faces, ones, effectKey, gainsPermanent };
}

export async function rollBondRepair({ actor, bond, willpowerBonus = 0 }) {
  const influence = actor.system.stats?.influence?.value ?? 0;
  const numDice = Math.max(1, influence + (willpowerBonus ? 1 : 0));
  const threshold = bond.system.repairThreshold;
  const formula = `${numDice}d${FOURSTAT.diceFace}`;
  const roll = new Roll(formula);
  await roll.evaluate();

  const faces = roll.dice[0].results.map(r => r.result);
  const groups = groupDice(faces);
  const best = groups[0] ?? { face: 0, count: 0, sum: 0 };
  const total = best.sum;
  const success = total >= threshold;

  const content = await renderTemplate("systems/4-stat-dg/templates/chat/bond-roll.hbs", {
    actorId: actor.id,
    actorName: actor.name,
    bondName: bond.name,
    bondValue: bond.system.value,
    numDice,
    threshold,
    faces,
    groups,
    best,
    total,
    success,
    willpowerBonus
  });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: game.i18n.format("FOURSTAT.Bond.RepairFlavor", { bond: bond.name }),
    content,
    flags: {
      "4-stat-dg": {
        kind: "bond-repair",
        bondId: bond.id,
        threshold,
        total,
        success,
        actorId: actor.id
      }
    }
  });

  return { roll, total, success };
}
