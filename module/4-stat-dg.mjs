import { FOURSTAT } from "./config.mjs";
import { CharacterData } from "./data/actor-character.mjs";
import { NpcData } from "./data/actor-npc.mjs";
import { TraitData } from "./data/item-trait.mjs";
import { BondData } from "./data/item-bond.mjs";
import { FourStatActor } from "./documents/actor.mjs";
import { FourStatItem } from "./documents/item.mjs";
import { CharacterSheet } from "./sheets/character-sheet.mjs";
import { NpcSheet } from "./sheets/npc-sheet.mjs";
import { TraitSheet, BondSheet } from "./sheets/item-sheet.mjs";

Hooks.once("init", () => {
  console.log("4-Stat DG | Initialising system");

  CONFIG.FOURSTAT = FOURSTAT;

  CONFIG.Actor.documentClass = FourStatActor;
  CONFIG.Item.documentClass = FourStatItem;

  CONFIG.Actor.dataModels = {
    character: CharacterData,
    npc: NpcData
  };
  CONFIG.Item.dataModels = {
    trait: TraitData,
    bond: BondData
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("4-stat-dg", CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "FOURSTAT.SheetLabel.Character"
  });
  Actors.registerSheet("4-stat-dg", NpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "FOURSTAT.SheetLabel.NPC"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("4-stat-dg", TraitSheet, {
    types: ["trait"],
    makeDefault: true,
    label: "FOURSTAT.SheetLabel.Trait"
  });
  Items.registerSheet("4-stat-dg", BondSheet, {
    types: ["bond"],
    makeDefault: true,
    label: "FOURSTAT.SheetLabel.Bond"
  });

  loadTemplates([
    "systems/4-stat-dg/templates/actor/character-sheet.hbs",
    "systems/4-stat-dg/templates/actor/npc-sheet.hbs",
    "systems/4-stat-dg/templates/item/trait-sheet.hbs",
    "systems/4-stat-dg/templates/item/bond-sheet.hbs",
    "systems/4-stat-dg/templates/dialog/stat-roll-dialog.hbs",
    "systems/4-stat-dg/templates/dialog/bond-repair-dialog.hbs",
    "systems/4-stat-dg/templates/chat/stat-roll.hbs",
    "systems/4-stat-dg/templates/chat/stress-roll.hbs",
    "systems/4-stat-dg/templates/chat/bond-roll.hbs"
  ]);
});

Hooks.once("ready", () => {
  console.log("4-Stat DG | Ready");
});

Hooks.on("renderChatMessage", (message, html) => {
  html.find("button.fourstat-action[data-action='apply-stress']").on("click", async (event) => {
    event.preventDefault();
    const actorId = event.currentTarget.dataset.actorId;
    const amount = Number(event.currentTarget.dataset.amount ?? 0);
    const actor = game.actors.get(actorId);
    if (!actor) return;
    if (!actor.isOwner) {
      ui.notifications?.warn(game.i18n.localize("FOURSTAT.Notify.NotOwner"));
      return;
    }
    await actor.takeStress(amount);
    ui.notifications?.info(game.i18n.format("FOURSTAT.Notify.StressApplied", { name: actor.name, amount }));
  });
});
