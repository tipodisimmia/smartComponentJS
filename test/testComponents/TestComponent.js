import {Component} from "../../build/SmartComponentJS";
import TestManager from "../TestManager";

class TestComponent extends Component{

    constructor(element,parentComponent,params) {
        super(element,parentComponent,params);
    }

    clickHandler(){
        console.log(this.componentReferenceName);
        TestManager.addClickEvent(this.componentReferenceName);
    }

}

export default TestComponent;