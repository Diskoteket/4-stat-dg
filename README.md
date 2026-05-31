# 4-Stat DG — Foundry VTT system

Ett lättviktigt rollspelssystem om kompetens, stress och relationer.
Karaktärer dör sällan av yttre hot — de bryts ner inifrån.

This is the Foundry VTT implementation of the 4-Stat DG system.

## Installing

In Foundry's setup screen → **Game Systems** → **Install System** → paste the manifest URL:

```
https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json
```

## What's in here

| Concept             | Implementation                            |
| ------------------- | ----------------------------------------- |
| Stats               | `system.stats.{action,insight,influence,nerves}.value` |
| Traits (Drag)       | Items of type `trait`, polarity positive/negative |
| Bonds (Band)        | Items of type `bond`, value 0–3           |
| Willpower           | `system.willpower.{value,max}`            |
| Temporary Stress    | `system.stress.temporary`                 |
| Permanent Stress    | `system.stress.permanent`                 |

## Dice mechanic

- Roll N d6 where N = stat value + 1 if a relevant trait helps
- Group dice by value, sum each group, take the highest group sum
- Compare to threshold (4 easy / 6 hard / 9 extreme)
- On failure, gain Stress dice equal to the gap

## Stress roll

Rolls all temporary + permanent stress dice and counts 1s:

- 1 one → Freakout
- 2 ones → Permanent psychological damage + gain a permanent stress die
- 3+ ones → Psychosis / disappearance / death

## Bond repair

Roll Influence vs threshold `7 − bond.value`. Success: +1. Failure: −1.
Bonds at 0 are broken — only narrative events restore them.

## Releasing

See [RELEASE.md](./RELEASE.md) for step-by-step instructions for cutting a GitHub release that Foundry can install.

## Layout

```
4-stat-dg/
├── system.json              # Foundry manifest
├── template.json            # Type registration
├── module/                  # JavaScript
│   ├── 4-stat-dg.mjs        # Entry point
│   ├── config.mjs           # Constants
│   ├── data/                # DataModel schemas
│   ├── documents/           # Actor/Item document classes
│   ├── sheets/              # ActorSheet/ItemSheet classes
│   └── dice/                # Dice pool & stress rollers
├── templates/               # Handlebars sheet/chat/dialog templates
├── styles/                  # CSS
└── lang/                    # i18n (sv, en)
```

## Compatibility

Foundry VTT v12 (verified) — v13 (compatible, legacy sheet API).
