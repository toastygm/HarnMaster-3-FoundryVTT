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
    updateData['data.abilities.strength.-=effective'] = true
  }

  if (actorData.abilities.stamina.hasOwnProperty('effective')) {
    updateData['data.abilities.stamina.-=effective'] = true
  }

  if (actorData.abilities.dexterity.hasOwnProperty('effective')) {
    updateData['data.abilities.dexterity.-=effective'] = true
  }

  if (actorData.abilities.agility.hasOwnProperty('effective')) {
    updateData['data.abilities.agility.-=effective'] = true
  }

  if (actorData.abilities.intelligence.hasOwnProperty('effective')) {
    updateData['data.abilities.intelligence.-=effective'] = true
  }

  if (actorData.abilities.aura.hasOwnProperty('effective')) {
    updateData['data.abilities.aura.-=effective'] = true
  }

  if (actorData.abilities.will.hasOwnProperty('effective')) {
    updateData['data.abilities.will.-=effective'] = true
  }

  if (actorData.abilities.eyesight.hasOwnProperty('effective')) {
    updateData['data.abilities.eyesight.-=effective'] = true
  }

  if (actorData.abilities.hearing.hasOwnProperty('effective')) {
    updateData['data.abilities.hearing.-=effective'] = true
  }

  if (actorData.abilities.smell.hasOwnProperty('effective')) {
    updateData['data.abilities.smell.-=effective'] = true
  }

  if (actorData.abilities.voice.hasOwnProperty('effective')) {
    updateData['data.abilities.voice.-=effective'] = true
  }

  if (actorData.abilities.hasOwnProperty('comliness')) {
    // Rename 'comliness' to 'comeliness'
    updateData['data.abilities.comeliness.base'] = actorData.abilities.comliness.base;
    updateData['data.abilities.-=comliness'] = null;
  }

  if (actorData.abilities.morality.hasOwnProperty('effective')) {
    updateData['data.abilities.morality.-=effective'] = true
  }

  if (!actorData.abilities.hasOwnProperty('endurance')) {
    updateData['data.abilities.endurance.base'] = 0;
  }

  if (!actorData.abilities.hasOwnProperty('speed')) {
    updateData['data.abilities.speed.base'] = 0;
  }

  if (!actorData.abilities.hasOwnProperty('touch')) {
    updateData['data.abilities.touch.base'] = 0;
  }

  if (!actorData.abilities.hasOwnProperty('frame')) {
    updateData['data.abilities.frame.base'] = 0;
  }

  if (actorData.hasOwnProperty('shockIndex')) {
    updateData['data.-=shockIndex'] = true
  }

  if (actorData.hasOwnProperty('dodge')) {
    updateData['data.-=dodge'] = true
  }

  if (actorData.hasOwnProperty('initiative')) {
    updateData['data.-=initiative'] = true
  }

  if (actorData.hasOwnProperty('endurance')) {
    updateData['data.-=endurance'] = true
  }

  if (actorData.move.hasOwnProperty('effective')) {
    updateData['data.move.-=effective'] = true
  }

  if (actorData.hasOwnProperty('universalPenalty')) {
    updateData['data.-=universalPenalty'] = true
  }

  if (actorData.hasOwnProperty('physicalPenalty')) {
    updateData['data.-=physicalPenalty'] = true
  }

  if (actorData.hasOwnProperty('totalInjuryLevels')) {
    updateData['data.-=totalInjuryLevels'] = true
  }

  if (actorData.hasOwnProperty('hasCondition')) {
    updateData['data.-=hasCondition'] = true
  }

  if (actorData.hasOwnProperty('encumbrance')) {
    updateData['data.-=encumbrance'] = true
  }

  if (actorData.hasOwnProperty('totalWeight')) {
    updateData['data.-=totalWeight'] = true
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
    if (!itemData.data.hasOwnProperty('squeeze')) {
      updateData['data.squeeze'] = 0;
    }

    if (!itemData.data.hasOwnProperty('tear')) {
      updateData['data.tear'] = 0;
    }
  }

  if (itemData.type === 'missilegear') {
    if (!itemData.data.range.hasOwnProperty('extreme64')) {
      updateData['data.range.extreme64'] = 0;
    }

    if (!itemData.data.range.hasOwnProperty('extreme128')) {
      updateData['data.range.extreme128'] = 0;
    }

    if (!itemData.data.range.hasOwnProperty('extreme256')) {
      updateData['data.range.extreme256'] = 0;
    }

    if (!itemData.data.impact.hasOwnProperty('extreme64')) {
      updateData['data.impact.extreme64'] = 0;
    }
  
    if (!itemData.data.impact.hasOwnProperty('extreme128')) {
      updateData['data.impact.extreme128'] = 0;
    }

    if (!itemData.data.impact.hasOwnProperty('extreme256')) {
      updateData['data.impact.extreme256'] = 0;
    }  
  }

  if (itemData.type === 'armorgear') {
    if (!itemData.data.protection.hasOwnProperty('squeeze')) {
      updateData['data.protection.squeeze'] = 0;
    }

    if (!itemData.data.protection.hasOwnProperty('tear')) {
      updateData['data.protection.tear'] = 0;
    }
  }

  if (itemData.type === 'armorlocation') {
    if (!itemData.data.hasOwnProperty('squeeze')) {
      updateData['data.squeeze'] = 0;
    }

    if (!itemData.data.hasOwnProperty('tear')) {
      updateData['data.tear'] = 0;
    }

    if (!itemData.data.probWeight.hasOwnProperty('arms')) {
      updateData['data.probWeight.arms'] = 1;
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
