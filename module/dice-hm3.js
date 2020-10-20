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
        console.log(html);
        
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