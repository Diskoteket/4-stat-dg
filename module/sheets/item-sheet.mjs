import { FOURSTAT } from "../config.mjs";

export class TraitSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fourstat", "sheet", "item", "trait"],
      template: "systems/4-stat-dg/templates/item/trait-sheet.hbs",
      width: 480,
      height: 420
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.config = FOURSTAT;
    context.descriptionHTML = await TextEditor.enrichHTML(
      context.item.system.description ?? "",
      { secrets: this.item.isOwner, relativeTo: this.item }
    );
    return context;
  }
}

export class BondSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fourstat", "sheet", "item", "bond"],
      template: "systems/4-stat-dg/templates/item/bond-sheet.hbs",
      width: 480,
      height: 420
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.config = FOURSTAT;
    context.threshold = context.item.system.repairThreshold;
    context.descriptionHTML = await TextEditor.enrichHTML(
      context.item.system.description ?? "",
      { secrets: this.item.isOwner, relativeTo: this.item }
    );
    return context;
  }
}
