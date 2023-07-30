import { HM3 } from './config.js';

/**
 * A form designed for creating and editing an Active Effect on an Actor or Item.
 * @implements {FormApplication}
 *
 * @param {ActiveEffect} object     The target active effect being configured
 * @param {object} [options]        Additional options which modify this application instance
 */
export class HM3ActiveEffectConfig extends ActiveEffectConfig {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/hm3/templates/effect/active-effect-config.html",
        });
    }

    /* ----------------------------------------- */

    /** @override */
    async getData(options={}) {
        const context = await super.getData(options);
        context.keyChoices = HM3.activeEffectKey;
        return context;
    }
}
