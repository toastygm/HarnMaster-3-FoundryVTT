/**
 * Perform a system migration for the entire World
 * @return {Promise}
 */
export async function migrateWorld() {
    ui.notifications.info(`Applying HM3 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    // Migrate World Actors
    for (let a of game.actors.entities ) {
        try {
            migrateActorData(a);
        } catch(err) {
            console.error(err);
        }
    }

    // Migrate World Items
    for (let i of game.items.entities ) {
        try {
            const updateData = migrateItemData(i.data);
            if (updateData != null) {
                console.log(`Migrating Item ${i.name}`);
                // await i.update(updateData, {enforceTypes: false});
                await i.update(updateData);                
            }
        } catch(err) {
            console.error(err);
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
    //     return (p.metadata.package === "world") && ["Actor", "Item", "Scene"].includes(p.metadata.entity);
    // });
    // for (let p of packs) {
    //     await migrateCompendium(p);
    // }

    // Set migration as complete
    game.settings.set("hm3", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`HM3 System Migration to version ${game.system.data.version} completed!`, {permanent: true});  
};

export async function migrateActorData(actor) {
    const actorData = actor.data;

    // For now, the only migrations are to migrate the owned items
    
    // process items
    for (let i of actor.items) {
        const migrateData = migrateItemData(i.data);
        if (migrateData != null) {
            console.log(`Migrating Actor ${actorData.name}, Item ${i.data.name}`);
            await i.update(migrateData);
        }
    }
}

export function migrateItemData(itemData) {
    const data = itemData.data;

    // migrate if needed
    if (itemData.type.endsWith('gear')) {
        if (typeof data.isEquipped === 'undefined') {
            data.isEquipped = false;
            data.isCarried = true;
        }
    
        if (itemData.type === 'armorlocation') {
            if (typeof data.protection === 'undefined') {
            data.protection = {
                "blunt": 0,
                "edged": 0,
                "piercing": 0,
                "fire": 0
            };
            data.locations = [];
            }
        }

        return itemData;
    }

    return null;
}

export function migrateSceneData(scene) {
    const result = {};
    return result;
}

export function migrateCompendium(pack) {
    const result = {};
    return result;
}