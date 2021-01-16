import { DiceHM3 } from "../dice-hm3.js";
import { HM3 } from "../config.js";
import { HarnMasterActor } from "./actor.js";
//import { ImportArmorGear } from "../import-armor.js";
//import { ImportFFF } from "../import-char.js";
import * as utility from '../utility.js';
import * as macros from '../macros.js';
import { onManageActiveEffect } from '../effect.js';

/**
 * Extend the basic ActorSheet with some common capabilities
 * @extends {ActorSheet}
 */
export class HarnMasterBaseActorSheet extends ActorSheet {

    /** @override */
    getData() {
        let isOwner = this.entity.owner;
        const data = {
            owner: isOwner,
            limited: this.entity.limited,
            options: this.options,
            editable: this.isEditable,
            cssClass: isOwner ? "editable" : "locked",
            isCharacter: this.entity.data.type === "character",
            isCreature: this.entity.data.type === "creature",
            isContainer: this.entity.data.type === "container",
            config: CONFIG.HM3
        }

        data.actor = duplicate(this.actor.data);
        data.items = this.actor.items.map(i => {
            i.data.labels = i.labels;
            return i.data;
        });
        data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        data.data = data.actor.data;
        data.labels = this.actor.labels || {};
        data.filters = this._filters;
        
        data.dtypes = ["String", "Number", "Boolean"];
        let capacityMax = 0;
        let capacityVal = 0;
        if ((this.actor.data.type === 'creature') || (this.actor.data.type === 'character')) {
            capacityMax = data.data.endurance * 10;
            capacityVal = data.data.eph.totalGearWeight;
        } else if (this.actor.data.type === 'container') {
            capacityMax = data.data.capacity.max;
            capacityVal = data.data.capacity.value;
        }

        // Setup the fake container entry for "On Person" container
        data.containers = {
            'on-person': {
                "data": {
                    "name": "On Person",
                    "type": "containergear",
                    "data": {
                        "container": "on-person",
                        "capacity": {
                            "max": capacityMax,
                            "value": capacityVal
                        }
                    }
                }
            }
        };

        this.actor.items.forEach(it => {
            if (it.type === 'containergear') {
                data.containers[it._id] = it;
            }
        });

        data.gearTypes = {
            'armorgear': 'Armor',
            'weapongear': 'Melee Wpn',
            'missilegear': 'Missile Wpn',
            'miscgear': 'Misc. Gear',
            'containergear': 'Container'
        };

        // get active effects.
        data.effects = {};
        this.actor.effects.forEach(effect => {
            effect._getSourceName().then(() => {
                data.effects[effect.id] = {
                    'source': effect.sourceName,
                    'duration': utility.aeDuration(effect),
                    'data': effect.data,
                    'changes': utility.aeChanges(effect)
                }
                data.effects[effect.id].data.disabled = effect.data.disabled;
            });
        });

        return data;
    }

    /** @override */
    _onSortItem(event, itemData) {

        // TODO - for now, don't allow sorting for Token Actor overrides
        if (this.actor.isToken) return;

        if (!itemData.type.endsWith('gear')) return super._onSortItem(event, itemData);

        // Get the drag source and its siblings
        const source = this.actor.getOwnedItem(itemData._id);
        const siblings = this.actor.items.filter(i => {
            return (i.data.type.endsWith('gear') && (i.data._id !== source.data._id));
        });

        // Get the drop target
        const dropTarget = event.target.closest(".item");
        const targetId = dropTarget ? dropTarget.dataset.itemId : null;
        const target = siblings.find(s => s.data._id === targetId);

        // Ensure we are only sorting like-types
        if (target && !target.data.type.endsWith('gear')) return;

        // Perform the sort
        const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings });
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target.data._id;
            return update;
        });

        // Perform the update
        return this.actor.updateEmbeddedEntity("OwnedItem", updateData);
    }

    /** @override */
    async _onDropItem(event, data) {
        if (!this.actor.owner) return false;

        // Destination containerid: set to 'on-person' if a containerid can't be found
        const closestContainer = event.target.closest('[data-container-id]');
        const destContainer = closestContainer && closestContainer.dataset && closestContainer.dataset.containerId ? closestContainer.dataset.containerId : 'on-person';

        if (data.actorId === this.actor._id) {
            // We are dropping from the same actor

            // If the item is some type of gear (other than containergear), then
            // make sure we set the container to the same as the dropped location
            // (this allows people to move items into containers easily)
            const item = await Item.fromDropData(data);
            if (item.data.type.endsWith('gear') && item.data.type !== 'containergear') {
                if (item.data.data.container != destContainer) {
                    this.actor.updateOwnedItem({ '_id': item.data._id, 'data.container': destContainer });
                }
            }

            return super._onDropItem(event, data);
        }

        // NOTE: when an item comes from the item list or a compendium, its type is
        // "Item" but it does not have a "data" element.  So we have to check for that in
        // the following conditional; "data.data.type" may not exist!

        // Skills, spells, etc. (non-gear) coming from a item list or compendium
        if (!data.data || !data.data.type.endsWith("gear")) {
            return super._onDropItem(event, data);
        }

        // At this point we know this dropped item comes from another actor,
        // and it is some sort of "gear". Go ahead and process the drop, but
        // track the result.

        // Containers are a special case, and they need to be processed specially
        if (data.data.type === 'containergear') return await this._moveContainer(event, data);

        // Set the destination container to the closest drop containerid
        data.data.data.container = destContainer;

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

    async _moveContainer(event, data) {
        // create new container
        const item = await Item.fromDropData(data);
        let itemData = duplicate(item.data);

        // Get source actor
        let sourceActor = null;
        if (data.tokenId) {
            const token = await canvas.tokens.get(data.tokenId);
            sourceActor = token.actor;
        } else {
            sourceActor = await game.actors.get(data.actorId);
        }

        if (!sourceActor) {
            ui.notifications.warn(`Error accessing actor where container is coming from, move aborted`);
            return null;
        }

        const containerResult = await this.actor.createOwnedItem(itemData);
        if (!containerResult) {
            ui.notifications.warn(`Error while moving container, move aborted`);
            return null;
        }

        // move all items into new container
        let failure = false;
        for (let it of sourceActor.items.values()) {
            if (!failure && it.data.data.container === item.id) {
                itemData = duplicate(it.data);
                itemData.data.container = containerResult._id;
                const result = await this.actor.createOwnedItem(itemData);

                if (result) {
                    await sourceActor.deleteOwnedItem(it.id);
                } else {
                    failure = true;
                }
            }
        }

        if (failure) {
            ui.notifications.error(`Error duing move of items from source to destination, container has been only partially moved!`);
            return null;
        }

        // delete old container
        await sourceActor.deleteOwnedItem(data.data._id);

        return containerResult;
    }

    async _moveQtyDialog(event, data) {
        // Get source actor
        let sourceActor = null;
        if (data.tokenId) {
            const token = await canvas.tokens.get(data.tokenId);
            sourceActor = token.actor;
        } else {
            sourceActor = await game.actors.get(data.actorId);
        }

        if (!sourceActor) {
            ui.notifications.warn(`Error accessing actor where container is coming from, move aborted`);
            return null;
        }

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

        // Get source actor
        let sourceActor = null;
        if (data.tokenId) {
            const token = await canvas.tokens.get(data.tokenId);
            sourceActor = token.actor;
        } else {
            sourceActor = await game.actors.get(data.actorId);
        }

        if (!sourceActor) {
            ui.notifications.warn(`Error accessing actor where container is coming from, move aborted`);
            return null;
        }

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
            itemData.data.container = 'on-person';
            result = await this.actor.createOwnedItem(itemData);
        }

        if (result) {
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
            if (actor.data.type === 'container') {
                ui.notifications.warn(`You may only place physical objects in a container; drop of ${data.name} refused.`);
                return false;
            }

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
            return this._createItem(data);
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

        // Dump Esoteric Description to Chat
        html.find('.item-dumpdesc').click(this._onDumpEsotericDescription.bind(this));

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.entity));

        // Ensure all text is selected when entering text input field
        html.on("click", "input[type='text']", ev => {
            ev.currentTarget.select();
        });

        // Filter on name for Skills
        html.on("keyup", ".skill-name-filter", ev => {
            const data = this.getData();
            this.skillNameFilter = $(ev.currentTarget).val();
            const lcSkillNameFilter = this.skillNameFilter.toLowerCase();
            let skills = html.find('.skill-item');
            for (let skill of skills) {
                const skillName = skill.getAttribute('data-item-name');
                if (lcSkillNameFilter) {
                    if (skillName.toLowerCase().includes(lcSkillNameFilter)) {
                        $(skill).show()
                    } else {
                        $(skill).hide()
                    }
                } else {
                    $(skill).show();
                }
            }
        });

        // Filter on name for gear
        html.on("keyup", ".gear-name-filter", ev => {
            const data = this.getData();
            this.gearNameFilter = $(ev.currentTarget).val();
            const lcGearNameFilter = this.gearNameFilter.toLowerCase();
            let gearItems = html.find('.gear-item');
            for (let gear of gearItems) {
                const gearName = gear.getAttribute('data-item-name');
                if (lcGearNameFilter) {
                    if (gearName.toLowerCase().includes(lcGearNameFilter)) {
                        $(gear).show()
                    } else {
                        $(gear).hide()
                    }
                } else {
                    $(gear).show();
                }
            }
        });

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
            const aspect = ev.currentTarget.dataset.aspect;
            macros.weaponDamageRoll(`Item$${itemId}`, aspect, this.actor);
        });

        // Missile Damage Roll
        html.find('.missile-damage-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            const range = ev.currentTarget.dataset.range;
            macros.missileDamageRoll(`Item$${itemId}`, range, this.actor);
        });

        // Melee Weapon Attack
        html.find('.melee-weapon-attack').click(ev => {
            // If we are a synthetic actor, token will be set
            let token = this.actor.token;
            if (!token) {
                // We are not a synthetic actor, so see if there is exactly one linked actor on the canvas
                const tokens = this.actor.getActiveTokens(true);
                if (tokens.length == 0) {
                    ui.notifications.warn(`There are no tokens linked to this actor on the canvas, double-click on a specific token on the canvas.`);
                    return null;
                } else if (tokens.length > 1) {
                    ui.notifications.warn(`There are ${tokens.length} tokens linked to this actor on the canvas, so the attacking token can't be identified.`);
                    return null;
                }
                token = tokens[0];
            }

            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            macros.weaponAttack(`Item$${itemId}`, false, token);
        });

        // Missile Weapon Attack
        html.find('.missile-weapon-attack').click(ev => {
            // If we are a synthetic actor, token will be set
            let token = this.actor.token;
            if (!token) {
                // We are not a synthetic actor, so see if there is exactly one linked actor on the canvas
                const tokens = this.actor.getActiveTokens(true);
                if (tokens.length == 0) {
                    ui.notifications.warn(`There are no tokens linked to this actor on the canvas, double-click on a specific token on the canvas.`);
                    return null;
                } else if (tokens.length > 1) {
                    ui.notifications.warn(`There are ${tokens.length} tokens linked to this actor on the canvas, so the attacking token can't be identified.`);
                    return null;
                }
                token = tokens[0];
            }

            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data('itemId');
            macros.missileAttack(`Item$${itemId}`, false, token);
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
            //const ifff = new ImportFFF();
            //ifff.importFromJSON('test.json');
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

        // More Info
        html.find('.more-info').click(this._onMoreInfo.bind(this));
    }

    /* -------------------------------------------- */

    async _onItemDelete(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;
        const data = duplicate(header.dataset);
        const li = $(header).parents(".item");
        const itemId = li.data("itemId");
        if (itemId) {
            const item = this.actor.items.get(itemId);
            if (!item) {
                console.error(`HM3 | Delete aborted, item ${itemId} in actor ${this.actor.name} was not found.`);
                return;
            }

            let title = `Delete ${data.label}`;
            let content;
            if (item.data.type === 'containergear') {
                title = 'Delete Container';
                content = '<p>WARNING: All items in this container will be deleted as well!</p><p>Are you sure?</p>';
            } else {
                content = '<p>Are you sure?</p>';
            }

            // Create the dialog window
            let agree = false;
            await Dialog.confirm({
                title: title,
                content: content,
                yes: () => agree = true
            });

            if (agree) {
                const deleteItems = [];

                // Add all items in the container to the delete list
                if (item.data.type === 'containeritem') {
                    this.actor.items.forEach(it => {
                        if (item.data.type.endsWith('gear') && it.data.data.container === itemId) deleteItems.push(it.id);
                    });
                }

                deleteItems.push(itemId);  // ensure we delete the container last

                for (let it of deleteItems) {
                    await this.actor.deleteOwnedItem(it);
                    li.slideUp(200, () => this.render(false));
                }
            }
        }
    }

    async mergeItem(item, other) {
        if (item.data.type != other.type) {
            return;
        }

        const data = item.data.data;
        const otherData = other.data;
        const updateData = {};

        if (!data.notes || data.notes === '') updateData['data.notes'] = otherData.notes;
        if (!data.source || data.source === '') updateData['data.source'] = otherData.source;
        if (!data.description || data.description === '') updateData['data.description'] = otherData.description;
        if (!data.macro || data.macro === '') updateData['data.macro'] = otherData.macro;
        if (item.data.img === DEFAULT_TOKEN) updateData['img'] = other.img;

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
                // If the skillbase is blank, copy it over from dropped item
                if (!data.skillBase.formula) {
                    updateData['data.skillBase.formula'] = otherData.skillBase.formula;
                    updateData['data.skillBase.isFormulaValid'] = otherData.skillBase.isFormulaValid;
                }
                updateData['data.fatigue'] = otherData.fatigue;
                break;
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

        let extraList = [];
        let extraLabel = null;

        // Ask type
        // Initialize a default name.
        let name = "New Item";
        if (dataset.type === 'skill' && dataset.skilltype) {
            name = utility.createUniqueName(`New ${dataset.skilltype} Skill`, this.actor.itemTypes.skill);
        } else if (dataset.type == 'trait' && dataset.traittype) {
            name = utility.createUniqueName(`New ${dataset.traittype} Trait`, this.actor.itemTypes.trait);
        } else if (dataset.type.endsWith('gear')) {
            name = "New Gear";
            extraList = ['Misc. Gear', 'Armor', 'Melee Weapon', 'Missile Weapon', 'Container'];
            extraLabel = 'Gear Type';
        } else {
            switch (dataset.type) {
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
                    console.error(`HM3 | Can't create item: unknown item type '${dataset.type}'`);
                    return null;
            }

        }

        // Render modal dialog
        let dlgTemplate = "systems/hm3/templates/dialog/create-item.html";
        let dialogData = {
            type: dataset.type,
            title: name,
            placeholder: name,
            extraList: extraList,
            extraLabel: extraLabel,
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

                if (dataset.type === 'gear') {
                    if (extraValue === 'Container') dialogData.type = 'containergear';
                    else if (extraValue === 'Armor') dialogData.type = 'armorgear';
                    else if (extraValue === 'Melee Weapon') dialogData.type = 'weapongear';
                    else if (extraValue === 'Missile Weapon') dialogData.type = 'missilegear';
                    else dialogData.type = 'miscgear';
                }

                // Item Data
                const itemData = duplicate(game.system.model.Item[dialogData.type]);
                if (dataset.type === 'skill') itemData.type = dataset.skilltype;
                else if (dataset.type === 'trait') itemData.type = dataset.traittype;
                else if (dataset.type.endsWith('gear')) itemData.container = dataset.containerId;
                else if (dataset.type === 'spell') itemData.convocation = extraValue;
                else if (dataset.type === 'invocation') itemData.diety = extraValue;

                return this._createItem({
                    name: itemName,
                    type: dialogData.type,
                    data: itemData,
                    img: DEFAULT_TOKEN
                });
            },
            options: { jQuery: false }
        });
    }

    async _createItem(data) {
        // If a weapon or a missile, get the associated skill
        if (data.type === 'weapongear' || data.type === 'missilegear') {
            data.data.assocSkill = utility.getAssocSkill(data.name, this.actor.itemTypes.skill, 'None');
        }

        // If it is a spell, initialize the convocation to the
        // first magic skill found; it is really unimportant what the
        // value is, so long as it is a valid skill for this character
        if (data.type === 'spell') {
            for (let skill of this.actor.itemTypes.skill.values()) {
                if (skill.data.data.type === 'Magic') {
                    data.data.convocation = skill.data.name;
                    break;
                }
            }
        }

        // If it is a invocation, initialize the diety to the
        // first ritual skill found; it is really unimportant what the
        // value is, so long as it is a valid skill for this character
        if (data.type === 'invocation') {
            for (let skill of this.actor.itemTypes.skill.values()) {
                if (skill.data.data.type === 'Ritual') {
                    data.data.diety = skill.data.name;
                    break;
                }
            }
        }

        if (data.img === DEFAULT_TOKEN) {
            // Guess the icon from the name
            data.img = utility.getImagePath(data.name);
        }

        if (data.img === DEFAULT_TOKEN) {
            switch (data.type) {
                case 'skill':
                    if (data.type === 'Ritual') {
                        data.img = utility.getImagePath('circle');
                    } else if (data.type === 'Magic') {
                        data.img = utility.getImagePath('pentacle');
                    }
                    break;

                case 'psionic':
                    data.img = utility.getImagePath("psionics");
                    break;

                case 'spell':
                    data.img = utility.getImagePath(data.convocation);
                    if (data.img === DEFAULT_TOKEN) {

                        data.img = utility.getImagePath("pentacle");
                    }
                    break;

                case 'invocation':
                    data.img = utility.getImagePath(data.diety);
                    if (data.img === DEFAULT_TOKEN) {
                        data.img = utility.getImagePath("circle");
                    }
                    break;

                case 'miscgear':
                    data.img = utility.getImagePath("miscgear")
                    break;

                case 'containergear':
                    data.img = utility.getImagePath("sack");
                    break;

                case 'weapongear':
                case 'missilegear':
                    data.img = utility.getImagePath(data.data.assocSkill)
                    break;
            }
        }

        // Finally, create the item!
        const result = await this.actor.createOwnedItem(data);

        if (!result) {
            throw new Error(`Error creating item '${data.name}' of type '${data.type}' on character '${this.actor.data.name}'`);
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

        // Only process skills and psionics, otherwise ignore
        if (item.data.type === 'skill' || item.data.type === 'psionic') {
            if (!item.data.data.improveFlag) {
                return item.update({ "data.improveFlag": true });
            } else {
                return this._improveToggleDialog(item);
            }
        }

        return null;
    }

    async _onMoreInfo(event) {
        event.preventDefault();
        const journalEntry = event.currentTarget.dataset.journalEntry;

        const helpJournal = await game.packs.find(p => p.collection === `hm3.system-help`).getContent();
        const article = helpJournal.find(i => i.name === journalEntry);
        //const article = game.journal.getName(journalEntry);
        if (!article) {
            console.error(`HM3 | Can't find journal entry with name "${journalEntry}".`);
            return null;
        }
        article.sheet.render(true, {editable: false});
        return null;
    }

    _improveToggleDialog(item) {
        const html = '<p>Do you want to perform a Skill Development Roll (SDR), or just disable the flag?</p>'

        // Create the dialog window
        return new Promise(resolve => {
            new Dialog({
                title: 'Skill Development Toggle',
                content: html.trim(),
                buttons: {
                    performSDR: {
                        label: "Perform SDR",
                        callback: async (html) => {
                            return await HarnMasterActor.skillDevRoll(item);
                        }
                    },
                    disableFlag: {
                        label: "Disable Flag",
                        callback: async (html) => {
                            return item.update({ "data.improveFlag": false });
                        }
                    }
                },
                default: "performSDR",
                close: () => resolve(false)
            }).render(true)
        });

    }

    async _onDumpEsotericDescription(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;
        const data = duplicate(header.dataset);
        const li = $(header).parents(".item");
        const itemId = li.data("itemId");

        if (itemId) {
            const item = this.actor.items.get(itemId);
            if (!item) {
                return;
            }

            const data = item.data;

            if (['spell', 'invocation', 'psionic'].includes(data.type)) {
                const chatData = {
                    name: data.name,
                    desc: data.data.description,
                    notes: data.data.notes || null,
                    fatigue: data.type === 'psionic' ? data.data.fatigue : null
                };

                if (data.type === 'spell') {
                    chatData.level = utility.romanize(data.data.level);
                    chatData.title = `${data.data.convocation} Spell`;
                } else if (data.type === 'invocation') {
                    chatData.level = utility.romanize(data.data.circle);
                    chatData.title = `${data.data.diety} Invocation`;
                } else if (data.type === 'psionic') {
                    chatData.level = `F${data.data.fatigue}`;
                    chatData.title = `Psionic Talent`;
                }

                const chatTemplate = 'systems/hm3/templates/chat/esoteric-desc-card.html';

                const html = await renderTemplate(chatTemplate, chatData);

                const messageData = {
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: html.trim(),
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER
                };

                // Create a chat message
                return ChatMessage.create(messageData);
            }
        }
    }
}
