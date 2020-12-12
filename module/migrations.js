/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function() {
    ui.notifications.info(`Applying HM3 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});
  
    // Migrate World Actors
    for ( let a of game.actors.entities ) {
      try {
        const updateData = migrateActorData(a.data);
        if ( !isObjectEmpty(updateData) ) {
          console.log(`HM3 | Migrating Actor entity ${a.name}`);
          await a.update(updateData, {enforceTypes: false});
        }
      } catch(err) {
        console.error(err);
      }
    }
  
    // Migrate World Items
    for ( let i of game.items.entities ) {
      try {
        const updateData = migrateItemData(i.data);
        if ( !isObjectEmpty(updateData) ) {
          console.log(`HM3 | Migrating Item entity ${i.name}`);
          await i.update(updateData, {enforceTypes: false});
        }
      } catch(err) {
        console.error(err);
      }
    }
  
    // Migrate Actor Override Tokens
    for ( let s of game.scenes.entities ) {
      try {
        const updateData = migrateSceneData(s.data);
        if ( !isObjectEmpty(updateData) ) {
          console.log(`HM3 | Migrating Scene entity ${s.name}`);
          await s.update(updateData, {enforceTypes: false});
        }
      } catch(err) {
        console.error(err);
      }
    }
  
    // Migrate World Compendium Packs
    const packs = game.packs.filter(p => {
      return (p.metadata.package === "world") && ["Actor", "Item", "Scene"].includes(p.metadata.entity)
    });
    for ( let p of packs ) {
      await migrateCompendium(p);
    }
  
    // Set the migration as complete
    game.settings.set("hm3", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`HM3 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
  };
  
  /* -------------------------------------------- */
  
  /**
   * Apply migration rules to all Entities within a single Compendium pack
   * @param pack
   * @return {Promise}
   */
  export const migrateCompendium = async function(pack) {
    const entity = pack.metadata.entity;
    if ( !["Actor", "Item", "Scene"].includes(entity) ) return;
  
    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const content = await pack.getContent();
  
    // Iterate over compendium entries - applying fine-tuned migration functions
    for ( let ent of content ) {
      try {
        let updateData = null;
        if (entity === "Item") updateData = migrateItemData(ent.data);
        else if (entity === "Actor") updateData = migrateActorData(ent.data);
        else if ( entity === "Scene" ) updateData = migrateSceneData(ent.data);
        if (!isObjectEmpty(updateData)) {
          expandObject(updateData);
          updateData["_id"] = ent._id;
          await pack.updateEntity(updateData);
          console.log(`HM3 | Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
        }
      } catch(err) {
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
  export const migrateActorData = function(actor) {
    const updateData = {};
    const actorData = actor.data;
  
    // Actor Data Updates
    /*
    * -------- ACTOR UPDATES GO HERE -------------
    */

    //_migrateActorBonuses(actor, updateData);
    if ((actorData.type === 'character' || actorData.type === 'creature')) {
        if (typeof actorData.data.shockIndex === 'undefined') {
            updateData['data.shockIndex'] = {'value': 100, 'max': 100};
        }

        if (actorData.data.endurance.max) {
            updateData['data.endurance'] = actorData.data.endurance.max;
        }

        if (typeof actorData.data.macros === 'undefined') {
            updateData['data.macros'] = {}
        }
    } else if (actorData.type === 'container') {
      updateData['data.capacity.max'] = 0;
      updateData['data.capacity.value'] = 0;
    }

    // Remove deprecated fields
    _migrateRemoveDeprecated(actor, updateData);
  
    // Migrate Owned Items
    if ( !actor.items ) return updateData;
    let hasItemUpdates = false;
    const items = actor.items.map(i => {
  
      // Migrate the Owned Item
      let itemUpdate = migrateItemData(i);
  
      // Prepared, Equipped, and Proficient for NPC actors (5e)
    //   if ( actor.type === "npc" ) {
    //     if (getProperty(i.data, "preparation.prepared") === false) itemUpdate["data.preparation.prepared"] = true;
    //     if (getProperty(i.data, "equipped") === false) itemUpdate["data.equipped"] = true;
    //     if (getProperty(i.data, "proficient") === false) itemUpdate["data.proficient"] = true;
    //   }
  
      // Update the Owned Item
      if ( !isObjectEmpty(itemUpdate) ) {
        hasItemUpdates = true;
        return mergeObject(i, itemUpdate, {enforceTypes: false, inplace: false});
      } else return i;
    });
    if ( hasItemUpdates ) updateData.items = items;
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
    if ( actorData.flags.hm3 ) {
      actorData.flags.hm3 = filterObject(actorData.flags.hm3, allowedFlags);
    }
  
    // Return the scrubbed data
    return actorData;
  }
  
  
  /* -------------------------------------------- */
  
  /**
   * Migrate a single Item entity to incorporate latest data model changes
   * @param item
   */
  export const migrateItemData = function(item) {
    const updateData = {};
    const data = item.data;
    const itemData = item;
  
    /*
    * -------- ITEM UPDATES GO HERE -------------
    */
   if (typeof data.macro !== 'undefined') {
    updateData['data.macro._deprecated'] = true;
    }

    if (typeof data.macros === 'undefined') {
        updateData['data.macros'] = {}
    }

    if (itemData.type.endsWith('gear')) {
        if (typeof data.isEquipped === 'undefined') {
            updateData['data.isEquipped'] = true;
        }
        if (typeof data.isCarried === 'undefined') {
            updateData['data.isCarried'] = true;
        }
        if (typeof data.value === 'undefined') {
            updateData['data.value'] = 0;
        }
        if (typeof data.arcane === 'undefined') {
            updateData['data.arcane.isArtifact'] = false;
            updateData['data.arcane.isAttuned'] = false;
            updateData['data.arcane.charges'] = -1;
            updateData['data.arcane.ego'] = 0;
        }

        if (typeof data.container === 'undefined') {
            updateData['data.container'] = 'on-person';
        }

        if (itemData.type === 'weapongear') {
            if (typeof data.weaponQuality === 'undefined') {
                updateData['data.weaponQuality'] = 0;
            }

            if (typeof data.attackModifier === 'undefined') {
                updateData['data.attackModifier'] = data.handMode;
                updateData['data.handMode._deprecated'] = true;  // delete the handMode object;
            }
        } else if (itemData.type === 'missilegear') {
            if (typeof data.weaponQuality === 'undefined') {
                updateData['data.weaponQuality'] = 0;
            }

            if (typeof data.attackModifier === 'undefined') {
                updateData['data.attackModifier'] = 0;
            }
        }

        // starting in 0.7.0, armor now has a size attribute that defaults to '6'
        if (itemData.type === 'armorgear') {
            if (typeof data.size === 'undefined') {
                updateData['data.size'] = 6;
            }
        }
    }

    if (itemData.type === 'armorlocation') {
        if (typeof data.protection === 'undefined') {
            updateData['data.protection.blunt'] = 0;
            updateData['data.protection.edged'] = 0;
            updateData['data.protection.piercing'] = 0;
            updateData['data.protection.fire'] = 0;
            updateData['data.locations'] = [];
        }
    }

    if (itemData.type === 'skill' || itemData.type === 'psionic') {
        if (typeof data.skillBase !== 'object') {
            const value = data.skillBase;
            updateData['data.skillBase.value'] = value;
            updateData['data.skillBase.formula'] = '';
            updateData['data.skillBase.isFormulaValid'] = true;
        }

        if (typeof data.psionic !== 'undefined') {
            updateData['data.psionic._deprecated'] = true;
        }

        if (typeof data.improveFlag === 'undefined') {
            updateData['data.improveFlag'] = false;
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
  export const migrateSceneData = function(scene) {
    const tokens = duplicate(scene.tokens);
    return {
      tokens: tokens.map(t => {
        if (!t.actorId || t.actorLink || !t.actorData.data) {
          t.actorData = {};
          return t;
        }
        const token = new Token(t);
        if ( !token.actor ) {
          t.actorId = null;
          t.actorData = {};
        } else if ( !t.actorLink ) {
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
  const _migrateRemoveDeprecated = function(ent, updateData) {
    const flat = flattenObject(ent.data);
  
    // Identify objects to deprecate
    const toDeprecate = Object.entries(flat).filter(e => e[0].endsWith("_deprecated") && (e[1] === true)).map(e => {
      let parent = e[0].split(".");
      parent.pop();
      return parent.join(".");
    });
  
    // Remove them
    for ( let k of toDeprecate ) {
      let parts = k.split(".");
      parts[parts.length-1] = "-=" + parts[parts.length-1];
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
      return flagshm3 ? {hm3: flagshm3} : {};
    };
    await pack.configure({locked: false});
    const content = await pack.getContent();
    for ( let entity of content ) {
      const update = {_id: entity.id, flags: cleanFlags(entity.data.flags)};
      if ( pack.entity === "Actor" ) {
        update.items = entity.data.items.map(i => {
          i.flags = cleanFlags(i.flags);
          return i;
        })
      }
      await pack.updateEntity(update, {recursive: false});
      console.log(`HM3 | Purged flags from ${entity.name}`);
    }
    await pack.configure({locked: true});
  }
