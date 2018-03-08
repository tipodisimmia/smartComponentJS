
class TestManager {
    constructor() {
        this.clickEventsCounter={}
    }

    getClickEvents(componentReferenceName){
        if (typeof  this.clickEventsCounter.componentReferenceName=== "undefined"){
            this.clickEventsCounter[componentReferenceName]=0;
        }
        return this.clickEventsCounter[componentReferenceName];
    }

    addClickEvent(componentReferenceName){
        if (typeof  this.clickEventsCounter.componentReferenceName === "undefined"){
            this.clickEventsCounter[componentReferenceName]=0;
        }
        this.clickEventsCounter[componentReferenceName]++;
        return this.clickEventsCounter[componentReferenceName];
    }
}

export default new TestManager();