class RoroElement {
    static cache = {};

    constructor(eltType, id = null, prefixId = '', elementArguments = {}, useCache = false) {
        this.eltType = eltType;
        this.id = id || (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
        if (prefixId) this.id = `${prefixId}-${this.id}`;

        this.ajaxRoute = RoroElement.getAjaxRoute(eltType);
        this.elementArguments = elementArguments;
        this.useCache = useCache;
        this.ready = this.registerElement();
    }

    static getAjaxRoute(eltType) {
        return '/roro/ajax/get/' + eltType;
    }

    async registerElement() {
        // Laisse le DOM se stabiliser (l'element peut venir d'etre injecte).
        await new Promise(resolve => setTimeout(resolve, 0));

        // 1) Deja present dans le DOM.
        const existing = $('#' + this.id);
        if (existing.length) return this.finalize(existing, true);

        // 2) Clonage depuis le cache de templates.
        if (this.useCache && RoroElement.cache[this.eltType]) {
            return this.finalize(RoroElement.cache[this.eltType].clone(true, true), false);
        }

        // 3) Chargement via AJAX (et mise en cache du template si demande).
        const $elt = await this.loadElement();
        if (this.useCache) RoroElement.cache[this.eltType] = $elt.clone(true, true);
        return this.finalize($elt, false);
    }

    // Branche commune aux 3 cas : pose l'element + son id, puis cable les events.
    finalize(elt, isFromDom) {
        this.elt = isFromDom ? elt : elt.attr('id', this.id);
        this.isFromDom = isFromDom;
        this.registerEvents();
        return this;
    }

    loadElement() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.ajaxRoute,
                type: 'GET',
                data: this.elementArguments,
                success: data => resolve($(data)),
                error: (xhr, status, error) => reject(new Error(`Ajax element creation error: ${error}`))
            });
        });
    }

    // A surcharger dans les classes enfants.
    registerEvents() {}

    syncDom() {}
}
