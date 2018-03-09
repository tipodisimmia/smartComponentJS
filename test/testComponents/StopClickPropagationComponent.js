import {Component} from "../../build/SmartComponentJS";
import TestManager from "../TestManager";

class StopClickPropagationComponent extends Component{

    constructor(element,parentComponent,params) {
        super(element,parentComponent,params);
    }
    clickHandler(ev){
        ev.stopPropagation();
        TestManager.addClickEvent(this.componentReferenceName);
    }
}

export default StopClickPropagationComponent;