class Input extends RoroElement
{
    constructor(eltType,id=null,prefixId='',elementArguments={},useCache=false) {
        super(eltType,id,prefixId,elementArguments,useCache);
    }

    registerEvents() {
        super.registerEvents();
    }

    createElement() {
        super.createElement();
    }
}

window.Input = Input;
