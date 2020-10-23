import { HM3 } from '../config.js';
import { DiceHM3 } from '../dice-hm3.js';

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
    if (data.type == 'character') {
      new Dialog({
        title: 'Initialize Skills and Locations',
        content: `<p>Add Default Skills and Locations?</p>`,
        buttons: {
          yes: {
            label: 'Yes',
            callback: async dlg => {
              HarnMasterActor._createDefaultCharacterSkills(data);
              HarnMasterActor._createDefaultHumanoidLocations(data);          
              super.create(data, options); // Follow through the the rest of the Actor creation process upstream
            }
          },
          no: {
            label: 'No',
            callback: async dlg => {
              super.create(data, options); // Do not add new items, continue with the rest of the Actor creation process upstream
            }
          },
        },
        default: 'yes'
      }).render(true);
    } else if (data.type == 'creature') {
      // Create Creature Default Skills
      this._createDefaultCreatureSkills(data);
      super.create(data, options); // Follow through the the rest of the Actor creation process upstream
    } else {
      super.create(data, options); // Follow through the the rest of the Actor creation process upstream
    }
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

  static _createDefaultCreatureSkills(data) {
    data.items.push((new Item({name: 'Initiative', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
    data.items.push((new Item({name: 'Dodge', type: 'combatskill', data: game.system.model.Item.combatskill})).data);
  }

  static _createDefaultHumanoidLocations(data) {
    let armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Skull'])
    data.items.push((new Item({name: 'Skull', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Face'])
    data.items.push((new Item({name: 'Face', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Neck'])
    data.items.push((new Item({name: 'Neck', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Shoulder'])
    data.items.push((new Item({name: 'Left Shoulder', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Shoulder'])
    data.items.push((new Item({name: 'Right Shoulder', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Upper Arm'])
    data.items.push((new Item({name: 'Left Upper Arm', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Upper Arm'])
    data.items.push((new Item({name: 'Right Upper Arm', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Elbow'])
    data.items.push((new Item({name: 'Left Elbow', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Elbow'])
    data.items.push((new Item({name: 'Right Elbow', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Forearm'])
    data.items.push((new Item({name: 'Left Forearm', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Forearm'])
    data.items.push((new Item({name: 'Right Forearm', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Hand'])
    data.items.push((new Item({name: 'Left Hand', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Hand'])
    data.items.push((new Item({name: 'Right Hand', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Thorax'])
    data.items.push((new Item({name: 'Thorax', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Abdomen'])
    data.items.push((new Item({name: 'Abdomen', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Groin'])
    data.items.push((new Item({name: 'Groin', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Hip'])
    data.items.push((new Item({name: 'Left Hip', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Hip'])
    data.items.push((new Item({name: 'Right Hip', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Thigh'])
    data.items.push((new Item({name: 'Left Thigh', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Thigh'])
    data.items.push((new Item({name: 'Right Thigh', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Knee'])
    data.items.push((new Item({name: 'Left Knee', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Knee'])
    data.items.push((new Item({name: 'Right Knee', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Calf'])
    data.items.push((new Item({name: 'Left Calf', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Calf'])
    data.items.push((new Item({name: 'Right Calf', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Foot'])
    data.items.push((new Item({name: 'Left Foot', type: 'armorlocation', data: armorLocationData})).data);
    armorLocationData = {};
    mergeObject(armorLocationData, game.system.model.Item.armorlocation);
    mergeObject(armorLocationData, HM3.injuryLocations['Foot'])
    data.items.push((new Item({name: 'Right Foot', type: 'armorlocation', data: armorLocationData})).data);
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
    if (actorData.type === 'character') {
      this._prepareCharacterData(actorData);
    } else if (actorData.type === 'creature') {
      this._prepareCreatureData(actorData);
    }

  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;
    
    // Calculate weight and injury level totals, used to calculate
    // universal penalty below.
    this._calcInjuryTotal(data);
    this._calcGearWeightTotals(data);

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
    data.endurance.value = Math.max(data.endurance.max - data.physicalPenalty, 0);

    // Calculate current Move speed.  Cannot go below 0
    data.move = Math.max(data.abilities.agility - data.physicalPenalty, 0);

    // Calculate Important Roll Targets
    data.stumbleTarget = Math.max(data.abilities.agility - data.physicalPenalty, 0);
    data.fumbleTarget = Math.max(data.abilities.dexterity - data.physicalPenalty, 0);
    
    // Calculate spell effective mastery level values
    this._refreshSpellsAndInvocations();

    this._setupWeaponData(data);

    this._setupInjuryTargets(data);
  }
  
  /**
   * Prepare Creature type specific data
   */
  _prepareCreatureData(actorData) {
    const data = actorData.data;
    
    this._calcInjuryTotal(data);

    // Universal Penalty and Physical Penalty are used to calculate many
    // things, including effectiveMasteryLevel for all skills,
    // endurance, move, etc.
    data.universalPenalty = data.totalInjuryLevels + data.fatigue;
    data.physicalPenalty = data.universalPenalty;

    // Go through all skills calculating their EML
    this._calcSkillEMLWithPenalties(this.data.items, data.universalPenalty, data.physicalPenalty);

    // Some properties are calculated from skills.  Do that here.
    this._setPropertiesFromSkills(this.data.items, data);

    // Now calculate endurance.value; this value cannot go below 0
    data.endurance.value = data.endurance.max - data.physicalPenalty;
    if (data.endurance.value < 0) data.endurance.value = 0;

    this._setupWeaponData(data);
  }

  _setupInjuryTargets(data) {
    this.data.items.forEach(it => {
      if (it.type === 'injury') {
        // Injury Roll = HR*End (unaffected by UP or PP)
        it.data.targetHealRoll = it.data.healRate * data.endurance.max;
      }
    });
  }


  _setupWeaponData(data) {

    // Collect all combat skills into a map for use later
    let combatSkills = {};
    this.data.items.forEach(it => {
      if (it.type === 'combatskill') {
        combatSkills[it.name] = {
          'name': it.name,
          'eml': it.data.effectiveMasteryLevel
        };
      }
    });

    this.data.items.forEach(it => {
      if (it.type === 'weapongear') {
        // Reset mastery levels in case nothing matches
        it.data.attackMasteryLevel = 5;
        it.data.defenseMasteryLevel = 5;
        let weaponName = it.name;

        // If associated skill is 'None', see if there is a skill with the
        // same name as the weapon; if so, then set it to that skill.
        if (it.data.assocSkill === 'None') {
          // If no combat skill with this name exists, search for next weapon
          if (typeof combatSkills[weaponName] === 'undefined') return;

          // A matching skill was found, set associated Skill to that combat skill
          it.data.assocSkill = combatSkills[weaponName].name;
        }
        
        // At this point, we know the Associated Skill is not blank. If that
        // associated skill is in our combat skills list, get EML from there
        // and then calculate AML and DML.
        let assocSkill = it.data.assocSkill;
        if (typeof combatSkills[assocSkill] != 'undefined') {
          let skillEml = combatSkills[assocSkill].eml;
          it.data.attackMasteryLevel = skillEml + it.data.attack;
          it.data.defenseMasteryLevel = skillEml + it.data.defense;
        }

        // No matter what, we always have at least a 5% chance of attacking or
        // defending.
        it.data.defenseMasteryLevel = Math.max(it.data.defenseMasteryLevel, 5);
        it.data.attackMasteryLevel = Math.max(it.data.attackMasteryLevel, 5);
      }
    });
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
      if (it.type.endsWith('skill') || it.type === 'psionic') {
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

  stdRoll(label, options={}) {

    const rollData = {
      label: label,
      target: options.target,
      fastforward: options.fastforward,
      data: this.data,
      speaker: ChatMessage.getSpeaker({actor: this})
    };

    return DiceHM3.d100StdRoll(rollData);
  }

  d6Roll(label, options={}) {

    const rollData = {
      label: label,
      target: options.target,
      numdice: options.numdice,
      fastforward: options.fastforward,
      data: this.data,
      speaker: ChatMessage.getSpeaker({actor: this})
    };

    return DiceHM3.d6Roll(rollData);
  }

  damageRoll(weaponName) {

    const rollData = {
      weapon: weaponName,
      data: this.data,
      speaker: ChatMessage.getSpeaker({actor: this})
    };

    return DiceHM3.damageRoll(rollData);
  }

  injuryRoll() {

    const rollData = {
      actor: this,
      speaker: ChatMessage.getSpeaker({actor: this})
    };

    return DiceHM3.injuryRoll(rollData);
  }
}