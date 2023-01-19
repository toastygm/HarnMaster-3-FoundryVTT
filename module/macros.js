import { DiceHM3 } from './dice-hm3.js';
import * as combat from './combat.js';
import * as utility from './utility.js';
import { HM3 } from './config.js';

/**
 * Create a script macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createHM3Macro(data, slot) {
    if (data.type !== "Item") return null;
    if (!data.system) return ui.notifications.warn("No macro exists for that type of object.");

    let command;
    switch (data.type) {
        case 'skill':
            command = `game.hm3.macros.skillRoll("${data.name}");`;
            break;

        case 'psionic':
            command = `game.hm3.macros.usePsionicRoll("${data.name}");`;
            break;

        case 'spell':
            command = `game.hm3.macros.castSpellRoll("${data.name}");`;
            break;

        case 'invocation':
            command = `game.hm3.macros.invokeRitualRoll("${data.name}");`;
            break;

        case 'weapongear':
            return await askWeaponMacro(data.name, slot, data.img);

        case 'missilegear':
            return await askMissileMacro(data.name, slot, data.img);

        case 'injury':
            command = `game.hm3.macros.healingRoll("${data.name}");`;
            break;

        default:
            return false;
    }

    return await applyMacro(data.name, command, slot, data.img, {"hm3.itemMacro": false});
}

async function applyMacro(name, command, slot, img, flags) {
    let macro = [game.macros.values()].find(m => (m.name === name) && (m.command === command));
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
    const dlghtml = '<p>Select the type of weapon macro to create:</p>'
    
    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: 'Select Weapon Macro',
            content: dlghtml.trim(),
            buttons: {
                enhAttackButton: {
                    label: "Automated Combat",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.weaponAttack("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                },
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
            default: "enhAttackButton",
            close: () => resolve(false)
        }).render(true)
    });
}

function askMissileMacro(name, slot, img) {
    const dlghtml = '<p>Select the type of missile macro to create:</p>'
    
    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: 'Select Missile Macro',
            content: dlghtml.trim(),
            buttons: {
                enhAttackButton: {
                    label: "Automated Combat",
                    callback: async (html) => {
                        return await applyMacro(name, `game.hm3.macros.missileAttack("${name}");`, slot, img, {"hm3.itemMacro": false});
                    }
                },
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
            default: "enhAttackButton",
            close: () => resolve(false)
        }).render(true)
    });
}

export async function skillRoll(itemName, noDialog = false, myActor=null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'skill', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of skills for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        type: `skill-${item.name}`,
        label: `${item.name} Skill Test`,
        target: item.system.effectiveMasteryLevel,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            eml: item.system.effectiveMasteryLevel,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase.value,
            si: item.system.skillIndex    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preSkillRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            item.runCustomMacro(result);
            callOnHooks("hm3.onSkillRoll", actor, result, stdRollData, item);    
        }
        return result;
    }
    return null;
}

export async function castSpellRoll(itemName, noDialog = false, myActor=null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'spell', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of spells for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        type: `spell-${item.name}`,
        label: `Casting ${item.name}`,
        target: item.system.effectiveMasteryLevel,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            eml: item.system.effectiveMasteryLevel,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase,
            si: item.system.skillIndex,
            spellName: item.name,
            convocation: item.system.convocation,
            level: item.system.level    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }

    const hooksOk = Hooks.call("hm3.preSpellRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            item.runCustomMacro(result);
            callOnHooks("hm3.onSpellRoll", actor, result, stdRollData, item);
        }
        return result;
    }
    return null;
}

export async function invokeRitualRoll(itemName, noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'invocation', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of ritual invocations for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        type: `invocation-${item.name}`,
        label: `Invoking ${item.name} Ritual`,
        target: item.system.effectiveMasteryLevel,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            eml: item.system.effectiveMasteryLevel,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase,
            si: item.system.skillIndex,
            invocationName: item.name,
            diety: item.system.diety,
            circle: item.system.circle    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preInvocationRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            item.runCustomMacro(result);
            callOnHooks("hm3.onInvocationRoll", actor, result, stdRollData, item);    
        }
        return result;
    }
    return null;
}

export async function usePsionicRoll(itemName, noDialog = false, myActor=null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'psionic', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of psionic talents for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        type: `psionic-${item.name}`,
        label: `Using ${item.name} Talent`,
        target: item.system.effectiveMasteryLevel,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            eml: item.system.effectiveMasteryLevel,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase.value,
            si: item.system.skillIndex,
            psionicName: item.name,
            fatigueCost: item.system.fatigue  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.prePsionicsRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            item.runCustomMacro(result);
            callOnHooks("hm3.onPsionicsRoll", actor, result, stdRollData, item);    
        }
        return result;
    }
    return null;
}

export async function testAbilityD6Roll(ability, noDialog = false, myActor=null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let abilities;
    if (actor.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        ui.notifications.warn(`${actor.name} does not have ability scores.`);
        return null;
    }
    if (!ability || !abilities.includes(ability)) return null;


    const stdRollData = {
        type: `${ability}-d6`,
        label: `d6 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: actor.system.abilities[ability].effective,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preAbilityRollD6", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d6Roll(stdRollData);
        if (result) {
            actor.runCustomMacro(result);
            callOnHooks("hm3.onAbilityRollD6", actor, result, stdRollData);    
        }
        return result;
    }
    return null;
}

export async function testAbilityD100Roll(ability, noDialog = false, myActor = null, multiplier=5) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let abilities;
    if (actor.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        ui.notifications.warn(`${actor.name} does not have ability scores.`);
        return null;
    }
    if (!ability || !abilities.includes(ability)) return null;

    const stdRollData = {
        type: `${ability}-d100`,
        label: `d100 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: Math.max(5, actor.system.abilities[ability].effective * multiplier),
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preAbilityRollD100", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            actor.runCustomMacro(result);
            callOnHooks("hm3.onAbilityRollD100", actor, result, stdRollData);    
        }
        return result;
    }
    return null;
}

export async function weaponDamageRoll(itemName, aspect=null, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    if (aspect) {
        if (!HM3.allowedAspects.includes(aspect)) {
            ui.notifications.warn(`Invalid aspect requested on damage roll: ${aspect}`);
            return null;
        }
    }

    const item = combat.getItem(itemName, 'weapongear', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of melee weapons for ${actor.name}.`);
        return null;
    }

    const rollData = {
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            weaponName: item.name 
        },
        weapon: item.name,
        data: actor,
        speaker: speaker,
        aspect: aspect ? aspect : null,
        notes: item.system.notes
    };
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preDamageRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.damageRoll(rollData);
        if (result) {
            callOnHooks("hm3.onDamageRoll", actor, result, rollData);
        }
        return result;
    }
    return null;
}

export async function missileDamageRoll(itemName, range=null, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'missilegear', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of melee weapons for ${actor.name}.`);
        return null;
    }

    if (range) {
        if (!HM3.allowedRanges.includes(range)) {
            ui.notifications.warn(`Invalid range requested on damage roll: ${range}`);
            return null;
        }
    }

    const rollData = {
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            missileName: item.name,
            aspect: item.system.weaponAspect
        },
        name: item.name,
        aspect: item.system.weaponAspect,
        defaultRange: range,
        impactShort: item.system.impact.short,
        impactMedium: item.system.impact.medium,
        impactLong: item.system.impact.long,
        impactExtreme: item.system.impact.extreme,
        data: actor,
        speaker: speaker,
        notes: item.system.notes
    };
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preMissileDamageRoll", rollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.missileDamageRoll(rollData);
        if (result) {
            callOnHooks("hm3.onMissileDamageRoll", actor, result, rollData);
        }
        return result;
    }
    return null;
}

export async function weaponAttackRoll(itemName, noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'weapongear', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of melee weapons for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        label: `${item.name} Attack`,
        target: item.system.attackMasteryLevel,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase,
            si: item.system.skillIndex,
            weaponName: item.name,
            attack: item.system.attack,
            atkMod: item.system.attackModifier,
            aml: item.system.attackMasteryLevel  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preWeaponAttackRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            callOnHooks("hm3.onWeaponAttackRoll", actor, result, stdRollData, item);
        }
        return result;
    }
    return null;
}

export async function weaponDefendRoll(itemName, noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'weapongear', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of melee weapons for ${actor.name}.`);
        return null;
    }

    let outnumberedMod = 0;
    if (actor.system?.eph?.outnumbered > 1) {
        outnumberedMod = Math.floor(actor.system.eph.outnumbered - 1) * -10;
    }

    const stdRollData = {
        label: `${item.name} Defense`,
        target: item.system.defenseMasteryLevel,
        modifier: outnumberedMod,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            ml: item.system.masteryLevel,
            sb: item.system.skillBase,
            si: item.system.skillIndex,
            weaponName: item.name,
            defense: item.system.defense,
            dml: item.system.defenseMasteryLevel  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preWeaponDefendRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            callOnHooks("hm3.onWeaponDefendRoll", actor, result, stdRollData, item);
        }
        return result;
    }
    return null;
}

export async function missileAttackRoll(itemName, myActor = null) {
    const actor = getActor(myActor);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({actor: actor});

    const item = combat.getItem(itemName, 'missilegear', actor);

    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of missile weapons for ${actor.name}.`);
        return null;
    }

    const rollData = {
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            missileName: item.name
        },
        name: item.name,
        target: item.system.attackMasteryLevel,
        aspect: item.system.weaponAspect,
        rangeShort: item.system.range.short,
        rangeMedium: item.system.range.medium,
        rangeLong: item.system.range.long,
        rangeExtreme: item.system.range.extreme,
        data: item,
        speaker: speaker,
        notes: item.system.notes
    }
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preMissileAttackRoll", rollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.missileAttackRoll(rollData);
        if (result) {
            callOnHooks("hm3.onMissileAttackRoll", actor, result, rollData, item);
        }
        return result;
    }
    return null;
}

export async function injuryRoll(myActor = null, rollData = {}) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    rollData.notesData = {};
    rollData.actor = actor;
    rollData.speaker = speaker;
    rollData.name = actor.token ? actor.token.name : actor.name;
    rollData.notes = '';

    const hooksOk = Hooks.call("hm3.preInjuryRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.injuryRoll(rollData);
        if (result) {
            callOnHooks("hm3.onInjuryRoll", actor, result, rollData);
        }
        return result;
    }
    return null;
}

export async function healingRoll(itemName, noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const item = combat.getItem(itemName, 'injury', actor);
    if (!item) {
        ui.notifications.warn(`${itemName} could not be found in the list of injuries for ${actor.name}.`);
        return null;
    }

    const stdRollData = {
        type: 'healing',
        label: `${item.name} Healing Roll`,
        target: item.system.healRate*actor.system.endurance,
        notesData: {
            up: actor.system.universalPenalty,
            pp: actor.system.physicalPenalty,
            il: actor.system.eph.totalInjuryLevels || 0,
            fatigue: actor.system.eph.fatigue,
            endurance: actor.system.endurance,
            injuryName: item.name,
            healRate: item.system.healRate  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.system.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preHealingRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        item.runCustomMacro(result);
        if (result) {
            callOnHooks("hm3.onHealingRoll", actor, result, stdRollData, item);
        }
        return result;
    }
    return null;
}

export async function dodgeRoll(noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'dodge',
        label: `Dodge Roll`,
        target: actor.system.dodge,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preDodgeRoll", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        if (result) {
            callOnHooks("hm3.onDodgeRoll", actor, result, stdRollData);
        }
        return result;
    }
    return null;
}

export async function shockRoll(noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let hooksOk = false;
    let stdRollData = null;
    stdRollData = {
        type: 'shock',
        label: `Shock Roll`,
        target: actor.system.endurance,
        numdice: actor.system.universalPenalty,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    hooksOk = Hooks.call("hm3.preShockRoll", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d6Roll(stdRollData);
        actor.runCustomMacro(result);
        if (result) {
            callOnHooks("hm3.onShockRoll", actor, result, stdRollData);
        }
        return result;
    }
    return null;
}

export async function stumbleRoll(noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'stumble',
        label: `${actor.isToken ? actor.token.name : actor.name} Stumble Roll`,
        target: actor.system.eph.stumbleTarget,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }

    const hooksOk = Hooks.call("hm3.preStumbleRoll", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d6Roll(stdRollData);
        if (result) {
            actor.runCustomMacro(result);
            callOnHooks("hm3.onStumbleRoll", actor, result, stdRollData);    
        }
        return result;
    }
    return null;
}

export async function fumbleRoll(noDialog = false, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'fumble',
        label: `${actor.isToken ? actor.token.name : actor.name} Fumble Roll`,
        target: actor.system.eph.fumbleTarget,
        numdice: 3,
        notesData: {},
        speaker: speaker,
        fastforward: noDialog,
        notes: ''
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preFumbleRoll", stdRollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.d6Roll(stdRollData);
        if (result) {
            actor.runCustomMacro(result);
            callOnHooks("hm3.onFumbleRoll", actor, result, stdRollData);    
        }
        return result;
    }
    return null;
}

export async function genericDamageRoll(myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const rollData = {
        weapon: '',
        data: actor,
        speaker: speaker,
        notesData: {},
        notes: ''
    };
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preDamageRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.damageRoll(rollData);
        if (result) {
            callOnHooks("hm3.onDamageRoll", actor, result, rollData);
        }
        return result;
    }
    return null;
}

export async function changeFatigue(newValue, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor || !actor.isOwner) {
        ui.notifications.warn(`You are not an owner of ${actor.name}, so you may not change fatigue.`);
        return false;
    }

    const updateData = {};
    if (/^\s*[+-]/.test(newValue)) {
        // relative change
        const changeValue = parseInt(newValue, 10);
        if (!isNaN(changeValue)) updateData['system.fatigue'] = Math.max(actor.system.fatigue + changeValue, 0);
    } else {
        const value = parseInt(newValue, 10);
        if (!isNaN(value)) updateData['system.fatigue'] = value;
    }
    if (typeof updateData['system.fatigue'] !== 'undefined') {
        await actor.update(updateData);
    }

    return true;
}

export async function changeMissileQuanity(missileName, newValue, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor.isOwner) {
        ui.notifications.warn(`You are not an owner of ${actor.name}, so you may not change ${missileName} quantity.`);
        return false;
    }

    const missile = combat.getItem(missileName, 'missilegear', actor);
    if (!missile) {
        ui.notifications.warn(`${actor.name} does not have any missiles named ${missileName}.`);
        return false;
    }

    const updateData = {};
    if (/^\s*[+-]/.test(newValue)) {
        // relative change
        const changeValue = parseInt(newValue, 10);
        if (!isNaN(changeValue)) updateData['system.quantity'] = Math.max(missile.system.quantity + changeValue, 0);
    } else {
        const value = parseInt(newValue, 10);
        if (!isNaN(value)) updateData['system.quantity'] = value;
    }

    if (typeof updateData['system.quantity'] !== 'undefined') {
        const item = actor.items.get(missile.id);
        await item.update(updateData);
    }
    return true;
}

export async function setSkillDevelopmentFlag(skillName, myActor = null) {
    const speaker = myActor instanceof Actor ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }
    
    if (!actor.isOwner) {
        ui.notifications.warn(`You are not an owner of ${actor.name}, so you may not set the skill development flag.`);
        return null;
    }

    const skill = combat.getItem(skillName, 'skill', actor);
    if (!skill) {
        ui.notifications.warn(`${actor.name} does not have a skill named ${skillName}.`);
        return null;
    }

    if (!skill.system.improveFlag) {
        const updateData = { 'system.improveFlag': true };
        await skill.update(updateData);
    }

    return true;
}

/*--------------------------------------------------------------*/
/*        AUTOMATED COMBAT                                      */
/*--------------------------------------------------------------*/

export async function weaponAttack(itemName = null, noDialog = false, myToken = null, forceAllow=false) {
    const combatant = getTokenInCombat(myToken, forceAllow);
    if (!combatant) return null;

    const targetToken = getUserTargetedToken(combatant);
    if (!targetToken) return null;

    let weapon = null;
    if (itemName) {
        weapon = combat.getItem(itemName, 'weapongear', combatant.actor);
    }

    const hooksOk = Hooks.call("hm3.preMeleeAttack", combatant, targetToken, weapon);
    if (hooksOk) {
        const result = await combat.meleeAttack(combatant.token, targetToken, weapon);
        Hooks.call("hm3.onMeleeAttack", result, combatant, targetToken, weapon);
        return result;
    }
    return null;
}

export async function missileAttack(itemName = null, noDialog = false, myToken = null, forceAllow=false) {
    const combatant = getTokenInCombat(myToken, forceAllow);
    if (!combatant) return null;
    
    const targetToken = getUserTargetedToken(combatant);
    if (!targetToken) return null;

    let missile = null;
    if (itemName) {
        missile = combat.getItem(itemName, 'missilegear', combatant.actor);
    }

    const hooksOk = Hooks.call("hm3.preMissileAttack", combatant, targetToken, missile);
    if (hooksOk) {
        const result = await combat.missileAttack(combatant.token, targetToken, missile);
        Hooks.call("hm3.onMissileAttack", result, combatant, targetToken, missile);
        return result;
    }
    return null;
}

/**
 * Resume the attack with the defender performing the "Counterstrike" defense.
 * Note that this defense is only applicable to melee attacks.
 * 
 * @param {*} atkTokenId Token representing the attacker
 * @param {*} defTokenId Token representing the defender/counterstriker
 * @param {*} atkWeaponName Name of the weapon the attacker is using
 * @param {*} atkEffAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} atkAim Attack aim ("High", "Mid", "Low")
 * @param {*} atkAspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} atkImpactMod Additional modifier to impact
 */
export async function meleeCounterstrikeResume(atkTokenId, defTokenId, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod) {
    const atkToken = canvas.tokens.get(atkTokenId);
    if (!atkToken) {
        ui.notifications.warn(`Attacker ${atkToken.name} could not be found on canvas.`);
        return null;
    }

    const defToken = canvas.tokens.get(defTokenId);
    if (!defToken) {
        ui.notifications.warn(`Defender ${defToken.name} could not be found on canvas.`);
        return null;
    }

    const hooksOk = Hooks.call("hm3.preMeleeCounterstrikeResume", atkToken, defToken, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod);
    if (hooksOk) {
        const result = await combat.meleeCounterstrikeResume(atkToken, defToken, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod);
        Hooks.call("hm3.onMeleeCounterstrikeResume", result, atkToken, defToken, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod);
        return result;
    }
    return null;
}

/**
 * Resume the attack with the defender performing the "Dodge" defense.
 * 
 * @param {*} atkTokenId Token representing the attacker
 * @param {*} defTokenId Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function dodgeResume(atkTokenId, defTokenId, type, weaponName, effAML, aim, aspect, impactMod) {
    const atkToken = canvas.tokens.get(atkTokenId);
    if (!atkToken) {
        ui.notifications.warn(`Attacker ${atkToken.name} could not be found on canvas.`);
        return null;
    }

    const defToken = canvas.tokens.get(defTokenId);
    if (!defToken) {
        ui.notifications.warn(`Defender ${defToken.name} could not be found on canvas.`);
        return null;
    }

    const hooksOk = Hooks.call("hm3.preDodgeResume", atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
    if (hooksOk) {
        const result = await combat.dodgeResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        Hooks.call("hm3.onDodgeResume", result, atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        return result;
    }
    return null;
}

/**
 * Resume the attack with the defender performing the "Block" defense.
 * 
 * @param {*} atkTokenId Token representing the attacker
 * @param {*} defTokenId Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function blockResume(atkTokenId, defTokenId, type, weaponName, effAML, aim, aspect, impactMod) {
    const atkToken = canvas.tokens.get(atkTokenId);
    if (!atkToken) {
        ui.notifications.warn(`Attacker ${atkToken.name} could not be found on canvas.`);
        return null;
    }

    const defToken = canvas.tokens.get(defTokenId);
    if (!defToken) {
        ui.notifications.warn(`Defender ${defToken.name} could not be found on canvas.`);
        return null;
    }

    const hooksOk = Hooks.call("hm3.preBlockResume", atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
    if (hooksOk) {
        const result = await combat.blockResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod)
        Hooks.call("hm3.onBlockResume", result, atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        return result;
    }
    return null;
}

/**
 * Resume the attack with the defender performing the "Ignore" defense.
 * 
 * @param {*} atkTokenId Token representing the attacker
 * @param {*} defTokenId Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function ignoreResume(atkTokenId, defTokenId, type, weaponName, effAML, aim, aspect, impactMod) {
    const atkToken = canvas.tokens.get(atkTokenId);
    if (!atkToken) {
        ui.notifications.warn(`Attacker ${atkToken.name} could not be found on canvas.`);
        return null;
    }

    const defToken = canvas.tokens.get(defTokenId);
    if (!defToken) {
        ui.notifications.warn(`Defender ${defToken.name} could not be found on canvas.`);
        return null;
    }

    const hooksOk = Hooks.call("hm3.preIgnoreResume", atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
    if (hooksOk) {
        const result = await combat.ignoreResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        Hooks.call("hm3.onIgnoreResume", result, atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        return result;
    }
    return null;
}

/*--------------------------------------------------------------*/
/*        UTILITY FUNCTIONS                                     */
/*--------------------------------------------------------------*/

/**
 * Determines the identity of the current token/actor that is in combat. If token
 * is specified, tries to use token (and will allow it regardless if user is GM.),
 * otherwise returned token will be the combatant whose turn it currently is.
 *   
 * @param {Token} token 
 */
function getTokenInCombat(token=null, forceAllow=false) {
    if (token && (game.user.isGM || forceAllow)) {
        const result = {token: token, actor: token.actor };
        return result;
    }
    
    if (!game.combat || game.combat.combatants.length === 0) {
        ui.notifications.warn(`No active combatant.`);
        return null;
    }

    const combatant = game.combat.combatant;

    if (token && (token.id !== combatant.token.id)) {
        ui.notifications.warn(`${token.name} cannot perform that action at this time.`);
        return null;
    }

    if (!combatant.actor.isOwner) {
        ui.notifications.warn(`You do not have permissions to control ${combatant.token.name}.`);
        return null;
    }

    token = canvas.tokens.get(combatant.token.id);
    return { token: token, actor: combatant.actor};
}

function getSingleSelectedToken() {
    const numTargets = canvas.tokens?.controlled?.length;
    if (!numTargets) {
        ui.notifications.warn(`No selected tokens on the canvas.`);
        return null;
    }

    if (numTargets > 1) {
        ui.notifications.warn(`There are ${numTargets} selected tokens on the canvas, please select only one`);
        return null;
    }

    return canvas.tokens.controlled[0];
}

function getUserTargetedToken(combatant) {
    const targets = game.user.targets;
    if (!targets?.size) {
        ui.notifications.warn(`No targets selected, you must select exactly one target, combat aborted.`);
        return null;
    } else if (targets.size > 1) {
        ui.notifications.warn(`${targets} targets selected, you must select exactly one target, combat aborted.`);
    }

    const targetToken = Array.from(game.user.targets)[0];

    if (combatant?.token && targetToken.id === combatant.token.id) {
        ui.notifications.warn(`You have targetted the combatant, they cannot attack themself, combat aborted.`);
        return null;
    }

    return targetToken;
}

function getActor(actor, speaker) {
    let resultActor = null;

    // If actor is an object, we presume it is an Actor so we just return it
    if (actor && typeof actor === 'object') {
        resultActor = actor;
    } else {
        if (!actor) {
            // If actor was null, lets try to figure it out from the Speaker
            if (!speaker) speaker = ChatMessage.getSpeaker();
            if (speaker.token) {
                const token = canvas.tokens.get(speaker.token)
                resultActor = token.actor;
            }
            if (!resultActor) resultActor = game.actors.get(speaker.actor);
            if (!resultActor) {
                ui.notifications.warn(`No actor selected, roll ignored.`);
                return null;
            }    
        } else {
            // The actor must actually be either an Actor or Token id, or actor name
            if (actor.startsWith('Actor$')) {
                // We have a real actor id, so grab it from game.actors
                resultActor = game.actors.get(actor.slice(6));
            } else if (actor.startsWith('Token$')) {
                // We have a token id, so grab it from canvas.tokens
                const tokId = actor.slice(6);
                const token = canvas.tokens.get(tokId);
                resultActor = token.actor;
            } else {
                // This must be an actor name, grab it from game.actors by name
                resultActor = game.actors.getName(actor);
            }
        }
    
        if (!resultActor) {
            ui.notifications.warn(`No actor selected, roll ignored.`);
            return null;
        }    
    }

    if (!resultActor.isOwner) {
        ui.notifications.warn(`You do not have permissions to control ${resultActor.name}.`);
        return null;
    }

    return resultActor;
}

export function callOnHooks(hook, actor, result, rollData, item=null) {
    const rollResult = {
        type: result.type,
        title: result.title,
        origTarget: result.origTarget,
        modifier: (result.plusMinus === '-' ? -1 : 1) * result.modifier,
        modifiedTarget: result.modifiedTarget,
        rollValue: result.rollValue,
        isSuccess: result.isSuccess,
        isCritical: result.isCritical,
        result: result.isSuccess ? (result.isCritical ? 'CS' : 'MS') : (result.isCritical ? 'CF' : 'MF'),
        description: result.description,
        notes: result.notes
    };

    const foundMacro = game.macros.getName(hook);

    if (foundMacro && !foundMacro.hasPlayerOwner) {
        const token = actor?.isToken ? actor.token: null;

        utility.executeMacroScript(foundMacro, {actor: actor, token: token, rollResult: rollResult, rollData: rollData, item: item});
    }

    if (item) {
        return Hooks.call(hook, actor, rollResult, rollData, item);
    } else {
        return Hooks.call(hook, actor, rollResult, rollData);
    }
}
