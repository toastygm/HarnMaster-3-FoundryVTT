# HarnMaster-3-FoundryVTT

This is a game system definition of the H&acirc;rnMaster 3 RPG for [Foundry Virtual Tabletop](http://foundryvtt.com/).

# Pages Site
If you are looking for the offical documentation, please see the [HarnMaster 3 FoundryVTT System Site](https://toastygm.github.io/HarnMaster-3-FoundryVTT/).

### H&acirc;rnMaster Copyright Notice

This is an unofficial H&acirc;rnFanon work. It is a derivative work from material created by N. Robin Crossby and is released for free distribution and personal use without the permission or endorsement of N. Robin Crossby or his estate.

H&acirc;rn, H&acirc;rnMaster, and H&acirc;rnWorld are all &copy; 1987-2020 N. Robin Crossby and Columbia Games Inc. Their works are available for sale on the [Columbia Games Ltd website](http://columbiagames.com/harn/).

# Features

The following features are included in this system.

* Characters, Creatures, and Containers sheets
* Tracking of all abilities and functional characteristics
* Separate tracking of Description (publicly apparent information) and Biography (private information and backstory)
* Tracking of all skills, convocations, religion(s), spells, ritual invocations, psionics, etc.
* Support for "limited" permission on characters (so only basic readily-apparent information is viewable)
* Injury tracking and Fatigue tracking
* Automatic calculation of EML based on UP and PP
* Automatic dice rolls (skills, spells, ritual invocations, healing, shock, fumble, stumble, attack/defend, weapon damage, and injury)
* Compatible with "Dice So Nice" module.
* Automated combat system to make running combats much easier
* Effects allowing use of "buffs" and "debuffs" (such as Outnumbered, melee attack modifiers, UP/PP modifiers, etc) for either indefinite or a specified duration, that can be enabled/disabled as desired
* Flexible macro support for extending with your own custom capabilities

# Associated Modules

The HarnMaster system comes with a number of compendium packs providing details on standard skills, weapons, armor, spells, invocations, and psionics.  The following modules (highly recommended) extend HarnMaster.

To install these modules: go to the "Configuration and Setup" screen, then select the "Add-on Modules" tab, and click "Install Module"; enter the "Manifest URL" (see below) into the text box at the bottom of the dialog and click "Install".

## Core Functionality

These modules provide new or modify existing functionality of the H&acirc;rnMaster system.

| Name | Project URL | Manifest URL | Description |
|---|---|---|---|
| H&acirc;rnMaster Gold | https://github.com/TimoLemburg/hm-gold | [Manifest URL](https://raw.githubusercontent.com/TimoLemburg/hm-gold/master/module.json) | Provides support for H&acirc;rnMaster Gold rules |

## Characters and creatures

These modules provide additional Characters and Creatures for use in your campaigns

| Name | Project URL | Manifest URL | Description |
|---|---|---|---|
| Harn Friends, Foes, and Followers V1 | https://github.com/toastygm/hm3-fffv1 | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm3-fffv1/master/module.json) | Provides 144 fully-described characters from Friends, Foes, and Followers V1 |
| Harn Ensemble of Characters | https://github.com/toastygm/hm-ensemble | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-ensemble/master/module.json) | Over a thousand characters of various types: guilded, unguilded, nobles, Shek-Pvar, clerics, and Gargun |
| Harn Bestiary | https://github.com/toastygm/hm-bestiary | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-bestiary/master/module.json) | Creature stats for many different denizens of Harn |

## Items

These modules provide additional item compendiums to represent gear, skills, spells, invocations, and other items.

| Name | Project URL | Manifest URL | Description |
|---|---|---|---|
| Harn Comprehensive Price Lists | https://github.com/toastygm/hm3-cpl | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm3-cpl/master/module.json) | Hundreds of misc items; if its not here, you don't need it! |

## Locations

These modules provide detailed location information, such as taverns, keeps, manors, etc.  Some of these may be usable with other game systems as well.

| Name | Project URL | Manifest URL | Description |
|---|---|---|---|
| Harn Standing Bear Inn | https://github.com/toastygm/hm-loc-sbi | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-loc-sbi/master/module.json) | The bustling and famous Standing Bear Inn located in Olokand, kingdom of Kaldor |
| Jedes Keep | https://github.com/toastygm/hm-loc-jedes | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-loc-jedes/master/module.json) | The primary settlement of Asolade Hundred, located in the SW of the kingdom of Kaldor |
| Chewintin Manor | https://github.com/toastygm/hm-loc-chewintin | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-loc-chewintin/master/module.json) | A prime example of a "£10 tower", Chewintin is located on the frontier of Asolade Hundred, in SW kingdom of Kaldor |
| Three Brothers' Barrow | https://github.com/toastygm/hm-loc-tbb | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-loc-tbb/master/module.json) | A fun location module with a new creature, a cave, and a hidden tomb, suitable for a single session play. |
| Charmic Manor | https://github.com/toastygm/hm-loc-charmic | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-loc-charmic/master/module.json) | A relatively new manor with huge potential, it grew very prosperous under its original bailiff. But in recent years, it has become a dark and dangerous place. |

## Adventures

These modules provide pre-generated adventures that can be used with HarnMaster rules; some of these may be usable with other game systems as well.

| Name | Project URL | Manifest URL | Description |
|---|---|---|---|
| A Shower of Silver |  https://github.com/toastygm/hm-adv-sos | [Manifest URL](https://raw.githubusercontent.com/toastygm/hm-adv-sos/master/module.json) | An introductory murder-mystery adventure for H&acirc;rn, located around Jedes keep in the kingdom of Kaldor |


# Character Sheet Walkthrough

See the [Walkthrough](https://github.com/toastygm/HarnMaster-3-FoundryVTT/wiki/FoundryVTT-HarnMaster-Walkthrough) page for a detailed review of the system (with screenshots).

# Usage

Although most parts of this system should be self-explanatory to those familiar with H&acirc;rnMaster 3, there are some peculiarities that will be described here.

## Missing Components of H&acirc;rnMaster Rules

This system requires the user to have a copy of the H&acirc;rnMaster rules. Most skills and mechanisms for calculating SB and ML, as well as rules use mechanics have been intentionally left out.  This is not intended to be used as a character generator.  This section highlights a few specific items that were left out.

### Skills Missing

Although basic laborious computations have been included in this system, only "default" skills and humanoid armor locations are loaded (on request); specifically those already on the publicly-available [character sheet and combat tables](https://secure.columbiagames.com/product/4001-PDF).

No other skills beyond the standard skills are provided; they must be manually entered along with all SB and ML characteristics.

### Combat Tables Missing

Although automatic dice rolling for attack/defense rolls, damage rolls, and injuries are provided, the actual combat mechanics (including the meele and missile attack tables) are not automated or included.  It is expected that the rules will be consulted to determine the effect of attacks and defense.

## Actors Supported

The following actors are supported:

* __Character:__ A standard humanoid character, such as a Human, Khuzdul, or Sindarin.  This can also be used for other humanoid creatures, such as Gargun.  A character has the following features:
  1. Ability Scores
  2. Public Description (characteristics others can observe about you, your behavior, and your public backstory)
  3. Basic Skills (Physical, Communication, Combat, and Craft)
  4. Esoteric Skills/Talents (Convocations, Rituals, and Psionics)
  5. Combat (Weapons, Injuries, Armor Locations)
  6. Inventory (Armor/Clothing, Misc. Gear)
  7. Biography (your personal/real characteristics, story, motivations, and attributes)

* __Creature:__ Any being not a "character" (e.g., animals, Ivashu, etc.).  A creature has the following features:
  1. Ability Scores (except no Comeliness or Morality)
  2. Basic Skills
  3. Combat (Weapons, Injuries, Armor Locations)
  4. Misc. Gear
  5. Description

Note that when creating a character, you will be prompted whether to install standard skills and standard humanoid armor locations.  When creating a creature, no armor locations will be preloaded, since each creature will have different armor locations (although a few basic combat skills are preloaded).

## Supported Capabilities

The following capabilities are supported in both characters and creatures:

* Automatic Dice Rolls (click on the dice icon next to the item). Holding SHIFT, ALT, or CTRL keys while clicking the icon will use defaults and bypass the dialog (except for damage rolls which always require the dialog).  All of these are available as macros as well.
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
  * Injury roll (calculates location and Injury Level)

* Automatic Calculations
  * Automatic Skill Base calculation based on Formula
  * Total Injury Levels
  * Total Gear Weight
  * Encumbrance (characters only)
  * Universal Penalty (UP)
  * Physical Penalty (PP)
  * All skill EMLs (based on ML minus UP or PP)
  * Endurance (based on Condition skill if present, otherwise calculated from abilities)
  * Move rate (characters only)
  * Spell EML and Ritual Invocation EML (accounting for spell level or invocation circle)
  * Weapon Attack ML (AML) and Defense ML (DML)

## Macros

A number of system capabilities are available as macros functions so you can automate your use of this system with script macros.  All of these macro functions are avaialbe via `game.hm3.macros.<function>`. The following macros are defined:

Function                                       | Description
-----------------------------------------------|--------------------------
**skillRoll**(itemName, _noDialog_)            | roll against skill EML
**castSpellRoll**(itemName, _noDialog_)        | spell casting roll against spell EML
**invokeRitualRoll**(itemName, _noDialog_)     | ritual invocation roll against invocation EML
**usePsionicRoll**(itemName, _noDialog_)       | psionic talent roll against talent EML
**testAbilityD6Roll**(abilityName, _noDialog_) | 3d6 roll against a specific ability
**testAbilityD100Roll**(ability, _noDialog_)   | 1d100 roll against a specific ability
**weaponDamageRoll**(itemName)                 | damage roll, using attributes from a particular melee weapon
**missileDamageRoll**(itemName)                | damage roll, using attributes from a particular missile weapon
**weaponAttackRoll**(itemName, _noDialog_)     | weapon attack roll, using attributes from a particular melee weapon
**weaponDefendRoll**(itemName, _noDialog_)     | weapon defend roll, using attributes from a particular melee weapon
**missileAttackRoll**(itemName)                | missile attack roll, using attributes froma particular missile weapon
**injuryRoll**()                               | injury roll
**healingRoll**(itemName, _noDialog_)          | healing roll for the specific injury specified
**dodgeRoll**(_noDialog_)                        | dodge roll
**shockRoll**(_noDialog_)                        | shock roll
**stumbleRoll**(_noDialog_)                      | stumble roll
**fumbleRoll**(_noDialog_)                       | fumble roll
**genericDamageRoll**()                        | damage roll not specific to any weapon (you must enter details of the attack)
**changeMissileQuanity**(missileName, newQty)  | Change missile quantity: +XX to increase, -XX to decrease, XX to change to exact value
**changeFatigue**(newValue)                    | Change fatigue value: +XX to increase, -XX to decrease, XX to change to exact value
**setSkillDevelopmentFlag**(skillName)         | Set the flag for a Skill Development Roll (only set, **not** unset)
**weaponAttack**(weaponName)                   | Initiate melee attack from current combatant against selected token with weapon
**missileAttack**(missileName)                 | Initiate missile attack from current combatant against selected token with missile
**weaponAttackResume**(atkTokenId, defTokenId, action, attackAML, attackAim, attackWpnAspect, attackImpactModification)  | Continue attack with defender. "action" can be one of "dodge", "block", "counterstrike", or "ignore".

_itemName_ = name (or id) of the item to affect

_noDialog_ = \[**optional**\] flag whether or not to display dialog; if noDialog is true, all defaults will be used. Note that not all rolls support this, because some require input to operate.

## Special Considerations

There are a few things to keep in mind as you are filling out your characters.

### Description and Biography

The Description represents readily-apparent information about your character; this information is available to anyone who observes or interacts with your character. Any information you would share with others (even if untrue) can be placed in this area, and anyone with even limited access to your character sheet can observe it.

Your Biography represents your personal characteristics and backstory; those things that are not apparent to others unless you choose to share it. This may contain personal motivations as well as personal characteristics. Your biography will only be available to those will full access to your character, not to those with only limited access.

### Diety and Piety

The assumption is that a character may have one or more religions, and a piety associated with each one.  If a character is initiated into a religion, they are assumed to have a base ML in the religion (presumably opening at SBx1) representing basic understanding of the rituals and requirements of the religion.

Piety is therefore assocated with the religion/diety, and is indicated as part of the ritual skill for that diety.  If you choose to not require characters to have any Ritual skill to get piety, you may simply leave the SB/ML at 0.

### Weapon Associated Skill

A skill in a type of weapon is distinct from the weapon itself.  For example, you might have skill in Dagger, but you actually have a Knife weapon.  For a Knife, you use the Dagger skill.  In the details for each weapon, you will see an input for the Associated Skill.  This should default to the same name as the weapon, but in many cases you will need to change this to refer to the actual skill used (for example, a Staff might use the "Spear" Associated Skill; or, alternatively, you may have a specific Staff skill that should be used instead).

Only combat skills may be chosen as an "Associated Skill" for a weapon.

### Armor Locations Probability Weight (Prob. Weight)

Hit locations play a big part in the H&acirc;rnMaster combat system.  In order to correctly calculate hit location, each armor location is designated with a Probability Weight.  You can think of this as the percentage chance of that location getting hit.  In that case, the total of all armor location probability weights must add up to 100.

There are separate probability weights for High, Mid, and Low aiming points.  For humanoid characters, if you chose to have the armor locations pre-loaded, these will already be setup to default values.  For creatures, no armor locations are available so you will need to enter your own armor locations and the probability weights for those.

# Credits

The following images were taken from [The Noun Project](https://thenounproject.com/) and [Game-Icons](https://game-icons.net/) under the Creative Commons (CC BY 3.0) license:

* Agriculture by Made
* Anvil by Nico Ilk
* Arrow by Kitty_Keks
* Awareness by Max Hancock
* Axe by Deemak Daksina
* Circle by Prime Icons
* Club by Natalia
* Crossbow by Creaticca Creative Agency
* Engineering by ProSymbols
* Fire by Nabilauzwa
* Fishing by Vectors Point
* Flail by Simon Henrotte
* Flameworking by Jasmine Rae Friedrich
* Harp by Marina Pugacheva
* Horse Riding by Adrien Coquet
* Hunting by Gregor Cresnar
* Ink by Justicon
* Law by Denis Shumaylov
* Love by Adrien Coquet
* Masonry by IconMark
* Mining by art shop
* Mummy by Eucalyp
* Muscle by Kieu Thi Kim Cuong
* Pegasus by IconMark
* Pentacle by Kyle Tezak
* Perfume by Binpodo
* Polearm by Hamish
* Round Shield by Hea Poh Lin
* Scroll by stefano corradetti
* Shield by Jamison Wieser
* Ship by jenya
* Ski by Brad Avison
* Spear by sam maulidna
* Stones by Mayur Bhat
* Swimming by Atif Arshad
* Sword by Kamal
* Telepathy by Adrien Coquet
* Throw by Jakob Vogel
* Throw by Jakob Vogel
* Tree by kareemov1000
* Unicorn by corpus delicti
* Viking Ship by Ben Davis
* War Hammer by Kaylen Yul Lee
* Water by Bhuvan
* Water mill by Ben Davis
* Wind by Andi Nur Abdillah
* acting by Flatart
* advice by Adrien Coquet
* alchemy by Matthias Hartmann
* astrology by abderraouf omara
* brewery by Made x Made
* caduceus by Minh Do
* cattle by Gleb Khorunzhiy
* ceramics by Made
* dagger by iconcheese
* dance by Adrien Coquet
* divination by Made x Made
* dodge by Rflor
* drawing by Nibras@design
* heraldry by Joel McKinney
* herb by ProSymbols
* initiative by Maxim Basinski
* jewel by pejyt
* juggler by Orin zuu
* jump by Adrien Coquet
* leather by Amy Schwartz
* longbow by Hamish
* mathematics by annes curnio
* mental by Ragesh PP
* musician by corpus delicti
* net by Made by Made
* ninja by Adrien Coquet
* padlock by thirddesign
* pot boiling by Weltenraser
* punch by Phạm Thanh Lộc
* rune by Miroslava
* singing by Andrejs Kirma
* speaking by Azam Ishaq
* staff by ATOM
* steering by Edit Pongrácz
* survival knife by Ben Davis
* tarot by monkik
* textiles by ArmOkay
* timber by jauhari
* tracking by Adrien Coquet
* weather by Creative Mania
* whip by lastspark
* woodworker by Pham Duy Phuong Hung
* Coins by Vectors Market
* sack by Andrejs Kirma
* Torch by Pixelicatom
* Candle by Martin
* boxes by Sarah
* lance by parkjisun
* Trident by Yohann
* Injury by HAMEL KHALED
* break by ibrandify
* hit by Guilherme Furtado
* armor by Postcat Studio
* Man Fainted by Gan Khoon Lay
* bullseye by Creative Stall
* blowgun by Peter Selinger
* chest by Toli

A number of icons were also produced by:

* delapouite
* lorc
* skol
* willdabeast

Lakise and Runic Fonts are copyright N. Robin Crossby, redistributed under the terms of the [CC BY-NC-SA 3.0 AU](https://creativecommons.org/licenses/by-nc-sa/3.0/au/legalcode) license.

Lankorian Blackhand font is copyright 2020 by Mitch Gore, redistributed under the terms of [CC BY-NC-SA 3.0 AU](https://creativecommons.org/licenses/by-nc-sa/3.0/au/legalcode) license
