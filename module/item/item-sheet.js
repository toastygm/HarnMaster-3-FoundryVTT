import { onManageActiveEffect } from '../effect.js';

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
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "properties" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/hm3/templates/item";
    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.HM3;
    data.itemType = this.item.data.type;
    data.hasActor = this.actor && true;
    data.hasCombatSkills = false;
    data.hasRitualSkills = false;
    data.hasMagicSkills = false;

    data.containers = { 'On Person': 'on-person' };
    // Containers are not allowed in other containers.  So if this item is a container,
    // don't show any other containers.

    if (this.actor && this.item.data.type !== 'containergear') {
      this.actor.items.forEach(it => {
        if (it.type === 'containergear') {
          data.containers[it.name] = it.id;
        }
      });
    }

    // Fill appropriate lists for individual item sheets
    if (this.item.data.type === 'spell') {
      // Spells need a list of convocations
      data.convocations = [];
      if (this.actor) {
        this.actor.itemTypes.skill.forEach(it => {
          if (it.data.data.type === 'Magic') {
            data.convocations.push(it.data.name);
            data.hasMagicSkills = true;
          }
        });
      }
    } else if (this.item.data.type === 'invocation') {
      // Invocations need a list of dieties
      data.dieties = [];
      if (this.actor) {
        this.actor.itemTypes.skill.forEach(it => {
          if (it.data.data.type === 'Ritual') {
            data.dieties.push(it.data.name);
            data.hasRitualSkills = true;
          }
        });
      }
    } else if (this.item.data.type === 'weapongear' ||
      this.item.data.type === 'missilegear') {

      // Weapons need a list of combat skills
      data.combatSkills = [];

      if (this.actor) {
        if (this.item.data.type === 'weapongear') {
          // For weapons, we add a "None" item to the front of the list
          // as a default (in case no other combat skill applies)
          data.combatSkills.push('None');
        } else {
          // For missiles, we add the "Throwing" skill to the front
          // of the list as a default (in case no other combat
          // skill applies)
          data.combatSkills.push('Throwing');
        }

        this.actor.itemTypes.skill.forEach(it => {
          if (it.data.data.type === 'Combat') {
            const lcName = it.data.name.toLowerCase();
            // Ignore the 'Dodge' and 'Initiative' skills,
            // since you never want a weapon based on those skills.
            if (!(lcName === 'initiative' || lcName === 'dodge')) {
              data.combatSkills.push(it.data.name);
              data.hasCombatSkills = true;
            }
          }
        });
      }
    }

    // get active effects.
    data.effects = {};
    this.item.effects.forEach(effect => {
      data.effects[effect.id] = {
        id: effect.id,
        duration: effect.duration,
        name: effect.data.label,
        source: effect.source,
        data: effect.data
      };
    });

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

    html.on("click", "input[type='text']", ev => {
      ev.currentTarget.select();
    });

    html.on("keypress", ".properties", ev => {
      var keycode = (ev.keyCode ? ev.keyCode : ev.which);
      if (keycode == '13') {
        super.close();
      }
    });

    html.find(".effect-control").click(ev => {
      if ( this.item.isOwned ) return ui.notifications.warn("Managing Active Effects within an Owned Item is not supported.")
      onManageActiveEffect(ev, this.item)
    });

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
    return this.item.update({ "data.locations": locations });
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
    return this.item.update({ "data.locations": locations });
  }
}
