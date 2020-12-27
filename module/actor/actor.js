import { HM3 } from '../config.js';
import { DiceHM3 } from '../dice-hm3.js';
import * as combat from '../combat.js';
import * as macros from '../macros.js';
import { HarnMasterBaseActorSheet } from './base-actor-sheet.js';

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
                HarnMasterActor.setupDefaultDescription(data);
                const actor = await super.create(data, options);
                const updateData = HarnMasterActor.setupDefaultDescription('character');
                return actor.update(updateData);    
            }

            new Dialog({
                title: 'Initialize Skills and Locations',
                content: `<p>Add Default Skills and Locations?</p>`,
                buttons: {
                    yes: {
                        label: 'Yes',
                        callback: async dlg => {
                            await HarnMasterActor._createDefaultCharacterSkills(data);
                            HarnMasterActor._createDefaultHumanoidLocations(data);
                            const actor = await super.create(data, options); // Follow through the the rest of the Actor creation process upstream
                            const updateData = HarnMasterActor.setupDefaultDescription('character');
                            return actor.update(updateData);                
                        }
                    },
                    no: {
                        label: 'No',
                        callback: async dlg => {
                            HarnMasterActor.setupDefaultDescription(data);
                            const actor = await super.create(data, options); // Do not add new items, continue with the rest of the Actor creation process upstream          
                            const updateData = HarnMasterActor.setupDefaultDescription('character');
                            return actor.update(updateData);                
                        }
                    },
                },
                default: 'yes'
            }).render(true);
        } else if (data.type === 'creature') {
            // Create Creature Default Skills
            this._createDefaultCreatureSkills(data).then(async result => {
                const actor = await super.create(data, options); // Follow through the the rest of the Actor creation process upstream
                const updateData = HarnMasterActor.setupDefaultDescription('creature');
                return actor.update(updateData);    
            });
        } else if (data.type === 'container') {
            const html = await renderTemplate("systems/hm3/templates/dialog/container-size.html", {});
            Dialog.prompt({
                title: 'Container Size',
                content: html,
                label: 'OK',
                callback: async (html) => {
                    const form = html[0].querySelector("form");
                    const fd = new FormDataExtended(form);
                    const formdata = fd.toObject();
                    const maxCapacity = parseInt(formdata.maxCapacity);
                    const actor = await super.create(data, options); // Follow through the the rest of the Actor creation process upstream
                    const updateData = HarnMasterActor.setupDefaultDescription('container');
                    updateData['data.capacity.max'] = maxCapacity;
                    return actor.update(updateData);
                }
            });
        } else {
            console.error(`HM3 | Unsupported actor type '${data.type}'`);
        }
    }

    static setupDefaultDescription(type) {
        const updateData = {};
        if (type === 'character') {
            updateData['data.description'] = '<table style=\"user-select: text; width: 95%; color: #191813; font-size: 13px;\" border=\"1\">\n<tbody style=\"box-sizing: border-box; user-select: text;\">\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Apparent Age</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Culture</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\"></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Social Class</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\"><span style=\"box-sizing: border-box; user-select: text;\"></span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Height</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Frame</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Weight</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Appearance/Comeliness</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Hair Color</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Eye Color</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Voice</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Obvious Medical Traits</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Apparent Occupation</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Apparent Wealth</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Weapons</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Armour</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Companions</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Other obvious features</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<p>&nbsp;</p>\n<p>&nbsp;</p>';
            updateData['data.biography'] = '<h1>Data</h1>\n<table style=\"width: 95%;\" border=\"1\">\n<tbody>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Birthdate</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Birthplace</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Sibling Rank</strong></td>\n<td style=\"width: 432px;\">x of y</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Parent(s)</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Parent Occupation</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Estrangement</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Clanhead</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Medical Traits</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Psyche Traits</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<h1>Life Story</h1>';
            updateData['data.bioImage'] = 'systems/hm3/images/svg/knight-silhouette.svg';
        } else if (type === 'creature') {
            updateData['data.description'] = '';
            updateData['data.biography'] = '<h1>Data</h1>\n<table style=\"width: 95%;\" border=\"1\">\n<tbody>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Habitat</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Height</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Weight</strong></td>\n<td style=\"width: 432px;\"></td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Diet</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Lifespan</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Group</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<h1>Special Abilities</h1>\n<p>Describe any special abilities.</p>\n<h1>Attacks</h1>\n<p>Describe methods of attack.</p>\n<h1>Behavior</h1>\n<p>Describe behavioral aspects.</p>';
            updateData['data.bioImage'] = 'systems/hm3/images/svg/monster-silhouette.svg';    
        } else if (type === 'container') {
            updateData['data.description'] = '';
            updateData['data.bioImage'] = 'systems/hm3/images/icons/svg/chest.svg';
            updateData['img'] = 'systems/hm3/images/icons/svg/chest.svg';    
        }
        return updateData;
    }

    /**
     * When prepareBaseData() runs, the Actor.items map is not available, or if it is, it
     * is not dependable.  The very next method will update the Actor.items map using
     * information from the Actor.data.items array.  So, at this point we may safely
     * use Actor.data.items, so long as we remember that that data is going to be going
     * through a prepareData() stage next.
     * 
     * @override */
    prepareBaseData() {
        super.prepareBaseData();
        const actorData = this.data;
        const data = actorData.data;

        // Ephemeral data is kept together with other actor data,
        // but it is not in the data model so it will not be saved.
        if (!data.eph) data.eph = {};
        const eph = data.eph;

        // Calculate weight of gear
        this._calcGearWeightTotals();

        if (actorData.type === 'container') {
            this._prepareBaseContainerData(actorData);
            return;
        }

        // Injury Calculations
        //
        // Normally, this method should never reference any items, since the Actor.items has
        // not necessarily been setup.  But I'm in a bit of a conundrum, since I need the
        // total injury levels.  So, if Actor.items is not available, I temporarily use the
        // Actor.data.items array, and hope for the best.
        eph.totalInjuryLevels = 0;
        if (this.items) {
            this.items.forEach(it => {
                if (it.data.type === 'injury') {
                    if (it.data.data.injuryLevel > 0) eph.totalInjuryLevels += it.data.data.injuryLevel;
                }
            });
        } else {
            // This should only need to be executed on initial startup, before
            // the Actor.items map has been created.
            actorData.items.forEach(itemData => {
                if (itemData.type === 'injury') {
                    if (itemData.data.injuryLevel > 0) eph.totalInjuryLevels += itemData.data.injuryLevel;
                }
            });
        }

        // Calculate endurance, ensure it is never zero
        data.endurance = Math.round((data.abilities.strength.base + data.abilities.stamina.base +
            data.abilities.will.base) / 3);
        data.hasCondition = false;
        if (actorData.items) actorData.items.forEach(it => {
            if (it.data.type === 'skill' && it.data.name === 'Condition') {
                data.endurance = Math.floor(it.data.data.masteryLevel / 5);
                data.hasCondition = true;
            }
        });
        data.endurance = data.endurance || 1;

        data.encumbrance = Math.floor(eph.totalGearWeight / data.endurance);

        // Setup temporary work values masking the base values
        eph.move = data.move.base;
        eph.fatigue = data.fatigue;
        eph.strength = data.abilities.strength.base;
        eph.stamina = data.abilities.stamina.base;
        eph.dexterity = data.abilities.dexterity.base;
        eph.agility = data.abilities.agility.base;
        eph.eyesight = data.abilities.eyesight.base;
        eph.hearing = data.abilities.hearing.base;
        eph.smell = data.abilities.smell.base;
        eph.voice = data.abilities.voice.base;
        eph.intelligence = data.abilities.intelligence.base;
        eph.will = data.abilities.will.base;
        eph.aura = data.abilities.aura.base;
        eph.morality = data.abilities.morality.base;
        eph.comliness = data.abilities.comliness.base;
    
        eph.meleeAMLMod = 0;
        eph.meleeDMLMod = 0;
        eph.missileAMLMod = 0;

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        if (actorData.type === 'character') {
            this._prepareBaseCharacterData(actorData);
        } else if (actorData.type === 'creature') {
            this._prepareBaseCreatureData(actorData);
        }
    }

    _prepareBaseCharacterData(actorData) {
    }

    _prepareBaseCreatureData(actorData) {
    }

    _prepareBaseContainerData(actorData) {
        actorData.data.capacity.pct = Math.max(Math.round(1 - (actorData.data.eph.totalGearWeight / (actorData.data.capacity.max || 1))), 0);
        console.log(`Capacity Percentage: ${actorData.data.capacity.pct}`);
    }

    /** 
     * Perform data preparation after Items preparation and Active Effects have
     * been applied.
     * 
     * At this point the Actor.items map is guaranteed to be availabile, consisting
     * of real Items.  It is preferable for this method to use those items at this
     * point (unlike the situation with prepareBaseData()).
     * 
     * Note that all Active Effects have already been applied by this point, so
     * nothing in this method will be affected further by Active Effects.
     * 
     * @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        const actorData = this.data;
        const data = actorData.data;

        const eph = data.eph;

        if (actorData.type === 'container') {
            this._prepareDerivedContainerData(actorData);
            return;
        }
        
        // All common character and creature derived data below here

        // Since active effects may have modified these values, we must ensure
        // that they are integers and not floating values. Round to nearest integer.
        data.encumbrance = Math.round(data.encumbrance + Number.EPSILON);
        data.endurance = Math.round(data.endurance + Number.EPSILON);
        data.move.effective = Math.round(eph.move + Number.EPSILON);
        eph.totalInjuryLevels = Math.round(eph.totalInjuryLevels + Number.EPSILON);
        eph.fatigue = Math.round(eph.fatigue + Number.EPSILON);

        // Universal Penalty and Physical Penalty are used to calculate many
        // things, including effectiveMasteryLevel for all skills,
        // endurance, move, etc.
        data.universalPenalty = (eph.totalInjuryLevels + eph.fatigue) || 0;
        data.physicalPenalty = (data.universalPenalty + data.encumbrance) || 0;

        if (!eph.shockIndex) eph.shockIndex = {};
        eph.shockIndex.value = HarnMasterActor._normProb(data.endurance, data.universalPenalty * 3.5, data.universalPenalty);
        if (canvas) this.getActiveTokens().forEach(token => {
            if (token.bars) token._onUpdateBarAttributes(this.data, { "eph.shockIndex.value": eph.shockIndex.value });
        });

        // Calculate current Move speed.  Cannot go below 0
        data.move.effective = Math.max(eph.move - data.physicalPenalty, 0);

        // Setup effective abilities (accounting for UP and PP)
        this._setupEffectiveAbilities(data);

        // Calculate Important Roll Targets
        eph.stumbleTarget = Math.max(eph.agility, 0);
        eph.fumbleTarget = Math.max(eph.dexterity, 0);

        // Process all the final post activities for Items
        this.items.forEach(it => {
            it.prepareDerivedData();
        });

        // Calculate spell effective mastery level values
        this._refreshSpellsAndInvocations();

        // Collect all combat skills into a map for use later
        let combatSkills = {};
        this.items.forEach(it => {
            if (it.data.type === 'skill' &&
                (it.data.data.type === 'Combat' || it.data.name.toLowerCase() === 'throwing')) {
                combatSkills[it.data.name] = {
                    'name': it.data.name,
                    'eml': it.data.data.effectiveMasteryLevel
                }
            }
        });

        this._setupWeaponData(combatSkills);

        this._generateArmorLocationMap(data);

        return;
    }


    /**
     * Calculate the weight of the gear. Note that since this method
     * is called before the actor has been completely setup, actor.items
     * will not be avaialble.  We specifically use actor.data.items array
     * instead, which will be available.  This array is not an array of
     * class HarnMasterItem, but an array of item data!
     */
    _calcGearWeightTotals() {
        const eph = this.data.data.eph;

        eph.totalWeaponWeight = 0;
        eph.totalMissileWeight = 0;
        eph.totalArmorWeight = 0;
        eph.totalMiscGearWeight = 0;

        let tempWeight = 0;

        this.data.items.forEach(it => {
            if (it.type === 'containergear') it.data.capacity.value = 0;
        });

        this.data.items.forEach(it => {
            if (it.type.endsWith('gear')) {
                // If the gear is inside of a container, then the "carried"
                // flag is inherited from the container.
                if (it.data.container && it.data.container !== 'on-person') {
                    const container = this.data.items.find(i => i._id === it.data.container);
                    if (container) it.data.isCarried = container.data.isCarried;
                }
            }

            switch (it.type) {
                case 'weapongear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalWeaponWeight += tempWeight;
                    break;

                case 'missilegear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalMissileWeight += tempWeight;
                    break;

                case 'armorgear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalArmorWeight += tempWeight;
                    break;

                case 'miscgear':
                case 'containergear':
                    if (!it.data.isCarried) break;
                    tempWeight = it.data.weight * it.data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalMiscGearWeight += tempWeight;
                    break;
            }

            if (it.type.endsWith('gear')) {
                const cid = it.data.container;
                if (cid && cid != 'on-person') {
                    const container = this.data.items.find(i => i._id === cid);
                    if (container) container.data.capacity.value = 
                        Math.round((container.data.capacity.value + tempWeight + Number.EPSILON) * 100) / 100;
                }
            }
        });

        // It seems whenever doing math on floating point numbers, very small
        // amounts get introduced creating very long decimal values.
        // Correct any math weirdness; keep to two decimal points
        eph.totalArmorWeight = Math.round((eph.totalArmorWeight + Number.EPSILON) * 100) / 100;
        eph.totalWeaponWeight = Math.round((eph.totalWeaponWeight + Number.EPSILON) * 100) / 100;
        eph.totalMissileWeight = Math.round((eph.totalMissileWeight + Number.EPSILON) * 100) / 100;
        eph.totalMiscGearWeight = Math.round((eph.totalMiscGearWeight + Number.EPSILON) * 100) / 100;

        eph.totalGearWeight = eph.totalWeaponWeight + eph.totalMissileWeight + eph.totalArmorWeight + eph.totalMiscGearWeight;
        eph.totalGearWeight = Math.round((eph.totalGearWeight + Number.EPSILON) * 100) / 100;
    }


    /**
     * Prepare Container type specific data
     */
    _prepareBaseContainerData(actorData) {
        const data = actorData.data;
        if (data.description === '***INIT***') {
            data.description = '';
            data.biography = '';
        }

        // Calculate container current capacity utilized
        const tempData = {};
        // TODO! -- this._calcGearWeightTotals(tempData);
        data.capacity.value = tempData.totalGearWeight;
        data.capacity.max = data.capacity.max || 1;
        data.capacity.pct = Math.round((Math.max(data.capacity.max - data.capacity.value, 0) / data.capacity.max) * 100);
    }

    _prepareDerivedContainerData(actorData) {

    }

    _setupEffectiveAbilities(data) {
        const eph = this.data.data.eph;

        // Affected by physical penalty
        data.abilities.strength.effective = Math.max(Math.round(eph.strength + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.stamina.effective = Math.max(Math.round(eph.stamina + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.agility.effective = Math.max(Math.round(eph.agility + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.dexterity.effective = Math.max(Math.round(eph.dexterity + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.eyesight.effective = Math.max(Math.round(eph.eyesight + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.hearing.effective = Math.max(Math.round(eph.hearing + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.smell.effective = Math.max(Math.round(eph.smell + Number.EPSILON) - data.physicalPenalty, 0);
        data.abilities.voice.effective = Math.max(Math.round(eph.voice + Number.EPSILON) - data.physicalPenalty, 0);

        // Affected by universal penalty
        data.abilities.intelligence.effective = Math.max(Math.round(eph.intelligence + Number.EPSILON) - data.universalPenalty, 0);
        data.abilities.aura.effective = Math.max(Math.round(eph.aura + Number.EPSILON) - data.universalPenalty, 0);
        data.abilities.will.effective = Math.max(Math.round(eph.will + Number.EPSILON) - data.universalPenalty, 0);

        // Not affected by any penalties
        data.abilities.comliness.effective = Math.max(Math.round(eph.comliness + Number.EPSILON), 0);
        data.abilities.morality.effective = Math.max(Math.round(eph.morality + Number.EPSILON), 0);
    }

    /**
     * Consolidated method to setup all gear, including misc gear, weapons,
     * and missiles.  (not armor yet)
     */
    _setupWeaponData(combatSkills) {
        const eph = this.data.data.eph;

        // Just ensure we take care of any NaN or other falsy nonsense
        if (!eph.misileAMLMod) eph.missileAMLMod = 0;
        if (!eph.weaponAMLMod) eph.weaponAMLMod = 0;
        if (!eph.weaponDMLMod) eph.weaponDMLMod = 0;

        this.items.forEach(it => {
            const itemData = it.data.data;
            if (it.data.type === 'missilegear') {
                // Reset mastery levels in case nothing matches
                itemData.attackMasteryLevel = Math.max(eph.missileAMLMod, 5);

                // If the associated skill is in our combat skills list, get EML from there
                // and then calculate AML.
                let assocSkill = itemData.assocSkill;
                if (typeof combatSkills[assocSkill] !== 'undefined') {
                    let skillEml = combatSkills[assocSkill].eml;
                    itemData.attackMasteryLevel = Math.max((skillEml + itemData.attackModifier + eph.missileAMLMod) || 5, 5);
                }
            } else if (it.data.type === 'weapongear') {
                // Reset mastery levels in case nothing matches
                itemData.attackMasteryLevel = Math.max(eph.weaponAMLMod, 5);
                itemData.defenseMasteryLevel = Math.max(eph.weaponDMLMod, 5);
                let weaponName = it.data.name;

                // If associated skill is 'None', see if there is a skill with the
                // same name as the weapon; if so, then set it to that skill.
                if (itemData.assocSkill === 'None') {
                    // If no combat skill with this name exists, search for next weapon
                    if (typeof combatSkills[weaponName] === 'undefined') return;

                    // A matching skill was found, set associated Skill to that combat skill
                    itemData.assocSkill = combatSkills[weaponName].name;
                }

                // At this point, we know the Associated Skill is not blank. If that
                // associated skill is in our combat skills list, get EML from there
                // and then calculate AML and DML.
                let assocSkill = itemData.assocSkill;
                if (typeof combatSkills[assocSkill] !== 'undefined') {
                    let skillEml = combatSkills[assocSkill].eml;
                    itemData.attackMasteryLevel = Math.max((skillEml + itemData.attack + itemData.attackModifier + eph.meleeAMLMod) || 5, 5);
                    itemData.defenseMasteryLevel = Math.max((skillEml + itemData.defense + eph.meleeDMLMod) || 5, 5);
                }
            }
        });
    }

    _refreshSpellsAndInvocations() {
        this._resetAllSpellsAndInvocations();
        this.items.forEach(it => {
            const itemData = it.data;
            if (itemData.type === 'skill' && itemData.data.type === 'Magic') {
                this._setConvocationSpells(itemData.name, itemData.data.skillBase.value, itemData.data.masteryLevel, itemData.data.effectiveMasteryLevel);
            } else if (itemData.type === 'skill' && itemData.data.type === 'Ritual') {
                this._setRitualInvocations(itemData.name, itemData.data.skillBase.value, itemData.data.masteryLevel, itemData.data.effectiveMasteryLevel);
            }
        });
    }

    _resetAllSpellsAndInvocations() {
        this.items.forEach(it => {
            const itemData = it.data;
            if (itemData.type === 'spell' || itemData.type === 'invocation') {
                itemData.data.effectiveMasteryLevel = 0;
                itemData.data.skillIndex = 0;
                itemData.data.masteryLevel = 0;
                itemData.data.effectiveMasteryLevel = 0;
            }
        })
    }

    _setConvocationSpells(convocation, sb, ml, eml) {
        if (!convocation || convocation.length == 0) return;

        let lcConvocation = convocation.toLowerCase();
        this.items.forEach(it => {
            const itemData = it.data;
            if (itemData.type === 'spell' && itemData.data.convocation && itemData.data.convocation.toLowerCase() === lcConvocation) {
                itemData.data.effectiveMasteryLevel = Math.max(eml - (itemData.data.level * 5), 5);
                itemData.data.skillIndex = Math.floor(ml / 10);
                itemData.data.masteryLevel = ml;
                itemData.data.skillBase = sb;
            }
        });
    }

    _setRitualInvocations(diety, sb, ml, eml) {
        if (!diety || diety.length == 0) return;

        let lcDiety = diety.toLowerCase();
        this.items.forEach(it => {
            const itemData = it.data;
            if (itemData.type === 'invocation' && itemData.data.diety && itemData.data.diety.toLowerCase() === lcDiety) {
                itemData.data.effectiveMasteryLevel = Math.max(eml - (itemData.data.circle * 5), 5);
                itemData.data.skillIndex = Math.floor(ml / 10);
                itemData.data.masteryLevel = ml;
                itemData.data.skillBase = sb;
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

        this.items.forEach(it => {
            const itemData = it.data;
            const data = itemData.data;

            if (itemData.type === 'armorgear' && data.isCarried && data.isEquipped) {

                // Go through all of the armor locations for this armor,
                // applying this armor's settings to each location

                // If locations doesn't exist, then just abandon and continue
                if (typeof data.locations === 'undefined') {
                    return;
                }

                data.locations.forEach(l => {
                    // If the location is unknown, skip the rest
                    if (typeof armorMap[l] != 'undefined') {

                        // Add this armor's protection to the location
                        if (typeof data.protection != 'undefined') {
                            armorMap[l].blunt += data.protection.blunt;
                            armorMap[l].edged += data.protection.edged;
                            armorMap[l].piercing += data.protection.piercing;
                            armorMap[l].fire += data.protection.fire;
                        }

                        // if a material has been specified, add it to the layers
                        if (data.material.length > 0) {
                            if (armorMap[l].layers.length > 0) {
                                armorMap[l].layers += ',';
                            }
                            armorMap[l].layers += data.material;
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
        this.items.forEach(it => {
            const itemData = it.data;
            const data = itemData.data;
            if (itemData.type === 'armorlocation') {
                let armorProt = armorArray.find(a => a.name === data.impactType);

                // We will ignore any armorProt if there is no armor values specified
                if (armorProt) {
                    data.blunt = armorProt.blunt;
                    data.edged = armorProt.edged;
                    data.piercing = armorProt.piercing;
                    data.fire = armorProt.fire;
                    data.layers = armorProt.layers;
                }
            }
        });
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

    _d100StdRoll(stdRollData) {
        const rollData = mergeObject({ data: this.data }, stdRollData);
        return DiceHM3.d100StdRoll(rollData);
    }

    _d6StdRoll(stdRollData) {
        const rollData = mergeObject({ data: this.data }, stdRollData);
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

    static _normalcdf(x) {
        var t = 1 / (1 + .2316419 * Math.abs(x));
        var d = .3989423 * Math.exp(-x * x / 2);
        var prob = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        if (x > 0) {
            prob = 1 - prob
        }
        return prob
    }

    static _normProb(z, mean, sd) {
        let prob;
        if (sd == 0) {
            prob = z < mean ? 0 : 100;
        } else {
            prob = Math.round(this._normalcdf((z - mean) / sd) * 100);
        }

        return prob;
    }

    async skillDevRoll(item) {
        const result = await DiceHM3.sdrRoll(item.data);

        if (result) {
            return item.update({
                "data.improveFlag": false,
                "data.masteryLevel": item.data.data.masteryLevel + result
            });
        } else {
            return item.update({ "data.improveFlag": false });
        }
    }

    static chatListeners(html) {
        html.on('click', '.card-buttons button', this._onChatCardAction.bind(this));
    }

    static async _onChatCardAction(event) {
        event.preventDefault();
        const button = event.currentTarget;
        button.disabled = true;
        const action = button.dataset.action;
        const weaponType = button.dataset.weaponType;

        let actor = null;
        if (button.dataset.actorId) {
            actor = game.actors.get(button.dataset.actorId);
            if (!actor) {
                console.warn(`HM3 | Action=${action}; Cannot find actor ${button.dataset.actorId}`);
                button.disabled = false;
                return null;
            }
        }
        let token = null;
        if (button.dataset.tokenId) {
            token = canvas.tokens.get(button.dataset.tokenId);
            if (!token) {
                console.warn(`HM3 | Action=${action}; Cannot find token ${button.dataset.tokenId}`);
                button.disabled = false;
                return null;
            }
        }

        if (!actor && token) {
            actor = token.actor;
        }

        let atkToken = null;
        if (button.dataset.atkTokenId) {
            atkToken = canvas.tokens.get(button.dataset.atkTokenId);
            if (!atkToken) {
                console.warn(`HM3 | Action=${action}; Cannot find attack token ${button.dataset.atkTokenId}`)
                button.disabled = false;
                return null;
            }
        }

        let defToken = null;
        if (button.dataset.defTokenId) {
            defToken = canvas.tokens.get(button.dataset.defTokenId);
            if (!defToken) {
                console.warn(`HM3 | Action=${action}; Cannot find defense token ${button.dataset.defTokenId}`)
                button.disabled = false;
                return null;
            }
        }
        switch (action) {
            case 'injury':
                DiceHM3.injuryRoll({
                    items: token.actor.items,
                    name: token.name,
                    actor: token.actor,
                    impact: button.dataset.impact,
                    aspect: button.dataset.aspect,
                    aim: button.dataset.aim,
                    tokenId: token.id
                });
                break;

            case 'dta-attack':
                macros.weaponAttack(null, false, atkToken, true);
                break;

            case 'dodge':
                combat.dodgeResume(atkToken, defToken, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'ignore':
                combat.ignoreResume(atkToken, defToken, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'block':
                combat.blockResume(atkToken, defToken, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'counterstrike':
                combat.meleeCounterstrikeResume(atkToken, defToken, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'shock':
                macros.shockRoll(false, actor);
                break;

            case 'stumble':
                macros.stumbleRoll(false, actor);
                break;

            case 'fumble':
                macros.fumbleRoll(false, actor);
                break;
        }

        button.disabled = false;
    }

    static async _createDefaultCharacterSkills(data) {
        let itemData;

        const physicalSkills = await game.packs.find(p => p.collection === `hm3.std-skills-physical`).getContent();
        itemData = duplicate(physicalSkills.find(i => i.name === 'Climbing'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(physicalSkills.find(i => i.name === 'Jumping'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(physicalSkills.find(i => i.name === 'Stealth'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(physicalSkills.find(i => i.name === 'Throwing'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);

        const commSkills = await game.packs.find(p => p.collection === `hm3.std-skills-communication`).getContent();
        itemData = duplicate(commSkills.find(i => i.name === 'Awareness'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(commSkills.find(i => i.name === 'Intrigue'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(commSkills.find(i => i.name === 'Oratory'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(commSkills.find(i => i.name === 'Rhetoric'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(commSkills.find(i => i.name === 'Singing'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);

        const combatSkills = await game.packs.find(p => p.collection === `hm3.std-skills-combat`).getContent();
        itemData = duplicate(combatSkills.find(i => i.name === 'Initiative'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(combatSkills.find(i => i.name === 'Unarmed'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(combatSkills.find(i => i.name === 'Dodge'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
    }

    static async _createDefaultCreatureSkills(data) {
        let itemData;

        const combatSkills = await game.packs.find(p => p.collection === `hm3.std-skills-combat`).getContent();
        itemData = duplicate(combatSkills.find(i => i.name === 'Initiative'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(combatSkills.find(i => i.name === 'Unarmed'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
        itemData = duplicate(combatSkills.find(i => i.name === 'Dodge'));
        data.items.push(new Item({ name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data }).data);
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

}

