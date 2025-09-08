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
        await new Promise(resolve => setTimeout(resolve, 0));

        // Vérifie si l'élément existe déjà dans le DOM
        this.elt = $('#' + this.id);
        if (this.elt.length) {
            this.isFromDom = true;
            this.registerEvents();
            return this;
        }

        // Vérifie le cache
        if (this.useCache && RoroElement.cache[this.eltType]) {
            this.elt = RoroElement.cache[this.eltType].clone(true, true);
            this.elt.attr('id',this.id);
            this.isFromDom = false;
            this.registerEvents();
            return this;
        }

        // Charge via AJAX
        const $elt = await this.loadElement();
        if (this.useCache) RoroElement.cache[this.eltType] = $elt.clone(true, true);

        this.elt = $elt;
        this.elt.attr('id',this.id);
        this.isFromDom = false;
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

    // À surcharger dans les classes enfants
    registerEvents() {}

    // Méthode helper pour mettre à jour DOM depuis données
    syncDom() {}
}
