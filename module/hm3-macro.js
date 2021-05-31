export class HM3Macro extends Macro {
    constructor(data, context) {
        super(data, context);

        this.args = [];
    }

    _executeScript({actor, token}={}) {
        // Add variables to the evaluation scope
        const speaker = ChatMessage.getSpeaker();
        const character = game.user.character;
        actor = actor || game.actors.get(speaker.actor);
        token = token || (canvas.ready ? canvas.tokens.get(speaker.token) : null);

        // Attempt script execution
        const body = `(async () => {${this.data.command}})()`;
        const fn = new Function("speaker", "actor", "token", "character", "args", body);
        try {
            fn.call(this, speaker, actor, token, character, this.args);
        } catch (err) {
            ui.notifications.error(`There was an error in your macro syntax. See the console (F12) for details`);
            console.error(err);
        }
    }
}