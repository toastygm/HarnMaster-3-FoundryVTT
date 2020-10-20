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
    static async d6Roll (rollData) {
        
        const dialogOptions = {
            target: Number(rollData.target),
            label: rollData.label,
            modifier: 0,
            numdice: Number(rollData.numdice),
            data: rollData.actorData
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
     * Renders a dialog to get the modifier for a d100 skill roll, and then
     * perform a d100 dice roll to determine results.  Returns Roll object
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