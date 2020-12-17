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
        const actorData = this.actor ? this.actor.data : {};
        const data = itemData.data;

        let img = null;
        let tempWeight = 0;

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

                // Determine Icon.  If the skill's current icon is not a standard icon
                // then don't change it; if it is a standard icon, then we can safely
                // change it if necessary.
                if (data.type === 'Physical' && utility.isStdIcon(itemData.img, HM3.weaponSkillIcons)) img = utility.getImagePath(itemData.name);
                else if (data.type === 'Communication' && utility.isStdIcon(itemData.img, HM3.commSkillIcons)) img = utility.getImagePath(itemData.name);
                else if (data.type === 'Combat' && utility.isStdIcon(itemData.img, HM3.combatSkillIcons)) img = utility.getImagePath(itemData.name);
                else if (data.type === 'Craft' && utility.isStdIcon(itemData.img, HM3.craftSkillIcons)) img = utility.getImagePath(itemData.name);
                else if (data.type === 'Magic' && utility.isStdIcon(itemData.img, HM3.magicIcons)) {
                    img = utility.getImagePath(itemData.name);
                    if (img === CONST.DEFAULT_TOKEN) {
                        img = utility.getImagePath(HM3.defaultMagicIconName);
                    }
                }
                else if (data.type === 'Ritual' && utility.isStdIcon(itemData.img, HM3.ritualIcons)) {
                    img = utility.getImagePath(itemData.name);
                    if (img === DEFAULT_TOKEN) {
                        img = utility.getImagePath(HM3.defaultRitualIconName);
                    }
                }

                
                // Handle using Condition Skill for Endurance if it is present
                if (itemData.name.toLowerCase() === 'condition' && this.actor) {
                    this.actor.data.data.hasCondition = true;
                    this.actor.data.data.endurance = Math.floor(data.masteryLevel / 5) || 1;
                }
                break;

            case 'psionic':
                utility.calcSkillBase(this);

                if (utility.isStdIcon(itemData.img, HM3.psionicTalentIcons)) {
                    img = utility.getImagePath(itemData.name);
                    if (img === DEFAULT_TOKEN) {
                        img = utility.getImagePath(HM3.defaultPsionicsIconName);
                    }
                }
                break;

            case 'spell':
                if (utility.isStdIcon(itemData.img, HM3.magicIcons)) {
                    img = utility.getImagePath(itemData.name);
                    if (img === DEFAULT_TOKEN) {
                        img = utility.getImagePath(data.convocation);
                        if (img === DEFAULT_TOKEN) {
                            img = utility.getImagePath(HM3.defaultMagicIconName);
                        }
                    }
                }
                break;

            case 'invocation':
                if (utility.isStdIcon(itemData.img, HM3.ritualIcons)) {
                    img = utility.getImagePath(itemData.name);
                    if (img === DEFAULT_TOKEN) {
                        img = utility.getImagePath(data.diety);
                        if (img === DEFAULT_TOKEN) {
                            img = utility.getImagePath(HM3.defaultRitualIconName);
                        }
                    }
                }
                break;

            case 'armorgear':
                if (itemData.img === DEFAULT_TOKEN) {
                    if (utility.isStdIcon(itemData.img, HM3.armorGearIcons)) {
                        img = utility.getImagePath(itemData.name);
                    }
                }
                break;

            case 'weapongear':
                if (itemData.img === DEFAULT_TOKEN) {
                    if (utility.isStdIcon(itemData.img, HM3.weaponSkillIcons)) {
                        img = utility.getImagePath(itemData.name);
                    }
                }
                break;

            case 'missilegear':
                if (itemData.img === DEFAULT_TOKEN) {
                    if (utility.isStdIcon(itemData.img, HM3.weaponSkillIcons)) {
                        img = utility.getImagePath(itemData.name);
                    }
                }
                break;

            case 'miscgear':
                if (itemData.img === DEFAULT_TOKEN) {
                    if (utility.isStdIcon(itemData.img, HM3.miscGearIcons)) {
                        img = utility.getImagePath(itemData.name);
                        if (img === DEFAULT_TOKEN) {
                            img = utility.getImagePath(HM3.defaultMiscItemIconName);
                        }
                    }
                }
                break;

            case 'containergear':
                if (itemData.img === DEFAULT_TOKEN) {
                    if (utility.isStdIcon(itemData.img, HM3.miscGearIcons)) {
                        img = utility.getImagePath(itemData.name);
                        if (img === DEFAULT_TOKEN) {
                            img = utility.getImagePath(HM3.defaultContainerIconName);
                        }
                    }
                }
                break;
        }

        if (img && img != itemData.img) {
            itemData.img = img;
        }
    }

    prepareDerivedData() {
        const itemData = this.data;
        const actorData = this.actor ? this.actor.data : {};
        const data = itemData.data;

        const pctUnivPen = this.actor ? actorData.data.universalPenalty * 5 : 0;
        const pctPhysPen = this.actor ? actorData.data.physicalPenalty * 5 : 0

        if (itemData.type === 'skill') {
            // Set EML for skills based on UP/PP
            switch (data.type) {
                case 'Combat':
                case 'Physical':
                    data.effectiveMasteryLevel = Math.max(data.masteryLevel - pctPhysPen, 5);
                    break;

                default:
                    data.effectiveMasteryLevel = Math.max(data.masteryLevel - pctUnivPen, 5);

            }

            // Set some actor properties from skills
            const lcSkillName = itemData.name.toLowerCase();
            if (lcSkillName === 'initiative') {
                if (this.actor) actorData.data.initiative = data.effectiveMasteryLevel;
            } else if (lcSkillName === 'dodge') {
                if (this.actor) actorData.data.dodge = data.effectiveMasteryLevel;
            }
        } else if (itemData.type === 'psionic') {
            data.effectiveMasteryLevel = Math.max(data.masteryLevel - pctUnivPen, 5);
        } else if (itemData.type === 'injury') {
            // Just make sure if injuryLevel is negative, we set it to zero
            if (data.injuryLevel < 0) data.injuryLevel = 0;

            if (this.actor) actorData.data.totalInjuryLevels += data.injuryLevel;
            if (data.injuryLevel === 0) {
                data.severity = '';
            } else if (data.injuryLevel == 1) {
                data.severity = 'M1';
            } else if (data.injuryLevel <= 3) {
                data.severity = 'S' + data.injuryLevel;
            } else {
                data.severity = 'G' + data.injuryLevel;
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
}
