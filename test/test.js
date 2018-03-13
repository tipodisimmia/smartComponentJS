import {SmartComponentManager}  from "../build/SmartComponentJS";
import TestManager from "./TestManager";
import TestComponent from "./testComponents/TestComponent";
import StopClickPropagationComponent from "./testComponents/StopClickPropagationComponent";

SmartComponentManager.registerComponents({TestComponent,StopClickPropagationComponent});
SmartComponentManager.configure({garbageCollector:true});

let testComponent=null;
let testComponent2=null;
let testComponent3=null;
let testComponent4=null;
let testComponent5=null;
let testComponent6=null;
let stopClickPropagationComponent=null;

describe('TestComponent1 - Instance by name', function() {
    testComponent = SmartComponentManager.initComponentByName(document.querySelector(`[component-reference-name="TestComponent1"]`),"TestComponent");
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
        let clickEventsNumberBefore=TestManager.getClickEvents("TestComponent2");
        document.querySelector(`[component-reference-name="TestComponent2"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager.getClickEvents("TestComponent2"), (clickEventsNumberBefore + 1));
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
        let clickEventsNumberBefore=TestManager.getClickEvents("TestComponent3");
        document.querySelector(`[component-reference-name="TestComponent3"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager.getClickEvents("TestComponent3"), (clickEventsNumberBefore + 1));
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
        let crnException=null
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

        let clickEventsNumberBefore=TestManager.getClickEvents("StopClickPropagationComponent");

        let testComponent1DomEl= document.querySelector(`[component-reference-name="TestComponent1"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div component="StopClickPropagationComponent" component-reference-name="StopClickPropagationComponent">
                                <a href="javascript:void(0)" component-click="clickHandler('this')">
                                    StopClickPropagationComponent
                                    <button component-click="clickHandler('this')">StopClickPropagationComponent 2</button>
                                </a>
                        </div>`;
        testComponent1DomEl.appendChild(node);
        let loadedComponents = testComponent.loadChildComponents();
        stopClickPropagationComponent=loadedComponents[1];
        document.querySelector(`[component-reference-name="StopClickPropagationComponent"] button`).click();
        await setTimeout(()=>{},1000);
        console.log(TestManager.getClickEvents("StopClickPropagationComponent"));
        assert.equal(TestManager.getClickEvents("StopClickPropagationComponent"), (clickEventsNumberBefore+1));
    })
})

describe('Remove TestComponent2 from dom - remove the dom element that contains the component', function() {
    it('Component and theirs chilldren must be deallocated', async function() {

        let testComponent2DomEl= document.querySelector(`[component-reference-name="TestComponent2"]`);

        testComponent2DomEl.remove();
        await setTimeout(()=>{},1000);

        let allComponentsRemoved= [testComponent2,testComponent3,testComponent4,testComponent5,testComponent6].reduce((accumulator,current)=>{
            return accumulator &&  (Object.keys(current).length === 0  || !current);
        },true);

        assert.equal(allComponentsRemoved, true);
    })
})

describe('Remove TestComponent programmatically - remove the dom element and theirs children', function() {
    it('Component and theirs chilldren must be deallocated', async function() {
        testComponent.smart_destroy();
        await setTimeout(()=>{},2000);
        let allComponentsRemoved= [testComponent,stopClickPropagationComponent].reduce((accumulator,current)=>{
            return accumulator &&  (Object.keys(current).length === 0  || !current);
        },true);

        assert.equal(allComponentsRemoved, true);
    })
})



//replace eval method in order to retrieve function parameters

//Init
//BeforComponetClick
//Lanciare eccezione se vengono trovate componentReferenceName registrate o se il componentReferenceName coincide con quella del padre




