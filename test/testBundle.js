(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

class AppRegistry {
    constructor() {
        this.components = [];
    }


    registerComponents(componentsClasses){
        Object.keys(componentsClasses).forEach((componentClassName)=>{
            if(!this.getComponent(componentClassName)){
                this.registerComponent(componentClassName,componentsClasses[componentClassName]);
            }
        });
    }


    registerComponent(name,clazz) {
        this.components.push({
            name: name,
            clazz: clazz
        });
    }

    initComponentByName(element,componentName){
        let instance=null;
        try{
            var clazz = this.getComponent(componentName);
            instance=new clazz(element); //Start Up Component
        }catch(e){
            console.error("Error when trying to instance Component " + componentName +": "+ e);
        }
        return instance;
    }

    getComponent(name) {
        var comp = this.components.filter(c => c.name == name).map(c => c.clazz)[0];
        return comp;
    }
}

var AppRegistry$1 = new AppRegistry();

class Component {
    constructor(element, parentComponent, params) {
        this.init(element, parentComponent, params);
    }

    init(element, parentComponent, params){
        this.element = element;
        this.bindedElements = {"click":[]};
        this._componentId =  this.generateUid();
        this.parentComponent = parentComponent;
        this.componentReferenceName = null;
        this.params = params || {};



        //Serve per recuperare il componente  tramite un nome di fantasia contenuto nell'attributo component-reference-name
        let componentReferenceName = this.params.componentReferenceName ? this.params.componentReferenceName : this.element.getAttribute("component-reference-name");
        componentReferenceName=componentReferenceName || this._componentId;

        this.componentReferenceName = componentReferenceName;
        if (!element.getAttribute("component-reference-name")) {
            element.setAttribute("component-reference-name", componentReferenceName);
        }

        this.element.setAttribute("component-id",this._componentId);

        if(!this.element.getAttribute("component")){
            this.element.setAttribute("component",this.constructor.name);
        }




        if(this.parentComponent && !this.parentComponent.components){
            this.parentComponent.components={};
        }

        if(!this.verifyComponentReferenceNameUnicity()){
            throw this.componentReferenceName +" componentReferenceName is already used in "+this.parentComponent.componentReferenceName +" hyerarchy";
        }

        if(this.parentComponent){
            this.parentComponent.components[componentReferenceName] = this;
        }




        if(this.element.getAttribute("component-click")){
            this.bindComponentClick(this.element);
        }

        let nodesToBind =this.getComponentClickNodeToBind([this.element]);
        if(nodesToBind.length) {
            for (var i = 0; i < nodesToBind.length; i++) {
                this.checkComponentsHierarchyAndBindClick(nodesToBind[i]);
            }
        }

        //The mutationObserver is used in order to retrieve and handling component-"event"
        this.mutationObserver= new MutationObserver(this.eventMutationHandler.bind(this));
        this.mutationObserver.observe(element,{attributes: false, childList: true, characterData: false, subtree: true});
    }

    verifyComponentReferenceNameUnicity(){
        return  !this.parentComponent || ( this.parentComponent && !this.parentComponent.components[this.componentReferenceName]);
    }

    generateUid() {
        return  this.constructor.name+"_"+'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    clickHandler(ev) {
        let functionCode = ev.currentTarget.getAttribute('component-click');
        let functionName = functionCode.split("(")[0];

        function extractParams(...params) {

            let parameters=[].slice.call(arguments);
            return parameters.map((param)=>{
                if(param=="this"){
                    return ev;
                }else{
                    return param;
                }
            })
        }

        if(this[functionName]){
            this[functionName].apply(this, eval("extractParams("+functionCode.split("(")[1]));
        }
    }

    loadChildComponents(parentComponent) {
        let componentsLoaded=[];
        var componentsEls = this.element.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = AppRegistry$1.getComponent(component);
                componentsLoaded.push( new Clazz(componentsEls[i],parentComponent || this));
            }
        }
        return componentsLoaded;
    }

    bindComponentClick(node) {

        let isAlreadyBinded=this.bindedElements["click"].reduce((accumulator,currentNode)=>{
            return accumulator || currentNode.isEqualNode(node);
        },false);

        if(!isAlreadyBinded){
            this.bindedElements["click"].push(node);
            node.addEventListener('click', (e)=> {
                this.clickHandler(e);
            });
        }
    }

    checkComponentsHierarchyAndBindClick(node){
        let parentsComponent= this.getDomElementParents( node, '[component-reference-name]');
        if(parentsComponent.length>0 && parentsComponent[0].getAttribute("component-reference-name")==this.componentReferenceName){
            this.bindComponentClick(node);
        }else{
            return;
        }
    }

    getDomElementParents(elem, selector){
        // Setup parents array
        var parents = [];
        // Get matching parent elements
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            // Add matching parents to array
            if (selector) {
                if (elem.matches(selector)) {
                    parents.push(elem);
                }
            } else {
                parents.push(elem);
            }
        }
        return parents;
    }


    eventMutationHandler(mutationsList){
        if(mutationsList && mutationsList.length>0){
            let mutationElements= mutationsList.filter((m) => {
                return m.addedNodes.length > 0;
            }).reduce((prev, current) => {
                return prev.concat(this.getComponentClickNodeToBind(current.addedNodes));
            }, []);

            if(mutationElements.length){
                for (var i = 0; i < mutationElements.length; i++) {
                    this.checkComponentsHierarchyAndBindClick(mutationElements[i]);
                }
            }
        }
    }

    getComponentClickNodeToBind(modesToCheck){
        let nodesToBind=[];
        if(modesToCheck.length){
            for (var i = 0; i < modesToCheck.length; i++) {
                let node=modesToCheck[i];
                if(node.querySelectorAll){
                    let componentClickElements =node.querySelectorAll('[component-click]');
                    if (componentClickElements.length > 0) {
                        for (let i = 0; i < componentClickElements.length; i++) {
                            nodesToBind.push(componentClickElements[i]);
                        }
                    }
                }
            }
        }
        return nodesToBind;
    }
}

class TestManager {
    constructor() {
        this.clickEventsCounter={};
    }

    getClickEvents(componentReferenceName){
        if (typeof  this.clickEventsCounter[componentReferenceName]=== "undefined"){
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

var TestManager$1 = new TestManager();

class TestComponent extends Component{

    constructor(element,parentComponent,params) {
        super(element,parentComponent,params);
    }

    clickHandler(){
        console.log(this.componentReferenceName);
        TestManager$1.addClickEvent(this.componentReferenceName);
    }

}

AppRegistry$1.registerComponents({TestComponent});

let testComponent=null;
let testComponent2=null;
let testComponent3=null;
let testComponent4=null;
let testComponent5=null;
let testComponent6=null;

describe('TestComponent1 - Instance by name', function() {
    testComponent = AppRegistry$1.initComponentByName(document.querySelector(`[component-reference-name="TestComponent1"]`),"TestComponent");
    it('TestComponent1 - should be instanced', function() {
        assert.equal(testComponent.constructor.name, "TestComponent");
    });
});

describe('TestComponent1 - load child components passing like parent TestComponent1', function() {
    it('TestComponent2 - TestComponent1 should be present like TestComponent2 parent', function() {
        let loadedComponents = testComponent.loadChildComponents(testComponent);
        testComponent2=loadedComponents.filter((component)=>{
            return component.componentReferenceName=="TestComponent2";
        })[0];
        assert.equal(testComponent2.parentComponent.componentReferenceName, "TestComponent1");
    });
});

describe('TestComponent2 component-click - click on TestComponent2 child on component-click attribute', function() {
    it('TestComponent2 - clickEventsNumber must be increase of one', async function() {
        let clickEventsNumberBefore=TestManager$1.getClickEvents("TestComponent2");
        document.querySelector(`[component-reference-name="TestComponent2"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager$1.getClickEvents("TestComponent2"), (clickEventsNumberBefore + 1));
    });
});


describe('TestComponent3/4 added dinamically - add dinamically TestComponent3 like child of TestComponent2', function() {
    it('TestComponent3/4 - should be present like child of TestComponent2', async function() {
        let testComponent2DomEl= document.querySelector(`[component-reference-name="TestComponent2"]`);
        var node=document.createElement('div');
        node.innerHTML=`
        <div>
            <div component="TestComponent"  component-reference-name="TestComponent3">
                <button component-click="clickHandler()">TestComponent3 Click Handler</button>
            </div>
    
            <div component="TestComponent"  component-reference-name="TestComponent4">
                <button component-click="clickHandler()">TestComponent4 Click Handler</button>
            </div>
        </div>`;
        testComponent2DomEl.appendChild(node.childNodes[1]);
        testComponent2.loadChildComponents();
        await setTimeout(()=>{},500);
        testComponent3=testComponent2.components["TestComponent3"];
        testComponent4=testComponent2.components["TestComponent4"];
        assert.equal(testComponent2.components["TestComponent3"].componentReferenceName, "TestComponent3");
        assert.equal(testComponent2.components["TestComponent4"].componentReferenceName, "TestComponent4");
    });
});


describe('TestComponent3 component-click - click on TestComponent3 child on component-click attribute', function() {
    it('TestComponent3 - clickEventsNumber must be increase of one', async function() {
        let clickEventsNumberBefore=TestManager$1.getClickEvents("TestComponent3");
        document.querySelector(`[component-reference-name="TestComponent3"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager$1.getClickEvents("TestComponent3"), (clickEventsNumberBefore + 1));
    });
});

describe('TestComponent5 instanced by javascript - instanced by javascript TestComponent5 under TestComponent2', function() {
    it('TestComponent5 - should be present like child of TestComponent2', async function() {
        let testComponent2DomEl= document.querySelector(`[component-reference-name="TestComponent2"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div></div>`;
        let nodeToAppend=node.childNodes[0];
        testComponent2DomEl.appendChild(nodeToAppend);
        testComponent5 = new TestComponent(nodeToAppend,testComponent2,{componentReferenceName:"TestComponent5"});
        await setTimeout(()=>{},500);
        assert.equal(testComponent2.components["TestComponent5"].componentReferenceName, "TestComponent5");
    });
});


describe('TestComponent6 instanced by javascript - instanced by javascript TestComponent6 under TestComponent5', function() {
    it('TestComponent6 - should be present like child of TestComponent5', async function() {
        let testComponent5DomEl= document.querySelector(`[component-reference-name="TestComponent5"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div>
                             <button component-click="clickHandler()">TestComponent6 Click Handler</button>
                        </div>`;
        let nodeToAppend=node.childNodes[0];
        testComponent5DomEl.appendChild(nodeToAppend);
        testComponent6 = new TestComponent(nodeToAppend,testComponent5,{componentReferenceName:"TestComponent6"});
        await setTimeout(()=>{},500);
        assert.equal(testComponent5.components["TestComponent6"].componentReferenceName, "TestComponent6");
    });
});


describe('Detect conflict in component-reference-name - i used two times TestComponent6 under TestComponent5 component', function() {
    it('Not unique component reference name exception is throwed ',  function() {
        let testComponent5DomEl= document.querySelector(`[component-reference-name="TestComponent5"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div component="TestComponent" component-reference-name="TestComponent6">
                        </div>`;
        let nodeToAppend=node.childNodes[0];
        testComponent5DomEl.appendChild(nodeToAppend);
        let crnException=null;
        try{
            testComponent5.loadChildComponents();
        }catch (e){
            crnException=e;
            console.log(e);
        }

        assert.equal(crnException!=null, true);
    });
});



//Destroy con detach listener
//Init
//BeforComponetClick
//Lanciare eccezione se vengono trovate componentReferenceName registrate o se il componentReferenceName coincide con quella del padre

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vYnVpbGQvU21hcnRDb21wb25lbnRKUy5qcyIsIlRlc3RNYW5hZ2VyLmpzIiwidGVzdENvbXBvbmVudHMvVGVzdENvbXBvbmVudC5qcyIsInRlc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBwUmVnaXN0cnkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50cyhjb21wb25lbnRzQ2xhc3Nlcyl7XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudHNDbGFzc2VzKS5mb3JFYWNoKChjb21wb25lbnRDbGFzc05hbWUpPT57XG4gICAgICAgICAgICBpZighdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50Q2xhc3NOYW1lKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUsY29tcG9uZW50c0NsYXNzZXNbY29tcG9uZW50Q2xhc3NOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnQobmFtZSxjbGF6eikge1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgY2xheno6IGNsYXp6XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRDb21wb25lbnRCeU5hbWUoZWxlbWVudCxjb21wb25lbnROYW1lKXtcbiAgICAgICAgbGV0IGluc3RhbmNlPW51bGw7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciBjbGF6eiA9IHRoaXMuZ2V0Q29tcG9uZW50KGNvbXBvbmVudE5hbWUpO1xuICAgICAgICAgICAgaW5zdGFuY2U9bmV3IGNsYXp6KGVsZW1lbnQpOyAvL1N0YXJ0IFVwIENvbXBvbmVudFxuICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igd2hlbiB0cnlpbmcgdG8gaW5zdGFuY2UgQ29tcG9uZW50IFwiICsgY29tcG9uZW50TmFtZSArXCI6IFwiKyBlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWUpIHtcbiAgICAgICAgdmFyIGNvbXAgPSB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKGMgPT4gYy5uYW1lID09IG5hbWUpLm1hcChjID0+IGMuY2xhenopWzBdO1xuICAgICAgICByZXR1cm4gY29tcDtcbiAgICB9XG59XG5cbnZhciBBcHBSZWdpc3RyeSQxID0gbmV3IEFwcFJlZ2lzdHJ5KCk7XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50Q29tcG9uZW50LCBwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5pbml0KGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKXtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5iaW5kZWRFbGVtZW50cyA9IHtcImNsaWNrXCI6W119O1xuICAgICAgICB0aGlzLl9jb21wb25lbnRJZCA9ICB0aGlzLmdlbmVyYXRlVWlkKCk7XG4gICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50ID0gcGFyZW50Q29tcG9uZW50O1xuICAgICAgICB0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcblxuXG5cbiAgICAgICAgLy9TZXJ2ZSBwZXIgcmVjdXBlcmFyZSBpbCBjb21wb25lbnRlICB0cmFtaXRlIHVuIG5vbWUgZGkgZmFudGFzaWEgY29udGVudXRvIG5lbGwnYXR0cmlidXRvIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVxuICAgICAgICBsZXQgY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPyB0aGlzLnBhcmFtcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lIDogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKTtcbiAgICAgICAgY29tcG9uZW50UmVmZXJlbmNlTmFtZT1jb21wb25lbnRSZWZlcmVuY2VOYW1lIHx8IHRoaXMuX2NvbXBvbmVudElkO1xuXG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IGNvbXBvbmVudFJlZmVyZW5jZU5hbWU7XG4gICAgICAgIGlmICghZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIsIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudC1pZFwiLHRoaXMuX2NvbXBvbmVudElkKTtcblxuICAgICAgICBpZighdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiKSl7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIsdGhpcy5jb25zdHJ1Y3Rvci5uYW1lKTtcbiAgICAgICAgfVxuXG5cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGhpcy52ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpKXtcbiAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBpcyBhbHJlYWR5IHVzZWQgaW4gXCIrdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgaHllcmFyY2h5XCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnBhcmVudENvbXBvbmVudCl7XG4gICAgICAgICAgICB0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdID0gdGhpcztcbiAgICAgICAgfVxuXG5cblxuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtY2xpY2tcIikpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2Rlc1RvQmluZCA9dGhpcy5nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQoW3RoaXMuZWxlbWVudF0pO1xuICAgICAgICBpZihub2Rlc1RvQmluZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXNUb0JpbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayhub2Rlc1RvQmluZFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL1RoZSBtdXRhdGlvbk9ic2VydmVyIGlzIHVzZWQgaW4gb3JkZXIgdG8gcmV0cmlldmUgYW5kIGhhbmRsaW5nIGNvbXBvbmVudC1cImV2ZW50XCJcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLmV2ZW50TXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50LHthdHRyaWJ1dGVzOiBmYWxzZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIHZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5KCl7XG4gICAgICAgIHJldHVybiAgIXRoaXMucGFyZW50Q29tcG9uZW50IHx8ICggdGhpcy5wYXJlbnRDb21wb25lbnQgJiYgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHNbdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lXSk7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVVaWQoKSB7XG4gICAgICAgIHJldHVybiAgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lK1wiX1wiKyd4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLFxuICAgICAgICAgICAgICAgIHYgPSBjID09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCk7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsaWNrSGFuZGxlcihldikge1xuICAgICAgICBsZXQgZnVuY3Rpb25Db2RlID0gZXYuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudC1jbGljaycpO1xuICAgICAgICBsZXQgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVswXTtcblxuICAgICAgICBmdW5jdGlvbiBleHRyYWN0UGFyYW1zKC4uLnBhcmFtcykge1xuXG4gICAgICAgICAgICBsZXQgcGFyYW1ldGVycz1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1ldGVycy5tYXAoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgIGlmKHBhcmFtPT1cInRoaXNcIil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldjtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzW2Z1bmN0aW9uTmFtZV0pe1xuICAgICAgICAgICAgdGhpc1tmdW5jdGlvbk5hbWVdLmFwcGx5KHRoaXMsIGV2YWwoXCJleHRyYWN0UGFyYW1zKFwiK2Z1bmN0aW9uQ29kZS5zcGxpdChcIihcIilbMV0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRDaGlsZENvbXBvbmVudHMocGFyZW50Q29tcG9uZW50KSB7XG4gICAgICAgIGxldCBjb21wb25lbnRzTG9hZGVkPVtdO1xuICAgICAgICB2YXIgY29tcG9uZW50c0VscyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbY29tcG9uZW50XScpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHNFbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRJZCA9IGNvbXBvbmVudHNFbHNbaV0uZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtaWQnKTtcblxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRJZCkge1xuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgdmFyIENsYXp6ID0gQXBwUmVnaXN0cnkkMS5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgYmluZENvbXBvbmVudENsaWNrKG5vZGUpIHtcblxuICAgICAgICBsZXQgaXNBbHJlYWR5QmluZGVkPXRoaXMuYmluZGVkRWxlbWVudHNbXCJjbGlja1wiXS5yZWR1Y2UoKGFjY3VtdWxhdG9yLGN1cnJlbnROb2RlKT0+e1xuICAgICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yIHx8IGN1cnJlbnROb2RlLmlzRXF1YWxOb2RlKG5vZGUpO1xuICAgICAgICB9LGZhbHNlKTtcblxuICAgICAgICBpZighaXNBbHJlYWR5QmluZGVkKXtcbiAgICAgICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHNbXCJjbGlja1wiXS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlcihlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpe1xuICAgICAgICBsZXQgcGFyZW50c0NvbXBvbmVudD0gdGhpcy5nZXREb21FbGVtZW50UGFyZW50cyggbm9kZSwgJ1tjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVdJyk7XG4gICAgICAgIGlmKHBhcmVudHNDb21wb25lbnQubGVuZ3RoPjAgJiYgcGFyZW50c0NvbXBvbmVudFswXS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIik9PXRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSl7XG4gICAgICAgICAgICB0aGlzLmJpbmRDb21wb25lbnRDbGljayhub2RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXREb21FbGVtZW50UGFyZW50cyhlbGVtLCBzZWxlY3Rvcil7XG4gICAgICAgIC8vIFNldHVwIHBhcmVudHMgYXJyYXlcbiAgICAgICAgdmFyIHBhcmVudHMgPSBbXTtcbiAgICAgICAgLy8gR2V0IG1hdGNoaW5nIHBhcmVudCBlbGVtZW50c1xuICAgICAgICBmb3IgKCA7IGVsZW0gJiYgZWxlbSAhPT0gZG9jdW1lbnQ7IGVsZW0gPSBlbGVtLnBhcmVudE5vZGUgKSB7XG4gICAgICAgICAgICAvLyBBZGQgbWF0Y2hpbmcgcGFyZW50cyB0byBhcnJheVxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGVsZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJlbnRzO1xuICAgIH1cblxuXG4gICAgZXZlbnRNdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgIGlmKG11dGF0aW9uc0xpc3QgJiYgbXV0YXRpb25zTGlzdC5sZW5ndGg+MCl7XG4gICAgICAgICAgICBsZXQgbXV0YXRpb25FbGVtZW50cz0gbXV0YXRpb25zTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5hZGRlZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB9KS5yZWR1Y2UoKHByZXYsIGN1cnJlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5jb25jYXQodGhpcy5nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQoY3VycmVudC5hZGRlZE5vZGVzKSk7XG4gICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIGlmKG11dGF0aW9uRWxlbWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobXV0YXRpb25FbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKG1vZGVzVG9DaGVjayl7XG4gICAgICAgIGxldCBub2Rlc1RvQmluZD1bXTtcbiAgICAgICAgaWYobW9kZXNUb0NoZWNrLmxlbmd0aCl7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVzVG9DaGVjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBub2RlPW1vZGVzVG9DaGVja1tpXTtcbiAgICAgICAgICAgICAgICBpZihub2RlLnF1ZXJ5U2VsZWN0b3JBbGwpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcG9uZW50Q2xpY2tFbGVtZW50cyA9bm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbY29tcG9uZW50LWNsaWNrXScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXBvbmVudENsaWNrRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvQmluZC5wdXNoKGNvbXBvbmVudENsaWNrRWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2Rlc1RvQmluZDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEFwcFJlZ2lzdHJ5JDEgYXMgQXBwUmVnaXN0cnksIENvbXBvbmVudCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVMjFoY25SRGIyMXdiMjVsYm5SS1V5NXFjeUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDBGd2NGSmxaMmx6ZEhKNUxtcHpJaXdpTGk0dmMzSmpMME52YlhCdmJtVnVkQzVxY3lKZExDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SmNibU5zWVhOeklFRndjRkpsWjJsemRISjVJSHRjYmlBZ0lDQmpiMjV6ZEhKMVkzUnZjaWdwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVqYjIxd2IyNWxiblJ6SUQwZ1cxMDdYRzRnSUNBZ2ZWeHVYRzVjYmlBZ0lDQnlaV2RwYzNSbGNrTnZiWEJ2Ym1WdWRITW9ZMjl0Y0c5dVpXNTBjME5zWVhOelpYTXBlMXh1SUNBZ0lDQWdJQ0JQWW1wbFkzUXVhMlY1Y3loamIyMXdiMjVsYm5SelEyeGhjM05sY3lrdVptOXlSV0ZqYUNnb1kyOXRjRzl1Wlc1MFEyeGhjM05PWVcxbEtUMCtlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWW9JWFJvYVhNdVoyVjBRMjl0Y0c5dVpXNTBLR052YlhCdmJtVnVkRU5zWVhOelRtRnRaU2twZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVjbVZuYVhOMFpYSkRiMjF3YjI1bGJuUW9ZMjl0Y0c5dVpXNTBRMnhoYzNOT1lXMWxMR052YlhCdmJtVnVkSE5EYkdGemMyVnpXMk52YlhCdmJtVnVkRU5zWVhOelRtRnRaVjBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5S1Z4dUlDQWdJSDFjYmx4dVhHNGdJQ0FnY21WbmFYTjBaWEpEYjIxd2IyNWxiblFvYm1GdFpTeGpiR0Y2ZWlrZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TG1OdmJYQnZibVZ1ZEhNdWNIVnphQ2g3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVZVzFsT2lCdVlXMWxMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1kyeGhlbm82SUdOc1lYcDZYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR2x1YVhSRGIyMXdiMjVsYm5SQ2VVNWhiV1VvWld4bGJXVnVkQ3hqYjIxd2IyNWxiblJPWVcxbEtYdGNiaUFnSUNBZ0lDQWdiR1YwSUdsdWMzUmhibU5sUFc1MWJHdzdYRzRnSUNBZ0lDQWdJSFJ5ZVh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCamJHRjZlaUE5SUhSb2FYTXVaMlYwUTI5dGNHOXVaVzUwS0dOdmJYQnZibVZ1ZEU1aGJXVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXNXpkR0Z1WTJVOWJtVjNJR05zWVhwNktHVnNaVzFsYm5RcE95QXZMMU4wWVhKMElGVndJRU52YlhCdmJtVnVkRnh1SUNBZ0lDQWdJQ0I5WTJGMFkyZ29aU2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0Z3aVJYSnliM0lnZDJobGJpQjBjbmxwYm1jZ2RHOGdhVzV6ZEdGdVkyVWdRMjl0Y0c5dVpXNTBJRndpSUNzZ1kyOXRjRzl1Wlc1MFRtRnRaU0FyWENJNklGd2lLeUJsS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2FXNXpkR0Z1WTJVN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWjJWMFEyOXRjRzl1Wlc1MEtHNWhiV1VwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJR052YlhBZ1BTQjBhR2x6TG1OdmJYQnZibVZ1ZEhNdVptbHNkR1Z5S0dNZ1BUNGdZeTV1WVcxbElEMDlJRzVoYldVcExtMWhjQ2hqSUQwK0lHTXVZMnhoZW5vcFd6QmRPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMjl0Y0R0Y2JpQWdJQ0I5WEc1OVhHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElHNWxkeUJCY0hCU1pXZHBjM1J5ZVNncE8xeHVJaXdpYVcxd2IzSjBJRUZ3Y0ZKbFoybHpkSEo1SUdaeWIyMGdKeTR2UVhCd1VtVm5hWE4wY25rbk8xeHVYRzVqYkdGemN5QkRiMjF3YjI1bGJuUWdlMXh1SUNBZ0lHTnZibk4wY25WamRHOXlLR1ZzWlcxbGJuUXNJSEJoY21WdWRFTnZiWEJ2Ym1WdWRDd2djR0Z5WVcxektTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdWFXNXBkQ2hsYkdWdFpXNTBMQ0J3WVhKbGJuUkRiMjF3YjI1bGJuUXNJSEJoY21GdGN5azdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXNXBkQ2hsYkdWdFpXNTBMQ0J3WVhKbGJuUkRiMjF3YjI1bGJuUXNJSEJoY21GdGN5bDdYRzRnSUNBZ0lDQWdJSFJvYVhNdVpXeGxiV1Z1ZENBOUlHVnNaVzFsYm5RN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WW1sdVpHVmtSV3hsYldWdWRITWdQU0I3WENKamJHbGphMXdpT2x0ZGZUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkyOXRjRzl1Wlc1MFNXUWdQU0FnZEdocGN5NW5aVzVsY21GMFpWVnBaQ2dwTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbkJoY21WdWRFTnZiWEJ2Ym1WdWRDQTlJSEJoY21WdWRFTnZiWEJ2Ym1WdWREdGNiaUFnSUNBZ0lDQWdkR2hwY3k1amIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdkR2hwY3k1d1lYSmhiWE1nUFNCd1lYSmhiWE1nZkh3Z2UzMDdYRzVjYmx4dVhHNGdJQ0FnSUNBZ0lDOHZVMlZ5ZG1VZ2NHVnlJSEpsWTNWd1pYSmhjbVVnYVd3Z1kyOXRjRzl1Wlc1MFpTQWdkSEpoYldsMFpTQjFiaUJ1YjIxbElHUnBJR1poYm5SaGMybGhJR052Ym5SbGJuVjBieUJ1Wld4c0oyRjBkSEpwWW5WMGJ5QmpiMjF3YjI1bGJuUXRjbVZtWlhKbGJtTmxMVzVoYldWY2JpQWdJQ0FnSUNBZ2JHVjBJR052YlhCdmJtVnVkRkpsWm1WeVpXNWpaVTVoYldVZ1BTQjBhR2x6TG5CaGNtRnRjeTVqYjIxd2IyNWxiblJTWldabGNtVnVZMlZPWVcxbElEOGdkR2hwY3k1d1lYSmhiWE11WTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTQTZJSFJvYVhNdVpXeGxiV1Z1ZEM1blpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblF0Y21WbVpYSmxibU5sTFc1aGJXVmNJaWs3WEc0Z0lDQWdJQ0FnSUdOdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVTlZMjl0Y0c5dVpXNTBVbVZtWlhKbGJtTmxUbUZ0WlNCOGZDQjBhR2x6TGw5amIyMXdiMjVsYm5SSlpEdGNibHh1SUNBZ0lDQWdJQ0IwYUdsekxtTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1VnUFNCamIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxPMXh1SUNBZ0lDQWdJQ0JwWmlBb0lXVnNaVzFsYm5RdVoyVjBRWFIwY21saWRYUmxLRndpWTI5dGNHOXVaVzUwTFhKbFptVnlaVzVqWlMxdVlXMWxYQ0lwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JsYkdWdFpXNTBMbk5sZEVGMGRISnBZblYwWlNoY0ltTnZiWEJ2Ym1WdWRDMXlaV1psY21WdVkyVXRibUZ0WlZ3aUxDQmpiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJSFJvYVhNdVpXeGxiV1Z1ZEM1elpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblF0YVdSY0lpeDBhR2x6TGw5amIyMXdiMjVsYm5SSlpDazdYRzVjYmlBZ0lDQWdJQ0FnYVdZb0lYUm9hWE11Wld4bGJXVnVkQzVuWlhSQmRIUnlhV0oxZEdVb1hDSmpiMjF3YjI1bGJuUmNJaWtwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1bGJHVnRaVzUwTG5ObGRFRjBkSEpwWW5WMFpTaGNJbU52YlhCdmJtVnVkRndpTEhSb2FYTXVZMjl1YzNSeWRXTjBiM0l1Ym1GdFpTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dVhHNWNibHh1SUNBZ0lDQWdJQ0JwWmloMGFHbHpMbkJoY21WdWRFTnZiWEJ2Ym1WdWRDQW1KaUFoZEdocGN5NXdZWEpsYm5SRGIyMXdiMjVsYm5RdVkyOXRjRzl1Wlc1MGN5bDdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbkJoY21WdWRFTnZiWEJ2Ym1WdWRDNWpiMjF3YjI1bGJuUnpQWHQ5TzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdhV1lvSVhSb2FYTXVkbVZ5YVdaNVEyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaVlZ1YVdOcGRIa29LU2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCMGFHbHpMbU52YlhCdmJtVnVkRkpsWm1WeVpXNWpaVTVoYldVZ0sxd2lJR052YlhCdmJtVnVkRkpsWm1WeVpXNWpaVTVoYldVZ2FYTWdZV3h5WldGa2VTQjFjMlZrSUdsdUlGd2lLM1JvYVhNdWNHRnlaVzUwUTI5dGNHOXVaVzUwTG1OdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVWdLMXdpSUdoNVpYSmhjbU5vZVZ3aU8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnYVdZb2RHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjMXRqYjIxd2IyNWxiblJTWldabGNtVnVZMlZPWVcxbFhTQTlJSFJvYVhNN1hHNGdJQ0FnSUNBZ0lIMWNibHh1WEc1Y2JseHVJQ0FnSUNBZ0lDQnBaaWgwYUdsekxtVnNaVzFsYm5RdVoyVjBRWFIwY21saWRYUmxLRndpWTI5dGNHOXVaVzUwTFdOc2FXTnJYQ0lwS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVltbHVaRU52YlhCdmJtVnVkRU5zYVdOcktIUm9hWE11Wld4bGJXVnVkQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQnNaWFFnYm05a1pYTlViMEpwYm1RZ1BYUm9hWE11WjJWMFEyOXRjRzl1Wlc1MFEyeHBZMnRPYjJSbFZHOUNhVzVrS0Z0MGFHbHpMbVZzWlcxbGJuUmRLVHRjYmlBZ0lDQWdJQ0FnYVdZb2JtOWtaWE5VYjBKcGJtUXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHNXZaR1Z6Vkc5Q2FXNWtMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVqYUdWamEwTnZiWEJ2Ym1WdWRITklhV1Z5WVhKamFIbEJibVJDYVc1a1EyeHBZMnNvYm05a1pYTlViMEpwYm1SYmFWMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnTHk5VWFHVWdiWFYwWVhScGIyNVBZbk5sY25abGNpQnBjeUIxYzJWa0lHbHVJRzl5WkdWeUlIUnZJSEpsZEhKcFpYWmxJR0Z1WkNCb1lXNWtiR2x1WnlCamIyMXdiMjVsYm5RdFhDSmxkbVZ1ZEZ3aVhHNGdJQ0FnSUNBZ0lIUm9hWE11YlhWMFlYUnBiMjVQWW5ObGNuWmxjajBnYm1WM0lFMTFkR0YwYVc5dVQySnpaWEoyWlhJb2RHaHBjeTVsZG1WdWRFMTFkR0YwYVc5dVNHRnVaR3hsY2k1aWFXNWtLSFJvYVhNcEtUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1dGRYUmhkR2x2Yms5aWMyVnlkbVZ5TG05aWMyVnlkbVVvWld4bGJXVnVkQ3g3WVhSMGNtbGlkWFJsY3pvZ1ptRnNjMlVzSUdOb2FXeGtUR2x6ZERvZ2RISjFaU3dnWTJoaGNtRmpkR1Z5UkdGMFlUb2dabUZzYzJVc0lITjFZblJ5WldVNklIUnlkV1Y5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0IyWlhKcFpubERiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsVlc1cFkybDBlU2dwZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnSUNGMGFHbHpMbkJoY21WdWRFTnZiWEJ2Ym1WdWRDQjhmQ0FvSUhSb2FYTXVjR0Z5Wlc1MFEyOXRjRzl1Wlc1MElDWW1JQ0YwYUdsekxuQmhjbVZ1ZEVOdmJYQnZibVZ1ZEM1amIyMXdiMjVsYm5SelczUm9hWE11WTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpWMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHZGxibVZ5WVhSbFZXbGtLQ2tnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnSUhSb2FYTXVZMjl1YzNSeWRXTjBiM0l1Ym1GdFpTdGNJbDljSWlzbmVIaDRlSGg0ZUhnbkxuSmxjR3hoWTJVb0wxdDRlVjB2Wnl3Z1puVnVZM1JwYjI0Z0tHTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5SUQwZ1RXRjBhQzV5WVc1a2IyMG9LU0FxSURFMklId2dNQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IySUQwZ1l5QTlQU0FuZUNjZ1B5QnlJRG9nS0hJZ0ppQXdlRE1nZkNBd2VEZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhZdWRHOVRkSEpwYm1jb01UWXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JqYkdsamEwaGhibVJzWlhJb1pYWXBJSHRjYmlBZ0lDQWdJQ0FnYkdWMElHWjFibU4wYVc5dVEyOWtaU0E5SUdWMkxtTjFjbkpsYm5SVVlYSm5aWFF1WjJWMFFYUjBjbWxpZFhSbEtDZGpiMjF3YjI1bGJuUXRZMnhwWTJzbktUdGNiaUFnSUNBZ0lDQWdiR1YwSUdaMWJtTjBhVzl1VG1GdFpTQTlJR1oxYm1OMGFXOXVRMjlrWlM1emNHeHBkQ2hjSWloY0lpbGJNRjA3WEc1Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1pYaDBjbUZqZEZCaGNtRnRjeWd1TGk1d1lYSmhiWE1wSUh0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnYkdWMElIQmhjbUZ0WlhSbGNuTTlXMTB1YzJ4cFkyVXVZMkZzYkNoaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEJoY21GdFpYUmxjbk11YldGd0tDaHdZWEpoYlNrOVBudGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaWh3WVhKaGJUMDlYQ0owYUdselhDSXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWlhZN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZXVnNjMlY3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCd1lYSmhiVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVnh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2FXWW9kR2hwYzF0bWRXNWpkR2x2Yms1aGJXVmRLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE5iWm5WdVkzUnBiMjVPWVcxbFhTNWhjSEJzZVNoMGFHbHpMQ0JsZG1Gc0tGd2laWGgwY21GamRGQmhjbUZ0Y3loY0lpdG1kVzVqZEdsdmJrTnZaR1V1YzNCc2FYUW9YQ0lvWENJcFd6RmRLU2xjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJR3h2WVdSRGFHbHNaRU52YlhCdmJtVnVkSE1vY0dGeVpXNTBRMjl0Y0c5dVpXNTBLU0I3WEc0Z0lDQWdJQ0FnSUd4bGRDQmpiMjF3YjI1bGJuUnpURzloWkdWa1BWdGRPMXh1SUNBZ0lDQWdJQ0IyWVhJZ1kyOXRjRzl1Wlc1MGMwVnNjeUE5SUhSb2FYTXVaV3hsYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5UVd4c0tDZGJZMjl0Y0c5dVpXNTBYU2NwTzF4dUlDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHTnZiWEJ2Ym1WdWRITkZiSE11YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmpiMjF3YjI1bGJuUkpaQ0E5SUdOdmJYQnZibVZ1ZEhORmJITmJhVjB1WjJWMFFYUjBjbWxpZFhSbEtDZGpiMjF3YjI1bGJuUXRhV1FuS1R0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRmpiMjF3YjI1bGJuUkpaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQmpiMjF3YjI1bGJuUWdQU0JqYjIxd2IyNWxiblJ6Uld4elcybGRMbWRsZEVGMGRISnBZblYwWlNnblkyOXRjRzl1Wlc1MEp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUVOc1lYcDZJRDBnUVhCd1VtVm5hWE4wY25rdVoyVjBRMjl0Y0c5dVpXNTBLR052YlhCdmJtVnVkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTI5dGNHOXVaVzUwYzB4dllXUmxaQzV3ZFhOb0tDQnVaWGNnUTJ4aGVub29ZMjl0Y0c5dVpXNTBjMFZzYzF0cFhTeHdZWEpsYm5SRGIyMXdiMjVsYm5RZ2ZId2dkR2hwY3lrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCamIyMXdiMjVsYm5SelRHOWhaR1ZrTzF4dUlDQWdJSDFjYmx4dUlDQWdJR0pwYm1SRGIyMXdiMjVsYm5SRGJHbGpheWh1YjJSbEtTQjdYRzVjYmlBZ0lDQWdJQ0FnYkdWMElHbHpRV3h5WldGa2VVSnBibVJsWkQxMGFHbHpMbUpwYm1SbFpFVnNaVzFsYm5Selcxd2lZMnhwWTJ0Y0lsMHVjbVZrZFdObEtDaGhZMk4xYlhWc1lYUnZjaXhqZFhKeVpXNTBUbTlrWlNrOVBudGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJoWTJOMWJYVnNZWFJ2Y2lCOGZDQmpkWEp5Wlc1MFRtOWtaUzVwYzBWeGRXRnNUbTlrWlNodWIyUmxLVHRjYmlBZ0lDQWdJQ0FnZlN4bVlXeHpaU2s3WEc1Y2JpQWdJQ0FnSUNBZ2FXWW9JV2x6UVd4eVpXRmtlVUpwYm1SbFpDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbUpwYm1SbFpFVnNaVzFsYm5Selcxd2lZMnhwWTJ0Y0lsMHVjSFZ6YUNodWIyUmxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHNXZaR1V1WVdSa1JYWmxiblJNYVhOMFpXNWxjaWduWTJ4cFkyc25MQ0FvWlNrOVBpQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1amJHbGphMGhoYm1Sc1pYSW9aU2xjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZMmhsWTJ0RGIyMXdiMjVsYm5SelNHbGxjbUZ5WTJoNVFXNWtRbWx1WkVOc2FXTnJLRzV2WkdVcGUxeHVJQ0FnSUNBZ0lDQnNaWFFnY0dGeVpXNTBjME52YlhCdmJtVnVkRDBnZEdocGN5NW5aWFJFYjIxRmJHVnRaVzUwVUdGeVpXNTBjeWdnYm05a1pTd2dKMXRqYjIxd2IyNWxiblF0Y21WbVpYSmxibU5sTFc1aGJXVmRKeWs3WEc0Z0lDQWdJQ0FnSUdsbUtIQmhjbVZ1ZEhORGIyMXdiMjVsYm5RdWJHVnVaM1JvUGpBZ0ppWWdjR0Z5Wlc1MGMwTnZiWEJ2Ym1WdWRGc3dYUzVuWlhSQmRIUnlhV0oxZEdVb1hDSmpiMjF3YjI1bGJuUXRjbVZtWlhKbGJtTmxMVzVoYldWY0lpazlQWFJvYVhNdVkyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaU2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1KcGJtUkRiMjF3YjI1bGJuUkRiR2xqYXlodWIyUmxLVHRjYmlBZ0lDQWdJQ0FnZldWc2MyVjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JuWlhSRWIyMUZiR1Z0Wlc1MFVHRnlaVzUwY3lobGJHVnRMQ0J6Wld4bFkzUnZjaWw3WEc0Z0lDQWdJQ0FnSUM4dklGTmxkSFZ3SUhCaGNtVnVkSE1nWVhKeVlYbGNiaUFnSUNBZ0lDQWdkbUZ5SUhCaGNtVnVkSE1nUFNCYlhUdGNiaUFnSUNBZ0lDQWdMeThnUjJWMElHMWhkR05vYVc1bklIQmhjbVZ1ZENCbGJHVnRaVzUwYzF4dUlDQWdJQ0FnSUNCbWIzSWdLQ0E3SUdWc1pXMGdKaVlnWld4bGJTQWhQVDBnWkc5amRXMWxiblE3SUdWc1pXMGdQU0JsYkdWdExuQmhjbVZ1ZEU1dlpHVWdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJCWkdRZ2JXRjBZMmhwYm1jZ2NHRnlaVzUwY3lCMGJ5QmhjbkpoZVZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hObGJHVmpkRzl5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1ZzWlcwdWJXRjBZMmhsY3loelpXeGxZM1J2Y2lrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dGeVpXNTBjeTV3ZFhOb0tHVnNaVzBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjR0Z5Wlc1MGN5NXdkWE5vS0dWc1pXMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQndZWEpsYm5Sek8xeHVJQ0FnSUgxY2JseHVYRzRnSUNBZ1pYWmxiblJOZFhSaGRHbHZia2hoYm1Sc1pYSW9iWFYwWVhScGIyNXpUR2x6ZENsN1hHNGdJQ0FnSUNBZ0lHbG1LRzExZEdGMGFXOXVjMHhwYzNRZ0ppWWdiWFYwWVhScGIyNXpUR2x6ZEM1c1pXNW5kR2crTUNsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlhRZ2JYVjBZWFJwYjI1RmJHVnRaVzUwY3owZ2JYVjBZWFJwYjI1elRHbHpkQzVtYVd4MFpYSW9LRzBwSUQwK0lIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2JTNWhaR1JsWkU1dlpHVnpMbXhsYm1kMGFDQStJREE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLUzV5WldSMVkyVW9LSEJ5WlhZc0lHTjFjbkpsYm5RcElEMCtJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdjSEpsZGk1amIyNWpZWFFvZEdocGN5NW5aWFJEYjIxd2IyNWxiblJEYkdsamEwNXZaR1ZVYjBKcGJtUW9ZM1Z5Y21WdWRDNWhaR1JsWkU1dlpHVnpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMQ0JiWFNrN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUtHMTFkR0YwYVc5dVJXeGxiV1Z1ZEhNdWJHVnVaM1JvS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHMTFkR0YwYVc5dVJXeGxiV1Z1ZEhNdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVqYUdWamEwTnZiWEJ2Ym1WdWRITklhV1Z5WVhKamFIbEJibVJDYVc1a1EyeHBZMnNvYlhWMFlYUnBiMjVGYkdWdFpXNTBjMXRwWFNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNGdJQ0FnWjJWMFEyOXRjRzl1Wlc1MFEyeHBZMnRPYjJSbFZHOUNhVzVrS0cxdlpHVnpWRzlEYUdWamF5bDdYRzRnSUNBZ0lDQWdJR3hsZENCdWIyUmxjMVJ2UW1sdVpEMWJYVHRjYmlBZ0lDQWdJQ0FnYVdZb2JXOWtaWE5VYjBOb1pXTnJMbXhsYm1kMGFDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHMXZaR1Z6Vkc5RGFHVmpheTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0J1YjJSbFBXMXZaR1Z6Vkc5RGFHVmphMXRwWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppaHViMlJsTG5GMVpYSjVVMlZzWldOMGIzSkJiR3dwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnNaWFFnWTI5dGNHOXVaVzUwUTJ4cFkydEZiR1Z0Wlc1MGN5QTlibTlrWlM1eGRXVnllVk5sYkdWamRHOXlRV3hzS0NkYlkyOXRjRzl1Wlc1MExXTnNhV05yWFNjcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyOXRjRzl1Wlc1MFEyeHBZMnRGYkdWdFpXNTBjeTVzWlc1bmRHZ2dQaUF3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLR3hsZENCcElEMGdNRHNnYVNBOElHTnZiWEJ2Ym1WdWRFTnNhV05yUld4bGJXVnVkSE11YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J1YjJSbGMxUnZRbWx1WkM1d2RYTm9LR052YlhCdmJtVnVkRU5zYVdOclJXeGxiV1Z1ZEhOYmFWMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCdWIyUmxjMVJ2UW1sdVpEdGNiaUFnSUNCOVhHNTlYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJQ0JEYjIxd2IyNWxiblE3SWwwc0ltNWhiV1Z6SWpwYklrRndjRkpsWjJsemRISjVJbDBzSW0xaGNIQnBibWR6SWpvaVFVRkRRU3hOUVVGTkxGZEJRVmNzUTBGQlF6dEpRVU5rTEZkQlFWY3NSMEZCUnp0UlFVTldMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETzB0QlEzaENPenM3U1VGSFJDeHJRa0ZCYTBJc1EwRkJReXhwUWtGQmFVSXNRMEZCUXp0UlFVTnFReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNhMEpCUVd0Q0xFZEJRVWM3V1VGRGVrUXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJRenRuUWtGRGRFTXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEd0Q1FVRnJRaXhEUVVGRExHbENRVUZwUWl4RFFVRkRMR3RDUVVGclFpeERRVUZETEVOQlFVTXNRMEZCUXp0aFFVTndSanRUUVVOS0xFVkJRVU03UzBGRFREczdPMGxCUjBRc2FVSkJRV2xDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSVHRSUVVNeFFpeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVOcVFpeEpRVUZKTEVWQlFVVXNTVUZCU1R0WlFVTldMRXRCUVVzc1JVRkJSU3hMUVVGTE8xTkJRMllzUTBGQlF5eERRVUZETzB0QlEwNDdPMGxCUlVRc2JVSkJRVzFDTEVOQlFVTXNUMEZCVHl4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVOMFF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN1VVRkRiRUlzUjBGQlJ6dFpRVU5ETEVsQlFVa3NTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTTdXVUZETjBNc1VVRkJVU3hEUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMU5CUXk5Q0xFMUJRVTBzUTBGQlF5eERRVUZETzFsQlEwd3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXd3UTBGQk1FTXNSMEZCUnl4aFFVRmhMRVZCUVVVc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzFOQlEzUkdPMUZCUTBRc1QwRkJUeXhSUVVGUkxFTkJRVU03UzBGRGJrSTdPMGxCUlVRc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJUdFJRVU5tTEVsQlFVa3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1NVRkJTU3hKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUXpWRkxFOUJRVThzU1VGQlNTeERRVUZETzB0QlEyWTdRMEZEU2pzN1FVRkZSQ3h2UWtGQlpTeEpRVUZKTEZkQlFWY3NSVUZCUlN4RFFVRkRPenRCUTNSRGFrTXNUVUZCVFN4VFFVRlRMRU5CUVVNN1NVRkRXaXhYUVVGWExFTkJRVU1zVDBGQlR5eEZRVUZGTEdWQlFXVXNSVUZCUlN4TlFVRk5MRVZCUVVVN1VVRkRNVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRVZCUVVVc1pVRkJaU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETzB0QlF5OURPenRKUVVWRUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRkZMRTFCUVUwc1EwRkJRenRSUVVOc1F5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVOMlFpeEpRVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEyNURMRWxCUVVrc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeERRVUZETEZkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUTNoRExFbEJRVWtzUTBGQlF5eGxRVUZsTEVkQlFVY3NaVUZCWlN4RFFVRkRPMUZCUTNaRExFbEJRVWtzUTBGQlF5eHpRa0ZCYzBJc1IwRkJSeXhKUVVGSkxFTkJRVU03VVVGRGJrTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhOUVVGTkxFbEJRVWtzUlVGQlJTeERRVUZET3pzN096dFJRVXN6UWl4SlFVRkpMSE5DUVVGelFpeEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8xRkJRemRLTEhOQ1FVRnpRaXhEUVVGRExITkNRVUZ6UWl4SlFVRkpMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU03TzFGQlJXNUZMRWxCUVVrc1EwRkJReXh6UWtGQmMwSXNSMEZCUnl4elFrRkJjMElzUTBGQlF6dFJRVU55UkN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhGUVVGRk8xbEJRMjVFTEU5QlFVOHNRMEZCUXl4WlFVRlpMRU5CUVVNc01FSkJRVEJDTEVWQlFVVXNjMEpCUVhOQ0xFTkJRVU1zUTBGQlF6dFRRVU0xUlRzN1VVRkZSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZsQlFWa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZET3p0UlFVVTFSQ3hIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4WlFVRlpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRGRrTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VTBGRGFFVTdPenM3TzFGQlMwUXNSMEZCUnl4SlFVRkpMRU5CUVVNc1pVRkJaU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4VlFVRlZMRU5CUVVNN1dVRkRlRVFzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hEUVVGRE8xTkJRM1JET3p0UlFVVkVMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zYlVOQlFXMURMRVZCUVVVc1EwRkJRenRaUVVNelF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4elFrRkJjMElzUlVGQlJTdzJRMEZCTmtNc1EwRkJReXhKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEhOQ1FVRnpRaXhGUVVGRkxGbEJRVmtzUTBGQlF6dFRRVU01U1RzN1VVRkZSQ3hIUVVGSExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTTdXVUZEY0VJc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eFZRVUZWTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdVMEZEYkVVN096czdPMUZCUzBRc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZsQlFWa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eERRVUZETzFsQlF6VkRMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGRGVrTTdPMUZCUlVRc1NVRkJTU3hYUVVGWExFVkJRVVVzU1VGQlNTeERRVUZETERKQ1FVRXlRaXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRiRVVzUjBGQlJ5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZPMWxCUTI1Q0xFdEJRVXNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhYUVVGWExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZPMmRDUVVONlF5eEpRVUZKTEVOQlFVTXNiME5CUVc5RExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkROMFE3VTBGRFNqczdPMUZCUjBRc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RlFVRkZMRWxCUVVrc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRzlDUVVGdlFpeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMnhHTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFdEJRVXNzUlVGQlJTeFRRVUZUTEVWQlFVVXNTVUZCU1N4RlFVRkZMR0ZCUVdFc1JVRkJSU3hMUVVGTExFVkJRVVVzVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkRjRWc3TzBsQlJVUXNiVU5CUVcxRExFVkJRVVU3VVVGRGFrTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhsUVVGbExFMUJRVTBzU1VGQlNTeERRVUZETEdWQlFXVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhsUVVGbExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4elFrRkJjMElzUTBGQlF5eERRVUZETEVOQlFVTTdTMEZETjBnN08wbEJSVVFzVjBGQlZ5eEhRVUZITzFGQlExWXNVVUZCVVN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEVWQlFVVTdXVUZEZGtVc1NVRkJTU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhEUVVGRE8yZENRVU14UWl4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU4yUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVMEZEZWtJc1EwRkJReXhEUVVGRE8wdEJRMDQ3TzBsQlJVUXNXVUZCV1N4RFFVRkRMRVZCUVVVc1JVRkJSVHRSUVVOaUxFbEJRVWtzV1VGQldTeEhRVUZITEVWQlFVVXNRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN1VVRkRjRVVzU1VGQlNTeFpRVUZaTEVkQlFVY3NXVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXpzN1VVRkZPVU1zVTBGQlV5eGhRVUZoTEVOQlFVTXNSMEZCUnl4TlFVRk5MRVZCUVVVN08xbEJSVGxDTEVsQlFVa3NWVUZCVlN4RFFVRkRMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMWxCUTNoRExFOUJRVThzVlVGQlZTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSenRuUWtGRE0wSXNSMEZCUnl4TFFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRE8yOUNRVU5pTEU5QlFVOHNSVUZCUlN4RFFVRkRPMmxDUVVOaUxFbEJRVWs3YjBKQlEwUXNUMEZCVHl4TFFVRkxMRU5CUVVNN2FVSkJRMmhDTzJGQlEwb3NRMEZCUXp0VFFVTk1PenRSUVVWRUxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMWxCUTJ4Q0xFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhaUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03VTBGRGNFWTdTMEZEU2pzN1NVRkZSQ3h0UWtGQmJVSXNRMEZCUXl4bFFVRmxMRVZCUVVVN1VVRkRha01zU1VGQlNTeG5Ra0ZCWjBJc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRGVFSXNTVUZCU1N4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dFJRVU5xUlN4TFFVRkxMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJUdFpRVU16UXl4SlFVRkpMRmRCUVZjc1IwRkJSeXhoUVVGaExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRE96dFpRVVZvUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhGUVVGRk8yZENRVU5rTEVsQlFVa3NVMEZCVXl4SFFVRkhMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1owSkJRek5FTEVsQlFVa3NTMEZCU3l4SFFVRkhRU3hoUVVGWExFTkJRVU1zV1VGQldTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMmRDUVVOb1JDeG5Ra0ZCWjBJc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeExRVUZMTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExHVkJRV1VzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMkZCUXk5Rk8xTkJRMG83VVVGRFJDeFBRVUZQTEdkQ1FVRm5RaXhEUVVGRE8wdEJRek5DT3p0SlFVVkVMR3RDUVVGclFpeERRVUZETEVsQlFVa3NSVUZCUlRzN1VVRkZja0lzU1VGQlNTeGxRVUZsTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4WFFVRlhMRU5CUVVNc1YwRkJWeXhIUVVGSE8xbEJReTlGTEU5QlFVOHNWMEZCVnl4SlFVRkpMRmRCUVZjc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVMEZEZGtRc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6czdVVUZGVkN4SFFVRkhMRU5CUVVNc1pVRkJaU3hEUVVGRE8xbEJRMmhDTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTNoRExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhQUVVGUExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVazdaMEpCUTJwRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RlFVRkRPMkZCUTNaQ0xFTkJRVU1zUTBGQlF6dFRRVU5PTzB0QlEwbzdPMGxCUlVRc2IwTkJRVzlETEVOQlFVTXNTVUZCU1N4RFFVRkRPMUZCUTNSRExFbEJRVWtzWjBKQlFXZENMRVZCUVVVc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWl4RlFVRkZMRWxCUVVrc1JVRkJSU3cwUWtGQk5FSXNRMEZCUXl4RFFVRkRPMUZCUTNKR0xFZEJRVWNzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeG5Ra0ZCWjBJc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNNRUpCUVRCQ0xFTkJRVU1zUlVGQlJTeEpRVUZKTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU03V1VGRGRFZ3NTVUZCU1N4RFFVRkRMR3RDUVVGclFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTJwRExFbEJRVWs3V1VGRFJDeFBRVUZQTzFOQlExWTdTMEZEU2pzN1NVRkZSQ3h2UWtGQmIwSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1VVRkJVU3hEUVVGRE96dFJRVVZvUXl4SlFVRkpMRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03TzFGQlJXcENMRkZCUVZFc1NVRkJTU3hKUVVGSkxFbEJRVWtzUzBGQlN5eFJRVUZSTEVWQlFVVXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWM3TzFsQlJYaEVMRWxCUVVrc1VVRkJVU3hGUVVGRk8yZENRVU5XTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJUdHZRa0ZEZUVJc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0cFFrRkRkRUk3WVVGRFNpeE5RVUZOTzJkQ1FVTklMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdZVUZEZEVJN1UwRkRTanRSUVVORUxFOUJRVThzVDBGQlR5eERRVUZETzB0QlEyeENPenM3U1VGSFJDeHZRa0ZCYjBJc1EwRkJReXhoUVVGaExFTkJRVU03VVVGREwwSXNSMEZCUnl4aFFVRmhMRWxCUVVrc1lVRkJZU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZGtNc1NVRkJTU3huUWtGQlowSXNSVUZCUlN4aFFVRmhMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTzJkQ1FVTTVReXhQUVVGUExFTkJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJRenRoUVVOc1F5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUzBGQlN6dG5Ra0ZEZWtJc1QwRkJUeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVNMVJTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPenRaUVVWUUxFZEJRVWNzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hEUVVGRE8yZENRVU4yUWl4TFFVRkxMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZPMjlDUVVNNVF5eEpRVUZKTEVOQlFVTXNiME5CUVc5RExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHBRa0ZEYkVVN1lVRkRTanRUUVVOS08wdEJRMG83TzBsQlJVUXNNa0pCUVRKQ0xFTkJRVU1zV1VGQldTeERRVUZETzFGQlEzSkRMRWxCUVVrc1YwRkJWeXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU51UWl4SFFVRkhMRmxCUVZrc1EwRkJReXhOUVVGTkxFTkJRVU03V1VGRGJrSXNTMEZCU3l4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVU3WjBKQlF6RkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRla0lzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03YjBKQlEzSkNMRWxCUVVrc2MwSkJRWE5DTEVWQlFVVXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFTkJRVU03YjBKQlEzWkZMRWxCUVVrc2MwSkJRWE5DTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSVHQzUWtGRGJrTXNTMEZCU3l4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEhOQ1FVRnpRaXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlRzMFFrRkRjRVFzVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4elFrRkJjMElzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2xDUVVNdlF6dHhRa0ZEU2p0cFFrRkRTanRoUVVOS08xTkJRMG83VVVGRFJDeFBRVUZQTEZkQlFWY3NRMEZCUXp0TFFVTjBRanREUVVOS096czdPeUo5XG4iLCJcbmNsYXNzIFRlc3RNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXI9e31cbiAgICB9XG5cbiAgICBnZXRDbGlja0V2ZW50cyhjb21wb25lbnRSZWZlcmVuY2VOYW1lKXtcbiAgICAgICAgaWYgKHR5cGVvZiAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXJbY29tcG9uZW50UmVmZXJlbmNlTmFtZV09PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXT0wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXTtcbiAgICB9XG5cbiAgICBhZGRDbGlja0V2ZW50KGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICBpZiAodHlwZW9mICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlci5jb21wb25lbnRSZWZlcmVuY2VOYW1lID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdPTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXJbY29tcG9uZW50UmVmZXJlbmNlTmFtZV0rKztcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFRlc3RNYW5hZ2VyKCk7IiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gXCIuLi8uLi9idWlsZC9TbWFydENvbXBvbmVudEpTXCI7XG5pbXBvcnQgVGVzdE1hbmFnZXIgZnJvbSBcIi4uL1Rlc3RNYW5hZ2VyXCI7XG5cbmNsYXNzIFRlc3RDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LHBhcmVudENvbXBvbmVudCxwYXJhbXMpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKTtcbiAgICB9XG5cbiAgICBjbGlja0hhbmRsZXIoKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lKTtcbiAgICAgICAgVGVzdE1hbmFnZXIuYWRkQ2xpY2tFdmVudCh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXN0Q29tcG9uZW50OyIsImltcG9ydCB7QXBwUmVnaXN0cnl9ICBmcm9tIFwiLi4vYnVpbGQvU21hcnRDb21wb25lbnRKU1wiO1xuaW1wb3J0IFRlc3RNYW5hZ2VyIGZyb20gXCIuL1Rlc3RNYW5hZ2VyXCI7XG5pbXBvcnQgVGVzdENvbXBvbmVudCBmcm9tIFwiLi90ZXN0Q29tcG9uZW50cy9UZXN0Q29tcG9uZW50XCI7XG5BcHBSZWdpc3RyeS5yZWdpc3RlckNvbXBvbmVudHMoe1Rlc3RDb21wb25lbnR9KTtcblxubGV0IHRlc3RDb21wb25lbnQ9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50Mj1udWxsO1xubGV0IHRlc3RDb21wb25lbnQzPW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDQ9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50NT1udWxsO1xubGV0IHRlc3RDb21wb25lbnQ2PW51bGw7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MSAtIEluc3RhbmNlIGJ5IG5hbWUnLCBmdW5jdGlvbigpIHtcbiAgICB0ZXN0Q29tcG9uZW50ID0gQXBwUmVnaXN0cnkuaW5pdENvbXBvbmVudEJ5TmFtZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDFcIl1gKSxcIlRlc3RDb21wb25lbnRcIik7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQxIC0gc2hvdWxkIGJlIGluc3RhbmNlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lLCBcIlRlc3RDb21wb25lbnRcIik7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQxIC0gbG9hZCBjaGlsZCBjb21wb25lbnRzIHBhc3NpbmcgbGlrZSBwYXJlbnQgVGVzdENvbXBvbmVudDEnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDIgLSBUZXN0Q29tcG9uZW50MSBzaG91bGQgYmUgcHJlc2VudCBsaWtlIFRlc3RDb21wb25lbnQyIHBhcmVudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgbG9hZGVkQ29tcG9uZW50cyA9IHRlc3RDb21wb25lbnQubG9hZENoaWxkQ29tcG9uZW50cyh0ZXN0Q29tcG9uZW50KTtcbiAgICAgICAgdGVzdENvbXBvbmVudDI9bG9hZGVkQ29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCk9PntcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZT09XCJUZXN0Q29tcG9uZW50MlwiO1xuICAgICAgICB9KVswXTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQxXCIpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MiBjb21wb25lbnQtY2xpY2sgLSBjbGljayBvbiBUZXN0Q29tcG9uZW50MiBjaGlsZCBvbiBjb21wb25lbnQtY2xpY2sgYXR0cmlidXRlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQyIC0gY2xpY2tFdmVudHNOdW1iZXIgbXVzdCBiZSBpbmNyZWFzZSBvZiBvbmUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlPVRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDJcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXSBbY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIl1gKS5jbGljaygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoVGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJUZXN0Q29tcG9uZW50MlwiKSwgKGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlICsgMSkpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQzLzQgYWRkZWQgZGluYW1pY2FsbHkgLSBhZGQgZGluYW1pY2FsbHkgVGVzdENvbXBvbmVudDMgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50MicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50My80IC0gc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50MicsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDJEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQyXCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNvbXBvbmVudD1cIlRlc3RDb21wb25lbnRcIiAgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+VGVzdENvbXBvbmVudDMgQ2xpY2sgSGFuZGxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgXG4gICAgICAgICAgICA8ZGl2IGNvbXBvbmVudD1cIlRlc3RDb21wb25lbnRcIiAgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDRcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+VGVzdENvbXBvbmVudDQgQ2xpY2sgSGFuZGxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICAgIHRlc3RDb21wb25lbnQyRG9tRWwuYXBwZW5kQ2hpbGQobm9kZS5jaGlsZE5vZGVzWzFdKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDIubG9hZENoaWxkQ29tcG9uZW50cygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICB0ZXN0Q29tcG9uZW50Mz10ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDNcIl07XG4gICAgICAgIHRlc3RDb21wb25lbnQ0PXRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50NFwiXTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50M1wiXS5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQzXCIpO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ0XCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDRcIik7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDMgY29tcG9uZW50LWNsaWNrIC0gY2xpY2sgb24gVGVzdENvbXBvbmVudDMgY2hpbGQgb24gY29tcG9uZW50LWNsaWNrIGF0dHJpYnV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50MyAtIGNsaWNrRXZlbnRzTnVtYmVyIG11c3QgYmUgaW5jcmVhc2Ugb2Ygb25lJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBjbGlja0V2ZW50c051bWJlckJlZm9yZT1UZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlRlc3RDb21wb25lbnQzXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDNcIl0gW2NvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCJdYCkuY2xpY2soKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDNcIiksIChjbGlja0V2ZW50c051bWJlckJlZm9yZSArIDEpKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDUgaW5zdGFuY2VkIGJ5IGphdmFzY3JpcHQgLSBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCBUZXN0Q29tcG9uZW50NSB1bmRlciBUZXN0Q29tcG9uZW50MicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50NSAtIHNob3VsZCBiZSBwcmVzZW50IGxpa2UgY2hpbGQgb2YgVGVzdENvbXBvbmVudDInLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQyRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXY+PC9kaXY+YDtcbiAgICAgICAgbGV0IG5vZGVUb0FwcGVuZD1ub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIHRlc3RDb21wb25lbnQyRG9tRWwuYXBwZW5kQ2hpbGQobm9kZVRvQXBwZW5kKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDUgPSBuZXcgVGVzdENvbXBvbmVudChub2RlVG9BcHBlbmQsdGVzdENvbXBvbmVudDIse2NvbXBvbmVudFJlZmVyZW5jZU5hbWU6XCJUZXN0Q29tcG9uZW50NVwifSk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDVcIl0uY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50NVwiKTtcbiAgICB9KTtcbn0pO1xuXG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50NiBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCAtIGluc3RhbmNlZCBieSBqYXZhc2NyaXB0IFRlc3RDb21wb25lbnQ2IHVuZGVyIFRlc3RDb21wb25lbnQ1JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQ2IC0gc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50NScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDVEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ1XCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiPlRlc3RDb21wb25lbnQ2IENsaWNrIEhhbmRsZXI8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIGxldCBub2RlVG9BcHBlbmQ9bm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NURvbUVsLmFwcGVuZENoaWxkKG5vZGVUb0FwcGVuZCk7XG4gICAgICAgIHRlc3RDb21wb25lbnQ2ID0gbmV3IFRlc3RDb21wb25lbnQobm9kZVRvQXBwZW5kLHRlc3RDb21wb25lbnQ1LHtjb21wb25lbnRSZWZlcmVuY2VOYW1lOlwiVGVzdENvbXBvbmVudDZcIn0pO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDUuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ2XCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDZcIik7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnRGV0ZWN0IGNvbmZsaWN0IGluIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZSAtIGkgdXNlZCB0d28gdGltZXMgVGVzdENvbXBvbmVudDYgdW5kZXIgVGVzdENvbXBvbmVudDUgY29tcG9uZW50JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ05vdCB1bmlxdWUgY29tcG9uZW50IHJlZmVyZW5jZSBuYW1lIGV4Y2VwdGlvbiBpcyB0aHJvd2VkICcsICBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQ1RG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50NVwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXYgY29tcG9uZW50PVwiVGVzdENvbXBvbmVudFwiIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ2XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICBsZXQgbm9kZVRvQXBwZW5kPW5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgdGVzdENvbXBvbmVudDVEb21FbC5hcHBlbmRDaGlsZChub2RlVG9BcHBlbmQpO1xuICAgICAgICBsZXQgY3JuRXhjZXB0aW9uPW51bGxcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdGVzdENvbXBvbmVudDUubG9hZENoaWxkQ29tcG9uZW50cygpO1xuICAgICAgICB9Y2F0Y2ggKGUpe1xuICAgICAgICAgICAgY3JuRXhjZXB0aW9uPWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5lcXVhbChjcm5FeGNlcHRpb24hPW51bGwsIHRydWUpO1xuICAgIH0pO1xufSk7XG5cblxuXG4vL0Rlc3Ryb3kgY29uIGRldGFjaCBsaXN0ZW5lclxuLy9Jbml0XG4vL0JlZm9yQ29tcG9uZXRDbGlja1xuLy9MYW5jaWFyZSBlY2NlemlvbmUgc2UgdmVuZ29ubyB0cm92YXRlIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUgcmVnaXN0cmF0ZSBvIHNlIGlsIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUgY29pbmNpZGUgY29uIHF1ZWxsYSBkZWwgcGFkcmVcblxuXG5cblxuIl0sIm5hbWVzIjpbIlRlc3RNYW5hZ2VyIiwiQXBwUmVnaXN0cnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE1BQU0sV0FBVyxDQUFDO0lBQ2QsV0FBVyxHQUFHO1FBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7S0FDeEI7OztJQUdELGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsR0FBRztZQUN6RCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQ3BGO1NBQ0osQ0FBQyxDQUFDO0tBQ047OztJQUdELGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDakIsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztLQUNOOztJQUVELG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDdEMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2xCLEdBQUc7WUFDQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMvQixNQUFNLENBQUMsQ0FBQztZQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEdBQUcsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0RjtR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
