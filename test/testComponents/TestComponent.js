import {SmartComponent} from "../../src/index";
import TestManager from "../TestManager";

class TestComponent extends SmartComponent{

    constructor(element,parentComponent,params) {
        params=params || {};
        params.className='TestComponent';
        super(element,parentComponent,params);
    }

    clickHandler(){
        console.log(this.componentReferenceName);
        TestManager.addClickEvent(this.componentReferenceName);
    }

}

export default TestComponent;