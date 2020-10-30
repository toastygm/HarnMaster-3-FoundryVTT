/**
 * Perform a system migration for the entire World
 * @return {Promise}
 */
export async function migrateWorld() {
    ui.notifications.info(`Applying HM3 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    // Migrate World Actors
    for (let a of game.actors.entities ) {
        try {
            const updateData = migrateActorData(a.data);
            if (!isObjectEmpty(updateData)) {
                console.log(`Migrating Actor ${a.name}`);
                await a.update(updateData, {enforceTypes: false});
            }
        } catch(err) {
            console.error(err);
        }
    }

    // Migrate World Items
    for (let i of game.items.entities ) {
        try {
            const updateData = migrateItemData(i.data);
            if (!isObjectEmpty(updateData)) {
                console.log(`Migrating Item ${i.name}`);
                await i.update(updateData, {enforceTypes: false});
            }
        } catch(err) {
            console.error(err);
        }
    }

    // Migrate Scene Actor Tokens
    for (let s of game.scenes.entities ) {
        try {
            const updateData = migrateSceneData(i.data);
            if (!isObjectEmpty(updateData)) {
                console.log(`Migrating Scene ${s.name}`);
                await s.update(updateData, {enforceTypes: false});
            }
        } catch(err) {
            console.error(err);
        }
    }

    // Migrate World Compendium Packs
    const packs = game.packs.filter(p => {
        return (p.metadata.package === "world") && ["Actor", "Item", "Scene"].includes(p.metadata.entity);
    });
    for (let p of packs) {
        await migrateCompendium(p);
    }

    // Set migration as complete
    game.settings.set("hm3", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`HM3 System Migration to version ${game.system.data.version} completed!`, {permanent: true});  
};

export function migrateActorData(actor) {
    const updateData = {abilities: {}};

    // convert abilities
    Object.keys(actor.data.data.abilities).forEach(a => {
        const curValue = actor.data.data.abilities[a];
        updateData.abilities[a] = {base: curValue};
    });

    return updateData;
}