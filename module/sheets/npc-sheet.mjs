import { FOURSTAT } from "../config.mjs";

export class NpcSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fourstat", "sheet", "actor", "npc"],
      template: "systems/4-stat-dg/templates/actor/npc-sheet.hbs",
      width: 560,
      height: 560
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.config = FOURSTAT;
    context.stats = Object.entries(FOURSTAT.stats).map(([key, label]) => ({
      key,
      label,
      value: context.actor.system.stats?.[key]?.value ?? 0
    }));
    context.notesHTML = await TextEditor.enrichHTML(
      context.actor.system.notes ?? "",
      { secrets: this.actor.isOwner, relativeTo: this.actor }
    );
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.on("click", "[data-action='roll-stat']", async (event) => {
      const statKey = event.currentTarget.dataset.stat;
      const threshold = Number(event.currentTarget.dataset.threshold ?? 4);
      await this.actor.rollStat(statKey, { threshold });
    });
  }
}
