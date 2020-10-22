export class DiceHM3 {

    /**
     * Performs a standard d100 "skill" roll, optionally presenting a dialog
     * to collect a modifier (although can be used for any straignt d100 roll
     * that takes an optional modifier and rolls against a target value).
     * 
     * Note that the modifier affects the target value, not the die roll.
     * The die roll is always a strait "1d100" roll without modifiers.
     * 
     * rollData is expected to contain the following values:
     *  target: Target value to check against
     *  modifier: Modifier to target value
     *  label: The label associated with the 'target' value
     *  fastForward: If true, assume no modifier and don't present Dialog
     *  speaker: the Speaker to use in Chat
     *  rollMode: the rollMode to use
     *  actorData: actor data
     * 
     * @param {Object} rollData 
     */
    static async d100StdRoll (rollData) {
        
        const dialogOptions = {
            target: rollData.target,
            label: rollData.label,
            modifier: rollData.modifier,
            data: rollData.actorData
        };

        // Create the Roll instance
        const roll = rollData.fastforward ? DiceHM3.rollTest({
            data: rollData.data,
            diceSides: 100,
            diceNum: 1,
            modifier: 0,
            target: rollData.target
        }) : await DiceHM3.d100StdDialog(dialogOptions);

        // If user cancelled the roll, then return immediately
        if (!roll) return null;

        // Prepare for Chat Message
        const chatTemplate = 'systems/hm3/templates/chat/standard-test-card.html';

        const chatTemplateData = {
            title: rollData.label,
            origTarget: rollData.target,
            modifier: roll.modifier,
            modifiedTarget: roll.target,
            isSuccess: roll.isSuccess,
            rollValue: roll.rollObj.total,
            description: roll.description
        };
        const html = await renderTemplate(chatTemplate, chatTemplateData);

        const messageData = {
            speaker: rollData.speaker || ChatMessage.getSpeaker(),
            content: html
        };

        const messageOptions = {
            rollMode: game.settings.get("core", "rollMode")
        };

        // Create a chat message
        roll.rollObj.toMessage(messageData, messageOptions);
    
        return roll;
    }
    
    
    /**
     * Renders a dialog to get the modifier for a d100 skill roll, and then
     * perform a d100 dice roll to determine results.  Returns Roll object
     * representing outcome of die roll, or null if user cancelled dialog.
     * 
     * @param {*} dialogOptions 
     */
    static async d100StdDialog(dialogOptions) {
    
        // Render modal dialog
        let dlgTemplate = dialogOptions.template || "systems/hm3/templates/chat/standard-test-dialog.html";
        let dialogData = {
            target: dialogOptions.target,
            modifier: dialogOptions.modifier
        };
        const html = await renderTemplate(dlgTemplate, dialogData);
        
        // Create the dialog window
        return new Promise(resolve => {
            new Dialog({
                title: dialogOptions.label,
                content: html,
                buttons: {
                    rollButton: {
                        label: "Roll",
                        callback: html => {
                            const formModifier = html[0].querySelector("form").modifier.value;
                            resolve(DiceHM3.rollTest({
                                target: dialogOptions.target,
                                data: dialogOptions.data,
                                diceSides: 100,
                                diceNum: 1,
                                modifier: formModifier
                            }));
                        }
                    }
                },
                default: "rollButton",
                close: () => resolve(null)
            }, dialogOptions).render(true)
        });
    }
    
    /**
     * Performs a standard d6 roll, optionally presenting a dialog
     * to collect a modifier (although can be used for any straignt d6 roll
     * that takes an optional modifier and rolls against a target value).
     * 
     * Note that the modifier affects the target value, not the die roll.
     * The die roll is always a strait "1d100" roll without modifiers.
     * 
     * rollData is expected to contain the following values:
     *  target: Target value to check against
     *  modifier: Modifier to target value
     *  label: The label associated with the 'target' value
     *  fastForward: If true, assume no modifier and don't present Dialog
     *  speaker: the Speaker to use in Chat
     *  rollMode: the rollMode to use
     *  actorData: actor data
     * 
     * @param {Object} rollData 
     */
    static async d6Roll (rollData) {
        
        const dialogOptions = {
            target: Number(rollData.target),
            label: rollData.label,
            modifier: 0,
            numdice: Number(rollData.numdice),
            data: rollData.actorData,
            items: rollData.items
        };

        // Create the Roll instance
        const roll = rollData.fastforward ? DiceHM3.rollTest({
            data: rollData.data,
            diceSides: 6,
            diceNum: Number(rollData.numdice),
            modifier: 0,
            target: rollData.target
        }) : await DiceHM3.d6Dialog(dialogOptions);

        // If user cancelled the roll, then return immediately
        if (!roll) return null;

        // Prepare for Chat Message
        const chatTemplate = 'systems/hm3/templates/chat/standard-test-card.html';

        const chatTemplateData = {
            title: rollData.label,
            origTarget: rollData.target,
            modifier: roll.modifier,
            modifiedTarget: roll.target,
            isSuccess: roll.isSuccess,
            rollValue: roll.rollObj.total,
            description: roll.description
        };
        const html = await renderTemplate(chatTemplate, chatTemplateData);

        const messageData = {
            speaker: rollData.speaker || ChatMessage.getSpeaker(),
            content: html
        };

        const messageOptions = {
            rollMode: game.settings.get("core", "rollMode")
        };

        // Create a chat message
        roll.rollObj.toMessage(messageData, messageOptions);
    
        return roll;
    }
    
    
    /**
     * Renders a dialog to get the modifier for a d6 roll, and then
     * perform a d6 dice roll to determine results.  Returns Roll object
     * representing outcome of die roll, or null if user cancelled dialog.
     * 
     * @param {*} dialogOptions 
     */
    static async d6Dialog(dialogOptions) {
    
        // Render modal dialog
        let dlgTemplate = dialogOptions.template || "systems/hm3/templates/chat/standard-test-dialog.html";
        let dialogData = {
            target: dialogOptions.target,
            modifier: dialogOptions.modifier
        };
        const html = await renderTemplate(dlgTemplate, dialogData);
        
        // Create the dialog window
        return new Promise(resolve => {
            new Dialog({
                title: dialogOptions.label,
                content: html,
                buttons: {
                    rollButton: {
                        label: "Roll",
                        callback: html => {
                            const formModifier = html[0].querySelector("form").modifier.value;
                            resolve(DiceHM3.rollTest({
                                target: dialogOptions.target,
                                data: dialogOptions.data,
                                diceSides: 6,
                                diceNum: dialogOptions.numdice,
                                modifier: formModifier
                            }));
                        }
                    }
                },
                default: "rollButton",
                close: () => resolve(null)
            }, dialogOptions).render(true)
        });
    }

    /**
     * Performs processing, including a random roll, to determine
     * injury location and effects.
     * 
     * @param {Object} rollData 
     */
    static async injuryRoll (rollData) {
        
        let hitLocations = DiceHM3._getHitLocations(rollData.items);

        const dialogOptions = {
            hitLocations: hitLocations,
            data: rollData.data,
            items: rollData.items
        };

        // Create the Roll instance
        const result = await DiceHM3.injuryDialog(dialogOptions);

        // If user cancelled the roll, then return immediately
        if (!result) return null;

        // Prepare for Chat Message
        const chatTemplate = 'systems/hm3/templates/chat/injury-card.html';

        const chatTemplateData = mergeObject({title: `${rollData.name} Injury`}, result);

        console.log(result);
        console.log(chatTemplateData);
        const html = await renderTemplate(chatTemplate, chatTemplateData);

        const messageData = {
            speaker: rollData.speaker || ChatMessage.getSpeaker(),
            content: html,
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            sound: CONFIG.sounds.dice
        };

        const messageOptions = {
            rollMode: game.settings.get("core", "rollMode")
        };

        // Create a chat message
        ChatMessage.create(messageData, messageOptions);
    
        return result;
    }
    
    static _getHitLocations(items) {
        // Initialize list with an indicator for a Random roll
        let hitLocations = ['Random'];

        // get a list of unique hit location names
        items.forEach(it => {
            if (it.type === 'armorlocation') {
                if (hitLocations.indexOf(it.name) === -1) {
                    hitLocations.push(it.name);
                }
            }
        });

        return hitLocations;
    }
    
    static async injuryDialog(dialogOptions) {
    
        // Render modal dialog
        let dlgTemplate = dialogOptions.template || "systems/hm3/templates/chat/injury-dialog.html";
        let dialogData = {
            aim: 'mid',
            location: 'Random',
            impact: 0,
            aspect: 'Blunt',
            hitLocations: dialogOptions.hitLocations
        };

        const html = await renderTemplate(dlgTemplate, dialogData);

        // Create the dialog window
        return new Promise(resolve => {
            new Dialog({
                title: dialogOptions.label,
                content: html,
                buttons: {
                    injuryButton: {
                        label: "Determine Injury",
                        callback: html => {
                            const formLocation = html[0].querySelector("form").location.value;
                            const formImpact = html[0].querySelector("form").impact.value;
                            const formAspect = html[0].querySelector("form").aspect.value;
                            const formAim = html[0].querySelector("form").aim.value;
                            resolve(DiceHM3._calcInjury(formLocation, formImpact, formAspect, formAim, dialogOptions));
                        }
                    }
                },
                default: "injuryButton",
                close: () => resolve(null)
            }, dialogOptions).render(true)
        });
    }

    /**
     * This method calculates many items related to injuries that are used to populate
     * the chat message with the results of the injury
     * 
     * @param {String} location 
     * @param {Number} impact 
     * @param {String} aspect 
     * @param {String} aim 
     * @param {Object} dialogOptions 
     */
    static _calcInjury(location, impact, aspect, aim, dialogOptions) {
        console.log(`Enter _calcInjury: location: ${location}, impact: ${impact}, aspect: ${aspect}, aim: ${aim}`)
        const result = {
            isRandom: location === 'Random',
            aim: aim,
            aspect: aspect,
            location: location,
            impact: impact,
            armorType: 'None',
            armorValue: 0,
            effectiveImpact: impact,
            isInjured: false,
            injuryLevel: 0,
            injuryLevelText: 'NA',
            isBleeder: false,
            isFumbleRoll: false,
            isFumble: false,
            isStumbleRoll: false,
            isStumble: false,
            isAmputate: false,
            isKillShot: false
        };

        // determine location of injury
        let armorLocation = DiceHM3._calcLocation(location, aim, dialogOptions.items);
        if (armorLocation === null) return;  // this means we couldn't find the location, so no injury

        // Just to make life simpler, get the data element which is what we really care about.
        armorLocation = armorLocation.data;

        console.log(armorLocation);
        result.location = armorLocation.name;
        result.armorType = armorLocation.data.layers === '' ? 'None' : armorLocation.data.layers;

        // determine effective impact (impact - armor)
        if (aspect === 'Blunt') {
            result.armorValue = armorLocation.data.blunt;
        } else if (aspect === 'Edged') {
            result.armorValue = armorLocation.data.edged;
        } else if (aspect === 'Piercing') {
            result.armorValue = armorLocation.data.piercing;
        } else {
            result.armorValue = armorLocation.data.fire;
        }
        result.effectiveImpact = Math.max(impact - result.armorValue, 0);

        // Determine Injury Level
        if (result.effectiveImpact === 0) {
            result.injuryLevelText = 'NA';
        } else if (result.effectiveImpact >= 17) {
            result.injuryLevelText = armorLocation.data.effectiveImpact.ei17;
        } else if (result.effectiveImpact >= 13) {
            result.injuryLevelText = armorLocation.data.effectiveImpact.ei13;
        } else if (result.effectiveImpact >= 9) {
            result.injuryLevelText = armorLocation.data.effectiveImpact.ei9;
        } else if (result.effectiveImpact >= 5) {
            result.injuryLevelText = armorLocation.data.effectiveImpact.ei5;
        } else {
            result.injuryLevelText = armorLocation.data.effectiveImpact.ei1;
        }

        // Calculate injury level and whether it is a kill shot.
        // Convert all 'K4' and 'K5' to 'G4' and 'G5'
        switch(result.injuryLevelText) {
            case 'M1':
                result.injuryLevel = 1;
                break;

            case 'S2':
                result.injuryLevel = 2;
                break;

            case 'S3':
                result .injuryLevel = 3;
                break;

            case 'G4':
                result.injuryLevel = 4;
                result.isAmputate = armorLocation.data.isAmputate && (aspect === 'Edged');
                break;

            case 'K4':
                result.injuryLevel = 4;
                result.isKillShot = true;
                result.isAmputate = armorLocation.data.isAmputate && (aspect === 'Edged');
                break;

            case 'G5':
                result.injuryLevel = 5;
                result.isAmputate = armorLocation.data.isAmputate && (aspect === 'Edged');
                break;

            case 'K5':
                result.injuryLevel = 5;
                result.isKillShot = true;
                result.isAmputate = armorLocation.data.isAmputate && (aspect === 'Edged');
                break;

            case 'NA':
                result.injuryLevel = 0;
                break;
        }

        // Either mark as injured, or if not injured just immediately return.
        if (result.injuryLevel > 0) {
            result.isInjured = true;
        } else {
            return result;
        }

        result.isBleeder = result.injuryLevel >= 4 && result.aspect != 'Fire';

        if (armorLocation.data.isFumble) {
            result.isFumble = result.injuryLevel >= 4;
            result.isFumbleRoll = !result.isFumble && result.injuryLevel >= 2;
        }

        if (armorLocation.data.isStumble) {
            result.isStumble = result.injuryLevel >= 4;
            result.isStumbleRoll = !result.isStumble && result.injuryLevel >= 2;
        }

        return result;
    }

    static _calcLocation(location, aim, items) {
        console.log('enter calcLocation');
        const lcAim = aim.toLowerCase();
        let result = null;
        if (location.toLowerCase() === 'random') {
            // First, get total of all probWeight for a given aim
            let totalWeight = 0;
            let numArmorLocations = 0;
            items.forEach(it => {
                if (it.data.type === 'armorlocation') {
                    console.log(`armorlocation ${it.data.name}, weight ${it.data.data.probWeight[lcAim]}`);
                    totalWeight += it.data.data.probWeight[lcAim];
                    numArmorLocations++;
                }
            });

            console.log(`Total Weight: ${totalWeight}`);
            // if no armorlocations found, then return null
            if (numArmorLocations === 0) {
                return null;
            }

            // At this point, we know we found armorlocations,
            // but it is possible that they all have a weight
            // of zero.  In that case, we will end up just
            // picking the first one.

            // Assuming we have found some weights, we can now
            // roll to get a random number.
            let rollWeight = 0;
            if (totalWeight > 0) {
                // now, roll for a random number
                let roll = new Roll(`1d${totalWeight}`).roll();
                rollWeight = roll.total;
            }

            console.log(`Roll Weight: ${rollWeight}`);

            // find the location that meets that number
            let done = false;
            items.forEach(it => {
                if (!done && it.data.type === 'armorlocation') {
                    rollWeight -= it.data.data.probWeight[lcAim];
                    console.log(`Found ${it.data.name}, rollWeight=${rollWeight}`);
                    if (rollWeight <= 0) {
                        result = it;
                        done = true;
                    }
                }
            });
        } else {
            // Not random, let's just find the designated item
            items.forEach(it => {
                if (result === null && it.data.type === 'armorlocation' && it.data.name === location) {
                    result = it;
                }
            });
        }

        return result;
    }

    /**
     * Performs a damage roll, presenting a dialog
     * to collect information about the damage.
     * 
     * rollData is expected to contain the following values:
     *  weapon: Selected weapon (or blank for none)
     *  speaker: the Speaker to use in Chat
     *  rollMode: the rollMode to use
     *  actorData: actor data
     * 
     * @param {Object} rollData 
     */
    static async damageRoll (rollData) {
        
        let weapon = DiceHM3._calcWeaponAspect(rollData.weapon, rollData.data.items);

        const dialogOptions = {
            weapon: rollData.weapon,
            weaponAspect: weapon.defaultAspect,
            weaponAspects: weapon.aspects,
            data: rollData.actorData
        };

        // Create the Roll instance
        const roll = await DiceHM3.damageDialog(dialogOptions);

        // If user cancelled the roll, then return immediately
        if (!roll) return null;

        // Prepare for Chat Message
        const chatTemplate = 'systems/hm3/templates/chat/damage-card.html';

        let title = "Other Weapon Damage";
        if (rollData.weapon != "") {
            title = `${rollData.weapon} Damage`; 
        }

        const totalImpact = weapon.aspects[roll.chosenAspect] + roll.addlWeaponImpact + roll.rollObj.total;

        const chatTemplateData = {
            title: title,
            weaponAspect: roll.chosenAspect,
            damageDice: Number(roll.damageDice),
            weaponImpact: weapon.aspects[roll.chosenAspect],
            addlWeaponImpact: roll.addlWeaponImpact,
            totalImpact: totalImpact,
            rollValue: roll.rollObj.total,
        };
        const html = await renderTemplate(chatTemplate, chatTemplateData);

        const messageData = {
            speaker: rollData.speaker || ChatMessage.getSpeaker(),
            content: html
        };

        const messageOptions = {
            rollMode: game.settings.get("core", "rollMode")
        };

        // Create a chat message
        roll.rollObj.toMessage(messageData, messageOptions);
    
        return roll;
    }
    
    static _calcWeaponAspect(weapon, items) {

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

        // Search for the specified weapon, and then choose the aspect with
        // the greatest impact (this will become the default aspect)
        items.forEach(it => {
            if (it.type === 'weapongear' && it.name === weapon) {
                const maxImpact = Math.max(it.data.blunt, it.data.piercing, it.data.edged, 0);
                result.aspects["Blunt"] = it.data.blunt;
                result.aspects["Edged"] = it.data.edged;
                result.aspects["Piercing"] = it.data.piercing;
                if (maxImpact === it.data.piercing) {
                    result.defaultAspect = "Piercing";
                } else if (maxImpact === it.data.edged) {
                    result.defaultAspect = "Edged";
                } else if (maxImpact === it.data.blunt) {
                    result.defaultAspect = "Blunt";
                } else {
                    // This shouldn't happen, but if all else fails, choose "Other"
                    result.defaultAspect = "Other"
                }
            }
        });

        return result;
    }
    
    /**
     * Renders a dialog to get the information for a damage roll, and then
     * perform a number of d6 dice rolls to determine results.  Returns Roll object
     * representing outcome of die rolls, or null if user cancelled dialog.
     *            
     * @param {*} dialogOptions 
     */
    static async damageDialog(dialogOptions) {
    
        // Render modal dialog
        let dlgTemplate = dialogOptions.template || "systems/hm3/templates/chat/damage-dialog.html";
        let dialogData = {
            damageDice: 1,
            weaponAspect: dialogOptions.weaponAspect,
            weaponAspects: dialogOptions.weaponAspects,
            addlWeaponImpact: 0
        };
        const html = await renderTemplate(dlgTemplate, dialogData);
        
        // Create the dialog window
        return new Promise(resolve => {
            new Dialog({
                title: dialogOptions.label,
                content: html,
                buttons: {
                    rollButton: {
                        label: "Roll",
                        callback: html => {
                            const form = html[0].querySelector("form");
                            const formAddlWeaponImpact = Number(form.addlWeaponImpact.value);
                            const formDamageDice = Number(form.damageDice.value);
                            const formWeaponAspect = form.weaponAspect.value;
                            let roll = DiceHM3.rollTest({
                                target: 0,
                                data: dialogOptions.data,
                                diceSides: 6,
                                diceNum: formDamageDice,
                                modifier: 0
                            });
                            let result = {
                                chosenAspect: formWeaponAspect,
                                damageDice: formDamageDice,
                                addlWeaponImpact: formAddlWeaponImpact,
                                rollObj: roll.rollObj
                            }
                            resolve(result);
                        }
                    }
                },
                default: "rollButton",
                close: () => resolve(null)
            }, dialogOptions).render(true)
        });
    }

    static rollTest(testData) {

        let diceType = testData.diceSides === 6 ? "d6" : "d100";
        let diceSpec = ((testData.diceNum > 0) ? testData.diceNum : 1) + diceType;
        let roll = new Roll(diceSpec, testData.data).roll();

        let modifier = Number(testData.modifier);
        let targetNum = Number(testData.target) + modifier;
        let isCrit = (roll.total % 5) === 0;
        let levelDesc = isCrit ? "Critical" : "Marginal";
        let description = "";
        let isSuccess = false;

        if (diceType === 'd100') {
            // ********** Failure ***********
            if (roll.total >= 96 || (roll.total > 5 && roll.total > targetNum)) {
                description = levelDesc + " Failure";
            }
            // ********** Success ***********
            else {
                description = levelDesc + " Success";
                isSuccess = true;
            }
        } else {
            isCrit = false;      // d6 rolls have no criticals associated with them
            isSuccess = roll.total <= targetNum;
            description = isSuccess ? "Success" : "Failure";
        }

        let rollResults = {
            "target": targetNum,
            "modifier": modifier,
            "rollObj": roll,
            "isCritical": isCrit,
            "isSuccess": isSuccess,
            "description": description,
            "preData": testData
        }
        return rollResults;
    }

    static hitLocation(items, aim) {
        let roll = new Roll("1d100");
        let rollResult = roll.total;
        let result = `Unknown (roll=${rollResult})`;
        items.forEach(it => {
            if (it.type === "hitlocation") {
                let probWeight = it.data.probWeight[aim];
                if (probWeight === 0) continue;
                rollResult -= probWeight;
                if (rollResult <= 0)
                    result = it.name;
                    break;
            }
        });

        return result;
    }
}