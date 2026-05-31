import { rollStatPool, rollStress, rollBondRepair } from "../dice/dice-pool.mjs";

export class FourStatActor extends Actor {
  get traits() {
    return this.items.filter(i => i.type === "trait");
  }

  get positiveTraits() {
    return this.traits.filter(t => t.system.polarity === "positive");
  }

  get negativeTraits() {
    return this.traits.filter(t => t.system.polarity === "negative");
  }

  get bonds() {
    return this.items.filter(i => i.type === "bond");
  }

  get stressPool() {
    const s = this.system.stress ?? {};
    return (s.temporary ?? 0) + (s.permanent ?? 0);
  }

  async rollStat(statKey, { threshold = 4, traitBonus = 0, label = "" } = {}) {
    const statValue = this.system.stats?.[statKey]?.value ?? 0;
    return rollStatPool({
      actor: this,
      stat: statKey,
      statValue,
      traitBonus,
      threshold,
      label
    });
  }

  async rollStress() {
    return rollStress({ actor: this, dicePool: this.stressPool });
  }

  async repairBond(bondId, { spendWillpower = false } = {}) {
    const bond = this.items.get(bondId);
    if (!bond || bond.type !== "bond") return null;

    if (bond.system.isBroken) {
      ui.notifications?.warn(game.i18n.localize("FOURSTAT.Bond.BrokenWarning"));
      return null;
    }

    if (spendWillpower) {
      const wp = this.system.willpower?.value ?? 0;
      if (wp <= 0) {
        ui.notifications?.warn(game.i18n.localize("FOURSTAT.Willpower.NoneLeft"));
        return null;
      }
      await this.update({ "system.willpower.value": wp - 1 });
    }

    const result = await rollBondRepair({
      actor: this,
      bond,
      willpowerBonus: spendWillpower ? 1 : 0
    });

    const delta = result.success ? 1 : -1;
    const clamp = Math.clamp ?? Math.clamped;
    const newValue = clamp(bond.system.value + delta, 0, 3);
    await bond.update({ "system.value": newValue });
    return result;
  }

  async takeStress(amount = 1, { permanent = false } = {}) {
    const field = permanent ? "permanent" : "temporary";
    const current = this.system.stress?.[field] ?? 0;
    await this.update({ [`system.stress.${field}`]: current + amount });
  }

  async clearStress(amount = 1, { permanent = false } = {}) {
    const field = permanent ? "permanent" : "temporary";
    const current = this.system.stress?.[field] ?? 0;
    await this.update({ [`system.stress.${field}`]: Math.max(0, current - amount) });
  }

  async spendWillpower(amount = 1) {
    const current = this.system.willpower?.value ?? 0;
    if (current < amount) {
      ui.notifications?.warn(game.i18n.localize("FOURSTAT.Willpower.NoneLeft"));
      return false;
    }
    await this.update({ "system.willpower.value": current - amount });
    return true;
  }

  async restoreWillpower(amount = 1) {
    const current = this.system.willpower?.value ?? 0;
    const max = this.system.willpower?.max ?? 2;
    await this.update({ "system.willpower.value": Math.min(max, current + amount) });
  }
}
