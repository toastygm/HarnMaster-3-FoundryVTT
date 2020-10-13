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
    
    console.log("Sunsign Name: " + data.sunsignName);
    this._setupSunsigns(data);

    if (!data.isInit && this.data.items.length === 0) {
      data.isInit = true;
      this._createDefaultItems();
    }
    
    // Make modifications to data here. For example:
    this._calcGearWeightTotals(data);
    this._calcInjuryTotal(data);

    data.encumbrance = Math.floor(data.totalGearWeight / 10);
    data.universalPenalty = data.totalInjuryLevels + data.fatigue;
    data.physicalPenalty = data.universalPenalty + data.encumbrance;

    this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

    this._setPropertiesFromSkills(this.data.items, data);

    data.move = (data.abilities.agility - data.physicalPenalty) * 5;
    if (data.move < 0) data.move = 0;

    if (!data.hasCondition) {
      data.endurance = Math.round((data.abilities.strength + data.abilities.stamina + 
        data.abilities.will)/3);
    }
    data.endurance -= data.physicalPenalty;
    if (data.endurance < 0) data.endurance = 0;

    this._refreshSpellsAndInvocations();

    /*// Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }*/
  }

  _setupSunsigns(data) {
    data.sunsign = {
      "ulandus": false,
      "aralius": false,
      "feniri": false,
      "ahnu": false,
      "angberelius": false,
      "nadai": false,
      "hirin": false,
      "tarael": false,
      "tai": false,
      "skorus": false,
      "masara": false,
      "lado": false
    };

    const sunsignParts = data.sunsignName.toLowerCase().split('-');

    data.sunsign[sunsignParts[0]] = true;
    if (sunsignParts.length === 2) {
      data.sunsign[sunsignParts[1]] = true;
    }

    console.log(data.sunsign);
  }

  async _createDefaultItems() {
    const result = await this.createOwnedItem([
      {name: 'Climbing', type: 'physicalskill'},
      {name: 'Condition', type: 'physicalskill'},
      {name: 'Jumping', type: 'physicalskill'},
      {name: 'Stealth', type: 'physicalskill'},
      {name: 'Throwing', type: 'physicalskill'},
      {name: 'Awareness', type: 'commskill'},
      {name: 'Intrigue', type: 'commskill'},
      {name: 'Oratory', type: 'commskill'},
      {name: 'Rhetoric', type: 'commskill'},
      {name: 'Singing', type: 'commskill'},
      {name: 'Initiative', type: 'combatskill'},
      {name: 'Unarmed', type: 'combatskill'},
      {name: 'Dodge', type: 'combatskill'},
      {name: 'Skull', type: 'armorlocation'},
      {name: 'Face', type: 'armorlocation'},
      {name: 'Neck', type: 'armorlocation'},
      {name: 'Shoulder', type: 'armorlocation'},
      {name: 'Upper Arm', type: 'armorlocation'},
      {name: 'Elbow', type: 'armorlocation'},
      {name: 'Forearm', type: 'armorlocation'},
      {name: 'Hand', type: 'armorlocation'},
      {name: 'Thorax', type: 'armorlocation'},
      {name: 'Abdomen', type: 'armorlocation'},
      {name: 'Hip', type: 'armorlocation'},
      {name: 'Groin', type: 'armorlocation'},
      {name: 'Thigh', type: 'armorlocation'},
      {name: 'Knee', type: 'armorlocation'},
      {name: 'Calf', type: 'armorlocation'},
      {name: 'Foot', type: 'armorlocation'}
    ]);
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

  _refreshSpellsAndInvocations() {
    this._resetAllSpellsAndInvocations();
    this.data.items.forEach(it => {
      if (it.type === 'magicskill') {
        this._setConvocationSpells(it.name, it.data.effectiveMasteryLevel);
      } else if (it.type === 'ritualskill') {
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
}