export const registerSystemSettings = function () {
    // Track the system version which a migration was last applied

    game.settings.register("hm3", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: 0
    });

    game.settings.register("hm3", "weaponDamage", {
        name: "Weapon Damage",
        hint: "Enable optional combat rule that allows weapons to be damaged or destroyed on successful block",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("hm3", "bloodloss", {
        name: "Bloodloss",
        hint: "Enable optional combat rule that tracks bloodloss as an injury (partially implemented)",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("hm3", "combatAudio", {
        name: "Combat Sounds",
        hint: "Enable combat flavor sounds",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("hm3", "addInjuryToActorSheet", {
        name: "Weapon Damage",
        hint: "Automatically add injuries to actor sheet",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        choices: {
            "enable": "Add Injuries Automatically",
            "disable": "Don't Add Injuries Automatically",
            "ask": "Prompt User On Each Injury"
        }
    });

    game.settings.register("hm3", "amputation", {
        name: "Amputation",
        hint: "Enable optional combat rule that supports limb amputations",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });


    game.settings.register("hm3", "distanceUnits", {
        name: "Distance Units",
        hint: "What units should be used for range calculations",
        scope: "world",
        config: true,
        default: "scene",
        type: String,
        choices: {
            "scene": "Scene Units (e.g. feet)",
            "grid": "Grid Units (e.g. hexes or squares)"
        }
    });
};