/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(`Applying HM3 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });
  console.log(`HM3 | Starting Migration`);

  // Migrate World Actors
  for (let a of game.actors.contents) {
    try {
      const updateData = migrateActorData(a.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`HM3 | Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Items
  for (let i of game.items.contents) {
    try {
      const updateData = migrateItemData(i.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`HM3 | Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate Actor Override Tokens
  for (let s of game.scenes.contents) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`HM3 | Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  console.log(`HM3 | Migrating Compendium Packs`);
  for (let p of game.packs) {
    if (p.metadata.package !== 'world') continue;
    if (!['Actor', 'Item', 'Scene'].includes(p.metadata.entity)) continue;
    console.log(`HM3 | Starting Migration for Pack ${p.metadata.label}`);
    await migrateCompendium(p);
  }

  // Set the migration as complete
  game.settings.set("hm3", "systemMigrationVersion", game.system.data.version);
  console.log(`HM3 | Migration Complete`)
  ui.notifications.info(`HM3 System Migration to version ${game.system.data.version} completed!`, { permanent: true });
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
  const entity = pack.metadata.entity;
  if (!["Actor", "Item", "Scene"].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getDocuments();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    try {
      let updateData = null;
      if (entity === "Item") updateData = migrateItemData(ent.data);
      else if (entity === "Actor") updateData = migrateActorData(ent.data);
      else if (entity === "Scene") updateData = migrateSceneData(ent.data);
      if (!isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData["_id"] = ent.id;
        await ent.update(updateData);
        console.log(`HM3 | Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  console.log(`HM3 | Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
  const updateData = {};
  const actorData = actor.data;

  // Actor Data Updates
  /*
  * -------- ACTOR UPDATES GO HERE -------------
  */

  if (actorData.abilities.strength.hasOwnProperty('effective')) {
    updateData['data.abilities.strength.-=effective'] = null
  }

  if (actorData.abilities.stamina.hasOwnProperty('effective')) {
    updateData['data.abilities.stamina.-=effective'] = null
  }

  if (actorData.abilities.dexterity.hasOwnProperty('effective')) {
    updateData['data.abilities.dexterity.-=effective'] = null
  }

  if (actorData.abilities.agility.hasOwnProperty('effective')) {
    updateData['data.abilities.agility.-=effective'] = null
  }

  if (actorData.abilities.intelligence.hasOwnProperty('effective')) {
    updateData['data.abilities.intelligence.-=effective'] = null
  }

  if (actorData.abilities.aura.hasOwnProperty('effective')) {
    updateData['data.abilities.aura.-=effective'] = null
  }

  if (actorData.abilities.will.hasOwnProperty('effective')) {
    updateData['data.abilities.will.-=effective'] = null
  }

  if (actorData.abilities.eyesight.hasOwnProperty('effective')) {
    updateData['data.abilities.eyesight.-=effective'] = null
  }

  if (actorData.abilities.hearing.hasOwnProperty('effective')) {
    updateData['data.abilities.hearing.-=effective'] = null
  }

  if (actorData.abilities.smell.hasOwnProperty('effective')) {
    updateData['data.abilities.smell.-=effective'] = null
  }

  if (actorData.abilities.voice.hasOwnProperty('effective')) {
    updateData['data.abilities.voice.-=effective'] = null
  }

  if (actorData.abilities.hasOwnProperty('comliness')) {
    // Rename 'comliness' to 'comeliness'
    updateData['data.abilities.comeliness.base'] = actorData.abilities.comliness.base;
    updateData['data.abilities.-=comliness'] = null;
  }

  if (actorData.abilities.morality.hasOwnProperty('effective')) {
    updateData['data.abilities.morality.-=effective'] = null
  }

  if (actorData.abilities.hasOwnProperty('endurance')) {
    if (actorData.abilities.endurance.base) {
      updateData['flags.hm-gold.ability-endurance'] = actorData.abilities.endurance.base;
    }
    updateData['data.abilities.-=endurance'] = null;
  }

  if (actorData.abilities.hasOwnProperty('speed')) {
    if (actorData.abilities.speed.base) {
      updateData['flags.hm-gold.ability-speed'] = actorData.abilities.speed.base;
    }
    updateData['data.abilities.-=speed'] = null;
  }

  if (actorData.abilities.hasOwnProperty('touch')) {
    if (actorData.abilities.touch.base) {
      updateData['flags.hm-gold.ability-touch'] = actorData.abilities.touch.base;
    }
    updateData['data.abilities.-=touch'] = null;
  }

  if (actorData.abilities.hasOwnProperty('frame')) {
    if (actorData.abilities.frame.base) {
      updateData['flags.hm-gold.ability-frame'] = actorData.abilities.frame.base;
    }
    updateData['data.abilities.-=frame'] = null;
  }

  if (actorData.hasOwnProperty('shockIndex')) {
    updateData['data.-=shockIndex'] = null
  }

  if (actorData.hasOwnProperty('dodge')) {
    updateData['data.-=dodge'] = null
  }

  if (actorData.hasOwnProperty('initiative')) {
    updateData['data.-=initiative'] = null
  }

  if (actorData.hasOwnProperty('endurance')) {
    updateData['data.-=endurance'] = null
  }

  if (actorData.move.hasOwnProperty('effective')) {
    updateData['data.move.-=effective'] = null
  }

  if (actorData.hasOwnProperty('universalPenalty')) {
    updateData['data.-=universalPenalty'] = null
  }

  if (actorData.hasOwnProperty('physicalPenalty')) {
    updateData['data.-=physicalPenalty'] = null
  }

  if (actorData.hasOwnProperty('totalInjuryLevels')) {
    updateData['data.-=totalInjuryLevels'] = null
  }

  if (actorData.hasOwnProperty('hasCondition')) {
    updateData['data.-=hasCondition'] = null
  }

  if (actorData.hasOwnProperty('encumbrance')) {
    updateData['data.-=encumbrance'] = null
  }

  if (actorData.hasOwnProperty('totalWeight')) {
    updateData['data.-=totalWeight'] = null
  }

  if (!actorData.hasOwnProperty('macros') || !actorData.macros.hasOwnProperty('type')) {
    updateData['data.macros.command'] = '';
    updateData['data.macros.type'] = 'script';
  }

  // Remove deprecated fields
  _migrateRemoveDeprecated(actor, updateData);

  // Migrate Owned Items
  if (!actor.items) return updateData;
  let hasItemUpdates = false;
  const items = actor.items.map(i => {

    // Migrate the Owned Item
    let itemUpdate = migrateItemData(i);

    // Update the Owned Item
    if (!isObjectEmpty(itemUpdate)) {
      hasItemUpdates = true;
      return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
    } else return i;
  });
  if (hasItemUpdates) updateData.items = items;
  return updateData;
};

/* -------------------------------------------- */


/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
function cleanActorData(actorData) {

  // Scrub system data
  const model = game.system.model.Actor[actorData.type];
  actorData.data = filterObject(actorData.data, model);

  // Scrub system flags
  const allowedFlags = CONFIG.HM3.allowedActorFlags.reduce((obj, f) => {
    obj[f] = null;
    return obj;
  }, {});
  if (actorData.flags.hm3) {
    actorData.flags.hm3 = filterObject(actorData.flags.hm3, allowedFlags);
  }

  // Return the scrubbed data
  return actorData;
}


/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param itemData
 */
export const migrateItemData = function (item) {
  const itemData = item.data;
  const updateData = {};

  /*
  * -------- ITEM UPDATES GO HERE -------------
  */
  if (!itemData.hasOwnProperty('macros') || !itemData.macros.hasOwnProperty('type')) {
    updateData['data.macros.command'] = '';
    updateData['data.macros.type'] = 'script';
  }

  if (itemData.type === 'weapongear') {
    if (itemData.data.hasOwnProperty('squeeze')) {
      if (itemData.data.squeeze) {
        updateData['flags.hm-gold.squeeze-impact'] = itemData.data.squeeze;
      }
      updateData['data.-=squeeze'] = null;
    }

    if (itemData.data.hasOwnProperty('tear')) {
      if (itemData.data.squeeze) {
        updateData['flags.hm-gold.tear-impact'] = itemData.data.tear;
      }
      updateData['data.-=tear'] = null;
    }
  }

  if (itemData.type === 'missilegear') {
    if (itemData.data.range.hasOwnProperty('extreme64')) {
      updateData['data.range.-=extreme64'] = null;
    }

    if (itemData.data.range.hasOwnProperty('extreme128')) {
      updateData['data.range.-=extreme128'] = null;
    }

    if (itemData.data.range.hasOwnProperty('extreme256')) {
      updateData['data.range.-=extreme256'] = null;
    }

    if (itemData.data.impact.hasOwnProperty('extreme64')) {
      if (itemData.data.impact.extreme64) {
        updateData['flags.hm-gold.range4-impact'] = itemData.data.impact.short;
        updateData['flags.hm-gold.range8-impact'] = itemData.data.impact.medium;
        updateData['flags.hm-gold.range16-impact'] = itemData.data.impact.long;
        updateData['flags.hm-gold.range32-impact'] = itemData.data.impact.extreme;
        updateData['flags.hm-gold.range64-impact'] = itemData.data.impact.extreme64;
      }
      updateData['data.impact.-=extreme64'] = null;
    }
  
    if (itemData.data.impact.hasOwnProperty('extreme128')) {
      if (itemData.data.impact.extreme128) {
        updateData['flags.hm-gold.range128-impact'] = itemData.data.impact.extreme128;
      }
      updateData['data.impact.-=extreme128'] = null;
    }

    if (itemData.data.impact.hasOwnProperty('extreme256')) {
      if (itemData.data.impact.extreme256) {
        updateData['flags.hm-gold.range256-impact'] = itemData.data.impact.extreme256;
      }
      updateData['data.impact.-=extreme256'] = null;
    }  
  }

  if (itemData.type === 'armorgear') {
    if (!itemData.data.protection.hasOwnProperty('squeeze')) {
      if (itemData.data.protection.squeeze) {
        updateData['flags.hm-gold.squeeze'] = itemData.data.protection.squeeze;
      }
      updateData['data.protection.-=squeeze'] = 0;
    }

    if (itemData.data.protection.hasOwnProperty('tear')) {
      if (itemData.data.protection.tear) {
        updateData['flags.hm-gold.tear'] = itemData.data.protection.tear;
      }
      updateData['data.protection.-=tear'] = 0;
    }
  }

  if (itemData.type === 'armorlocation') {
    if (itemData.data.hasOwnProperty('squeeze')) {
      if (itemData.data.squeeze) {
        updateData['flags.hm-gold.squeeze'] = itemData.data.squeeze;
      }      
      updateData['data.-=squeeze'] = 0;
    }

    if (itemData.data.hasOwnProperty('tear')) {
      if (itemData.data.tear) {
        updateData['flags.hm-gold.tear'] = itemData.data.tear;
      }
      updateData['data.-=tear'] = 0;
    }

    if (itemData.data.probWeight.hasOwnProperty('arms')) {
      if (itemData.data.probWeight.arms) {
        updateData['flags.hm-gold.probweight-arms'] = itemData.data.probWeight.arms;
      }
      updateData['data.probWeight.-=arms'] = 1;
    }
  }

  // Remove deprecated fields
  _migrateRemoveDeprecated(item, updateData);

  // Return the migrated update data
  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene) {
  const tokens = foundry.utils.deepClone(scene.tokens);
  return {
    tokens: tokens.map(t => {
      if (!t.actorId || t.actorLink || !t.actorData.data) {
        t.actorData = {};
        return t;
      }
      const token = new Token(t);
      if (!token.actor) {
        t.actorId = null;
        t.actorData = {};
      } else if (!t.actorLink) {
        const updateData = migrateActorData(token.data.actorData);
        t.actorData = mergeObject(token.data.actorData, updateData);
      }
      return t;
    })
  };
};

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Migrate the actor bonuses object
 * @private
 */
//   function _migrateActorBonuses(actor, updateData) {
//     const b = game.system.model.Actor.character.bonuses;
//     for ( let k of Object.keys(actor.data.bonuses || {}) ) {
//       if ( k in b ) updateData[`data.bonuses.${k}`] = b[k];
//       else updateData[`data.bonuses.-=${k}`] = null;
//     }
//   }


/* -------------------------------------------- */


/**
 * A general migration to remove all fields from the data model which are flagged with a _deprecated tag
 * @private
 */
const _migrateRemoveDeprecated = function (ent, updateData) {
  const flat = flattenObject(ent.data);

  const toPreDep = Object.entries(updateData).filter(e => e[0])
  // Identify objects to deprecate
  const toDeprecate = Object.entries(flat).filter(e => e[0].endsWith("_deprecated") && (e[1] === true)).map(e => {
    let parent = e[0].split(".");
    parent.pop();
    return parent.join(".");
  });

  // Remove them
  for (let k of toDeprecate) {
    let parts = k.split(".");
    parts[parts.length - 1] = "-=" + parts[parts.length - 1];
    updateData[`data.${parts.join(".")}`] = null;
  }
};


/* -------------------------------------------- */


/**
 * A general tool to purge flags from all entities in a Compendium pack.
 * @param {Compendium} pack   The compendium pack to clean
 * @private
 */
export async function purgeFlags(pack) {
  const cleanFlags = (flags) => {
    const flagshm3 = flags.hm3 || null;
    return flagshm3 ? { hm3: flagshm3 } : {};
  };
  await pack.configure({ locked: false });
  const content = await pack.getDocuments();
  for (let entity of content) {
    const update = { _id: entity.id, flags: cleanFlags(entity.data.flags) };
    if (pack.document === "Actor") {
      update.items = entity.data.items.map(i => {
        i.flags = cleanFlags(i.flags);
        return i;
      })
    }
    await pack.updateEntity(update, { recursive: false });
    console.log(`HM3 | Purged flags from ${entity.name}`);
  }
  await pack.configure({ locked: true });
}
