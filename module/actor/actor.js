/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class HarnMasterActor extends Actor {

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
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Make modifications to data here. For example:

    if (!data.isInit) {
      this._createSkill('Climbing', 'physicalskill');
      this._createSkill('Condition', 'physicalskill');
      this._createSkill('Jumping', 'physicalskill');
      this._createSkill('Stealth', 'physicalskill');
      this._createSkill('Throwing', 'physicalskill');
      this._createSkill('Awareness', 'commskill');
      this._createSkill('Intrigue', 'commskill');
      this._createSkill('Oratory', 'commskill');
      this._createSkill('Rhetoric', 'commskill');
      this._createSkill('Singing', 'commskill');
      this._createSkill('Initiative', 'combatskill');
      this._createSkill('Unarmed', 'combatskill');
      this._createSkill('Dodge', 'combatskill');
      data.isInit = true;
    }

    this._calcGearWeightTotals(data);
    this._calcInjuryTotal();

    data.totalWeight = data.totalWeaponWeight + data.totalArmorWeight + data.totalMiscGearWeight;
    data.encumbrance = Math.floor(data.totalWeight / 10);
    data.universalPenalty = data.totalInjuryLevels + data.fatigue;
    data.physicalPenalty = data.universalPenalty + data.encumbrance;

    this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);
    this._setPropertiesFromSkills(this.data.items);

    data.move = (data.abilities.agility - data.physicalPenalty) * 5;
    if (data.move < 0) data.move = 0;

    if (!hasCondition) {
      data.endurance = Math.round((data.abilities.strength + data.abilities.stamina + 
        data.abilities.will)/3);
    }
    data.endurance -= data.physicalPenalty;
    if (data.endurance < 0) data.endurance = 0;
    
    /*// Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }*/
  }

  _setPropertiesFromSkills(items, data) {
    data.hasCondition = false;

    items.forEach(it => {
      if (it.type.endsWith('skill')) {
        switch(it.name.toLowerCase()) {
          case 'initiative':
            data.initiative = it.effectiveMasteryLevel;
            break;

          case 'condition':
            data.hasCondition = true;
            data.endurance = it.skillBase;
            break;

          case 'dodge':
            data.dodge = it.effectiveMasteryLevel;
            break;
        }
      }
    });
  }

  _calcSkillEMLWithPenalties(items, universalPenalty, physicalPenalty) {
    const pctUnivPen = universalPenalty * 5;
    const pctPhysPen = physicalPenalty * 5;

    items.forEach(it => {
      if (it.type.endsWith('skill')) {
        switch (it.type) {
          case 'combatskill':
          case 'physicalskill':
            it.effectiveMasteryLevel = it.masteryLevel - pctPhysPen;
            break;

          default:
            it.effectiveMasteryLevel = it.masteryLevel - pctUnivPen;

        }
        if (it.effectiveMasteryLevel < 5) it.effectiveMasteryLevel = 5;
      }
    });
  }

  _createSkill(name, type) {
    this._createOwnedItem(name, type, {
      "skillBase": 0,
      "masteryLevel": 0,
      "effectiveMasteryLevel": 0
    });
  }

  _createOwnedItem(name, type, data) {
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };

    // Finally, create the item!
    return this.createOwnedItem(itemData);
  }

  _calcGearWeightTotals(data) {
    data.totalWeaponWeight = 0;
    data.totalArmorWeight = 0;
    data.totalMiscGearWeight = 0;
    data.totalInjuryLevels = 0;
 
    let tempWeight;

    this.data.items.forEach(it => {
      switch (it.type) {
        case 'weapongear':
          tempWeight = it.data.weight * it.data.quantity;
          if (tempWeight < 0) tempWeight = 0;
          data.totalWeaponWeight += tempWeight;
          break;

        case 'armorgear':
          tempWeight = it.data.weight * it.data.quantity;
          if (tempWeight < 0) tempWeight = 0;
          data.totalArmorWeight += tempWeight;
          break;

        case 'miscgear':
          tempWeight = it.data.weight * it.data.quantity;
          if (tempWeight < 0) tempWeight = 0;
          data.totalMiscGearWeight += tempWeight;
          break;

        case 'injury':
          data.totalInjuryLevels += it.data.injurylevel;
          break;
      }
    });
    
    data.totalGearWeight = data.totalWeaponWeight + data.totalArmorWeight + data.totalMiscGearWeight;
  }

  _calcInjuryTotal() {
    this.data.items.forEach(it => {
      if (it.type === 'injury') {
        data.totalInjuryLevels += it.data.injuryLevel;
      }
    });
  }

}