export const registerSystemSettings = function () {
    // Track the system version which a migration was last applied

    game.settings.register("hm3", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: game.system.data.version
    });
};