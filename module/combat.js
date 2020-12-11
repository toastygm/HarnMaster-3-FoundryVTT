import { DiceHM3 } from './dice-hm3.js';
import { HM3 } from "./config.js";

/**
 * Initiates a missile attack.
 * 
 * Displays a missile attack dialog asking for attributes of the attack (aim location,
 * special modifiers, etc.) and generates a missile attack chat message that includes
 * buttons for selecting the appropriate defense.
 * 
 * No die rolling occurs as a result of this function, only the declaration of the attack.
 * 
 * @param attackToken {Token} Token representing attacker 
 * @param defendToken {Token} Token representing defender 
 * @param weaponItem {Item} Missile weapon used by attacker
 */
export async function missileAttack(attackToken, defendToken, missileItem) {
    if (!attackToken) {
        ui.notifications.warn(`No attacker token identified.`);
        return null;
    }

    if (!isValidToken(attackToken)) {
        console.error(`HM3 | meleeAttack attackToken=${attackToken} is not valid.`);
        return null;
    }
    
    
    if (!defendToken) {
        ui.notifications.warn(`No defender token identified.`);
        return null;
    }

    if (!isValidToken(defendToken)) {
        console.error(`HM3 | meleeAttack defendToken=${defendToken} is not valid.`);
        return null;
    }


    if (!attackToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: attackToken});
    const range = rangeToTarget(attackToken, defendToken);

    const options = {
        distance: range,
        type: 'Attack',
        attackerName: attackToken.name,
        defenderName: defendToken.name
    };

    // If a weapon was provided, don't ask for it.
    if (missileItem) {
        if (missileItem.data.data.isEquipped) {
            options['weapon'] = missileItem;
        } else {
            ui.notification.warn(`${missileItem.name} is not equipped.`);
            return null;
        }
    } else {
        ui.notifications.warn(`You must specify a missile weapon to use.`);
        return null;
    }

    const dialogResult = await attackDialog(options);

    // If user cancelled the dialog, then return immediately
    if (!dialogResult) return null;

    if (!missileItem) {
        missileItem = dialogResult.weapon;
    }

    if (game.settings.get('hm3', 'missileTracking') && attackToken.actor) {
        if (missileItem.data.data.quantity <= 0) {
            ui.notification.warn(`No more ${missileItem.name} left, attack denied.`);
            return null;
        }

        attackToken.actor.updateOwnedItem({'_id': missileItem.data._id, 'data.quantity': missileItem.data.data.quantity - 1});
    }

    const effAML = dialogResult.weapon.data.data.attackMasteryLevel + dialogResult.addlModifier;

    // Prepare for Chat Message
    const chatTemplate = 'systems/hm3/templates/chat/attack-card.html';

    const chatTemplateData = {
        title: `${missileItem.data.name} Missile Attack`,
        attacker: attackToken.name,
        atkTokenId: attackToken.id,
        defender: defendToken.name,
        defTokenId: defendToken.id,
        weaponType: 'missile',
        weaponName: missileItem.name,
        range: dialogResult.range,
        rangeExceedsExtreme: dialogResult.rangeExceedsExtreme,
        distance: range,
        aim: dialogResult.aim,
        aspect: dialogResult.aspect,
        addlModifierAbs: Math.abs(dialogResult.addlModifier),
        addlModifierSign: dialogResult.addlModifier<0?'-':'+',
        origAML: missileItem.data.data.attackMasteryLevel,
        effAML: effAML,
        impactMod: dialogResult.impactMod,
        hasDodge: true,
        hasBlock: true,
        hasCounterstrike: false,
        hasIgnore: true
    };

    const html = await renderTemplate(chatTemplate, chatTemplateData);

    const messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim(),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
    };

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions);
    if (game.settings.get('hm3', 'combatAudio')) {
        AudioHelper.play({src: "sounds/drums.wav", autoplay: true, loop: false}, true);
    }
    return null;
}

/**
 * Initiates a melee attack.
 * 
 * Displays a melee attack dialog asking for attributes of the attack (aim location,
 * special modifiers, etc.) and generates a melee attack chat message that includes
 * buttons for selecting the appropriate defense.
 * 
 * No die rolling occurs as a result of this function, only the declaration of the attack.
 * 
 * @param attackToken {Token} Token representing attacker 
 * @param defendToken {Token} Token representing defender 
 * @param weaponItem {Item} Melee weapon used by attacker
 */
export async function meleeAttack(attackToken, defendToken, weaponItem=null) {
    if (!attackToken) {
        ui.notifications.warn(`No attacker token identified.`);
        return null;
    }

    if (!isValidToken(attackToken)) {
        console.error(`HM3 | meleeAttack attackToken=${attackToken} is not valid.`);
        return null;
    }
    
    
    if (!defendToken) {
        ui.notifications.warn(`No defender token identified.`);
        return null;
    }

    if (!isValidToken(defendToken)) {
        console.error(`HM3 | meleeAttack defendToken=${defendToken} is not valid.`);
        return null;
    }

    if (!attackToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    if (rangeToTarget(attackToken, defendToken, true) > 1) {
        ui.notifications.warn(`${defendToken.name} is outside of melee range.`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: attackToken});

    // display dialog, get aspect, aim, and addl damage
    const options = {
        type: 'Attack',
        attackerName: attackToken.name,
        defenderName: defendToken.name
    }

    // If a weapon was provided, don't ask for it.
    if (weaponItem) {
        if (weaponItem.data.data.isEquipped) {
            options['weapon'] = weaponItem;
        } else {
            ui.notification.warn(`${weaponItem.name} is not equipped.`);
            return null;
        }
    } else {
        const defWpns = defaultMeleeWeapon(attackToken);
        if (!defWpns.weapons || !defWpns.weapons.length) {
            ui.notifications.warn(`${attackToken} does not have any equipped melee weapons.`);
            return null;
        }
        options['weapons'] = defWpns.weapons;
        options['defaultWeapon'] = defWpns.defaultWeapon;
    }

    const dialogResult = await attackDialog(options);

    // If user cancelled the dialog, then return immediately
    if (!dialogResult) return null;

    if (!weaponItem) {
        weaponItem = dialogResult.weapon;
    }
    
    const effAML = dialogResult.weapon.data.data.attackMasteryLevel + dialogResult.addlModifier;

    // Prepare for Chat Message
    const chatTemplate = 'systems/hm3/templates/chat/attack-card.html';

    const chatTemplateData = {
        title: `${weaponItem.data.name} Melee Attack`,
        attacker: attackToken.name,
        atkTokenId: attackToken.id,
        defender: defendToken.name,
        defTokenId: defendToken.id,
        weaponType: 'melee',
        weaponName: weaponItem.name,
        aim: dialogResult.aim,
        aspect: dialogResult.aspect,
        addlModifierAbs: Math.abs(dialogResult.addlModifier),
        addlModifierSign: dialogResult.addlModifier<0?'-':'+',
        origAML: weaponItem.data.data.attackMasteryLevel,
        effAML: effAML,
        impactMod: dialogResult.impactMod,
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
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
    };

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions);
    if (game.settings.get('hm3', 'combatAudio')) {
        AudioHelper.play({src: "sounds/drums.wav", autoplay: true, loop: false}, true);
    }
    return null;
}

/**
 * Displays a dialog asking user to choose a weapon (and optionally a modifier).
 * 
 * Options:
 * weapons (Array<Item>) a list of items (weapongear or missilegear)
 * defaultWeapon (Item) the default item choice
 * modifierType (string) A word to put between "Additional ??? Modifier"
 * 
 * @param {Object} options 
 */
async function selectWeaponDialog(options) {
    let queryWeaponDialog = "systems/hm3/templates/dialog/query-weapon-dialog.html";

    const dialogOptions = {
        title: 'Select Weapon'
    };
    dialogOptions.weapons = options.weapons.map(w => w.name);
    dialogOptions.defaultWeapon = options.defaultWeapon;
    if (options.modifierType) {
        dialogOptions.modifierType = options.modifierType;
    }
    dialogOptions.prompt = options.prompt ? options.prompt : 'Please select your weapon';
    
    const html = await renderTemplate(queryWeaponDialog, dialogOptions);

    // Request weapon name
    return Dialog.prompt({
        title: dialogOptions.title,
        content: html.trim(),
        label: "OK",
        callback: html => {
            const form = html[0].querySelector("form");
            const formAddlModifier = form.addlModifier ? parseInt(form.addlModifier.value) : 0;
            const formWeapon = form.weapon.value;

            return {weapon: formWeapon, addlModifier: formAddlModifier};
        }
    });

}

/**
 * Queries for the weapon to use, and additional weapon parameters (aim, aspect, range).
 * 
 * options should include:
 * attackerName (String): The name of the attacker
 * defenderName (String): The name of the defender
 * weapons (Array<Item>): a list of Items, available weapons to choose from
 * defaultWeapon (string): default choice (Item name) from weapon list
 * weapon (Item): if provided, this weapon Item will be used and no weapon query performed
 * type (string): either 'Block', 'Attack', or 'Counterstrike'
 * distance (number): the distance to the target
 * 
 * The return value will be an object with the following keys:
 *  weapon (Item):      An Item representing the weapon (weapongear or missilegear)
 *  aspect (string):    The aspect (Blunt, Edged, Piercing)
 *  aim (string):       The aim location (High, Mid, Low)
 *  addlModifier (number): Modifier to the attack roll (AML)
 *  range (string):     The range to target (Short, Medium, Long, Extreme)
 *  rangeExceedsExtreme (boolean): Whether the distance to target exceeds its extreme range
 *  impactMod (number): Weapon impact modifier (based on weapon aspect or range)
 * 
 * @param {Object} options 
 */
async function attackDialog(options) {
    if (options.weapons) {
        const equippedWeapons = options.weapons.filter(w => w.data.data.isEquipped);
        options.weapons = equippedWeapons;
    }

    if (!options.weapon && options.weapons && options.weapons.length) {
        const result = await selectWeaponDialog(options);

        if (result) options.weapon = options.weapons.find(w => result.weapon === w.name);
    }

    if (!options.weapon) {
        ui.notifications.warn(`No equipped weapons available for attack.`);
        return null;
    }

    const dialogOptions = {
        weapon: options.weapon.name,
        aimLocations: ['Low', 'Mid', 'High'],
        defaultAim: 'Mid'
    };

    if (options.weapon.data.type === 'weapongear') {
        dialogOptions.title = `Weapon ${options.type} with ${options.weapon.name}`;
        const weaponAspect = calcWeaponAspect(options.weapon);
        if (!weaponAspect.defaultAspect) return null;   // no aspects available, shouldn't happen
        mergeObject(dialogOptions, weaponAspect);
    } else if (options.weapon.data.type === 'missilegear') {
        dialogOptions.title = `Missile ${options.type} with ${options.weapon.name}`;

        const weaponData = options.weapon.data.data;

        // Missiles only have a single weapon aspect
        dialogOptions.aspects = {};
        dialogOptions.aspects[weaponData.weaponAspect] = -1;
        dialogOptions.defaultAspect = weaponData.weaponAspect;

        const shortDesc = `Short (${weaponData.range.short})`;
        const mediumDesc = `Medium (${weaponData.range.medium})`;
        const longDesc = `Long (${weaponData.range.long})`;
        const extremeDesc = `Extreme (${weaponData.range.extreme})`;
        dialogOptions.ranges = {};
        dialogOptions.ranges[shortDesc] = weaponData.impact.short;
        dialogOptions.ranges[mediumDesc] = weaponData.impact.medium;
        dialogOptions.ranges[longDesc] = weaponData.impact.long;
        dialogOptions.ranges[extremeDesc] = weaponData.impact.extreme;
        dialogOptions.rangeExceedsExtreme = false;

        // Set range based on distance
        if (options.distance) {
            dialogOptions.distance = options.distance;
            if (options.distance <= weaponData.range.short) {
                dialogOptions.defaultRange = shortDesc;
            } else if (options.distance <= weaponData.range.medium) {
                dialogOptions.defaultRange = mediumDesc;
            } else if (options.distance <= weaponData.range.long) {
                dialogOptions.defaultRange = longDesc;
            } else if (options.distance <= weaponData.range.extreme) {
                dialogOptions.defaultRange = extremeDesc;
            } else {
                dialogOptions.defaultRange = extremeDesc;
                dialogOptions.rangeExceedsExtreme = true;
            }
        } else {
            // Distance not specified, set it to extreme by default
            dialogOptions.defaultRange = extremeDesc;
        }
    } else {
        // Not a weapon!!
        return null;
    }

    dialogOptions.title = `${options.attackerName} vs. ${options.defenderName} ${options.type} with ${options.weapon.name}`;

    const attackDialog = "systems/hm3/templates/dialog/attack-dialog.html";
    const html = await renderTemplate(attackDialog, dialogOptions);

    // Request weapon details
    return Dialog.prompt({
        title: dialogOptions.title,
        content: html.trim(),
        label: options.type,
        callback: html => {
            const form = html[0].querySelector("form");
            const formRange = form.range ? form.range.value : null;

            const result = {
                weapon: options.weapon,
                aspect: form.weaponAspect ? form.weaponAspect.value : null,
                aim: form.aim ? form.aim.value : null,
                addlModifier: form.addlModifier ? parseInt(form.addlModifier.value) : 0,
                range: null,
                rangeExceedsExtreme: false,
                impactMod: 0
            };

            if (formRange) {
                // Grab range and impact mod (from selected range) for missile weapon
                if (formRange.startsWith('Short')) {
                    result.range = 'Short';
                } else if (formRange.startsWith('Medium')) {
                    result.range = 'Medium';
                } else if (formRange.startsWith('Long')) {
                    result.range = 'Long';
                } else {
                    result.range = 'Extreme';
                    result.rangeExceedsExtreme = true
                }
                result.impactMod = dialogOptions.ranges[formRange] || 0;
            } else {
                // Grab impact mod (from selected aspect) for melee weapon
                result.impactMod = dialogOptions.aspects[result.aspect] || 0;
            }
            return result;
        }
    });
}

/**
 * Determine if the token is valid (must be either a 'creature' or 'character')
 * 
 * @param {Token} token 
 */
function isValidToken(token) {
    if (!token) {
        ui.notifications.warn('No token selected.');
        false;
    }

    if (!token.actor) {
        ui.notifications.warn(`Token ${token.name} is not a valid actor.`);
        return false;
    };

    if (['character', 'creature'].includes(token.actor.data.type)) {
        return true;
    } else {
        ui.notifications.warn(`Token ${token.name} is not a character or creature.`);
        return false;
    }
}

/**
 * Determine default melee weapon based on maximum impact.
 * 
 * @param {Token} token 
 */
function defaultMeleeWeapon(token) {
    if (!isValidToken(token)) return {weapons: [], defaultWeapon: null};

    const equippedWeapons = token.actor.itemTypes.weapongear.filter(w => w.data.data.isEquipped);
    let defaultWeapon = null;
    if (equippedWeapons.length > 0) {
        let maxImpact = -1;
        equippedWeapons.forEach(w => {
            const data = w.data.data;
            const impactMax = Math.max(data.blunt, data.edged, data.piercing);
            if (impactMax > maxImpact) {
                maxImpact = impactMax;
                defaultWeapon = w;
            }
        });
    }
    
    return {
        weapons: equippedWeapons,
        defaultWeapon: defaultWeapon
    }
}

/**
 * Resume the attack with the defender performing the "Dodge" defense.  Note that this defense is only applicable to melee attacks.
 * 
 * @param {*} atkToken Token representing the attacker
 * @param {*} defToken Token representing the defender
 * @param {*} atkWeaponName Name of the weapon the attacker is using
 * @param {*} atkEffAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} atkAim Attack aim ("High", "Mid", "Low")
 * @param {*} atkAspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} atkImpactMod Additional modifier to impact
 */
export async function meleeCounterstrikeResume(atkToken, defToken, atkWeaponName, atkEffAML, atkAim, atkAspect, atkImpactMod) {
    if (!isValidToken(atkToken) || !isValidToken(defToken)) return null;
    if (!defToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: atkToken});

    // Get weapon with maximum impact
    const options = defaultMeleeWeapon(defToken);

    if (!options.weapons) {
        ui.notifications.warn(`You have no equipped weapons, counterstrike defense refused.`);
        return null;
    }

    options.type = 'Counterstrike';
    options.attackerName = defToken.name;
    options.defenderName = atkToken.name;
    const csDialogResult = await attackDialog(options);
    if (!csDialogResult) return null;

    // Roll Attacker's Attack
    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: atkEffAML
    });

    // Roll Counterstrike Attack
    const csRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: csDialogResult.addlModifier,
        target: csDialogResult.weapon.data.data.attackMasteryLevel
    });

    // If we have "Dice So Nice" module, roll them dice!
    if (game.dice3d) {
        const aRoll = atkRoll.rollObj;
        aRoll.dice[0].options.colorset = "glitterparty";
        await game.dice3d.showForRoll(aRoll);

        const cRoll = atkRoll.rollObj;
        cRoll.dice[0].options.colorset = "bloodmoon";
        await game.dice3d.showForRoll(cRoll);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${csRoll.isCritical?'c':'m'}${csRoll.isSuccess?'s':'f'}`;
    const combatResult = meleeCombatResult(atkResult, defResult, 'counterstrike',
        atkImpactMod, csDialogResult.impactMod);

    // We now know the results of the attack, roll applicable damage
    let atkImpactRoll = null;
    if (combatResult.outcome.atkDice) {
        atkImpactRoll = new Roll(`${combatResult.outcome.atkDice}d6`).roll();
    }
    
    let csImpactRoll = null;
    if (combatResult.outcome.defDice) {
        csImpactRoll = new Roll(`${combatResult.outcome.defDice}d6`).roll();
    }

    const atkChatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        attackWeapon: atkWeaponName,
        mlType: 'AML',
        defense: 'Counterstrike',
        effAML: atkEffAML,
        effDML: 0,
        attackRoll: atkRoll.rollObj.total,
        atkRollResult: atkRoll.description,
        defenseRoll: 0,
        defRollResult: '',
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: atkImpactMod,
        impactRoll: atkImpactRoll ? atkImpactRoll.dice[0].values.join(" + ") : null,
        totalImpact: atkImpactRoll ? atkImpactRoll.total + parseInt(atkImpactMod) : 0,
        atkAim: atkAim,
        atkAspect: atkAspect
    } 

    const csChatData = {
        title: `Counterstrike Result`,
        attacker: defToken.name,
        atkTokenId: defToken.id,
        defender: atkToken.name,
        defTokenId: atkToken.id,
        attackWeapon: csDialogResult.weapon.name,
        mlType: 'AML',
        addlModifierAbs: Math.abs(csDialogResult.addlModifier),
        addlModifierSign: csDialogResult.addlModifier < 0?'-':'+',
        origEML: csDialogResult.weapon.data.data.attackMasteryLevel,
        effEML: csDialogResult.weapon.data.data.attackMasteryLevel + csDialogResult.addlModifier,
        effAML: csDialogResult.weapon.data.data.attackMasteryLevel + csDialogResult.addlModifier,
        effDML: 0,
        attackRoll: csRoll.rollObj.total,
        atkRollResult: csRoll.description,
        defenseRoll: 0,
        defRollResult: '',
        resultDesc: combatResult.csDesc,
        hasAttackHit: combatResult.outcome.defDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: csDialogResult.impactMod,
        impactRoll: csImpactRoll ? csImpactRoll.dice[0].values.join(" + ") : null,
        totalImpact: csImpactRoll ? csImpactRoll.total + parseInt(csDialogResult.impactMod) : 0,
        atkAim: csDialogResult.aim,
        atkAspect: csDialogResult.aspect,
        dta: combatResult.outcome.dta
    } 

    let chatTemplate = "systems/hm3/templates/chat/attack-result-card.html";

    /*-----------------------------------------------------
     *    Attack Chat
     *----------------------------------------------------*/
    let html = await renderTemplate(chatTemplate, atkChatData);

    let messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.atkDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = atkImpactRoll;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    /*-----------------------------------------------------
     *    Counterstrike Chat
     *----------------------------------------------------*/
    html = await renderTemplate(chatTemplate, csChatData);

    messageData = {
        user: game.user._id,
        speaker: speaker,
        content: html.trim()
    };
    if (combatResult.outcome.defDice) {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        messageData.sound = CONFIG.sounds.dice;
        messageData.roll = csImpactRoll;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    }

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

/**
 * Resume the attack with the defender performing the "Dodge" defense.
 * 
 * @param {*} atkToken Token representing the attacker
 * @param {*} defToken Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function dodgeResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod) {
    if (!isValidToken(atkToken) || !isValidToken(defToken)) return null;
    if (!defToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: atkToken});

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
        const aRoll = atkRoll.rollObj;
        aRoll.dice[0].options.colorset = "glitterparty";
        await game.dice3d.showForRoll(aRoll);

        const dRoll = defRoll.rollObj;
        dRoll.dice[0].options.colorset = "bloodmoon";
        await game.dice3d.showForRoll(dRoll);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${defRoll.isCritical?'c':'m'}${defRoll.isSuccess?'s':'f'}`;
    let combatResult = null;
    if (type === 'melee') {
        combatResult = meleeCombatResult(atkResult, defResult, 'dodge', impactMod);
    } else {
        combatResult = missileCombatResult(atkResult, defResult, 'dodge', impactMod);
    }

    let atkImpactRoll = null;
    if (combatResult.outcome.atkDice) {
        atkImpactRoll = new Roll(`${combatResult.outcome.atkDice}d6`).roll();
    }

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
        impactRoll: atkImpactRoll ? atkImpactRoll.dice[0].values.join(" + ") : null,
        totalImpact: atkImpactRoll ? atkImpactRoll.total + parseInt(impactMod) : 0,
        atkAim: aim,
        atkAspect: aspect,
        dta: combatResult.outcome.dta
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
        messageData.roll = atkImpactRoll;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)
    if (!combatResult.outcome.atkDice && game.settings.get('hm3', 'combatAudio')) {
        AudioHelper.play({src: "systems/hm3/audio/swoosh1.ogg", autoplay: true, loop: false}, true);
    }

    return null;
}

/**
 * Resume the attack with the defender performing the "Block" defense.
 * 
 * @param {*} atkToken Token representing the attacker
 * @param {*} defToken Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function blockResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod) {
    if (!isValidToken(atkToken) || !isValidToken(defToken)) return null;
    if (!defToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: atkToken});

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    let prompt = null;

    // setup defensive available weapons.  This is all equipped melee weapons initially,
    // but later we may limit it to only shields.
    let defAvailWeapons = defToken.actor.itemTypes.weapongear;
    const shields = defAvailWeapons.filter(w => w.data.data.isEquipped && /shield|\bbuckler\b/i.test(w.name));

    // Missile Pre-processing.  If attacker is using a high-velocity weapon, then defender
    // can only block with a shield.  If attacker is using a low-velocity weapon, then defender
    // can either block with a shield (at full DML) or with a melee weapon (at 1/2 DML).
    if (type === 'missile') {
        const highVelocityMissile = /\bbow\b|shortbow|longbow|crossbow|\bsling\b|\barrow\b|\bbolt\b|\bbullet\b/i.test(weaponName);
    
        if (highVelocityMissile) {
            if (!shields.length) {
                ui.notifications.warn(`${weaponName} is a high-velocity missile that can only be blocked with a shield, and you don't have a shield equipped. Block defense refused.`);
                return null;
            } else {
                defAvailWeapons = shields;
                prompt = `${weaponName} is a high-velocity missile, and can only be blocked with a shield. Choose which shield to use.`;
            }
        } else {
            prompt = `${weaponName} is a low-velocity missile, and can be blocked either by a shield (at full DML) or by a melee weapon (at &#189; DML). Choose wisely.`;
        }
    }

    // pop up dialog asking for which weapon to use for blocking
    // Only melee weapons can be used for blocking
    // Default weapon is one with highest DML
    let weapons = [];
    let defaultWeapon = null;
    let maxDML = -9999;
    defAvailWeapons.forEach(w => {
        if (w.data.data.isEquipped) {
            if (w.data.data.defenseMasteryLevel > maxDML) {
                defaultWeapon = w;
            }
            weapons.push(w);
        }
    })
    
    if (weapons.length === 0) {
        return ui.notifications.warn("No weapons exist that can be used for blocking, block defense refused.");
    }
    
    const options = {
        prompt: prompt,
        weapons: weapons,
        defaultWeapon: defaultWeapon, 
        modifierType: 'Defense'
    };
    const dialogResult = await selectWeaponDialog(options);

    if (!dialogResult) return null;

    let effDML = 5;
    const defWeapon = defToken.actor.itemTypes.weapongear.find(w => w.name === dialogResult.weapon);
    if (defWeapon) {
        effDML = defWeapon.data.data.defenseMasteryLevel;
    } else {
        effDML = 5;
    }

    // If attacking weapon is a missile and defending weapon is not
    // a sheild, then it will defend at 1/2 DML.
    if (type === 'missile') {
        if (!shields.some(s => s.name === dialogResult.weapon.name)) {
            effDML = Math.max(Math.round(effDML/2), 5);
        }
    }

    const defRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: dialogResult.addlModifier,
        target: effDML
    });

    if (game.dice3d) {
        const aRoll = atkRoll.rollObj;
        aRoll.dice[0].options.colorset = "glitterparty";
        await game.dice3d.showForRoll(aRoll);

        const dRoll = defRoll.rollObj;
        dRoll.dice[0].options.colorset = "bloodmoon";
        await game.dice3d.showForRoll(dRoll);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    const defResult = `${defRoll.isCritical?'c':'m'}${defRoll.isSuccess?'s':'f'}`;

    let combatResult;
    if (type === 'melee') {
        combatResult = meleeCombatResult(atkResult, defResult, 'block', impactMod);
    } else {
        combatResult = missileCombatResult(atkResult, defResult, 'block', impactMod);
    }

    let atkImpactRoll = null;
    if (combatResult.outcome.atkDice) {
        atkImpactRoll = new Roll(`${combatResult.outcome.atkDice}d6`).roll();
    }

    // Weapon Break Check
    let atkWeaponBroke = false;
    let defWeaponBroke = false;
    if (type === "melee" && game.settings.get('hm3', 'weaponDamage') && combatResult.outcome.block && defWeapon) {
        const atkWeapon = atkToken.actor.itemTypes.weapongear.find(w => w.name === weaponName);
        if (atkWeapon) {
            const atkWeaponQuality = atkWeapon.data.data.weaponQuality;
            const defWeaponQuality = defWeapon.data.data.weaponQuality;

            const atkBreakRoll = new Roll('3d6').roll();
            const defBreakRoll = new Roll('3d6').roll();

            if (atkWeaponQuality <= defWeaponQuality) {
                // Check attacker first, then defender
                atkWeaponBroke = atkBreakRoll.total > atkWeaponQuality;
                defWeaponBroke = !atkWeaponBroke && defBreakRoll.total > defWeaponQuality;
            } else {
                // Check defender first, then attacker
                defWeaponBroke = defBreakRoll.total > defWeaponQuality;
                atkWeaponBroke = !defWeaponBroke && atkBreakRoll.total > atkWeaponQuality;
            }
        }
    }

    const chatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        mlType: 'DML',
        attackWeapon: weaponName,
        defendWeapon: defWeapon ? defWeapon.name : "",
        effAML: effAML,
        defense: `Block w/ ${dialogResult.weapon}`,
        addlModifierAbs: Math.abs(dialogResult.addlModifier),
        addlModifierSign: dialogResult.addlModifier < 0 ? '-':'+',
        origEML: effDML,
        effEML: effDML + dialogResult.addlModifier,
        attackRoll: atkRoll.rollObj.total,
        atkIsCritical: atkRoll.isCritical,
        atkIsSuccess: atkRoll.isSuccess,
        atkRollResult: atkRoll.description,
        defenseRoll: defRoll.rollObj.total,
        defIsCritical: defRoll.isCritical,
        defIsSuccess: defRoll.isSuccess,
        defRollResult: defRoll.description,
        resultDesc: combatResult.desc,
        hasAttackHit: combatResult.outcome.atkDice,
        addlWeaponImpact: 0,   // in future, maybe ask this in dialog?
        weaponImpact: impactMod,
        impactRoll: atkImpactRoll ? atkImpactRoll.dice[0].values.join(" + ") : null,
        totalImpact: atkImpactRoll ? atkImpactRoll.total + parseInt(impactMod) : 0,
        atkAim: aim,
        atkAspect: aspect,
        dta: combatResult.outcome.dta,
        atkWeaponBroke: atkWeaponBroke,
        defWeaponBroke: defWeaponBroke
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
        messageData.roll = atkImpactRoll;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)
    if (!combatResult.outcome.atkDice && game.settings.get('hm3', 'combatAudio')) {
        AudioHelper.play({src: "systems/hm3/audio/shield-bash.ogg", autoplay: true, loop: false}, true);
    }

    return null;
}

/**
 * Resume the attack with the defender performing the "Ignore" defense.
 * 
 * @param {*} atkToken Token representing the attacker
 * @param {*} defToken Token representing the defender
 * @param {*} type Type of attack: "melee" or "missile"
 * @param {*} weaponName Name of the weapon the attacker is using
 * @param {*} effAML The effective AML (Attack Mastery Level) of the attacker after modifiers applied
 * @param {*} aim Attack aim ("High", "Mid", "Low")
 * @param {*} aspect Weapon aspect ("Blunt", "Edged", "Piercing")
 * @param {*} impactMod Additional modifier to impact
 */
export async function ignoreResume(atkToken, defToken, type, weaponName, effAML, aim, aspect, impactMod) {
    if (!isValidToken(atkToken) || !isValidToken(defToken)) return null;
    if (!defToken.owner) {
        ui.notifications.warn(`You do not have permissions to perform this operation on ${attackToken.name}`);
        return null;
    }

    const speaker = ChatMessage.getSpeaker({token: atkToken});

    const atkRoll = DiceHM3.rollTest({
        data: {},
        diceSides: 100,
        diceNum: 1,
        modifier: 0,
        target: effAML
    });

    const effDML = 0;

    if (game.dice3d) {
        const aRoll = atkRoll.rollObj;
        aRoll.dice[0].options.colorset = "glitterparty";
        await game.dice3d.showForRoll(aRoll);
    }

    const atkResult = `${atkRoll.isCritical?'c':'m'}${atkRoll.isSuccess?'s':'f'}`;
    let combatResult;
    if (type === 'melee') {
        combatResult = meleeCombatResult(atkResult, null, 'ignore', impactMod);
    } else {
        combatResult = missileCombatResult(atkResult, null, 'ignore', impactMod);
    }

    let atkImpactRoll = null;
    if (combatResult.outcome.atkDice) {
        atkImpactRoll = new Roll(`${combatResult.outcome.atkDice}d6`).roll();
    }

    const chatData = {
        title: `Attack Result`,
        attacker: atkToken.name,
        atkTokenId: atkToken.id,
        defender: defToken.name,
        defTokenId: defToken.id,
        mlType: 'AML',
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
        impactRoll: atkImpactRoll ? atkImpactRoll.dice[0].values.join(" + ") : null,
        totalImpact: atkImpactRoll ? atkImpactRoll.total + parseInt(impactMod) : 0,
        atkAim: aim,
        atkAspect: aspect,
        dta: combatResult.outcome.dta
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
        messageData.roll = atkImpactRoll;
    } else {
        messageData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
    }

    const messageOptions = {};

    // Create a chat message
    await ChatMessage.create(messageData, messageOptions)

    return null;
}

/**
 * Display the results of meele combat.
 * 
 * @param {String} atkResult The result from the attack, comprised of "cs", "cf", "ms", or "mf"
 * @param {String} defResult The result from the defense, comprised of "cs", "cf", "ms", or "mf"
 * @param {String} defense The type of defense: "ignore", "block", "counterstrike", or "dodge"
 * @param {Number} atkAddlImpact Additional impact for the attacker
 * @param {Number} defAddlImpact If counterstrike defense, the additional impact for the defender (counterstriker)
 */
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

    const result = { outcome: outcome, desc: 'Attack missed.', csDesc: 'Counterstrike missed.'};
    
    if (outcome.atkDice) {
        result.desc = `Attacker strikes for ${diceFormula(outcome.atkDice, atkAddlImpact)} impact.`;
    } else if (outcome.atkFumble & outcome.defFumble) {
        result.desc = 'Both Attacker and Defender Fumble';
    } else if (outcome.atkFumble && !outcome.defFumble) {
        result.desc = `Attacker fumbles.`;
    } else if (outcome.defStumble && outcome.atkStumble) {
        result.desc = `Both attacker and defender stumble.`;
    } else if (outcome.atkStumble && !outcome.defStumble) {
        result.desc = `Attacker stumbles.`;
    } else if (outcome.block) {
        result.desc = `Attacker blocked.`;
    } else if (outcome.dta) {
        result.desc = `Defender gains Tactical Advantage.`;
    } else {
        result.desc = `Attack missed.`;
    }

    if (defense === 'counterstrike') {
        if (outcome.defDice) {
            result.csDesc = `Counterstriker strikes for ${diceFormula(outcome.defDice, defAddlImpact)} impact.`;
        } else if (outcome.atkFumble && outcome.defFumble) {
            result.desc = 'Attacker fumbles.';
            result.csDesc = 'Counterstriker fumbles.';
        } else if (outcome.defFumble) {
            result.csDesc = 'Counterstriker fumbles.';
        } else if (outcome.atkStumble && outcome.defStumble) {
            result.desc = 'Attacker stumbles.';
            result.csDesc = 'Counterstriker stumbles.';
        } else if (outcome.defStumble) {
            result.csDesc = 'Counterstriker stumbles';
        } else if (outcome.block) {
            result.csDesc = `Counterstriker blocked.`;
        } else if (outcome.dta) {
            result.csDesc = `Counterstriker achieves Tactical Advantage!`
        } else if (outcome.miss) {
            result.csDesc = `Counterstrike missed.`;
        }
    }

    return result;
}

/**
 * Calculate and display the results of the missile combat.
 * 
 * @param {String} atkResult The result from the attack, comprised of "cs", "cf", "ms", or "mf"
 * @param {String} defResult The result from the defense, comprised of "cs", "cf", "ms", or "mf"
 * @param {String} defense The type of defense: "ignore", "block", "counterstrike", or "dodge"
 * @param {Number} atkAddlImpact Any additional impact
 */
export function missileCombatResult(atkResult, defResult, defense, atkAddlImpact=0) {
    let outcome = null;
    let index = null;
    const defenseTable = HM3.missileCombatTable[defense];
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
        result.desc = `Missile strikes for ${diceFormula(outcome.atkDice, atkAddlImpact)} impact.`;
    } else if (outcome.wild) {
        result.desc = `Missile goes wild; effects at GM discretion.`;
    } else if (outcome.block) {
        result.desc = `Defender blocks missile!`;
    } else if (outcome.miss) {
        result.desc = `Missile missed.`;
    }

    return result;
}

/**
 * Return the dice formula meeting the specified parameters
 * 
 * @param {*} numDice  Number of 6-sided dice to include in the formula 
 * @param {*} addlImpact Any additional impact to include in the formula
 */
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
        defaultAspect: null,
        aspects: {}
    }

    // Any impact < 0 indicates that aspect is not available
    const maxImpact = Math.max(data.blunt, data.piercing, data.edged);
    if (maxImpact >= 0) {
        if (data.blunt >= 0) result.aspects["Blunt"] = data.blunt;
        if (data.edged >= 0) result.aspects["Edged"] = data.edged;
        if (data.piercing >= 0) result.aspects["Piercing"] = data.piercing;
        if (maxImpact === data.piercing) {
            result.defaultAspect = "Piercing";
        } else if (maxImpact === data.edged) {
            result.defaultAspect = "Edged";
        } else if (maxImpact === data.blunt) {
            result.defaultAspect = "Blunt";
        }    
    }

    return result;
}

/**
 * Finds an Item within the given actor.
 * 
 * @param {*} itemName Either an Item or a string formatted as "Item$<itemId>"
 * @param {*} type The type of Item (e.g., "missilegear")
 * @param {*} actor The actor containing the items to search
 */
export function getItem(itemName, type, actor) {
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

/**
 * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
 * 
 * @param {Token} sourceToken 
 * @param {Token} targetToken 
 */
export function rangeToTarget(sourceToken, targetToken, gridUnits=false) {
    if (!sourceToken || !targetToken || !canvas.scene || !canvas.scene.data.grid) return 9999;
    const dist = Math.sqrt(Math.pow(sourceToken.x - targetToken.x, 2) + Math.pow(sourceToken.y - targetToken.y, 2));
    const gridRange = Math.round(dist/canvas.scene.data.grid);
    if (!gridUnits && game.settings.get('hm3', 'distanceUnits') === 'grid') {
        return Math.round(gridRange * canvas.scene.data.gridDistance);
    } else {
        return gridRange;
    }
}

/**
 * Optionally hide the display of chat card action buttons which cannot be performed by the user
 */
export const displayChatActionButtons = function(message, html, data) {
    const chatCard = html.find(".hm3.chat-card");
    if ( chatCard.length > 0 ) {
        // If the user is the GM, proceed
        if (game.user.isGM) return;

        // Otherwise conceal action buttons
        const buttons = chatCard.find("button[data-action]");
        buttons.each((i, btn) => {
            if (['dodge','ignore','block','counterstrike', 'dta-attack'].includes(btn.dataset.action)) {
                // Only show these buttons to the defender
                const defToken = btn.dataset.defTokenId ? 
                    canvas.tokens.get(btn.dataset.defTokenId) : null;
                if (!defToken || !defToken.owner) {
                    btn.style.display = "none";
                }
            } else if (btn.dataset.action === 'injury') {
                // Show this button to any user that is an owner of the token
                const token = btn.dataset.tokenId ? 
                    canvas.tokens.get(btn.dataset.tokenId) : null;
                if (!token || !token.owner) {
                    btn.style.display = "none";
                }
            } else if (['stumble','fumble','shock'].includes(btn.dataset.action)) {
                // Show this button to anyone who owns the actor
                let actor;
                if (btn.dataset.tokenId) {
                    const token = btn.dataset.tokenId ? 
                        canvas.tokens.get(btn.dataset.tokenId) : null;
                    actor = token ? token.actor : null;
                } else if (btn.dataset.actorId) {
                    actor = game.actors.get(btn.dataset.actorId);
                }
                if (!actor || !actor.owner) {
                    btn.style.display = "none";
                }
            }
        });
    }
};
  