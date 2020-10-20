import { DiceHM3 } from "../dice-hm3.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class HarnMasterCharacterSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["hm3", "sheet", "actor", "character-sheet"],
      width: 650,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profile" }]
    });
  }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template()
  {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/hm3/templates/actor/character-limited.html";
    } else {
      return "systems/hm3/templates/actor/character-sheet.html";
    }
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.HM3;
    data.dtypes = ["String", "Number", "Boolean"];
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Standard 1d100 vs. target number (asks for optional modifier)
    html.find('.std-roll').click(this._onStdRoll.bind(this));

    // Standard 1d100 vs. target number (asks for optional modifier)
    html.find('.d6-roll').click(this._onD6Roll.bind(this));

    // Custom roll, specifying Roll Template
    // html.find('.custom-roll').click(this._onCustomRoll.bind(this));
    // standard Roll  1d100 vs. EML (data-eml) for Label (data-label) (skill, weapon-attack, weapon-defense, healing, spell, invocation, psionic)
    // skill-roll 1d100 vs Skill EML
    // dodge-roll 1d100 vs. Dodge Skill
    // shock-roll (#IL of d6) vs. Endurance
    // stumble-roll 3d6+PP vs. Agility
    // fumble-roll 1d100 vs. (Dex * 5)-PP
    // damage-roll (# of d6 + weapon mod)
    // weapon-attack-roll 1d100 vs. AML
    // weapon-defense-roll 1d100 vs. DML
    // healing-roll 1d100 vs. HRxEndurance
    // spell-roll 1d100 vs. CML
    // invocation-roll 1d100 vs. RML
    // psionic-roll 1d100 vs. EML
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle standard clickable rolls.  A "standard" roll is a 1d100
   * roll vs. some target value, with success being less than or equal
   * to the target value.
   * 
   * data-target = target value
   * data-label = Label Text (will print "Test against <label text>")
   * 
   * @param {Event} event 
   */
  _onStdRoll(event) {
    event.preventDefault();
    let fastforward = event.shiftKey || event.altKey || event.ctrlKey;

    this.actor.stdRoll(event.currentTarget.dataset.label, {
      target: Number(event.currentTarget.dataset.target),
      fastforward: fastforward
    });
  }

  /**
   * Handle d6 rolls.  A "d6" roll is a roll of multiple d6 dice vs.
   * some target value, with success being less than or equal
   * to the target value.
   * 
   * data-numdice = number of d6 to roll
   * data-target = target value
   * data-label = Label Text (will print "Test against <label text>")
   * 
   * @param {Event} event 
   */
  _onD6Roll(event) {
    event.preventDefault();
    let fastforward = event.shiftKey || event.altKey || event.ctrlKey;

    this.actor.d6Roll(event.currentTarget.dataset.label, {
      target: Number(event.currentTarget.dataset.target),
      numdice: Number(event.currentTarget.dataset.numdice),
      fastforward: fastforward
    });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

}
