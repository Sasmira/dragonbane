import DoDTest from "./dod-test.js";


export default class DoDSkillTest extends DoDTest  {

    constructor(actor, skill, options) {
        super(actor, options);
        this.actor = actor;
        this.skill = skill;
        this.attribute = skill?.system.attribute;
        this.canPush = options ? options.canPush != false : true;
    }
   
    async getRollOptions() {
        const label = game.i18n.localize("DoD.ui.dialog.skillRollLabel");
        const title = game.i18n.localize("DoD.ui.dialog.skillRollTitle") + ": " + this.skill.name;
        return this.getRollOptionsFromDialog(title, label);
    }

    updatePreRollData() {
        super.updatePreRollData();
        this.preRollData.actor = this.actor;
        this.preRollData.skill = this.skill;
        this.preRollData.target = this.skill.system.value;
        this.preRollData.canPush = this.options ? this.options.canPush != false : true;
    }

    updatePostRollData() {
        super.updatePostRollData();
        this.postRollData.result = this.roll.result;
        this.postRollData.success = this.preRollData.result <= this.preRollData.target;
        this.postRollData.canPush = this.preRollData.canPush && !this.postRollData.success && this.postRollData.result != 20;

        if (this.postRollData.canPush) {
            this.updatePushRollChoices();
        }
    }

    formatRollMessage(msgData) {
        const target = msgData.skill.system.value;
        const resultMsg = this.formatRollResult(msgData.result, target);
        const label = game.i18n.format(game.i18n.localize("DoD.roll.skillRoll"), {skill: msgData.skill.name, result: resultMsg});
        return {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: msgData.actor }),
            flavor: label
        };
    }

    getMessageTemplate() {
        return "systems/dragonbane/templates/partials/skill-roll-message.hbs";
    }

}