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
    if (data.type == "character") {
      this._createDefaultCharacterSkills(data);
      this._createDefaultHumanoidLocations(data);
    } else if (data.type == "beast") {
      // Create Beast Default Skills
      this._createDefaultBeastSkills(data);
    }

    super.create(data, options); // Follow through the the rest of the Actor creation process upstream
  }

  static _createDefaultCharacterSkills(data) {
    data.items.push((new Item({name: 'Climbing', type: 'physicalskill', data: game.system.model.Item.physicalskill})).data);
    data.items.push((new Item({name: 'Condition', type: 'physicalskill', data: game.system.model.Item.physicalskill})).data);
    data.items.push((new Item({name: 'Jumping', type: 'physicalskill', data: game.system.model.Item.physicalskill})).data);
    data.items.push((new Item({name: 'Stealth', type: 'physicalskill', data: game.system.model.Item.physicalskill})).data);
    data.items.push((new Item({name: 'Throwing', type: 'physicalskill', data: game.system.model.Item.physicalskill})).data);
    data.items.push((new Item({name: 'Awareness', type: 'commskill', data: game.system.model.Item.commskill})).data);
    data.items.push((new Item({name: 'Intrigue', type: 'commskill', data: game.system.model.Item.commskill})).data);
    data.items.push((new Item({name: 'Oratory', type: 'commskill', data: game.system.model.Item.commskill})).data);
    data.items.push((new Item({name: 'Rhetoric', type: 'commskill', data: game.system.model.Item.commskill})).data);
    data.items.push((new Item({name: 'Singing', type: 'commskill', data: game.system.model.Item.commskill})).data);
    data.items.push((new Item({name: 'Initiative', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
    data.items.push((new Item({name: 'Unarmed', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
    data.items.push((new Item({name: 'Dodge', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
  }

  static _createDefaultBeastSkills(data) {
    data.items.push((new Item({name: 'Initiative', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
    data.items.push((new Item({name: 'Dodge', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
  }

  static _createDefaultHumanoidLocations(data) {
    data.items.push((new Item({name: 'Skull', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Face', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Neck', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Shoulder', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Upper Arm', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Elbow', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Forearm', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Hand', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Thorax', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Abdomen', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Hip', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Groin', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Thigh', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Knee', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Calf', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
    data.items.push((new Item({name: 'Foot', type: 'armorlocation', data: game.system.model.Item.armorlocation})).data);
  }

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
    
    // Calculate weight and injury level totals, used to calculate
    // universal penalty below.
    this._calcGearWeightTotals(data);
    this._calcInjuryTotal(data);

    data.encumbrance = Math.floor(data.totalGearWeight / 10);

    // Universal Penalty and Physical Penalty are used to calculate many
    // things, including effectiveMasteryLevel for all skills,
    // endurance, move, etc.
    data.universalPenalty = data.totalInjuryLevels + data.fatigue;
    data.physicalPenalty = data.universalPenalty + data.encumbrance;

    // Go through all skills calculating their EML
    this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

    // Some properties are calculated from skills.  Do that here.
    this._setPropertiesFromSkills(this.data.items, data);

    // If we have a condition skill, endurance.max will have been set using that
    // Otherwise, we will need to set it using the standard formula
    if (!data.hasCondition) {
      data.endurance.max = Math.round((data.abilities.strength + data.abilities.stamina + 
        data.abilities.will)/3);
    }

    // Now calculate endurance.value; this value cannot go below 0
    data.endurance.value = data.endurance.max - data.physicalPenalty;
    if (data.endurance.value < 0) data.endurance.value = 0;

    // Calculate current Move speed.  Cannot go below 0
    data.move = (data.abilities.agility - data.physicalPenalty) * 5;
    if (data.move < 0) data.move = 0;

    // Calculate spell effective mastery level values
    this._refreshSpellsAndInvocations();
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
            data.endurance.max = Math.floor(it.data.masteryLevel / 5);
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
        // Just make sure if injuryLevel is negative, we set it to zero
        if (it.data.injuryLevel < 0) it.data.injuryLevel = 0;

        totalInjuryLevels += it.data.injuryLevel;
        if (it.data.injuryLevel == 0) {
          it.data.severity = '';
          it.data.healRate = 0;
        } else if (it.data.injuryLevel == 1) {
          it.data.severity = 'M1';
        } else if (it.data.injuryLevel <= 3) {
          it.data.severity = 'S' + it.data.injuryLevel;
        } else {
          it.data.severity = 'G' + it.data.injuryLevel;
        }
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