// Import Modules
import { HarnMasterActor } from "./actor/actor.js";
import { HarnMasterCharacterSheet } from "./actor/character-sheet.js";
import { HarnMasterCreatureSheet } from "./actor/creature-sheet.js"
import { HarnMasterContainerSheet } from "./actor/container-sheet.js"
import { HarnMasterItem } from "./item/item.js";
import { HarnMasterItemSheet } from "./item/item-sheet.js";
import { HM3 } from "./config.js";
import { DiceHM3 } from "./dice-hm3.js";
import { registerSystemSettings } from "./settings.js";
import * as migrations from "./migrations.js";
import * as macros from "./macros.js";
import * as combat from "./combat.js";

Hooks.once('init', async function() {

  console.log(`HM3 | Initializing the HM3 Game System\n${HM3.ASCII}`);

  game.hm3 = {
    HarnMasterActor,
    HarnMasterItem,
    config: HM3,
    macros: macros,
    migrations: migrations
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@initiative",
    decimals: 2
  };

  CONFIG.HM3 = HM3;
  
  // Register system settings
  registerSystemSettings();

  // Define custom Entity classes
  CONFIG.Actor.entityClass = HarnMasterActor;
  CONFIG.Item.entityClass = HarnMasterItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("hm3", HarnMasterCharacterSheet, {
    types: ["character"], 
    makeDefault: true, 
    label: "Default HarnMaster Character Sheet"
  });
  Actors.registerSheet("hm3", HarnMasterCreatureSheet, {
    types: ["creature"], 
    makeDefault: true, 
    label: "Default HarnMaster Creature Sheet"
  });
  Actors.registerSheet("hm3", HarnMasterContainerSheet, {
    types: ["container"], 
    makeDefault: true, 
    label: "Default HarnMaster Container Sheet"
  });
 
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("hm3", HarnMasterItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
});

Hooks.on("renderChatMessage", (app, html, data) => {
  // Display action buttons
  console.log(`renderChatMessage`);
  combat.displayChatActionButtons(app, html, data);
});
Hooks.on('renderChatLog', (app, html, data) => HarnMasterActor.chatListeners(html));
Hooks.on('renderChatPopout', (app, html, data) => HarnMasterActor.chatListeners(html));

/**
 * Once the entire VTT framework is initialized, check to see if
 * we should perform a data migration.
 */
Hooks.once("ready", function() {
  // Determine whether a system migration is required
  const currentVersion = game.settings.get("hm3", "systemMigrationVersion");
  const NEEDS_MIGRATION_VERSION = "0.7.8";  // Anything older than this must be migrated

  let needMigration = currentVersion === null || (isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion));
  if ( needMigration && game.user.isGM ) {
    migrations.migrateWorld();
  }

  Hooks.on("hotbarDrop", (bar, data, slot) => macros.createHM3Macro(data, slot));
  HM3.ready = true;
});

// Since HM3 does not have the concept of rolling for initiative,
// this hook simply prepopulates the initiative value. This ensures
// that no die roll is needed.
Hooks.on('preCreateCombatant', (combat, combatant, options, id) => {
  if (!combatant.initiative) {
    let token = canvas.tokens.get(combatant.tokenId);
    combatant.initiative = token.actor.data.data.initiative;
  }
});


/*-------------------------------------------------------*/
/*            Handlebars FUNCTIONS                       */
/*-------------------------------------------------------*/
Handlebars.registerHelper("multiply", function(op1, op2) {
  return op1 * op2;
});
