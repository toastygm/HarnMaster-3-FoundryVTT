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

    async _preCreate(createData, options, user) {
        await super._preCreate(createData, options, user);

        // Setup default Actor type specific data.

        const updateData = {};
        if (createData.type === 'character') {
            updateData['data.description'] = '<table style=\"user-select: text; width: 95%; color: #191813; font-size: 13px;\" border=\"1\">\n<tbody style=\"box-sizing: border-box; user-select: text;\">\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Apparent Age</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Culture</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\"></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Social Class</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\"><span style=\"box-sizing: border-box; user-select: text;\"></span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Height</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Frame</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Weight</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Appearance/Comeliness</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Hair Color</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Eye Color</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 16px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 16px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Voice</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 16px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Obvious Medical Traits</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Apparent Occupation</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Apparent Wealth</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong>Weapons</strong><span style=\"box-sizing: border-box; user-select: text;\"><br style=\"box-sizing: border-box; user-select: text;\" /></span></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\"><span style=\"box-sizing: border-box; user-select: text;\">&nbsp;</span></td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Armour</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Companions</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n<tr style=\"box-sizing: border-box; user-select: text; height: 23px;\">\n<td style=\"box-sizing: border-box; user-select: text; width: 143.2px; height: 23px;\"><strong><span style=\"box-sizing: border-box; user-select: text;\">Other obvious features</span></strong></td>\n<td style=\"box-sizing: border-box; user-select: text; width: 365.6px; height: 23px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<p>&nbsp;</p>\n<p>&nbsp;</p>';
            updateData['data.biography'] = '<h1>Data</h1>\n<table style=\"width: 95%;\" border=\"1\">\n<tbody>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Birthdate</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Birthplace</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Sibling Rank</strong></td>\n<td style=\"width: 432px;\">x of y</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Parent(s)</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Parent Occupation</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Estrangement</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Clanhead</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Medical Traits</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Psyche Traits</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<h1>Life Story</h1>';
            updateData['data.bioImage'] = 'systems/hm3/images/svg/knight-silhouette.svg';
        } else if (createData.type === 'creature') {
            updateData['data.description'] = '';
            updateData['data.biography'] = '<h1>Data</h1>\n<table style=\"width: 95%;\" border=\"1\">\n<tbody>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Habitat</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Height</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Weight</strong></td>\n<td style=\"width: 432px;\"></td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Diet</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Lifespan</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n<tr>\n<td style=\"width: 143.6px;\"><strong>Group</strong></td>\n<td style=\"width: 432px;\">&nbsp;</td>\n</tr>\n</tbody>\n</table>\n<h1>Special Abilities</h1>\n<p>Describe any special abilities.</p>\n<h1>Attacks</h1>\n<p>Describe methods of attack.</p>\n<h1>Behavior</h1>\n<p>Describe behavioral aspects.</p>';
            updateData['data.bioImage'] = 'systems/hm3/images/svg/monster-silhouette.svg';
        } else if (createData.type === 'container') {
            updateData['data.capacity.max'] = 1;
            updateData['data.description'] = '';
            updateData['data.bioImage'] = 'systems/hm3/images/icons/svg/chest.svg';
            updateData['img'] = 'systems/hm3/images/icons/svg/chest.svg';
        }
        this.data.update(updateData);
    }

    _onCreate(data, options, userid) {
        // After an Actor has been created, add default skills and armor locations
        if (data.type === 'character') {
            HarnMasterActor._createDefaultCharacterSkills(this);
            HarnMasterActor._createDefaultHumanoidLocations(this);
        } else if (data.type === 'creature') {
            HarnMasterActor._createDefaultCreatureSkills(this);
        }
        super._onCreate(data, options, userid);
    }

    static async _copySkill(skillList, skillName, actor) {
        const itemData = skillList.find(i => i.name === skillName);
        if (!itemData) return null;
        return Item.create({name: itemData.name, type: itemData.type, img: itemData.img, data: itemData.data.data}, {parent: actor});
    }

    static async _createDefaultCharacterSkills(actor) {
        const physicalSkills = await game.packs.find(p => p.collection === `hm3.std-skills-physical`).getDocuments();
        await HarnMasterActor._copySkill(physicalSkills, 'Climbing', actor);
        await HarnMasterActor._copySkill(physicalSkills, 'Jumping', actor);
        await HarnMasterActor._copySkill(physicalSkills, 'Stealth', actor);
        await HarnMasterActor._copySkill(physicalSkills, 'Throwing', actor);

        const commSkills = await game.packs.find(p => p.collection === `hm3.std-skills-communication`).getDocuments();
        await HarnMasterActor._copySkill(commSkills, 'Awareness', actor);
        await HarnMasterActor._copySkill(commSkills, 'Intrigue', actor);
        await HarnMasterActor._copySkill(commSkills, 'Oratory', actor);
        await HarnMasterActor._copySkill(commSkills, 'Rhetoric', actor);
        await HarnMasterActor._copySkill(commSkills, 'Singing', actor);

        const combatSkills = await game.packs.find(p => p.collection === `hm3.std-skills-combat`).getDocuments();
        await HarnMasterActor._copySkill(combatSkills, 'Initiative', actor);
        await HarnMasterActor._copySkill(combatSkills, 'Unarmed', actor);
        await HarnMasterActor._copySkill(combatSkills, 'Dodge', actor);
    }

    static async _createDefaultCreatureSkills(actor) {
        const commSkills = await game.packs.find(p => p.collection === `hm3.std-skills-communication`).getDocuments();
        await HarnMasterActor._copySkill(commSkills, 'Awareness', actor);

        const combatSkills = await game.packs.find(p => p.collection === `hm3.std-skills-combat`).getDocuments();
        await HarnMasterActor._copySkill(combatSkills, 'Initiative', actor);
        await HarnMasterActor._copySkill(combatSkills, 'Unarmed', actor);
        await HarnMasterActor._copySkill(combatSkills, 'Dodge', actor);
    }

    static async _setupLocation(locName, templateName, actor) {
        const armorLocationData = foundry.utils.deepClone(game.system.model.Item.armorlocation);
        mergeObject(armorLocationData, HM3.injuryLocations[templateName])
        return await Item.create({name: locName, type: 'armorlocation', data: armorLocationData}, {parent: actor});
    }

    static async _createDefaultHumanoidLocations(actor) {
        await HarnMasterActor._setupLocation('Skull', 'Skull', actor);
        await HarnMasterActor._setupLocation('Face', 'Face', actor);
        await HarnMasterActor._setupLocation('Neck', 'Neck', actor);
        await HarnMasterActor._setupLocation('Left Shoulder', 'Shoulder', actor);
        await HarnMasterActor._setupLocation('Right Shoulder', 'Shoulder', actor);
        await HarnMasterActor._setupLocation('Left Upper Arm', 'Upper Arm', actor);
        await HarnMasterActor._setupLocation('Right Upper Arm', 'Upper Arm', actor);
        await HarnMasterActor._setupLocation('Left Elbow', 'Elbow', actor);
        await HarnMasterActor._setupLocation('Right Elbow', 'Elbow', actor);
        await HarnMasterActor._setupLocation('Left Forearm', 'Forearm', actor);
        await HarnMasterActor._setupLocation('Right Forearm', 'Forearm', actor);
        await HarnMasterActor._setupLocation('Left Hand', 'Hand', actor);
        await HarnMasterActor._setupLocation('Right Hand', 'Hand', actor);
        await HarnMasterActor._setupLocation('Thorax', 'Thorax', actor);
        await HarnMasterActor._setupLocation('Abdomen', 'Abdomen', actor);
        await HarnMasterActor._setupLocation('Groin', 'Groin', actor);
        await HarnMasterActor._setupLocation('Left Hip', 'Hip', actor);
        await HarnMasterActor._setupLocation('Right Hip', 'Hip', actor);
        await HarnMasterActor._setupLocation('Left Thigh', 'Thigh', actor);
        await HarnMasterActor._setupLocation('Right Thigh', 'Thigh', actor);
        await HarnMasterActor._setupLocation('Left Knee', 'Knee', actor);
        await HarnMasterActor._setupLocation('Right Knee', 'Knee', actor);
        await HarnMasterActor._setupLocation('Left Calf', 'Calf', actor);
        await HarnMasterActor._setupLocation('Right Calf', 'Calf', actor);
        await HarnMasterActor._setupLocation('Left Foot', 'Foot', actor);
        await HarnMasterActor._setupLocation('Right Foot', 'Foot', actor);
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
        const items = actorData.items;

        // Ephemeral data is kept together with other actor data,
        // but it is not in the data model so it will not be saved.
        if (!data.eph) data.eph = {};
        const eph = data.eph;

        // Initialize derived attributes
        data.abilities.strength.effective = 0;
        data.abilities.stamina.effective = 0;
        data.abilities.dexterity.effective = 0;
        data.abilities.agility.effective = 0;
        data.abilities.intelligence.effective = 0;
        data.abilities.aura.effective = 0;
        data.abilities.will.effective = 0;
        data.abilities.eyesight.effective = 0;
        data.abilities.hearing.effective = 0;
        data.abilities.smell.effective = 0;
        data.abilities.voice.effective = 0;
        data.abilities.comeliness.effective = 0;
        data.abilities.morality.effective = 0;
        data.dodge = 0;
        data.initiative = 0;
        data.endurance = 0;
        data.shockIndex = { value: 0, max: 100 };
        data.move.effective = 0;
        data.universalPenalty = 0;
        data.physicalPenalty = 0;
        data.totalInjuryLevels = 0;
        data.encumbrance = 0;
        data.totalWeight = 0;
        
        this.calcTotalGearWeight();

        // Prepare data items unique to containers
        if (actorData.type === 'container') {
            data.capacity.value = data.totalWeight;
            data.capacity.pct = Math.round(((data.capacity.max - data.capacity.value) / (data.capacity.max || 1)) * 100);
            data.capacity.pct = Math.max(Math.min(data.capacity.pct, 100), 0);  // ensure value is between 0 and 100 inclusive)
        }

        // Calculate endurance (in case Condition not present)
        data.endurance = Math.round((data.abilities.strength.base + data.abilities.stamina.base +
            data.abilities.will.base) / 3);    

        // Calculate values based on items
        items.forEach(it => {
            const itemData = it.data;
            if (itemData.type === 'injury') {
                // Calculate total injury levels
                data.totalInjuryLevels += it.data.data.injuryLevel || 0;
            } else if (itemData.type === 'skill' && itemData.name.toLowerCase() === 'condition') {
                // if Condition skill is present, use that for endurance instead
                data.endurance = Math.round((itemData.data.masteryLevel || 0) / 5);
            }
        });

        // Safety net: We divide things by endurance, so ensure it is > 0
        data.endurance = Math.max(data.endurance, 1);

        data.encumbrance = Math.floor(data.totalWeight / data.endurance);

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
        eph.comeliness = data.abilities.comeliness.base;
        eph.totalInjuryLevels = data.totalInjuryLevels;
    
        eph.meleeAMLMod = 0;
        eph.meleeDMLMod = 0;
        eph.missileAMLMod = 0;
        eph.commSkillsMod = 0;
        eph.physicalSkillsMod = 0;
        eph.combatSkillsMod = 0;
        eph.craftSkillsMod = 0;
        eph.ritualSkillsMod = 0;
        eph.magicSkillsMod = 0;
        eph.psionicTalentsMod = 0;
   }

    /** 
     * Perform data preparation after Items preparation and Active Effects have
     * been applied.
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
        
        this._calcGearWeightTotals();

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
        data.universalPenalty = eph.totalInjuryLevels + eph.fatigue;
        this.applySpecificActiveEffect('data.universalPenalty');
        data.universalPenalty = Math.floor(Math.max(data.universalPenalty || 0, 0));

        data.physicalPenalty = data.universalPenalty + data.encumbrance;
        this.applySpecificActiveEffect('data.physicalPenalty');
        data.physicalPenalty = Math.floor(Math.max(data.physicalPenalty || 0, 0));

        data.shockIndex.value = HarnMasterActor._normProb(data.endurance, data.universalPenalty * 3.5, data.universalPenalty);

        // Calculate current Move speed.  Cannot go below 0
        // HEURISTIC: Assume if base move < 25 that user is specifying hexes for movement (use PP as penalty);
        // 25+ means they are specifying feet (and use PP*5 as penalty); unlikely many characters will have
        // a base Agility of <= 4 and will want to specify the base move speed in feet.
        // Eventually we will standardize on "feet" and this heuristic can be removed.
        data.move.effective = Math.max(eph.move - (data.move.base < 25 ? data.physicalPenalty : data.physicalPenalty * 5), 0);

        // Setup effective abilities (accounting for UP and PP)
        this._setupEffectiveAbilities(data);

        // Calculate Important Roll Targets
        eph.stumbleTarget = Math.max(data.abilities.agility.effective, 0);
        eph.fumbleTarget = Math.max(data.abilities.dexterity.effective, 0);

        // Process all the final post activities for Items
        this.items.forEach(it => {
            it.prepareDerivedData();

            // If a skill, apply the specific active effect to modify
            // the EML
            if (['skill', 'psionic'].includes(it.data.type)) {
                this.applySkillActiveEffect(it);
            }
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
     * Calculate the total weight of all gear carried
     */
    calcTotalGearWeight() {
        const items = this.data.items;
        const data = this.data.data;

        // If not the owner of this actor, then this method is useless
        if (!this.isOwner) return;

        // check to ensure items are available
        if (!items) return;

        // Find all containergear, and track whether container is carried or not
        const containerCarried = {};
        items.forEach(it => {
            if (it.data.type === 'containergear') {
                containerCarried[it.id] = it.data.data.isCarried;
            }
        });

        let totalWeight = 0;
        items.forEach(it => {
            const itemData = it.data;
            if (itemData.type.endsWith('gear')) {
                // If gear is on-person, then check the carried flag to determine
                // whether the gear is carried. Otherwise, it must be in a container,
                // so check whether the container is carried.
                if (itemData.data.container === 'on-person') {
                    if (itemData.data.isCarried) {
                        totalWeight += itemData.data.weight * itemData.data.quantity;
                    }
                } else {
                    if (containerCarried[itemData.data.container]) {
                        totalWeight += itemData.data.weight * itemData.data.quantity;
                    }
                }
            }
        });

        // Normalize weight to two decimal points
        totalWeight = Math.round((totalWeight + Number.EPSILON) * 100) / 100;

        data.totalWeight = totalWeight;

        return;
    }

    /**
     * Calculate the weight of the gear. Note that this is somewhat redundant
     * with the calculation being done during item create/update/delete,
     * but here we are generating a much more fine-grained set of data
     * regarding the weight distribution.
     */
    _calcGearWeightTotals() {
        const eph = this.data.data.eph;

        eph.totalWeaponWeight = 0;
        eph.totalMissileWeight = 0;
        eph.totalArmorWeight = 0;
        eph.totalMiscGearWeight = 0;

        let tempWeight = 0;

        // Initialize all container capacity values
        this.items.forEach(it => {
            if (it.data.type === 'containergear') it.data.data.capacity.value = 0;
        });

        this.items.forEach(it => {
            const itemData = it.data;
            const data = itemData.data;
            
            tempWeight = 0;
            
            if (itemData.type.endsWith('gear')) {
                // If the gear is inside of a container, then the "carried"
                // flag is inherited from the container.
                if (data.container && data.container !== 'on-person') {
                    const container = this.data.items.find(i => i.id === data.container);
                    if (container) data.isCarried = container.data.data.isCarried;
                }
            }

            switch (itemData.type) {
                case 'weapongear':
                    if (!data.isCarried) break;
                    tempWeight = data.weight * data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalWeaponWeight += tempWeight;
                    break;

                case 'missilegear':
                    if (!data.isCarried) break;
                    tempWeight = data.weight * data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalMissileWeight += tempWeight;
                    break;

                case 'armorgear':
                    if (!data.isCarried) break;
                    tempWeight = data.weight * data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalArmorWeight += tempWeight;
                    break;

                case 'miscgear':
                case 'containergear':
                    if (!data.isCarried) break;
                    tempWeight = data.weight * data.quantity;
                    if (tempWeight < 0) tempWeight = 0;
                    eph.totalMiscGearWeight += tempWeight;
                    break;
            }

            if (itemData.type.endsWith('gear')) {
                const cid = data.container;
                if (cid && cid != 'on-person') {
                    const container = this.items.get(cid);
                    if (container) {
                        container.data.data.capacity.value = 
                            Math.round((container.data.data.capacity.value + tempWeight + Number.EPSILON) * 100) / 100;
                    } else {
                        // If container is set and is not 'on-person', but if we can't find the container,
                        // move the item back to 'on-person'.
                        data.container = 'on-person';
                    }
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
        data.abilities.comeliness.effective = Math.max(Math.round(eph.comeliness + Number.EPSILON), 0);
        data.abilities.morality.effective = Math.max(Math.round(eph.morality + Number.EPSILON), 0);
    }

    /**
     * Consolidated method to setup all gear, including misc gear, weapons,
     * and missiles.  (not armor yet)
     */
    _setupWeaponData(combatSkills) {
        const eph = this.data.data.eph;

        // Just ensure we take care of any NaN or other falsy nonsense
        if (!eph.missileAMLMod) eph.missileAMLMod = 0;
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

    static async skillDevRoll(item) {
        const result = await DiceHM3.sdrRoll(item.data);

        if (result?.sdrIncr) {
            await item.update({
                "data.improveFlag": false,
                "data.masteryLevel": item.data.data.masteryLevel + (result.sdrIncr === 2 ? 2 : 1)
            });
        } else {
            await item.update({ "data.improveFlag": false });
        }

        return result;
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
                macros.dodgeResume(atkToken.id, defToken.id, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'ignore':
                macros.ignoreResume(atkToken.id, defToken.id, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'block':
                macros.blockResume(atkToken.id, defToken.id, button.dataset.weaponType, button.dataset.weapon,
                    button.dataset.effAml, button.dataset.aim,
                    button.dataset.aspect, button.dataset.impactMod)
                break;

            case 'counterstrike':
                macros.meleeCounterstrikeResume(atkToken.id, defToken.id, button.dataset.weapon,
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

    applySpecificActiveEffect(property) {
        const overrides = {};

        // Organize non-disabled effects by their application priority
        const changes = this.effects.reduce((chgs, e) => {
          if ( e.data.disabled) return chgs;
          if ( e.data.changes.key !== property) return chgs;
          return chgs.concat(e.data.changes.map(c => {
            c = foundry.utils.duplicate(c);
            c.effect = e;
            c.priority = c.priority ?? (c.mode * 10);
            return c;
          }));
        }, []);
        changes.sort((a, b) => a.priority - b.priority);
    
        // Apply all changes
        for ( let change of changes ) {
          const result = change.effect.apply(this, change);
          if ( result !== null ) overrides[change.key] = result;
        }
    
        // Expand the set of final overrides
        mergeObject(this.overrides, foundry.utils.expandObject(overrides));
    }

    applySkillActiveEffect(skill) {
        const overrides = {};

        // Organize non-disabled effects by their application priority
        const changes = this.effects.reduce((chgs, e) => {
            if (e.data.disabled) return chgs;
            if (!['skill', 'psionic'].includes(skill.data.type)) return chgs;
            if (e.data.changes.key === 'data.eph.commSkillMod' && skill.data.data.type === 'Communication') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.physicalSkillMod' && skill.data.data.type === 'Physical') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.combatSkillMod' && skill.data.data.type === 'Combat') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.craftSkillMod' && skill.data.data.type === 'Craft') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.ritualSkillMod' && skill.data.data.type === 'Ritual') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.magicSkillMod' && skill.data.data.type === 'Magic') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else if (e.data.changes.key === 'data.eph.psionicTalentlMod' && skill.data.type === 'psionic') {
                e.data.changes.key = 'data.effectiveMasteryLevel';
            } else {
                return chgs;
            }
            return chgs.concat(e.data.changes.map(c => {
                c = foundry.utils.duplicate(c);
                c.effect = e;
                c.priority = c.priority ?? (c.mode * 10);
                return c;
            }));
        }, []);
        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (let change of changes) {
            change.effect.apply(skill, change);
        }
    }

    /**
     * If the actor is an unlinked actor for a token, then when an item on that unlinked
     * actor is changed, it is considered an "Actor change" and this method gets called.
     * In that case, data will contain an "items" element, which is what tells us that
     * some embedded item changed.
     * 
     * @override 
     */
    // _onUpdate(data, options, userId, context) {
    //     // Ensure we process the changes first, so the Actor.items map gets updated
    //     const result = super._onUpdate(data, options, userId, context);

    //     // Now handle any actor updates if any embedded items were changed
    //     if (data.items) {
    //         this.calcTotalGearWeight();
    //     }
    //     return result;
    // }

    /**
     * If the actor is either a linked actor for a token, or not associated with a token
     * at all, then when any change to the embedded items occurs this method gets called.
     * 
     * @override 
     */
    // _onModifyEmbeddedEntity(embeddedName, changes, options, userId, context={}) {
    //     // The Actor.items map should already be updated, so process actor updates
    //     if (embeddedName === 'Item') {
    //         this.calcTotalGearWeight().then(() => {
    //             return super._onModifyEmbeddedEntity(embeddedName, changes, options, userId, context);
    //         });
    //         return;
    //     }

    //     return super._onModifyEmbeddedEntity(embeddedName, changes, options, userId, context);
    // }

}

