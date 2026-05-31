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
    "systems/4-stat-dg/templates/dialog/protect-with-bond-dialog.hbs",
    "systems/4-stat-dg/templates/chat/stat-roll.hbs",
    "systems/4-stat-dg/templates/chat/stress-roll.hbs",
    "systems/4-stat-dg/templates/chat/bond-roll.hbs"
  ]);
});

Hooks.once("ready", () => {
  console.log("4-Stat DG | Ready");
});

Hooks.on("renderChatMessage", (message, html) => {
  html.find("button.fourstat-action[data-action='apply-stress']").on("click", (event) => {
    onApplyStress(event, message);
  });
  html.find("button.fourstat-action[data-action='protect-with-bond']").on("click", (event) => {
    onProtectWithBond(event, message);
  });
});

async function onApplyStress(event, message) {
  event.preventDefault();
  const btn = event.currentTarget;
  const actor = game.actors.get(btn.dataset.actorId);
  if (!actor) return;
  if (!actor.isOwner) {
    ui.notifications?.warn(game.i18n.localize("FOURSTAT.Notify.NotOwner"));
    return;
  }
  const amount = Number(btn.dataset.amount ?? 0);
  await actor.takeStress(amount);
  ui.notifications?.info(game.i18n.format("FOURSTAT.Notify.StressApplied", { name: actor.name, amount }));
  await markChatActionsResolved(message, btn, game.i18n.format("FOURSTAT.Chat.Resolved.Stress", { amount }));
}

async function onProtectWithBond(event, message) {
  event.preventDefault();
  const btn = event.currentTarget;
  const actor = game.actors.get(btn.dataset.actorId);
  if (!actor) return;
  if (!actor.isOwner) {
    ui.notifications?.warn(game.i18n.localize("FOURSTAT.Notify.NotOwner"));
    return;
  }
  const stressAmount = Number(btn.dataset.amount ?? 0);
  const bonds = actor.bonds.filter(b => (b.system.value ?? 0) > 0);
  if (bonds.length === 0) {
    ui.notifications?.warn(game.i18n.localize("FOURSTAT.Bond.ProtectNoBonds"));
    return;
  }

  const content = await renderTemplate("systems/4-stat-dg/templates/dialog/protect-with-bond-dialog.hbs", {
    bonds,
    stressAmount,
    allowTwo: stressAmount >= 2
  });

  return new Promise(resolve => {
    new Dialog({
      title: game.i18n.localize("FOURSTAT.Bond.ProtectTitle"),
      content,
      buttons: {
        confirm: {
          label: game.i18n.localize("FOURSTAT.Bond.ProtectConfirm"),
          callback: async (html) => {
            const form = html[0].querySelector("form");
            const bondId = form.bondId.value;
            const amount = Math.max(1, Math.min(stressAmount, Number(form.amount.value) || 1));
            const bond = actor.items.get(bondId);
            if (!bond) { resolve(null); return; }

            const success = await actor.protectWithBond(bondId, amount);
            if (!success) { resolve(null); return; }

            const remaining = Math.max(0, stressAmount - amount);
            if (remaining > 0) await actor.takeStress(remaining);

            const resolutionText = game.i18n.format("FOURSTAT.Chat.Resolved.Protect", {
              bond: bond.name,
              amount,
              remaining
            });
            await markChatActionsResolved(message, btn, resolutionText);
            ui.notifications?.info(resolutionText);
            resolve({ amount, remaining });
          }
        },
        cancel: {
          label: game.i18n.localize("Cancel"),
          callback: () => resolve(null)
        }
      },
      default: "confirm"
    }).render(true);
  });
}

async function markChatActionsResolved(message, triggeringButton, resolutionText) {
  const canEdit = message?.isAuthor || game.user.isGM;
  if (!canEdit) {
    const $actions = $(triggeringButton).closest(".chat-actions");
    $actions.replaceWith(`<div class="chat-resolution">${foundry.utils.escapeHTML?.(resolutionText) ?? resolutionText}</div>`);
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(message.content, "text/html");
  const actions = doc.querySelector(".fourstat-chat .chat-actions");
  if (actions) {
    const resolved = doc.createElement("div");
    resolved.className = "chat-resolution";
    resolved.textContent = resolutionText;
    actions.replaceWith(resolved);
    const card = doc.querySelector(".fourstat-chat");
    if (card) await message.update({ content: card.outerHTML });
  }
}
