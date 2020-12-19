//import { HM3ActiveEffect } from './hm3-active-effect.js';

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("li");
    const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    switch (a.dataset.action) {
        case "create":
            return ActiveEffect.create({
                label: "New Effect",
                icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                disabled: li.dataset.effectType === "inactive"
            }, owner).create();
        case "edit":
            const sh = effect.sheet;
            console.log(effect);
            return effect.sheet.render(true);
        case "delete":
            return effect.delete();
        case "toggle":
            return effect.update({ disabled: !effect.data.disabled });
    }
}
