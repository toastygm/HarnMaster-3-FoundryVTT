import { DiceHM3 } from "../dice-hm3.js";
import { HM3 } from "../config.js";
//import { ImportArmorGear } from "../import-armor.js";
//import { ImportFFF } from "../import-char.js";
import * as utility from '../utility.js';

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
            await result.update({'data.quantity': newTargetQuantity});
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
                await sourceItem.update({'data.quantity': newSourceQuantity});
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

        // Rollable abilities.
        html.find('.rollable').click(this._onRoll.bind(this));

        // Standard 1d100 vs. target number (asks for optional modifier)
        html.find('.std-roll').click(this._onStdRoll.bind(this));

        // Standard 1d100 vs. target number (asks for optional modifier)
        html.find('.d6-roll').click(this._onD6Roll.bind(this));

        // Damage Roll
        html.find('.damage-roll').click(this._onDamageRoll.bind(this));

        // Missile Attack Roll
        html.find('.missile-attack-roll').click(this._onMissileAttackRoll.bind(this));

        // Missile Damage Roll
        html.find('.missile-damage-roll').click(this._onMissileDamageRoll.bind(this));

        // Injury Roll
        html.find('.injury-roll').click(this._onInjuryRoll.bind(this));

        // Toggle carry state
        html.find('.item-carry').click(this._onToggleCarry.bind(this));

        // Toggle equip state
        html.find('.item-equip').click(this._onToggleEquip.bind(this));
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
        let agree=false;
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

        switch(item.data.type) {
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
                
                // If our type is Psionic, and the current item's psionic time is blank,
                // copy over all psionic data from the dropped item.
                if (data.type = 'Psionic' && !data.psionic.time) {
                    updateData['data.psionic.time'] = otherData.psionic.time;
                    updateData['data.psionic.fatigue'] = otherData.psionic.fatigue;
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
        }

        if (updateData) {
            await item.update(updateData);
        }
        
        return;
    }
    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);

        // Initialize a default name.
        let name = 'New Item';
        if (type === 'skill' && header.dataset.skilltype) {
            if (header.dataset.skilltype === 'Psionic') {
                name = utility.createUniqueName('New Psionic Talent', this.actor.itemTypes.skill);
            } else {
                name = utility.createUniqueName(`New ${header.dataset.skilltype} Skill`, this.actor.itemTypes.skill);
            }
        } else {
            switch (type) {
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

                default:
                    console.error(`HM3 | Can't create item: unknown item type '${type}'`);
                    return null;
            }

        }

        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];

        // Finally, create the item!
        const result = await this.actor.createOwnedItem(itemData);

        if (!result) {
            log.error(`HM3 | Error creating item '${name}' of type '${type}' on character '${this.actor.data.name}'`)
            return null;
        }

        // If the result is a skill, and if 'skillType' has been defined,
        // set the skill type appropriately.
        if (type === 'skill' && header.dataset.skilltype) {
            if (HM3.skillTypes.includes(header.dataset.skilltype)) {
                const ownedItem = this.actor.getOwnedItem(result._id);
                const updateData = { 'data.type': header.dataset.skilltype };
                await ownedItem.update(updateData);
            }
        }

        return result;
    }

    /**
     * Handle standard clickable rolls.  A "standard" roll is a 1d100
     * roll vs. some target value, with success being less than or equal
     * to the target value.
     * 
     * data-target = target value
     * data-label = Label Text
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
     * data-label = Label Text
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
     * Handle damage rolls.  A damage roll is a roll of multiple d6 dice
     * plus weapon impact value (based on weapon aspect). This button
     * handles both the case where a specific weapon is known and not.
     * 
     * data-weapon = Name of weapon being used (or blank for unknown)
     * 
     * @param {Event} event 
     */
    _onDamageRoll(event) {
        event.preventDefault();
        this.actor.damageRoll(event.currentTarget.dataset.weapon);
    }

    /**
     * Handle missile damage rolls.  A damage roll is a roll of multiple d6 dice
     * plus missile impact value. This button
     * handles both the case where a specific weapon is known and not.
     * 
     * data-missile = Name of missile being used
     * data-aspect = Missile Aspect being used
     * data-impact-short = Short range missile impact
     * data-impact-medium = Medium range missile impact
     * data-impact-long = Long range missile impact
     * data-impact-extreme = Extreme range missile impact
     * 
     * @param {Event} event 
     */
    _onMissileDamageRoll(event) {
        event.preventDefault();
        this.actor.missileDamageRoll(event.currentTarget.dataset);
    }

    /**
     * Handle missile attack rolls.  A missile attack roll is a 1d100 roll
     * minus missile weapon range modifier.
     * 
     * data-missile = Name of missile being used
     * data-target = Target Attack ML (before modifiers)
     * data-aspect = Missile aspect
     * data-range-short = Short missile range
     * data-range-medium = Medium missile range
     * data-range-long = Long missile range
     * data-range-extreme = Extreme missile range
     * 
     * @param {Event} event 
     */
    _onMissileAttackRoll(event) {
        event.preventDefault();
        this.actor.missileAttackRoll(event.currentTarget.dataset);
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

    /**
     * Handle injury rolls.  An injury roll is a randomly determined
     * location, taking the impact and checking against the armor at
     * that location to arrive at effective impact, and then determining
     * injury level and other effects based on the result.
     * 
     * @param {Event} event 
     */
    _onInjuryRoll(event) {
        event.preventDefault();
        //const ifff = new ImportFFF();
        //ifff.importFromJSON("fffv1.json");
        //const ifff = new ImportArmorGear();
        //ifff.importFromJSON("armor.json");
        this.actor.injuryRoll();
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

}