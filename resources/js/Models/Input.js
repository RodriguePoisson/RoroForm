class Input extends RoroElement {
    constructor(eltType, id = null, prefixId = '', elementArguments = {}, useCache = false) {
        super(eltType, id, prefixId, elementArguments, useCache);
    }
}

window.Input = Input;
