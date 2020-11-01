/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class HarnMasterItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["hm3", "sheet", "item"],
      width: 530,
      height: 550,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/hm3/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    let type = `${this.item.data.type}`;

    if (type.endsWith('skill')) {
      return path + '/skill-sheet.html';
    }

    return path + '/' + type + '-sheet.html';
    //return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.HM3;
    data.itemType = this.item.data.type;

    // Fill appropriate lists for individual item sheets
    if (this.item.data.type === 'spell') {
      // Spells need a list of convocations
      data.convocations = [];
      this.actor.itemTypes.magicskill.forEach(it => {
        data.convocations.push(it.data.name);
      });
    } else if (this.item.data.type === 'invocation') {
      // Invocations need a list of dieties
      data.dieties = [];
      this.actor.itemTypes.ritualskill.forEach(it => {
        data.dieties.push(it.data.name);
      });
    } else if (this.item.data.type === 'weapongear' ||
              this.item.data.type === 'missilegear') {
      
      // Weapons need a list of combat skills

      if (this.item.data.type === 'weapongear') {
        // For weapons, we add a "None" item to the front of the list
        // as a default (in case no other combat skill applies)
        data.combatSkills = ["None"];
      } else {
        // For missiles, we add the "Throwing" skill to the front
        // of the list as a default (in case no other combat
        // skill applies)
        data.combatSkills = ["Throwing"];
      }

      this.actor.itemTypes.combatskill.forEach(it => {
        const lcName = it.data.name.toLowerCase();
        // Ignore the 'Dodge' and 'Initiative' skills,
        // since you never want a weapon based on those skills.
        if (!(lcName === 'initiative' || lcName === 'dodge')) {
          data.combatSkills.push(it.data.name);
        }
      });
    }
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. go here.

    // Add Inventory Item
    html.find('.armorgear-location-add').click(this._armorgearLocationAdd.bind(this));

    // Delete Inventory Item
    html.find('.armorgear-location-delete').click(this._armorgearLocationDelete.bind(this));
  }

  async _armorgearLocationAdd(event) {
    const dataset = event.currentTarget.dataset;
    const data = this.item.data.data;
    
    await this._onSubmit(event);  // Submit any unsaved changes

    // Clone the existing locations list if it exists, otherwise set to empty array
    let locations = [];
    if (typeof data.locations != 'undefined') {
      locations = [...data.locations];
    }

    // Only add location to list if it is unique
    if (locations.indexOf(dataset.location) === -1) {
      locations.push(dataset.location);
    }

    // Update the list on the server
    return this.item.update({"data.locations": locations});
  }

  async _armorgearLocationDelete(event) {
    const dataset = event.currentTarget.dataset;
    const data = this.item.data.data;
    
    await this._onSubmit(event);   // Submit any unsaved changes

    // Clone the location list (we don't want to touch the actual list)
    let locations = [...data.locations];

    // find the index of the item to remove, and if found remove it from list
    let removeIndex = locations.indexOf(dataset.location);
    if (removeIndex >= 0) {
      locations.splice(removeIndex, 1);
    }

    // Update the list on the server
    return this.item.update({"data.locations": locations});
  }
}
