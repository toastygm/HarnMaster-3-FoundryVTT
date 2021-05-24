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

        switch (itemData.type) {
            case 'armorlocation':
                this._prepareArmorLocationData(itemData);
                break;

            case 'skill':
                utility.calcSkillBase(this);

                // Handle using Condition Skill for Endurance if it is present
                if (itemData.name.toLowerCase() === 'condition' && this.actor?.data) {
                    this.actor.data.data.hasCondition = true;
                    this.actor.data.data.endurance = Math.floor(data.masteryLevel / 5) || 1;
                }
                break;

            case 'psionic':
                utility.calcSkillBase(this);
                break;
        }

        if (img && img != itemData.img) {
            itemData.img = img;
        }
    }

    prepareDerivedData() {
        const itemData = this.data;
        const data = itemData.data;

        const pctUnivPen = this.actor?.data?.data.universalPenalty * 5 || 0;
        const pctPhysPen = this.actor?.data?.data.physicalPenalty * 5 || 0;

        if (itemData.type === 'skill') {
            if (!data.masteryLevel || data.masteryLevel < 0) data.masteryLevel = 0; 

            // Set EML for skills based on UP/PP
            switch (data.type) {
                case 'Combat':
                case 'Physical':
                    data.effectiveMasteryLevel = data.masteryLevel - pctPhysPen;
                    break;

                default:
                    data.effectiveMasteryLevel = data.masteryLevel - pctUnivPen;

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
            data.effectiveMasteryLevel = data.masteryLevel - pctUnivPen;
        } else if (itemData.type === 'injury') {
            // Just make sure if injuryLevel is negative, we set it to zero
            data.injuryLevel = Math.max(data.injuryLevel || 0, 0);

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
    }

    _prepareArmorLocationData(itemData) {
        // If impactType isn't custom, then set all properties from the selected impactType
        if (itemData.data.impactType != "custom") {
            Object.keys(HM3.injuryLocations).forEach(key => {
                if (HM3.injuryLocations[key].impactType === itemData.data.impactType) {
                    mergeObject(itemData.data, HM3.injuryLocations[key]);
                }
            });
        }

        if (isNaN(itemData.data.probWeight['low'])) {
            itemData.data.probWeight['low'] = 0;
        }

        if (isNaN(itemData.data.probWeight['mid'])) {
            itemData.data.probWeight['mid'] = 0;
        }

        if (isNaN(itemData.data.probWeight['high'])) {
            itemData.data.probWeight['high'] = 0;
        }

        if (isNaN(itemData.data.armorQuality)) {
            itemData.data.armorQuality = 0;
        }

        if (isNaN(itemData.data.blunt)) {
            itemData.data.blunt = 0;
        }

        if (isNaN(itemData.data.piercing)) {
            itemData.data.piercing = 0;
        }

        if (isNaN(itemData.data.edged)) {
            itemData.data.edged = 0;
        }

        if (isNaN(itemData.data.fire)) {
            itemData.data.fire = 0;
        }
    }

    /** @override */
    async _preCreate(data, options, user) {
        super._preCreate(data, options, user);

        // If this item is associated with a specific actor, then we can determine
        // some values directly from the actor.
        if (this.actor) {
            // If a weapon or a missile, get the associated skill
            if ((data.type === 'weapongear' || data.type === 'missilegear') && !data.data.assocSkill) {
                data.data.assocSkill = utility.getAssocSkill(data.name, this.actor.itemTypes.skill, 'None');
            }

            // If it is a spell, initialize the convocation to the
            // first magic skill found; it is really unimportant what the
            // value is, so long as it is a valid skill for this character
            if (data.type === 'spell' && !data.data.convocation) {

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
                        if (skill.data.name == 'Neutral') {
                            hasNeutral = true;
                            continue;
                        }
                        data.data.convocation = skill.data.name;
                        break;
                    }
                }
                if (!data.data.convocation && hasNeutral) {
                    data.data.convocation = 'Neutral';
                }
            }

            // If it is a invocation, initialize the diety to the
            // first ritual skill found; it is really unimportant what the
            // value is, so long as it is a valid skill for this character
            if (data.type === 'invocation' && !data.data.diety) {
                for (let skill of this.actor.itemTypes.skill.values()) {
                    if (skill.data.data.type === 'Ritual') {
                        data.data.diety = skill.data.name;
                        break;
                    }
                }
            }
        }


        // If the image was not specified (or is default),
        // then set it based on the item name
        if (!data.img || data.img === CONST.DEFAULT_TOKEN) data.img = utility.getImagePath(data.name);

        // Setup Image Icon only if it is currently the default icon
        if (data.img === CONST.DEFAULT_TOKEN) {
            switch (currentData.type) {
                case 'skill':
                    if (data.data.type === 'Ritual') {
                        data.img = utility.getImagePath(HM3.defaultRitualIconName);
                    } else if (data.data.type === 'Magic') {
                        data.img = utility.getImagePath(HM3.defaultMagicIconName);
                    }
                    break;
    
                case 'psionic':
                    data.img = utility.getImagePath(HM3.defaultPsionicsIconName);
                    break;
    
                case 'spell':
                    // Base image on convocation name
                    data.img = utility.getImagePath(data.data.convocation);
                    if (data.img === CONST.DEFAULT_TOKEN) {
                        // If convocation image wasn't found, use default
                        data.img = utility.getImagePath(HM3.defaultMagicIconName);
                    }
                    break;
    
                case 'invocation':
                    // Base image on diety name
                    data.img = utility.getImagePath(data.data.diety);
                    if (data.img === CONST.DEFAULT_TOKEN) {
                        // If diety name wasn't found, use default
                        data.img = utility.getImagePath(HM3.defaultRitualIconName);
                    }
                    break;
    
                case 'miscgear':
                    data.img = utility.getImagePath(HM3.defaultMiscItemIconName);
                    break;
    
                case 'containergear':
                    data.img = utility.getImagePath(HM3.defaultContainerIconName);
                    break;
    
                case 'armorgear':
                    data.img = utility.getImagePath(HM3.defaultArmorGearIconName);
                    break;

                case 'weapongear':
                case 'missilegear':
                    data.img = utility.getImagePath(data.data.assocSkill);
                    break;
            }    
        }
    }

    /**
     * Run a custom macro assigned to this item.
     * 
     * Returns an object with the following fields:
     * 
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
    async runCustomMacro(rollInput, {actor, token}={}) {
        const itemData = this.data;
        const rollResult = {
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
        if (!itemData.data.macros.command) return rollResult;
        let command = null;
        if (itemData.data.macros.type === 'script') {
            if (!game.user.can("MACRO_SCRIPT")) return rollResult;
            const strRollResult = JSON.stringify(rollResult);
            command = `const item=actor.items.get('${this.id}');const rollResult=${strRollResult};${itemData.data.macros.command}`;
        } else {
            command = itemdata.data.macros.command;
        }

        const macro = await Macro.create({
            name: `${this.name} ${this.type} macro`,
            type: itemData.data.macros.type,
            scope: 'global',
            command: command
        }, {temporary: true});
        return macro.execute({actor, token});
    }
}
