# HarnMaster-3-FoundryVTT

This is a game system definition of the H&acirc;rnMaster 3 RPG for [Foundry Virtual Tabletop](http://foundryvtt.com/).

### H&acirc;rnMaster Copyright Notice

This is an unofficial H&acirc;rnFanon work. It is a derivative work from material created by N. Robin Crossby and is released for free distribution and personal use without the permission or endorsement of N. Robin Crossby or his estate.

H&acirc;rn, H&acirc;rnMaster, and H&acirc;rnWorld are all &copy; 1987-2020 N. Robin Crossby and Columbia Games Inc. Their works are available for sale on the [Columbia Games Ltd website](http://columbiagames.com/harn/).

# Features

The following features are included in this system.

* Characters and Creatures sheets
* Tracking of all abilities and functional characteristics
* Separate tracking of Description (publicly apparent information) and Biography (private information and backstory)
* Tracking of all skills, convocations, religion(s), spells, ritual invocations, psionics, etc.
* Support for "limited" permission on characters (so only basic readily-apparent information is viewable)
* Injury tracking and Fatigue tracking
* Automatic calculation of EML based on UP and PP
* Automatic dice rolls (skills, spells, ritual invocations, healing, shock, fumble, stumble, attack/defend, weapon damage, and injury)
* Compatible with "Dice So Nice" module.

# Character Sheet Walkthrough

### Clickable Fields

Many parts of the character sheet consist of clickable fields that will perform a dice roll. Normally when a field is clicked a dialog will appear that asks for more information (e.g., modifiers). If you hold down either SHIFT, CTRL, or ALT when clicking, the roll will attempt to use defaults if possible; but if more information is needed, a dialog will still appear.

All rolls appear in the chat window.  See the "Dice Rolls" section below for more details.

## Header

The header of the character sheet is always displayed.  This contains overall information, including name, current physical and universal penalties, Endurance (with a bar indicating how current endurance relates to maximum endurance), and move (base and effective).

## Profile Tab
![Profile Tab] (https://github.com/toastygm/HarnMaster-3-FoundryVTT/raw/blob/images/screenshots/FVTT_HM3_Profile.jpg?raw=true)

The Profile tab contains general information about your character.  This includes the character stats as well as the public information that others can observe from your demeanor.

Each ability stat contains the base ability (in small numbers) and the effective ability (in large numbers, representing the ability after penalties have been applied). There are also two clickable dice icons: one for a d6 roll, and the other for a d100 roll.

## Skills Tab
![Skills Tab] (images/screenshots/FVTT_HM3_Skills.jpg)

The skills tab displays all of the skills for the character, separated by skill type, including skill base, mastery level, and effective mastery level (after physical penalty and universal penalty have been applied).  Skill rolls can be performed by clicking the icon to the left of the skill name.

### Magic Skills Section
![Magic Skills Section] (images/screenshots/FVTT_HM3_Magic_Skills.jpg)

At the bottom of the skills tab is the section for Magic and Ritual skills. Magic skills are based on convocation, and here you provide your Convocational ML.

Ritual skills are available per diety worshipped.  Note that this is where piety scores are recorded, since each diety has a separate piety score.

### Skills Detail Dialog
![Skills Tab] (images/screenshots/FVTT_HM3_Skill_Detail.jpg)

The skills detail page provides a mechanism for specifying the skill base and mastery level for a skill.

For each skill, you may optionally provide a formula to calculate the skill base. If a valid formula is provided, the skill base input will become read-only in favor of being calculated via the formula.

The format of the formula is:

```
@<ability>, @<ability>, @<ability> [, sunsign, ...] [, modifier]
```

For example, the following is a valid formula:
```
@str, @dex, @agl, Ulandus:2, Aralius, 3
```

This formula indicates:

* Take average of Strength, Dexterity, and Agility
* If character has "Ulandus" sunsign, add 2
* If character has "Aralius" sunsign, add 1
* Add 3

Valid ability identifiers are: `@str`, `@sta`, `@dex`, `@agl`, `@int`, `@aur`, `@wil`, `@eye`, `@hrg`, `@sml`, `@voi`, `@cml`, and `@mor`.

## Combat Tab
![Skills Tab] (images/screenshots/FVTT_HM3_Combat.jpg)

At the top of the combat tab are a set of combat statistics, as well as clickable items that allow for common die rolls. _Note: Damage roll here is a generic roll, not specific to any weapon; use the weapon-specific damage in preference to this._

**Injury Note: An Injury Roll should always be performed by the character receiving the injury, not by the attacker.**

### Meele and Missile Weapons
The next section is for melee weapons, with clickable fields for attack, defense, and damage. Note that any weight indicated here will count against the total load.



Following the melee weapons section is the section for missile weapons, which includes thrown weapons, arrows, bolts, sling bullets, etc.

Bows and other missile weapons generally have two aspects: melee and ranged. A bow can be used either as a ranged weapon with arrows, or as a meele weapon (a sort of staff). The bow would show up in melee weapons with its statistics for use as a melee weapon. The statistics for the arrows would be shown under missile weapons.

Weight for spears, javelins, and similar thrown weapons must be handled specially.  These should be recorded both as a melee weapon and a missile weapon, but given a "zero" weight under melee weapons, and the weight recorded under the missile category.

### Injuries

The injuries section records character injuries, which are tracked separately.  This section is particularly important, since injuries affect universal penalty, physical penalty, and shock rolls.

Blood loss, if used, is tracked as a single separate "injury".

Note that the heal rate is clickable, and will perform a heal roll.

For convenience, the Injury Roll will automatically record any injuries that occur, so they do not need to be manually performed.

As stated earlier, the Injury Roll is performed by the character receiving the injury, not by the attacker.  This allows the correct hit probabilities and armor to be determined, and allows for the injury to be recorded correctly.

### Armor Locations

The armor locations section indicates the various hit locations for the character and what armor is covering each location.  There are two options here: manual and automatic.

If a piece of armor is entered into the Gear tab, and marked as "equipped", areas covered by that armor will be automatically entered into the appropriate armor locations.  For instance, a helm covering the skull will have its armor values added into the "Skull" location.  Any location that is automatically filled in this way cannot be modified manually.

For any locations where no "automatic" armor is covering, those areas may be modified manually.  Therefore, to specify the Skull area manually, you must ensure that there is no equipped armor in the Gear section that is set to cover the Skull area.

## Esoterics Tab
![Skills Tab] (images/screenshots/FVTT_HM3_Esoterics.jpg)

While the skills tab records the convocational and ritual skills for the character, this tab records the spells and/or ritual invocations usable by the character.  The icon to the right of the spell and/or invocation name is clickable to perform a casting roll.

The EML here takes into account spell level or invocation circle, as well as the universal penalty.

Psionics are also tracked on this page.

## Gear Tab
![Skills Tab] (images/screenshots/FVTT_HM3_Gear.jpg)

This tab records all of the carried items on the character with the exception of weapons (which are recorded on the combat tab).  Most importatly here is the armor section.  The armor section lists all of the armor and other clothing worn by the character.  For details, see the next section.

Each piece of armor (and misc. items) have two extra toggles: equipped and carried.  The equipped toggle indicates whether the armor is being worn (vs. carried in a sack or backpack).  The carried toggle indicates whether the item is being physically carried by the character (vs. on a horse, on the ground, in a cart, etc.).  The carried toggle will affect load calculations and therefore penalties.

Obviously, if an item is not carried it cannot be equipped, so items are automatically unequipped if they are not carried.

### Armor Gear Dialog
![Skills Tab] (images/screenshots/FVTT_HM3_Skills.jpg)

The Armor Gear dialog provides details of a specific piece of armor.  You may specify the protective value of the armor, and the locations where that armor is protecting/covering.

Any equipped armor will provide its protective values automatically to all locations where it is covering.

## Dice Rolls

There are a number of rolls performed by this system.  Most rolls are self-explanatory, usually a d100 roll which can end in Critical Success, Moderate Success, Moderate Failure, or Critical Failure.  d6 rolls are normally only Success or Failure (no criticals).

### Attack/Defense Rolls
![Attack-Defense Chat] (images/screenshots/FVTT_HM3_AtkDef_Rolls.jpg)

When an attack roll is made, a entry is posted to the chat window specifying the weapon, any modifiers, and the result.

The defender then performs a defense roll, specifying the type of defense and any modifiers, which then shows the result.

The players will have to consult the H&acirc;rnMaster combat tables for the results of success or failure.

### Damage/Injury Rolls
![Damage-Injury Chat] (images/screenshots/FVTT_HM3_DmgInjury_Rolls.jpg)

Once the HarnMaster combat tables indicate that an attack succeeds, the attacker performs a damage roll.  This will request the number of dice, the damage aspect (blunt, edged, piercing, or fire), and any additional modifiers.  The result will then be displayed.

Finally, the defender performs an Injury roll.  This automatically calculates the injury location (or one can be manually specified) based on the location weightings, subtracts any armor at that location, and if injury results calculates the Injury Level and Severity, as well as other effects.

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
  1. Ability Scores (except no Comliness or Morality)
  2. Basic Skills
  3. Combat (Weapons, Injuries, Armor Locations)
  4. Misc. Gear
  5. Description

Note that when creating a character, you will be prompted whether to install standard skills and standard humanoid armor locations.  When creating a creature, no armor locations will be preloaded, since each creature will have different armor locations (although a few basic combat skills are preloaded).

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

