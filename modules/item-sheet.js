import { DoD } from "./config.js";

export default class DoDItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions,  {
            width: 560,
            height: 340,
            dragDrop: [{ dragSelector: null, dropSelector: null}],
            classes: ["DoD", "sheet", "item"]
        });
    }

    get template() {
        return `systems/dragonbane/templates/${this.item.type}-sheet.html`;
    }

    getData() {
        const baseData = super.getData();
   
        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item: baseData.item,
            data: baseData.data.system,
            config: CONFIG.DoD
        };

        if (this.item.type == "weapon") {
            let weaponFeatures = [];

            this.item.system.features.forEach( feature => {
                weaponFeatures.push({
                    name: "DoD.weaponFeatureTypes." + feature,
                    tooltip: "DoD.weaponFeatureTypes." + feature + "Tooltip"
                })
            });
            
            sheetData.weaponFeatures = weaponFeatures;
        }

        return sheetData;
    }

    activateListeners(html) {
        // Spell items
        html.find(".edit-school").change(this._onEditSchool.bind(this));

        // Weapon items
        html.find(".edit-weapon-features").click(this._onEditWeaponFeatures.bind(this));

        super.activateListeners(html);
    }

    _onEditSchool(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let field = element.dataset.field;
        let item = this.item;

        // replace input with localized string if it matches general school name
        let generalSchool = game.i18n.localize("DoD.spell.general");
        if (generalSchool == element.value) {
            element.value = "DoD.spell.general";
        }

        return item.update({ [field]: element.value});
    }

    async _onEditWeaponFeatures(event) {
        event.preventDefault();

        // prepare weapon feature data
        let featureData = [];
        for (let feature in DoD.weaponFeatureTypes)
        {
            featureData.push( {
                name: "DoD.weaponFeatureTypes." + feature,
                tooltip: "DoD.weaponFeatureTypes." + feature + "Tooltip",
                id: feature,
                value: this.item.hasWeaponFeature(feature)
            });
        }
        console.log(featureData);

        let dialogData = {features: featureData};

        const template = "systems/dragonbane/templates/partials/weapon-features-dialog.hbs";
        const html = await renderTemplate(template, dialogData);
        const labelOk = game.i18n.localize("DoD.ui.dialog.labelOk");
        const labelCancel = game.i18n.localize("DoD.ui.dialog.labelCancel");


        return new Promise(
            resolve => {
                const data = {
                    item: this.item,
                    title: "Title",
                    content: html,
                    buttons: {
                        ok: {
                            label: labelOk,
                            callback: html => resolve(this._processWeaponFeatures(html[0].querySelector("form")))
                        },
                        /*
                        cancel: {
                            label: labelCancel,
                            callback: html => resolve({cancelled: true})
                        }
                        */
                    },
                    default: "ok",
                    close: () => resolve({cancelled: true})
                };
                new Dialog(data, null).render(true);
            }
        );
    }

    _processWeaponFeatures(form) {
        let elements = form.getElementsByClassName("weapon-features");
        let element = elements ? elements[0] : null;
        let inputs = element?.getElementsByTagName("input");
        let features = [];

        for (let input of inputs) {
            if (input.type == "checkbox" && input.checked) {
                features.push(input.id);
            }
        }
        this.item.update({ ["system.features"]: features});
    }

    async _onDrop(event) {

        if (this.item.type == "kin")
        {
            const data = TextEditor.getDragEventData(event);
            const item = await Item.implementation.fromDropData(data);
            let itemData = item.toObject();
            itemData = itemData instanceof Array ? itemData : [itemData];
            return this.item.createEmbeddedDocuments("Item", itemData);
        }
    }
}