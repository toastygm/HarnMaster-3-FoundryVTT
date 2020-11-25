/**
 * Perform a system migration for the entire World
 * @return {Promise}
 */
export async function migrateWorld() {
    ui.notifications.info(`Applying HM3 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});
    console.log(`HM3 | Beginning Migration to version ${game.system.data.version}`);

    // Migrate World Actors
    for (let a of game.actors.entities ) {
        try {
            const updateData = await migrateActorData(a)
            if (updateData) {
                console.log(`HM3 | Migrating Actor ${a.name}`);
                console.log('HM3 | Changes: ' + JSON.stringify(updateData));
                // await i.update(updateData, {enforceTypes: false});
                await a.update(updateData);                
            }
        } catch(err) {
            console.error(err);
        }

    }

    // Migrate World Items
    for (let i of game.items.entities ) {
        try {
            const updateData = await migrateItemData(i.data);
            if (updateData) {
                console.log(`HM3 | Migrating Item ${i.name}`);
                console.log('HM3 | Changes: ' + JSON.stringify(updateData));
                // await i.update(updateData, {enforceTypes: false});
                await i.update(updateData);                
            }
        } catch(err) {
            console.error(err);
        }

        // Check if we need to convert skills from old
        // format to new format.

        switch(i.data.type) {
            case 'physicalskill':
                await convertToNewSkill(i, null, 'Physical');
                break;
            case 'commskill':
                await convertToNewSkill(i, null, 'Communication');
                break;
            case 'combatskill':
                await convertToNewSkill(i, null, 'Combat');
                break;
            case 'craftskill':
                await convertToNewSkill(i, null, 'Craft');
                break;
            case 'magicskill':
                await convertToNewSkill(i, null, 'Magic');
                break;
            case 'ritualskill':
                await convertToNewSkill(i, null, 'Ritual');
                break;
            case 'psionic':
                await convertToNewSkill(i, null, 'Psionic');
                break;
        }
    }

    // Migrate Scene Actor Tokens
    // for (let s of game.scenes.entities ) {
    //     try {
    //         const updateData = migrateSceneData(i.data);
    //         if (!isObjectEmpty(updateData)) {
    //             console.log(`Migrating Scene ${s.name}`);
    //             await s.update(updateData, {enforceTypes: false});
    //         }
    //     } catch(err) {
    //         console.error(err);
    //     }
    // }

    // Migrate World Compendium Packs
    // const packs = game.packs.filter(p => {
    //     return (p.metadata.package === 'world') && ['Actor', 'Item', 'Scene'].includes(p.metadata.entity);
    // });
    // for (let p of packs) {
    //     await migrateCompendium(p);
    // }

    // Set migration as complete
    game.settings.set('hm3', 'systemMigrationVersion', game.system.data.version);
    console.log(`HM3 | Completed migration to version ${game.system.data.version}`);
    ui.notifications.info(`HM3 System Migration to version ${game.system.data.version} completed!`, {permanent: true});  
};

export async function migrateActorData(actor) {
    const actorData = actor.data;

    // process items
    for (let i of actor.items) {
        let migrateData = migrateItemData(i.data);
        if (migrateData) {
            console.log(`HM3 | Migrated Actor ${actor.data.name}, Item ${i.data.name}`);
            try {
                await i.update(migrateData);
            } catch (err) {
                console.error(err);
            }
        }

        // Check if we need to convert skills from old
        // format to new format.

        switch(i.data.type) {
            case 'physicalskill':
                await convertToNewSkill(i, actor, 'Physical');
                break;
            case 'commskill':
                await convertToNewSkill(i, actor, 'Communication');
                break;
            case 'combatskill':
                await convertToNewSkill(i, actor, 'Combat');
                break;
            case 'craftskill':
                await convertToNewSkill(i, actor, 'Craft');
                break;
            case 'magicskill':
                await convertToNewSkill(i, actor, 'Magic');
                break;
            case 'ritualskill':
                await convertToNewSkill(i, actor, 'Ritual');
                break;
            // case 'psionic':
            //     await convertToNewSkill(i, actor, 'Psionic');
            //     break;
            case 'skill':
                if (i.data.data.type === 'Psionic') {
                    const updateData = {
                        "data.notes": i.data.data.notes,
                        "data.description": i.data.data.description,
                        "data.source": i.data.data.source,
                        "data.macro": "",
                        "data.skillBase.value": i.data.data.skillBase.value,
                        "data.skillBase.formula": i.data.data.skillbase.formula,
                        "data.skillBase.isFormulaValid": i.data.data.skillbase.isFormulaValid,
                        "data.masteryLevel": i.data.data.masteryLevel,
                        "data.effectiveMasteryLevel": i.data.data.effectiveMasteryLevel,
                        "data.improveFlag": false,
                        "data.fatigue": i.data.data.psionic.fatigue            
                    };

                    await actor.createOwnedItem({type: "psionic", name: i.data.name, data: updateData});
                    await actor.deleteOwnedItem(i.data._id);
                }
                break;
        }
    }

    const updateData = {};

    // In version 0.5.3 we converted from abilities being
    // numbers to objects containing base and effective
    // Guard against re-implementing the upgrade here
    if ((actorData.type === 'character' || actorData.type === 'creature')) {
        if (typeof actorData.data.abilities.strength != 'object') {
            updateData['data.abilities.strength.base'] = actorData.data.abilities.strength;
            updateData['data.abilities.stamina.base'] = actorData.data.abilities.stamina;
            updateData['data.abilities.dexterity.base'] = actorData.data.abilities.dexterity;
            updateData['data.abilities.agility.base'] = actorData.data.abilities.agility;
            updateData['data.abilities.intelligence.base'] = actorData.data.abilities.intelligence;
            updateData['data.abilities.aura.base'] = actorData.data.abilities.aura;
            updateData['data.abilities.will.base'] = actorData.data.abilities.will;
            updateData['data.abilities.eyesight.base'] = actorData.data.abilities.eyesight;
            updateData['data.abilities.hearing.base'] = actorData.data.abilities.hearing;
            updateData['data.abilities.smell.base'] = actorData.data.abilities.smell;
            updateData['data.abilities.voice.base'] = actorData.data.abilities.voice;
            updateData['data.abilities.comliness.base'] = actorData.data.abilities.comliness;
            updateData['data.abilities.morality.base'] = actorData.data.abilities.morality;

            updateData['data.abilities.strength.effective'] = 0;
            updateData['data.abilities.stamina.effective'] = 0;
            updateData['data.abilities.dexterity.effective'] = 0;
            updateData['data.abilities.agility.effective'] = 0;
            updateData['data.abilities.intelligence.effective'] = 0;
            updateData['data.abilities.aura.effective'] = 0;
            updateData['data.abilities.will.effective'] = 0;
            updateData['data.abilities.eyesight.effective'] = 0;
            updateData['data.abilities.hearing.effective'] = 0;
            updateData['data.abilities.smell.effective'] = 0;
            updateData['data.abilities.voice.effective'] = 0;
            updateData['data.abilities.comliness.effective'] = 0;
            updateData['data.abilities.morality.effective'] = 0;
        }

        if (typeof actorData.data.bioImage === 'undefined') {
            updateData['data.bioImage'] = 'systems/hm3/images/svg/knight-silhouette.svg';
        }

        if (typeof actorData.data.sunsign === 'undefined') {
            updateData['data.sunsign'] = '';
        }

        if (typeof actorData.data.species === 'undefined') {
            updateData['data.species'] = '';
        }

        if (typeof actorData.data.biography === 'undefined') {
            updateData['data.biography'] = '';
        }

        if (typeof actorData.data.shockIndex === 'undefined') {
            updateData['data.shockIndex'] = {'value': 100, 'max': 100};
        }

        if (actorData.data.endurance.max) {
            updateData['data.endurance'] = actorData.data.endurance.max;
        }
    }
    
    return updateData;
}

async function convertToNewSkill(i, actor, newType) {
    const oldData = i.data.data;

    const updateData = {
        "data.notes": oldData.notes,
        "data.description": oldData.description,
        "data.source": oldData.source,
        "data.type": newType,
        "data.skillBase.value": oldData.skillBase.value,
        "data.skillBase.formula": oldData.skillBase.formula,
        "data.skillBase.isFormulaValid": oldData.isFormulaValid,
        "data.masteryLevel": oldData.masteryLevel,
        "data.effectiveMasteryLevel": oldData.effectiveMasteryLevel,
        "data.ritual.piety": oldData.piety || 0,
        "data.psionic.fatigue": oldData.fatigue || 0,
        "data.psionic.time": ""
    };

    // Create the new skill
    if (actor) {
        await actor.createOwnedItem({type: "skill", name: i.data.name, data: updateData});
    } else {
        await Item.create({type: "skill", name: i.data.name, data: updateData});
    }

    // Delete the old skill
    if (actor) {
        await actor.deleteOwnedItem(i.data._id);
    } else {
        await Item.delete(i.data._id);
    }
}

export function migrateItemData(itemData) {
    const data = itemData.data;
    const updateData = {};

    // The next two blocks are essentially renaming the "note" object to "notes"
    if (typeof data.note != 'undefined') {
        updateData['data.notes'] = data.note || "";
        updateData['data.-=note'] = null;  // delete the note object;
    }

    if (typeof data.description === 'undefined') {
        updateData['data.description'] = "";
    }
    if (typeof data.source === 'undefined') {
        updateData['data.source'] = "";
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

        if (itemData.type === 'weapongear') {
            if (typeof data.weaponQuality === 'undefined') {
                updateData['data.weaponQuality'] = 0;
            }

            if (typeof data.attackModifier === 'undefined') {
                updateData['data.attackModifier'] = data.handMode;
                updateData['data.-=handMode'] = null;  // delete the handMode object;
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
        if (typeof data.skillBase != 'object') {
            const value = data.skillBase;
            updateData['data.skillBase.value'] = value;
            updateData['data.skillBase.formula'] = '';
            updateData['data.skillBase.isFormulaValid'] = true;
        }

        if (typeof data.psionic != 'undefined') {
            updateData['data.-=psionic'] = null;
        }

        if (typeof data.improveFlag === 'undefined') {
            updateData['data.improveFlag'] = false;
        }
    }

    return updateData;
}

export function migrateSceneData(scene) {
    const result = {};
    return result;
}

export function migrateCompendium(pack) {
    const result = {};
    return result;
}