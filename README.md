# HarnMaster-3-FoundryVTT

This is a game system definition of the H&acirc;rnMaster 3 RPG for [Foundry Virtual Tabletop](http://foundryvtt.com/).

### H&acirc;rnMaster Copyright Notice

This is an unofficial H&acirc;rnFanon work. It is a derivative work from material created by N. Robin Crossby and is released for free distribution and personal use without the permission or endorsement of N. Robin Crossby or his estate.

H&acirc;rn, H&acirc;rnMaster, and H&acirc;rnWorld are all &copy; 1987-2020 N. Robin Crossby and Columbia Games Inc. Their works are available for sale on the [Columbia Games Ltd website](http://columbiagames.com/harn/).

# Usage

Although most parts of this system should be self-explanatory to those familiar with H&acirc;rnMaster 3, there are some peculiarities that will be described here.

## Missing Components of H&acirc;rnMaster Rules

This system is not intented to replace the need for the HM3 rules, but to simplify running a HM3 game.  Therefore, certain aspects of HM3 have been intentionally left out.  This is not intended to be used as a character generator.  This section highlights a few specific items that were left out.

### Skills Missing

Although basic laborious computations have been included in this system, only "default" skills and humanoid armor locations are loaded (on request).  However, the Skill Base (SB) and Mastery Level (ML) values, although present, are not precalculated even for "default" skills.

No other skills beyond the standard skills are provided; they must be manually entered along with their SB and ML characteristics.

### Combat Tables Missing

Although automatic dice rolling for attack rolls and damage rolls are provided, the actual combat mechanics (including the meele and missile attack tables and injury table) are not automated or included.  It is expected that the rules will be consulted for these actions.

## Actors Supported

The following actors are supported:

* __Character:__ A standard humanoid character, such as a Human, Dwarf, or Elf.  This can also be used for other humanoid creatures, such as Gargun.  A character has the following features:
  1. Ability Scores
  2. Traits (Birthdate, Gender, Race, Sunsign, etc.)
  3. Basic Skills (Physical, Communication, Combat, and Craft)
  4. Esoteric Skills/Talents (Convocations, Rituals, and Psionics)
  5. Combat (Weapons, Injuries, Armor Locations)
  6. Inventory (Armor/Clothing, Misc. Gear)
  7. Public Description (what others can observe about you, your behavior, and your public backstory)
  8. Biography (your personal/real story, motivations, and attributes)

* __Creature:__ Any being not a "character" (e.g., animals, Ivashu, etc.).  A creature has the following features:
  1. Ability Scores (except no Comliness or Morality)
  2. Basic Skills (Physical, Communication, Combat, and Craft)
  3. Combat (Weapons, Injuries, Armor Locations)
  4. Misc. Gear
  5. Description

Note that when creating a character, you will be prompted whether to install standard skills and standard humanoid armor locations.  When creating a creature, no armor locations will be preloaded, since each creature will have different armor locations (although a few basic combat skills are added).

## Supported Capabilities

The following capabilities are supported in both characters and creatures:

* Automatic Dice Rolls (click on the dice icon next to the item). Holding SHIFT, ALT, or CTRL keys while clicking the icon will use defaults and bypass the dialog (except for damage rolls which always require the dialog).
  * Skill check rolls
  * Spell success rolls (character only)
  * Ritual Invocation success rolls (character only)
  * Psionic Talent success rolls (character only)
  * Shock roll
  * Fumble roll
  * Stumble roll
  * General Damage roll (Non-weapon-specific)
  * Weapon Damage roll (weapon-specific)
  * Weapon Attack roll
  * Weapon Defense roll
  * Injury Healing roll

* Automatic Calculations
  * Total Injury Levels
  * Total Gear Weight
  * Encumbrance (characters only)
  * Universal Penalty (UP)
  * Physical Penalty (PP)
  * All skill EMLs (based on ML minus UP or PP)
  * Endurance (based on Condition skill if present, otherwise calculated from abilities)
  * Move rate (characters only)
  * Spell CML and Ritual Invocation RML (accounting for spell level or invocation circle)
  * Weapon Attack ML (AML) and Defense ML (DML)

## Special Considerations

There are a few things to keep in mind as you are filling out your characters.

### Weapon Associated Skill

A skill in a type of weapon is distinct from the weapon itself.  For example, you might have skill in Dagger, but you actually have a Knife weapon.  For a Knife, you use the Dagger skill.  In the details for each weapon, you will see an input for the Associated Skill.  This should default to the same name as the weapon, but in many cases you will need to change this to refer to the actual skill used (for example, a Staff might use the "Spear" Associated Skill; or, alternatively, you may have a specific Staff skill that should be used instead).

### Armor Locations Probability Weight (Prob. Weight)

Hit locations play a big part in the HM3 combat system.  In order to correctly calculate hit location, each armor location is designated with a Probability Weight.  You can think of this as the percentage chance of that location getting hit.  In that case, the total of all armor location probability weights must add up to 100.

There are separate probability weights for High, Medium, and Low aiming points.  For humanoid characters, if you chose to have the armor locations pre-loaded, these will already be setup to default values.  For creatures, no armor locations are available so you will need to enter your own armor locations and the probability weights for those.
