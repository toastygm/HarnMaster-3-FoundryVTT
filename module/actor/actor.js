import { HM3 } from '../config.js';
import { DiceHM3 } from '../dice-hm3.js';

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class HarnMasterActor extends Actor {

    /**
     * Override the create() function to initialize skills and locations. Original code taken
     * from WFRP4e-FoundryVTT project.
     */
    static async create(data, options) {
        // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
        if (data.items) {
            return super.create(data, options);
        }

        // Initialize empty items
        data.items = [];

        // If character, automatically add basic skills and armor locations
        if (data.type === 'character') {
            // Request whether to initialize skills and armor locations
            if (options.skipDefaultItems) {
                return super.create(data, options);
            }

            new Dialog({
                title: 'Initialize Skills and Locations',
                content: `<p>Add Default Skills and Locations?</p>`,
                buttons: {
                    yes: {
                        label: 'Yes',
                        callback: async dlg => {
                            HarnMasterActor._createDefaultCharacterSkills(data);
                            HarnMasterActor._createDefaultHumanoidLocations(data);
                            return super.create(data, options); // Follow through the the rest of the Actor creation process upstream
                        }
                    },
                    no: {
                        label: 'No',
                        callback: async dlg => {
                            return super.create(data, options); // Do not add new items, continue with the rest of the Actor creation process upstream          
                        }
                    },
                },
                default: 'yes'
            }).render(true);
        } else if (data.type == 'creature') {

            // Create Creature Default Skills
            this._createDefaultCreatureSkills(data);
            super.create(data, options); // Follow through the the rest of the Actor creation process upstream
        } else {
            super.create(data, options); // Follow through the the rest of the Actor creation process upstream
        }
    }

    static _createDefaultCharacterSkills(data) {
        const physicalSkill = mergeObject({ type: "Physical" }, game.system.model.Item.skill, { overwrite: false });
        const commSkill = mergeObject({ type: "Communication" }, game.system.model.Item.skill, { overwrite: false });
        const combatSkill = mergeObject({ type: "Combat" }, game.system.model.Item.skill, { overwrite: false });
        const craftSkill = mergeObject({ type: "Craft" }, game.system.model.Item.skill, { overwrite: false });
        data.items.push((new Item({ name: 'Climbing', type: 'skill', data: physicalSkill, img: 'systems/hm3/images/icons/svg/climbing.svg' })).data);
        data.items.push((new Item({ name: 'Condition', type: 'skill', data: physicalSkill, img: 'systems/hm3/images/icons/svg/muscle.svg' })).data);
        data.items.push((new Item({ name: 'Jumping', type: 'skill', data: physicalSkill, img: 'systems/hm3/images/icons/svg/jump.svg' })).data);
        data.items.push((new Item({ name: 'Stealth', type: 'skill', data: physicalSkill, img: 'systems/hm3/images/icons/svg/stealth.svg' })).data);
        data.items.push((new Item({ name: 'Throwing', type: 'skill', data: physicalSkill, img: 'systems/hm3/images/icons/svg/throw.svg' })).data);
        data.items.push((new Item({ name: 'Awareness', type: 'skill', data: commSkill, img: 'systems/hm3/images/icons/svg/awareness.svg' })).data);
        data.items.push((new Item({ name: 'Intrigue', type: 'skill', data: commSkill, img: 'systems/hm3/images/icons/svg/cloak-dagger.svg' })).data);
        data.items.push((new Item({ name: 'Oratory', type: 'skill', data: commSkill, img: 'systems/hm3/images/icons/svg/speaking.svg' })).data);
        data.items.push((new Item({ name: 'Rhetoric', type: 'skill', data: commSkill, img: 'systems/hm3/images/icons/svg/rhetoric.svg' })).data);
        data.items.push((new Item({ name: 'Singing', type: 'skill', data: commSkill, img: 'systems/hm3/images/icons/svg/musician-singing.svg' })).data);
        data.items.push((new Item({ name: 'Initiative', type: 'skill', data: combatSkill, img: 'systems/hm3/images/icons/svg/initiative.svg' })).data);
        data.items.push((new Item({ name: 'Unarmed', type: 'skill', data: combatSkill, img: 'systems/hm3/images/icons/svg/punch.svg' })).data);
        data.items.push((new Item({ name: 'Dodge', type: 'skill', data: combatSkill, img: 'systems/hm3/images/icons/svg/dodge.svg' })).data);
    }

    static _createDefaultCreatureSkills(data) {
        const combatSkill = mergeObject({ type: "Combat" }, game.system.model.Item.skill, { overwrite: false });
        data.items.push((new Item({ name: 'Initiative', type: 'skill', data: combatSkill, img: 'systems/hm3/images/icons/svg/initiative.svg' })).data);
        data.items.push((new Item({ name: 'Dodge', type: 'skill', data: combatSkill, img: 'systems/hm3/images/icons/svg/dodge.svg' })).data);
    }

    static _createDefaultHumanoidLocations(data) {
        let armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Skull'])
        data.items.push((new Item({ name: 'Skull', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Face'])
        data.items.push((new Item({ name: 'Face', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Neck'])
        data.items.push((new Item({ name: 'Neck', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Shoulder'])
        data.items.push((new Item({ name: 'Left Shoulder', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Shoulder'])
        data.items.push((new Item({ name: 'Right Shoulder', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Upper Arm'])
        data.items.push((new Item({ name: 'Left Upper Arm', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Upper Arm'])
        data.items.push((new Item({ name: 'Right Upper Arm', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Elbow'])
        data.items.push((new Item({ name: 'Left Elbow', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Elbow'])
        data.items.push((new Item({ name: 'Right Elbow', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Forearm'])
        data.items.push((new Item({ name: 'Left Forearm', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Forearm'])
        data.items.push((new Item({ name: 'Right Forearm', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Hand'])
        data.items.push((new Item({ name: 'Left Hand', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Hand'])
        data.items.push((new Item({ name: 'Right Hand', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Thorax'])
        data.items.push((new Item({ name: 'Thorax', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Abdomen'])
        data.items.push((new Item({ name: 'Abdomen', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Groin'])
        data.items.push((new Item({ name: 'Groin', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Hip'])
        data.items.push((new Item({ name: 'Left Hip', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Hip'])
        data.items.push((new Item({ name: 'Right Hip', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Thigh'])
        data.items.push((new Item({ name: 'Left Thigh', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Thigh'])
        data.items.push((new Item({ name: 'Right Thigh', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Knee'])
        data.items.push((new Item({ name: 'Left Knee', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Knee'])
        data.items.push((new Item({ name: 'Right Knee', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Calf'])
        data.items.push((new Item({ name: 'Left Calf', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Calf'])
        data.items.push((new Item({ name: 'Right Calf', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Foot'])
        data.items.push((new Item({ name: 'Left Foot', type: 'armorlocation', data: armorLocationData })).data);
        armorLocationData = {};
        mergeObject(armorLocationData, game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations['Foot'])
        data.items.push((new Item({ name: 'Right Foot', type: 'armorlocation', data: armorLocationData })).data);
    }

    /**
     * Augment the basic actor data with additional dynamic data.
     */
    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;
        const items = this.items;

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        if (actorData.type === 'character') {
            this._prepareCharacterData(actorData);
        } else if (actorData.type === 'creature') {
            this._prepareCreatureData(actorData);
        } else if (actorData.type === 'container') {
            this._prepareContainerData(actorData);
        }

    }

    /**
     * Prepare Container type specific data
     */
    _prepareContainerData(actorData) {
        const data = actorData.data;
    }

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
        const data = actorData.data;

        this._calcEndurance(this.data.items, data);

        this._unequipUncarriedGear(data);

        // Calculate weight and injury level totals, used to calculate
        // universal penalty below.
        this._calcInjuryTotal(data);

        this._calcGearWeightTotals(data);

        data.encumbrance = Math.floor(data.totalGearWeight / data.endurance);

        // Universal Penalty and Physical Penalty are used to calculate many
        // things, including effectiveMasteryLevel for all skills,
        // endurance, move, etc.
        data.universalPenalty = data.totalInjuryLevels + data.fatigue;
        data.physicalPenalty = data.universalPenalty + data.encumbrance;

        data.shockIndex.value = HarnMasterActor._normProb(data.endurance, data.universalPenalty * 3.5, data.universalPenalty);
        if (canvas) this.getActiveTokens().forEach(token => {
            if (token.bars) token._onUpdateBarAttributes(this.data, { "shockIndex.value": data.shockIndex.value });
        });

        // Setup effective abilities (accounting for UP and PP)
        this._setupEffectiveAbilities(data);

        // Go through all skills calculating their EML
        this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

        // Some properties are calculated from skills.  Do that here.
        this._setPropertiesFromSkills(this.data.items, data);

        // Calculate current Move speed.  Cannot go below 0
        data.move.effective = Math.max(data.move.base - data.physicalPenalty, 0);

        // Calculate Important Roll Targets
        data.stumbleTarget = Math.max(data.abilities.agility.base - data.physicalPenalty, 0);
        data.fumbleTarget = Math.max(data.abilities.dexterity.base - data.physicalPenalty, 0);

        // Calculate spell effective mastery level values
        this._refreshSpellsAndInvocations();

        this._setupGearData(data);
        this._setupInjuryTargets(data);
        this._generateArmorLocationMap(data);
    }

    /**
     * Prepare Creature type specific data
     */
    _prepareCreatureData(actorData) {
        const data = actorData.data;

        // Calc Endurance (never use condition with creatures)
        data.endurance = Math.round((data.abilities.strength.base + data.abilities.stamina.base +
            data.abilities.will.base) / 3);

        this._unequipUncarriedGear(data);

        if (data.description.startsWith('<p>Birthdate:</p>')) {
            // Set default creature description instead
            data.description = '<p>Habitat:</p>\n<p>Height:</p>\n<p>Weight:</p>\n' +
                '<p>Diet:</p>\n<p>Lifespan:</p>\n<p>Group:</p>\n<p>Special Abilities:</p>\n' +
                '<p>Attacks:</p>\n<p>&nbsp;</p>';
        }

        this._calcInjuryTotal(data);

        // Universal Penalty and Physical Penalty are used to calculate many
        // things, including effectiveMasteryLevel for all skills,
        // move, etc.
        data.universalPenalty = data.totalInjuryLevels + data.fatigue;
        data.physicalPenalty = data.universalPenalty;

        data.shockIndex.value = HarnMasterActor._normProb(data.endurance, data.universalPenalty * 3.5, data.universalPenalty);
        if (canvas) this.getActiveTokens().forEach(token => {
            if (token.bars) token._onUpdateBarAttributes(this.data, { "shockIndex.value": data.shockIndex.value });
        });

        // Setup effective abilities (accounting for UP and PP)
        this._setupEffectiveAbilities(data);

        // Go through all skills calculating their EML
        this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

        // Some properties are calculated from skills.  Do that here.
        this._setPropertiesFromSkills(this.data.items, data);

        // Calculate current Move speed.  Cannot go below 0
        data.move.effective = Math.max(data.move.base - data.physicalPenalty, 0);

        this._setupGearData(data);
    }

    _setupEffectiveAbilities(data) {
        // Affected by physical penalty
        data.abilities.strength.effective = Math.max(data.abilities.strength.base - data.physicalPenalty, 0);
        data.abilities.stamina.effective = Math.max(data.abilities.stamina.base - data.physicalPenalty, 0);
        data.abilities.agility.effective = Math.max(data.abilities.agility.base - data.physicalPenalty, 0);
        data.abilities.dexterity.effective = Math.max(data.abilities.dexterity.base - data.physicalPenalty, 0);
        data.abilities.eyesight.effective = Math.max(data.abilities.eyesight.base - data.physicalPenalty, 0);
        data.abilities.hearing.effective = Math.max(data.abilities.hearing.base - data.physicalPenalty, 0);
        data.abilities.smell.effective = Math.max(data.abilities.smell.base - data.physicalPenalty, 0);
        data.abilities.voice.effective = Math.max(data.abilities.voice.base - data.physicalPenalty, 0);

        // Affected by universal penalty
        data.abilities.intelligence.effective = Math.max(data.abilities.intelligence.base - data.universalPenalty, 0);
        data.abilities.aura.effective = Math.max(data.abilities.aura.base - data.universalPenalty, 0);
        data.abilities.will.effective = Math.max(data.abilities.will.base - data.universalPenalty, 0);

        // Not affected by any penalties
        data.abilities.comliness.effective = Math.max(data.abilities.comliness.base, 0);
        data.abilities.morality.effective = Math.max(data.abilities.morality.base, 0);
    }

    _setupInjuryTargets(data) {
        this.data.items.forEach(it => {
            if (it.type === 'injury') {
                // Injury Roll = HR*End (unaffected by UP or PP)
                it.data.targetHealRoll = it.data.healRate * data.endurance;
            }
        });
    }

    /**
     * Endurance is composed of two parts: the maximum and the current value.
     * This method calculates the max.  It tries to find if the "condition"
     * skill is present, and if so uses that to calculate the max.  Otherwise
     * it calculates it based on ability scores.
     * 
     * @param {Object} items 
     * @param {Object} data 
     */
    _calcEndurance(items, data) {
        let hasCondition = false;
        let conditionLevel = 0;
        items.forEach(it => {
            if (it.type === 'skill' && it.name.toLowerCase() === 'condition') {
                hasCondition = true;
                conditionLevel = it.data.masteryLevel;
            }
        });

        // If we found the condition skill, then use that value for endurance.
        // Otherwise, calculate it.
        if (hasCondition) {
            data.hasCondition = true;
            data.endurance = Math.floor(conditionLevel / 5);
        } else {
            data.hasCondition = false;
            data.endurance = Math.round((data.abilities.strength.base + data.abilities.stamina.base +
                data.abilities.will.base) / 3);
        }

        // Safety net: if endurance is ever <= 0, then set it to 1
        // so a bunch of other stuff doesn't go to infinity
        if (data.endurance <= 0) {
            data.endurance = 1;
        }
    }

    /**
     * This is broken out into a separate method so we can invoke it very early.
     * Lots of stuff will be dependent on whether gear is carried or equipped.
     */
    _unequipUncarriedGear(data) {
        this.data.items.forEach(it => {
            if (it.type.endsWith('gear')) {
                // If you aren't carrying the gear, it can't be equipped
                if (!it.data.isCarried) {
                    it.data.isEquipped = false;
                }
            }
        });
    }

    /**
     * Consolidated method to setup all gear, including misc gear, weapons,
     * and missiles.  (not armor yet)
     */
    _setupGearData(data) {
        this.data.items.forEach(it => {
            if (it.type.endsWith('gear')) {

                // Collect all combat skills into a map for use later
                let combatSkills = {};
                this.data.items.forEach(it => {
                    if (it.type === 'skill' || it.name.toLowerCase() === 'throwing') {
                        combatSkills[it.name] = {
                            'name': it.name,
                            'eml': it.data.effectiveMasteryLevel
                        };
                    }
                });

                if (it.type === 'missilegear') {
                    // Reset mastery levels in case nothing matches
                    it.data.attackMasteryLevel = 5;

                    let missileName = it.name;

                    // If the associated skill is in our combat skills list, get EML from there
                    // and then calculate AML.
                    let assocSkill = it.data.assocSkill;
                    if (typeof combatSkills[assocSkill] != 'undefined') {
                        let skillEml = combatSkills[assocSkill].eml;
                        it.data.attackMasteryLevel = skillEml + it.data.attackModifier;
                    }

                    // No matter what, we always have at least a 5% chance of attacking
                    it.data.attackMasteryLevel = Math.max(it.data.attackMasteryLevel, 5);
                } else if (it.type === 'weapongear') {
                    // Reset mastery levels in case nothing matches
                    it.data.attackMasteryLevel = 5;
                    it.data.defenseMasteryLevel = 5;
                    let weaponName = it.name;

                    // If associated skill is 'None', see if there is a skill with the
                    // same name as the weapon; if so, then set it to that skill.
                    if (it.data.assocSkill === 'None') {
                        // If no combat skill with this name exists, search for next weapon
                        if (typeof combatSkills[weaponName] === 'undefined') return;

                        // A matching skill was found, set associated Skill to that combat skill
                        it.data.assocSkill = combatSkills[weaponName].name;
                    }

                    // At this point, we know the Associated Skill is not blank. If that
                    // associated skill is in our combat skills list, get EML from there
                    // and then calculate AML and DML.
                    let assocSkill = it.data.assocSkill;
                    if (typeof combatSkills[assocSkill] != 'undefined') {
                        let skillEml = combatSkills[assocSkill].eml;
                        it.data.attackMasteryLevel = skillEml + it.data.attack + it.data.attackModifier;
                        it.data.defenseMasteryLevel = skillEml + it.data.defense;
                    }

                    // No matter what, we always have at least a 5% chance of attacking or
                    // defending.
                    it.data.defenseMasteryLevel = Math.max(it.data.defenseMasteryLevel, 5);
                    it.data.attackMasteryLevel = Math.max(it.data.attackMasteryLevel, 5);
                }
            }
        });
    }

    _setPropertiesFromSkills(items, data) {
        data.hasCondition = false;

        items.forEach(it => {
            if (it.type === 'skill') {
                switch (it.name.toLowerCase()) {
                    case 'initiative':
                        data.initiative = it.data.effectiveMasteryLevel;
                        break;

                    case 'dodge':
                        data.dodge = it.data.effectiveMasteryLevel;
                        break;
                }
            }
        });
    }

    _calcSkillEMLWithPenalties(items, universalPenalty, physicalPenalty) {
        const pctUnivPen = universalPenalty * 5;
        const pctPhysPen = physicalPenalty * 5;

        items.forEach(it => {
            if (it.type === 'skill') {
                switch (it.data.type) {
                    case 'Combat':
                    case 'Physical':
                        it.data.effectiveMasteryLevel = it.data.masteryLevel - pctPhysPen;
                        break;

                    default:
                        it.data.effectiveMasteryLevel = it.data.masteryLevel - pctUnivPen;

                }
                if (it.data.effectiveMasteryLevel < 5) it.data.effectiveMasteryLevel = 5;
            } else if (it.type === 'psionic') {
                it.data.effectiveMasteryLevel = it.data.masteryLevel - pctUnivPen;
                if (it.data.effectiveMasteryLevel < 5) it.data.effectiveMasteryLevel = 5;
            }
        });
    }

    _calcGearWeightTotals(data) {
        data.totalWeaponWeight = 0;
        data.totalMissileWeight = 0;
        data.totalArmorWeight = 0;
        data.totalMiscGearWeight = 0;

        let tempWeight;

        this.data.items.forEach(it => {
            switch (it.type) {
                case 'weapongear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    data.totalWeaponWeight += tempWeight;
                    break;

                case 'missilegear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    data.totalMissileWeight += tempWeight;
                    break;

                case 'armorgear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    data.totalArmorWeight += tempWeight;
                    break;

                case 'miscgear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    data.totalMiscGearWeight += tempWeight;
                    break;
            }
        });

        // It seems whenever doing math on floating point numbers, very small
        // amounts get introduced creating very long decimal values.
        // Correct any math weirdness; keep to two decimal points
        data.totalArmorWeight = Math.round((data.totalArmorWeight + Number.EPSILON) * 100) / 100;
        data.totalWeaponWeight = Math.round((data.totalWeaponWeight + Number.EPSILON) * 100) / 100;
        data.totalMissileWeight = Math.round((data.totalMissileWeight + Number.EPSILON) * 100) / 100;
        data.totalMiscGearWeight = Math.round((data.totalMiscGearWeight + Number.EPSILON) * 100) / 100;

        data.totalGearWeight = data.totalWeaponWeight + data.totalMissileWeight + data.totalArmorWeight + data.totalMiscGearWeight;
        data.totalGearWeight = Math.round((data.totalGearWeight + Number.EPSILON) * 100) / 100;
    }

    _calcInjuryTotal(data) {
        let totalInjuryLevels = 0;
        this.data.items.forEach(it => {
            if (it.type === 'injury') {
                // Just make sure if injuryLevel is negative, we set it to zero
                if (it.data.injuryLevel < 0) it.data.injuryLevel = 0;

                totalInjuryLevels += it.data.injuryLevel;
                if (it.data.injuryLevel === 0) {
                    it.data.severity = '';
                } else if (it.data.injuryLevel == 1) {
                    it.data.severity = 'M1';
                } else if (it.data.injuryLevel <= 3) {
                    it.data.severity = 'S' + it.data.injuryLevel;
                } else {
                    it.data.severity = 'G' + it.data.injuryLevel;
                }
            }
        });

        data.totalInjuryLevels = totalInjuryLevels;
    }

    _refreshSpellsAndInvocations() {
        this._resetAllSpellsAndInvocations();
        this.data.items.forEach(it => {
            if (it.type === 'skill' && it.data.type === 'Magic') {
                this._setConvocationSpells(it.name, it.data.effectiveMasteryLevel);
            } else if (it.type === 'skill' && it.data.type === 'Ritual') {
                this._setRitualInvocations(it.name, it.data.effectiveMasteryLevel);
            }
        });
    }

    _resetAllSpellsAndInvocations() {
        this.data.items.forEach(it => {
            if (it.type === 'spell' || it.type === 'invocation') {
                it.data.effectiveMasteryLevel = 0;
            }
        })
    }

    _setConvocationSpells(convocation, cml) {
        if (!convocation || convocation.length == 0) return;

        let lcConvocation = convocation.toLowerCase();
        this.data.items.forEach(it => {
            if (it.type === 'spell' && it.data.convocation && it.data.convocation.toLowerCase() === lcConvocation) {
                it.data.effectiveMasteryLevel = cml - (it.data.level * 5);
                if (it.data.effectiveMasteryLevel < 5) it.data.effectiveMasteryLevel = 5;
            }
        });
    }

    _setRitualInvocations(diety, rml) {
        if (!diety || diety.length == 0) return;

        let lcDiety = diety.toLowerCase();
        this.data.items.forEach(it => {
            if (it.type === 'invocation' && it.data.diety && it.data.diety.toLowerCase() === lcDiety) {
                it.data.effectiveMasteryLevel = rml - (it.data.circle * 5);
                if (it.data.effectiveMasteryLevel < 5) it.data.effectiveMasteryLevel = 5;
            }
        });
    }

    _generateArmorLocationMap(data) {
        // If there is no armor gear, don't make any changes to the armorlocations;
        // leave all custom values alone.  But if there is even one piece
        // of armor, then these calculations take over.
        if (!this.itemTypes.armorgear.length) return;

        // Initialize
        const armorMap = {};
        const ilMap = HM3.injuryLocations;
        Object.keys(ilMap).forEach(ilName => {
            const name = ilMap[ilName].impactType;
            if (name != 'base' && name != 'custom') {
                armorMap[ilName] = { name: name, blunt: 0, edged: 0, piercing: 0, fire: 0, layers: '' };
            }
        });

        this.data.items.forEach(it => {
            if (it.type === 'armorgear' && it.data.isCarried && it.data.isEquipped) {

                // Go through all of the armor locations for this armor,
                // applying this armor's settings to each location

                // If locations doesn't exist, then just abandon and continue
                if (typeof it.data.locations === 'undefined') {
                    return;
                }

                it.data.locations.forEach(l => {
                    // If the location is unknown, skip the rest
                    if (typeof armorMap[l] != 'undefined') {

                        // Add this armor's protection to the location
                        if (typeof it.data.protection != 'undefined') {
                            armorMap[l].blunt += it.data.protection.blunt;
                            armorMap[l].edged += it.data.protection.edged;
                            armorMap[l].piercing += it.data.protection.piercing;
                            armorMap[l].fire += it.data.protection.fire;
                        }

                        // if a material has been specified, add it to the layers
                        if (it.data.material.length > 0) {
                            if (armorMap[l].layers.length > 0) {
                                armorMap[l].layers += ',';
                            }
                            armorMap[l].layers += it.data.material;
                        }

                    }
                });
            }
        });

        // Remove empty items from armormap

        // For efficiency, convert the map into an Array
        const armorArray = Object.values(armorMap);

        // We now have a full map of all of the armor, let's apply it to
        // existing armor locations
        this.data.items.forEach(it => {
            if (it.type === 'armorlocation') {
                let armorProt = armorArray.find(a => a.name === it.data.impactType);

                // We will ignore any armorProt if there is no armor values specified
                if (armorProt) {
                    it.data.blunt = armorProt.blunt;
                    it.data.edged = armorProt.edged;
                    it.data.piercing = armorProt.piercing;
                    it.data.fire = armorProt.fire;
                    it.data.layers = armorProt.layers;
                }
            }
        });
    }

    stdRoll(label, options = {}) {

        const rollData = {
            label: label,
            target: options.target,
            fastforward: options.fastforward,
            data: this.data,
            speaker: ChatMessage.getSpeaker({ actor: this })
        };

        return DiceHM3.d100StdRoll(rollData);
    }

    d6Roll(label, options = {}) {

        const rollData = {
            label: label,
            target: options.target,
            numdice: options.numdice,
            fastforward: options.fastforward,
            data: this.data,
            speaker: ChatMessage.getSpeaker({ actor: this })
        };

        return DiceHM3.d6Roll(rollData);
    }

    damageRoll(weaponName) {

        const rollData = {
            weapon: weaponName,
            data: this.data,
            speaker: ChatMessage.getSpeaker({ actor: this })
        };

        return DiceHM3.damageRoll(rollData);
    }

    missileDamageRoll(eventData) {
        const rollData = {
            name: eventData.missile,
            aspect: eventData.aspect,
            impactShort: eventData.impactShort,
            impactMedium: eventData.impactMedium,
            impactLong: eventData.impactLong,
            impactExtreme: eventData.impactExtreme,
            data: this.data,
            speaker: ChatMessage.getSpeaker({ actor: this })
        }

        return DiceHM3.missileDamageRoll(rollData);
    }

    missileAttackRoll(eventData) {
        const rollData = {
            name: eventData.missile,
            target: eventData.target,
            aspect: eventData.aspect,
            rangeShort: eventData.rangeShort,
            rangeMedium: eventData.rangeMedium,
            rangeLong: eventData.rangeLong,
            rangeExtreme: eventData.rangeExtreme,
            data: this.data,
            speaker: ChatMessage.getSpeaker({ actor: this })
        }
        return DiceHM3.missileAttackRoll(rollData);
    }

    injuryRoll() {

        const rollData = {
            actor: this,
            speaker: ChatMessage.getSpeaker({ actor: this })
        };

        return DiceHM3.injuryRoll(rollData);
    }

    _d100StdRoll(label, target, speaker=null, fastforward=false, notes=null) {
        const rollData = {
            label: label,
            target: target,
            fastforward: fastforward,
            data: this.data,
            speaker: speaker ? speaker : ChatMessage.getSpeaker({ actor: this }),
            notes: notes
        };
        return DiceHM3.d100StdRoll(rollData);
    }

    _d6StdRoll(label, target, numdice, speaker=null, fastforward=false, notes=null) {
        const rollData = {
            label: label,
            target: target,
            numdice: numdice,
            fastforward: fastforward,
            data: this.data,
            speaker: speaker ? speaker : ChatMessage.getSpeaker({ actor: this }),
            notes: notes
        };
        return DiceHM3.d6Roll(rollData);
    }

    /** @override */
    _onDeleteEmbeddedEntity(embeddedName, child, options, userId) {
        if (embeddedName === "OwnedItem") {
            const item = this.getOwnedItem(child._id);
            if (["physicalskill", "commskill", "combatskill", "craftskill", "magicskill", "ritualskill"].includes(item.type)) {
                this.items.delete(item.id);
            } else {
                super._onDeleteEmbeddedEntity(embeddedName, child, options, userId)
            }
        }
    }

    static _normalcdf(x){
        var t=1/(1+.2316419*Math.abs(x));
        var d=.3989423*Math.exp(-x*x/2);
        var prob=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
        if (x>0) {
            prob=1-prob
        }
        return prob
    }   
    
    static _normProb(z, mean, sd) {
        let prob;
        if (sd==0) {
            prob = z<mean ? 0 : 100;
        } else {
            prob=Math.round(this._normalcdf((z-mean)/sd)*100);
        }
        
        return prob;
    }
    
}

