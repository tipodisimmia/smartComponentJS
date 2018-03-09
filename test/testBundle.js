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
        if (typeof  this.clickEventsCounter[componentReferenceName] === "undefined"){
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

class StopClickPropagationComponent extends Component{

    constructor(element,parentComponent,params) {
        super(element,parentComponent,params);
    }
    clickHandler(ev){
        ev.stopPropagation();
        TestManager$1.addClickEvent(this.componentReferenceName);
    }
}

AppRegistry$1.registerComponents({TestComponent,StopClickPropagationComponent});

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


describe('Detect conflict in component-reference-name - using two times TestComponent6 under TestComponent5 component', function() {
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


describe('Detect conflict in component-reference-name - using two times TestComponent6 under TestComponent5 component', function() {
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


describe('Handle event - stopping propagation across innested component-click function', function() {
    it('Stop event propagation Only the first function component-click in the hierarchy is invoked', async function() {

        let clickEventsNumberBefore=TestManager$1.getClickEvents("StopClickPropagationComponent");

        let testComponent1DomEl= document.querySelector(`[component-reference-name="TestComponent1"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div component="StopClickPropagationComponent" component-reference-name="StopClickPropagationComponent">
                                <a href="javascript:void(0)" component-click="clickHandler('this')">
                                    StopClickPropagationComponent
                                    <button component-click="clickHandler()">StopClickPropagationComponent 2</button>
                                </a>
                        </div>`;
        testComponent1DomEl.appendChild(node);
        testComponent.loadChildComponents();
        document.querySelector(`[component-reference-name="StopClickPropagationComponent"] button`).click();
        await setTimeout(()=>{},1000);
        console.log(TestManager$1.getClickEvents("StopClickPropagationComponent"));
        assert.equal(TestManager$1.getClickEvents("StopClickPropagationComponent"), (clickEventsNumberBefore+1));
    });
});


//Event handling
//Destroy con detach listener
//replace eval method in order to retrieve function parameters

//Init
//BeforComponetClick
//Lanciare eccezione se vengono trovate componentReferenceName registrate o se il componentReferenceName coincide con quella del padre

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vYnVpbGQvU21hcnRDb21wb25lbnRKUy5qcyIsIlRlc3RNYW5hZ2VyLmpzIiwidGVzdENvbXBvbmVudHMvVGVzdENvbXBvbmVudC5qcyIsInRlc3RDb21wb25lbnRzL1N0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50LmpzIiwidGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcHBSZWdpc3RyeSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgIH1cblxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudHNDbGFzc2VzKXtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9uZW50c0NsYXNzZXMpLmZvckVhY2goKGNvbXBvbmVudENsYXNzTmFtZSk9PntcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldENvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudENsYXNzTmFtZSxjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICByZWdpc3RlckNvbXBvbmVudChuYW1lLGNsYXp6KSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBjbGF6ejogY2xhenpcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdENvbXBvbmVudEJ5TmFtZShlbGVtZW50LGNvbXBvbmVudE5hbWUpe1xuICAgICAgICBsZXQgaW5zdGFuY2U9bnVsbDtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdmFyIGNsYXp6ID0gdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50TmFtZSk7XG4gICAgICAgICAgICBpbnN0YW5jZT1uZXcgY2xhenooZWxlbWVudCk7IC8vU3RhcnQgVXAgQ29tcG9uZW50XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3aGVuIHRyeWluZyB0byBpbnN0YW5jZSBDb21wb25lbnQgXCIgKyBjb21wb25lbnROYW1lICtcIjogXCIrIGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRDb21wb25lbnQobmFtZSkge1xuICAgICAgICB2YXIgY29tcCA9IHRoaXMuY29tcG9uZW50cy5maWx0ZXIoYyA9PiBjLm5hbWUgPT0gbmFtZSkubWFwKGMgPT4gYy5jbGF6eilbMF07XG4gICAgICAgIHJldHVybiBjb21wO1xuICAgIH1cbn1cblxudmFyIEFwcFJlZ2lzdHJ5JDEgPSBuZXcgQXBwUmVnaXN0cnkoKTtcblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcykge1xuICAgICAgICB0aGlzLmluaXQoZWxlbWVudCwgcGFyZW50Q29tcG9uZW50LCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCwgcGFyZW50Q29tcG9uZW50LCBwYXJhbXMpe1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzID0ge1wiY2xpY2tcIjpbXX07XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudElkID0gIHRoaXMuZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpO1xuICAgICAgICBjb21wb25lbnRSZWZlcmVuY2VOYW1lPWNvbXBvbmVudFJlZmVyZW5jZU5hbWUgfHwgdGhpcy5fY29tcG9uZW50SWQ7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gY29tcG9uZW50UmVmZXJlbmNlTmFtZTtcbiAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIiwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIsdGhpcy5fY29tcG9uZW50SWQpO1xuXG4gICAgICAgIGlmKCF0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIix0aGlzLmNvbnN0cnVjdG9yLm5hbWUpO1xuICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQgJiYgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50cz17fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCF0aGlzLnZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5KCkpe1xuICAgICAgICAgICAgdGhyb3cgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICtcIiBjb21wb25lbnRSZWZlcmVuY2VOYW1lIGlzIGFscmVhZHkgdXNlZCBpbiBcIit0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRSZWZlcmVuY2VOYW1lICtcIiBoeWVyYXJjaHlcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50KXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHNbY29tcG9uZW50UmVmZXJlbmNlTmFtZV0gPSB0aGlzO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZih0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWNsaWNrXCIpKXtcbiAgICAgICAgICAgIHRoaXMuYmluZENvbXBvbmVudENsaWNrKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbm9kZXNUb0JpbmQgPXRoaXMuZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgaWYobm9kZXNUb0JpbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZXNUb0JpbmRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgbXV0YXRpb25PYnNlcnZlciBpcyB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCBoYW5kbGluZyBjb21wb25lbnQtXCJldmVudFwiXG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5ldmVudE11dGF0aW9uSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZWxlbWVudCx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcbiAgICB9XG5cbiAgICB2ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpe1xuICAgICAgICByZXR1cm4gICF0aGlzLnBhcmVudENvbXBvbmVudCB8fCAoIHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzW3RoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZV0pO1xuICAgIH1cblxuICAgIGdlbmVyYXRlVWlkKCkge1xuICAgICAgICByZXR1cm4gIHRoaXMuY29uc3RydWN0b3IubmFtZStcIl9cIisneHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCxcbiAgICAgICAgICAgICAgICB2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGlja0hhbmRsZXIoZXYpIHtcbiAgICAgICAgbGV0IGZ1bmN0aW9uQ29kZSA9IGV2LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtY2xpY2snKTtcbiAgICAgICAgbGV0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uQ29kZS5zcGxpdChcIihcIilbMF07XG5cbiAgICAgICAgZnVuY3Rpb24gZXh0cmFjdFBhcmFtcyguLi5wYXJhbXMpIHtcblxuICAgICAgICAgICAgbGV0IHBhcmFtZXRlcnM9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnMubWFwKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBpZihwYXJhbT09XCJ0aGlzXCIpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXY7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpc1tmdW5jdGlvbk5hbWVdKXtcbiAgICAgICAgICAgIHRoaXNbZnVuY3Rpb25OYW1lXS5hcHBseSh0aGlzLCBldmFsKFwiZXh0cmFjdFBhcmFtcyhcIitmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzFdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudF0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c0Vsc1tpXS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IEFwcFJlZ2lzdHJ5JDEuZ2V0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0xvYWRlZC5wdXNoKCBuZXcgQ2xhenooY29tcG9uZW50c0Vsc1tpXSxwYXJlbnRDb21wb25lbnQgfHwgdGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzTG9hZGVkO1xuICAgIH1cblxuICAgIGJpbmRDb21wb25lbnRDbGljayhub2RlKSB7XG5cbiAgICAgICAgbGV0IGlzQWxyZWFkeUJpbmRlZD10aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50Tm9kZSk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciB8fCBjdXJyZW50Tm9kZS5pc0VxdWFsTm9kZShub2RlKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgaWYoIWlzQWxyZWFkeUJpbmRlZCl7XG4gICAgICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucHVzaChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja0hhbmRsZXIoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayhub2RlKXtcbiAgICAgICAgbGV0IHBhcmVudHNDb21wb25lbnQ9IHRoaXMuZ2V0RG9tRWxlbWVudFBhcmVudHMoIG5vZGUsICdbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXScpO1xuICAgICAgICBpZihwYXJlbnRzQ29tcG9uZW50Lmxlbmd0aD4wICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpPT10aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sobm9kZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RG9tRWxlbWVudFBhcmVudHMoZWxlbSwgc2VsZWN0b3Ipe1xuICAgICAgICAvLyBTZXR1cCBwYXJlbnRzIGFycmF5XG4gICAgICAgIHZhciBwYXJlbnRzID0gW107XG4gICAgICAgIC8vIEdldCBtYXRjaGluZyBwYXJlbnQgZWxlbWVudHNcbiAgICAgICAgZm9yICggOyBlbGVtICYmIGVsZW0gIT09IGRvY3VtZW50OyBlbGVtID0gZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gQWRkIG1hdGNoaW5nIHBhcmVudHMgdG8gYXJyYXlcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyZW50cztcbiAgICB9XG5cblxuICAgIGV2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3Qpe1xuICAgICAgICBpZihtdXRhdGlvbnNMaXN0ICYmIG11dGF0aW9uc0xpc3QubGVuZ3RoPjApe1xuICAgICAgICAgICAgbGV0IG11dGF0aW9uRWxlbWVudHM9IG11dGF0aW9uc0xpc3QuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0uYWRkZWROb2Rlcy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXYuY29uY2F0KHRoaXMuZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKGN1cnJlbnQuYWRkZWROb2RlcykpO1xuICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICBpZihtdXRhdGlvbkVsZW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdXRhdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG11dGF0aW9uRWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldENvbXBvbmVudENsaWNrTm9kZVRvQmluZChtb2Rlc1RvQ2hlY2spe1xuICAgICAgICBsZXQgbm9kZXNUb0JpbmQ9W107XG4gICAgICAgIGlmKG1vZGVzVG9DaGVjay5sZW5ndGgpe1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2Rlc1RvQ2hlY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZT1tb2Rlc1RvQ2hlY2tbaV07XG4gICAgICAgICAgICAgICAgaWYobm9kZS5xdWVyeVNlbGVjdG9yQWxsKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudENsaWNrRWxlbWVudHMgPW5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudC1jbGlja10nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudENsaWNrRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0JpbmQucHVzaChjb21wb25lbnRDbGlja0VsZW1lbnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXNUb0JpbmQ7XG4gICAgfVxufVxuXG5leHBvcnQgeyBBcHBSZWdpc3RyeSQxIGFzIEFwcFJlZ2lzdHJ5LCBDb21wb25lbnQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVTIxaGNuUkRiMjF3YjI1bGJuUktVeTVxY3lJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwwRndjRkpsWjJsemRISjVMbXB6SWl3aUxpNHZjM0pqTDBOdmJYQnZibVZ1ZEM1cWN5SmRMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpjYm1Oc1lYTnpJRUZ3Y0ZKbFoybHpkSEo1SUh0Y2JpQWdJQ0JqYjI1emRISjFZM1J2Y2lncElIdGNiaUFnSUNBZ0lDQWdkR2hwY3k1amIyMXdiMjVsYm5SeklEMGdXMTA3WEc0Z0lDQWdmVnh1WEc1Y2JpQWdJQ0J5WldkcGMzUmxja052YlhCdmJtVnVkSE1vWTI5dGNHOXVaVzUwYzBOc1lYTnpaWE1wZTF4dUlDQWdJQ0FnSUNCUFltcGxZM1F1YTJWNWN5aGpiMjF3YjI1bGJuUnpRMnhoYzNObGN5a3VabTl5UldGamFDZ29ZMjl0Y0c5dVpXNTBRMnhoYzNOT1lXMWxLVDArZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lvSVhSb2FYTXVaMlYwUTI5dGNHOXVaVzUwS0dOdmJYQnZibVZ1ZEVOc1lYTnpUbUZ0WlNrcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11Y21WbmFYTjBaWEpEYjIxd2IyNWxiblFvWTI5dGNHOXVaVzUwUTJ4aGMzTk9ZVzFsTEdOdmJYQnZibVZ1ZEhORGJHRnpjMlZ6VzJOdmJYQnZibVZ1ZEVOc1lYTnpUbUZ0WlYwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOUtWeHVJQ0FnSUgxY2JseHVYRzRnSUNBZ2NtVm5hWE4wWlhKRGIyMXdiMjVsYm5Rb2JtRnRaU3hqYkdGNmVpa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxtTnZiWEJ2Ym1WdWRITXVjSFZ6YUNoN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J1WVcxbE9pQnVZVzFsTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdZMnhoZW5vNklHTnNZWHA2WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdsdWFYUkRiMjF3YjI1bGJuUkNlVTVoYldVb1pXeGxiV1Z1ZEN4amIyMXdiMjVsYm5ST1lXMWxLWHRjYmlBZ0lDQWdJQ0FnYkdWMElHbHVjM1JoYm1ObFBXNTFiR3c3WEc0Z0lDQWdJQ0FnSUhSeWVYdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmpiR0Y2ZWlBOUlIUm9hWE11WjJWMFEyOXRjRzl1Wlc1MEtHTnZiWEJ2Ym1WdWRFNWhiV1VwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhVzV6ZEdGdVkyVTlibVYzSUdOc1lYcDZLR1ZzWlcxbGJuUXBPeUF2TDFOMFlYSjBJRlZ3SUVOdmJYQnZibVZ1ZEZ4dUlDQWdJQ0FnSUNCOVkyRjBZMmdvWlNsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtGd2lSWEp5YjNJZ2QyaGxiaUIwY25scGJtY2dkRzhnYVc1emRHRnVZMlVnUTI5dGNHOXVaVzUwSUZ3aUlDc2dZMjl0Y0c5dVpXNTBUbUZ0WlNBclhDSTZJRndpS3lCbEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdhVzV6ZEdGdVkyVTdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1oyVjBRMjl0Y0c5dVpXNTBLRzVoYldVcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdOdmJYQWdQU0IwYUdsekxtTnZiWEJ2Ym1WdWRITXVabWxzZEdWeUtHTWdQVDRnWXk1dVlXMWxJRDA5SUc1aGJXVXBMbTFoY0NoaklEMCtJR011WTJ4aGVub3BXekJkTzF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWTI5dGNEdGNiaUFnSUNCOVhHNTlYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJRzVsZHlCQmNIQlNaV2RwYzNSeWVTZ3BPMXh1SWl3aWFXMXdiM0owSUVGd2NGSmxaMmx6ZEhKNUlHWnliMjBnSnk0dlFYQndVbVZuYVhOMGNua25PMXh1WEc1amJHRnpjeUJEYjIxd2IyNWxiblFnZTF4dUlDQWdJR052Ym5OMGNuVmpkRzl5S0dWc1pXMWxiblFzSUhCaGNtVnVkRU52YlhCdmJtVnVkQ3dnY0dGeVlXMXpLU0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVhVzVwZENobGJHVnRaVzUwTENCd1lYSmxiblJEYjIxd2IyNWxiblFzSUhCaGNtRnRjeWs3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdhVzVwZENobGJHVnRaVzUwTENCd1lYSmxiblJEYjIxd2IyNWxiblFzSUhCaGNtRnRjeWw3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVaV3hsYldWdWRDQTlJR1ZzWlcxbGJuUTdYRzRnSUNBZ0lDQWdJSFJvYVhNdVltbHVaR1ZrUld4bGJXVnVkSE1nUFNCN1hDSmpiR2xqYTF3aU9sdGRmVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZZMjl0Y0c5dVpXNTBTV1FnUFNBZ2RHaHBjeTVuWlc1bGNtRjBaVlZwWkNncE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TG5CaGNtVnVkRU52YlhCdmJtVnVkQ0E5SUhCaGNtVnVkRU52YlhCdmJtVnVkRHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWpiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsSUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnZEdocGN5NXdZWEpoYlhNZ1BTQndZWEpoYlhNZ2ZId2dlMzA3WEc1Y2JseHVYRzRnSUNBZ0lDQWdJQzh2VTJWeWRtVWdjR1Z5SUhKbFkzVndaWEpoY21VZ2FXd2dZMjl0Y0c5dVpXNTBaU0FnZEhKaGJXbDBaU0IxYmlCdWIyMWxJR1JwSUdaaGJuUmhjMmxoSUdOdmJuUmxiblYwYnlCdVpXeHNKMkYwZEhKcFluVjBieUJqYjIxd2IyNWxiblF0Y21WbVpYSmxibU5sTFc1aGJXVmNiaUFnSUNBZ0lDQWdiR1YwSUdOdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVWdQU0IwYUdsekxuQmhjbUZ0Y3k1amIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxJRDhnZEdocGN5NXdZWEpoYlhNdVkyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaU0E2SUhSb2FYTXVaV3hsYldWdWRDNW5aWFJCZEhSeWFXSjFkR1VvWENKamIyMXdiMjVsYm5RdGNtVm1aWEpsYm1ObExXNWhiV1ZjSWlrN1hHNGdJQ0FnSUNBZ0lHTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1U5WTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTQjhmQ0IwYUdsekxsOWpiMjF3YjI1bGJuUkpaRHRjYmx4dUlDQWdJQ0FnSUNCMGFHbHpMbU52YlhCdmJtVnVkRkpsWm1WeVpXNWpaVTVoYldVZ1BTQmpiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsTzF4dUlDQWdJQ0FnSUNCcFppQW9JV1ZzWlcxbGJuUXVaMlYwUVhSMGNtbGlkWFJsS0Z3aVkyOXRjRzl1Wlc1MExYSmxabVZ5Wlc1alpTMXVZVzFsWENJcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCbGJHVnRaVzUwTG5ObGRFRjBkSEpwWW5WMFpTaGNJbU52YlhCdmJtVnVkQzF5WldabGNtVnVZMlV0Ym1GdFpWd2lMQ0JqYjIxd2IyNWxiblJTWldabGNtVnVZMlZPWVcxbEtUdGNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUhSb2FYTXVaV3hsYldWdWRDNXpaWFJCZEhSeWFXSjFkR1VvWENKamIyMXdiMjVsYm5RdGFXUmNJaXgwYUdsekxsOWpiMjF3YjI1bGJuUkpaQ2s3WEc1Y2JpQWdJQ0FnSUNBZ2FXWW9JWFJvYVhNdVpXeGxiV1Z1ZEM1blpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblJjSWlrcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWxiR1Z0Wlc1MExuTmxkRUYwZEhKcFluVjBaU2hjSW1OdmJYQnZibVZ1ZEZ3aUxIUm9hWE11WTI5dWMzUnlkV04wYjNJdWJtRnRaU2s3WEc0Z0lDQWdJQ0FnSUgxY2JseHVYRzVjYmx4dUlDQWdJQ0FnSUNCcFppaDBhR2x6TG5CaGNtVnVkRU52YlhCdmJtVnVkQ0FtSmlBaGRHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjeWw3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5CaGNtVnVkRU52YlhCdmJtVnVkQzVqYjIxd2IyNWxiblJ6UFh0OU8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnYVdZb0lYUm9hWE11ZG1WeWFXWjVRMjl0Y0c5dVpXNTBVbVZtWlhKbGJtTmxUbUZ0WlZWdWFXTnBkSGtvS1NsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QjBhR2x6TG1OdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVWdLMXdpSUdOdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVWdhWE1nWVd4eVpXRmtlU0IxYzJWa0lHbHVJRndpSzNSb2FYTXVjR0Z5Wlc1MFEyOXRjRzl1Wlc1MExtTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1VnSzF3aUlHaDVaWEpoY21Ob2VWd2lPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2FXWW9kR2hwY3k1d1lYSmxiblJEYjIxd2IyNWxiblFwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1d1lYSmxiblJEYjIxd2IyNWxiblF1WTI5dGNHOXVaVzUwYzF0amIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxYU0E5SUhSb2FYTTdYRzRnSUNBZ0lDQWdJSDFjYmx4dVhHNGdJQ0FnSUNBZ0lHbG1LSFJvYVhNdVpXeGxiV1Z1ZEM1blpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblF0WTJ4cFkydGNJaWtwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1aWFXNWtRMjl0Y0c5dVpXNTBRMnhwWTJzb2RHaHBjeTVsYkdWdFpXNTBLVHRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lHeGxkQ0J1YjJSbGMxUnZRbWx1WkNBOWRHaHBjeTVuWlhSRGIyMXdiMjVsYm5SRGJHbGphMDV2WkdWVWIwSnBibVFvVzNSb2FYTXVaV3hsYldWdWRGMHBPMXh1SUNBZ0lDQWdJQ0JwWmlodWIyUmxjMVJ2UW1sdVpDNXNaVzVuZEdncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JtOWtaWE5VYjBKcGJtUXViR1Z1WjNSb095QnBLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU5vWldOclEyOXRjRzl1Wlc1MGMwaHBaWEpoY21Ob2VVRnVaRUpwYm1SRGJHbGpheWh1YjJSbGMxUnZRbWx1WkZ0cFhTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0F2TDFSb1pTQnRkWFJoZEdsdmJrOWljMlZ5ZG1WeUlHbHpJSFZ6WldRZ2FXNGdiM0prWlhJZ2RHOGdjbVYwY21sbGRtVWdZVzVrSUdoaGJtUnNhVzVuSUdOdmJYQnZibVZ1ZEMxY0ltVjJaVzUwWENKY2JpQWdJQ0FnSUNBZ2RHaHBjeTV0ZFhSaGRHbHZiazlpYzJWeWRtVnlQU0J1WlhjZ1RYVjBZWFJwYjI1UFluTmxjblpsY2loMGFHbHpMbVYyWlc1MFRYVjBZWFJwYjI1SVlXNWtiR1Z5TG1KcGJtUW9kR2hwY3lrcE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TG0xMWRHRjBhVzl1VDJKelpYSjJaWEl1YjJKelpYSjJaU2hsYkdWdFpXNTBMSHRoZEhSeWFXSjFkR1Z6T2lCbVlXeHpaU3dnWTJocGJHUk1hWE4wT2lCMGNuVmxMQ0JqYUdGeVlXTjBaWEpFWVhSaE9pQm1ZV3h6WlN3Z2MzVmlkSEpsWlRvZ2RISjFaWDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJSFpsY21sbWVVTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1ZWYm1samFYUjVLQ2w3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUFnSVhSb2FYTXVjR0Z5Wlc1MFEyOXRjRzl1Wlc1MElIeDhJQ2dnZEdocGN5NXdZWEpsYm5SRGIyMXdiMjVsYm5RZ0ppWWdJWFJvYVhNdWNHRnlaVzUwUTI5dGNHOXVaVzUwTG1OdmJYQnZibVZ1ZEhOYmRHaHBjeTVqYjIxd2IyNWxiblJTWldabGNtVnVZMlZPWVcxbFhTazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1oyVnVaWEpoZEdWVmFXUW9LU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUFnZEdocGN5NWpiMjV6ZEhKMVkzUnZjaTV1WVcxbEsxd2lYMXdpS3lkNGVIaDRlSGg0ZUNjdWNtVndiR0ZqWlNndlczaDVYUzluTENCbWRXNWpkR2x2YmlBb1l5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSElnUFNCTllYUm9MbkpoYm1SdmJTZ3BJQ29nTVRZZ2ZDQXdMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFlnUFNCaklEMDlJQ2Q0SnlBL0lISWdPaUFvY2lBbUlEQjRNeUI4SURCNE9DazdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZGk1MGIxTjBjbWx1WnlneE5pazdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR05zYVdOclNHRnVaR3hsY2lobGRpa2dlMXh1SUNBZ0lDQWdJQ0JzWlhRZ1puVnVZM1JwYjI1RGIyUmxJRDBnWlhZdVkzVnljbVZ1ZEZSaGNtZGxkQzVuWlhSQmRIUnlhV0oxZEdVb0oyTnZiWEJ2Ym1WdWRDMWpiR2xqYXljcE8xeHVJQ0FnSUNBZ0lDQnNaWFFnWm5WdVkzUnBiMjVPWVcxbElEMGdablZ1WTNScGIyNURiMlJsTG5Od2JHbDBLRndpS0Z3aUtWc3dYVHRjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCbGVIUnlZV04wVUdGeVlXMXpLQzR1TG5CaGNtRnRjeWtnZTF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlhRZ2NHRnlZVzFsZEdWeWN6MWJYUzV6YkdsalpTNWpZV3hzS0dGeVozVnRaVzUwY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdjR0Z5WVcxbGRHVnljeTV0WVhBb0tIQmhjbUZ0S1QwK2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1LSEJoY21GdFBUMWNJblJvYVhOY0lpbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJsZGp0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVpXeHpaWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhCaGNtRnRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCcFppaDBhR2x6VzJaMWJtTjBhVzl1VG1GdFpWMHBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjMXRtZFc1amRHbHZiazVoYldWZExtRndjR3g1S0hSb2FYTXNJR1YyWVd3b1hDSmxlSFJ5WVdOMFVHRnlZVzF6S0Z3aUsyWjFibU4wYVc5dVEyOWtaUzV6Y0d4cGRDaGNJaWhjSWlsYk1WMHBLVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdiRzloWkVOb2FXeGtRMjl0Y0c5dVpXNTBjeWh3WVhKbGJuUkRiMjF3YjI1bGJuUXBJSHRjYmlBZ0lDQWdJQ0FnYkdWMElHTnZiWEJ2Ym1WdWRITk1iMkZrWldROVcxMDdYRzRnSUNBZ0lDQWdJSFpoY2lCamIyMXdiMjVsYm5SelJXeHpJRDBnZEdocGN5NWxiR1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0pCYkd3b0oxdGpiMjF3YjI1bGJuUmRKeWs3WEc0Z0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z1kyOXRjRzl1Wlc1MGMwVnNjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTnZiWEJ2Ym1WdWRFbGtJRDBnWTI5dGNHOXVaVzUwYzBWc2MxdHBYUzVuWlhSQmRIUnlhV0oxZEdVb0oyTnZiWEJ2Ym1WdWRDMXBaQ2NwTzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0lXTnZiWEJ2Ym1WdWRFbGtLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTnZiWEJ2Ym1WdWRDQTlJR052YlhCdmJtVnVkSE5GYkhOYmFWMHVaMlYwUVhSMGNtbGlkWFJsS0NkamIyMXdiMjVsYm5RbktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnUTJ4aGVub2dQU0JCY0hCU1pXZHBjM1J5ZVM1blpYUkRiMjF3YjI1bGJuUW9ZMjl0Y0c5dVpXNTBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYjIxd2IyNWxiblJ6VEc5aFpHVmtMbkIxYzJnb0lHNWxkeUJEYkdGNmVpaGpiMjF3YjI1bGJuUnpSV3h6VzJsZExIQmhjbVZ1ZEVOdmJYQnZibVZ1ZENCOGZDQjBhR2x6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOdmJYQnZibVZ1ZEhOTWIyRmtaV1E3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZbWx1WkVOdmJYQnZibVZ1ZEVOc2FXTnJLRzV2WkdVcElIdGNibHh1SUNBZ0lDQWdJQ0JzWlhRZ2FYTkJiSEpsWVdSNVFtbHVaR1ZrUFhSb2FYTXVZbWx1WkdWa1JXeGxiV1Z1ZEhOYlhDSmpiR2xqYTF3aVhTNXlaV1IxWTJVb0tHRmpZM1Z0ZFd4aGRHOXlMR04xY25KbGJuUk9iMlJsS1QwK2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR0ZqWTNWdGRXeGhkRzl5SUh4OElHTjFjbkpsYm5ST2IyUmxMbWx6UlhGMVlXeE9iMlJsS0c1dlpHVXBPMXh1SUNBZ0lDQWdJQ0I5TEdaaGJITmxLVHRjYmx4dUlDQWdJQ0FnSUNCcFppZ2hhWE5CYkhKbFlXUjVRbWx1WkdWa0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVZbWx1WkdWa1JXeGxiV1Z1ZEhOYlhDSmpiR2xqYTF3aVhTNXdkWE5vS0c1dlpHVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JtOWtaUzVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2RqYkdsamF5Y3NJQ2hsS1QwK0lIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1Oc2FXTnJTR0Z1Wkd4bGNpaGxLVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzVjYmlBZ0lDQmphR1ZqYTBOdmJYQnZibVZ1ZEhOSWFXVnlZWEpqYUhsQmJtUkNhVzVrUTJ4cFkyc29ibTlrWlNsN1hHNGdJQ0FnSUNBZ0lHeGxkQ0J3WVhKbGJuUnpRMjl0Y0c5dVpXNTBQU0IwYUdsekxtZGxkRVJ2YlVWc1pXMWxiblJRWVhKbGJuUnpLQ0J1YjJSbExDQW5XMk52YlhCdmJtVnVkQzF5WldabGNtVnVZMlV0Ym1GdFpWMG5LVHRjYmlBZ0lDQWdJQ0FnYVdZb2NHRnlaVzUwYzBOdmJYQnZibVZ1ZEM1c1pXNW5kR2crTUNBbUppQndZWEpsYm5SelEyOXRjRzl1Wlc1MFd6QmRMbWRsZEVGMGRISnBZblYwWlNoY0ltTnZiWEJ2Ym1WdWRDMXlaV1psY21WdVkyVXRibUZ0WlZ3aUtUMDlkR2hwY3k1amIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WW1sdVpFTnZiWEJ2Ym1WdWRFTnNhV05yS0c1dlpHVXBPMXh1SUNBZ0lDQWdJQ0I5Wld4elpYdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJR2RsZEVSdmJVVnNaVzFsYm5SUVlYSmxiblJ6S0dWc1pXMHNJSE5sYkdWamRHOXlLWHRjYmlBZ0lDQWdJQ0FnTHk4Z1UyVjBkWEFnY0dGeVpXNTBjeUJoY25KaGVWeHVJQ0FnSUNBZ0lDQjJZWElnY0dGeVpXNTBjeUE5SUZ0ZE8xeHVJQ0FnSUNBZ0lDQXZMeUJIWlhRZ2JXRjBZMmhwYm1jZ2NHRnlaVzUwSUdWc1pXMWxiblJ6WEc0Z0lDQWdJQ0FnSUdadmNpQW9JRHNnWld4bGJTQW1KaUJsYkdWdElDRTlQU0JrYjJOMWJXVnVkRHNnWld4bGJTQTlJR1ZzWlcwdWNHRnlaVzUwVG05a1pTQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRUZrWkNCdFlYUmphR2x1WnlCd1lYSmxiblJ6SUhSdklHRnljbUY1WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYzJWc1pXTjBiM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aV3hsYlM1dFlYUmphR1Z6S0hObGJHVmpkRzl5S1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J3WVhKbGJuUnpMbkIxYzJnb1pXeGxiU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndZWEpsYm5SekxuQjFjMmdvWld4bGJTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIQmhjbVZ1ZEhNN1hHNGdJQ0FnZlZ4dVhHNWNiaUFnSUNCbGRtVnVkRTExZEdGMGFXOXVTR0Z1Wkd4bGNpaHRkWFJoZEdsdmJuTk1hWE4wS1h0Y2JpQWdJQ0FnSUNBZ2FXWW9iWFYwWVhScGIyNXpUR2x6ZENBbUppQnRkWFJoZEdsdmJuTk1hWE4wTG14bGJtZDBhRDR3S1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsZENCdGRYUmhkR2x2YmtWc1pXMWxiblJ6UFNCdGRYUmhkR2x2Ym5OTWFYTjBMbVpwYkhSbGNpZ29iU2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCdExtRmtaR1ZrVG05a1pYTXViR1Z1WjNSb0lENGdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBMbkpsWkhWalpTZ29jSEpsZGl3Z1kzVnljbVZ1ZENrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQndjbVYyTG1OdmJtTmhkQ2gwYUdsekxtZGxkRU52YlhCdmJtVnVkRU5zYVdOclRtOWtaVlJ2UW1sdVpDaGpkWEp5Wlc1MExtRmtaR1ZrVG05a1pYTXBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNJRnRkS1R0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZb2JYVjBZWFJwYjI1RmJHVnRaVzUwY3k1c1pXNW5kR2dwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JYVjBZWFJwYjI1RmJHVnRaVzUwY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU5vWldOclEyOXRjRzl1Wlc1MGMwaHBaWEpoY21Ob2VVRnVaRUpwYm1SRGJHbGpheWh0ZFhSaGRHbHZia1ZzWlcxbGJuUnpXMmxkS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JuWlhSRGIyMXdiMjVsYm5SRGJHbGphMDV2WkdWVWIwSnBibVFvYlc5a1pYTlViME5vWldOcktYdGNiaUFnSUNBZ0lDQWdiR1YwSUc1dlpHVnpWRzlDYVc1a1BWdGRPMXh1SUNBZ0lDQWdJQ0JwWmlodGIyUmxjMVJ2UTJobFkyc3ViR1Z1WjNSb0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JXOWtaWE5VYjBOb1pXTnJMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JHVjBJRzV2WkdVOWJXOWtaWE5VYjBOb1pXTnJXMmxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUtHNXZaR1V1Y1hWbGNubFRaV3hsWTNSdmNrRnNiQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JqYjIxd2IyNWxiblJEYkdsamEwVnNaVzFsYm5SeklEMXViMlJsTG5GMVpYSjVVMlZzWldOMGIzSkJiR3dvSjF0amIyMXdiMjVsYm5RdFkyeHBZMnRkSnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoamIyMXdiMjVsYm5SRGJHbGphMFZzWlcxbGJuUnpMbXhsYm1kMGFDQStJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9iR1YwSUdrZ1BTQXdPeUJwSUR3Z1kyOXRjRzl1Wlc1MFEyeHBZMnRGYkdWdFpXNTBjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzV2WkdWelZHOUNhVzVrTG5CMWMyZ29ZMjl0Y0c5dVpXNTBRMnhwWTJ0RmJHVnRaVzUwYzF0cFhTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUc1dlpHVnpWRzlDYVc1a08xeHVJQ0FnSUgxY2JuMWNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdJRU52YlhCdmJtVnVkRHNpWFN3aWJtRnRaWE1pT2xzaVFYQndVbVZuYVhOMGNua2lYU3dpYldGd2NHbHVaM01pT2lKQlFVTkJMRTFCUVUwc1YwRkJWeXhEUVVGRE8wbEJRMlFzVjBGQlZ5eEhRVUZITzFGQlExWXNTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU03UzBGRGVFSTdPenRKUVVkRUxHdENRVUZyUWl4RFFVRkRMR2xDUVVGcFFpeERRVUZETzFGQlEycERMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eHJRa0ZCYTBJc1IwRkJSenRaUVVONlJDeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMmRDUVVOMFF5eEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zYTBKQlFXdENMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF5eERRVUZETzJGQlEzQkdPMU5CUTBvc1JVRkJRenRMUVVOTU96czdTVUZIUkN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZPMUZCUXpGQ0xFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMWxCUTJwQ0xFbEJRVWtzUlVGQlJTeEpRVUZKTzFsQlExWXNTMEZCU3l4RlFVRkZMRXRCUVVzN1UwRkRaaXhEUVVGRExFTkJRVU03UzBGRFRqczdTVUZGUkN4dFFrRkJiVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNZVUZCWVN4RFFVRkRPMUZCUTNSRExFbEJRVWtzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTnNRaXhIUVVGSE8xbEJRME1zU1VGQlNTeExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dFpRVU0zUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdVMEZETDBJc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRFRDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMREJEUVVFd1F5eEhRVUZITEdGQlFXRXNSVUZCUlN4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRGRFWTdVVUZEUkN4UFFVRlBMRkZCUVZFc1EwRkJRenRMUVVOdVFqczdTVUZGUkN4WlFVRlpMRU5CUVVNc1NVRkJTU3hGUVVGRk8xRkJRMllzU1VGQlNTeEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkpMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETlVVc1QwRkJUeXhKUVVGSkxFTkJRVU03UzBGRFpqdERRVU5LT3p0QlFVVkVMRzlDUVVGbExFbEJRVWtzVjBGQlZ5eEZRVUZGTEVOQlFVTTdPMEZEZEVOcVF5eE5RVUZOTEZOQlFWTXNRMEZCUXp0SlFVTmFMRmRCUVZjc1EwRkJReXhQUVVGUExFVkJRVVVzWlVGQlpTeEZRVUZGTEUxQlFVMHNSVUZCUlR0UlFVTXhReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlN4bFFVRmxMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03UzBGREwwTTdPMGxCUlVRc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJTeGxRVUZsTEVWQlFVVXNUVUZCVFN4RFFVRkRPMUZCUTJ4RExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NUMEZCVHl4RFFVRkRPMUZCUTNaQ0xFbEJRVWtzUTBGQlF5eGpRVUZqTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGJrTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1NVRkJTU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTTdVVUZEZUVNc1NVRkJTU3hEUVVGRExHVkJRV1VzUjBGQlJ5eGxRVUZsTEVOQlFVTTdVVUZEZGtNc1NVRkJTU3hEUVVGRExITkNRVUZ6UWl4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVOdVF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1NVRkJTU3hGUVVGRkxFTkJRVU03T3pzN08xRkJTek5DTEVsQlFVa3NjMEpCUVhOQ0xFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4elFrRkJjMElzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMSE5DUVVGelFpeEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExEQkNRVUV3UWl4RFFVRkRMRU5CUVVNN1VVRkROMG9zYzBKQlFYTkNMRU5CUVVNc2MwSkJRWE5DTEVsQlFVa3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJRenM3VVVGRmJrVXNTVUZCU1N4RFFVRkRMSE5DUVVGelFpeEhRVUZITEhOQ1FVRnpRaXhEUVVGRE8xRkJRM0pFTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExEQkNRVUV3UWl4RFFVRkRMRVZCUVVVN1dVRkRia1FzVDBGQlR5eERRVUZETEZsQlFWa3NRMEZCUXl3d1FrRkJNRUlzUlVGQlJTeHpRa0ZCYzBJc1EwRkJReXhEUVVGRE8xTkJRelZGT3p0UlFVVkVMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zV1VGQldTeERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03TzFGQlJUVkVMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZsQlFWa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRaUVVOMlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRmxCUVZrc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRUUVVOb1JUczdPenM3VVVGTFJDeEhRVUZITEVsQlFVa3NRMEZCUXl4bFFVRmxMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEZWQlFWVXNRMEZCUXp0WlFVTjRSQ3hKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEZWQlFWVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1UwRkRkRU03TzFGQlJVUXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXh0UTBGQmJVTXNSVUZCUlN4RFFVRkRPMWxCUXpORExFMUJRVTBzU1VGQlNTeERRVUZETEhOQ1FVRnpRaXhGUVVGRkxEWkRRVUUyUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhsUVVGbExFTkJRVU1zYzBKQlFYTkNMRVZCUVVVc1dVRkJXU3hEUVVGRE8xTkJRemxKT3p0UlFVVkVMRWRCUVVjc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF6dFpRVU53UWl4SlFVRkpMRU5CUVVNc1pVRkJaU3hEUVVGRExGVkJRVlVzUTBGQlF5eHpRa0ZCYzBJc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF6dFRRVU5zUlRzN08xRkJSMFFzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRmxCUVZrc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRPMWxCUXpWRExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdVMEZEZWtNN08xRkJSVVFzU1VGQlNTeFhRVUZYTEVWQlFVVXNTVUZCU1N4RFFVRkRMREpDUVVFeVFpeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGJFVXNSMEZCUnl4WFFVRlhMRU5CUVVNc1RVRkJUU3hGUVVGRk8xbEJRMjVDTEV0QlFVc3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8yZENRVU42UXl4SlFVRkpMRU5CUVVNc2IwTkJRVzlETEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WVVGRE4wUTdVMEZEU2pzN08xRkJSMFFzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFbEJRVWtzWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyeEdMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVlVGQlZTeEZRVUZGTEV0QlFVc3NSVUZCUlN4VFFVRlRMRVZCUVVVc1NVRkJTU3hGUVVGRkxHRkJRV0VzUlVGQlJTeExRVUZMTEVWQlFVVXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGNFZzdPMGxCUlVRc2JVTkJRVzFETEVWQlFVVTdVVUZEYWtNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eGxRVUZsTEUxQlFVMHNTVUZCU1N4RFFVRkRMR1ZCUVdVc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkROMGc3TzBsQlJVUXNWMEZCVnl4SFFVRkhPMUZCUTFZc1VVRkJVU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRVZCUVVVN1dVRkRka1VzU1VGQlNTeERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFVkJRVVVzUjBGQlJ5eERRVUZETzJkQ1FVTXhRaXhEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTjJReXhQUVVGUExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1UwRkRla0lzUTBGQlF5eERRVUZETzB0QlEwNDdPMGxCUlVRc1dVRkJXU3hEUVVGRExFVkJRVVVzUlVGQlJUdFJRVU5pTEVsQlFVa3NXVUZCV1N4SFFVRkhMRVZCUVVVc1EwRkJReXhoUVVGaExFTkJRVU1zV1VGQldTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU03VVVGRGNFVXNTVUZCU1N4WlFVRlpMRWRCUVVjc1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenM3VVVGRk9VTXNVMEZCVXl4aFFVRmhMRU5CUVVNc1IwRkJSeXhOUVVGTkxFVkJRVVU3TzFsQlJUbENMRWxCUVVrc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xbEJRM2hETEU5QlFVOHNWVUZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ6dG5Ra0ZETTBJc1IwRkJSeXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETzI5Q1FVTmlMRTlCUVU4c1JVRkJSU3hEUVVGRE8ybENRVU5pTEVsQlFVazdiMEpCUTBRc1QwRkJUeXhMUVVGTExFTkJRVU03YVVKQlEyaENPMkZCUTBvc1EwRkJRenRUUVVOTU96dFJRVVZFTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRE8xbEJRMnhDTEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdVMEZEY0VZN1MwRkRTanM3U1VGRlJDeHRRa0ZCYlVJc1EwRkJReXhsUVVGbExFVkJRVVU3VVVGRGFrTXNTVUZCU1N4blFrRkJaMElzUTBGQlF5eEZRVUZGTEVOQlFVTTdVVUZEZUVJc1NVRkJTU3hoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4blFrRkJaMElzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0UlFVTnFSU3hMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlR0WlFVTXpReXhKUVVGSkxGZEJRVmNzUjBGQlJ5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1dVRkJXU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVUZET3p0WlFVVm9SU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eEZRVUZGTzJkQ1FVTmtMRWxCUVVrc1UwRkJVeXhIUVVGSExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03WjBKQlF6TkVMRWxCUVVrc1MwRkJTeXhIUVVGSFFTeGhRVUZYTEVOQlFVTXNXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8yZENRVU5vUkN4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEdWQlFXVXNTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJReTlGTzFOQlEwbzdVVUZEUkN4UFFVRlBMR2RDUVVGblFpeERRVUZETzB0QlF6TkNPenRKUVVWRUxHdENRVUZyUWl4RFFVRkRMRWxCUVVrc1JVRkJSVHM3VVVGRmNrSXNTVUZCU1N4bFFVRmxMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhYUVVGWExFTkJRVU1zVjBGQlZ5eEhRVUZITzFsQlF5OUZMRTlCUVU4c1YwRkJWeXhKUVVGSkxGZEJRVmNzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1UwRkRka1FzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXpzN1VVRkZWQ3hIUVVGSExFTkJRVU1zWlVGQlpTeERRVUZETzFsQlEyaENMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRM2hETEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFBRVUZQTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrN1owSkJRMnBETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhGUVVGRE8yRkJRM1pDTEVOQlFVTXNRMEZCUXp0VFFVTk9PMHRCUTBvN08wbEJSVVFzYjBOQlFXOURMRU5CUVVNc1NVRkJTU3hEUVVGRE8xRkJRM1JETEVsQlFVa3NaMEpCUVdkQ0xFVkJRVVVzU1VGQlNTeERRVUZETEc5Q1FVRnZRaXhGUVVGRkxFbEJRVWtzUlVGQlJTdzBRa0ZCTkVJc1EwRkJReXhEUVVGRE8xRkJRM0pHTEVkQlFVY3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4blFrRkJaMElzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRU5CUVVNc01FSkJRVEJDTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc2MwSkJRWE5DTEVOQlFVTTdXVUZEZEVnc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xTkJRMnBETEVsQlFVazdXVUZEUkN4UFFVRlBPMU5CUTFZN1MwRkRTanM3U1VGRlJDeHZRa0ZCYjBJc1EwRkJReXhKUVVGSkxFVkJRVVVzVVVGQlVTeERRVUZET3p0UlFVVm9ReXhKUVVGSkxFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVTTdPMUZCUldwQ0xGRkJRVkVzU1VGQlNTeEpRVUZKTEVsQlFVa3NTMEZCU3l4UlFVRlJMRVZCUVVVc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eFZRVUZWTEVkQlFVYzdPMWxCUlhoRUxFbEJRVWtzVVVGQlVTeEZRVUZGTzJkQ1FVTldMRWxCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlR0dlFrRkRlRUlzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRGRFSTdZVUZEU2l4TlFVRk5PMmRDUVVOSUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1lVRkRkRUk3VTBGRFNqdFJRVU5FTEU5QlFVOHNUMEZCVHl4RFFVRkRPMHRCUTJ4Q096czdTVUZIUkN4dlFrRkJiMElzUTBGQlF5eGhRVUZoTEVOQlFVTTdVVUZETDBJc1IwRkJSeXhoUVVGaExFbEJRVWtzWVVGQllTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRka01zU1VGQlNTeG5Ra0ZCWjBJc1JVRkJSU3hoUVVGaExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxPMmRDUVVNNVF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5zUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEU5QlFVOHNTMEZCU3p0blFrRkRla0lzVDBGQlR5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXd5UWtGQk1rSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU0xUlN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE96dFpRVVZRTEVkQlFVY3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeERRVUZETzJkQ1FVTjJRaXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8yOUNRVU01UXl4SlFVRkpMRU5CUVVNc2IwTkJRVzlETEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0cFFrRkRiRVU3WVVGRFNqdFRRVU5LTzB0QlEwbzdPMGxCUlVRc01rSkJRVEpDTEVOQlFVTXNXVUZCV1N4RFFVRkRPMUZCUTNKRExFbEJRVWtzVjBGQlZ5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTnVRaXhIUVVGSExGbEJRVmtzUTBGQlF5eE5RVUZOTEVOQlFVTTdXVUZEYmtJc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVTdaMEpCUXpGRExFbEJRVWtzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGVrSXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdiMEpCUTNKQ0xFbEJRVWtzYzBKQlFYTkNMRVZCUVVVc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVOQlFVTTdiMEpCUTNaRkxFbEJRVWtzYzBKQlFYTkNMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJUdDNRa0ZEYmtNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMSE5DUVVGelFpeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJSVHMwUWtGRGNFUXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8zbENRVU12UXp0eFFrRkRTanRwUWtGRFNqdGhRVU5LTzFOQlEwbzdVVUZEUkN4UFFVRlBMRmRCUVZjc1EwRkJRenRMUVVOMFFqdERRVU5LT3pzN095SjlcbiIsIlxuY2xhc3MgVGVzdE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcj17fVxuICAgIH1cblxuICAgIGdldENsaWNrRXZlbnRzKGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICBpZiAodHlwZW9mICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXT09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdPTA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIGFkZENsaWNrRXZlbnQoY29tcG9uZW50UmVmZXJlbmNlTmFtZSl7XG4gICAgICAgIGlmICh0eXBlb2YgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdPTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXJbY29tcG9uZW50UmVmZXJlbmNlTmFtZV0rKztcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFRlc3RNYW5hZ2VyKCk7IiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gXCIuLi8uLi9idWlsZC9TbWFydENvbXBvbmVudEpTXCI7XG5pbXBvcnQgVGVzdE1hbmFnZXIgZnJvbSBcIi4uL1Rlc3RNYW5hZ2VyXCI7XG5cbmNsYXNzIFRlc3RDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LHBhcmVudENvbXBvbmVudCxwYXJhbXMpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKTtcbiAgICB9XG5cbiAgICBjbGlja0hhbmRsZXIoKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lKTtcbiAgICAgICAgVGVzdE1hbmFnZXIuYWRkQ2xpY2tFdmVudCh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXN0Q29tcG9uZW50OyIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tIFwiLi4vLi4vYnVpbGQvU21hcnRDb21wb25lbnRKU1wiO1xuaW1wb3J0IFRlc3RNYW5hZ2VyIGZyb20gXCIuLi9UZXN0TWFuYWdlclwiO1xuXG5jbGFzcyBTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQscGFyZW50Q29tcG9uZW50LHBhcmFtcykge1xuICAgICAgICBzdXBlcihlbGVtZW50LHBhcmVudENvbXBvbmVudCxwYXJhbXMpO1xuICAgIH1cbiAgICBjbGlja0hhbmRsZXIoZXYpe1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgVGVzdE1hbmFnZXIuYWRkQ2xpY2tFdmVudCh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQ7IiwiaW1wb3J0IHtBcHBSZWdpc3RyeX0gIGZyb20gXCIuLi9idWlsZC9TbWFydENvbXBvbmVudEpTXCI7XG5pbXBvcnQgVGVzdE1hbmFnZXIgZnJvbSBcIi4vVGVzdE1hbmFnZXJcIjtcbmltcG9ydCBUZXN0Q29tcG9uZW50IGZyb20gXCIuL3Rlc3RDb21wb25lbnRzL1Rlc3RDb21wb25lbnRcIjtcbmltcG9ydCBTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudCBmcm9tIFwiLi90ZXN0Q29tcG9uZW50cy9TdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiO1xuXG5BcHBSZWdpc3RyeS5yZWdpc3RlckNvbXBvbmVudHMoe1Rlc3RDb21wb25lbnQsU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnR9KTtcblxubGV0IHRlc3RDb21wb25lbnQ9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50Mj1udWxsO1xubGV0IHRlc3RDb21wb25lbnQzPW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDQ9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50NT1udWxsO1xubGV0IHRlc3RDb21wb25lbnQ2PW51bGw7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MSAtIEluc3RhbmNlIGJ5IG5hbWUnLCBmdW5jdGlvbigpIHtcbiAgICB0ZXN0Q29tcG9uZW50ID0gQXBwUmVnaXN0cnkuaW5pdENvbXBvbmVudEJ5TmFtZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDFcIl1gKSxcIlRlc3RDb21wb25lbnRcIik7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQxIC0gc2hvdWxkIGJlIGluc3RhbmNlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lLCBcIlRlc3RDb21wb25lbnRcIik7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQxIC0gbG9hZCBjaGlsZCBjb21wb25lbnRzIHBhc3NpbmcgbGlrZSBwYXJlbnQgVGVzdENvbXBvbmVudDEnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDIgLSBUZXN0Q29tcG9uZW50MSBzaG91bGQgYmUgcHJlc2VudCBsaWtlIFRlc3RDb21wb25lbnQyIHBhcmVudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgbG9hZGVkQ29tcG9uZW50cyA9IHRlc3RDb21wb25lbnQubG9hZENoaWxkQ29tcG9uZW50cyh0ZXN0Q29tcG9uZW50KTtcbiAgICAgICAgdGVzdENvbXBvbmVudDI9bG9hZGVkQ29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCk9PntcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZT09XCJUZXN0Q29tcG9uZW50MlwiO1xuICAgICAgICB9KVswXTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQxXCIpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MiBjb21wb25lbnQtY2xpY2sgLSBjbGljayBvbiBUZXN0Q29tcG9uZW50MiBjaGlsZCBvbiBjb21wb25lbnQtY2xpY2sgYXR0cmlidXRlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQyIC0gY2xpY2tFdmVudHNOdW1iZXIgbXVzdCBiZSBpbmNyZWFzZSBvZiBvbmUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlPVRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDJcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXSBbY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIl1gKS5jbGljaygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoVGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJUZXN0Q29tcG9uZW50MlwiKSwgKGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlICsgMSkpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQzLzQgYWRkZWQgZGluYW1pY2FsbHkgLSBhZGQgZGluYW1pY2FsbHkgVGVzdENvbXBvbmVudDMgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50MicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50My80IC0gc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50MicsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDJEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQyXCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNvbXBvbmVudD1cIlRlc3RDb21wb25lbnRcIiAgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+VGVzdENvbXBvbmVudDMgQ2xpY2sgSGFuZGxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgXG4gICAgICAgICAgICA8ZGl2IGNvbXBvbmVudD1cIlRlc3RDb21wb25lbnRcIiAgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDRcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+VGVzdENvbXBvbmVudDQgQ2xpY2sgSGFuZGxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICAgIHRlc3RDb21wb25lbnQyRG9tRWwuYXBwZW5kQ2hpbGQobm9kZS5jaGlsZE5vZGVzWzFdKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDIubG9hZENoaWxkQ29tcG9uZW50cygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICB0ZXN0Q29tcG9uZW50Mz10ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDNcIl07XG4gICAgICAgIHRlc3RDb21wb25lbnQ0PXRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50NFwiXTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50M1wiXS5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQzXCIpO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ0XCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDRcIik7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDMgY29tcG9uZW50LWNsaWNrIC0gY2xpY2sgb24gVGVzdENvbXBvbmVudDMgY2hpbGQgb24gY29tcG9uZW50LWNsaWNrIGF0dHJpYnV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50MyAtIGNsaWNrRXZlbnRzTnVtYmVyIG11c3QgYmUgaW5jcmVhc2Ugb2Ygb25lJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBjbGlja0V2ZW50c051bWJlckJlZm9yZT1UZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlRlc3RDb21wb25lbnQzXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDNcIl0gW2NvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCJdYCkuY2xpY2soKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDNcIiksIChjbGlja0V2ZW50c051bWJlckJlZm9yZSArIDEpKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDUgaW5zdGFuY2VkIGJ5IGphdmFzY3JpcHQgLSBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCBUZXN0Q29tcG9uZW50NSB1bmRlciBUZXN0Q29tcG9uZW50MicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50NSAtIHNob3VsZCBiZSBwcmVzZW50IGxpa2UgY2hpbGQgb2YgVGVzdENvbXBvbmVudDInLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQyRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXY+PC9kaXY+YDtcbiAgICAgICAgbGV0IG5vZGVUb0FwcGVuZD1ub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIHRlc3RDb21wb25lbnQyRG9tRWwuYXBwZW5kQ2hpbGQobm9kZVRvQXBwZW5kKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDUgPSBuZXcgVGVzdENvbXBvbmVudChub2RlVG9BcHBlbmQsdGVzdENvbXBvbmVudDIse2NvbXBvbmVudFJlZmVyZW5jZU5hbWU6XCJUZXN0Q29tcG9uZW50NVwifSk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDVcIl0uY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50NVwiKTtcbiAgICB9KTtcbn0pO1xuXG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50NiBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCAtIGluc3RhbmNlZCBieSBqYXZhc2NyaXB0IFRlc3RDb21wb25lbnQ2IHVuZGVyIFRlc3RDb21wb25lbnQ1JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQ2IC0gc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50NScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDVEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ1XCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiPlRlc3RDb21wb25lbnQ2IENsaWNrIEhhbmRsZXI8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIGxldCBub2RlVG9BcHBlbmQ9bm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NURvbUVsLmFwcGVuZENoaWxkKG5vZGVUb0FwcGVuZCk7XG4gICAgICAgIHRlc3RDb21wb25lbnQ2ID0gbmV3IFRlc3RDb21wb25lbnQobm9kZVRvQXBwZW5kLHRlc3RDb21wb25lbnQ1LHtjb21wb25lbnRSZWZlcmVuY2VOYW1lOlwiVGVzdENvbXBvbmVudDZcIn0pO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDUuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ2XCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDZcIik7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnRGV0ZWN0IGNvbmZsaWN0IGluIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZSAtIHVzaW5nIHR3byB0aW1lcyBUZXN0Q29tcG9uZW50NiB1bmRlciBUZXN0Q29tcG9uZW50NSBjb21wb25lbnQnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnTm90IHVuaXF1ZSBjb21wb25lbnQgcmVmZXJlbmNlIG5hbWUgZXhjZXB0aW9uIGlzIHRocm93ZWQgJywgIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDVEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ1XCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdiBjb21wb25lbnQ9XCJUZXN0Q29tcG9uZW50XCIgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIGxldCBub2RlVG9BcHBlbmQ9bm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NURvbUVsLmFwcGVuZENoaWxkKG5vZGVUb0FwcGVuZCk7XG4gICAgICAgIGxldCBjcm5FeGNlcHRpb249bnVsbFxuICAgICAgICB0cnl7XG4gICAgICAgICAgICB0ZXN0Q29tcG9uZW50NS5sb2FkQ2hpbGRDb21wb25lbnRzKCk7XG4gICAgICAgIH1jYXRjaCAoZSl7XG4gICAgICAgICAgICBjcm5FeGNlcHRpb249ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKGNybkV4Y2VwdGlvbiE9bnVsbCwgdHJ1ZSk7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnRGV0ZWN0IGNvbmZsaWN0IGluIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZSAtIHVzaW5nIHR3byB0aW1lcyBUZXN0Q29tcG9uZW50NiB1bmRlciBUZXN0Q29tcG9uZW50NSBjb21wb25lbnQnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnTm90IHVuaXF1ZSBjb21wb25lbnQgcmVmZXJlbmNlIG5hbWUgZXhjZXB0aW9uIGlzIHRocm93ZWQgJywgIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDVEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ1XCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdiBjb21wb25lbnQ9XCJUZXN0Q29tcG9uZW50XCIgY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIGxldCBub2RlVG9BcHBlbmQ9bm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NURvbUVsLmFwcGVuZENoaWxkKG5vZGVUb0FwcGVuZCk7XG4gICAgICAgIGxldCBjcm5FeGNlcHRpb249bnVsbFxuICAgICAgICB0cnl7XG4gICAgICAgICAgICB0ZXN0Q29tcG9uZW50NS5sb2FkQ2hpbGRDb21wb25lbnRzKCk7XG4gICAgICAgIH1jYXRjaCAoZSl7XG4gICAgICAgICAgICBjcm5FeGNlcHRpb249ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgICAgIGFzc2VydC5lcXVhbChjcm5FeGNlcHRpb24hPW51bGwsIHRydWUpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ0hhbmRsZSBldmVudCAtIHN0b3BwaW5nIHByb3BhZ2F0aW9uIGFjcm9zcyBpbm5lc3RlZCBjb21wb25lbnQtY2xpY2sgZnVuY3Rpb24nLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnU3RvcCBldmVudCBwcm9wYWdhdGlvbiBPbmx5IHRoZSBmaXJzdCBmdW5jdGlvbiBjb21wb25lbnQtY2xpY2sgaW4gdGhlIGhpZXJhcmNoeSBpcyBpbnZva2VkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgbGV0IGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlPVRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIik7XG5cbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQxRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MVwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXYgY29tcG9uZW50PVwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIiBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKCd0aGlzJylcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+U3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQgMjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICB0ZXN0Q29tcG9uZW50MURvbUVsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICB0ZXN0Q29tcG9uZW50LmxvYWRDaGlsZENvbXBvbmVudHMoKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XCJdIGJ1dHRvbmApLmNsaWNrKCk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDEwMDApO1xuICAgICAgICBjb25zb2xlLmxvZyhUZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XCIpKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIiksIChjbGlja0V2ZW50c051bWJlckJlZm9yZSsxKSk7XG4gICAgfSlcbn0pXG5cblxuLy9FdmVudCBoYW5kbGluZ1xuLy9EZXN0cm95IGNvbiBkZXRhY2ggbGlzdGVuZXJcbi8vcmVwbGFjZSBldmFsIG1ldGhvZCBpbiBvcmRlciB0byByZXRyaWV2ZSBmdW5jdGlvbiBwYXJhbWV0ZXJzXG5cbi8vSW5pdFxuLy9CZWZvckNvbXBvbmV0Q2xpY2tcbi8vTGFuY2lhcmUgZWNjZXppb25lIHNlIHZlbmdvbm8gdHJvdmF0ZSBjb21wb25lbnRSZWZlcmVuY2VOYW1lIHJlZ2lzdHJhdGUgbyBzZSBpbCBjb21wb25lbnRSZWZlcmVuY2VOYW1lIGNvaW5jaWRlIGNvbiBxdWVsbGEgZGVsIHBhZHJlXG5cblxuXG5cbiJdLCJuYW1lcyI6WyJUZXN0TWFuYWdlciIsIkFwcFJlZ2lzdHJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxNQUFNLFdBQVcsQ0FBQztJQUNkLFdBQVcsR0FBRztRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0tBQ3hCOzs7SUFHRCxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsa0JBQWtCLEdBQUc7WUFDekQsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUNwRjtTQUNKLENBQUMsQ0FBQztLQUNOOzs7SUFHRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ2pCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFF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
