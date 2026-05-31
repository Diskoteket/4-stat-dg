import { FOURSTAT } from "../config.mjs";

export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fourstat", "sheet", "actor", "character"],
      template: "systems/4-stat-dg/templates/actor/character-sheet.hbs",
      width: 720,
      height: 720,
      tabs: [
        { navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }
      ],
      scrollY: [".sheet-body"]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    const system = context.actor.system;

    context.system = system;
    context.config = FOURSTAT;
    context.stats = Object.entries(FOURSTAT.stats).map(([key, label]) => ({
      key,
      label,
      abbr: FOURSTAT.statAbbreviations[key],
      value: system.stats?.[key]?.value ?? 0
    }));
    context.positiveTraits = this.actor.positiveTraits;
    context.negativeTraits = this.actor.negativeTraits;
    context.bonds = this.actor.bonds;
    context.stressPool = this.actor.stressPool;
    context.biographyHTML = await TextEditor.enrichHTML(system.details?.biography ?? "", { async: true });
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("click", "[data-action]", this._onAction.bind(this));
    html.on("change", "[data-edit-bond]", this._onBondValueChange.bind(this));
  }

  async _onAction(event) {
    event.preventDefault();
    const btn = event.currentTarget;
    const action = btn.dataset.action;

    switch (action) {
      case "roll-stat":
        return this._promptStatRoll(btn.dataset.stat);
      case "roll-stress":
        return this._promptStressRoll();
      case "spend-willpower":
        return this.actor.spendWillpower(1);
      case "restore-willpower":
        return this.actor.restoreWillpower(1);
      case "add-stress":
        return this.actor.takeStress(Number(btn.dataset.amount ?? 1), { permanent: btn.dataset.permanent === "true" });
      case "clear-stress":
        return this.actor.clearStress(Number(btn.dataset.amount ?? 1), { permanent: btn.dataset.permanent === "true" });
      case "repair-bond":
        return this._promptBondRepair(btn.dataset.itemId);
      case "create-item":
        return this._createItem(btn.dataset.itemType, btn.dataset.polarity);
      case "edit-item":
        return this.actor.items.get(btn.dataset.itemId)?.sheet?.render(true);
      case "delete-item":
        return this._deleteItem(btn.dataset.itemId);
    }
  }

  async _promptStatRoll(statKey) {
    const traits = this.actor.traits;
    const content = await renderTemplate("systems/4-stat-dg/templates/dialog/stat-roll-dialog.hbs", {
      stat: statKey,
      statLabel: game.i18n.localize(FOURSTAT.stats[statKey] ?? statKey),
      thresholds: FOURSTAT.thresholds,
      traits
    });

    return new Promise(resolve => {
      new Dialog({
        title: game.i18n.format("FOURSTAT.Roll.DialogTitle", { stat: game.i18n.localize(FOURSTAT.stats[statKey] ?? statKey) }),
        content,
        buttons: {
          roll: {
            label: game.i18n.localize("FOURSTAT.Roll.Submit"),
            callback: async (html) => {
              const form = html[0].querySelector("form");
              const threshold = Number(form.threshold.value);
              const traitId = form.trait?.value || "";
              const label = form.label?.value?.trim() ?? "";
              const trait = this.actor.items.get(traitId);
              const traitBonus = trait ? 1 : 0;
              const result = await this.actor.rollStat(statKey, { threshold, traitBonus, label });
              resolve(result);
            }
          },
          cancel: {
            label: game.i18n.localize("Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
  }

  async _promptStressRoll() {
    if (this.actor.stressPool === 0) {
      ui.notifications?.info(game.i18n.localize("FOURSTAT.Stress.NoneToRoll"));
      return;
    }
    const confirmed = await Dialog.confirm({
      title: game.i18n.localize("FOURSTAT.Stress.RollFlavor"),
      content: `<p>${game.i18n.format("FOURSTAT.Stress.Confirm", { count: this.actor.stressPool })}</p>`
    });
    if (!confirmed) return;
    const result = await this.actor.rollStress();
    if (result?.gainsPermanent) {
      await this.actor.takeStress(1, { permanent: true });
    }
  }

  async _promptBondRepair(bondId) {
    const bond = this.actor.items.get(bondId);
    if (!bond) return;
    const content = await renderTemplate("systems/4-stat-dg/templates/dialog/bond-repair-dialog.hbs", {
      bond,
      threshold: bond.system.repairThreshold,
      willpower: this.actor.system.willpower?.value ?? 0
    });
    return new Promise(resolve => {
      new Dialog({
        title: game.i18n.format("FOURSTAT.Bond.RepairFlavor", { bond: bond.name }),
        content,
        buttons: {
          roll: {
            label: game.i18n.localize("FOURSTAT.Roll.Submit"),
            callback: async (html) => {
              const form = html[0].querySelector("form");
              const spend = form.willpower?.checked ?? false;
              const result = await this.actor.repairBond(bondId, { spendWillpower: spend });
              resolve(result);
            }
          },
          cancel: { label: game.i18n.localize("Cancel"), callback: () => resolve(null) }
        },
        default: "roll"
      }).render(true);
    });
  }

  async _createItem(type, polarity) {
    const data = {
      name: game.i18n.localize(type === "trait"
        ? (polarity === "negative" ? "FOURSTAT.Trait.NewNegative" : "FOURSTAT.Trait.NewPositive")
        : "FOURSTAT.Bond.New"),
      type
    };
    if (type === "trait" && polarity) data.system = { polarity };
    const [item] = await this.actor.createEmbeddedDocuments("Item", [data]);
    item?.sheet?.render(true);
  }

  async _deleteItem(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const confirmed = await Dialog.confirm({
      title: game.i18n.localize("FOURSTAT.Confirm.DeleteTitle"),
      content: `<p>${game.i18n.format("FOURSTAT.Confirm.DeleteBody", { name: item.name })}</p>`
    });
    if (confirmed) await item.delete();
  }

  async _onBondValueChange(event) {
    const input = event.currentTarget;
    const itemId = input.dataset.itemId;
    const value = Math.max(0, Math.min(3, Number(input.value) || 0));
    await this.actor.items.get(itemId)?.update({ "system.value": value });
  }
}
