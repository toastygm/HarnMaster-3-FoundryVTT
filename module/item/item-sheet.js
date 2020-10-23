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
    } else if (this.item.data.type === 'weapongear') {
      // weapons need a list of combat skills; but, we
      // are going to ignore the 'Dodge' and 'Initiative' skills,
      // since you never want a weapon based on those skills.
      // Also, we add a "None" item to the front of the list
      // as a default (in case no other combat skill applies)
      data.combatSkills = ["None"];
      this.actor.itemTypes.combatskill.forEach(it => {
        const lcName = it.data.name.toLowerCase();
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

    // Roll handlers, click handlers, etc. would go here.
  }
}
