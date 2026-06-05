/**
 * Base minimale : recupere un element du DOM par son id (les elements sont
 * desormais rendus cote serveur — plus aucun chargement AJAX ici).
 */
class RoroElement {
    constructor(eltType, id = null, prefixId = '') {
        this.eltType = eltType;
        this.id = id || (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
        if (prefixId) this.id = `${prefixId}-${this.id}`;

        this.ready = this.registerElement();
    }

    async registerElement() {
        // Laisse le DOM se stabiliser, puis recupere l'element par son id.
        await new Promise(resolve => setTimeout(resolve, 0));
        this.elt = $('#' + this.id);
        this.registerEvents();
        return this;
    }

    // A surcharger dans les classes enfants.
    registerEvents() {}

    syncDom() {}
}
