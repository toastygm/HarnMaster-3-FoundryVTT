import { HM3 } from "../config.js";
import * as utility from '../utility.js';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class HarnMasterItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        super.prepareData();

        // Get the Item's data
        const itemData = this.data;
        const data = itemData.data;

        let img = null;

        // Handle marking gear as equipped or carried
        if (itemData.type.endsWith('gear')) {
            // If you aren't carrying the gear, it can't be equipped
            if (!data.isCarried) {
                data.isEquipped = false;
            }

            // Check if the item is in a container
            if (data.container && data.container !== 'on-person') {
                // Anything in a container is unequipped automatically
                data.isEquipped = false;
            }
        }

        if (itemData.type === 'armorlocation') {
            this._prepareArmorLocationData(itemData);
        }

        if (img && img != itemData.img) {
            itemData.img = img;
        }

        Hooks.call("hm3.onItemPrepareData", this);
    }

    postProcessItems() {
        const itemData = this.data;
        const data = itemData.data;

        let pctUnivPen = HarnMasterItem.calcPenaltyPct(this.actor?.data?.data.universalPenalty);
        let pctPhysPen = HarnMasterItem.calcPenaltyPct(this.actor?.data?.data.physicalPenalty);

        if (itemData.type === 'skill') {
            if (!data.masteryLevel || data.masteryLevel < 0) data.masteryLevel = 0; 

            utility.calcSkillBase(this);

            // Handle using Condition Skill for Endurance if it is present
            if (itemData.name.toLowerCase() === 'condition' && this.actor?.data) {
                this.actor.data.data.hasCondition = true;
                this.actor.data.data.endurance = Math.floor(data.masteryLevel / 5) || 1;
            }

            // We modify the EML by 5 times the difference between the SB based on base
            // abilities and the SB based on AE-modified abilities
            const sbModifier = Math.round(data.skillBase.delta * 5);

            // Set EML for skills based on UP/PP
            switch (data.type) {
                case 'Combat':
                case 'Physical':
                    data.effectiveMasteryLevel = data.masteryLevel - pctPhysPen + sbModifier;
                    break;

                default:
                    data.effectiveMasteryLevel = data.masteryLevel - pctUnivPen + sbModifier;
                    break;
            }

            // Set some actor properties from skills
            const lcSkillName = itemData.name.toLowerCase();
            if (lcSkillName === 'initiative') {
                if (this.actor?.data) this.actor.data.data.initiative = data.effectiveMasteryLevel;
            } else if (lcSkillName === 'dodge') {
                if (this.actor?.data) this.actor.data.data.dodge = data.effectiveMasteryLevel;
            }
        } else if (itemData.type === 'psionic') {
            if (!data.masteryLevel || data.masteryLevel < 0) data.masteryLevel = 0; 
            utility.calcSkillBase(this);
            data.effectiveMasteryLevel = data.masteryLevel - pctUnivPen;
        } else if (itemData.type === 'injury') {
            // Just make sure if injuryLevel is negative, we set it to zero
            data.injuryLevel = Math.max(data.injuryLevel || 0, 0);
            HarnMasterItem.calcInjurySeverity(this);
        }
    }

    _prepareArmorLocationData(itemData) {
        const data = itemData.data;

        // If impactType isn't custom, then set all properties from the selected impactType
        if (itemData.data.impactType != "custom") {
            Object.keys(HM3.injuryLocations).forEach(key => {
                if (HM3.injuryLocations[key].impactType === itemData.data.impactType) {
                    mergeObject(itemData.data, HM3.injuryLocations[key]);
                }
            });
        }

        data.probWeight.low = data.probWeight?.low || 0;
        data.probWeight.mid = data.probWeight?.mid || 0;
        data.probWeight.high = data.probWeight?.high || 0;
        data.armorQuality = data.armorQuality || 0;
        data.blunt = data.blunt || 0;
        data.edged = data.edged || 0;
        data.piercing = data.piercing || 0;
        data.fire = data.fire || 0;
    }

    /** @override */
    async _preCreate(data, options, user) {
        super._preCreate(data, options, user);
        const itemData = this.data;

        const updateData = {};
        if (data.img) updateData.img = data.img;

        // Get the default icon for Items
        const DEFAULT_ICON = foundry.data.ItemData.schema.img.default();

        // If this item is associated with a specific actor, then we can determine
        // some values directly from the actor.
        if (this.actor) {
            // If a weapon or a missile, get the associated skill
            if ((itemData.type === 'weapongear' || itemData.type === 'missilegear') && !itemData.data.assocSkill) {
                updateData['data.assocSkill'] = utility.getAssocSkill(itemData.name, this.actor.itemTypes.skill, 'None');
                itemData.data.assocSkill = updateData['data.assocSkill'];
            }

            // If it is a spell, initialize the convocation to the
            // first magic skill found; it is really unimportant what the
            // value is, so long as it is a valid skill for this character
            if (itemData.type === 'spell' && !itemData.data.convocation) {

                // Most spellcasters have two convocations: Neutral and another,
                // maybe several others.  Most spells are going to be of the
                // non-Neutral variety.  So, we want to prefer using the non-Neutral
                // skill by default; if no non-Neutral skills exist, but Neutral does
                // exist, then use that.

                // In the case where the actor is adding a spell but they have no magic
                // convocations, give up and don't make any changes.
                let hasNeutral = false;
                for (let skill of this.actor.itemTypes.skill.values()) {
                    if (skill.data.data.type === 'Magic') {
                        if (skill.data.name === 'Neutral') {
                            hasNeutral = true;
                            continue;
                        }
                        updateData['data.convocation'] = skill.data.name;
                        itemData.data.convocation = skill.data.name;
                        break;
                    }
                }
                if (!updateData['data.convocation'] && hasNeutral) {
                    updateData['data.convocation'] = 'Neutral';
                    itemData.data.convocation = 'Neutral';
                }
            }

            // If it is a invocation, initialize the diety to the
            // first ritual skill found; it is really unimportant what the
            // value is, so long as it is a valid skill for this character
            if (itemData.type === 'invocation' && !itemData.data.diety) {
                for (let skill of this.actor.itemTypes.skill.values()) {
                    if (skill.data.data.type === 'Ritual') {
                        updateData['data.diety'] = skill.data.name;
                        itemData.data.diety = skill.data.name;
                        break;
                    }
                }
            }
        }

        // If the image was not specified (or is default),
        // then set it based on the item name
        if (!updateData.img || updateData.img === DEFAULT_ICON) updateData.img = utility.getImagePath(itemData.name);

        // Setup Image Icon only if it is currently the default icon
        if (!updateData.img) {
            switch (itemData.type) {
                case 'skill':
                    if (itemData.data.type === 'Ritual') {
                        updateData.img = utility.getImagePath(HM3.defaultRitualIconName);
                    } else if (itemData.data.type === 'Magic') {
                        updateData.img = utility.getImagePath(HM3.defaultMagicIconName);
                    }
                    break;
    
                case 'psionic':
                    updateData.img = utility.getImagePath(HM3.defaultPsionicsIconName);
                    break;
    
                case 'spell':
                    // Base image on convocation name
                    updateData.img = utility.getImagePath(itemData.data.convocation);
                    if (!updateData.img) {
                        // If convocation image wasn't found, use default
                        updateData.img = utility.getImagePath(HM3.defaultMagicIconName);
                    }
                    break;
    
                case 'invocation':
                    // Base image on diety name
                    updateData.img = utility.getImagePath(itemData.data.diety);
                    if (!updateData.img) {
                        // If diety name wasn't found, use default
                        updateData.img = utility.getImagePath(HM3.defaultRitualIconName);
                    }
                    break;
    
                case 'miscgear':
                    updateData.img = utility.getImagePath(HM3.defaultMiscItemIconName);
                    break;
    
                case 'containergear':
                    updateData.img = utility.getImagePath(HM3.defaultContainerIconName);
                    break;
    
                case 'armorgear':
                    updateData.img = utility.getImagePath(HM3.defaultArmorGearIconName);
                    break;

                case 'weapongear':
                case 'missilegear':
                    updateData.img = utility.getImagePath(itemData.data.assocSkill);
                    break;
            }

            if (!updateData.img) delete updateData.img;
        }

        await this.data.update(updateData);
    }

    /**
     * Run a custom macro assigned to this item.
     * 
     * Returns an object with the following fields:
     * 
     * type: Type of roll
     * title: Chat label for Roll,
     * origTarget: Unmodified target value,
     * modifier: Modifier added to origTarget value,
     * modifiedTarget: Final modified target value,
     * rollValue: roll number,
     * isSuccess: is roll successful,
     * isCritical: is roll critical,
     * result: 'MS', 'CS', 'MF', 'CF',
     * description: textual description of roll success or failure,
     * notes: rendered notes,
     */
     async runCustomMacro(rollInput) {
        if (!rollInput) return null;

        if (!this.parent) return null;

        const actor = this.parent;

        const itemData = this.data;
        const rollResult = {
            type: rollInput.type,
            title: rollInput.title,
            origTarget: rollInput.origTarget,
            modifier: (rollInput.plusMinus === '-' ? -1 : 1) * rollInput.modifier,
            modifiedTarget: rollInput.modifiedTarget,
            rollValue: rollInput.rollValue,
            isSuccess: rollInput.isSuccess,
            isCritical: rollInput.isCritical,
            result: rollInput.isSuccess ? (rollInput.isCritical ? 'CS' : 'MS') : (rollInput.isCritical ? 'CF' : 'MF'),
            description: rollInput.description,
            notes: rollInput.notes
        }

        if (!itemData.data.macros.command) return null;

        const macro = await Macro.create({
            name: `${this.name} ${this.type} macro`,
            type: itemData.data.macros.type,
            scope: 'global',
            command: itemData.data.macros.command
        }, {temporary: true});
        if (!macro) {
            console.error(`HM3 | Failure initializing macro '${this.name} ${this.type} macro', type=${itemData.data.macros.type}, command='${itemData.data.macros.command}'`);
            return null;
        }

        const token = actor.isToken ? actor.token: null;
        
        return utility.executeMacroScript(macro, {
            actor: actor, 
            token: token, 
            rollResult: rollResult,
            item: this
        });
    }

    static calcInjurySeverity(injury) {
        const data = injury.data.data;
    
        if (data.injuryLevel === 0) {
            data.severity = '';
        } else if (data.injuryLevel == 1) {
            data.severity = 'M1';
        } else if (data.injuryLevel <= 3) {
            data.severity = `S${data.injuryLevel}`;
        } else {
            data.severity = `G${data.injuryLevel}`;
        }
    }
    
    /**
     * In HM3, PP and UP are low integer values, so we must multiply them by 5 in order to use them for
     * EML calculations.  This function does that.
     * 
     * @param {*} value 
     * @returns 
     */
    static calcPenaltyPct(value) {
        return (value || 0) * 5;
    }
}
