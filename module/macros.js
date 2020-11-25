import { DiceHM3 } from './dice-hm3.js';

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
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'skill', actor);
    if (!item) return;

    const label = `${item.data.name} Skill Test`;
    return actor._d100StdRoll(label, item.data.data.effectiveMasteryLevel, speaker, noDialog, item.data.data.notes);
}

export function castSpellRoll(itemName, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'spell', actor);
    if (!item) return;

    const label = `Casting ${item.data.name}`;
    return actor._d100StdRoll(label, item.data.data.effectiveMasteryLevel, speaker, noDialog, item.data.data.notes);
}

export function invokeRitualRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'invocation', actor);
    if (!item) return;

    const label = `Invoking ${item.data.name} Ritual`;
    return actor._d100StdRoll(label, item.data.data.effectiveMasteryLevel, speaker, noDialog, item.data.data.notes);
}

export function usePsionicRoll(itemName, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'psionic', actor);
    if (!item) return;

    const label = `Using ${item.data.name} Talent`;
    return actor._d100StdRoll(label, item.data.data.effectiveMasteryLevel, speaker, noDialog, item.data.data.notes);
}

export function testAbilityD6Roll(ability, noDialog = false, myActor=null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        return;
    }
    if (!ability || !abilities.includes(ability)) return;

    const label = `d6 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`;
    return actor._d6StdRoll(label, actor.data.data.abilities[ability].effective, 3, speaker, noDialog, item.data.data.notes);
}

export function testAbilityD100Roll(ability, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        return;
    }
    if (!ability || !abilities.includes(ability)) return;

    const label = `d100 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`;
    return actor._d100StdRoll(label, Math.max(95, Math.min(5, actor.data.data.abilities[ability].effective * 5)), speaker, noDialog, item.data.data.notes);
}

export function weaponDamageRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const rollData = {
        weapon: item.data.name,
        data: actor.data,
        speaker: speaker
    };
    return DiceHM3.damageRoll(rollData);
}

export function missileDamageRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'missilegear', actor);
    if (!item) return;

    const rollData = {
        name: item.data.name,
        aspect: item.data.data.weaponAspect,
        impactShort: item.data.data.impact.short,
        impactMedium: item.data.data.impact.medium,
        impactLong: item.data.data.impact.long,
        impactExtreme: item.data.data.impact.extreme,
        data: actor.data,
        speaker: speaker
    };
    return DiceHM3.missileDamageRoll(rollData);
}

export function weaponAttackRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const label = `${item.data.name} Attack`;
    const rollData = {
        label: label,
        target: item.data.data.attackMasteryLevel,
        fastforward: noDialog,
        data: this.data,
        speaker: speaker,
        notes: item.data.data.notes
    };
    console.log(item);
    console.log(rollData);
    return DiceHM3.d100StdRoll(rollData);
}

export function weaponDefendRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'weapongear', actor);
    if (!item) return;

    const label = `${item.data.name} Defense`;
    const rollData = {
        label: label,
        target: item.data.data.defenseMasteryLevel,
        fastforward: noDialog,
        data: this.data,
        speaker: speaker
    };
    return DiceHM3.d100StdRoll(rollData);
}

export function missileAttackRoll(itemName, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'missilegear', actor);
    if (!item) return;

    const rollData = {
        name: item.data.name,
        target: item.data.data.attackMasteryLevel,
        aspect: item.data.data.defaultAspect,
        rangeShort: item.data.data.range.short,
        rangeMedium: item.data.data.range.medium,
        rangeLong: item.data.data.range.long,
        rangeExtreme: item.data.data.range.extreme,
        data: this.data,
        speaker: speaker
    }
    return DiceHM3.missileAttackRoll(rollData);
}

export function injuryRoll(myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const rollData = {
        actor: actor,
        speaker: speaker
    };
    return DiceHM3.injuryRoll(rollData);
}

export function healingRoll(itemName, noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const item = getItem(itemName, 'injury', actor);
    if (!item) return;

    const label = `${item.data.name} Healing Roll`;
    return actor._d100StdRoll(label, item.data.data.healRate*actor.data.data.endurance, speaker, noDialog, item.data.data.notes);
}

export function dodgeRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const label = `Dodge Roll`;
    return actor._d100StdRoll(label, actor.data.data.dodge, speaker, noDialog);
}

export function shockRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const label = `Shock Roll`;
    return actor._d6StdRoll(label, actor.data.data.endurance, actor.data.data.universalPenalty, speaker, noDialog);
}

export function stumbleRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const label = `Stumble Roll`;
    return actor._d6StdRoll(label, actor.data.data.stumbleTarget, 3, speaker, noDialog);
}

export function fumbleRoll(noDialog = false, myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const label = `Fumble Roll`;
    return actor._d6StdRoll(label, actor.data.data.fumbleTarget, 3, speaker, noDialog);
}

export function genericDamageRoll(myActor = null) {
    const speaker = ChatMessage.getSpeaker();
    let actor = myActor;
    if (!actor && speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) {
        ui.notifications.warn(`No actor selected, roll ignored.`);
        return;
    }

    const rollData = {
        weapon: '',
        data: actor.data,
        speaker: speaker
    };
    return DiceHM3.damageRoll(rollData);
}

function getItem(itemName, type, actor) {
    let item = actor.getOwnedItem(itemName);
    if (!item) {
        const lcItemName = itemName.toLowerCase();
        const items = actor ? actor.items.filter(i => i.type === type && i.name.toLowerCase() === lcItemName) : [];
        if (items.length > 1) {
            ui.notifications.warn(`Your controlled Actor ${actor.name} has more than one skill with name ${itemName}. The first matched skill will be chosen.`);
        } else if (items.length === 0) {
            ui.notifications.warn(`Your controlled Actor does not have a skill named ${itemName}`);
            return null;
        }
        item = items[0];
    }
    return item;
}
