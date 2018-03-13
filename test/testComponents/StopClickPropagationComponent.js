import {SmartComponent} from "../../build/SmartComponentJS";
import TestManager from "../TestManager";

class StopClickPropagationComponent extends SmartComponent{

    constructor(element,parentComponent,params) {
        super(element,parentComponent,params);
    }

    clickHandler(ev){
        if(ev){
            ev.stopPropagation();
        }
        TestManager.addClickEvent(this.componentReferenceName);
    }
}

export default StopClickPropagationComponent;