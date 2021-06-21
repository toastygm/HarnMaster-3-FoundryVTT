import { DiceHM3 } from './dice-hm3.js';
import * as combat from './combat.js';
import * as utility from './utility.js';

/**
 * Create a script macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createHM3Macro(data, slot) {
    if (data.type !== "Item") return null;
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
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
            eml: item.data.data.effectiveMasteryLevel,
            ml: item.data.data.masteryLevel,
            sb: item.data.data.skillBase.value,
            si: item.data.data.skillIndex    
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
    };
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preSkillRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        item.runCustomMacro(result);
        callOnHooks("hm3.onSkillRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function castSpellRoll(itemName, noDialog = false, myActor=null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        label: `Casting ${item.data.name}`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
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
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }

    const hooksOk = Hooks.call("hm3.preSpellRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        item.runCustomMacro(result);
        callOnHooks("hm3.onSpellRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function invokeRitualRoll(itemName, noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        label: `Invoking ${item.data.name} Ritual`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
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
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preInvocationRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        item.runCustomMacro(result);
        callOnHooks("hm3.onInvocationRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function usePsionicRoll(itemName, noDialog = false, myActor=null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        label: `Using ${item.data.name} Talent`,
        target: item.data.data.effectiveMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
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
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.prePsionicsRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        item.runCustomMacro(result);
        callOnHooks("hm3.onPsionicsRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function testAbilityD6Roll(ability, noDialog = false, myActor=null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        ui.notifications.warn(`${actor.name} does not have ability scores.`);
        return null;
    }
    if (!ability || !abilities.includes(ability)) return null;


    const stdRollData = {
        type: `${ability}-d6`,
        label: `d6 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: actor.data.data.abilities[ability].effective,
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
        actor.runCustomMacro(result);
        callOnHooks("hm3.onAbilityRollD6", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function testAbilityD100Roll(ability, noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let abilities;
    if (actor.data.type === 'character') {
        abilities = Object.keys(game.system.model.Actor.character.abilities);
    } else if (actor.data.type === 'creature') {
        abilities = Object.keys(game.system.model.Actor.creature.abilities);
    } else {
        ui.notifications.warn(`${actor.name} does not have ability scores.`);
        return null;
    }
    if (!ability || !abilities.includes(ability)) return null;

    const stdRollData = {
        type: `${ability}-d100`,
        label: `d100 ${ability[0].toUpperCase()}${ability.slice(1)} Roll`,
        target: Math.max(5, actor.data.data.abilities[ability].effective * 5),
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
        actor.runCustomMacro(result);
        callOnHooks("hm3.onAbilityRollD100", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function weaponDamageRoll(itemName, aspect=null, myActor = null) {
    const goldMode = game.settings.get("hm3", "goldMode");
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const allowedAspects = ['Edged', 'Piercing', 'Blunt'];
    if (goldMode) {
        allowedAspects.push('Squeeze');
        allowedAspects.push('Tear');
    }

    if (aspect) {
        if (!allowedAspects.includes(aspect)) {
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
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
            weaponName: item.data.name 
        },
        weapon: item.data.name,
        data: actor.data,
        speaker: speaker,
        aspect: aspect ? aspect : null,
        notes: item.data.data.notes
    };
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preDamageRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.damageRoll(rollData);
        callOnHooks("hm3.onDamageRoll", actor, result, rollData);
        return result;
    }
    return null;
}

export async function missileDamageRoll(itemName, range=null, myActor = null) {
    const goldMode = game.settings.get("hm3", "goldMode");
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        let allowedRanges = ['Short', 'Medium', 'Long', 'Extreme'];
        if (goldMode) {
            allowedRanges = allowedRanges.concat(['Extreme64', 'Extreme128', 'Extreme256']);
        }
        if (!allowedRanges.includes(range)) {
            ui.notifications.warn(`Invalid range requested on damage roll: ${range}`);
            return null;
        }
    }

    const rollData = {
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
            missileName: item.data.name,
            aspect: item.data.data.weaponAspect
        },
        name: item.data.name,
        aspect: item.data.data.weaponAspect,
        defaultRange: range,
        impactShort: item.data.data.impact.short,
        impactMedium: item.data.data.impact.medium,
        impactLong: item.data.data.impact.long,
        impactExtreme: item.data.data.impact.extreme,
        impactExtreme64: item.data.data.impact.extreme64,
        impactExtreme128: item.data.data.impact.extreme128,
        impactExtreme256: item.data.data.impact.extreme256,
        data: actor.data,
        speaker: speaker,
        notes: item.data.data.notes
    };
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preMissileDamageRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.missileDamageRoll(rollData);
        callOnHooks("hm3.onMissileDamageRoll", actor, result, rollData);
        return result;
    }
    return null;
}

export async function weaponAttackRoll(itemName, noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        label: `${item.data.name} Attack`,
        target: item.data.data.attackMasteryLevel,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
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
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preWeaponAttackRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        callOnHooks("hm3.onWeaponAttackRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function weaponDefendRoll(itemName, noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
    if (actor.data?.data?.eph?.outnumbered > 1) {
        outnumberedMod = Math.floor(actor.data.data.eph.outnumbered - 1) * -10;
    }

    const stdRollData = {
        label: `${item.data.name} Defense`,
        target: item.data.data.defenseMasteryLevel,
        modifier: outnumberedMod,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
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
    if (actor.isToken) {
        stdRollData.token = actor.token.id;
    } else {
        stdRollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preWeaponDefendRoll", stdRollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.d100StdRoll(stdRollData);
        callOnHooks("hm3.onWeaponDefendRoll", actor, result, stdRollData, item);
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
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
            missileName: item.data.name
        },
        name: item.data.name,
        target: item.data.data.attackMasteryLevel,
        aspect: item.data.data.weaponAspect,
        rangeShort: item.data.data.range.short,
        rangeMedium: item.data.data.range.medium,
        rangeLong: item.data.data.range.long,
        rangeExtreme: item.data.data.range.extreme,
        data: this.data,
        speaker: speaker,
        notes: item.data.data.notes
    }
    if (actor.isToken) {
        rollData.token = actor.token.id;
    } else {
        rollData.actor = actor.id;
    }
    
    const hooksOk = Hooks.call("hm3.preMissileAttackRoll", rollData, actor, item);
    if (hooksOk) {
        const result = await DiceHM3.missileAttackRoll(rollData);
        callOnHooks("hm3.onMissileAttackRoll", actor, result, rollData, item);
        return result;
    }
    return null;
}

export async function injuryRoll(myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const rollData = {
        notesData: {},
        actor: actor,
        speaker: speaker,
        name: actor.token ? actor.token.name : actor.name,
        notes: ''
    };
    const hooksOk = Hooks.call("hm3.preInjuryRoll", rollData, actor);
    if (hooksOk) {
        const result = await DiceHM3.injuryRoll(rollData);
        callOnHooks("hm3.onInjuryRoll", actor, result, rollData);
        return result;
    }
    return null;
}

export async function healingRoll(itemName, noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        label: `${item.data.name} Healing Roll`,
        target: item.data.data.healRate*actor.data.data.endurance,
        notesData: {
            up: actor.data.data.universalPenalty,
            pp: actor.data.data.physicalPenalty,
            il: actor.data.data.eph.totalInjuryLevels || 0,
            fatigue: actor.data.data.eph.fatigue,
            endurance: actor.data.data.endurance,
            injuryName: item.data.name,
            healRate: item.data.data.healRate  
        },
        speaker: speaker,
        fastforward: noDialog,
        notes: item.data.data.notes
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
        callOnHooks("hm3.onHealingRoll", actor, result, stdRollData, item);
        return result;
    }
    return null;
}

export async function dodgeRoll(noDialog = false, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'dodge',
        label: `Dodge Roll`,
        target: actor.data.data.dodge,
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
        actor.runCustomMacro(result);
        callOnHooks("hm3.onDodgeRoll", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function shockRoll(noDialog = false, myActor = null) {
    const goldMode = game.settings.get("hm3", "goldMode");
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    let hooksOk = false;
    let result = null;
    let stdRollData = null;
    if (goldMode) {
        stdRollData = {
            type: 'shock',
            label: 'Shock Roll',
            target: actor.data.data.condition,
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
        if (hooksOk) result = await DiceHM3.d100StdRoll(stdRollData);
    } else {
        stdRollData = {
            type: 'shock',
            label: `Shock Roll`,
            target: actor.data.data.endurance,
            numdice: actor.data.data.universalPenalty,
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
        if (hooksOk) result = await DiceHM3.d6Roll(stdRollData);
    }
    if (hooksOk) {
        actor.runCustomMacro(result);
        callOnHooks("hm3.onShockRoll", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function stumbleRoll(noDialog = false, myActor = null) {
    const goldMode = game.settings.get("hm3", "goldMode");
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'stumble',
        label: `${actor.isToken ? actor.token.name : actor.name} Stumble Roll`,
        target: actor.data.data.eph.stumbleTarget,
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
        let result = null;
        if (goldMode) {
            result = await DiceHM3.d100StdRoll(stdRollData);
        } else {
            result = await DiceHM3.d6Roll(stdRollData);
        }
        actor.runCustomMacro(result);
        callOnHooks("hm3.onStumbleRoll", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function fumbleRoll(noDialog = false, myActor = null) {
    const goldMode = game.settings.get("hm3", "goldMode");
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const stdRollData = {
        type: 'fumble',
        label: `${actor.isToken ? actor.token.name : actor.name} Fumble Roll`,
        target: actor.data.data.eph.fumbleTarget,
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
        let result = null;
        if (goldMode) {
            result = await DiceHM3.d100StdRoll(stdRollData);
        } else {
            result = await DiceHM3.d6Roll(stdRollData);
        }
        actor.runCustomMacro(result);
        callOnHooks("hm3.onFumbleRoll", actor, result, stdRollData);
        return result;
    }
    return null;
}

export async function genericDamageRoll(myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor) {
        ui.notifications.warn(`No actor for this action could be determined.`);
        return null;
    }

    const rollData = {
        weapon: '',
        data: actor.data,
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
        callOnHooks("hm3.onDamageRoll", actor, result, rollData);
        return result;
    }
    return null;
}

export async function changeFatigue(newValue, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
    const actor = getActor(myActor, speaker);
    if (!actor || !actor.isOwner) {
        ui.notifications.warn(`You are not an owner of ${actor.name}, so you may not change fatigue.`);
        return false;
    }

    const updateData = {};
    if (/^\s*[+-]/.test(newValue)) {
        // relative change
        const changeValue = parseInt(newValue, 10);
        if (!isNaN(changeValue)) updateData['data.fatigue'] = Math.max(actor.data.data.fatigue + changeValue, 0);
    } else {
        const value = parseInt(newValue, 10);
        if (!isNaN(value)) updateData['data.fatigue'] = value;
    }
    if (typeof updateData['data.fatigue'] !== 'undefined') {
        await actor.update(updateData);
    }

    return true;
}

export async function changeMissileQuanity(missileName, newValue, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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
        if (!isNaN(changeValue)) updateData['data.quantity'] = Math.max(missile.data.data.quantity + changeValue, 0);
    } else {
        const value = parseInt(newValue, 10);
        if (!isNaN(value)) updateData['data.quantity'] = value;
    }

    if (typeof updateData['data.quantity'] !== 'undefined') {
        const item = actor.items.get(missile.id);
        await item.update(updateData);
    }
    return true;
}

export async function setSkillDevelopmentFlag(skillName, myActor = null) {
    const speaker = typeof myActor === 'object' ? ChatMessage.getSpeaker({actor: myActor}) : ChatMessage.getSpeaker();
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

    if (!skill.data.data.improveFlag) {
        const updateData = { 'data.improveFlag': true };
        await skill.update(updateData);
    }

    return true;
}

/*--------------------------------------------------------------*/
/*        AUTOMATED COMBAT                                      */
/*--------------------------------------------------------------*/

export async function weaponAttack(itemName = null, noDialog = false, myToken = null, forceAllow=false) {
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.warn('Automated Combat not availalbe in HarnMaster Gold Mode');
            return null;
        } else {
            result = await combat.meleeAttack(combatant.token, targetToken, weapon);
        }
        actor.runCustomMacro(result);
        Hooks.call("hm3.onMeleeAttack", result, combatant, targetToken, weapon);
        return result;
    }
    return null;
}

export async function missileAttack(itemName = null, noDialog = false, myToken = null, forceAllow=false) {
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.error('Automated Combat not availalbe in HarnMaster Gold Mode, ignoring request');
            return null;
        } else {
            result = await combat.missileAttack(combatant.token, targetToken, missile);
        }
        actor.runCustomMacro(result);
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
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.warn('Automated Combat not availalbe in HarnMaster Gold Mode, ignoring request');
            return null;
        } else {
            result = await combat.meleeCounterstrikeResume(atkToken, defToken, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod);
        }
        actor.runCustomMacro(result);
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
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.warn('Automated Combat not availalbe in HarnMaster Gold Mode, ignoring request');
            return null;
        } else {
            result = await combat.dodgeResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        }
        actor.runCustomMacro(result);
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
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.warn('Automated Combat not availalbe in HarnMaster Gold Mode, ignoring request');
            return null;
        } else {
            result = await combat.blockResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod)
        }
        actor.runCustomMacro(result);
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
    const goldMode = game.settings.get("hm3", "goldMode");

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
        let result = null;
        if (goldMode) {
            ui.notifications.warn('Automated Combat not availalbe in HarnMaster Gold Mode, ignoring request');
            return null;
        } else {
            result = await combat.ignoreResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod);
        }
        actor.runCustomMacro(result);
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
    
    if (!game.combat || game.combat.data.combatants.length === 0) {
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

function callOnHooks(hook, actor, result, rollData, item=null) {
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
