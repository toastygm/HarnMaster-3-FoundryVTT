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
          if (img === CONFIG.DEFAULT_TOKEN) {
            img = utility.getImagePath(HM3.defaultMagicIconName);
          }
        }
        else if (data.type === 'Ritual' && utility.isStdIcon(itemData.img, HM3.ritualIcons)) {
          img = utility.getImagePath(itemData.name);
          if (img === CONFIG.DEFAULT_TOKEN) {
            img = utility.getImagePath(HM3.defaultRitualIconName);
          }
        }
        break;

      case 'psionic':
        utility.calcSkillBase(this);
        
        if (utility.isStdIcon(itemData.img, HM3.psionicTalentIcons)) {
          img = utility.getImagePath(itemData.name);
          if (img === CONFIG.DEFAULT_TOKEN) {
            img = utility.getImagePath(HM3.defaultPsionicsIconName);
          }
        }
        break;

      case 'spell':
        if (utility.isStdIcon(itemData.img, HM3.magicIcons)) {
          img = utility.getImagePath(itemData.name);
          if (img === CONFIG.DEFAULT_TOKEN) {
            img = utility.getImagePath(data.convocation);
            if (img === CONFIG.DEFAULT_TOKEN) {
              img = utility.getImagePath(HM3.defaultMagicIconName);
            }
          }
        }
        break;

      case 'invocation':
        if (utility.isStdIcon(itemData.img, HM3.ritualIcons)) {
          img = utility.getImagePath(itemData.name);
          if (img === CONFIG.DEFAULT_TOKEN) {
            img = utility.getImagePath(data.diety);
            if (img === CONFIG.DEFAULT_TOKEN) {
              img = utility.getImagePath(HM3.defaultRitualIconName);
            }
          }
        }
        break;
        
      case 'weapongear':
      case 'missilegear':
        if (itemData.img === CONFIG.DEFAULT_TOKEN) {
          if (utility.isStdIcon(itemData.img, HM3.weaponSkillIcons)) {
            img = utility.getImagePath(itemData.name);
          }
        }
        break;
        
      case 'miscgear':
        if (itemData.img === CONFIG.DEFAULT_TOKEN) {
          if (utility.isStdIcon(itemData.img, HM3.miscGearIcons)) {
            img = utility.getImagePath(itemData.name);
            if (img === CONFIG.DEFAULT_TOKEN) {
              img = utility.getImagePath(HM3.defaultMiscItemIconName);
            }
          }
        }
        break;
    }

    if (img && img != itemData.img) {
    //   this.update({'data.img': img});
      itemData.img = img;
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
