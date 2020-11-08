/**
 * Determines whether the Skill Base Formula is valid. We perform that
 * validation here so even a skill not associated with a particular
 * actor can have its formula validated.
 * 
 * A valid SB formula looks like this:
 * 
 *   "@str, @int, @sta, hirin:2, ahnu, 5"
 * 
 * meaning
 *   average STR, INT, and STA
 *   add 2 if sunsign hirin (modifier after colon ":")
 *   add 1 if sunsign ahnu (1 since no modifier specified)
 *   add 5 to result
 * 
 * A valid formula must have exactly 3 abilities, everything else is optional.
 * 
 * The result of this function is to set the "isFormulaValid" value appropriately.
 * 
 * @param {Object} item
 */
export function calcSkillBase(item) {
    sb.isFormulaValid = true;
    if (sb.formula === '') {
        // If the formula is blank, its valid,
        // don't touch the existing value.
        return;
    }

    const sb = item.data.data.skillBase;

    let actorData = null;
    if (item.actor) {
        actorData = item.actor.data.data;
    }


    let numAbilities = 0;
    let sumAbilities = 0;
    let modifier = 0;
    let resultSB = 0;

    // All parts of the formula are separated by commas,
    // and we lowercase here since the string is processed
    // case-insensitive.
    const sbParts = sb.formula.toLowerCase().split(',');

    // Formula must have at least three abilities, and therefore
    // we must have at least three parts, otherwise it is invalid
    if (sbParts.length < 3) {
        sb.isFormulaValid = false;
        return;
    }

    sbParts.forEach(param => {
        if (!sb.isFormulaValid) return;

        param = param.trim();
        if (param != '') {
            if (param.startsWith('@')) {
                // This is a reference to an ability

                // Must have more than just the '@' sign
                if (param.length === 1) {
                    sb.isFormulaValid = false;
                    return;
                }

                // There may only be 3 abilities
                if (numAbilities >= 3) {
                    sb.isFormulaValid = false;
                    return;
                }

                if (actorData) {
                    const paramName = param.slice(1);
                    switch (paramName) {
                        case 'str':
                            sumAbilities += actorData.abilities.strength.base;
                            break;

                        case 'sta':
                            sumAbilities += actorData.abilities.stamina.base;
                            break;

                        case 'dex':
                            sumAbilities += actorData.abilities.dexterity.base;
                            break;

                        case 'agl':
                            sumAbilities += actorData.abilities.agility.base;
                            break;

                        case 'int':
                            sumAbilities += actorData.abilities.intelligence.base;
                            break;

                        case 'aur':
                            sumAbilities += actorData.abilities.aura.base;
                            break;

                        case 'wil':
                            sumAbilities += actorData.abilities.will.base;
                            break;

                        case 'eye':
                            sumAbilities += actorData.abilities.eyesight.base;
                            break;

                        case 'hrg':
                            sumAbilities += actorData.abilities.hearing.base;
                            break;

                        case 'sml':
                            sumAbilities += actorData.abilities.smell.base;
                            break;

                        case 'voi':
                            sumAbilities += actorData.abilities.voice.base;
                            break;

                        case 'cml':
                            sumAbilities += actorData.abilities.comliness.base;
                            break;

                        case 'mor':
                            sumAbilities += actorData.abilities.morality.base;
                            break;
    
                        default:
                            sb.isFormulaValid = false;
                            return;
                    }
                }

                numAbilities++;
                return;
            }

            if (param.match(/^[a-z]/)) {
                // This is a sunsign

                let ssParts = param.split(':');

                // if more than 2 parts, it's invalid
                if (ssParts.length > 2) {
                    sb.isFormulaValid = false;
                    return;
                }

                // if second part provided, must be a number
                if (ssParts.length === 2 && !ssParts[1].trim().match(/[-+]?\d+/)) {
                    sb.isFormulaValid = false;
                    return;
                }

                if (actorData) {
                    // we must get the actor's sunsign to see if it matches. Actors may
                    // specify the sunsign as a dual sunsign, in which case the two parts
                    // must be separated either by a dash or a forward slash
                    let actorSS = actorData.sunsign.trim().toLowerCase().split(/[-\/]/);
                    
                    // Call 'trim' function on all strings in actorSS
                    actorSS.map(Function.prototype.call, String.prototype.trim);

                    // Now, check whether our sunsign matches any of the actor's sunsigns
                    if (actorSS.includes(ssParts[0])) {
                        // We matched a character's sunsign, apply modifier

                        modifier += ssParts.length === 2 ? Number(ssParts[1].trim()) : 1;
                    }
                }

                return;
            }

            // The only valid possibility left is a number.
            // If it's not a number, it's invalid.
            if (param.match(/^[-+]?\d+$/)) {
                modifier += Number(param);
            } else {
                sb.isFormulaValid = false;
                return;
            }
        }
    });

    if (numAbilities != 3) {
        sb.isFormulaValid = false;
    } else {
        if (actorData) {
            sb.value = Math.round((sumAbilities / 3) + Number.EPSILON) + modifier;
        }
    }
}

