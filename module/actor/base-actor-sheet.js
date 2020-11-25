import { DiceHM3 } from "../dice-hm3.js";
import { HM3 } from "../config.js";
//import { ImportArmorGear } from "../import-armor.js";
//import { ImportFFF } from "../import-char.js";
import * as utility from '../utility.js';
import * as macros from '../macros.js';

/**
 * Extend the basic ActorSheet with some common capabilities
 * @extends {ActorSheet}
 */
export class HarnMasterBaseActorSheet extends ActorSheet {

    /** @override */
    getData() {
        const data = super.getData();
        data.config = CONFIG.HM3;
        data.dtypes = ["String", "Number", "Boolean"];
        return data;
    }

    /** @override */
    async _onDropItem(event, data) {
        // NOTE: when an item comes from the item list or a compendium, its type is
        // "Item" but it does not have a "data" element.  So we have to check for that in
        // the following conditional; "data.data.type" may not exist!
        if (data.actorId === this.actor._id || !data.data || !data.data.type.endsWith("gear")) {
            return super._onDropItem(event, data);
        }

        // At this point we know this dropped item comes from another actor,
        // and it is some sort of "gear". Go ahead and process the drop, but
        // track the result.

        const quantity = data.data.data.quantity;

        // Source quantity really should never be 0 or negative; if so, just decline
        // the drop request.
        if (quantity <= 0) return false;

        if (quantity > 1) {
            // Ask how many to move
            return await this._moveQtyDialog(event, data);
        } else {
            return await this._moveItems(data, 1);
        }
    }

    async _moveQtyDialog(event, data) {
        const sourceActor = await game.actors.get(data.actorId);

        // Render modal dialog
        let dlgTemplate = "systems/hm3/templates/dialog/item-qty.html";
        let dialogData = {
            itemName: data.data.name,
            sourceName: sourceActor.data.name,
            targetName: this.actor.data.name,
            maxItems: data.data.data.quantity,
        };

        const html = await renderTemplate(dlgTemplate, dialogData);

        // Create the dialog window
        return Dialog.prompt({
            title: "Move Items",
            content: html,
            label: "OK",
            callback: async (html) => {
                const form = html.querySelector('#items-to-move');
                const fd = new FormDataExtended(form);
                const formdata = fd.toObject();
                let formQtyToMove = parseInt(formdata.itemstomove);

                if (formQtyToMove <= 0) {
                    return false;
                } else {
                    return await this._moveItems(data, formQtyToMove);
                }
            },
            options: { jQuery: false }
        });
    }

    async _moveItems(data, moveQuantity) {
        const sourceName = data.data.name;
        const sourceType = data.data.type;
        const sourceQuantity = data.data.data.quantity;

        // Look for a similar item locally
        let result = null;
        for (let it of this.actor.items.values()) {
            if (it.data.type === sourceType && it.data.name === sourceName) {
                result = it;
                break;
            }
        }

        if (result) {
            // update quantity
            const newTargetQuantity = result.data.data.quantity + moveQuantity;
            await result.update({ 'data.quantity': newTargetQuantity });
        } else {
            // Create an item
            const item = await Item.fromDropData(data);
            const itemData = duplicate(item.data);
            itemData.data.quantity = moveQuantity;
            result = await this.actor.createOwnedItem(itemData);
        }

        if (result) {
            const sourceActor = await game.actors.get(data.actorId);
            if (moveQuantity >= data.data.data.quantity) {
                await sourceActor.deleteOwnedItem(data.data._id);
            } else {
                const newSourceQuantity = sourceQuantity - moveQuantity;
                const sourceItem = await sourceActor.getOwnedItem(data.data._id);
                await sourceItem.update({ 'data.quantity': newSourceQuantity });
            }
        }
        return result;
    }

    /** @override */
    async _onDropItemCreate(data) {
        const actor = this.actor;
        if (!actor.owner) return false;
        //const item = await Item.fromDropData(data);

        if (!data.type.endsWith("gear")) {
            for (let it of actor.items.values()) {
                // Generally, if the items have the same type and name,
                // then merge the dropped item onto the existing item.
                if (it.data.type === data.type && it.data.name === data.name) {
                    this.mergeItem(it, data);

                    // Don't actually allow the new item
                    // to be created.
                    return false;
                }
            }
            return this._createItem(data.name, data.type, data.data);
        }

        return super._onDropItemCreate(data);
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
        html.find('.item-delete').click(this._onItemDelete.bind(this));

        // Standard 1d100 Skill Roll
        html.find('.skill-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.skillRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Standard 1d100 Spell Casting Roll
        html.find('.spell-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.castSpellRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Standard 1d100 Ritual Invocation Roll
        html.find('.invocation-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.invokeRitualRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Standard 1d100 Psionic Talent Roll
        html.find('.psionic-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.usePsionicRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // d6 Ability Score Roll
        html.find('.ability-d6-roll').click(ev => {
            const ability = ev.currentTarget.dataset.ability;
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            macros.testAbilityD6Roll(ability, fastforward, this.actor)
        });

        // d100 Ability Score Roll
        html.find('.ability-d100-roll').click(ev => {
            const ability = ev.currentTarget.dataset.ability;
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            macros.testAbilityD100Roll(ability, fastforward, this.actor)
        });

        // Weapon Damage Roll
        html.find('.weapon-damage-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            macros.weaponDamageRoll(`Item$${itemId}`, this.actor);
        });

        // Missile Damage Roll
        html.find('.missile-damage-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            macros.missileDamageRoll(`Item$${itemId}`, this.actor);
        });

        // Weapon Attack Roll
        html.find('.weapon-attack-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.weaponAttackRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Weapon Defend Roll
        html.find('.weapon-defend-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.weaponDefendRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Missile Attack Roll
        html.find('.missile-attack-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            macros.missileAttackRoll(`Item$${itemId}`, this.actor);
        });

        // Injury Roll
        html.find('.injury-roll').click(ev => macros.injuryRoll(this.actor));

        // Healing Roll
        html.find('.healing-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const fastforward = ev.shiftKey || ev.altKey || ev.ctrlKey;
            const itemId = li.data('itemId');
            macros.healingRoll(`Item$${itemId}`, fastforward, this.actor);
        });

        // Dodge Roll
        html.find('.dodge-roll').click(ev => macros.dodgeRoll(ev.shiftKey || ev.altKey || ev.ctrlKey, this.actor));

        // Shock Roll
        html.find('.shock-roll').click(ev => macros.shockRoll(ev.shiftKey || ev.altKey || ev.ctrlKey, this.actor));

        // Stumble Roll
        html.find('.stumble-roll').click(ev => macros.stumbleRoll(ev.shiftKey || ev.altKey || ev.ctrlKey, this.actor));

        // Fumble Roll
        html.find('.fumble-roll').click(ev => macros.fumbleRoll(ev.shiftKey || ev.altKey || ev.ctrlKey, this.actor));

        // Generic Damage Roll
        html.find('.damage-roll').click(ev => macros.genericDamageRoll(this.actor));

        // Toggle carry state
        html.find('.item-carry').click(this._onToggleCarry.bind(this));

        // Toggle equip state
        html.find('.item-equip').click(this._onToggleEquip.bind(this));

        // Toggle improve state
        html.find('.item-improve').click(this._onToggleImprove.bind(this));
    }

    /* -------------------------------------------- */

    async _onItemDelete(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;
        const data = duplicate(header.dataset);
        const li = $(header).parents(".item");

        const title = `Delete ${data.label}`;

        // Create the dialog window
        let agree = false;
        await Dialog.confirm({
            title: title,
            content: '<p>Are you sure?</p>',
            yes: () => agree = true
        });

        if (agree) {
            this.actor.deleteOwnedItem(li.data("itemId"));
            li.slideUp(200, () => this.render(false));
        }
    }

    async mergeItem(item, other) {
        if (item.data.type != other.type) {
            return;
        }

        const data = item.data.data;
        const otherData = other.data;
        const updateData = {};

        if (!data.notes) data.notes = otherData.notes;
        if (!data.source) data.source = otherData.source;
        if (!data.description) data.description = otherData.description;
        if (!data.macro) data.macro = otherData.macro;

        switch (item.data.type) {
            case 'skill':
                // If the skill types don't match, return without change
                if (data.type != otherData.type) {
                    return;
                }

                // NOTE: We never copy over the skillbase value or
                // the Piety value, those must always be set in the
                // actor's sheet.

                // If the skillbase is blank, copy it over from dropped item
                if (!data.skillBase.formula) {
                    updateData['data.skillBase.formula'] = otherData.skillBase.formula;
                    updateData['data.skillBase.isFormulaValid'] = otherData.skillBase.isFormulaValid;
                }
                break;

            case 'spell':
                updateData['data.convocation'] = otherData.convocation;
                updateData['data.level'] = otherData.level;
                break;

            case 'invocation':
                updateData['data.diety'] = otherData.diety;
                updateData['data.circle'] = otherData.circle;
                break;

            case 'psionic':
                updateData['data.circle.skillBase.formula'] = otherData.skillBase.formula;
                updateData['data.circle.skillBase.isFormulaValid'] = otherData.skillBase.isFormulaValid;
        }

        if (updateData) {
            await item.update(updateData);
        }

        return;
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Grab any data associated with this control.
        const dataset = duplicate(header.dataset);


        // Initialize a default name.
        let name = 'New Item';
        if (dataset.type === 'skill' && dataset.skilltype) {
            name = utility.createUniqueName(`New ${dataset.skilltype} Skill`, this.actor.itemTypes.skill);
        } else {
            switch (dataset.type) {
                case "weapongear":
                    name = utility.createUniqueName('New Weapon', this.actor.itemTypes.weapongear);
                    break;

                case "missilegear":
                    name = utility.createUniqueName('New Missile', this.actor.itemTypes.missilegear);
                    break;

                case "armorgear":
                    name = utility.createUniqueName('New Armor Item', this.actor.itemTypes.armorgear);
                    break;

                case "miscgear":
                    name = utility.createUniqueName('New Item', this.actor.itemTypes.miscgear);
                    break;

                case "armorlocation":
                    name = utility.createUniqueName('New Location', this.actor.itemTypes.armorlocation);
                    break;

                case "injury":
                    name = utility.createUniqueName('New Injury', this.actor.itemTypes.injury);
                    break;

                case "spell":
                    name = utility.createUniqueName('New Spell', this.actor.itemTypes.spell);
                    break;

                case "invocation":
                    name = utility.createUniqueName('New Invocation', this.actor.itemTypes.invocation);
                    break;

                case "psionic":
                    name = utility.createUniqueName('New Psionic', this.actor.itemTypes.psionic);
                    break;

                default:
                    console.error(`HM3 | Can't create item: unknown item type '${type}'`);
                    return null;
            }

        }

        // Item Data
        const itemData = duplicate(game.system.model.Item[dataset.type]);
        if (dataset.type === 'skill') itemData.type = dataset.skilltype;

        // Render modal dialog
        let dlgTemplate = "systems/hm3/templates/dialog/create-item.html";
        let dialogData = {
            type: dataset.type,
            title: name,
            placeholder: name,
            extraList: [],
            extraLabel: null,
            data: itemData
        };

        const html = await renderTemplate(dlgTemplate, dialogData);

        // Create the dialog window
        return Dialog.prompt({
            title: dialogData.title,
            content: html,
            label: "Create",
            callback: async (html) => {
                const form = html.querySelector('#create-item');
                const fd = new FormDataExtended(form);
                const formdata = fd.toObject();
                let itemName = formdata.name;
                let extraValue = formdata.extra_value;

                if (dialogData.type === 'spell') {
                    dialogData.data.convocation = extraValue;
                } else if (dialogData.type === 'invocation') {
                    dialogData.data.diety = extraValue;
                }

                return this._createItem(itemName, dialogData.type, dialogData.data);
            },
            options: { jQuery: false }
        });
    }

    async _createItem(name, type, data) {
        // If a weapon or a missile, get the associated skill
        if (type === 'weapongear' || type === 'missilegear') {
            data.assocSkill = utility.getAssocSkill(name, this.actor.itemTypes.skill, 'None');
        }

        // If it is a spell, initialize the convocation to the
        // first magic skill found; it is really unimportant what the
        // value is, so long as it is a valid skill for this character
        if (type === 'spell') {
            for (let skill of this.actor.itemTypes.skill.values()) {
                if (skill.data.data.type === 'Magic') {
                    data.convocation = skill.data.name;
                    break;
                }
            }
        }

        // If it is a invocation, initialize the diety to the
        // first ritual skill found; it is really unimportant what the
        // value is, so long as it is a valid skill for this character
        if (type === 'invocation') {
            for (let skill of this.actor.itemTypes.skill.values()) {
                if (skill.data.data.type === 'Ritual') {
                    data.diety = skill.data.name;
                    break;
                }
            }
        }

        // Guess the icon from the name
        let img = utility.getImagePath(name);
        if (img === CONFIG.DEFAULT_TOKEN) {
            switch (type) {
                case 'skill':
                    if (data.type === 'Ritual') {
                        img = utility.getImagePath('circle');
                    } else if (data.type === 'Magic') {
                        img = utility.getImagePath('pentacle');
                    }
                    break;

                case 'psionic':
                    img = utility.getImagePath("psionics");
                    break;
                    
                case 'spell':
                    img = utility.getImagePath(data.convocation);
                    if (img === CONFIG.DEFAULT_TOKEN) {

                        img = utility.getImagePath("pentacle");
                    }
                    break;

                case 'invocation':
                    img = utility.getImagePath(data.diety);
                    if (img === CONFIG.DEFAULT_TOKEN) {
                        img = utility.getImagePath("circle");
                    }
                    break;

                case 'miscgear':
                    img = utility.getImagePath("miscgear")
                    break;

                case 'weapongear':
                case 'missilegear':
                    img = utility.getImagePath(data.assocSkill)
                    break;
            }
        }

        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data,
            img: img
        };

        // Finally, create the item!
        const result = await this.actor.createOwnedItem(itemData);

        if (!result) {
            log.error(`HM3 | Error creating item '${name}' of type '${type}' on character '${this.actor.data.name}'`)
            return null;
        }

        // Bring up edit dialog to complete creating item
        const item = this.actor.getOwnedItem(result._id);
        item.sheet.render(true);

        return result;
    }

    /**
     * Handle toggling the carry state of an Owned Item within the Actor
     * @param {Event} event   The triggering click event
     * @private
     */
    _onToggleCarry(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemId);

        // Only process inventory ("gear") items, otherwise ignore
        if (item.data.type.endsWith('gear')) {
            const attr = "data.isCarried";
            return item.update({ [attr]: !getProperty(item.data, attr) });
        }

        return null;
    }

    /**
     * Handle toggling the carry state of an Owned Item within the Actor
     * @param {Event} event   The triggering click event
     * @private
     */
    _onToggleEquip(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemId);

        // Only process inventory ("gear") items, otherwise ignore
        if (item.data.type.endsWith('gear')) {
            const attr = "data.isEquipped";
            return item.update({ [attr]: !getProperty(item.data, attr) });
        }

        return null;
    }

    /**
     * Handle toggling the improve state of an Owned Item within the Actor
     * @param {Event} event   The triggering click event
     * @private
     */
    _onToggleImprove(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemId);

        // Only process inventory ("gear") items, otherwise ignore
        if (item.data.type === 'skill' || item.data.type === 'psionic') {
            const attr = "data.improveFlag";
            return item.update({ [attr]: !getProperty(item.data, attr) });
        }

        return null;
    }
}