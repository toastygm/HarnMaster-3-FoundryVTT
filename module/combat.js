import { DiceHM3 } from './dice-hm3.js';
import { HM3 } from "./config.js";

export async function missileAttack(attackToken, defendToken, missileItem) {
    const range = missileRange(attackToken, defendToken);

    const dialogData = {
        aimlocations: ['Low', 'Mid', 'High'],
        defaultAim: 'Mid',
        title: `${missileItem.data.name} Missile Attack`,
        type: 'Attack',
        buttonLabel: 'Attack'
    };

    const dialogResult = await meleeAttackDialog(dialogData);

    // If user cancelled the dialog, then return immediately
    if (!dialogResult) return null;

}

export async function meleeAttack(attackToken, defendToken, weaponItem) {
    const speaker = ChatMessage.getSpeaker();
    // display dialog, get aspect, aim, and addl damage

    const weaponAspect = calcWeaponAspect(weaponItem);

    const dialogData = {
        aimlocations: ['Low', 'Mid', 'High'],
        defaultAim: 'Mid',
        weaponAspects: weaponAspect.aspects,
        defaultAspect: weaponAspect.defaultAspect,
        title: `${weaponItem.data.name} Melee Attack`,
        type: 'Attack',
        buttonLabel: 'Attack'
    };

    const dialogResult = await meleeAttackDialog(dialogData);

    // If user cancelled the dialog, then return immediately
    if (!dialogResult) return null;

    //const renderedNotes = rollData.notes ? utility.stringReplacer(rollData.notes, notesData) : "";

    let impactModifier = 0;
    switch(dialogResult.aspect) {
        case 'Blunt':
            impactModifier = weaponItem.data.data.blunt;
            break;

        case 'Edged':
            impactModifier = weaponItem.data.data.edged;
            break;

        case 'Piercing':
            impactModifier = weaponItem.data.data.piercing;
            break;
    }

    const effAML = weaponItem.data.data.attackMasteryLevel + dialogResult.addlModifier;

    // Prepare for Chat Message
    const chatTemplate = 'systems/hm3/templates/chat/attack-card.html';

    const chatTemplateData = {
        title: `${weaponItem.data.name} Melee Attack`,
        attacker: attackToken.name,
        atkTokenId: attackToken.id,
        defender: defendToken.name,
        defTokenId: defendToken.id,
        weaponName: weaponItem.name,
        aim: dialogResult.aim,
        aspect: dialogResult.aspect,
        addlModifierAbs: Math.abs(dialogResult.addlModifier),
        addlModifierSign: dialogResult.addlModifier<0?'-':'+',
        origAML: weaponItem.data.data.attackMasteryLevel,
        effAML: effAML,
        impactMod: impactModifier,
        hasDodge: true,
        hasBlock: true,
        hasCounterstrike: true,
        hasIgnore: true
    };

    const html = await renderTemplate(chatTemplate, chatTemplateData);

    const messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim(),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        sound: CONFIG.sounds.combat
    };

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)
    return null;
}

async function meleeAttackDialog(dialogOptions) {
    // Render modal dialog
    let dlgTemplate = "systems/hm3/templates/dialog/melee-attack-dialog.html";

    const html = await renderTemplate(dlgTemplate, dialogOptions);

    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: dialogOptions.title,
            content: html.trim(),
            buttons: {
                attack: {
                    label: dialogOptions.buttonLabel,
                    callback: html => {
                        const form = html[0].querySelector("form");
                        const result = {};
                        if (form.addlModifier) result.addlModifier = Number(form.addlModifier.value);
                        if (form.weaponAspect) result.aspect = form.weaponAspect.value;
                        if (form.aim) result.aim = form.aim.value;
                        if (form.weapon) result.weapon = form.weapon.value;
                        resolve(result);
                    }
                }
            },
            default: "attack",
            close: () => resolve(null)
        }, dialogOptions).render(true)
    });
}

async function meleeBlockDialog(dialogOptions) {
    // Render modal dialog
    let dlgTemplate = "systems/hm3/templates/dialog/melee-attack-dialog.html";

    const html = await renderTemplate(dlgTemplate, dialogOptions);

    // Create the dialog window
    return new Promise(resolve => {
        new Dialog({
            title: dialogOptions.title,
            content: html.trim(),
            buttons: {
                block: {
                    label: "Block",
                    callback: html => {
                        const form = html[0].querySelector("form");
                        const formAddlModifier = Number(form.addlModifier.value);
                        const formWeapon = form.weapon.value;

                        const result = {
                            weapon: formWeapon,
                            addlModifier: formAddlModifier
                        };
                        resolve(result);
                    }
                }
            },
            default: "block",
            close: () => resolve(null)
        }, dialogOptions).render(true)
    });
}

export async function meleeCounterstrikeResume(atkToken, defToken, weaponName, effAML, aim, aspect, impactMod) {
    const speaker = ChatMessage.getSpeaker();

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    const weapons = defToken.actor.itemTypes.weapongear.map(w => w.name);

    if (weapons.length === 0) {
        return ui.notifications.warn("No weapons exist that can be used for counterstrike, counterstrike defense refused.");
    }
    const dialogOptions = {
        title: `Counterstrike with Weapon`,
        weapons: weapons,
        defaultWeapon: weapons[0],
        aimlocations: ['Low', 'Mid', 'High'],
        defaultAim: 'Mid',
        weaponAspects: {'Blunt':0, 'Piercing':0, 'Edged':0},
        defaultAspect: null,
        type: 'Counterstrike',
        buttonLabel: 'Counterstrike'
    }

    const dialogResult = await meleeAttackDialog(dialogOptions);
    if (!dialogResult) return null;

    let effCsAML = 0;
    let csImpact = 0;
    let csAspect = 'Blunt';
    defToken.actor.itemTypes.weapongear.forEach(w => {
        if (w.name === dialogResult.weapon) {
            const data = w.data.data;
            effCsAML = data.attackMasteryLevel;
            csImpact = Math.max(data.blunt, data.edged, data.piercing);
            if (csImpact === data.blunt) {
                csAspect = 'Blunt';
            } else if (csImpact === data.edged) {
                csAspect = 'Edged';
            } else {
                csAspect = 'Piercing';
            }
        }
    });

    const csRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: dialogResult.addlModifier,
        target: effCsAML
    });

    if (game.dice3d) {
        await game.dice3d.showForRoll(atkRoll.rollObj);
        await game.dice3d.showForRoll(csRoll.rollObj);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${csRoll.isCritical?'c':'m'}${csRoll.isSuccess?'s':'f'}`;

    const combatResult = meleeCombatResult(atkResult, defResult, 'counterstrike', impactMod);

    const atkImpactRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 6,
        diceNum: combatResult.outcome.atkDice,
        modifier: 0,
        target: 0
    });

    const csImpactRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 6,
        diceNum: combatResult.outcome.defDice,
        modifier: 0,
        target: 0
    });

    const atkChatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        attackWeapon: weaponName,
        effAML: effAML,
        defense: 'Counterstrike',
        effDML: 0,
        attackRoll: atkRoll.rollObj.total,
        atkRollResult: atkRoll.description,
        defenseRoll: 0,
        defRollResult: '',
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: impactMod,
        impactRoll: atkImpactRoll.rollObj.dice[0].values.join(" + "),
        totalImpact: atkImpactRoll.rollObj.total + parseInt(impactMod),
        atkAim: aim,
        atkAspect: aspect
    } 

    const csChatData = {
        title: `Counterstrike Result`,
        attacker: defToken.name,
        atkTokenId: defToken.id,
        defender: atkToken.name,
        defTokenId: atkToken.id,
        attackWeapon: dialogResult.weapon,
        effAML: effCsAML,
        effDML: 0,
        attackRoll: csRoll.rollObj.total,
        atkRollResult: csRoll.description,
        defenseRoll: 0,
        defRollResult: '',
        resultDesc: combatResult.csDesc,
        hasAttackHit: combatResult.outcome.defDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: csImpact,
        impactRoll: csImpactRoll.rollObj.dice[0].values.join(" + "),
        totalImpact: csImpactRoll.rollObj.total + parseInt(impactMod),
        atkAim: dialogResult.aim,
        atkAspect: csAspect
    } 

    let chatTemplate = "systems/hm3/templates/chat/attack-result-card.html";

    // Weapon Attack Chat
    let html = await renderTemplate(chatTemplate, atkChatData);

    let messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.atkDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = atkImpactRoll.rollObj;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        messageData.sound = null;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    // Counterstrike Chat
    html = await renderTemplate(chatTemplate, csChatData);

    messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.defDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = csImpactRoll.rollObj;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        messageData.sound = null;
    }

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

export async function meleeDodgeResume(atkToken, defToken, weaponName, effAML, aim, aspect, impactMod) {
    const speaker = ChatMessage.getSpeaker();

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    const effDML = defToken.actor.data.data.dodge;

    const defRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effDML
    });

    if (game.dice3d) {
        await game.dice3d.showForRoll(atkRoll.rollObj);
        await game.dice3d.showForRoll(defRoll.rollObj);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${defRoll.isCritical?'c':'m'}${defRoll.isSuccess?'s':'f'}`;

    const combatResult = meleeCombatResult(atkResult, defResult, 'dodge', impactMod);

    const atkImpactRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 6,
        diceNum: combatResult.outcome.atkDice,
        modifier: 0,
        target: effDML
    });

    const chatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        attackWeapon: weaponName,
        effAML: effAML,
        defense: 'Dodge',
        effDML: effDML,
        attackRoll: atkRoll.rollObj.total,
        atkRollResult: atkRoll.description,
        defenseRoll: defRoll.rollObj.total,
        defRollResult: defRoll.description,
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: impactMod,
        impactRoll: atkImpactRoll.rollObj.dice[0].values.join(" + "),
        totalImpact: atkImpactRoll.rollObj.total + parseInt(impactMod),
        atkAim: aim,
        atkAspect: aspect
    } 

    let chatTemplate = "systems/hm3/templates/chat/attack-result-card.html";

    const html = await renderTemplate(chatTemplate, chatData);

    let messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.atkDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = atkImpactRoll.rollObj;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        messageData.sound = null;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

export async function meleeBlockResume(atkToken, defToken, weaponName, effAML, aim, aspect, impactMod) {
    const speaker = ChatMessage.getSpeaker();

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    // pop up dialog asking for which weapon to use for blocking
    const weapons = defToken.actor.itemTypes.weapongear.map(w => w.name);

    if (weapons.length === 0) {
        return ui.notifications.warn("No weapons exist that can be used for blocking, block defense refused.");
    }
    const dialogOptions = {
        title: `Melee Block with Weapon`,
        weapons: weapons,
        defaultWeapon: weapons[0],
        type: 'Block'
    }

    const dialogResult = await meleeBlockDialog(dialogOptions);
    if (!dialogResult) return null;

    let effDML = 5;
    defToken.actor.itemTypes.weapongear.forEach(w => {
        if (w.name === dialogResult.weapon) effDML = w.data.data.defenseMasteryLevel;
    });

    const defRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: dialogResult.addlModifier,
        target: effDML
    });

    if (game.dice3d) {
        await game.dice3d.showForRoll(atkRoll.rollObj);
        await game.dice3d.showForRoll(defRoll.rollObj);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${defRoll.isCritical?'c':'m'}${defRoll.isSuccess?'s':'f'}`;

    const combatResult = meleeCombatResult(atkResult, defResult, 'block', impactMod);

    const atkImpactRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 6,
        diceNum: combatResult.outcome.atkDice,
        modifier: 0,
        target: effDML
    });

    const chatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        attackWeapon: weaponName,
        effAML: effAML,
        defense: `Block w/ ${dialogResult.weapon}`,
        effDML: effDML + dialogResult.addlModifier,
        attackRoll: atkRoll.rollObj.total,
        atkRollResult: atkRoll.description,
        defenseRoll: defRoll.rollObj.total,
        defRollResult: defRoll.description,
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: impactMod,
        impactRoll: atkImpactRoll.rollObj.dice[0].values.join(" + "),
        totalImpact: atkImpactRoll.rollObj.total + parseInt(impactMod),
        atkAim: aim,
        atkAspect: aspect
    } 

    let chatTemplate = "systems/hm3/templates/chat/attack-result-card.html";

    const html = await renderTemplate(chatTemplate, chatData);

    let messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.atkDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = atkImpactRoll.rollObj;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        messageData.sound = null;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

export async function meleeIgnoreResume(atkToken, defToken, weaponName, effAML, aim, aspect, impactMod) {
    const speaker = ChatMessage.getSpeaker();

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    const effDML = 0;

    if (game.dice3d) {
        await game.dice3d.showForRoll(atkRoll.rollObj);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;

    const combatResult = meleeCombatResult(atkResult, null, 'ignore', impactMod);

    const atkImpactRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 6,
        diceNum: combatResult.outcome.atkDice,
        modifier: 0,
        target: 0
    });

    const chatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        attackWeapon: weaponName,
        effAML: effAML,
        defense: 'Ignore',
        effDML: 0,
        attackRoll: atkRoll.rollObj.total,
        atkRollResult: atkRoll.description,
        defenseRoll: 0,
        defRollResult: '',
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: impactMod,
        impactRoll: atkImpactRoll.rollObj.dice[0].values.join(" + "),
        totalImpact: atkImpactRoll.rollObj.total + parseInt(impactMod),
        atkAim: aim,
        atkAspect: aspect
    } 

    let chatTemplate = "systems/hm3/templates/chat/attack-result-card.html";

    const html = await renderTemplate(chatTemplate, chatData);

    let messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.atkDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = atkImpactRoll.rollObj;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        messageData.sound = null;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

export function meleeCombatResult(atkResult, defResult, defense, atkAddlImpact=0, defAddlImpact=0) {
    let outcome = null;
    let index = null;
    const defenseTable = HM3.meleeCombatTable[defense];
    if (defenseTable) {
        if (defense === 'ignore') {
            index = atkResult;
        } else {
            index = `${atkResult}:${defResult}`;
        }
        outcome = defenseTable[index];
    }

    if (!outcome) return null;

    const result = { outcome: outcome, desc: 'No result' };
    
    if (outcome.atkDice && !outcome.defDice) {
        result.desc = `Attacker strikes for ${diceFormula(outcome.atkDice, atkAddlImpact)} impact.`;
        result.csDesc = `Counterstrike Misses`;
    } else if (outcome.defDice && !outcome.atkDice) {
        result.csDesc = `Counterstrike strikes for ${diceFormula(outcome.defDice, defAddlImpact)} impact.`;
        result.desc = `Attack Misses`;
    } else if (outcome.atkDice && outcome.defDice) {
        result.desc = `Attacker strikes for ${diceFormula(outcome.atkDice, atkAddlImpact)} impact and defender strikes for ${diceFormula(outcome.defDice, defAddlImpact)} impact.`;
    } else if (outcome.atkFumble && !outcome.defFumble) {
        result.desc = `Attacker fumbles.`;
    } else if (outcome.defFumble && !outcome.atkFumble) {
        result.desc = `Defender fumbles.`;
    } else if (outcome.atkFumble && outcome.defFumble) {
        result.desc = `Both attacker and defender fumble.`;
    } else if (outcome.atkStumble && !outcome.defStumble) {
        result.desc = `Attacker stumbles.`;
    } else if (outcome.defStumble && !outcome.atkStumble) {
        result.desc = `Defender stumbles.`;
    } else if (outcome.defStumble && outcome.atkStumble) {
        result.desc = `Both attacker and defender stumble.`;
    } else if (outcome.block) {
        result.desc = `Attack blocked (make weapon damage roll).`;
    } else if (outcome.miss) {
        result.desc = `Attack missed (or standoff).`;
    } else if (outcome.dta) {
        result.desc = `Defender gains Tactical Advantage.`;
    }

    return result;
}

export function missileCombatResult(atkResult, defResult, defense, atkAddlImpact=0) {
    let outcome = null;
    if (HM3.missileCombatTable[defense]) {
        const outcome = HM3.missileCombatTable[defense][`${atkResult}:${defResult}`];
    }

    if (!outcome) return null;

    const result = { outcome: outcome, desc: 'No result' };
    
    if (outcome.atkDice && !outcome.defDice) {
        result.desc = `Missile strikes for ${diceFormula(outcome.atkDice, addlImpact)} impact.`;
    } else if (outcome.wild) {
        result.desc = `Missile goes wild; effects at GM discretion.`;
    } else if (outcome.block) {
        result.desc = `Defender blocks missile!`;
    } else if (outcome.miss) {
        result.desc = `Missile missed.`;
    }

    return result;
}

function diceFormula (numDice, addlImpact) {
    if (numDice <= 0) {
        return 'no';
    }
    if (addlImpact) {
        return `${numDice}d6${addlImpact<0?'-':'+'}${Math.abs(addlImpact)}`;
    } else {
        return `${numDice}d6`
    }
}

/**
 * Returns a structure specifying the default aspect for a weapon, as well as the
 * impact values for all other aspects.  The default aspect is always the aspect
 * with the greatest impact.
 * 
 * @param {*} weapon Name of weapon
 * @param {*} items List of items containing 'weapongear' items.
 */
function calcWeaponAspect(weapon) {

    const data = weapon.data.data;

    // Note that although "Fire" is in this list, because it is a
    // type of damage, no normal weapon uses it as its aspect.
    // It is here so that it can be selected (no default impact
    // damage would be specified for that aspect).
    const result = {
        defaultAspect: "Other",
        aspects: {
            "Blunt": 0,
            "Edged": 0,
            "Piercing": 0,
            "Fire": 0,
            "Other": 0
        }
    }

    const maxImpact = Math.max(data.blunt, data.piercing, data.edged, 0);
    result.aspects["Blunt"] = data.blunt;
    result.aspects["Edged"] = data.edged;
    result.aspects["Piercing"] = data.piercing;
    if (maxImpact === data.piercing) {
        result.defaultAspect = "Piercing";
    } else if (maxImpact === data.edged) {
        result.defaultAspect = "Edged";
    } else if (maxImpact === data.blunt) {
        result.defaultAspect = "Blunt";
    } else {
        // This shouldn't happen, but if all else fails, choose "Other"
        result.defaultAspect = "Other"
    }

    return result;
}

/**
 * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
 * 
 * @param {Token} sourceToken 
 * @param {Token} targetToken 
 */
export function missileRange(sourceToken, targetToken) {
    if (!sourceToken || !targetToken || !canvas.scene.grid) return 9999;
    const dist = Math.sqrt(Math.pow(sourceToken.x - targetToken.x, 2) + Math.pow(sourceToken.y - targetToken.y, 2));
    const gridRange = Math.round(dist/canvas.scene.grid);
    const range = Math.round(gridRange * canvas.scene.gridDistance);
    return range;
}