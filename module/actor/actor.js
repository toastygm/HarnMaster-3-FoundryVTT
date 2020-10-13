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
    
    if (!data.isInit && this.data.items.length === 0) {
      this._createDefaultSkills();
      data.isInit = true;
    }
    
    // Make modifications to data here. For example:
    this._calcGearWeightTotals(data);
    this._calcInjuryTotal(data);

    data.encumbrance = Math.floor(data.totalGearWeight / 10);
    data.universalPenalty = data.totalInjuryLevels + data.fatigue;
    data.physicalPenalty = data.universalPenalty + data.encumbrance;

    this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

    data.move = (data.abilities.agility - data.physicalPenalty) * 5;
    if (data.move < 0) data.move = 0;

    if (!data.hasCondition) {
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

  async _createDefaultSkills() {
    await this.createSkill('Climbing', 'physicalskill');
    await this.createSkill('Condition', 'physicalskill');
    await this.createSkill('Jumping', 'physicalskill');
    await this.createSkill('Stealth', 'physicalskill');
    await this.createSkill('Throwing', 'physicalskill');
    await this.createSkill('Awareness', 'commskill');
    await this.createSkill('Intrigue', 'commskill');
    await this.createSkill('Oratory', 'commskill');
    await this.createSkill('Rhetoric', 'commskill');
    await this.createSkill('Singing', 'commskill');
    await this.createSkill('Initiative', 'combatskill');
    await this.createSkill('Unarmed', 'combatskill');
    await this.createSkill('Dodge', 'combatskill');
  }
  
  _setPropertiesFromSkills(items, data) {
    data.hasCondition = false;

    items.forEach(it => {
      if (it.type.endsWith('skill')) {
        switch(it.name.toLowerCase()) {
          case 'initiative':
            data.initiative = it.data.effectiveMasteryLevel;
            break;

          case 'condition':
            data.hasCondition = true;
            data.endurance = it.data.skillBase;
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
      if (it.type.endsWith('skill')) {
        switch (it.type) {
          case 'combatskill':
          case 'physicalskill':
            it.data.effectiveMasteryLevel = it.data.masteryLevel - pctPhysPen;
            break;

          default:
            it.data.effectiveMasteryLevel = it.data.masteryLevel - pctUnivPen;

        }
        if (it.data.effectiveMasteryLevel < 5) it.data.effectiveMasteryLevel = 5;
      }
    });
  }

  createSkill(name, type) {
    const itemData = {
      name: name,
      type: type,
      data: {
        "skillBase": 0,
        "masteryLevel": 0,
        "effectiveMasteryLevel": 0
      }
    };

    return this.createOwnedItem(itemData);
  }

  _calcGearWeightTotals(data) {
    data.totalWeaponWeight = 0;
    data.totalArmorWeight = 0;
    data.totalMiscGearWeight = 0;
 
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
      }
    });
    
    data.totalGearWeight = data.totalWeaponWeight + data.totalArmorWeight + data.totalMiscGearWeight;
  }

  _calcInjuryTotal(data) {
    let totalInjuryLevels = 0;
    this.data.items.forEach(it => {
      if (it.type === 'injury') {
        totalInjuryLevels += it.data.injuryLevel;
      }
    });
    data.totalInjuryLevels = totalInjuryLevels;
  }

}