import { DiceHM3 } from './dice-hm3.js';
import * as combat from './combat.js';

/**
 * Create a script macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createHM3Macro(data, slot) {
    if (data.type !== "Item") return;
    if (!data.data) return ui.notifications.warn("No macro exists for that type of object.");
    const item = data.data;

    let command;
    switch (item.type) {
        case 'skill':
            command = `game.hm3.macros.skillRoll("${item.name}");`;
            break;

        case 'psionic':
            command = `game.hm3.macros.usePsionicRoll("${item.name}");`;
            break;

        case 'spell':
            command = `game.hm3.macros.castSpellRoll("${item.name}");`;
            break;

        case 'invocation':
            command = `game.hm3.macros.invokeRitualRoll("${item.name}");`;
            break;

        case 'weapongear':
            return await askWeaponMacro(item.name, slot, item.img);

        case 'missilegear':
            return await askMissileMacro(item.name, slot, item.img);

        case 'injury':
            command = `game.hm3.macros.healingRoll("${item.name}");`;
            break;

        default:
            return false;
    }

    return await applyMacro(item.name, command, slot, item.img, {"hm3.itemMacro": false});
}

async function applyMacro(name, command, slot, img, flags) {
    let macro = game.macros.entities.find(m => (m.name === name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: name,
            type: "script",
            img: img,
            command: command,
            flags: flags
        });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}

function askWeaponMacro(name, slot, img) {
    const html = '<p>Select the type of weapon macro to create:</p>'
    
    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: 'Select Weapon Macro',
            content: html.trim(),
            buttons: {
                attackButton: {
                    label: "Attack",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.weaponAttackRoll("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                },
                defendButton: {
                    label: "Defend",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.weaponDefendRoll("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                },
                damageButton: {
                    label: "Damage",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.weaponDamageRoll("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                }
            },
            default: "attackButton",
            close: () => resolve(false)
        }).render(true)
    });
}

function askMissileMacro(name, slot, img) {
    const html = '<p>Select the type of missile macro to create:</p>'
    
    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: 'Select Missile Macro',
            content: html.trim(),
            buttons: {
                attackButton: {
                    label: "Attack",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.missileAttackRoll("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                },
                damageButton: {
                    label: "Damage",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.missileDamageRoll("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                }
            },
            default: "attackButton",
            close: () => resolve(false)
        }).render(true)
    });
}

export function skillRoll(itemName, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'skill', actor);
    if (!item) return;

    const stdRollData = {
        label: `${item.data.name} Skill Test`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            eml: item.data.data.effectiveMasteryLevel,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase.value,
            si: item.data.data.skillIndex    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function castSpellRoll(itemName, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'spell', actor);
    if (!item) return;

    const stdRollData = {
        label: `Casting ${item.data.name}`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            eml: item.data.data.effectiveMasteryLevel,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase,
            si: item.data.data.skillIndex,
            spellName: item.data.name,
            convocation: item.data.data.convocation,
            level: item.data.data.level    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function invokeRitualRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'invocation', actor);
    if (!item) return;

    const stdRollData = {
        label: `Invoking ${item.data.name} Ritual`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            eml: item.data.data.effectiveMasteryLevel,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase,
            si: item.data.data.skillIndex,
            invocationName: item.data.name,
            diety: item.data.data.diety,
            circle: item.data.data.circle    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function usePsionicRoll(itemName, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'psionic', actor);
    if (!item) return;

    const stdRollData = {
        label: `Using ${item.data.name} Talent`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            eml: item.data.data.effectiveMasteryLevel,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase.value,
            si: item.data.data.skillIndex,
            psionicName: item.data.name,
            fatigueCost: item.data.data.fatigue  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function testAbilityD6Roll(ability, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        return;
    }
    if (!ability || !abilities.includes(ability)) return;


    const stdRollData = {
        label: `d6 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: actor.data.data.abilities[ability].effective,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d6StdRoll(stdRollData);
}

export function testAbilityD100Roll(ability, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        return;
    }
    if (!ability || !abilities.includes(ability)) return;

    const stdRollData = {
        label: `d100 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: Math.max(5, actor.data.data.abilities[ability].effective * 5),
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d100StdRoll(stdRollData);
}

export function weaponDamageRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const rollData = {
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            weaponName: item.data.name 
        },
        weapon: item.data.name,
        data: actor.data,
        speaker: speaker,
        notes: item.data.data.notes
    };
    return DiceHM3.damageRoll(rollData);
}

export function missileDamageRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
   if (!actor) return;

    const item = getItem(itemName, 'missilegear', actor);
    if (!item) return;

    const rollData = {
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            missileName: item.data.name,
            aspect: item.data.data.weaponAspect
        },
        name: item.data.name,
        aspect: item.data.data.weaponAspect,
        impactShort: item.data.data.impact.short,
        impactMedium: item.data.data.impact.medium,
        impactLong: item.data.data.impact.long,
        impactExtreme: item.data.data.impact.extreme,
        data: actor.data,
        speaker: speaker,
        notes: item.data.data.notes
    };
    return DiceHM3.missileDamageRoll(rollData);
}

export function weaponAttack(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const combatant = getCombatant();
    if (!combatant) return;

    const combatantToken = canvas.tokens.get(combatant.token._id);

    const targetToken = getSingleTarget();
    if (!targetToken) return;

    const weapon = getItem(itemName, 'weapongear', combatant.actor);
    if (!weapon) return;

    return combat.meleeAttack(combatantToken, targetToken, weapon);
}

export function missileAttack(itemName, noDialog = false) {
    const speaker = ChatMessage.getSpeaker();
    const combatant = getCombatant();
    if (!combatant) return;

    const combatantToken = canvas.tokens.get(combatant.token._id);
    
    const targetToken = getSingleTarget();
    if (!targetToken) return;

    const missile = getItem(itemName, 'missilegear', combatant.actor);
    if (!missile) return;

    return combat.missileAttack(combatantToken, targetToken, missile);
}

export function weaponAttackResume(atkTokenId, defTokenId, action, effAML, aim, aspect, impactMod) {
    const speaker = ChatMessage.getSpeaker();

    const atkToken = canvas.tokens.get(atkTokenId);
    if (!atkToken) return null;

    const defToken = canvas.tokens.get(defTokenId);
    if (!defToken) return null;

    return combat.meleeAttackResume(atkToken, defToken, action, effAML, aim, aspect, impactMod);
}

export function weaponAttackRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const stdRollData = {
        label: `${item.data.name} Attack`,
        target: item.data.data.attackMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase,
            si: item.data.data.skillIndex,
            weaponName: item.data.name,
            attack: item.data.data.attack,
            atkMod: item.data.data.attackModifier,
            aml: item.data.data.attackMasteryLevel  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function weaponDefendRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const stdRollData = {
        label: `${item.data.name} Defense`,
        target: item.data.data.defenseMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase,
            si: item.data.data.skillIndex,
            weaponName: item.data.name,
            defense: item.data.data.defense,
            dml: item.data.data.defenseMasteryLevel  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function missileAttackRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const combatant = getCombatant();
    const actor = combatant.actor;
    if (!actor) return;

    const targetToken = getSingleTarget();
    if (!targetToken) return;

    const range = missileRange(combatant.token, targetToken);

    const item = getItem(itemName, 'missilegear', actor);
    if (!item) return;

    const rollData = {
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            missileName: item.data.name
        },
        name: item.data.name,
        attackerName: combatant.token.data.name,
        defenderName: targetToken.data.name,
        target: item.data.data.attackMasteryLevel,
        aspect: item.data.data.weaponAspect,
        range: range,
        rangeShort: item.data.data.range.short,
        rangeMedium: item.data.data.range.medium,
        rangeLong: item.data.data.range.long,
        rangeExtreme: item.data.data.range.extreme,
        data: this.data,
        speaker: speaker,
        notes: item.data.data.notes
    }
    return DiceHM3.missileAttackRoll(rollData);
}

export function injuryRoll(myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;
    const rollData = {
        notesData: {},
        actor: actor,
        speaker: speaker,
        notes: ''
    };
    return DiceHM3.injuryRoll(rollData);
}

export function healingRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const item = getItem(itemName, 'injury', actor);
    if (!item) return;

    const stdRollData = {
        label: `${item.data.name} Healing Roll`,
        target: item.data.data.healRate*actor.data.data.endurance,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.totalInjuryLevels || 0,
            fatigue: actor.data.data.fatigue,
            endurance: actor.data.data.endurance,
            injuryName: item.data.name,
            healRate: item.data.data.healRate  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    return actor._d100StdRoll(stdRollData);
}

export function dodgeRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const stdRollData = {
        label: `Dodge Roll`,
        target: actor.data.data.dodge,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d100StdRoll(stdRollData);
}

export function shockRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const stdRollData = {
        label: `Shock Roll`,
        target: actor.data.data.endurance,
        numdice: actor.data.data.universalPenalty,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d6StdRoll(stdRollData);
}

export function stumbleRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const stdRollData = {
        label: `Stumble Roll`,
        target: actor.data.data.stumbleTarget,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d6StdRoll(stdRollData);
}

export function fumbleRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;

    const stdRollData = {
        label: `Fumble Roll`,
        target: actor.data.data.fumbleTarget,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    return actor._d6StdRoll(stdRollData);
}

export function genericDamageRoll(myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) return;
    const rollData = {
        weapon: '',
        data: actor.data,
        speaker: speaker,
        notesData: {},
        notes: ''
    };
    return DiceHM3.damageRoll(rollData);
}

function getItem(itemName, type, actor) {
    if (!actor || typeof actor !== 'object') {
        ui.notifications.warn('No actor was selected. You must select an actor.');
        return null;
    }

    if (!itemName) {
        ui.notifications.warn('No item name was specified. You must specify an item name.');
        return null;
    }

    let item = null;
    if (itemName.startsWith("Item$")) {
        return actor.getOwnedItem(itemName.slice(5));
    }
    if (!item) {
        const lcItemName = itemName.toLowerCase();
        const items = actor ? actor.items.filter(i => i.type === type && i.name.toLowerCase() === lcItemName) : [];
        if (items.length > 1) {
            ui.notifications.warn(`Your controlled Actor ${actor.name} has more than one ${type} with name ${itemName}. The first matched ${type} will be chosen.`);
        } else if (items.length === 0) {
            ui.notifications.warn(`Your controlled Actor does not have a ${type} named ${itemName}`);
            return null;
        }
        item = items[0];
    }

    if (!item) {
        ui.notifications.warn(`The item ${itemName} was not found`);
        return null;
    }

    return item;
}

function getCombatant() {
    if (game.combats.size === 0 || game.combats.active.data.combatants.length === 0) {
        ui.notifications.warn(`No active combatant.`);
        return null;
    }

    const combatant = game.combats.active.combatant;

    return {actor: combatant.actor, token: combatant.token};
}

function getSingleTarget() {
    const numTargets = canvas.tokens.controlled.length;
    if (numTargets === 0) {
        ui.notifications.warn(`No selected actors on the canvas.`);
        return null;
    }

    if (numTargets > 1) {
        ui.notifications.warn(`There are ${numTargets} selected actors on the canvas, please select only one`);
        return null;
    }

    return canvas.tokens.controlled[0];
}

function getActor(actor, speaker) {
    if (actor && typeof actor === 'object') return actor;
    let resultActor = null;
    if (actor === null) {
        if (!speaker) speaker = ChatMessage.getSpeaker();
        if (speaker.token) resultActor = game.actors.tokens[speaker.token];
        if (!resultActor) resultActor = game.actors.get(speaker.actor);
        if (!resultActor) {
            ui.notifications.warn(`No actor selected, roll ignored.`);
            return null;
        }    
    } else {
        let resultActor = null;
        if (actor.startsWith('Actor$')) {
            resultActor = game.actors.get(actor.slice(6));
        } else if (actor.startsWith('Token$')) {
            for (let tokActor in Object.values(game.actors.tokens)) {
                if (tokActor.token.data.name === actor.slice(6)) return tokActor;
            }
        } else {
            resultActor = game.actors.getName(actor);
        }

        if (!resultActor) {
            ui.notifications.warn(`Actor ${actor} not found, roll ignored.`);
            return null;
        }    
    }

    return resultActor;
}

