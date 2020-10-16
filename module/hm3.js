// Import Modules
import { HarnMasterActor } from "./actor/actor.js";
import { HarnMasterActorSheet } from "./actor/actor-sheet.js";
import { HarnMasterItem } from "./item/item.js";
import { HarnMasterItemSheet } from "./item/item-sheet.js";
import { HM3 } from "./config.js";

Hooks.once('init', async function() {

  console.log(`HM3 | Initializing the HM3 Game System\n${HM3.ASCII}`);

  game.hm3 = {
    HarnMasterActor,
    HarnMasterItem,
    config: HM3
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
  
  // Define custom Entity classes
  CONFIG.Actor.entityClass = HarnMasterActor;
  CONFIG.Item.entityClass = HarnMasterItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("hm3", HarnMasterActorSheet, { makeDefault: true });
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