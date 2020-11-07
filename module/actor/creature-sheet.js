import { HarnMasterBaseActorSheet } from "./base-actor-sheet.js";

/**
 * Extend the base HarnMasterBaseActorSheet with some very simple modifications
 * @extends {HarnMasterBaseActorSheet}
 */
export class HarnMasterCreatureSheet extends HarnMasterBaseActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["hm3", "sheet", "actor", "creature"],
      width: 660,
      height: 640,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profile" }]
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template()
  {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/hm3/templates/actor/creature-limited.html";
    } else {
      return "systems/hm3/templates/actor/creature-sheet.html";
    }
  }
}
