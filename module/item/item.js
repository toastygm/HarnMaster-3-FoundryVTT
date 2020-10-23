import { HM3 } from "../config.js";

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

    if (itemData.type == 'armorlocation') {
      this._prepareArmorLocationData(itemData);
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
